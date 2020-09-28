import Snap from "snapsvg-cjs";
import { treeToConll} from "./Conll"
import { EventDispatcher } from "./EventDispatcher";

//////    CONSTANT DECLARATION    //////

const dragclickthreshold = 400; //ms

///////////////                ////////////////
///////////////   SvgDepTree  ////////////////
///////////////                ////////////////

export class SvgDepTree {
  constructor(idSVG, treeData, usermatches, shownFeatures) {
    //// base properties
    this.idSVG = idSVG;
    this.treeJson = treeData.tree;
    this.META = treeData.META;
    this.usermatches = usermatches;
    this.shownFeatures = shownFeatures;
    this.snapTree = Snap(idSVG);
    // this.treeData = treeData;

    //// other properties
    // distances
    this.textgraphdistance = 10;
    this.textstarty = 10; // has to be bigger than arborator-draft.css DEPREL fontsize
    this.runningy = this.textstarty;
    this.leveldistance = parseInt(
      getComputedStyle(this.snapTree.parent().node).getPropertyValue(
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
    this.populateLevels();
    this.populateTreeNodes();
    this.drawRelations();
    this.adaptSvgCanvas();
    this.attachDraggers();
    this.attachEvents();
    this.attachHovers();
  }

  populateTreeNodes() {
    console.log("KK this.treeJson", this.treeJson);
    this.treeNodes = {};
    let runningX = 0;
    let maxLevelY = Math.max(...this.levelsArray, 2); // 2 would be the minimum possible level size
    let offsetY = this.runningy + maxLevelY * this.leveldistance;

    for (const [treeNodeIndex, treeNodeJson] of Object.entries(this.treeJson)) {
      var depTreeNode = new DepTreeNode(treeNodeJson, this);
      this.treeNodes[treeNodeIndex] = depTreeNode;
      depTreeNode.createSnap(
        this.snapTree,
        this.shownFeatures,
        runningX,
        offsetY
      );
      depTreeNode["ylevel"] = this.levelsArray[treeNodeIndex];
      runningX += depTreeNode.width;
    }
  }

  updateNode(treeNodeJson) {
    this.treeJson[treeNodeJson.ID] = treeNodeJson;
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
      if (i == index) {
        levelsSubArray.push(0);
      } else if (inf <= headsIdArray[i] && headsIdArray[i] < sup) { // sup is outside the scope for avoiding infinite recursion loop
        levelsSubArray.push(this.getLevel(headsIdArray, i, inf, sup));
      }
    }

    const level = Math.max(...levelsSubArray) + 1;
    this.levelsArray[index] = level;
    return level;
  }

  drawRelations() {
    for (const treeNode of Object.values(this.treeNodes)) {
      const headId = treeNode.head;
      var headCoordX = 0;
      if (headId > 0) {
        const headTreeNode = this.treeNodes[headId];
        headCoordX = headTreeNode.centerX;
        // if governor is root, draw root relation
      } else if (headId === 0) {
        headCoordX = 0;
      } else {
        console.log(
          "this nodeTree has no governor, not drawing it",
          treeNode.id
        );
        continue;
      }
      treeNode.drawRelation(this.snapTree, headCoordX, this.leveldistance);
    }
  }

  adaptSvgCanvas() {
    // get the maximum x and y of the svg for resizing the window
    this.totalWidth = Math.max(
      ...Object.values(this.treeNodes).map((x) => x.startX + x.width)
    );
    this.totalHeight = Math.max(
      ...this.shownFeatures.map(
        (feature) =>
          Object.values(this.treeNodes)[0].snapElements[feature].getBBox().y2
      )
    );
    this.snapTree.attr("width", this.totalWidth + 50);
    this.snapTree.attr("height", this.totalHeight);
  }

  attachEvents() {
    for (const treeNode of Object.values(this.treeNodes)) {
      treeNode.attachEvent();
    }
  }

  attachDraggers() {
    for (const treeNode of Object.values(this.treeNodes)) {
      treeNode.attachDragger();
    }
  }

  attachHovers() {
    for (const treeNode of Object.values(this.treeNodes)) {
      treeNode.attachHover();
    }
  }

  exportConll() {
    return treeToConll({tree : this.treeJson, META: this.META})
  }

  refresh() {
    this.snapTree.clear();
    this.populateLevels();
    this.populateTreeNodes();
    this.drawRelations();
    this.adaptSvgCanvas();
    this.attachDraggers();
    this.attachEvents();
    this.attachHovers();
  }

  repr() {
    console.log("KK this.name", this);
  }
}

// add a basic event dispatch/listen system
Object.assign(SvgDepTree.prototype, EventDispatcher.prototype);

///////////////                ////////////////
///////////////   DepTreeNode  ////////////////
///////////////                ////////////////

class DepTreeNode {
  constructor(treeNodeJson, parentTree) {
    this.parentTree = parentTree;
    this.treeNodeJson = treeNodeJson;
    this.id = parseInt(treeNodeJson["ID"]);
    this.head = isNaN(parseInt(treeNodeJson["HEAD"]))
      ? -1
      : parseInt(treeNodeJson["HEAD"]);
    this.form = treeNodeJson["FORM"];
    this.lemma = treeNodeJson["LEMMA"];
    this.upos = treeNodeJson["UPOS"];
    this.xpos = treeNodeJson["XPOS"];
    this.deprel = treeNodeJson["DEPREL"];
    this.misc = treeNodeJson["MISC"];
    this.feats = treeNodeJson["FEATS"];
    this.deps = treeNodeJson["DEPS"];

    // populate the FEATS and MISC child features
    for (const label of ["FEATS", "MISC"]) {
      for (const [key, value] of Object.entries(treeNodeJson[label])) {
        treeNodeJson[`${label}.${key}`] = value;
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

  createSnap(snapTree, shownFeatures, startX, startY) {
    this.snapTree = snapTree;
    this.shownFeatures = shownFeatures;
    this.startX = startX;
    this.startY = startY || 10;
    let runningY = this.startY;

    let maxFeatureWidth = 0;
    for (const feature of shownFeatures) {
      // create new snap node for the feature text
      const snapFeature = snapTree.text(
        this.startX,
        runningY,
        this.treeNodeJson[feature]
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

  drawRelation(snapTree, headCoordX, levelHeight) {
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

    this.snapArc = snapTree.path(arcPath).addClass("curve");

    const arrowheadsize = 5;
    const arrowheadPath = getArrowheadPath(xFrom, yLow, arrowheadsize);
    this.snapArrowhead = snapTree.path(arrowheadPath).addClass("arrowhead");

    var deprelX = this.snapArc.getBBox().x + this.snapArc.getBBox().w / 2;
    var deprelY = this.snapArc.getBBox().y - 5;

    // replace the deprel when it's the root
    if (headCoordX == 0) {
      deprelX += 20;
      deprelY = 30;
    }

    this.snapDeprel = snapTree
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
        this_.parentTree.dispatchEvent(event);
      });
    }
  }

  attachDragger() {
    this.draggedForm = this.snapElements["FORM"];
    this.draggedForm.drag(dragging, startDrag, stopDrag, this); // `this` act like the context. (Similar to .bind(this))
  }

  attachHover() {
    this.snapElements["FORM"].mouseover(() => {
      if (this.parentTree.dragged && this.id !== this.parentTree.dragged) {
        this.snapElements["FORM"].addClass("glossy");
        this.parentTree.hovered = this.id;
      }
    });
    this.snapElements["FORM"].mouseout(() => {
      if (this.parentTree.dragged && this.id !== this.parentTree.dragged) {
        this.snapElements["FORM"].removeClass("glossy");
        this.parentTree.hovered = 0;
      }
    });
  }

  repr() {
    console.log("KK depTreeNode repr()", this);
  }
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

  this.parentTree.dragged = this.id;

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
  this.draggedCurve = this.snapTree.path(path).addClass("dragcurve");
  this.draggedArrowhead = this.snapTree
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
      this.dragRootCircle = this.snapTree
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
        hovered: this.parentTree.hovered,
        dragged: this.parentTree.dragged,
      },
    });
    e.preventDefault();
    e.stopPropagation();
  }
  this.parentTree.dispatchEvent(event);
  this.parentTree.dragged = 0;
  if (this.parentTree.hovered) {
    this.parentTree.treeNodes[this.parentTree.hovered].snapElements[
      "FORM"
    ].removeClass("glossy");
    this.parentTree.hovered = 0;
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
