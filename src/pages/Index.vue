<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <div class="q-pa-md q-gutter-sm">
      <EmailCollectDialog v-if="shareEmail" />
      <section class="sectionfscreen" @mousemove="xCoordinate">
        <q-card flat class="fixed-center">
          <q-card-section>
            <div class="text-center">
              <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" class="brandinglogo" />
              <img v-else alt="Arborator" src="/svg/arborator.grew.svg" class="brandinglogo" />
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-center" :class="$q.dark.isActive ? 'text-grey-1' : 'text-blue-grey-8'">
              <h4>{{ $t('homepage.slogan') }}</h4>
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn id="accesstreebank" rounded to="/projects" color="primary" no-caps>{{ $t('homepage.accessTreebankBtn') }}</q-btn>
          </q-card-actions>

          <q-card-section>
            <q-carousel
              v-model="slide"
              transition-prev="jump-right"
              transition-next="jump-left"
              swipeable
              animated
              :control-color="$q.dark.isActive ? 'white' : 'blue-grey-8'"
              navigation
              infinite
              autoplay
              padding
              arrows
              height="200px"
              :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'text-blue-grey-8'"
              class="rounded-borders"
            >
              <q-carousel-slide name="tv" class="column no-wrap flex-center">
                <q-icon name="fas fa-search" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{ $t('homepage.features[1]') }}
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="layers" class="column no-wrap flex-center">
                <q-icon name="fas fa-code-branch" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{ $t('homepage.features[2]') }}
                </div>
              </q-carousel-slide>
              <q-carousel-slide name="map" class="column no-wrap flex-center">
                <q-icon name="fas fa-user-friends" size="56px" />
                <div class="q-mt-md text-center text-body1">
                  {{ $t('homepage.features[3]') }}
                </div>
              </q-carousel-slide>
            </q-carousel>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions align="around" vertical class="clickable clickhl" @click="scrolldown()">
            <span class="text-center text-caption">{{ $t('homepage.scroll') }}</span>
            <q-icon name="fas fa-angle-double-down" style="font-size: 44px" :style="`color: ${myColor}`" />
          </q-card-actions>
        </q-card>
      </section>

      <q-card id="arboheadline" flat class="q-pa-md q-gutter-y-lg">
        <q-separator inset />

        <section class="row sectionsize">
          <q-card flat class="col" style="width: 100%; width: 45vw">
            <q-card-section>
              <div class="text-h3 text-center text-primary text-bold">
                {{ $t('homepage.arboheadline') }}
              </div>
            </q-card-section>
            <q-card-section horizontal>
              <q-parallax :height="440" :speed="0.0" class="col col-md-5">
                <template #media>
                  <video width="720" height="440" autoplay loop muted>
                    <source type="video/webm" src="/videos/annotate2.webm" />
                  </video>
                </template>
              </q-parallax>
              <div class="col"></div>
              <q-card-section vertical class="col-12 col-md-6">
                <q-card-section>
                  <div class="text-h5 text-primary text-bold">
                    {{ $t('homepage.descriptionCard.title') }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('homepage.descriptionCard.subtitle') }}
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="text-justify text-body1">
                    <p>
                      {{ $t('homepage.descriptionCard.content[0]') }}
                      <a href="https://surfacesyntacticud.github.io" target="_blank">
                        <q-icon name="img:/svg/sud.svg" size="md">
                          <q-tooltip content-class="bg-accent" content-style="font-size: 16px">
                            {{ $t('homepage.descriptionCard.tooltipSud') }}
                          </q-tooltip>
                        </q-icon>
                      </a>
                      {{ $t('homepage.descriptionCard.content[1]') }}
                      <a href="https://universaldependencies.org/" target="_blank">
                        <q-icon name="img:/svg/ud.svg" size="sm" />
                        <q-tooltip content-class="bg-accent" content-style="font-size: 16px">
                          {{ $t('homepage.descriptionCard.tooltipUd') }}
                        </q-tooltip> </a
                      >.
                    </p>

                    <p class="text-center text-body1">
                      {{ $t('homepage.collaborativeCard.content[2]') }}
                      <q-btn push to="/projects/Playground/en_gum-sud-dev/665" color="primary" no-caps>{{
                        $t('homepage.collaborativeCard.playgroundBtn')
                      }}</q-btn>
                    </p>
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card-section>
          </q-card>
        </section>

        <section class="row sectionsize">
          <q-card flat class="col" style="width: 100%; width: 45vw">
            <q-card-section>
              <div class="text-h3 text-center text-green text-bold">
                {{ $t('homepage.grewheadline') }}
              </div>
            </q-card-section>
            <q-card-section horizontal>
              <q-card-section vertical class="col-12 col-md-6">
                <q-card-section>
                  <div class="text-h5 text-primary text-bold">
                    {{ $t('homepage.grewCard.title') }}
                  </div>
                  <div class="text-subtitle2">
                    {{ $t('homepage.grewCard.subtitle') }}
                  </div>
                </q-card-section>

                <q-card-section>
                  <div class="text-justify text-body1">
                    {{ $t('homepage.grewCard.content[0]') }}
                    <a href="http://grew.fr//" target="_blank">
                      <q-icon name="img:/svg/grew.svg" size="xl" />
                      <q-tooltip content-class="bg-accent" content-style="font-size: 15px">
                        {{ $t('homepage.grewCard.tooltipGrew') }}
                      </q-tooltip>
                    </a>
                    {{ $t('homepage.grewCard.content[1]') }}
                  </div>
                </q-card-section>
              </q-card-section>
              <div class="col"></div>
              <q-parallax :height="440" :speed="0.0" class="col col-md-5">
                <template #media>
                  <video width="720" height="440" autoplay loop muted>
                    <source type="video/webm" src="/videos/grew.webm" />
                  </video>
                </template>
              </q-parallax>
            </q-card-section>
          </q-card>
        </section>

        <section class="row items-start">
          <q-card flat class="col-md-4">
            <div class="text-center">
              <q-icon color="primary" name="fas fa-newspaper" style="font-size: 4em"></q-icon>
            </div>
            <q-card-section>
              <div class="text-h5 text-primary text-center text-bold">
                {{ $t('homepage.citeCard.title') }}
              </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              <a href="http://www.lrec-conf.org/proceedings/lrec2020/pdf/2020.lrec-1.651.pdf" target="_blank">
                Gaël Guibon, Marine Courtin, Kim Gerdes, Bruno Guillaume. When Collaborative Treebank Curation Meets Graph Grammars: Arborator With a
                Grew Back-End Actes de LREC 2020.</a
              >
              <q-space />
              <q-badge class="clickable" @click="copy()">
                BibTeX
                <q-tooltip content-class="bg-accent" content-style="font-size: 12px"> Copy to clipboard </q-tooltip></q-badge
              >
              <q-card class="clickable text-caption clickhl" flat bordered @click="copy()">
                @InProceedings{guibon-EtAl:2020:LREC, author = {Guibon, Gaël and Courtin, Marine and Gerdes, Kim and Guillaume, Bruno}, title = {When
                Collaborative Treebank Curation Meets Graph Grammars}, booktitle = {Proceedings of The 12th Language Resources and Evaluation
                Conference}, month = {May}, year = {2020}, address = {Marseille, France}, publisher = {European Language Resources Association}, pages
                = {5293--5302}, url = {https://www.aclweb.org/anthology/2020.lrec-1.651} }
                <q-tooltip content-class="bg-accent" content-style="font-size: 12px"> Copy to clipboard </q-tooltip>
              </q-card>
            </q-card-section>
          </q-card>

          <q-card flat class="col-md-4">
            <div class="text-center">
              <q-icon color="primary" name="fab fa-github" style="font-size: 4em"></q-icon>
            </div>
            <q-card-section>
              <div class="text-h5 text-primary text-center text-bold">
                {{ $t('homepage.sourceCard.title') }}
              </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section>
              {{ $t('homepage.sourceCard.content[0]') }}
              <q-btn type="a" href="https://github.com/Arborator" target="_blank" icon="fab fa-github" flat round color="primary" size="md">
                <q-tooltip content-class="bg-accent" content-style="font-size: 16px">
                  {{ $t('homepage.sourceCard.tooltipGit') }}
                </q-tooltip>
              </q-btn>
              {{ $t('homepage.sourceCard.content[1]') }}<br />
              {{ $t('homepage.sourceCard.content[2]') }}
              <a href="https://github.com/Arborator/arborator-frontend/issues" target="_blank">{{ $t('homepage.sourceCard.content[3]') }}</a
              >. <br />{{ $t('homepage.sourceCard.content[4]') }}
            </q-card-section>
          </q-card>

          <q-card flat class="col-md-4">
            <div class="text-center">
              <q-icon color="primary" name="fas fa-toolbox" style="font-size: 4em"></q-icon>
            </div>
            <q-card-section>
              <div class="text-h5 text-primary text-center text-bold">
                {{ $t('homepage.toolsCard.title') }}
              </div>
            </q-card-section>
            <q-separator inset />
            <div class="q-gutter-lg q-gutter-y-lg">
              <q-card-section class="q-gutter-y-lg">
                <q-card
                  bordered
                  flat
                  :class="hoverDraft ? 'bg-grey-2' : 'hover'"
                  class="clickable clickhl col-1 grid-style-transition shadow-7"
                  @click="openURL('https://arborator.github.io/draft/live.html')"
                >
                  <q-card-section>
                    <q-img src="images/arboratorNano.png" style="width: 52px" loading="lazy" />

                    {{ $t('homepage.toolsCard.content[0]') }}
                  </q-card-section>
                  <q-card-section>
                    <q-badge align="top" color="positive">{{ $t('homepage.toolsCard.content[1]') }}</q-badge>
                    <q-item-section>
                      <q-item-label lines="1"> </q-item-label>
                      <q-item-label caption lines="2" :class="$q.dark.isActive ? 'text-grey' : ''">
                        {{ $t('homepage.toolsCard.content[2]') }}
                      </q-item-label>
                    </q-item-section>
                  </q-card-section>
                </q-card>
                <q-card
                  bordered
                  flat
                  :class="hoverQuick ? 'bg-grey-2' : ''"
                  class="clickable clickhl col-1 grid-style-transition shadow-7"
                  @click="openURL('https://arborator.ilpga.fr/q.cgi')"
                >
                  <q-card-section>
                    {{ $t('homepage.toolsCard.content[3]') }}
                    <q-badge align="top" color="positive">{{ $t('homepage.toolsCard.content[1]') }}</q-badge>
                  </q-card-section>
                  <q-card-section>
                    <q-img src="svg/arborator.quick.svg" spinner-color="white" style="width: 140px" loading="lazy" />
                    {{ $t('homepage.toolsCard.content[4]') }}
                  </q-card-section>
                </q-card>
                <q-card
                  bordered
                  flat
                  :class="hoverLegacy ? 'bg-grey-2' : ''"
                  class="clickable clickhl col-1 grid-style-transition shadow-7"
                  @click="openURL('https://arborator.ilpga.fr/')"
                >
                  <q-card-section>
                    <q-img src="images/arboratorNano.png" style="width: 52px" loading="lazy" />
                    {{ $t('homepage.toolsCard.content[5]') }}
                  </q-card-section>
                </q-card>
              </q-card-section>
            </div>
          </q-card>
        </section>
      </q-card>
    </div>
    <q-footer>
      <q-item-label caption class="text-center text-grey-3">
        {{ $t('homepage.footertextmadewith') }}
        <q-icon name="favorite" style="font-size: 22px; color: #dd137b; height: 18px; vertical-align: text-bottom" />
        {{ $t('homepage.footertextin') }}
        <img aria-hidden="true" role="presentation" src="/svg/paris.svg" class="" style="color: #dd137b; height: 18px" />
        — v2.0 (20220203)
      </q-item-label>
    </q-footer>
  </q-page>
</template>

<script lang="ts">
import EmailCollectDialog from '../components/Index/EmailCollectDialog.vue';

import {notifyMessage} from 'src/utils/notify';
import {mapActions, mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';

import {openURL, copyToClipboard, LocalStorage} from 'quasar';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'PageIndex',
  components: {
    EmailCollectDialog,
  },
  data() {
    return {
      presentation: `
      Arborator-Grew, a collaborative annotation tool for treebank development. Arborator-Grew combines the features of two preexisting tools: Arborator and Grew. Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version, Grew-match, where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks.
      `,
      hover: false,
      hoverDraft: false,
      hoverQuick: false,
      hoverLegacy: false,
      search: '',
      slide: 'style',
      xcursor: 111,
    };
  },
  computed: {
    myColor(): string {
      return `hsl(${this.xcursor}, 50%, 50%)`;
    },
    ...mapState(useUserStore, ['shareEmail'])
  },
  methods: {
    openURL,
    copy() {
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
          notifyMessage({ message: 'Copied to clipboard!' });
        })
        .catch(() => {
          notifyMessage({ message: 'Failed to copy.' });
        });
    },
    xCoordinate(e: { clientX: number }) {
      this.xcursor = e.clientX;
    },
    scrolldown() {
      const arboheadline = document.getElementById('arboheadline');
      if (arboheadline !== null) {
        arboheadline.scrollIntoView({ behavior: 'smooth' });
      }
    },
  },
});
</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
}

.clickhl:hover {
  color: blue;
}

.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}

.brandinglogo {
  height: 5vw;
}

@media only screen and (max-width: 768px) {
  .brandinglogo {
    height: 14vw;
  }
}

.sectionfscreen {
  height: 100vh;
}

.sectionsize {
  min-height: 80vh;
}
</style>
