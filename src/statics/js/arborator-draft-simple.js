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

var drag = d3.drag();

// global variables:
fontSize = 0; // computed from css value for .token in arborator-draft.css
lemmaHeight = 0;
posHeight = 0;
svgDefaultHeight = 500;
el=10; // type of conll (10, 14, or 4), computed in conllNodesToTree
trees=[]; // list of tree objects
uextras=[]; // list of comments. each comment is a hashtable position(=line)->comment TODO: add this to the display
conlltrees=[]; // list of conll strings
defaultCat="_"
shownfeatures=["t", "cat", "lemma","gloss"]; // recomputed in readConll
progressiveLoading = true; // false to make it load all trees at once (may overload the browser)
pngBtn = true;
svgBtn = true;
reverseMode = false; // set true for right to left conll
conlls = {	
	10: 	{"id": 0, "t":1, "lemma": 2, "cat": 3, "xpos":4, "morph":5, "gov":6, "func":7, "xgov":8, "gloss":9}, 
	14: 	{"id": 0, "t":1, "lemma": 3, "cat": 5, "gov":9, "func":11}, 
	4: 	{"t":0, "lemma": 0, "cat": 1, "gov":2, "func":3} 
}
isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; // needed for bezier bounding box bug

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
	// main function called from html file
	// if(reverse) reverseMode = true;
	// if(visuMode==0){
	// 	$( ".expander" ).click(function(){
	// 		log(99,$(this).next('conll'));
	// 		$(this).next('conll').toggle();});    
	// 	readConll();
	// }else{
	// 	console.log('[ArboratorDraft] visumode');
	// 	trees=[]; 
	// 	uextras=[]; 
	// 	conlltrees=[]; 
	// 	$('conll').hide();
	// 	refresh( $('#conllarea').text() );
	// }
}

// public function
ArboratorDraft.prototype.emptyThenRefresh = function(content, reverse = false, toggle = false) {	
	if(reverse) reverseMode = true; // to set reverse or not
	if(toggle) reverseMode = !reverseMode; // to toggle reverse
	empty().done( refresh( content ) );
}

ArboratorDraft.prototype.getSvg = function(strConll, id){
	var tree = conllNodesToTree(strConll);
	// console.log('tree final', tree);
	tree['svg'] = draw(tree.tree, id);
	return tree;
}

ArboratorDraft.prototype.getTree = function(strConll){
	return conllNodesToTree(strConll);
}


function conllNodesToTree(treeline) {
	// reads a conll representation of a single tree TODO: replace jquery by d3
	
	var nodes = treeline.split('\n');
	if(reverseMode)nodes.reverse();
	// nodes = nodes.reverse();
	var tree={};
	var uextra={};
	var lastid=0;
	var skipuntil=0;
	var words=[]
	$.each(nodes, function(id,nodeline){ // for each conll line:
		var nodeline=$.trim(nodeline);
		if (nodeline.charAt(0) == "#") {
			if (!(lastid in uextra)) uextra[lastid]=[];
			uextra[lastid].push(nodeline)
			return true;
		}
		var elements = nodeline.split('\t');
		el=elements.length;

		if(el > 1){
		if (!(el in conlls) && el>10) el=10;
		if (el > 4) id=elements[conlls[el]["id"]];
		else if (elements[conlls[el]["t"]] != "_") id++;
		if (lastid!=id) // needed for the arborator encoding of multiple govs
		{
			var t=elements[conlls[el]["t"]];
			var tokids=id.split("-")
			if (tokids.length == 1) {
				tree[id]={}
				tree[id]["gov"]={};
				tree[id]["t"]=t;
				tree[id]["id"]=id;
				tree[id]["lemma"]=elements[conlls[el]["lemma"]];
				tree[id]["cat"]=elements[conlls[el]["cat"]];
				if (id>skipuntil) words.push(t);
				if (el==10) {
					tree[id]["xpos"]=elements[conlls[el]["xpos"]];
					tree[id]["morph"]=elements[conlls[el]["morph"]];
					tree[id]["gloss"]=elements[conlls[el]["gloss"]];
					if (tree[id]["gloss"]=="SpaceAfter=No"){
						tree[id]["gloss"]="_";
						tree[id]["NoSpaceAfter"]=false;
					}
					var xgov = elements[conlls[el]["xgov"]];
					if (xgov.indexOf(':') > -1){
						var xgovs=xgov.split("|");
						$.each(xgovs, function(ind,xg){ 
							// for each extra governor line:
							var xgs=xg.split(":")
							if (xgs.length >=2) {
								// if it's not just _
								var gov=xgs[0];
								var func= xgs.slice(1).join(":");
								tree[id]["gov"][gov]=func;
							}
						});
					}
				}
			}
			else if (tokids.length == 2){
				skipuntil = parseInt(tokids[1])
				words.push(elements[conlls[el]["t"]]);
				if (!(lastid in uextra)) uextra[lastid]=[];
				uextra[lastid].push(nodeline)
			}
			else {
				if (!(lastid in uextra)) uextra[lastid]=[];
				uextra[lastid].push(nodeline)
			}
		}
		
		gov = elements[conlls[el]["gov"]];
		if (gov!="" && gov!="_") 
		{
			if (gov==-1)
			{
				gov = elements[conlls[el]["gov"]+1];
			}
			var func = elements[conlls[el]["func"]];
			if (func.indexOf('::') !== -1) 
				{	
					var stydic = func.substring(func.indexOf("::") + 1);
					func = func.split("::")[0];
					if (stydic!="") funcDic[func] = $.parseJSON(stydic);
					$('#styleconllcheck').prop('checked', true);
				};
			tree[id]["gov"][gov]=func;
			
		}
		lastid=id;

	}//end if el >1
		});
	
	
	// var sentence="";
	var sentence = [];
	words.forEach(function (word, i) {
		sentence.push(word);
		// if(!reverseMode){
		// 	if (i+1 in tree && !(("NoSpaceAfter" in tree[i+1]) && tree[i+1]["NoSpaceAfter"]==false)) sentence.push(" ");
		// }else{
			// sentence.push(word);

		// }
		
	});
	// return {tree:tree, uextra:uextra, sentence:sentence};
	return {tree:tree, uextra:uextra, sentence:sentence.join(' ')};
}


function getSVGPath(startPoint,endPoint,computedStyle) {
	// startPoint and endPoint are objects for the corresponding nodes
	
	var tokDepDist = parseInt(computedStyle.getPropertyValue('--tokDepDist'));
	var depMinHeight = parseInt(computedStyle.getPropertyValue('--depMinHeight'));
	var wordDistanceFactor = parseInt(computedStyle.getPropertyValue('--wordDistanceFactor'));
	if(reverseMode) wordDistanceFactor = -Math.abs(wordDistanceFactor);
	var startOffset = parseInt(computedStyle.getPropertyValue('--startOffset'));
	if(reverseMode) startOffset = -Math.abs(startOffset);
	var startOff=(startPoint['id']-endPoint['id']>0)?-startOffset:startOffset
	var x1 = startPoint['x']+startPoint['w']/2+startOff;
	var x2 = endPoint['x']+endPoint['w']/2;
	var y1 = svgDefaultHeight-fontSize*2;
	var y2 = svgDefaultHeight-fontSize*2;
	var x1x2=Math.abs(x1-x2)/2;		
	var yy = Math.max(y1-x1x2-wordDistanceFactor*Math.abs(endPoint['id']-startPoint['id']),-tokDepDist);
	var yy = Math.min(yy,y1)-depMinHeight;
	var cstr="M"+x1+","+y1+" C"+x1+","+yy+" "+x2+","+yy+" "+x2+","+(y2-2); // -2 so that the arrow is really pointed
	//(x0,y0) is start point; (x1,y1),(x2,y2) is control points; (x3,y3) is end point.
	return {cstr:cstr,  x0:x1,y0:y1,  x1:x1,y1:yy,  x2:x2,y2:yy,x3:x2,y3:(y2-2)};
}


function arrowhead(x,y) {
	// gives path for arrowhead x,y startpoint (end of arrow)
	var size = 5;
	var startpoint = x+","+y; // to move the arrowhead lower: (y+size/3);
	var lefttop = "0,0" +(-size/2)+","+(-size*1.5)+" "+(-size/2)+","+(-size*1.5);
	var righttop = (size/2)+"," +(size/2)+" "+(size/2)+"," +(size/2)+ " "+(size)+",0";
	var arrowPath = "M"+ startpoint+"c"+lefttop+ "c"+righttop+ "z";
	return arrowPath;
}


function draw(tree, id) {
	// draws json tree on svg in div
	
	// var div = jQuery('<div/>', {
	// 	id: 'some-id',
	// 	"class": 'some-class',
	// 	title: 'now this div has a title!'
	// });
	// console.log('div', div, $('conll'));
	div = d3.select(id);
	// var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
	// var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	// var svg = document.createElementNS(d3.namespaces.svg, "svg");
	// var a = document.createElement("div");
	// var div = d3.select(a);

	var runningWidth = 0;
	var smallestY = svgDefaultHeight;
	var treeArray = $.map(tree, function(value, index) {return [value];});
	var svg = div.append("svg:svg")
	
	svg.attr("width",  1000)
	.attr("height", svgDefaultHeight);
	var group = svg.append("g");
	// write tokens:
	if(reverseMode) treeArray.reverse();
	var eachTexts = group.selectAll("text")
		.data(treeArray)
		.enter();


		var runningWidth2 = 0;

	eachTexts.append('text')
		.attr("class", "token")
		.text(function(d){return d["t"];})
		.attr("id",function(d) {return d["id"];})
		.attr("x", function(d) {
			var w = this.getComputedTextLength();
			wordDistance = parseInt(getComputedStyle(this).getPropertyValue('--wordDistance'));
			var x = runningWidth; //<-- previous length to return
			runningWidth += w + wordDistance; //<-- total
			tree[d["id"]]["x"]=x;
			tree[d["id"]]["w"]=w;
			fontSize = parseInt(getComputedStyle(this).fontSize, 10);
			return x;
		})
		.attr("y", svgDefaultHeight-fontSize);	
		
	svg.attr("width", runningWidth); // adapt svg width

	// draw dependency links
	group.selectAll("text").each(function(d) { // for each token:
		var txt = d3.select(this); 
		for (var govid in tree[d3.select(this).attr("id")]["gov"]) { // for each governor
			x=tree[txt.attr("id")]['x']+tree[txt.attr("id")]['w']/2;
			var ligneDep = group.append("path")
			.attr("class", "curve")
			.attr("d", function (dd) {
				if (govid==0) // sentence root:
				{
					var y=svgDefaultHeight-fontSize*2;
					return "M"+x+","+(y-2)+"L"+x+","+0; // -2 so that the arrow is really pointed
				}
				else // normal link:
				{	
					pathInfo=getSVGPath(tree[govid],tree[txt.attr("id")], getComputedStyle(this))
					return pathInfo.cstr ;
				}
				
			});
			group.append("path")
			.attr("class", "arrowhead")
			.attr("d", function (dd) {
				return arrowhead(x, svgDefaultHeight - fontSize*2);
			});
			var label=tree[d3.select(this).attr("id")]["gov"][govid];
			var depLineBbox=ligneDep.node().getBBox();
			
			// TODO: move the "root" label to a good position! (possibly to a group that has to be transformed separately!)
			// TODO: handle mutliple governors!
			if (govid!=0) // normal link:
			{
				group.append('text') 
				.attr("class", "deprel")
				.text(function(d){return label})
				.attr("x", function(d) {
					relFontSize = parseInt(getComputedStyle(this).fontSize, 10);
					var w = this.getComputedTextLength(); //<-- length of this node
					return depLineBbox.x + depLineBbox.width/2 - w/2})
				.attr("y", function(d) {
						funcCurveDist = parseInt(getComputedStyle(this).getPropertyValue('--funcCurveDist'));
						if (isFirefox)
						{
							// firefox needs: stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve
							const {x0, y0, x1, y1, x2, y2, x3, y3} = pathInfo // firefox
							y = bezierMinMax(x0, y0, x1, y1, x2, y2, x3, y3).min.y-funcCurveDist;
							return y; // firefox
						}
						else 
						{
							// standard Chrome etc
							y = depLineBbox.y-funcCurveDist
							return y; 
						}
					})
				// if not root, check how high we got:
				var smallY = y-relFontSize
				smallestY = smallY < smallestY ? smallY : smallestY;
				
			}
		}

	});	


	// write lemmas
	eachTexts.append('text')
		.attr("class", "lemma")
		.text(function(d){return d["lemma"];})
		.attr("id",function(d) {return d["id"];})
		.attr("x", function(d) {
			var lemmaLength = this.getComputedTextLength();
			var w = tree[d["id"]]["w"];
			wordDistance = parseInt(getComputedStyle(this).getPropertyValue('--wordDistance'));
			var x = tree[d["id"]]["x"] ; //<-- previous length to return
			lemmaHeight = parseInt(getComputedStyle(this).fontSize, 20);
			return x;
		})
		.attr("y", svgDefaultHeight-fontSize+lemmaHeight);

	// write pos
	eachTexts.append('text')
		.attr("class", "postag")
		.text(function(d){return d["cat"];})
		.attr("id",function(d) {return d["id"];})
		.attr("x", function(d) {
			var posLength = this.getComputedTextLength();
			var w = tree[d["id"]]["w"];
			wordDistance = parseInt(getComputedStyle(this).getPropertyValue('--wordDistance'));
			if(posLength>w+10){
				var x = tree[d["id"]]["x"] - posLength/3 ; //<-- previous length to return
			}else{
				var x = tree[d["id"]]["x"] ; //<-- previous length to return
			}
			posHeight = parseInt(getComputedStyle(this).fontSize, 20);
			return x;
		})
		.attr("y", svgDefaultHeight-fontSize+lemmaHeight+posHeight);


	group.attr("transform", "translate(" + 0 + "," + (-smallestY) + ")");
	svg.attr("height", svgDefaultHeight-smallestY+posHeight+lemmaHeight+fontSize); // adapt svg height

	// svg.attr("id", "svg"+svgIdIndex);
	svg.attr("version", '1.1'); // to prepare ddl of svg
	svg.attr("xmlns", "http://www.w3.org/2000/svg"); // to prepare ddl of svg

	return svg;
}


//(x0,y0) is start point; (x1,y1),(x2,y2) is control points; (x3,y3) is end point.
function bezierMinMax(x0, y0, x1, y1, x2, y2, x3, y3) {
    var tvalues = [], xvalues = [], yvalues = [],
        a, b, c, t, t1, t2, b2ac, sqrtb2ac;
    for (var i = 0; i < 2; ++i) {
        if (i == 0) {
            b = 6 * x0 - 12 * x1 + 6 * x2;
            a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
            c = 3 * x1 - 3 * x0;
        } else {
            b = 6 * y0 - 12 * y1 + 6 * y2;
            a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
            c = 3 * y1 - 3 * y0;
        }
        if (Math.abs(a) < 1e-12) {
            if (Math.abs(b) < 1e-12) {
                continue;
            }
            t = -c / b;
            if (0 < t && t < 1) {
                tvalues.push(t);
            }
            continue;
        }
        b2ac = b * b - 4 * c * a;
        if (b2ac < 0) {
            continue;
        }
        sqrtb2ac = Math.sqrt(b2ac);
        t1 = (-b + sqrtb2ac) / (2 * a);
        if (0 < t1 && t1 < 1) {
            tvalues.push(t1);
        }
        t2 = (-b - sqrtb2ac) / (2 * a);
        if (0 < t2 && t2 < 1) {
            tvalues.push(t2);
        }
    }

    var j = tvalues.length, mt;
    while (j--) {
        t = tvalues[j];
        mt = 1 - t;
        xvalues[j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
        yvalues[j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
    }

    xvalues.push(x0,x3);
    yvalues.push(y0,y3);

    return {
        min: {x: Math.min.apply(0, xvalues), y: Math.min.apply(0, yvalues)},
        max: {x: Math.max.apply(0, xvalues), y: Math.max.apply(0, yvalues)}
    };
}




}());
