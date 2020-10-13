import Snap from "snapsvg-cjs";
import {
  jsonToConll,
  conllToJson,
  getSentenceTextFromJson,
  TreeJson,
  MetaJson,
  TokenJson,
} from "./Conll";
import { EventDispatcher } from "./EventDispatcher";
import { ReactiveSentence } from "./ReactiveSentence";

//////    CONSTANT DECLARATION    //////
const SVG_CONFIG = {
  startTextY: 10,
  textgraphdistance: 10,
  dragclickthreshold: 400, //ms
  depLevelHeight: 45,
  arrowheadsize: 5,
  gapX: 18, // TODO set it properly elsewhere SVG_CONFIG
  sizeFontY: 18, // TODO
  spacingX: 40,
  spacingY: 20,
};
const dragclickthreshold = 400; //ms

///////////////                ////////////////
///////////////   SentenceSVG  ////////////////
///////////////                ////////////////
interface SentenceSVGOptions {
  svgID: string;
  reactiveSentence: ReactiveSentence;
  usermatches: Array<{ nodes: string; edges: any }>; // TODO : complete this definition
  shownFeatures: string[];
  teacherReactiveSentence: ReactiveSentence;
}

export interface SentenceSVG extends SentenceSVGOptions {}

export class SentenceSVG extends EventDispatcher {
  snapSentence: Snap.Paper;
  treeJson: TreeJson;
  metaJson: MetaJson;
  teacherTreeJson: TreeJson;

  matchnodes: Array<string>;
  matchedges: string[];

  tokenSVGs: { [key: number]: TokenSVG } = {};
  dragged: number = 0;
  hovered: number = 0;

  totalWidth: number = 0;
  totalHeight: number = 0;

  levelsArray: number[] = [];

  constructor(opts: SentenceSVGOptions) {
    super();
    Object.assign(this, opts);
    //// base properties
    this.snapSentence = Snap(`#${this.svgID}`);
    this.treeJson = this.reactiveSentence.treeJson;
    this.metaJson = this.reactiveSentence.metaJson;

    // put FORM at the beginning of the shownFeatures array
    this.shownFeatures = this.shownFeatures.filter((item) => item !== "FORM");
    this.shownFeatures.unshift("FORM");

    if (this.teacherReactiveSentence) {
      this.teacherTreeJson = this.teacherReactiveSentence.treeJson;
    } else {
      this.teacherTreeJson = {};
    }
    document.addEventListener;
    this.reactiveSentence.addEventListener("token-updated", (e) => {
      this.refresh();
    });
    //// to refactor (start of drawit)
    this.matchnodes = this.usermatches
      .map(({ nodes }) => Object.values(nodes))
      .flat(); // simple array of match nodes to highlight
    this.matchedges = Object.fromEntries(
      this.usermatches.map((um) =>
        um.edges.length == null ? [] : [um.edges.e.target, um.edges.e]
      )
    ); // object { target node : object }

    // populate ylevel, be careful, the computed levels are stored
    // ... inside this.getLevel() as a side effect. TODO : Make this better

    this.drawTree();
  }

  drawTree() {
    this.snapSentence.clear();
    this.populateLevels();
    this.populateTokenSVGs();
    this.drawRelations();
    this.adaptSvgCanvas();
    this.attachDraggers();
    this.attachEvents();
    this.attachHovers();
    if (this.teacherTreeJson) {
      this.showDiffs(this.teacherTreeJson);
    }
  }

  populateTokenSVGs(): void {
    let runningX = 0;
    let maxLevelY = Math.max(...this.levelsArray, 2); // 2 would be the minimum possible level size
    let offsetY = SVG_CONFIG.startTextY + maxLevelY * SVG_CONFIG.depLevelHeight;

    // for (const [tokenIndex, tokenJson] of Object.entries(this.treeJson)) {

    for (const tokenIndex in this.treeJson) {
      var tokenSVG = new TokenSVG(this.treeJson[tokenIndex], this);
      this.tokenSVGs[tokenIndex] = tokenSVG;
      tokenSVG.createSnap(
        this.snapSentence,
        this.shownFeatures,
        runningX,
        offsetY
      );
      tokenSVG.ylevel = this.levelsArray[tokenIndex];
      runningX += tokenSVG.width;
    }
  }

  updateToken(tokenJson: TokenJson): void {
    this.treeJson[tokenJson.ID] = tokenJson;
  }

  replaceArrayOfTokens(
    tokenIds: number[],
    firstToken: number,
    tokensToReplace: any // TODO : type this
  ): void {
    var id2newid: { [key: number]: number } = { 0: 0 };
    for (let idStr in this.treeJson) {
      let id = parseInt(idStr);

      if (id < tokenIds[0]) id2newid[id] = id;
      else if (tokenIds.includes(id)) {
        if (tokenIds.indexOf(id) < tokensToReplace.length) id2newid[id] = id;
        else id2newid[id] = firstToken;
      } else id2newid[id] = id + tokensToReplace.length - tokenIds.length;
    }
    var newtree: TreeJson = {};
    for (let idStr in this.treeJson) {
      let id = parseInt(idStr);
      if (
        tokenIds.includes(id) &&
        tokenIds.indexOf(id) >= tokensToReplace.length
      )
        continue;
      var node = this.treeJson[id];
      node.ID = id2newid[id];
      node.HEAD = id2newid[node.HEAD];
      const newdeps: any = {};
      for (let gidStr in node.DEPS) {
        let gid = parseInt(gidStr);
        newdeps[id2newid[gid]] = node.DEPS[gid];
      }
      node.DEPS = newdeps;
      if (tokenIds.includes(id)) {
        node.FORM = tokensToReplace[tokenIds.indexOf(id)];
      }
      newtree[id2newid[id]] = node;
    }
    // now the case where more tokens were inserted than replaced:
    var basenode = this.treeJson[id2newid[tokenIds[tokenIds.length - 1]]];
    for (var i = tokenIds.length; i < tokensToReplace.length; ++i) {
      let newnode = JSON.parse(JSON.stringify(basenode));
      newnode.ID = tokenIds[0] + i;
      newnode.FORM = tokensToReplace[i];
      newnode.HEAD = 0;
      newnode.DEPREL = "root";
      newnode.DEPS = {};
      if (newnode.MISC.Gloss) newnode.MISC.Gloss = newnode.FORM;
      newtree[tokenIds[0] + i] = newnode;
    }
    if (!Object.keys(newtree).length) return; // forbid to erase entire tree
    this.treeJson = newtree;

    // // TODO handle new meta text
    this.metaJson.text = getSentenceTextFromJson(newtree);

    this.snapSentence.clear();
    this.drawTree();
    // treedata.s.paper.clear();
    // treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return;
  }

  populateLevels(): void {
    // populate the list this.levelsArray of length Nnode+1. A fake
    // ... element is appended at the beginning of the array for easing the loop task
    // ... (mainly because conll indexes start from 1 and not 0)

    // array of all heads, TODO : improve
    const headsIdArray = [-1].concat(
      Object.values(this.treeJson).map((x) => {
        var head = parseInt(x["HEAD"]);
        if (head || head === 0) {
          return head;
        } else {
          return -1;
        }
      })
    );
    this.levelsArray = Array.apply(null, Array(headsIdArray.length)).map(
      function() {
        return -1;
      }
    );
    var level = 0;
    for (var i = 1; i < headsIdArray.length; i++) {
      level = this.getLevel(headsIdArray, i, 1, headsIdArray.length);
    }
  }

  getLevel(
    headsIdArray: number[],
    index: number,
    start: number,
    end: number
  ): number {
    if (this.levelsArray[index] != -1) {
      return this.levelsArray[index];
    }
    const headId = headsIdArray[index];
    if (headId < start || end < headId) {
      if (headId === 0) {
        this.levelsArray[index] = 0;
      }

      return 0;
    }
    const inf = Math.min(index, headId);
    const sup = Math.max(index, headId);
    if (sup - inf === 1) {
      this.levelsArray[index] = 1;
      return 1;
    }
    const levelsSubArray = [];

    for (var i = inf; i <= sup; i++) {
      if (i == index || headsIdArray[headsIdArray[i]] == i) {
        levelsSubArray.push(0);
      } else if (inf <= headsIdArray[i] && headsIdArray[i] <= sup) {
        // sup is outside the scope for avoiding infinite recursion loop
        levelsSubArray.push(this.getLevel(headsIdArray, i, inf, sup));
      }
    }

    const level: number = Math.max(...levelsSubArray) + 1;
    this.levelsArray[index] = level;
    return level;
  }

  drawRelations(): void {
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      const headId = tokenSVG.tokenJson.HEAD;
      var headCoordX = 0;
      if (headId > 0) {
        const headtokenSVG = this.tokenSVGs[headId];
        headCoordX = headtokenSVG.centerX;
        // if governor is root, draw root relation
      } else if (headId === 0) {
        headCoordX = 0;
      } else {
        console.log(
          "this nodeTree has no governor, not drawing it",
          tokenSVG.tokenJson.ID
        );
        continue;
      }
      tokenSVG.drawRelation(
        this.snapSentence,
        headCoordX,
        SVG_CONFIG.depLevelHeight
      );
    }
  }

  adaptSvgCanvas(): void {
    // get the maximum x and y of the svg for resizing the window
    this.totalWidth = Math.max(
      ...Object.values(this.tokenSVGs).map((x) => x.startX + x.width)
    );

    this.totalHeight = 0;
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      tokenSVG.attachEvent();
      const tokenSVGHeight = Math.max(
        ...this.shownFeatures.map(
          (feature) => tokenSVG.snapElements[feature].getBBox().y2
        )
      );
      this.totalHeight = Math.max(this.totalHeight, tokenSVGHeight);
    }
    this.snapSentence.attr({ width: this.totalWidth + 50 });
    this.snapSentence.attr({ height: this.totalHeight || 1000 }); // 1000 was there in case the SVG pop up after the div, so it give a heigth
  }

  attachEvents() {
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      tokenSVG.attachEvent();
    }
  }

  attachDraggers() {
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      tokenSVG.attachDragger();
    }
  }

  attachHovers() {
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      tokenSVG.attachHover();
    }
  }

  showDiffs(otherTreeJson: TreeJson) {
    if (
      !(
        Object.keys(otherTreeJson).length === 0 &&
        otherTreeJson.constructor === Object
      )
    ) {
      for (const tokenIndex in this.tokenSVGs) {
        // for (const [tokenIndex, tokenSVG] of Object.entries(this.tokenSVGs)) {
        if (
          otherTreeJson[tokenIndex].FORM !==
          this.tokenSVGs[tokenIndex].tokenJson.FORM
        ) {
          console.log(`Error, token id ${tokenIndex} doesn't match`);
        } else {
          this.tokenSVGs[tokenIndex].showDiff(otherTreeJson[tokenIndex]);
        }
      }
    }
  }

  getDiffStats(otherTreeConll: string) {
    const teacherTreeJson = conllToJson(otherTreeConll).treeJson;
    const currentTreeJson = this.treeJson;

    const corrects: { [key: string]: number } = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0,
    };
    const totals: { [key: string]: number } = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0,
    };

    for (const tokenIndex in teacherTreeJson) {
      for (const tag in corrects) {
        corrects[tag] += +(
          teacherTreeJson[tokenIndex][tag] == currentTreeJson[tokenIndex][tag]
        );
        totals[tag]++;
      }
    }

    return { corrects, totals };
  }

  exportConll() {
    return jsonToConll({ treeJson: this.treeJson, metaJson: this.metaJson });
  }

  refresh() {
    this.drawTree();
  }
}

// add a basic event dispatch/listen system
// Object.assign(SentenceSVG.prototype, EventDispatcher.prototype);

///////////////                ////////////////
///////////////   tokenSVG  ////////////////
///////////////                ////////////////
// export interface FeatureJson {
//   [key: string]: string;
// }
// interface TokenJson {
//   ID: number;
//   FORM: string;
//   LEMMA: string;
//   UPOS: string;
//   XPOS: string;
//   FEATS: FeatureJson;
//   HEAD: number;
//   DEPREL: string;
//   DEPS: FeatureJson;
//   MISC: FeatureJson;
// }
class TokenSVG {
  // type definitions
  tokenJson: TokenJson;
  sentenceSVG: SentenceSVG;
  startY: number = 0;
  startX: number = 0;
  width: number = 0;
  ylevel: number = 0;
  shownFeatures: string[] = [];
  centerX: number = 0;
  // snap elements
  // snapArc: ??? = ???
  // snapArrowhead: ??? = ???
  // snapDeprel: ??? = ???
  // snapElements: ??[] = ???
  // draggedForm : ??? (snap)
  snapSentence: Snap.Paper = Snap("");
  snapElements: { [key: string]: Snap.Element } = {};

  draggedForm: Snap.Element = Snap("");
  draggedFormClone: Snap.Element = Snap("");

  dragclicktime: number = 0;
  draggedStartX: number = 0;
  draggedStartY: number = 0;

  draggedCurve: Snap.Element = Snap("");
  draggedArrowhead: Snap.Element = Snap("");
  dragRootCircle?: Snap.Element;

  constructor(tokenJson: TokenJson, sentenceSVG: SentenceSVG) {
    this.sentenceSVG = sentenceSVG;
    this.tokenJson = tokenJson;
    // this.id = parseInt(tokenJson["ID"]);
    // this.head = isNaN(parseInt(tokenJson["HEAD"]))
    //   ? -1
    //   : parseInt(tokenJson["HEAD"]);
    // this.form = tokenJson["FORM"];
    // this.lemma = tokenJson["LEMMA"];
    // this.upos = tokenJson["UPOS"];
    // this.xpos = tokenJson["XPOS"];
    // this.deprel = tokenJson["DEPREL"];
    // this.misc = tokenJson["MISC"];
    // this.feats = tokenJson["FEATS"];
    // this.deps = tokenJson["DEPS"];

    // populate the FEATS and MISC child features
    const listLabels: (keyof TokenJson)[] = ["FEATS", "MISC"];
    for (var label of listLabels) {
      for (const [key, value] of Object.entries(tokenJson[label])) {
        tokenJson[`${label}.${key}`] = value;
      }
    }

    this.snapElements = {};
  }

  createSnap(
    snapSentence: Snap.Paper,
    shownFeatures: string[],
    startX: number,
    startY: number
  ): void {
    this.snapSentence = snapSentence;
    this.shownFeatures = shownFeatures;
    this.startX = startX;
    this.startY = startY || 10;
    let runningY = this.startY;

    let maxFeatureWidth = 0;
    for (const feature of shownFeatures) {
      // create new snap node for the feature text
      const snapFeature = snapSentence.text(
        this.startX,
        runningY,
        this.tokenJson[feature] as string
      );
      snapFeature.addClass(feature);

      this.snapElements[feature] = snapFeature;

      // handle width properties
      const featureWidth = snapFeature.getBBox().w;
      maxFeatureWidth = Math.max(maxFeatureWidth, featureWidth); // keep biggest node width

      // increment position
      runningY += SVG_CONFIG.spacingY;
    }
    this.width = maxFeatureWidth + SVG_CONFIG.spacingX;
    this.centerX = this.startX + this.width / 2;

    this.centerFeatures();
  }

  centerFeatures(): void {
    // center the feature in the column node
    // |hello    |my    |friend    | => |  hello  |  my  |  friend  |
    for (const feature of this.shownFeatures) {
      const snapFeature = this.snapElements[feature];
      const featureWidth = snapFeature.getBBox().w;
      snapFeature.attr({ x: this.centerX - featureWidth / 2 });
    }
  }

  drawRelation(
    snapSentence: Snap.Paper,
    headCoordX: number,
    levelHeight: number
  ): void {
    // draw the relation for a treeNode and attach to it

    var heightArc = this.startY - this.ylevel * levelHeight;

    var xFrom = this.centerX;
    var xTo = 0;
    var yLow = this.startY - SVG_CONFIG.sizeFontY;
    var yTop = 0;
    var arcPath = "";
    if (headCoordX == 0) {
      arcPath = getArcPathRoot(xFrom, yLow);
    } else {
      yTop = heightArc;
      xTo =
        this.tokenJson.ID > this.tokenJson.HEAD
          ? headCoordX + SVG_CONFIG.gapX / 2
          : headCoordX - SVG_CONFIG.gapX / 2;
      arcPath = getArcPath(xFrom, xTo, yLow, yTop);
    }

    var snapArc = snapSentence.path(arcPath).addClass("curve");

    const arrowheadPath = getArrowheadPath(xFrom, yLow);
    var snapArrowhead = snapSentence.path(arrowheadPath).addClass("arrowhead");

    var deprelX = snapArc.getBBox().x + snapArc.getBBox().w / 2;
    var deprelY = snapArc.getBBox().y - 5;

    // replace the deprel when it's the root
    if (headCoordX == 0) {
      deprelX += 20;
      deprelY = 30;
    }

    var snapDeprel = snapSentence
      .text(deprelX, deprelY, this.tokenJson.DEPREL)
      .addClass("DEPREL");

    snapDeprel.attr({ x: deprelX - snapDeprel.getBBox().w / 2 });
    this.snapElements["DEPREL"] = snapDeprel;
    this.snapElements["arrowhead"] = snapArrowhead;
    this.snapElements["arc"] = snapArc;
  }

  attachEvent(): void {
    var this_ = this;
    for (const [label, snapElement] of Object.entries(this.snapElements)) {
      snapElement.click(function(e: Event) {
        // be careful, 'this' is the element because it's normal function
        // const event = new Event("svg-click")
        const event = new CustomEvent("svg-click", {
          detail: {
            treeNode: this_,
            targetLabel: label,
            clicked: this_.tokenJson.ID,
            event: e,
          },
        });
        this_.sentenceSVG.dispatchEvent(event);
      });
    }
  }

  attachDragger(): void {
    this.draggedForm = this.snapElements["FORM"];
    this.draggedForm.drag(this.dragging, this.startDrag, this.stopDrag, this); // `this` act like the context. (Similar to .bind(this))
  }

  attachHover(): void {
    this.snapElements["FORM"].mouseover(() => {
      if (
        this.sentenceSVG.dragged &&
        this.tokenJson.ID !== this.sentenceSVG.dragged
      ) {
        this.snapElements["FORM"].addClass("glossy");
        this.sentenceSVG.hovered = this.tokenJson.ID;
      }
    });
    this.snapElements["FORM"].mouseout(() => {
      if (
        this.sentenceSVG.dragged &&
        this.tokenJson.ID !== this.sentenceSVG.dragged
      ) {
        this.snapElements["FORM"].removeClass("glossy");
        this.sentenceSVG.hovered = 0;
      }
    });
  }

  showDiff(otherTokenJson: TokenJson): void {
    if (
      !Object.is(this.tokenJson.HEAD, Number.NaN) &&
      otherTokenJson.HEAD !== this.tokenJson.HEAD
    ) {
      this.snapElements["arc"].addClass("diff");
      this.snapElements["arrowhead"].addClass("diff");
    }
    if (
      this.tokenJson.DEPREL !== "_" &&
      otherTokenJson.DEPREL !== this.tokenJson.DEPREL
    ) {
      this.snapElements["DEPREL"].addClass("diff");
    }
    if (
      this.tokenJson.UPOS !== "_" &&
      otherTokenJson.UPOS !== this.tokenJson.UPOS
    ) {
      this.snapElements["UPOS"].addClass("diff");
    }
  }

  startDrag(): void {
    // `this` is a treeNode instance
    //  `this.draggedForm` is the Snap object that's being dragged
    this.dragclicktime = new Date().getTime();
    // create a copy of the FROM that will be deleted after dragging
    this.draggedFormClone = this.draggedForm.clone();
    this.draggedFormClone.attr({ cursor: "move" });
    this.draggedStartX = this.centerX;
    this.draggedStartY = this.draggedForm.getBBox().y;

    this.sentenceSVG.dragged = this.tokenJson.ID;

    var xb = this.draggedStartX;
    var yb = this.draggedStartY;

    var path =
      "M" +
      xb +
      "," +
      yb +
      " C" +
      xb +
      "," +
      (yb - 1) +
      " " +
      (xb + 1) +
      "," +
      (yb - 1) +
      " " +
      (xb + 1) +
      "," +
      yb;
    this.draggedCurve = this.snapSentence.path(path).addClass("dragcurve");
    this.draggedArrowhead = this.snapSentence
      .path(getArrowheadPath(xb, yb))
      .addClass("dragcurve");
    this.dragRootCircle = undefined;
    // TODO add droppables
  }

  dragging(dx: number, dy: number): void {
    // `this` is a treeNode instance
    // `this.draggedForm` is the Snap object that's being dragged
    this.draggedFormClone.transform(
      "translate(" + (dx - 15) + "," + (dy - 30) + ")"
    );
    this.draggedFormClone.addClass("glossy");
    var xb = this.draggedStartX;
    var yb = this.draggedStartY;

    var cy = yb + dy - Math.abs(dx) / 2;
    if (cy < 0) cy = 0;
    var path =
      "M" +
      xb +
      "," +
      yb +
      " C" +
      xb +
      "," +
      cy +
      " " +
      (xb + dx) +
      "," +
      cy +
      " " +
      (xb + dx) +
      "," +
      (yb + dy);
    this.draggedCurve.attr({ d: path });
    this.draggedArrowhead.transform("translate(" + dx + "," + dy + ")");

    // TODO : softcode the leveldistance
    const leveldistance = SVG_CONFIG.depLevelHeight;
    if (yb + dy < leveldistance / 2 && Math.abs(dx) < leveldistance / 2) {
      if (this.dragRootCircle == undefined) {
        this.dragRootCircle = this.snapSentence
          .circle(xb, 0, leveldistance / 2)
          .addClass("dragcurve");
      }
    } else {
      if (this.dragRootCircle != undefined) {
        this.dragRootCircle.remove();
        this.dragRootCircle = undefined;
      }
    }
  }

  stopDrag(e: Event): void {
    var event;
    if (
      new Date().getTime() <
      this.dragclicktime + SVG_CONFIG.dragclickthreshold
    ) {
      // TODO handle form:click
      event = new CustomEvent("svg-click", {
        detail: {
          treeNode: this,
          clicked: this.tokenJson.ID,
          targetLabel: "FORM",
        },
      });
    } else {
      event = new CustomEvent("svg-drop", {
        detail: {
          treeNode: this,
          hovered: this.sentenceSVG.hovered,
          dragged: this.sentenceSVG.dragged,
          isRoot: this.dragRootCircle ? true : false,
        },
      });
      e.preventDefault();
      e.stopPropagation();
    }
    this.sentenceSVG.dispatchEvent(event);
    this.sentenceSVG.dragged = 0;
    if (this.sentenceSVG.hovered) {
      this.sentenceSVG.tokenSVGs[this.sentenceSVG.hovered].snapElements[
        "FORM"
      ].removeClass("glossy");
      this.sentenceSVG.hovered = 0;
    }

    this.draggedFormClone.animate(
      { transform: "translate(" + 0 + "," + 0 + ")" },
      300,
      () => {
        this.draggedFormClone.remove();
        return 0;
      }
    );
    this.draggedCurve.remove();
    this.draggedArrowhead.remove();
    if (this.dragRootCircle != undefined) {
      this.dragRootCircle.remove();
      this.dragRootCircle = undefined;
    }
  }
}

///////////////             ////////////////
/////////////// SVG ELEMENT ////////////////
///////////////             ////////////////

function getArrowheadPath(xFrom: number, yLow: number): string {
  const arrowheadsize = SVG_CONFIG.arrowheadsize;
  // gives path for arrowhead x,y startpoint (end of arrow)
  // var
  var startpoint = xFrom + "," + yLow; // to move the arrowhead lower: (y+this.sizes.arrowheadsize/3);
  var lefttop =
    "0,0" +
    -arrowheadsize / 2 +
    "," +
    -arrowheadsize * 1.5 +
    " " +
    -arrowheadsize / 2 +
    "," +
    -arrowheadsize * 1.5;
  var righttop =
    arrowheadsize / 2 +
    "," +
    arrowheadsize / 2 +
    " " +
    arrowheadsize / 2 +
    "," +
    arrowheadsize / 2 +
    " " +
    arrowheadsize +
    ",0";
  var arrowPath = "M" + startpoint + "c" + lefttop + "c" + righttop + "z";
  return arrowPath;
}

function getArcPath(
  xFrom: number,
  xTo: number,
  yLow: number,
  yTop: number
): string {
  const path =
    "M" +
    xFrom +
    "," +
    yLow +
    " C" +
    xFrom +
    "," +
    yTop +
    " " +
    xTo +
    "," +
    yTop +
    " " +
    xTo +
    "," +
    yLow;
  return path;
}

function getArcPathRoot(xFrom: number, yLow: number): string {
  const path = "M" + xFrom + "," + yLow + " L" + xFrom + "," + "0 ";
  return path;
}
