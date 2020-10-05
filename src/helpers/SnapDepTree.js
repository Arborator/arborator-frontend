import Snap from "snapsvg-cjs";
import { jsonToConll, conllToJson, getSentenceTextFromJson } from "./Conll.js";
import { EventDispatcher } from "./EventDispatcher.js";

//////    CONSTANT DECLARATION    //////

const dragclickthreshold = 400; //ms

///////////////                ////////////////
///////////////   SentenceSVG  ////////////////
///////////////                ////////////////

export class SentenceSVG {
  constructor(
    idSVG,
    sentenceJson,
    usermatches,
    shownFeatures,
    teacherTreeJson
  ) {
    //// base properties
    this.idSVG = idSVG;
    this.snapSentence = Snap(idSVG);
    console.log("KK step 2", sentenceJson.metaJson)
    this.treeJson = sentenceJson.treeJson;
    this.metaJson = sentenceJson.metaJson;
    this.usermatches = usermatches;
    this.shownFeatures = shownFeatures;
    this.shownFeatures = this.shownFeatures.filter((item) => item !== "FORM");
    this.shownFeatures.unshift("FORM");
    this.teacherTreeJson = teacherTreeJson;

    //// other properties
    // distances
    this.textgraphdistance = 10;
    this.textstarty = 10; // has to be bigger than arborator-draft.css DEPREL fontsize
    this.runningy = this.textstarty;
    this.leveldistance = parseInt(
      getComputedStyle(this.snapSentence.parent().node).getPropertyValue(
        "--depLevelHeight"
      )
    );

    // states
    this.dragged = 0; // dragged element ID
    this.hovered = 0;

    //// to refactor (start of drawit)
    this.matchnodes = usermatches
      .map(({ nodes }) => Object.values(nodes))
      .flat(); // simple array of match nodes to highlight
    this.matchedges = Object.fromEntries(
      usermatches.map((um) =>
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
    console.log("KK metaJson", this.metaJson)
  }

  populateTokenSVGs() {
    this.tokenSVGs = {};
    let runningX = 0;
    let maxLevelY = Math.max(...this.levelsArray, 2); // 2 would be the minimum possible level size
    let offsetY = this.runningy + maxLevelY * this.leveldistance;

    for (const [tokenIndex, tokenJson] of Object.entries(this.treeJson)) {
      var tokenSVG = new TokenSVG(tokenJson, this);
      this.tokenSVGs[tokenIndex] = tokenSVG;
      tokenSVG.createSnap(
        this.snapSentence,
        this.shownFeatures,
        runningX,
        offsetY
      );
      tokenSVG["ylevel"] = this.levelsArray[tokenIndex];
      runningX += tokenSVG.width;
    }
  }

  updateToken(tokenJson) {
    this.treeJson[tokenJson.ID] = tokenJson;
  }

  replaceArrayOfTokens(tokenIds, firstToken, tokensToReplace) {
    var id2newid = { 0: 0 };
    for (let id in this.treeJson) {
      id = parseInt(id);
      if (id < tokenIds[0]) id2newid[id] = id;
      else if (tokenIds.includes(id)) {
        if (tokenIds.indexOf(id) < tokensToReplace.length) id2newid[id] = id;
        else id2newid[id] = firstToken;
      } else id2newid[id] = id + tokensToReplace.length - tokenIds.length;
    }
    var newtree = {};
    for (let id in this.treeJson) {
      id = parseInt(id);
      if (tokenIds.includes(id) && tokenIds.indexOf(id) >= tokensToReplace.length)
        continue;
      var node = this.treeJson[id];
      node.ID = id2newid[id];
      node.HEAD = id2newid[node.HEAD];
      const newdeps = {};
      for (let gid in node.DEPS) newdeps[id2newid[gid]] = node.DEPS[gid];
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
    if (!Object.keys(newtree).length) return ; // forbid to erase entire tree
    this.treeJson = newtree;

    // // TODO handle new meta text
    this.metaJson.text = getSentenceTextFromJson(newtree);



    this.snapSentence.clear();
    this.drawTree();
    // treedata.s.paper.clear();
    // treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return;
  }

  populateLevels() {
    // populate the list this.levelsArray of length Nnode+1. A fake
    // ... element is appended at the beginning of the array for easing the loop task
    // ... (mainly because conll indexes start from 1 and not 0)

    // array of all heads, TODO : improve
    this.headsIdArray = [-1].concat(
      Object.values(this.treeJson).map((x) => {
        var head = parseInt(x["HEAD"]);
        if (head || head === 0) {
          return head;
        } else {
          return -1;
        }
      })
    );
    this.levelsArray = Array.apply(null, Array(this.headsIdArray.length)).map(
      function() {
        return -1;
      }
    );
    var level = 0;
    this.recursionCounter = 0;
    for (var i = 1; i < this.headsIdArray.length; i++) {
      level = this.getLevel(this.headsIdArray, i, 1, this.headsIdArray.length);
    }
  }

  getLevel(headsIdArray, index, start, end) {
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
      this.recursionCounter++;
      if (i == index || headsIdArray[headsIdArray[i]] == i) {
        levelsSubArray.push(0);
      } else if (inf <= headsIdArray[i] && headsIdArray[i] <= sup) {
        // sup is outside the scope for avoiding infinite recursion loop
        levelsSubArray.push(this.getLevel(headsIdArray, i, inf, sup));
      }
    }

    const level = Math.max(...levelsSubArray) + 1;
    this.levelsArray[index] = level;
    return level;
  }

  drawRelations() {
    for (const tokenSVG of Object.values(this.tokenSVGs)) {
      const headId = tokenSVG.head;
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
          tokenSVG.id
        );
        continue;
      }
      tokenSVG.drawRelation(this.snapSentence, headCoordX, this.leveldistance);
    }
  }

  adaptSvgCanvas() {
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

    this.snapSentence.attr("width", this.totalWidth + 50);
    this.snapSentence.attr("height", this.totalHeight);
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

  showDiffs(otherTreeJson) {
    for (const [tokenIndex, tokenSVG] of Object.entries(this.tokenSVGs)) {
      if (otherTreeJson[tokenIndex].FORM !== tokenSVG.tokenJson.FORM) {
        console.log(`Error, token id ${tokenIndex} doesn't match`);
      } else {
        tokenSVG.showDiff(otherTreeJson[tokenIndex]);
      }
    }
  }

  getDiffStats(otherTreeConll) {
    const teacherTreeJson = conllToJson(otherTreeConll).treeJson;
    const currentTreeJson = this.treeJson;

    const corrects = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0,
    };
    const totals = {
      HEAD: 0,
      DEPREL: 0,
      UPOS: 0,
    };

    for (const [tokenIndex, teacherTokenJson] of Object.entries(
      teacherTreeJson
    )) {
      for (const [tag, score] of Object.entries(corrects)) {
        corrects[tag] +=
          teacherTreeJson[tokenIndex][tag] == currentTreeJson[tokenIndex][tag];
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

  repr() {}
}

// add a basic event dispatch/listen system
Object.assign(SentenceSVG.prototype, EventDispatcher.prototype);

///////////////                ////////////////
///////////////   tokenSVG  ////////////////
///////////////                ////////////////

class TokenSVG {
  constructor(tokenJson, sentenceSVG) {
    this.sentenceSVG = sentenceSVG;
    this.tokenJson = tokenJson;
    this.id = parseInt(tokenJson["ID"]);
    this.head = isNaN(parseInt(tokenJson["HEAD"]))
      ? -1
      : parseInt(tokenJson["HEAD"]);
    this.form = tokenJson["FORM"];
    this.lemma = tokenJson["LEMMA"];
    this.upos = tokenJson["UPOS"];
    this.xpos = tokenJson["XPOS"];
    this.deprel = tokenJson["DEPREL"];
    this.misc = tokenJson["MISC"];
    this.feats = tokenJson["FEATS"];
    this.deps = tokenJson["DEPS"];

    // populate the FEATS and MISC child features
    for (const label of ["FEATS", "MISC"]) {
      for (const [key, value] of Object.entries(tokenJson[label])) {
        tokenJson[`${label}.${key}`] = value;
      }
    }

    this.snapElements = {};

    this.startX = 0;
    this.startY = 0;
    this.spacingX = 40;
    this.spacingY = 20; // TODO  get from CSS
    this.width = 0;
    this.ylevel = 0;
  }

  createSnap(snapSentence, shownFeatures, startX, startY) {
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
        this.tokenJson[feature]
      );
      snapFeature.addClass(feature);

      this.snapElements[feature] = snapFeature;

      // handle width properties
      const featureWidth = snapFeature.getBBox().w;
      maxFeatureWidth = Math.max(maxFeatureWidth, featureWidth); // keep biggest node width

      // increment position
      runningY += this.spacingY;
    }
    this.width = maxFeatureWidth + this.spacingX;
    this.centerX = this.startX + this.width / 2;

    this.centerFeatures();
  }

  centerFeatures() {
    // center the feature in the column node
    // |hello    |my    |friend    | => |  hello  |  my  |  friend  |
    for (const feature of this.shownFeatures) {
      const snapFeature = this.snapElements[feature];
      const featureWidth = snapFeature.getBBox().w;
      snapFeature.attr({ x: this.centerX - featureWidth / 2 });
    }
  }

  drawRelation(snapSentence, headCoordX, levelHeight) {
    // draw the relation for a treeNode and attach to it

    var heightArc = this.startY - this.ylevel * levelHeight;

    const GAPX = 18; // TODO set it properly elsewhere
    const SIZE_FONT_Y = 18; // TODO same
    var xFrom = this.centerX;
    var xTo = 0;
    var yLow = this.startY - SIZE_FONT_Y;
    var yTop = 0;
    var arcPath = "";
    if (headCoordX == 0) {
      arcPath = getArcPathRoot(xFrom, yLow);
    } else {
      yTop = heightArc;
      xTo = this.id > this.head ? headCoordX + GAPX / 2 : headCoordX - GAPX / 2;
      arcPath = getArcPath(xFrom, xTo, yLow, yTop);
    }

    this.snapArc = snapSentence.path(arcPath).addClass("curve");

    const arrowheadsize = 5;
    const arrowheadPath = getArrowheadPath(xFrom, yLow, arrowheadsize);
    this.snapArrowhead = snapSentence.path(arrowheadPath).addClass("arrowhead");

    var deprelX = this.snapArc.getBBox().x + this.snapArc.getBBox().w / 2;
    var deprelY = this.snapArc.getBBox().y - 5;

    // replace the deprel when it's the root
    if (headCoordX == 0) {
      deprelX += 20;
      deprelY = 30;
    }

    this.snapDeprel = snapSentence
      .text(deprelX, deprelY, this.deprel)
      .addClass("DEPREL");

    this.snapDeprel.attr({ x: deprelX - this.snapDeprel.getBBox().w / 2 });
    this.snapElements["DEPREL"] = this.snapDeprel;
    this.snapElements["arrowhead"] = this.snapArrowhead;
    this.snapElements["arc"] = this.snapArc;
  }

  attachEvent() {
    var this_ = this;
    for (const [label, snapElement] of Object.entries(this.snapElements)) {
      snapElement.click(function(e) {
        // be careful, 'this' is the element because it's normal function
        // const event = new Event("svg-click")
        const event = new CustomEvent("svg-click", {
          detail: {
            treeNode: this_,
            targetLabel: label,
            clicked: this_.id,
            event: e,
          },
        });
        this_.sentenceSVG.dispatchEvent(event);
      });
    }
  }

  attachDragger() {
    console.log("KK attach dragger", this.snapElements["FORM"])
    this.draggedForm = this.snapElements["FORM"];
    this.draggedForm.drag(dragging, startDrag, stopDrag, this); // `this` act like the context. (Similar to .bind(this))
  }

  attachHover() {
    this.snapElements["FORM"].mouseover(() => {
      if (this.sentenceSVG.dragged && this.id !== this.sentenceSVG.dragged) {
        this.snapElements["FORM"].addClass("glossy");
        this.sentenceSVG.hovered = this.id;
      }
    });
    this.snapElements["FORM"].mouseout(() => {
      if (this.sentenceSVG.dragged && this.id !== this.sentenceSVG.dragged) {
        this.snapElements["FORM"].removeClass("glossy");
        this.sentenceSVG.hovered = 0;
      }
    });
  }

  showDiff(otherTokenJson) {
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

  repr() {}
}

///////////////             ////////////////
/////////////// SVG ELEMENT ////////////////
///////////////             ////////////////

function getArrowheadPath(xFrom, yLow, arrowheadsize) {
  arrowheadsize = 5;
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

function getArcPath(xFrom, xTo, yLow, yTop) {
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

function getArcPathRoot(xFrom, yLow) {
  const path = "M" + xFrom + "," + yLow + " L" + xFrom + "," + "0 ";
  return path;
}

///////////////            ////////////////
///////////////  DRAGGERS  ////////////////
///////////////            ////////////////

function startDrag() {
  // `this` is a treeNode instance
  //  `this.draggedForm` is the Snap object that's being dragged
  this.dragclicktime = new Date().getTime();

  // create a copy of the FROM that will be deleted after dragging
  this.draggedFormClone = this.draggedForm.clone();
  this.draggedFormClone.attr({ cursor: "move" });
  this.dragStartX = this.centerX;
  this.draggedStartY = this.draggedForm.getBBox().y;

  this.sentenceSVG.dragged = this.id;

  var xb = this.dragStartX;
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
  this.dragRootCircle = null;
  // TODO add droppables
}

function dragging(dx, dy) {
  // `this` is a treeNode instance
  // `this.draggedForm` is the Snap object that's being dragged
  this.draggedFormClone.transform(
    "translate(" + (dx - 15) + "," + (dy - 30) + ")"
  );
  this.draggedFormClone.addClass("glossy");
  var xb = this.dragStartX;
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
  const leveldistance = 35;
  if (yb + dy < leveldistance / 2 && Math.abs(dx) < leveldistance / 2) {
    if (this.dragRootCircle == null) {
      this.dragRootCircle = this.snapSentence
        .circle(xb, 0, leveldistance / 2)
        .addClass("dragcurve");
    }
  } else {
    if (this.dragRootCircle != null) {
      this.dragRootCircle.remove();
      this.dragRootCircle = null;
    }
  }
}

function stopDrag(e) {
  var event;
  if (new Date().getTime() < this.dragclicktime + dragclickthreshold) {
    // TODO handle form:click
    event = new CustomEvent("svg-click", {
      detail: {
        treeNode: this,
        clicked: this.id,
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
    }
  );
  this.draggedCurve.remove();
  this.draggedArrowhead.remove();
  if (this.dragRootCircle != null) {
    this.dragRootCircle.remove();
    this.dragRootCircle = null;
  }
}
