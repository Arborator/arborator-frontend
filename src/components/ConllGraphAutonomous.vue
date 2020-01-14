<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id"></svg>

      <q-dialog        
        v-model="relDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangerel()"
      >
        <q-card style="height:300px">
          <q-bar class="bg-primary text-white">
                <div class="text-weight-bold">Select a relation</div>
                <q-space />
                <q-btn flat dense icon="close" v-close-popup/>
            </q-bar>

          <q-card-section style="height:200px">
            <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist" :class="$q.dark.isActive?'vs-dark':'vs-light'" style="float:left; display:inline;width:150px;"></v-select>
          </q-card-section>
            <q-space />
            <q-card-actions >
              <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 45%; margin-left: auto;margin-right: auto;" />
              <q-btn color="primary" @click="onchangerel()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog        
        v-model="catDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangecat()"
      >
        <q-card  style="height:300px">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">Select a category</div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
          <q-card-section style="height:200px">
            <q-select
                filled
                v-model="infos.category"
                :options="options.cats"
                label="Category"
                style="width: 250px"
              />
            </q-card-section>
         
          <q-separator/>
          <q-card-actions>
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onchangecat()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />

          </q-card-actions>
        </q-card>
      </q-dialog>



    </div>

    <!-- <div :id="id" v-html="svgContent"></div> -->
</template>

<script>
import Vue from 'vue';
Vue.config.ignoredElements = ['conll'];
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import api from '../boot/backend-api';

Vue.component('v-select', vSelect);

log = console.log.bind(console);

export default {
    name:'conllGraph',
    props: ['conll', 'user', 'sentenceId', 'matches'],
    data(){
        return {
            draft: new ArboratorDraft(),
            id: this.user+'_'+this.sentenceId.replace(/\W/g, ''),
            svgContent: '',
            loading: true,
            infos: {
                relation: [],
                category: null
            },
            options: {
                relations:[["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos", ":obj", ":obl"],["@agent", "@appos", "@caus", "@expl", "@fixed", "@lvc","@pass", "@relcl", "@tense","@x"]],
		        cats:["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"],
            },
            relDialog: false,
            catDialog: false,
            maximizedToggle: false,
            snapInfos: {
              s:null,
              snaprelation:null,
              snapcat:null,
              depid:null,
              govid:null,
              relation:'',
              relations: [],
              category:null
            },
            yWordDistance: 20,
            // global variables:
            fontSize: 0, // computed from css value for .token in arborator-draft.css
            lemmaHeight: 0,
            maxLevelDistance: 33, // the maximum distance between one dependency relation and the next higher one
            posHeight: 0,
            svgDefaultHeight: 500,
            svgHeight: 0,
            el:10, // type of conll (10, 14, or 4), computed in conllNodesToTree
            trees:[], // list of tree objects
            uextras:[], // list of comments. each comment is a hashtable position(=line)->comment TODO: add this to the display
            conlltrees:[], // list of conll strings
            defaultCat:"_",
            catFeatureName:'cat',
            shownfeatures:["t", "cat", "lemma","gloss"], // recomputed in readConll
            // progressiveLoading = true; // false to make it load all trees at once (may overload the browser)
            pngBtn:true,
            svgBtn:true,
            reverseMode:false, // set true for right to left conll
            conlls:{	
              10: 	{"id": 0, "t":1, "lemma": 2, "cat": 3, "xpos":4, "morph":5, "gov":6, "func":7, "xgov":8, "gloss":9}, 
              14: 	{"id": 0, "t":1, "lemma": 3, "cat": 5, "gov":9, "func":11}, 
              4: 	{"t":0, "lemma": 0, "cat": 1, "gov":2, "func":3} 
            },
            isFirefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1, // needed for bezier bounding box bug
            currentS:null,
            // drag & drop stuff:
            droppables:[],
            dragrepl:null,
            dragcurve:null,
            dragarrowhead:null,
            dragsun:null,
            dragover:-1,
            // TODO: add lemmas and pos!!!
            lemmaColor:'#006400',
            posColor:'#9e04de',
            svgIdIndex: 0
        }
    },
    mounted(){
        // var svg=this.start(this.conll, this.matches, this.id, this.user);
        var svg=this.startnew(this.conll, this.matches, this.id, this.user);

    },
    methods: {
       // ########### component methods #########
        up(dirty, redo) {
          // console.log(svg.tree)
          // console.log("NOW"); // when I open a sentence, when I click on OK after editing a category or a relation;
          // console.log("gonna emit ", this.draft, this.id);
          // console.log('conll', this.draft.getConll(this.snapInfos.s));
          // console.log(this.snapInfos.s.treedata);
          if(this.snapInfos.s != null){
            this.$emit('update-conll', {'draft': this.draft, 'svgid': this.id, 'dirty': dirty, 'redo': redo, 
            'conll': this.draft.getConll(this.snapInfos.s), 'user': this.user}); //emits to parent the id of the tree and a bunch of other stuff
          }
          },
        start(conllStr, matches, id){
            // document.getElementById(id) the 
            console.log('start matches', matches)
            if (this.user in matches) var usermatch = matches[this.user];
            else var usermatch = {'nodes':[],'edges':[]};
            var svg = this.draft.getSvg(conllStr, usermatch, id); // here is the conllstr
            this.loading = false;
            svg.toggleRelDialog  = this.toggleRelDialog;
            svg.toggleCatDialog  = this.toggleCatDialog;
            svg.selectRel = this.selectRel; // update le svg avec les infos de this
            svg.selectCat = this.selectCat;
            svg.triggerRelationChange = this.triggerRelationChange;
            svg.triggerCategoryChange = this.triggerCategoryChange;
            this.up(false, false);
            return svg
        },
        startnew(conllStr, matches, id){
            if (this.user in matches) var usermatch = matches[this.user];
            else var usermatch = {'nodes':[],'edges':[]};
            var treedata = this.conllNodesToTree(conllStr.trim()); // treedata is object: {tree:tree, uextra:sentencefeatures, sentence, svg:snap-object}
	          treedata['svg'] = this.drawsnap(id, treedata, usermatch, this.shownfeatures);
            this.loading = false;
            this.up(false, false);
            return treedata
        },
        toggleRelDialog() {
            this.relDialog = !this.relDialog;
        },
         toggleCatDialog() {
            this.catDialog = !this.catDialog;
        },
        selectRel(currentRelation) {
            this.infos.relation = content;
        },
        selectCat(content) {
            this.infos.category = content;
        },
        // sendSelectedRel(){
        //     var relationStr = this.infos.relation.join("");
        //     this.draft.setRel(relationStr);
        // },
        triggerRelationChange(s, snaprelation, govid, depid, relation){
          // called from snap
          // snaprelation.attr({class:"deprelselected"});
          // relation="qsdwf:zsert@swxcv";
          const splitters = /[:@]/g  // à mettre comme paramètre
          var splitIndeces = [...relation.matchAll(splitters)].map(x => x.index)
          var listRel = [];
          var lasti = 0
          for (let i of splitIndeces)
            { 
              listRel.push(relation.substring(lasti,i)); 
              lasti=i;
            }
          listRel.push(relation.substring(lasti)); 
          console.log("here", depid, govid, relation);
          this.snapInfos = {s:s, snaprelation:snaprelation, depid:depid, govid:govid, relation:relation, relations: listRel};
          this.infos.relation = listRel;
          this.relDialog = !this.relDialog;
        },
        triggerCategoryChange(s, snapcat, depid, category){
          // called from snap
          // snapcat.attr({class:"catselected"});
          // relation="qsdwf:zsert@swxcv";
          this.snapInfos = {s:s, snapcat:snapcat, depid:depid, category:category};
          this.infos.category = category;
          // console.log("triggerCategoryChange1")

          this.catDialog = !this.catDialog;
          // console.log("triggerCategoryChange2")
        },
        onchangerel(){
          this.relDialog = !this.relDialog;
          this.draft.relationChanged(this.snapInfos.s, this.snapInfos.depid, this.snapInfos.govid, this.infos.relation.join(""));
          this.up(true, false);
        },
        onchangecat(){
          this.catDialog = !this.catDialog;
          this.draft.catChanged(this.snapInfos.s, this.snapInfos.depid, this.infos.category);
          this.up(true, false);
        },
        ondialoghide(){
          if ('snaprelation' in this.snapInfos) this.snapInfos.snaprelation.attr({class:"deprel"});
          if ('snapcat' in this.snapInfos) this.snapInfos.snapcat.attr({class:"cat"});
        },
        
        // ###################################@#
        // ############## snap access ###########
        // #####################################

        emptyThenRefresh (content, reverse = false, toggle = false) {	
          if(reverse) reverseMode = true; // to set reverse or not
          if(toggle) reverseMode = !reverseMode; // to toggle reverse
          empty().done( refresh( content ) );
        },

        getSvg (strConll, usermatches, id){
          // log('usermatches', usermatches) // the one that we see
          var treedata = conllNodesToTree(strConll.trim()); // treedata is object: {tree:tree, uextra:sentencefeatures, sentence, svg:snap-object}
          treedata['svg'] = drawsnap(id, treedata, usermatches, shownfeatures);
          // tree['svg'] = draw(tree.tree, id);
          return treedata;
        },

        getTree (strConll){
          log('getTree conll', strConll)
          // log( conllNodesToTree(strConll));
          return conllNodesToTree(strConll.trim());
        },
        
        // ###################################@#
        // ############## snap utils ###########
        // #####################################

        refresh(idSVG, content) {
          // $('#svgwell').html('');
          // $('#svgwell').append( $("<conll></conll>").attr('id', 'transformhere').text( content ) );
          // var conll = d3.selectAll('#transformhere')['_groups'][0][0];
          log("_____refresh \n content",content);
          // drawConll(conll);
          listOfConlls = content.trim().split(/\n\s*\n\s*\n*/);
          for (let singleConll of listOfConlls) { // for each conll tree at once, can block the browser
            var treedata = this.conllNodesToTree(singleConll)
            // console.log("refresh function",this);
            this.drawsnap(idSVG, treedata, usermatches, shownfeatures)
          }
          return;
        },
        level(i,gi,tree, idgov2level) {
          // recursive function determining the level of a dependency relation
          // log("__________level",i,gi)
          if (idgov2level[i+'_'+gi]>0) return idgov2level[i+'_'+gi];
          if (gi==0) return 0;
          var intermlevs = [1];
          let minIGI = Math.min(i,gi); let maxIGI = Math.max(i,gi);
          for (var ii = minIGI+1; ii < maxIGI; ii++) {
            if (tree[ii])
              for (var gii in tree[ii]["gov"]) {
                if (gii>=minIGI && gii<=maxIGI) {
                  if (idgov2level[ii+'_'+gii]>0) intermlevs.push(idgov2level[ii+'_'+gii]+1);
                  else intermlevs.push(this.level(ii, gii, tree, idgov2level)+1);
                }
              }
          }
          idgov2level[i+'_'+gi] = Math.max( ...intermlevs );
          // log("__________level",i,gi,'returns',idgov2level[i+'_'+gi])
          return idgov2level[i+'_'+gi];
        },
        dragging(dx, dy, posX, posY, event){
          // log("onmove",posX, posY,this,dx, dy, posX, posY, event,"translate("+posX+","+posY+")")
          this.transform("translate("+(dx-15)+","+(dy-30)+")").attr({"class":"gloss"});
          x=this.midx;
          y=this.topy;
          var path = "M"+x+","+y+" C"+x+","+(y-Math.abs(dx)/2)+" "+(x+dx)+","+(y-Math.abs(dx)/2)+" "+(x+dx)+","+(y+dy);
          dragcurve.attr({d:path});
          dragarrowhead.transform("translate("+dx+","+dy+")")
          // log(dragsun)
          if (y+dy<100) {if (dragsun==null) dragsun = this.paper.root.circle(x,0,svgHeight/4).attr("class", "dragcurve")}
          else {if(dragsun!=null) {dragsun.remove();dragsun=null}}
        },
        startdrag (xx,yy,e) {
          // this.data('origTransform', this.transform().local );
          dragrepl = this.clone();
          // log(777,this.paper.root.treedata);
          
          // log(888, rel)
          dragrepl.attr({class:"draggov"});
          this.attr({cursor: "move"})

          x=this.midx;
          y=this.topy;
          // log("-----------", this.attr("x"));
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
                    dragover = this.nr
                  });
                dropa.mouseout(
                  function() {
                    // console.log("out from the word", this.nr);
                    dropa.attr({"class":"t"});
                    dragover = -1
                  });
                dropa.attr({cursor: "move"});
              }
            }
        },
        stopdrag(e) {
          this.animate({transform: "translate("+0+","+0+")"}, 300, mina.easein,
            function()
              {
                this.attr({"class":"t"});
                dragrepl.remove();
              }
            );
          // log(45654)
          for (let dropa of droppables) 
          { 
            dropa.unmouseover();
            dropa.unmouseout();
            dropa.attr({cursor: "move", cursor: "grab", "class":"t"})
          }
          dragcurve.remove();
          dragarrowhead.remove();
          
          if (dragover!=this.nr &&( (dragover>=0 && this.nr != undefined) || dragsun!=null) )
          {
            nr = this.nr;
            if (dragsun) {dragover = nr; nr=0; }
            
            oldRelation = Object.values(this.paper.root.treedata.tree[dragover]['gov'])[0]		

            // relationChanged(this.paper, nr, dragover, oldRelation )
            this.paper.root.treedata.triggerRelationChange(this.paper, this, nr, dragover, oldRelation);
            
            // $('#conllarea').text(	);
          }
          if(dragsun!=null) {dragsun.remove();dragsun=null}
          dragover=-1;
        },
        categoryclick(e) {
          // log("categoryclick",e,this);
          this.attr({class:"catselected"})
          // log("categoryclick2",e,this);
          this.paper.root.treedata.triggerCategoryChange(this.paper, this, this.nr, this.cat); 
          // log("categoryclick3",e,this);
        },
        relationclick(e) {
          // relationChanged(this.paper, this.nr, this.govid, this.relation+"kim" )
          this.attr({class:"deprelselected"})
          this.paper.root.treedata.triggerRelationChange(this.paper, this, this.nr, this.govid, this.relation); 
          // log("relationclick",e,this)
        },
        relationChanged(s, depid, govid, relation ) {  // todo: maybe include adding of secondary governor!!!
          // called from ConllGraph.vue 
          s.root.treedata.tree[depid]['gov']={}
          s.root.treedata.tree[depid]['gov'][govid]=relation
          s.paper.clear();
          drawsnap(s.id, s.root.treedata, {'nodes':[],'edges':[]}, shownfeatures)
        },
        catChanged(s, depid, cat ) {  
          // called from ConllGraph.vue
          // console.log("BEFORE", JSON.parse(JSON.stringify(s.root.treedata.tree)));
          s.root.treedata.tree[depid]['cat']=cat;
          s.paper.clear();
          drawsnap(s.id, s.root.treedata, {'nodes':[],'edges':[]}, shownfeatures)
          // return s.root.treedata.tree
        },
        drawsnap(idSVG, treedata, usermatches, shownfeatures) {
          ///////////////////////////////////
          // draws json tree on svg in div //
          ///////////////////////////////////
          var textgraphdistance = 10;
          var textstarty = 10; // has to be bigger than arborator-draft.css deprel fontsize
          var runningy = textstarty;
          
          var s=Snap(document.getElementById(idSVG));
          
          // s.attr("width", "100%");
          // s.attr("height", "100%");
          // s.parent().attr("height", "45px")
          // s.parent().parent().attr("height", "45px")
          // s.parent().parent().attr("style", "height:550px;");	
          // s.parent().attr("class", 'sentencebox');
          // s.parent().node.classList.add('sentencebox');
          var leveldistance = parseInt(getComputedStyle(s.parent().node).getPropertyValue('--depLevelHeight'));
          log("leveldistance",leveldistance)
          log("drawsnap usermatches",usermatches,usermatches.nodes === null, usermatches.nodes)
          var idgov2level = {};
          var levels = [];
          s.treedata = treedata;
          s.id = idSVG;
          var tree = treedata.tree;
          // compute the max level
          Object.keys(tree).forEach(function(nr) { // for each dependent
          // for (let nr of Object.keys(tree)){
            var word = tree[nr];
            for (var govid in word["gov"]) { // for each governor
              if (tree[govid]) levels.push(level(nr,govid,tree, idgov2level));
            }
          });
          // }
          var maxlevel = Math.max(...levels);
          // runningy = basey;
          // log('*************levelheight',leveldistance,'s =',s, 45646454,s.parent(),s.parent().node);

          
          // insertion of texts
          log("maxlevel",maxlevel)
          var xpositions = [0];
          var allstexts = {};
          var textgroup = s.group();
          var feati = 0;
          for (let shofea of shownfeatures) { 
            let stexts = [];
            let ind = 0;
            for (var nr in tree) {
            // Object.keys(tree).forEach(function(nr) {
              var word = tree[nr];
              // log(shofea, word[shofea])
              // var sword = s.text(10*nr,10, 'hey')
              // log(xpositions[ind], ind)
              var sword = s.text(xpositions[ind], runningy, word[shofea]).attr({class:shofea});
              // log('epee',sword.getBBox())
              sword.wordDistance = parseInt(getComputedStyle(sword.node).getPropertyValue('--wordDistance'));
              sword.nr = nr;
              
              stexts.push(sword);
              if (feati==0) {
                sword.attr({cursor: "move", cursor: "grab"}).drag( this.dragging, this.startdrag, this.stopdrag); // dragging only the first line (normally the tokens)
                
                droppables.push(sword)
              }
              if (shofea == catFeatureName) {
                sword.attr({cursor: "pointer"}).click( categoryclick );
                sword.nr = nr;
                sword.cat =  word[shofea];
              }
              if (  usermatches.nodes.includes( nr.toString())) {
                sword.attr({class:"deprelselected"}).node.scrollIntoView()
              }
              let nextx = Math.max(xpositions[ind+1] || 0, xpositions[ind]+sword.getBBox().w + sword.wordDistance);
              // nextx = Math.max(xpositions[ind+1] || 0, 20 + sword.wordDistance);
              xpositions[ind+1]=nextx;
              ind += 1;
            };
            runningy += yWordDistance;
            textgroup.add(stexts)
            allstexts[shofea]=stexts;
            feati += 1;
          }

          
          // var movedownm = new Snap.Matrix()
          // movedownm.translate(0, maxlevel*leveldistance);
          // movedownm.translate(220, 220);
          // textgroup.transform(movedownm); 


          
          var xmidpoints = [];
          var x2s = [];
          var y2s = [];
          
          // readjusting the position of texts
          for (let shofea of shownfeatures) { 
            var ind = 0;
            Object.keys(tree).forEach(function(nr) {
              // allstexts[shofea][ind].attr({'x':  xpositions[ind]}); // simple left aligned table
              var xmidpoint = xpositions[ind]+(xpositions[ind+1]-xpositions[ind])/2; //-allstexts[shofea][ind].wordDistance
              xmidpoints.push(xmidpoint);
              allstexts[shofea][ind].midx=xmidpoint;
              allstexts[shofea][ind].attr({'x':  xmidpoint - allstexts[shofea][ind].getBBox().w/2});
              allstexts[shofea][ind].attr({'y': allstexts[shofea][ind].getBBox().y2+(maxlevel)*leveldistance});
              allstexts[shofea][ind].topy = allstexts[shofea][ind].getBBox().y;
              x2s.push(allstexts[shofea][ind].getBBox().x2);
              y2s.push(allstexts[shofea][ind].getBBox().y2);
              ind += 1;
            });
          }
          log(66666)
          
          var maxx2 = Math.max(...x2s);
          var maxy2 = Math.max(...y2s);
          var basey = textstarty+(maxlevel)*leveldistance-textgraphdistance;
          // var leveldistance = Math.min(basey/maxlevel,maxLevelDistance); // take the min of the available height divided by the required levels and the maxLevelDistance

          log(7777,"maxlevel*leveldistance",maxlevel,leveldistance,maxlevel*leveldistance)
          log('HERRRREEE', allstexts, shownfeatures[0]);
          var firstTextFontSize = parseInt(getComputedStyle(allstexts[shownfeatures[0]][0].node).getPropertyValue('font-size'));
          // drawing the dependency relations
          var ind = 0;
          Object.keys(tree).forEach(function(nr) { // for each dependent
            var word = tree[nr];
            for (var govid in word["gov"]) { // for each governor
              if (govid in tree || govid==0) // only existing governors
              {
                let le = idgov2level[nr+'_'+govid]; // level(nr, govid, tree, idgov2level);
                var controly = basey-le*leveldistance;
                var tox = govid > ind ? xmidpoints[govid-1]-firstTextFontSize/2 : xmidpoints[govid-1]+firstTextFontSize/2;
                // var tox = govid > ind ? xmidpoints[govid-1] : xmidpoints[govid-1];
                if (govid>0) var path = "M"+xmidpoints[ind]+","+basey+" C"+xmidpoints[ind]+","+controly+" "+tox+","+controly+" "+tox+","+basey;
                else var path = "M"+xmidpoints[ind]+","+(basey)+" L"+xmidpoints[ind]+","+"0 ";
                var p = s.path(path).attr({class:"curve"});
                s.path(arrowhead(xmidpoints[ind],basey)).attr("class", "arrowhead");
                var pbox = p.getBBox();
                var xmidf = pbox.x+(pbox.w)/2;
                var srel = s.text(xmidf, pbox.y-2, word["gov"][govid]).attr({class:"deprel"}).click( relationclick );
                srel.nr = nr;
                srel.govid = govid;
                srel.relation = word["gov"][govid];
                if (govid==0) srel.attr({'y':  firstTextFontSize})
                // if (govid==0) srel.attr({'y':  textstarty})
                else srel.attr({'x':  xmidf - srel.getBBox().w/2});
              }
            }
            ind += 1;
          });

          s.attr("height", (maxy2)+"px");
          s.attr("width", (maxx2)+"px");
          s.attr("overflow", "auto");
          svgHeight = s.attr('height').replace(/px/,'');
          log(8888,"drawsnap done")
          return s;

        },
        arrowhead(x,y) {
          // gives path for arrowhead x,y startpoint (end of arrow)
          var size = 5;
          var startpoint = x+","+y; // to move the arrowhead lower: (y+size/3);
          var lefttop = "0,0" +(-size/2)+","+(-size*1.5)+" "+(-size/2)+","+(-size*1.5);
          var righttop = (size/2)+"," +(size/2)+" "+(size/2)+"," +(size/2)+ " "+(size)+",0";
          var arrowPath = "M"+ startpoint+"c"+lefttop+ "c"+righttop+ "z";
          return arrowPath;
        },
        treeDataToConll(treedata){
          // log(treedata.uextra[0])
          conllstrs=treedata.uextra[0]
          // conllstrs=[];
          for (let nr in treedata.tree){

            var node = treedata.tree[nr];
            // log('_______________',node)
            govs=node["gov"]||{};
            govk = Object.keys(govs).sort();
            if (govk) {
              gk = govk[0];
              gv = govs[gk] || "_"
            }
            else {
              gk = '_';
              gv = '_';
            }
            featstr = "";
            for (let a in node){
              if (!(["t","lemma","cat","tag","tag2","xpos","egov","misc","id","index","gov","kids","govrel"].includes(a))){
                featstr += a+"="+node[a];
              }
            }
            othergovstr = "";
            for (let g in govk.slice(1)){
                othergovstr += g+":"+govs[g];
            }
            conllstrs.push(
              [
                nr,
                (node['t']||'_'),
                (node['lemma']||'_'),
                (node['cat']||'_'),
                (node['xpos']||'_'),
                (node['morph']||'_'),
                gk,
                gv,
                (othergovstr||'_'),
                (node['gloss']||'_') // NoSpaceAfter???
              ].join("\t"))
          };
          conllstr=conllstrs.join("\n")
          return conllstr


        },
        conllNodesToTree(treeline) {
          // reads a conll representation of a single tree 
          // returns object: {tree:tree, uextra:sentencefeatures, sentence}
          //TODO: replace jquery by d3
          
          var nodes = treeline.split('\n');
          var nodesLen = nodes.length;
          if(reverseMode)nodes.reverse();
          // nodes = nodes.reverse();
          var tree={};
          var uextra={};
          var lastid=0;
          var skipuntil=0;
          var words=[]
          // jquery
          $.each(nodes, function(id,nodeline){ // for each conll line:
            var nodeline=$.trim(nodeline);
          // for (let id = 0; id < nodesLen; id++){
          //   var nodeline = nodes[id];
            if (nodeline.charAt(0) == "#") {
              if (!(lastid in uextra)) uextra[lastid]=[];
              uextra[lastid].push(nodeline)
              return true; // jquery
              // break;
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
            
            let gov = elements[conlls[el]["gov"]];
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
          
          });// jquery
          // }
          
          
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
    }
}

// const catchEnterKey = evt => {
//     if (evt.which === 13 || evt.keyCode === 13) {
//       dialog.close()
//     }
//   }
// window.addEventListener('keyup', catchEnterKey)

// const dialog = Dialog.create({
//   ...........,
//   onDismiss: () => { window.removeEventListener('keyup', catchEnterKey) }
// })

var level = function(i,gi,tree, idgov2level) {
  // recursive function determining the level of a dependency relation
  // log("__________level",i,gi)
  if (idgov2level[i+'_'+gi]>0) return idgov2level[i+'_'+gi];
  if (gi==0) return 0;
  var intermlevs = [1];
  let minIGI = Math.min(i,gi); let maxIGI = Math.max(i,gi);
  for (var ii = minIGI+1; ii < maxIGI; ii++) {
    if (tree[ii])
      for (var gii in tree[ii]["gov"]) {
        if (gii>=minIGI && gii<=maxIGI) {
          if (idgov2level[ii+'_'+gii]>0) intermlevs.push(idgov2level[ii+'_'+gii]+1);
          else intermlevs.push(level(ii, gii, tree, idgov2level)+1);
        }
      }
  }
  idgov2level[i+'_'+gi] = Math.max( ...intermlevs );
  // log("__________level",i,gi,'returns',idgov2level[i+'_'+gi])
  return idgov2level[i+'_'+gi];
}

var arrowhead = function(x,y) {
  // gives path for arrowhead x,y startpoint (end of arrow)
  var size = 5;
  var startpoint = x+","+y; // to move the arrowhead lower: (y+size/3);
  var lefttop = "0,0" +(-size/2)+","+(-size*1.5)+" "+(-size/2)+","+(-size*1.5);
  var righttop = (size/2)+"," +(size/2)+" "+(size/2)+"," +(size/2)+ " "+(size)+",0";
  var arrowPath = "M"+ startpoint+"c"+lefttop+ "c"+righttop+ "z";
  return arrowPath;
}

var relationclick = function(e) {
  // relationChanged(this.paper, this.nr, this.govid, this.relation+"kim" )
  this.attr({class:"deprelselected"})
  this.paper.root.treedata.triggerRelationChange(this.paper, this, this.nr, this.govid, this.relation); 
  // log("relationclick",e,this)
}

var categoryclick = function(e) {
  // log("categoryclick",e,this);
  this.attr({class:"catselected"})
  // log("categoryclick2",e,this);
  this.paper.root.treedata.triggerCategoryChange(this.paper, this, this.nr, this.cat); 
  // log("categoryclick3",e,this);
}

var relationclick = function(e) {
  // relationChanged(this.paper, this.nr, this.govid, this.relation+"kim" )
  this.attr({class:"deprelselected"})
  this.paper.root.treedata.triggerRelationChange(this.paper, this, this.nr, this.govid, this.relation); 
  // log("relationclick",e,this)
}

</script>

<style>
.vs-dark .vs__search::placeholder,
  .vs-dark .vs__dropdown-toggle,
  .vs-dark .vs__dropdown-option,
  .vs-dark .vs__dropdown-menu,
  .vs-dark .vs__selected {
    background: #343436;
    border: none;
    color: white;
  }
.vs-dark .vs__clear,
.vs-dark .vs__open-indicator {
  fill: #635e72;
}
.vs-dark .vs__dropdown-option--highlight { background: #501d7d; color:white; }

.vs-light .vs__search::placeholder,
  .vs-light .vs__dropdown-toggle,
  .vs-light .vs__dropdown-option,
  .vs-light .vs__dropdown-menu,
  .vs-light .vs__selected {
    background: #d0d0dd;
    border: none;
    color: rgb(14, 13, 13);
  }
.vs-light .vs__clear,
.vs-light .vs__open-indicator {
  fill: #73707c;
}
.vs-light .vs__dropdown-option--highlight { background: #501d7d; color:white; }
</style>