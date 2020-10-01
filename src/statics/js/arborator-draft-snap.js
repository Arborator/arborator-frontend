(function() {
  /*!
   * arborator script for dependency drawing
   * version 1.0
   * http://arborator.ilpga.fr/
   *
   * Copyright 2010-2017, Kim Gerdes & Gaël Guibon
   *
   * This program is free software:
   * Licensed under version 3 of the GNU Affero General Public License (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at http://www.gnu.org/licenses/agpl-3.0.html
   * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and limitations under the License.
   *
   */

  // var drag = d3.drag();

  xWordDistance = 10; // only used as default if CSS incomplete
  yWordDistance = 20;
  leveldistance = 33; // to be overrulled by the css definition
  // global variables:
  fontSize = 0; // computed from css value for .token in arborator-draft.css
  lemmaHeight = 0;
  const arrowheadsize = 5;
  // maxLevelDistance = 33; // the maximum distance between one dependency relation and the next higher one
  posHeight = 0;
  svgDefaultHeight = 500;
  svgHeight = 0;
  el = 10; // type of conll (10, 14, or 4), computed in conllToJson
  trees = []; // list of tree objects
  conlltrees = []; // list of conll strings
  defaultCat = "_";

  shownfeatures = ["form", "UPOS", "LEMMA"]; // redefined in readConll

  // formFeatureName = 'form'
  // catFeatureName = 'UPOS'

  // UD config:
  // morphoSynt= ['Abbr', 'AbsErgDatNumber', 'AbsErgDatPerson', 'AbsErgDatPolite', 'AdpType', 'AdvType', 'Animacy',
  // 	'Aspect', 'Case', 'Clusivity', 'ConjType', 'Definite', 'Degree', 'Echo', 'ErgDatGender', 'Evident', 'Foreign',
  // 	'Gender', 'Hyph', 'Mood', 'NameType', 'NounClass', 'NounType', 'NumForm', 'NumType', 'NumValue', 'Number',
  // 	'PartType', 'Person', 'Polarity', 'Polite', 'Poss', 'PossGender', 'PossNumber', 'PossPerson', 'PossedNumber',
  // 	'Prefix', 'PrepCase', 'PronType', 'PunctSide', 'PunctType', 'Reflex', 'Style', 'Subcat', 'Tense', 'Typo',
  // 	'VerbForm', 'VerbType', 'Voice']
  // specialFeatures=['form', "LEMMA", 'UPOS', "tag2", "XPOS", "ehead",
  // 					"id", "index", "HEAD", "kids", "DEPREL", "DEPS", "span"]

  // progressiveLoading = true; // false to make it load all trees at once (may overload the browser)
  // pngBtn = true;
  // svgBtn = true;
  reverseMode = false; // set true for right to left conll

  conlls = {
    10: {
      ID: 0,
      FORM: 1,
      LEMMA: 2,
      UPOS: 3,
      XPOS: 4,
      FEATS: 5,
      HEAD: 6,
      DEPREL: 7,
      DEPS: 8,
      MISC: 9,
    },
    14: { ID: 0, FORM: 1, LEMMA: 3, UPOS: 5, HEAD: 9, DEPREL: 11 },
    4: { FORM: 0, LEMMA: 0, UPOS: 1, HEAD: 2, DEPREL: 3 },
  };

  // conlls = {
  // 	10: 	{"id": 0, 'form':1, "LEMMA": 2, 'UPOS': 3, "XPOS":4, "FEATS":5,
  // 				"HEAD":6, "DEPREL":7, "DEPS":8, "MISC":9},
  // 	14: 	{"id": 0, 'form':1, "LEMMA": 3, 'UPOS': 5, "HEAD":9, "DEPREL":11},
  // 	4: 	{'form':0, "LEMMA": 0, 'UPOS': 1, "HEAD":2, "DEPREL":3}
  // }

  // currentS = null;
  // drag & drop stuff:
  droppables = [];
  dragrepl = null;
  dragcurve = null;
  dragarrowhead = null;
  dragsun = null;
  draheader = -1;
  const dragclickthreshold = 400; //ms
  dragclicktime = 0;
  // const delta = 6;
  // let dragclickstartX;
  // let dragclickstartY;

  // debug:
  log = console.log.bind(console);

  // TODO: add lemmas and pos!!!
  lemmaColor = "#006400";
  posColor = "#9e04de";

  svgIdIndex = 0;

  // public initialisation function
  this.ArboratorDraft = function(visuMode = 0, reverse = false) {};

  // public functions
  // ArboratorDraft.prototype.emptyThenRefresh = function(content, reverse = false, toggle = false) {
  // 	if(reverse) reverseMode = true; // to set reverse or not
  // 	if(toggle) reverseMode = !reverseMode; // to toggle reverse
  // 	empty().done( refresh( content ) );
  // }

  ArboratorDraft.prototype.drawit = function(strConll, usermatches, id, shof) {
    shownfeatures = shof;
    // log('usermatches', usermatches) // the one that we see
    var treedata = conllToJson(strConll.trim()); // treedata is object: {tree:tree, META:META, svg:snap-object}
    treedata.s = drawsnap(id, treedata, usermatches, shownfeatures);
    return treedata;
  };

  ArboratorDraft.prototype.cleanSvgTree = function(SvgId) {
    cleanSnap(SvgId);
  };

  // Kirian : does this need to be public ? I don't see anuy call to this function outside of this file
  ArboratorDraft.prototype.getTree = function(strConll) {
    return conllToJson(strConll.trim());
  };

  // ArboratorDraft.prototype.setRel = function(rel){
  // 	log('setRel START');
  // 	log(rel);
  // 	log('setRel END');
  // }

  ArboratorDraft.prototype.relationChanged = function(
    treedata,
    depid,
    headid,
    relation,
    addasextended
  ) {
    return relationChanged(treedata, depid, headid, relation, addasextended);
  };

  ArboratorDraft.prototype.catChanged = function(treedata, depid, cat) {
    return catChanged(treedata, depid, cat);
  };

  ArboratorDraft.prototype.featureChanged = function(
    treedata,
    depid,
    lemma,
    feats,
    misc
  ) {
    return featureChanged(treedata, depid, lemma, feats, misc);
  };

  ArboratorDraft.prototype.metaChanged = function(treedata, metas) {
    return metaChanged(treedata, metas);
  };

  ArboratorDraft.prototype.getConll = function(treedata) {
    // console.log("getConll treedata", treedata)
    return treeDataToConll(treedata);
  };

  ArboratorDraft.prototype.treeDataToConll = function(treedata) {
    console.log("treeDataToConll treedata", treedata);
    var newconll = treeDataToConll(treedata);
    console.log("the new conll", newconll);
    return newconll;
  };

  ArboratorDraft.prototype.replaceNodes = function(
    s,
    treedata,
    idsequence,
    headid,
    newtokens
  ) {
    var newtreedata = replaceNodes(s, treedata, idsequence, headid, newtokens);
    // console.log("the newtreedata", newtreedata);
    return newtreedata;
  };

  // private functions

  // function refresh(idSVG, content) {
  // 	// $('#svgwell').html('');
  // 	// $('#svgwell').append( $("<conll></conll>").attr('id', 'transformhere').text( content ) );
  // 	// var conll = d3.selectAll('#transformhere')['_groups'][0][0];
  // 	// log("_____refresh \n content",content);
  // 	// drawConll(conll);
  // 	listOfConlls = content.trim().split(/\n\s*\n\s*\n*/);

  // 	for (let singleConll of listOfConlls) { // for each conll tree at once, can block the browser
  // 		var treedata = conllToJson(singleConll)
  // 		// console.log("refresh function",this);
  // 		drawsnap(idSVG, treedata, usermatches, shownfeatures)
  // 		}
  // 	return;
  // }

  function getlevel(i, gi, tree, idhead2level) {
    // recursive function determining the level of a dependency relation
    // log("__________getlevel",i,gi)
    if (gi != parseInt(gi)) return 0;
    if (idhead2level[i + "_" + gi] > 0) return idhead2level[i + "_" + gi]; // already seen
    if (gi == 0) return 0; // governor is root
    var intermlevs = [1];
    for (var ii = Math.min(i, gi) + 1; ii < Math.max(i, gi); ii++) {
      // relation longer than one
      if (tree[ii]) var giis = [tree[ii]["HEAD"]];
      else var giis = [];
      giis = giis.concat(Object.keys(tree[ii]["DEPS"]));
      for (let gii of giis) {
        if (gii >= Math.min(i, gi) && gii <= Math.max(i, gi)) {
          if (idhead2level[ii + "_" + gii] > 0)
            intermlevs.push(idhead2level[ii + "_" + gii] + 1);
          else intermlevs.push(getlevel(ii, gii, tree, idhead2level) + 1);
        }
      }
    }
    idhead2level[i + "_" + gi] = Math.max(...intermlevs);
    return idhead2level[i + "_" + gi];
  }

  var startdrag = function(xx, yy, e) {

    dragclicktime = new Date().getTime();
    dragrepl = this.clone();
    dragrepl.attr({ class: "draghead" });
    this.attr({ cursor: "move" });
    x = this.midx;
    y = this.topy;
    var path =
      "M" +
      x +
      "," +
      y +
      " C" +
      x +
      "," +
      (y - 1) +
      " " +
      (x + 1) +
      "," +
      (y - 1) +
      " " +
      (x + 1) +
      "," +
      y;
    dragcurve = this.paper.root.path(path).attr({ class: "dragcurve" });
    dragarrowhead = this.paper.root
      .path(arrowhead(x, y))
      .attr("class", "dragcurve");

    for (let dropa of droppables) {
      if (dropa != this) {
        dropa.mouseover(function() {
          // console.log("Over the word", this.nr);
          dropa.attr({ class: "glossy" });
          draheader = this.nr;
        });
        dropa.mouseout(function() {
          // console.log("out from the word", this.nr);
          dropa.attr({ class: "FORM" });
          draheader = -1;
        });
        dropa.attr({ cursor: "move" });
      }
    }
  };

  function dragging(dx, dy, posX, posY, event) {
    // log("onmove",dx, dy, posX, posY,this, event,"translate("+posX+","+posY+")")
    this.transform("translate(" + (dx - 15) + "," + (dy - 30) + ")").attr({
      class: "glossy",
    });
    var x = this.midx;
    var y = this.topy;
    var cy = y + dy - Math.abs(dx) / 2;
    if (cy < 0) cy = 0;
    var path =
      "M" +
      x +
      "," +
      y +
      " C" +
      x +
      "," +
      cy +
      " " +
      (x + dx) +
      "," +
      cy +
      " " +
      (x + dx) +
      "," +
      (y + dy);
    dragcurve.attr({ d: path });
    dragarrowhead.transform("translate(" + dx + "," + dy + ")");
    if (y + dy < leveldistance / 2 && Math.abs(dx) < leveldistance / 2) {
      if (dragsun == null)
        dragsun = this.paper.root
          .circle(x, 0, leveldistance / 2)
          .attr("class", "dragcurve");
    } else {
      if (dragsun != null) {
        dragsun.remove();
        dragsun = null;
      }
    }
  }

  var stopdrag = function(e) {
    if (new Date().getTime() < dragclicktime + dragclickthreshold) {
      // log("ccccclick",this.paper.root.treedata.tree[this.nr]) //, this.paper.root.treedata.tree);
      this.paper.root.treedata.openFeatureDialog(
        this.paper,
        this,
        this.paper.root.treedata.tree[this.nr]["FORM"],
        this.paper.root.treedata.tree[this.nr]["LEMMA"],
        this.nr,
        this.feats,
        this.misc
      );
    }
    this.animate(
      { transform: "translate(" + 0 + "," + 0 + ")" },
      300,
      mina.easein,
      function() {
        this.attr({ class: "FORM" });
        dragrepl.remove();
      }
    );
    for (let dropa of droppables) {
      dropa.unmouseover();
      dropa.unmouseout();
      dropa.attr({ cursor: "move", cursor: "grab", class: "FORM" });
    }
    dragcurve.remove();
    dragarrowhead.remove();

    if (
      draheader != this.nr &&
      ((draheader >= 0 && this.nr != undefined) || dragsun != null)
    ) {
      nr = this.nr;
      if (dragsun) {
        draheader = nr;
        nr = 0;
      }
      var oldRelation = this.paper.root.treedata.tree[draheader]["DEPREL"];
      this.paper.root.treedata.openRelationDialog(
        this.paper,
        this,
        nr,
        draheader,
        nr ? this.paper.root.treedata.tree[nr]["FORM"] : "the root node",
        this.paper.root.treedata.tree[draheader]["FORM"],
        oldRelation,
        e.ctrlKey
      );
    }
    if (dragsun != null) {
      dragsun.remove();
      dragsun = null;
    }
    draheader = -1;
  };

  var categoryclick = function(e) {
    this.attr({ class: "UPOSselected" });
    this.paper.root.treedata.openCategoryDialog(
      this.paper,
      this,
      this.paper.root.treedata.tree[this.nr]["FORM"],
      this.nr,
      this.upos
    );
  };

  var relationclick = function(e) {
    this.attr({ class: "DEPRELselected" });
    this.paper.root.treedata.openRelationDialog(
      this.paper,
      this,
      this.headid,
      this.nr,
      this.headid
        ? this.paper.root.treedata.tree[this.headid]["FORM"]
        : "the root node",
      this.paper.root.treedata.tree[this.nr]["FORM"],
      this.relation,
      e.ctrlKey
    );
  };

  function relationChanged(treedata, depid, headid, relation, addasextended) {
    // todo: maybe include adding of secondary governor!!!
    // called from ConllGraph.vue

    if (addasextended) {
      if (relation.trim() == "") delete treedata.tree[depid]["DEPS"][headid];
      else treedata.tree[depid]["DEPS"][headid] = relation;
    } else {
      if (relation.trim() == "") {
        (headid = "_"), (relation = "_");
      }
      treedata.tree[depid]["HEAD"] = headid;
      treedata.tree[depid]["DEPREL"] = relation;
    }
    treedata.s.paper.clear();
    treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return treedata;
  }

  function catChanged(treedata, depid, cat) {
    // called from ConllGraph.vue
    // console.log("BEFORE", JSON.parse(JSON.stringify(s.root.treedata.tree)));
    treedata.tree[depid]["UPOS"] = cat;
    treedata.s.paper.clear();
    treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return treedata;
  }
  function featureChanged(treedata, depid, lemma, feats, misc) {
    // called from ConllGraph.vue
    // log("draft featureChanged", JSON.parse(JSON.stringify(s.root.treedata.tree)));
    treedata.tree[depid]["LEMMA"] = lemma;
    treedata.tree[depid]["FEATS"] = feats;
    treedata.tree[depid]["MISC"] = misc;
    treedata.s.paper.clear();
    treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return treedata;
  }
  function metaChanged(treedata, metas) {
    // called from ConllGraph.vue
    metas.text = treeToSentence(treedata.tree);
    treedata.META = metas;

    // can metadata influence how the graph is drawn? if yes, but this back:
    treedata.s.paper.clear();
    treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return treedata;
  }

  function drawsnap(idSVG, treedata, usermatches, shownfeatures) {
    ///////////////////////////////////
    // draws json tree on svg in div //
    // idSVG is of pre-existing svg
    // treedata is an object containing .tree (relevant here),
    // but also sentence and META with one line per sentence feature:
    // [ "# user_id = Marine", "# elan_id = P_WAZK_07_34 P_WAZK_07_35", … ]
    // usermatches is of the form edges: Array [], nodes: 20, 21]
    // shownfeatures todo!!!
    ///////////////////////////////////
    var textgraphdistance = 10;
    // log(999,treedata,999,shownfeatures)
    var textstarty = 10; // has to be bigger than arborator-draft.css DEPREL fontsize
    var runningy = textstarty;
    var s = Snap(document.getElementById(idSVG));

    droppables = [];
    leveldistance = parseInt(
      getComputedStyle(s.parent().node).getPropertyValue("--depLevelHeight")
    );
    var idhead2level = {};
    var levels = [];
    s.treedata = treedata;
    s.id = idSVG;
    var tree = treedata.tree;

    // usermatches
    // console.log(1212,JSON.stringify(usermatches),JSON.stringify(usermatches.map(um=>(um.edges.length))));
    const matchnodes = usermatches
      .map(({ nodes }) => Object.values(nodes))
      .flat(); // simple array of match nodes to highlight
    const matchedges = Object.fromEntries(
      usermatches.map((um) =>
        um.edges.length == null ? [] : [um.edges.e.target, um.edges.e]
      )
    ); // object { target node : object }
    // insertion of texts
    var xpositions = [0];
    var allstexts = {};
    var feati = 0;
    for (let shofea of shownfeatures) {
      stexts = [];
      ind = 0;
      for (var nr in tree) {
        var word = tree[nr];
        var sword = s
          .text(
            xpositions[ind],
            runningy,
            shofea.split(".").reduce((value, el) => value[el], word)
          )
          .attr({ class: shofea.replace(".", "-") });
        sword.nr = nr;
        sword.form = word[shofea];
        sword.feats = word.FEATS;
        sword.misc = word.MISC;
        stexts.push(sword);
        if (feati == 0) {
          // tokens
          sword
            .attr({ cursor: "move", cursor: "grab" })
            .drag(dragging, startdrag, stopdrag); // dragging only the first line (normally the tokens)
          droppables.push(sword);
          if (word["HEAD"] != 0)
            levels.push(getlevel(nr, word["HEAD"], tree, idhead2level));
          else levels.push(2); // minimum height 2 for root relations
          for (var headid in word["DEPS"]) {
            // computation of tree depth. for each governor...
            if (tree[headid])
              levels.push(getlevel(nr, headid, tree, idhead2level));
          }
        }
        if (shofea == "UPOS") {
          // categories
          sword.attr({ cursor: "pointer" }).click(categoryclick);
          sword.upos = word[shofea];
        }
        if (matchnodes.includes(nr.toString())) {
          // highlight matches, todo: hightlight relation, too!
          sword.node.style.fill = "#dd137bff";
          sword.node.scrollIntoView(); // todo: check why this is not operational
        }
        if ("highlight" in word.MISC) {
          sword.node.style.fill = word.MISC["highlight"];
        }
        sword.wordDistance = parseInt(
          getComputedStyle(sword.node).getPropertyValue("--wordDistance")
        );
        if (!sword.wordDistance) {
          sword.wordDistance = xWordDistance;
          log("check your CSS for", shofea);
        }
        nextx = Math.max(
          xpositions[ind + 1] || 0,
          xpositions[ind] + sword.getBBox().w + sword.wordDistance
        );
        xpositions[ind + 1] = nextx;
        ind += 1;
      }
      runningy += yWordDistance;
      allstexts[shofea] = stexts;
      feati += 1;
    }

    var maxlevel = Math.max(...levels);
    var xmidpoints = [];
    var x2s = []; // right edge of all shown features
    var y2s = []; // bottom of all shown features
    var basey = textstarty + maxlevel * leveldistance - textgraphdistance;
    var firstTextFontSize = parseInt(
      getComputedStyle(allstexts[shownfeatures[0]][0].node).getPropertyValue(
        "font-size"
      )
    );

    // readjusting the position of texts
    for (let shofea of shownfeatures) {
      var ind = 0;
      for (var nr in tree) {
        var xmidpoint =
          xpositions[ind] + (xpositions[ind + 1] - xpositions[ind]) / 2;
        xmidpoints.push(xmidpoint);
        allstexts[shofea][ind].midx = xmidpoint;
        allstexts[shofea][ind].attr({
          x: xmidpoint - allstexts[shofea][ind].getBBox().w / 2,
        });
        allstexts[shofea][ind].attr({
          y: allstexts[shofea][ind].getBBox().y2 + maxlevel * leveldistance,
        });
        allstexts[shofea][ind].topy = allstexts[shofea][ind].getBBox().y;
        x2s.push(allstexts[shofea][ind].getBBox().x2); // maybe move out of loop?
        y2s.push(allstexts[shofea][ind].getBBox().y2);
        ind += 1;
      }
    }

    // drawing the dependency relations
    var ind = 0;
    for (var nr in tree) {
      var word = tree[nr];
      var lineclass = null;
      var relationclass = null;
      if (nr in matchedges) {
        // matchedges[nr] looks like {"source":"10","label":"subj","target":"9"}
        if (
          word["HEAD"] == matchedges[nr]["source"] &&
          word["DEPREL"] == matchedges[nr]["label"]
        ) {
          lineclass = "DEPRELselected";
          relationclass = "dragcurve";
        }
      }
      drawRelation(
        word["HEAD"],
        word["DEPREL"],
        relationclass,
        lineclass,
        0,
        tree,
        idhead2level,
        nr,
        basey,
        ind,
        xmidpoints,
        firstTextFontSize,
        s,
        arrowhead,
        word,
        relationclick
      );
      var gap = 0;
      for (var headid in word["DEPS"]) {
        // for each governor of extended dependency
        gap = gap + arrowheadsize;
        var lineclass = null;
        var relationclass = null;
        if (nr in matchedges) {
          // matchedges[nr] looks like {"source":"10","label":"subj","target":"9"}
          if (
            headid == matchedges[nr]["source"] &&
            word["DEPS"][headid] == matchedges[nr]["label"]
          ) {
            lineclass = "DEPRELselected";
            relationclass = "dragcurve";
          }
        }
        drawRelation(
          headid,
          word["DEPS"][headid],
          "xdep",
          "xdeprel",
          gap,
          tree,
          idhead2level,
          nr,
          basey,
          ind,
          xmidpoints,
          firstTextFontSize,
          s,
          arrowhead,
          word,
          relationclick
        ); // todo: hightlight usermatch in relation, too!
      }
      ind += 1;
    }

    // computing the total size of the graph
    var maxx2 = Math.max(...x2s);
    var maxy2 = Math.max(...y2s);
    s.attr("height", maxy2 + "px");
    s.attr("width", maxx2 + "px");
    svgHeight = s.attr("height").replace(/px/, "");
    return s;
  }

  function cleanSnap(idSVG) {
    var s = Snap(document.getElementById(idSVG));
    s.clear();
  }

  function drawRelation(
    headid,
    relation,
    xdep,
    xdeprel,
    gap,
    tree,
    idhead2level,
    nr,
    basey,
    ind,
    xmidpoints,
    firstTextFontSize,
    s,
    arrowhead,
    word,
    relationclick
  ) {
    if (headid in tree || headid == 0) {
      // only existing governors
      var xbasey = basey - gap;
      le = idhead2level[nr + "_" + headid];
      var controly = basey - le * leveldistance;
      if (xdep) controly -= leveldistance / 4;
      var tox =
        headid > ind
          ? xmidpoints[headid - 1] - firstTextFontSize / 2
          : xmidpoints[headid - 1] + firstTextFontSize / 2;
      var xmi = xmidpoints[ind];

      if (headid > 0)
        var path =
          "M" +
          xmi +
          "," +
          xbasey +
          " C" +
          xmi +
          "," +
          controly +
          " " +
          tox +
          "," +
          controly +
          " " +
          tox +
          "," +
          basey;
      else var path = "M" + xmi + "," + xbasey + " L" + xmi + "," + "0 ";
      var p = s.path(path).attr({ class: "curve" });
      var ah = s.path(arrowhead(xmi, xbasey)).attr("class", "arrowhead");
      var pbox = p.getBBox();
      var xmidf = pbox.x + pbox.w / 2;
      var srel = s
        .text(xmidf, pbox.y - 2, relation)
        .attr({ class: "DEPREL" })
        .click(relationclick); // attach the click behavior on the word
      if (xdep) {
        srel.attr({ class: xdeprel });
        p.attr({ class: xdep });
        ah.attr({ class: xdep });
      }
      srel.nr = nr;
      srel.headid = headid;
      srel.relation = relation;
      if (headid == 0) srel.attr({ y: firstTextFontSize });
      else srel.attr({ x: xmidf - srel.getBBox().w / 2 });
    }
  }

  function arrowhead(x, y) {
    // gives path for arrowhead x,y startpoint (end of arrow)
    // var
    var startpoint = x + "," + y; // to move the arrowhead lower: (y+arrowheadsize/3);
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

  function treeDataToConll(treedata) {
    // constructs a conllu string from the current treedata
    // log('treeDataToConll',treedata)
    if (!treedata) return "";
    var conlines = [];
    for (let a in treedata.META) {
      var v = treedata.META[a];
      if (v != null) conlines.push("# " + a + " = " + v);
      // +'\n'
      else conlines.push("# " + a);
    }
    for (let nr in treedata.tree) {
      var node = treedata.tree[nr];
      conlines.push(
        [
          nr,
          node["FORM"] || "_",
          node["LEMMA"] || "_",
          node["UPOS"] || "_",
          node["XPOS"] || "_",
          makeFeaturestring(node["FEATS"], "=", "|"),
          node["HEAD"] == parseInt(node["HEAD"]) ? node["HEAD"] : "_",
          node["DEPREL"] || "_",
          makeFeaturestring(node["DEPS"], ":", "|"),
          makeFeaturestring(node["MISC"], "=", "|"),
        ].join("\t")
      );
    }
    conllstr = conlines.join("\n");
    return conllstr;
  }

  function replaceNodes(treedata, idsequence, headid, newtokens) {
    var id2newid = { 0: 0 };
    for (let id in treedata.tree) {
      id = parseInt(id);
      if (id < idsequence[0]) id2newid[id] = id;
      else if (idsequence.includes(id)) {
        if (idsequence.indexOf(id) < newtokens.length) id2newid[id] = id;
        else id2newid[id] = headid;
      } else id2newid[id] = id + newtokens.length - idsequence.length;
    }
    var newtree = {};
    for (let id in treedata.tree) {
      id = parseInt(id);
      if (idsequence.includes(id) && idsequence.indexOf(id) >= newtokens.length)
        continue;
      var node = treedata.tree[id];
      node.ID = id2newid[id];
      node.HEAD = id2newid[node.HEAD];
      newdeps = {};
      for (let gid in node.DEPS) newdeps[id2newid[gid]] = node.DEPS[gid];
      node.DEPS = newdeps;
      if (idsequence.includes(id)) {
        node.FORM = newtokens[idsequence.indexOf(id)];
      }
      newtree[id2newid[id]] = node;
    }
    // now the case where more tokens were inserted than replaced:
    var basenode = treedata.tree[id2newid[idsequence[idsequence.length - 1]]];
    for (var i = idsequence.length; i < newtokens.length; ++i) {
      let newnode = JSON.parse(JSON.stringify(basenode));
      newnode.ID = idsequence[0] + i;
      newnode.FORM = newtokens[i];
      newnode.HEAD = 0;
      newnode.DEPREL = "root";
      newnode.DEPS = {};
      if (newnode.MISC.Gloss) newnode.MISC.Gloss = newnode.FORM;
      newtree[idsequence[0] + i] = newnode;
    }
    if (!Object.keys(newtree).length) return treedata; // forbid to erase entire tree
    treedata.tree = newtree;

    treedata.META.text = treeToSentence(treedata.tree);
    treedata.s.paper.clear();
    treedata.s = drawsnap(treedata.s.id, treedata, [], shownfeatures);
    return treedata;
  }

  function treeToSentence(tree) {
    var toks = Object.values(tree).map(({ FORM }) => FORM);
    var spa = Object.values(tree).map(({ MISC }) =>
      "SpaceAfter" in MISC && MISC.SpaceAfter == "No" ? 0 : 1
    );
    var sentence = "";
    for (var i = 0; i < toks.length; ++i)
      sentence += toks[i] + (spa[i] ? " " : "");
    return sentence;
  }

  // conlls = {
  // 	10: 	{"ID": 0, "FORM":1, "LEMMA": 2, "UPOS": 3, "XPOS":4, "FEATS":5, "HEAD":6, "DEPREL":7, "DEPS":8, "MISC":9},
  // 	14: 	{"ID": 0, "FORM":1, "LEMMA": 3, "UPOS": 5, "HEAD":9, "DEPREL":11},
  // 	4: 		{"FORM":0, "LEMMA": 0, "UPOS": 1, "HEAD":2, "DEPREL":3}
  // }

  function conllToJson(treeline) {
    // takes a conll representation of a single tree as input
    // returns object: {tree:tree, META:META}

    // treeline = "# text Er arbeitet fürs FBI (deutsch etwa: „Bundesamt für Ermittlung“).\n"+treeline
    var nodes = treeline.split("\n");
    if (reverseMode) nodes.reverse();
    // nodes = nodes.reverse();
    var tree = {};
    var META = {}; // sentence features before the actual conll
    var addLines = {}; // node position to additional line
    var uextra = {}; // todo: check this for reconstruction of conllu
    var lastid = 0;
    var skipuntil = 0;
    var words = [];
    nodes.forEach(function(nodeline, id) {
      // for each conll line:
      nodeline = nodeline
        .trim()
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      if (nodeline.charAt(0) == "#") {
        // META
        var [a, v] = nodeline
          .substring(1)
          .trim()
          .split("=");
        if (v != null) var [a, v] = [a.trim(), v.trim()];
        META[a] = v;
        return true;
      }
      var elements = nodeline.split("\t");
      el = elements.length;
      if (el > 1) {
        if (!(el in conlls) && el > 10) el = 10;
        if (el > 4) id = elements[conlls[el]["ID"]];
        else if (elements[conlls[el]["FORM"]] != "_") id++;
        var form = elements[conlls[el]["FORM"]];
        var tokids = id.split("-");
        if (tokids.length == 1) {
          // simple token
          tree[id] = {};
          tree[id]["ID"] = id;
          tree[id]["FORM"] = form;
          tree[id]["LEMMA"] = elements[conlls[el]["LEMMA"]];
          tree[id]["UPOS"] = elements[conlls[el]["UPOS"]];
          tree[id]["HEAD"] = parseInt(elements[conlls[el]["HEAD"]]);
          tree[id]["DEPREL"] = elements[conlls[el]["DEPREL"]];
          tree[id]["FEATS"] = {};
          tree[id]["DEPS"] = {};
          tree[id]["MISC"] = {};

          if (id > skipuntil) words.push(form);
          if (el == 10) {
            tree[id]["XPOS"] = elements[conlls[el]["XPOS"]];
            tree[id]["FEATS"] = analyzeFeaturestring(
              elements[conlls[el]["FEATS"]],
              "=",
              "|"
            );
            tree[id]["DEPS"] = analyzeFeaturestring(
              elements[conlls[el]["DEPS"]],
              ":",
              "|"
            );
            tree[id]["MISC"] = analyzeFeaturestring(
              elements[conlls[el]["MISC"]],
              "=",
              "|"
            );
          }
        } else if (tokids.length == 2) {
          // n-m type multi-word encoding
          skipuntil = parseInt(tokids[1]);
          words.push(elements[conlls[el]["FORM"]]);
          if (!(lastid in uextra)) uextra[lastid] = [];
          uextra[lastid].push(nodeline);
        } else {
          if (!(lastid in uextra)) uextra[lastid] = [];
          uextra[lastid].push(nodeline);
        }
      } //end if el >1
      else {
        // bizarre line
        if (!(lastid in addLines)) addLines[lastid] = [];
        addLines[lastid].push(nodeline);
        if (tokids.length == 2) {
          // n-m type multi-word encoding
          skipuntil = parseInt(tokids[1]);
          words.push(elements[conlls[el]["FORM"]]);
        }
        tree[id]["HEAD"] = parseInt(elements[conlls[el]["HEAD"]]); // todo: think about this
        tree[id]["DEPREL"] = elements[conlls[el]["DEPREL"]];
      }

      lastid = id;
    });

    // now always correcting the META.text feature. if this is not desired, uncomment this line:
    // if ("text" in META) return {tree:tree, META:META};
    // got to contstruct the sentence
    var sentence = [];
    words.forEach(function(word, i) {
      sentence.push(word);
      if (
        !(
          "SpaceAfter" in tree[i + 1]["MISC"] &&
          tree[i + 1]["MISC"]["SpaceAfter"] == "No"
        )
      )
        sentence.push(" ");
      // if(!reverseMode){
      // 	if (i+1 in tree && !(("NoSpaceAfter" in tree[i+1]) && tree[i+1]["NoSpaceAfter"]==false)) sentence.push(" ");
      // } else{ sentence.push(word); }
    });
    META["text"] = sentence.join("");
    return { tree: tree, META: META };
  }

  function analyzeFeaturestring(featstr, eq, spl) {
    o = {};
    if (featstr.indexOf(eq) > -1) {
      featstr.split(spl).forEach(function(
        f // for each feature:
      ) {
        var fs = f.split(eq);
        if (fs.length >= 2) {
          // if it's not just _
          o[fs[0]] = fs.slice(1).join(eq);
        }
      });
    }
    return o;
  }

  function makeFeaturestring(feato, eq, spl) {
    strs = [];
    for (k in feato) {
      strs.push(k + eq + feato[k]);
    }
    str = strs.join(spl);
    return str || "_";
  }
})();
