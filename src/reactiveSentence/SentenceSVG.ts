import Snap from "snapsvg-cjs";

import conllup from "conllup";
const { sentenceConllToJson, sentenceJsonToConll } = conllup;
import { TreeJson, TokenJson, MetaJson } from "conllup/lib/conll";

import { EventDispatcher } from "./EventDispatcher";
import { ReactiveSentence } from "./ReactiveSentence";

//////    CONSTANT DECLARATION    //////
const SVG_CONFIG = {
  startTextY: 10,
  textgraphdistance: 10,
  dragclickthreshold: 400, //ms
  depLevelHeight: 60,
  arrowheadsize: 5,
  gapX: 18, // TODO set it properly elsewhere SVG_CONFIG
  sizeFontY: 18, // TODO
  spacingX: 40,
  spacingY: 20
};
// const dragclickthreshold = 400; //ms

///////////////                ////////////////
///////////////   SentenceSVG  ////////////////
///////////////                ////////////////
export interface SentenceSVGOptions {
  // usermatches: Array<{ nodes: string; edges: any }>; // TODO : complete this definition
  shownFeatures: string[];
  // teacherReactiveSentence: ReactiveSentence;
  interactive: boolean;
}

export const defaultSentenceSVGOptions = (): SentenceSVGOptions => ({
  shownFeatures: [],
  interactive: false
});

// export interface SentenceSVG extends SentenceSVGOptions {}

export class SentenceSVG extends EventDispatcher {
  // export class SentenceSVG {
  snapSentence: Snap.Paper;
  treeJson: TreeJson;
  metaJson: MetaJson;
  teacherTreeJson: TreeJson = {};
  shownFeatures: string[] = [];
  // matchnodes: Array<string>;
  // matchedges: string[];
  tokenSVGs: { [key: number]: TokenSVG } = {};
  dragged = 0;
  hovered = 0;
  totalWidth = 0;
  totalHeight = 0;
  levelsArray: number[] = [];
  options: SentenceSVGOptions = defaultSentenceSVGOptions();

  // constructor(opts: SentenceSVGOptions) {
  constructor(
    // svgID: string,
    svgWrapper: SVGElement,
    reactiveSentence: ReactiveSentence,
    sentenceSVGOptions: SentenceSVGOptions
  ) {
    super();
    this.snapSentence = Snap(svgWrapper);
    this.treeJson = reactiveSentence.state.treeJson;
    this.metaJson = reactiveSentence.state.metaJson;

    Object.assign(this.options, sentenceSVGOptions);

    reactiveSentence.attach(this);

    if (this.options.shownFeatures.length === 0) {
      this.options.shownFeatures = reactiveSentence.getAllFeaturesSet();
    }

    // // put FORM at the beginning of the shownFeatures array
    this.options.shownFeatures = this.options.shownFeatures.filter(
      item => item !== "FORM"
    );
    this.options.shownFeatures.unshift("FORM");
    this.drawTree();
  }

  drawTree() {
    this.snapSentence.clear();
    this.populateLevels();
    this.populateTokenSVGs();
    this.drawRelations();
    this.adaptSvgCanvas();

    if (this.options.interactive) {
      this.snapSentence.addClass("interactive");
      this.attachDraggers();
      this.attachEvents();
      this.attachHovers();
    }
    if (this.teacherTreeJson) {
      this.showDiffs(this.teacherTreeJson);
    }
  }

  public update(reactiveSentence: ReactiveSentence): void {
    this.treeJson = reactiveSentence.state.treeJson;
    this.metaJson = reactiveSentence.state.metaJson;
    this.tokenSVGs = {};
    this.refresh();
  }

  plugDiffTree(teacherReactiveSentence: ReactiveSentence): void {
    this.teacherTreeJson = teacherReactiveSentence?.state?.treeJson;
    if (this.teacherTreeJson) {
      // TODO : find a way to attach the otherReactiveSentence so it listen to teacher's changes
      // the line below is not working properly as it makes the otherReactiveSentence to update off screen
      // and this make svg drawing not working
      // teacherReactiveSentence.attach(this)
      this.showDiffs(this.teacherTreeJson);
    }
  }

  populateTokenSVGs(): void {
    let runningX = 0;
    const maxLevelY = Math.max(...this.levelsArray, 2); // 2 would be the minimum possible level size
    const offsetY =
      SVG_CONFIG.startTextY + maxLevelY * SVG_CONFIG.depLevelHeight;

    // for (const [tokenIndex, tokenJson] of Object.entries(this.treeJson)) {

    for (const tokenJsonIndex in this.treeJson) {
      const tokenJson = this.treeJson[tokenJsonIndex];
      if (tokenJson.isGroup === true) {
        continue;
      }
      const tokenSvgIndex = parseInt(tokenJson.ID, 10);

      const tokenSVG = new TokenSVG(tokenJson, this);
      this.tokenSVGs[tokenSvgIndex] = tokenSVG;
      tokenSVG.createSnap(
        this.snapSentence,
        this.options.shownFeatures,
        runningX,
        offsetY
      );
      tokenSVG.ylevel = this.levelsArray[tokenSvgIndex];
      runningX += tokenSVG.width;
    }
  }

  updateToken(tokenJson: TokenJson): void {
    this.treeJson[tokenJson.ID] = tokenJson;
  }

  populateLevels(): void {
    // populate the list this.levelsArray of length Nnode+1. A fake
    // ... element is appended at the beginning of the array for easing the loop task
    // ... (mainly because conll indexes start from 1 and not 0)

    // array of all heads, TODO : improve
    const headsIdArray = [-1].concat(
      Object.values(this.treeJson)
        .filter(tokenJson => {
          return tokenJson.isGroup === false;
        })
        .map(
          tokenJson => {
            return tokenJson.HEAD;
          }
          // const head = parseInt(x["HEAD"]);
          // const head = x["HEAD"];
          // if (head || head === 0) {
          // return head;
          // } else {
          // return -1;
          // }
        )
    );
    this.levelsArray = Array.apply(null, Array(headsIdArray.length)).map(
      function () {
        return -1;
      }
    );
    for (let i = 1; i < headsIdArray.length; i++) {
      this.getLevel(headsIdArray, i, 1, headsIdArray.length);
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

    for (let i = inf; i <= sup; i++) {
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
      let headCoordX = 0;
      if (headId > 0) {
        const headtokenSVG = this.tokenSVGs[headId];
        headCoordX = headtokenSVG.centerX;
        // if governor is root, draw root relation
      } else if (headId === 0) {
        headCoordX = 0;
      } else {
        // console.log(
        //   "this nodeTree has no governor, not drawing it",
        //   tokenSVG.tokenJson.ID
        // );
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
      ...Object.values(this.tokenSVGs).map(x => x.startX + x.width)
    );

    this.totalHeight = 0;
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      const tokenSVGHeight = Math.max(
        ...this.options.shownFeatures.map(
          feature => tokenSVG.snapElements[feature].getBBox().y2
        )
      );
      this.totalHeight = Math.max(this.totalHeight, tokenSVGHeight);
    }
    this.snapSentence.attr({ width: this.totalWidth + 15 });
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
    const teacherTreeJson = sentenceConllToJson(otherTreeConll).treeJson;
    const currentTreeJson = this.treeJson;

    const corrects: { [key: string]: number } = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0
    };
    const totals: { [key: string]: number } = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0
    };

    for (const tokenIndex in teacherTreeJson) {
      for (const tag in corrects) {
        if (
          teacherTreeJson[tokenIndex][tag] != "_" &&
          !Object.is(teacherTreeJson[tokenIndex][tag], NaN)
        ) {
          corrects[tag] += +(
            teacherTreeJson[tokenIndex][tag] == currentTreeJson[tokenIndex][tag]
          );
          totals[tag]++;
        }
      }
    }

    return { corrects, totals };
  }

  exportConll() {
    return sentenceJsonToConll({
      treeJson: this.treeJson,
      metaJson: this.metaJson
    });
  }

  refresh() {
    this.drawTree();
  }
}

///////////////                ////////////////
///////////////   tokenSVG  ////////////////
///////////////                ////////////////

class TokenSVG {
  // type definitions
  tokenJson: TokenJson;
  sentenceSVG: SentenceSVG;
  startY = 0;
  startX = 0;
  width = 0;
  ylevel = 0;
  shownFeatures: string[] = [];
  centerX = 0;
  // snap elements
  // snapArc: ??? = ???
  // snapArrowhead: ??? = ???
  // snapDeprel: ??? = ???
  // snapElements: ??[] = ???
  // draggedForm : ??? (snap)
  snapSentence!: Snap.Paper;
  snapElements: { [key: string]: Snap.Element } = {};

  draggedForm!: Snap.Element;
  draggedFormClone!: Snap.Element;

  dragclicktime = 0;
  draggedStartX = 0;
  draggedStartY = 0;

  draggedCurve!: Snap.Element;
  draggedArrowhead!: Snap.Element;
  dragRootCircle?: Snap.Element;

  constructor(tokenJson: TokenJson, sentenceSVG: SentenceSVG) {
    this.sentenceSVG = sentenceSVG;
    this.tokenJson = tokenJson;

    // populate the FEATS and MISC child features
    const listLabels: (keyof TokenJson)[] = ["FEATS", "MISC"];
    for (const label of listLabels) {
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
      let featureText: string;

      // check if there is a feature and if it's a nested feature (misc and feats)
      if (this.tokenJson[feature]) {
        if (feature.split(".").length >= 2) {
          // if len >=2, it means it's a misc or feats
          featureText = `${feature.split(".")[1]}=${this.tokenJson[feature]}`;
        } else {
          featureText = this.tokenJson[feature] as string;
        }
      } else {
        featureText = "";
      }
      const snapFeature = snapSentence.text(this.startX, runningY, featureText);
      snapFeature.addClass(feature.split(".")[0]);

      this.snapElements[feature] = snapFeature;

      // handle width properties
      const featureWidth = snapFeature.getBBox().w;
      maxFeatureWidth = Math.max(maxFeatureWidth, featureWidth); // keep biggest node width

      // increment position except if feature is a FEATS or MISC which is not present for the token
      if (
        !(
          ["MISC", "FEATS"].includes(feature.split(".")[0]) &&
          featureText === ""
        )
      ) {
        runningY += SVG_CONFIG.spacingY;
      }
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

    const heightArc = this.startY - this.ylevel * levelHeight;

    const xFrom = this.centerX;
    let xTo = 0;
    const yLow = this.startY - SVG_CONFIG.sizeFontY;
    let yTop = 0;
    let arcPath = "";
    if (headCoordX == 0) {
      arcPath = getArcPathRoot(xFrom, yLow);
    } else {
      yTop = heightArc;
      xTo =
        parseInt(this.tokenJson.ID) > this.tokenJson.HEAD
          ? headCoordX + SVG_CONFIG.gapX / 2
          : headCoordX - SVG_CONFIG.gapX / 2;
      arcPath = getArcPath(xFrom, xTo, yLow, yTop);
    }

    const snapArc = snapSentence.path(arcPath).addClass("curve");

    const arrowheadPath = getArrowheadPath(xFrom, yLow);
    const snapArrowhead = snapSentence
      .path(arrowheadPath)
      .addClass("arrowhead");

    let deprelX = snapArc.getBBox().x + snapArc.getBBox().w / 2;
    let deprelY = snapArc.getBBox().y - 5;

    // replace the deprel when it's the root
    if (headCoordX == 0) {
      deprelX += 20;
      deprelY = 30;
    }

    const snapDeprel = snapSentence
      .text(deprelX, deprelY, this.tokenJson.DEPREL)
      .addClass("DEPREL");

    snapDeprel.attr({ x: deprelX - snapDeprel.getBBox().w / 2 });
    this.snapElements["DEPREL"] = snapDeprel;
    this.snapElements["arrowhead"] = snapArrowhead;
    this.snapElements["arc"] = snapArc;
  }

  attachEvent(): void {
    for (const [label, snapElement] of Object.entries(this.snapElements)) {
      snapElement.click((e: Event) => {
        // be careful, 'this' is the element because it's normal function
        // const event = new Event("svg-click")
        const event = new CustomEvent("svg-click", {
          detail: {
            treeNode: this,
            targetLabel: label,
            clicked: parseInt(this.tokenJson.ID),
            event: e
          }
        });
        this.sentenceSVG.dispatchEvent(event);
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
        parseInt(this.tokenJson.ID) !== this.sentenceSVG.dragged
      ) {
        this.snapElements["FORM"].addClass("glossy");
        this.sentenceSVG.hovered = parseInt(this.tokenJson.ID);
      }
    });
    this.snapElements["FORM"].mouseout(() => {
      if (
        this.sentenceSVG.dragged &&
        parseInt(this.tokenJson.ID) !== this.sentenceSVG.dragged
      ) {
        this.snapElements["FORM"].removeClass("glossy");
        this.sentenceSVG.hovered = 0;
      }
    });
  }

  showDiff(otherTokenJson: TokenJson): void {
    if (
      (this.tokenJson.HEAD === 0 || this.tokenJson.HEAD >= 1) &&
      !Object.is(this.tokenJson.HEAD, Number.NaN) &&
      otherTokenJson.HEAD !== this.tokenJson.HEAD
    ) {
      this.snapElements["arc"].addClass("diff");
      this.snapElements["arrowhead"].addClass("diff");
    }
    if (
      this.tokenJson.DEPREL &&
      this.tokenJson.DEPREL !== "_" &&
      otherTokenJson.DEPREL !== this.tokenJson.DEPREL
    ) {
      this.snapElements["DEPREL"].addClass("diff");
    }
    if (
      this.tokenJson.UPOS &&
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

    this.sentenceSVG.dragged = parseInt(this.tokenJson.ID);

    const xb = this.draggedStartX;
    const yb = this.draggedStartY;

    const path =
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
    const xb = this.draggedStartX;
    const yb = this.draggedStartY;

    let cy = yb + dy - Math.abs(dx) / 2;
    if (cy < 0) cy = 0;
    const path =
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
    let event;
    if (
      new Date().getTime() <
      this.dragclicktime + SVG_CONFIG.dragclickthreshold
    ) {
      // TODO handle form:click
      event = new CustomEvent("svg-click", {
        detail: {
          treeNode: this,
          clicked: parseInt(this.tokenJson.ID),
          targetLabel: "FORM"
        }
      });
    } else {
      event = new CustomEvent("svg-drop", {
        detail: {
          treeNode: this,
          hovered: this.sentenceSVG.hovered,
          dragged: this.sentenceSVG.dragged,
          isRoot: this.dragRootCircle ? true : false
        }
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
  const startpoint = xFrom + "," + yLow; // to move the arrowhead lower: (y+this.sizes.arrowheadsize/3);
  const lefttop =
    "0,0" +
    -arrowheadsize / 2 +
    "," +
    -arrowheadsize * 1.5 +
    " " +
    -arrowheadsize / 2 +
    "," +
    -arrowheadsize * 1.5;
  const righttop =
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
  const arrowPath = "M" + startpoint + "c" + lefttop + "c" + righttop + "z";
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
