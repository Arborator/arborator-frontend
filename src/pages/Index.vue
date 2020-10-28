<template>
  <q-page :class="$q.dark.isActive?'bg-dark':'bg-white'">
    
    <div class="q-pa-md q-gutter-sm">
      <section class="sectionfscreen">
        <q-card flat class="fixed-center">
          <q-card-section >
            <div class="text-center"> 
              <img v-if="$q.dark.isActive" alt="Arborator" src="../statics/svg/arborator.grew.white.svg" class="brandinglogo">
              <img v-else alt="Arborator" src="../statics/svg/arborator.grew.svg" class="brandinglogo">
            </div>
          </q-card-section>

          <q-card-section >
            <div class="text-center" :class="$q.dark.isActive?'text-grey-1':'text-blue-grey-8'"><h4>{{$t('homepage').slogan}}</h4></div>
          </q-card-section>

          <q-card-actions align="around">
            <q-btn id="accesstreebank" rounded to="/projects" color="primary" no-caps >{{$t('homepage').accessTreebankBtn}}</q-btn>
          </q-card-actions>

          <q-card-section >
            <q-carousel
              v-model="slide"
              transition-prev="jump-right"
              transition-next="jump-left"
              swipeable
              animated
              :control-color="$q.dark.isActive?'white':'blue-grey-8'"
              navigation
              infinite
              autoplay
              padding
              arrows
              height="200px"
              :class="$q.dark.isActive?'bg-grey-10 text-white':'text-blue-grey-8'" class=" rounded-borders"
            >
              <q-carousel-slide name="style" class="column no-wrap flex-center">
                <q-icon name="fas fa-edit" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{$t('homepage').features[0]}}
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="tv" class="column no-wrap flex-center">
                <q-icon name="fas fa-search" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{$t('homepage').features[1]}}
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="layers" class="column no-wrap flex-center">
                <q-icon name="fas fa-code-branch" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{$t('homepage').features[2]}}
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="map" class="column no-wrap flex-center">
                <q-icon name="fas fa-user-friends" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{$t('homepage').features[3]}}
                </div>
              </q-carousel-slide>
            </q-carousel>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions align="around" vertical>
            <span class="text-center text-caption text-grey">{{$t('homepage').scroll}}</span>
            <q-icon name="fas fa-angle-double-down"/>
          </q-card-actions>

        </q-card>

      </section>


    <q-card flat class="q-pa-md q-gutter-y-xl">
      <q-separator inset/>

      <section class="row sectionsize">
        <q-card flat class="col" style=" width: 100%; width: 45vw">
          <q-card-section>
            <div class="text-h3 text-center text-primary text-bold">{{$t('homepage').arboheadline}}</div>
          </q-card-section>
          <q-card-section horizontal>
            <q-parallax :height="440" :speed="0.0" class="col col-md-5">
              <template v-slot:media>
                <video width="720" height="440" autoplay loop muted>
                  <source type="video/webm" src="../statics/videos/annotate.webm">
                </video>
              </template>
            </q-parallax>
            <div class="col"></div>
            <q-card-section vertical class="col-12 col-md-6">
              <q-card-section>
                <div class="text-h5 text-primary text-bold">{{$t('homepage').descriptionCard.title}}</div>
                <div class="text-subtitle2">{{$t('homepage').descriptionCard.subtitle}}</div>
              </q-card-section>

              <q-card-section>
                <div class="text-justify text-body1">
                   <p>
                    {{$t('homepage').descriptionCard.content[0]}} <a href="https://surfacesyntacticud.github.io" target="_blank">
                    <q-icon name="img:../statics/svg/sud.svg"  size="md" />
                    <q-tooltip content-class="bg-accent" content-style="font-size: 16px" >
                        {{$t('homepage').descriptionCard.tooltipSud}}
                      </q-tooltip>
                    </a>
                    {{$t('homepage').descriptionCard.content[1]}} <a href="https://universaldependencies.org/" target="_blank">
                    <q-icon name="img:../statics/svg/ud.svg"  size="sm" />
                    <q-tooltip content-class="bg-accent" content-style="font-size: 16px" >
                        {{$t('homepage').descriptionCard.tooltipUd}}
                      </q-tooltip>
                    </a>.
                    </p>
                    <p class="text-center text-body1">{{$t('homepage').collaborativeCard.content[2]}}
                    <q-btn push to="/projects/Playground/en_gum-sud-dev/665" color="primary" no-caps>{{$t('homepage').collaborativeCard.playgroundBtn}}</q-btn>
                    </p>
                </div>
              </q-card-section>

            </q-card-section>
          </q-card-section>
        </q-card>
      </section>

      <section class="row sectionsize">
        <q-card flat class="col" style=" width: 100%; width: 45vw">
          <q-card-section>
            <div class="text-h3 text-center text-green text-bold">{{$t('homepage').grewheadline}}</div>
          </q-card-section>
          <q-card-section horizontal>
            <q-card-section vertical class="col-12 col-md-6">
              <q-card-section>
                <div class="text-h5 text-primary text-bold">{{$t('homepage').grewCard.title}}</div>
                <div class="text-subtitle2">{{$t('homepage').grewCard.subtitle}}</div>
              </q-card-section>

              <q-card-section>
                <div class="text-justify text-body1">
                  {{$t('homepage').grewCard.content[0]}} 
                  <a href="http://grew.fr//" target="_blank"> <q-icon name="img:../statics/svg/grew.svg"  size="md" />
                    <q-tooltip content-class="bg-accent" content-style="font-size: 15px" >
                      {{$t('homepage').grewCard.tooltipGrew}}
                    </q-tooltip>
                  </a> 
                  {{$t('homepage').grewCard.content[1]}}
                </div>
              </q-card-section>
            </q-card-section>
            <div class="col"></div>
            <q-parallax :height="440" :speed="0.0" class="col col-md-5">
              <template v-slot:media>
                <video width="720" height="440" autoplay loop muted>
                  <source type="video/webm" src="../statics/videos/grew.webm">
                </video>
              </template>
            </q-parallax>
          </q-card-section>
        </q-card>
      </section>

      <section class="row items-start">
        <q-card flat class="col-md-4">
          <div class="text-center">
              <q-icon color="primary" name="fas fa-newspaper"  style="font-size: 4em;"></q-icon>
          </div>
          <q-card-section>
            <div class="text-h5 text-primary text-center text-bold">{{$t('homepage').citeCard.title}}</div>
          </q-card-section>
          <q-separator  inset />
          <q-card-section>
            <a href="http://www.lrec-conf.org/proceedings/lrec2020/pdf/2020.lrec-1.651.pdf"  target="_blank">
            Gaël Guibon, Marine Courtin, Kim Gerdes, Bruno Guillaume. When Collaborative Treebank Curation Meets Graph Grammars: Arborator With a Grew Back-End Actes de LREC 2020.</a>
            <q-space/>
            <q-badge class="clickable" @click="copy()">
              BibTeX 
              <q-tooltip content-class="bg-accent" content-style="font-size: 12px" >
                Copy to clipboard
              </q-tooltip></q-badge>
            <q-card class="clickable text-caption clickhl" flat bordered @click="copy()">
              @InProceedings{guibon-EtAl:2020:LREC,
              author    = {Guibon, Gaël  and  Courtin, Marine  and  Gerdes, Kim  and  Guillaume, Bruno},
              title     = {When Collaborative Treebank Curation Meets Graph Grammars},
              booktitle      = {Proceedings of The 12th Language Resources and Evaluation Conference},
              month          = {May},
              year           = {2020},
              address        = {Marseille, France},
              publisher      = {European Language Resources Association},
              pages     = {5293--5302},
              url       = {https://www.aclweb.org/anthology/2020.lrec-1.651}
              }
              <q-tooltip content-class="bg-accent" content-style="font-size: 12px" >
                Copy to clipboard
              </q-tooltip>
            </q-card>      
          </q-card-section>    
        </q-card>

        <q-card flat class="col-md-4">
          <div class="text-center">
              <q-icon color="primary" name="fab fa-github"  style="font-size: 4em;"></q-icon>
          </div>
          <q-card-section>
            <div class="text-h5 text-primary text-center text-bold">{{$t('homepage').sourceCard.title}}</div>
          </q-card-section>
          <q-separator  inset />
          <q-card-section>
            {{$t('homepage').sourceCard.content[0]}} 
            <q-btn type="a" href="https://github.com/Arborator" target="_blank" icon="fab fa-github" flat round  color="primary"  size="md" >
              <q-tooltip content-class="bg-accent" content-style="font-size: 16px" >
                {{$t('homepage').sourceCard.tooltipGit}}
              </q-tooltip>
            </q-btn>
            {{$t('homepage').sourceCard.content[1]}}<br>
            {{$t('homepage').sourceCard.content[2]}} <a href="https://github.com/Arborator/arborator-frontend/issues" target="_blank">{{$t('homepage').sourceCard.content[3]}}</a>.
            <br>{{$t('homepage').sourceCard.content[4]}}
          </q-card-section>
        </q-card>


       <q-card flat class="col-md-4" >
         <div class="text-center">
              <q-icon color="primary" name="fas fa-toolbox"  style="font-size: 4em;"></q-icon>
          </div>
         <q-card-section>
          <div class="text-h5 text-primary text-center text-bold">{{$t('homepage').toolsCard.title}}</div>
        </q-card-section>
        <q-separator  inset />
        <div class="q-gutter-lg q-gutter-y-lg">
        <q-card-section class="q-gutter-y-lg">         
            <q-card bordered flat :class="hoverdraft ? 'bg-grey-2' : 'hover'" class="clickable clickhl col-1 grid-style-transition shadow-7" @click="openURL('https://arborator.github.io/draft')" >
              <q-card-section>
              {{$t('homepage').toolsCard.content[0]}}
              </q-card-section>
              <q-card-section>
                <img src="../statics/svg/arborator.quick.svg" width="100em" /> <q-badge align="top" color="positive">{{$t('homepage').toolsCard.content[1]}}</q-badge>
                <q-item-section>
                    <q-item-label lines="1"> </q-item-label>
                    <q-item-label caption lines="2" :class="$q.dark.isActive?'text-grey':''">
                      {{$t('homepage').toolsCard.content[2]}}
                    </q-item-label>
                </q-item-section>
              </q-card-section>
            </q-card>
            <q-card bordered flat :class="hoverquick ? 'bg-grey-2' : ''" class="clickable clickhl col-1 grid-style-transition shadow-7" @click="openURL('https://arborator.elizia.net/q.cgi')" >
              <q-card-section>
                {{$t('homepage').toolsCard.content[3]}} {{$t('homepage').toolsCard.content[4]}}
              </q-card-section>
            </q-card>
            <q-card bordered flat :class="hoverlegacy ? 'bg-grey-2' : ''" class="clickable clickhl col-1 grid-style-transition shadow-7" @click="openURL('https://arborator.elizia.net/')" >
              <q-card-section>
                {{$t('homepage').toolsCard.content[5]}}            
              </q-card-section>          
            </q-card>
        </q-card-section>
        </div>
       </q-card>


      </section>


      
    </q-card>

    </div>
  </q-page>
</template>


<script>
import { openURL } from 'quasar';
import { copyToClipboard } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';
import ProjectCard from '../components/ProjectCard.vue';
// import Snap from "snapsvg"
import Snap from "snapsvg-cjs";
export default {
  components: {
    ProjectCard
  },
  name: 'PageIndex',
  data() {
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      presentation:`
      Arborator-Grew, a collaborative annotation tool for treebank development. Arborator-Grew combines the features of two preexisting tools: Arborator and Grew. Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version, Grew-match, where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks.
      `,
      hover: false,
      hoverdraft: false,
      hoverquick: false,
      hoverlegacy: false,
      search: '',
      slide: 'style',
    }
  },
  mounted(){
    },
  methods:{
    openURL,
    copy(){
      copyToClipboard(`@InProceedings{guibon-EtAl:2020:LREC,
              author    = {Guibon, Gaël  and  Courtin, Marine  and  Gerdes, Kim  and  Guillaume, Bruno},
              title     = {When Collaborative Treebank Curation Meets Graph Grammars},
              booktitle      = {Proceedings of The 12th Language Resources and Evaluation Conference},
              month          = {May},
              year           = {2020},
              address        = {Marseille, France},
              publisher      = {European Language Resources Association},
              pages     = {5293--5302},
              url       = {https://www.aclweb.org/anthology/2020.lrec-1.651}
              }`)
      .then(() => {
        this.$q.notify({message: 'Copied to clipboard!'})
      })
      .catch(() => {
        this.$q.notify({message:'Failed to copy.'})
      })
    }
  }
}


</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor:pointer;
}

.clickhl:hover {
  color:blue;
}

.grid-style-transition
  transition transform .28s, background-color .28s

.brandinglogo {
  height: 5vw;
}

@media only screen and (max-width: 768px) {
  .brandinglogo {height: 14vw;}
}

.sectionfscreen {
  height: 100vh;
}

.sectionsize {
  min-height:80vh;
}


</style>