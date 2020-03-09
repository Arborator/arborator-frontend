(function () {

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

// xWordDistance = 20;
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
el=10; // type of conll (10, 14, or 4), computed in conllToTree
trees=[]; // list of tree objects
sentenceFeaturess=[]; // list of comments. each comment is a hashtable position(=line)->comment TODO: add this to the display
conlltrees=[]; // list of conll strings
defaultCat="_"



// formFeatureName = 'form'
// catFeatureName = 'upos'

// UD config:
morphoSynt= ['Abbr', 'AbsErgDatNumber', 'AbsErgDatPerson', 'AbsErgDatPolite', 'AdpType', 'AdvType', 'Animacy', 
	'Aspect', 'Case', 'Clusivity', 'ConjType', 'Definite', 'Degree', 'Echo', 'ErgDatGender', 'Evident', 'Foreign', 
	'Gender', 'Hyph', 'Mood', 'NameType', 'NounClass', 'NounType', 'NumForm', 'NumType', 'NumValue', 'Number', 
	'PartType', 'Person', 'Polarity', 'Polite', 'Poss', 'PossGender', 'PossNumber', 'PossPerson', 'PossedNumber', 
	'Prefix', 'PrepCase', 'PronType', 'PunctSide', 'PunctType', 'Reflex', 'Style', 'Subcat', 'Tense', 'Typo', 
	'VerbForm', 'VerbType', 'Voice']
specialFeatures=['form', "lemma", 'upos', "tag2", "xpos", "ehead", 
					"id", "index", "head", "kids", "deprel", "deps", "span"]

shownfeatures=["form", "upos", "lemma"]; // redefined in readConll
// progressiveLoading = true; // false to make it load all trees at once (may overload the browser)
pngBtn = true;
svgBtn = true;
reverseMode = false; // set true for right to left conll
conlls = {	
	10: 	{"id": 0, 'form':1, "lemma": 2, 'upos': 3, "xpos":4, "feats":5, 
				"head":6, "deprel":7, "deps":8, "misc":9}, 
	14: 	{"id": 0, 'form':1, "lemma": 3, 'upos': 5, "head":9, "deprel":11}, 
	4: 	{'form':0, "lemma": 0, 'upos': 1, "head":2, "deprel":3} 
}
isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; // needed for bezier bounding box bug

currentS = null;
// drag & drop stuff:
droppables =[];
dragrepl = null;
dragcurve = null;
dragarrowhead = null;
dragsun = null;
draheader = -1;
const dragclickthreshold = 100; //ms
dragclicktime = 0;
// const delta = 6;
// let dragclickstartX;
// let dragclickstartY;

// debug:
log = console.log.bind(console);

// TODO: add lemmas and pos!!!
lemmaColor = '#006400';
posColor = '#9e04de';

// base 64 logo of arborator for the link image
base64Logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAXCAYAAABEQGxzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABtQAAAbUBnmWvHAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANXSURBVFiFtZhLbA1RGMd/59x7e5XeVrXU45aF9ztCLEQ3gojMwkZiJ7GYRDALhAUJa/FIZjk7EYKWCIMQG0qIx4JIQyREqxWP1uNyH729MxYzreu29zF3xj85mznf+X///8x3Zr4zwrZtqoWqaDXALKClggHwqYLx3jD1wWo1Ca+GVEWbAmwGFGAjECsWK22oyQkyYRsPWRLAbcAEbhim/tmLvooMqYq2HMeAAqwGZLk18USINb1RGjKSn1GLmpzgzOLfXrQBWMBjHHOmYerPyy0oakhVtGbgALANaPWioiEj2fGijmguT5mweThjkGdTsyTDlhe6fPQA54Fjhql/HStglCFV0WLAPmAvJcqpGOKJEOvej2P6r9CouZy0uT47TVdT1ittIRLASeCEYeqJ/Il/SkdVtJVAF3CEKswA1A0Kpv0ebQYgZAnaeqIs7A9XQ52PGI7GLlfzCEYMqYq2FegE4n4ytSRDiBLbsjEtaUyX3YKVIg50utoB15CqaBuBC0Ct3wxNqbGfTj7mDUSY9aN8XIWoBS64Hgj1PR1oBm5RZYkVYlDaLO6PlIyZkJV8q7Vf9dTnJAHcREAA66+du3laAvuBaQGQArDsS6TsN0cA44ZEDJgUVF4cD/sl0BYgKVfmphioLf1a7qvLca81PSPIvC7aJLAsSMZJaWk1pmVRR9+jFh3zkwwF9l74B0sk8C4AIgu4C+y2RHamgINjBaXDNu0LkiQj1fePZfAyDFwFllax2AIeABeBS4apfxyeeNd8uLVQck7A5Xkp+suUo090hoFTwE4q26A2jol2oMMw9b4icWeB9cCi4Qs3Z6forh/yJ7c0PgLHhW3bwx3CHWDiGIE28BDnSXQYpt5blloI8bbp0BNgJcD9eIb78Uxgyoto3GSY+u2RXk5VtFU4phrcgEf8NfHBa4a3kw8dwRZHXzZnMeekgpM+Gilgu2Hq7VDQnKqKthpYC7Qbpt7jJ8vryQdj3Q2i9/L8ZCwn/DCVxAdgi2Hqz4YveD7gVYpdm/dsBXkxK/8Lf9Fu+78YUhVtBfAECKxhc+H9POQXqqK14HzbgujRgjuxVgNV0SI4dT3FB42vfwq+T1oF2AC8ABqBeneMd4eFI/Yb8AXoA7qBNwT41+cPAlA7a3SX2xoAAAAASUVORK5CYII=';

svgIdIndex = 0;

// public initialisation function
this.ArboratorDraft = function(visuMode = 0, reverse = false) {
}

// public functions
// ArboratorDraft.prototype.emptyThenRefresh = function(content, reverse = false, toggle = false) {	
// 	if(reverse) reverseMode = true; // to set reverse or not
// 	if(toggle) reverseMode = !reverseMode; // to toggle reverse
// 	empty().done( refresh( content ) );
// }

ArboratorDraft.prototype.getSvg = function(strConll, usermatches, id, shof){
	shownfeatures=shof
	// log('usermatches', usermatches) // the one that we see
	var treedata = conllToTree(strConll.trim()); // treedata is object: {tree:tree, sentenceFeatures:sentencefeatures, sentence, svg:snap-object}
	treedata['svg'] = drawsnap(id, treedata, usermatches, shownfeatures);
	return treedata;
}

ArboratorDraft.prototype.getTree = function(strConll){
	return conllToTree(strConll.trim());
}

ArboratorDraft.prototype.setRel = function(rel){
	log('setRel START');
	log(rel);
	log('setRel END');
} 

ArboratorDraft.prototype.relationChanged = function(s, depid, headid, relation, addasextended){
	relationChanged(s, depid, headid, relation, addasextended);
}

ArboratorDraft.prototype.catChanged = function(s, depid, cat){
	catChanged(s, depid, cat);
}

ArboratorDraft.prototype.featureChanged = function(s, depid, cat){
	featureChanged(s, depid, cat);
}

ArboratorDraft.prototype.getConll = function (s) {
	// console.log("getConll s", s)
	return treeDataToConll(s.treedata)
}

ArboratorDraft.prototype.treeDataToConll = function(treedata) {
	var newconll=treeDataToConll(treedata);
	console.log("the new conll", newconll);
	return newconll;
}



// private functions


function refresh(idSVG, content) {
	// $('#svgwell').html('');
	// $('#svgwell').append( $("<conll></conll>").attr('id', 'transformhere').text( content ) );
	// var conll = d3.selectAll('#transformhere')['_groups'][0][0];
	log("_____refresh \n content",content);
	// drawConll(conll);
	listOfConlls = content.trim().split(/\n\s*\n\s*\n*/);	
	
	for (let singleConll of listOfConlls) { // for each conll tree at once, can block the browser
		var treedata = conllToTree(singleConll)
		console.log("refresh function",this);
		drawsnap(idSVG, treedata, usermatches, shownfeatures)
		}
	return;
}

function getlevel(i,gi,tree, idhead2level) {
	// recursive function determining the level of a dependency relation
	// log("__________getlevel",i,gi)
	if (gi != parseInt(gi)) return 0;
	if (idhead2level[i+'_'+gi]>0) return idhead2level[i+'_'+gi]; // already seen
	if (gi==0) return 0; // governor is root
	var intermlevs = [1];
	for (var ii = Math.min(i,gi)+1; ii < Math.max(i,gi); ii++) { // relation longer than one
		if (tree[ii]) var giis = [tree[ii]["head"]];
		else var giis = []
		giis = giis.concat(Object.keys(tree[ii]["deps"]));
		for (let gii of giis) {
			if (gii>=Math.min(i,gi) && gii<=Math.max(i,gi)) {
				if (idhead2level[ii+'_'+gii]>0) intermlevs.push(idhead2level[ii+'_'+gii]+1);
				else intermlevs.push(getlevel(ii, gii, tree, idhead2level)+1);
			}
			
		}
	}
	idhead2level[i+'_'+gi] = Math.max( ...intermlevs );
	return idhead2level[i+'_'+gi];
}


function dragging(dx, dy, posX, posY, event){
	// log("onmove",dx, dy, posX, posY,this, event,"translate("+posX+","+posY+")")
	this.transform("translate("+(dx-15)+","+(dy-30)+")").attr({"class":"gloss"});
	var x=this.midx;
	var y=this.topy;
	var cy = y+dy-Math.abs(dx)/2;
	if (cy<0) cy=0;
	var path = "M"+x+","+y+" C"+x+","+cy+" "+(x+dx)+","+cy+" "+(x+dx)+","+(y+dy);
	dragcurve.attr({d:path});
	dragarrowhead.transform("translate("+dx+","+dy+")")
	if (y+dy<leveldistance/2 && Math.abs(dx)<leveldistance/2) {if (dragsun==null) dragsun = this.paper.root.circle(x,0,leveldistance/2).attr("class", "dragcurve")}
	else {if(dragsun!=null) {dragsun.remove();dragsun=null}}
}

var startdrag = function(xx,yy,e) {
	// this.data('origTransform', this.transform().local );
	dragclicktime = new Date().getTime();
	log("-----------", this.attr("x"));
	dragrepl = this.clone();
	dragrepl.attr({class:"draghead"});
	this.attr({cursor: "move"});
	x=this.midx;
	y=this.topy;
	// 
	var path = "M"+x+","+y+" C"+x+","+(y-1)+" "+(x+1)+","+(y-1)+" "+(x+1)+","+y;
	// log("path",path)
	dragcurve = this.paper.root.path(path).attr({class:"dragcurve"});
	dragarrowhead = this.paper.root.path(arrowhead(x,y)).attr("class", "dragcurve");
	
	for (let dropa of droppables) 
		{ 
			if (dropa!=this) 
			{
				dropa.mouseover(
					function() {
						// console.log("Over the word", this.nr);
						dropa.attr({"class":"gloss"});
						draheader = this.nr
					});
				dropa.mouseout(
					function() {
						// console.log("out from the word", this.nr);
						dropa.attr({"class":'form'});
						draheader = -1
					});
				dropa.attr({cursor: "move"});
			}
		}
}


var stopdrag = function(e) {
	if(new Date().getTime() < dragclicktime + dragclickthreshold) {
		log("ccccclick", this);
		this.paper.root.treedata.triggerFeatureChange(this.paper, this, this.nr, this.feats, this.misc); 
	}
	this.animate({transform: "translate("+0+","+0+")"}, 300, mina.easein,
		function()
			{
				this.attr({"class":'form'});
				dragrepl.remove();
			}
		);
	for (let dropa of droppables) 
	{ 
		dropa.unmouseover();
		dropa.unmouseout();
		dropa.attr({cursor: "move", cursor: "grab", "class":'form'})
	}
	dragcurve.remove();
	dragarrowhead.remove();
	
	if (draheader!=this.nr &&( (draheader>=0 && this.nr != undefined) || dragsun!=null) )
	{
		nr = this.nr;
		if (dragsun) {draheader = nr; nr=0;}
		var oldRelation = this.paper.root.treedata.tree[draheader]['deprel'];	
		this.paper.root.treedata.triggerRelationChange(this.paper, this, nr, draheader, oldRelation);
	}
	if(dragsun!=null) {dragsun.remove(); dragsun=null}
	draheader=-1;
}

var categoryclick = function(e) {
	// log("categoryclick",e,this);
	this.attr({class:"catselected"})
	// log("categoryclick2",e,this);
	this.paper.root.treedata.triggerCategoryChange(this.paper, this, this.nr, this.cat); 
	// log("categoryclick3",e,this);
}

var relationclick = function(e) {
	// relationChanged(this.paper, this.nr, this.headid, this.relation+"kim" )
	// log("relationclickrelationclickrelationclick")
	this.attr({class:"deprelselected"})
	this.paper.root.treedata.triggerRelationChange(this.paper, this, this.headid, this.nr, this.relation); 
	
	// log("relationclick",e,this)
}

// var featureclick = function(e) {
// 	// relationChanged(this.paper, this.nr, this.headid, this.relation+"kim" )
// 	log("featureclickfeatureclickfeatureclickfeatureclick")
// 	this.attr({class:"deprelselected"})
// 	// this.paper.root.treedata.triggerRelationChange(this.paper, this, this.headid, this.nr, this.relation); 
	
// 	// log("relationclick",e,this)
// }



function relationChanged(s, depid, headid, relation, addasextended) {  // todo: maybe include adding of secondary governor!!!
	// called from ConllGraph.vue
	
	if (addasextended)
	{
		if (relation.trim()=="") delete s.root.treedata.tree[depid]['deps'][headid];
		else s.root.treedata.tree[depid]['deps'][headid]=relation;
	}
	else {
		if (relation.trim()=="") {headid="_",relation="_"}
		s.root.treedata.tree[depid]['head']=headid;
		s.root.treedata.tree[depid]['deprel']=relation;
	}
	s.paper.clear();
	drawsnap(s.id, s.root.treedata, {'nodes':[],'edges':[]}, shownfeatures)
}

function catChanged(s, depid, cat ) {  
	// called from ConllGraph.vue
	// console.log("BEFORE", JSON.parse(JSON.stringify(s.root.treedata.tree)));
	s.root.treedata.tree[depid]['upos']=cat;
	s.paper.clear();
	drawsnap(s.id, s.root.treedata, {'nodes':[],'edges':[]}, shownfeatures)
	// return s.root.treedata.tree
}
function featureChanged(s, depid, cat ) {  
	// called from ConllGraph.vue
	console.log("featureChanged", JSON.parse(JSON.stringify(s.root.treedata.tree)));
	// s.root.treedata.tree[depid]['upos']=cat;
	// s.paper.clear();
	// drawsnap(s.id, s.root.treedata, {'nodes':[],'edges':[]}, shownfeatures)
	// return s.root.treedata.tree
}


function drawsnap(idSVG, treedata, usermatches, shownfeatures) {
	///////////////////////////////////
	// draws json tree on svg in div //
	// idSVG is of pre-existing svg
	// treedata is an object containing .tree (relevant here), but also sentence and sentenceFeatures with one line per sentence feature: [ "# user_id = Marine", "# elan_id = P_WAZK_07_34 P_WAZK_07_35", … ]
	// usermatches is of the form edges: Array [], nodes: 20, 21]
	// shownfeatures todo!!!
	///////////////////////////////////
	var textgraphdistance = 10;
	log(999,treedata,999,shownfeatures)
	var textstarty = 10; // has to be bigger than arborator-draft.css deprel fontsize
	var runningy = textstarty;
	var s=Snap(document.getElementById(idSVG));
	droppables = [];
	leveldistance = parseInt(getComputedStyle(s.parent().node).getPropertyValue('--depLevelHeight'));
	var idhead2level = {};
	var levels = [];
	s.treedata = treedata;
	s.id = idSVG;
	var tree = treedata.tree;
	
	// insertion of texts
	var xpositions = [0];
	var allstexts = {};
	var feati = 0;
	for (let shofea of shownfeatures) { 
		stexts = [];
		ind = 0;
		for (var nr in tree) {
			var word = tree[nr];
			var sword = s.text(xpositions[ind], runningy, word[shofea]).attr({class:shofea});
			
			sword.nr = nr;
			sword.feats = word.feats;
			stexts.push(sword);
			if (feati==0) { // tokens
				sword.attr({cursor: "move", cursor: "grab"}).drag(dragging, startdrag, stopdrag); // dragging only the first line (normally the tokens)
				
				droppables.push(sword);
				if (word["head"]!=0) levels.push(getlevel(nr, word["head"], tree, idhead2level))
				else levels.push(2); // minimum height 2 for root relations
				for (var headid in word["deps"]) { // computation of tree depth. for each governor...
					if (tree[headid]) levels.push(getlevel(nr, headid, tree, idhead2level));
					// log(6666,idhead2level)	
				}
				// log('levels',levels)
			}
			if (shofea == 'upos') { // categories
				sword.attr({cursor: "pointer"}).click( categoryclick );
				sword.nr = nr;
				sword.cat =  word[shofea];
			}
			if ( usermatches.nodes.includes( nr.toString()) ) { // highlight matches
				sword.attr({class:"deprelselected"}).node.scrollIntoView()
			}
			sword.wordDistance = parseInt(getComputedStyle(sword.node).getPropertyValue('--wordDistance'));
			// log('sword.wordDistance',sword.wordDistance)
			nextx = Math.max(xpositions[ind+1] || 0, xpositions[ind]+sword.getBBox().w + sword.wordDistance);
			xpositions[ind+1]=nextx;
			// log("@@@@",shofea,ind+1,nextx,xpositions[ind+1] || 0, xpositions[ind+1], xpositions)
			// log(xpositions[ind],sword.getBBox().w, sword.wordDistance)
			ind += 1;
		};
		runningy += yWordDistance;
		allstexts[shofea]=stexts;
		feati += 1;
	}
	var maxlevel = Math.max(...levels);	
	var xmidpoints = [];
	var x2s = []; // right edge of all shown features
	var y2s = []; // bottom of all shown features
	var basey = textstarty+(maxlevel)*leveldistance-textgraphdistance;
	var firstTextFontSize = parseInt(getComputedStyle(allstexts[shownfeatures[0]][0].node).getPropertyValue('font-size'));

	// readjusting the position of texts
	for (let shofea of shownfeatures) {
		var ind = 0;
		for (var nr in tree) {
			
			var xmidpoint = xpositions[ind]+(xpositions[ind+1]-xpositions[ind])/2;
			// log(444,shofea,ind,allstexts[shofea][ind])
			xmidpoints.push(xmidpoint);
			allstexts[shofea][ind].midx=xmidpoint;
			allstexts[shofea][ind].attr({'x':  xmidpoint - allstexts[shofea][ind].getBBox().w/2});
			allstexts[shofea][ind].attr({'y': allstexts[shofea][ind].getBBox().y2+(maxlevel)*leveldistance});
			allstexts[shofea][ind].topy = allstexts[shofea][ind].getBBox().y;
			x2s.push(allstexts[shofea][ind].getBBox().x2); // maybe move out of loop?
			y2s.push(allstexts[shofea][ind].getBBox().y2);
			ind += 1;
		};
	}
	// drawing the dependency relations
	var ind = 0;
	for (var nr in tree) {
		var word = tree[nr];
		drawRelation(word["head"], word["deprel"], null, null, 0, tree, idhead2level, nr, basey, ind, 
			xmidpoints, firstTextFontSize, s, arrowhead, word, relationclick);
		var gap=0
		for (var headid in word["deps"]) { // for each governor of extended dependency
			gap=gap+arrowheadsize
			drawRelation(headid, word["deps"][headid], "xdep", "xdeprel", gap, tree, idhead2level, nr, basey, ind, 
				xmidpoints, firstTextFontSize, s, arrowhead, word, relationclick);
		}
		ind += 1;
	};
	// computing the total size of the graph
	var maxx2 = Math.max(...x2s);
	var maxy2 = Math.max(...y2s);
	s.attr("height", (maxy2)+"px");
	s.attr("width", (maxx2)+"px");
	svgHeight = s.attr('height').replace(/px/,'');
	return s;
}



function drawRelation(headid, relation, xdep, xdeprel, gap, tree, idhead2level, nr, basey, 
	ind, xmidpoints, firstTextFontSize, 
	s, arrowhead, word, relationclick) {

	if (headid in tree || headid == 0) // only existing governors
	{
		var xbasey = basey-gap;
		le = idhead2level[nr + '_' + headid];
		var controly = basey - le * leveldistance;
		var tox = headid > ind ? xmidpoints[headid - 1] - firstTextFontSize / 2 : xmidpoints[headid - 1] + firstTextFontSize / 2;
		var xmi = xmidpoints[ind];

		if (headid > 0)
			var path = "M" + xmi + "," + xbasey + " C" + xmi + "," + controly + " " + tox + "," + controly + " " + tox + "," + basey;
		else
			var path = "M" + xmi + "," + (xbasey) + " L" + xmi + "," + "0 ";
		var p = s.path(path).attr({ class: "curve" });
		var ah = s.path(arrowhead(xmi, xbasey)).attr("class", "arrowhead");
		var pbox = p.getBBox();
		var xmidf = pbox.x + (pbox.w) / 2;
		var srel = s.text(xmidf, pbox.y - 2, relation).attr({ class: "deprel" }).click(relationclick);
		if(xdep) 
		{	
			srel.attr({ class: xdeprel });
			p.attr({ class: xdep });
			ah.attr({ class: xdep });
		}
		srel.nr = nr;
		srel.headid = headid;
		srel.relation = relation;
		if (headid == 0)
			srel.attr({ 'y': firstTextFontSize });
		else
			srel.attr({ 'x': xmidf - srel.getBBox().w / 2 });
	}
}




function arrowhead(x,y) {
	// gives path for arrowhead x,y startpoint (end of arrow)
	// var 
	var startpoint = x+","+y; // to move the arrowhead lower: (y+arrowheadsize/3);
	var lefttop = "0,0" +(-arrowheadsize/2)+","+(-arrowheadsize*1.5)+" "+(-arrowheadsize/2)+","+(-arrowheadsize*1.5);
	var righttop = (arrowheadsize/2)+"," +(arrowheadsize/2)+" "+(arrowheadsize/2)+"," +(arrowheadsize/2)+ " "+(arrowheadsize)+",0";
	var arrowPath = "M"+ startpoint+"c"+lefttop+ "c"+righttop+ "z";
	return arrowPath;
}




function treeDataToConll(treedata) {
	// constructs a conll string from the current treedata
	log('treeDataToConll',treedata)
	var conlines=[];
	for (let a in treedata.sentenceFeatures){
		var v = treedata.sentenceFeatures[a];
		if (v!=null) conlines.push("# "+a+" = "+v); // +'\n'
		else conlines.push("# "+a)
	}
	// conlines=treedata.sentenceFeatures[0].slice();
	// conlines=[];
	// log('conllstr',conlines)
	for (let nr in treedata.tree){
		var node = treedata.tree[nr];
		conlines.push(
			[
				nr,
				(node['form']||'_'),
				(node['lemma']||'_'),
				(node['upos']||'_'),
				(node['xpos']||'_'),
				makeFeaturestring(node['feats'], '=', '|'),
				(node['head'] == parseInt(node['head']) ? node['head'] : '_' ),
				(node['deprel']||'_'),
				makeFeaturestring(node['deps'], ':', '|'), 
				makeFeaturestring(node['misc'], '=', '|')
			].join("\t"))
	};
	conllstr=conlines.join("\n")
	// log(454565546456,'conllstr',conllstr)
	return conllstr


}

function conllToTree(treeline) {
	// takes a conll representation of a single tree as input
	// returns object: {tree:tree, sentenceFeatures:sentencefeatures, sentence}

	// treeline = "# text Er arbeitet fürs FBI (deutsch etwa: „Bundesamt für Ermittlung“).\n"+treeline
	// log("treeline",treeline)
	var nodes = treeline.split('\n');
	if(reverseMode) nodes.reverse();
	// nodes = nodes.reverse();
	var tree={};
	var sentenceFeatures={}; // sentence features before the actual conll
	var addLines={}; // node position to additional line
	var lastid=0;
	var skipuntil=0;
	var words=[]
	nodes.forEach(function (nodeline, id) 
	{ // for each conll line:
		// var nodeline=$.trim(nodeline);
		nodeline=nodeline.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		if (nodeline.charAt(0) == "#") 
		{
			var [a,v] = nodeline.substring(1).trim().split("=")
			if (v!=null) var [a,v]=[a.trim(),v.trim()]
			sentenceFeatures[a]=v
			return true;
		}
		var elements = nodeline.split('\t');
		el=elements.length;
		if(el > 1)
		{
			if (!(el in conlls) && el>10) el=10;
			if (el > 4) id=elements[conlls[el]["id"]];
			else if (elements[conlls[el]['form']] != "_") id++;
			var t=elements[conlls[el]['form']];
			// log(777,elements,'form',conlls[el],t)
			var tokids=id.split("-")
			if (tokids.length == 1) { // simple token
				tree[id]={};
				tree[id]["id"]=id;
				tree[id]['form']=t;
				tree[id]["lemma"]=elements[conlls[el]["lemma"]];
				tree[id]['upos']=elements[conlls[el]['upos']];
				tree[id]['head']=parseInt(elements[conlls[el]['head']]);
				tree[id]['deprel']=elements[conlls[el]['deprel']];
				tree[id]["feats"]={};
				tree[id]["deps"]={};	
				tree[id]["misc"]={};

				if (id>skipuntil) words.push(t);
				if (el==10) {
					
					tree[id]["xpos"] =elements[conlls[el]["xpos"]];
					tree[id]["feats"] =	analyzeFeaturestring(elements[conlls[el]["feats"]], '=', '|');
					tree[id]["deps"] =	analyzeFeaturestring(elements[conlls[el]["deps"]], ':', '|');
					tree[id]["misc"] =	analyzeFeaturestring(elements[conlls[el]["misc"]], '=', '|');

				}
				else if (tokids.length == 2){ // n-m type multi-word encoding
					skipuntil = parseInt(tokids[1])
					words.push(elements[conlls[el]['form']]);
					if (!(lastid in uextra)) uextra[lastid]=[];
					uextra[lastid].push(nodeline);
				}
				else {
					if (!(lastid in uextra)) uextra[lastid]=[];
					uextra[lastid].push(nodeline);
				}
			}
			else  { // bizarre token id
				if (!(lastid in addLines)) addLines[lastid]=[];
				addLines[lastid].push(nodeline);
				if (tokids.length == 2){ // n-m type multi-word encoding
					skipuntil = parseInt(tokids[1])
					words.push(elements[conlls[el]['form']]);
				}
				tree[id]['head']=parseInt(elements[conlls[el]['head']]); // todo: think about this
				tree[id]['deprel']=elements[conlls[el]['deprel']];
			}
			
			lastid=id;
		}//end if el >1
	});	
	var sentence = [];
	if ("text" in sentenceFeatures) return {tree:tree, sentenceFeatures:sentenceFeatures, sentence:sentenceFeatures["text"]};
	// got to contstruct the sentence
	words.forEach(function (word, i) {
		sentence.push(word);
		if (!("NoSpaceAfter" in tree[i+1]["misc"] && tree[i+1]["misc"]=="No" )) sentence.push(" ");
		// if(!reverseMode){
		// 	if (i+1 in tree && !(("NoSpaceAfter" in tree[i+1]) && tree[i+1]["NoSpaceAfter"]==false)) sentence.push(" ");
		// } else{ sentence.push(word); }
	});
	return {tree:tree, sentenceFeatures:sentenceFeatures, sentence:sentence.join('')};
}

function analyzeFeaturestring(featstr, eq, spl) {
	o={}
	if (featstr.indexOf(eq) > -1){
		featstr.split(spl).forEach(function (f) // for each feature:
		{
			var fs=f.split(eq)
			if (fs.length >=2) {// if it's not just _
				o[fs[0]]=fs.slice(1).join(eq);
			}
		});
	}
	return o;
}

function makeFeaturestring(feato, eq, spl) {
	strs=[];
	for (k in feato)
	{
		strs.push(k+eq+feato[k])
	}
	str=strs.join(spl);
	return str||'_'
}

}());

