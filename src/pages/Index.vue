<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <div class="q-py-md q-gutter-sm">
      <section style="min-height: 30vh;" class="q-py-xl">
        <q-card flat style="width: 100%;">
          <q-card-section horizontal>
            <q-card-section vertical class="col-12 col-md-6">
              <q-card-section>
                <div class="text-h3 text-primary text-bold">
                  {{ $t('homepage.title') }}
                </div>
                <div class="text-subtitle1">
                  {{ $t('homepage.subtitle') }}
                </div>
              </q-card-section>
              <q-card-section class="row q-gutter-md">
                <q-btn 
                  no-caps 
                  unelevated 
                  rounded 
                  color="primary" 
                  :label="$t('homepage.accessTreebankBtn')"
                  to="/projects">
                </q-btn>
              </q-card-section>
            </q-card-section>
            <q-card-section vertical class="col-12 col-md-6">
              <div class="text-center">
                <img v-if="$q.dark.isActive" alt="Arborator" src="/svg/arborator.grew.white.svg" class="brandinglogo" />
                <img v-else alt="Arborator" src="/svg/arborator.grew.svg" class="brandinglogo" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </section>
      <section class="row q-ma-none" :class="!$q.platform.is.mobile ? 'sectionsize': ''">
        <q-card flat class="col" style="width: 100%;">
          <q-card-section class="row justify-center text-h4 text-primary text-bold">
            {{ $t('homepage.popularProjects') }}
            <span>
              <q-icon name="trending_up" />
            </span>
          </q-card-section>
          <q-card-section>
            <div v-if="$q.platform.is.mobile" class="q-pa-md row justify-center q-gutter-md">
              <q-virtual-scroll
                :items="popularProjects"
                :virtual-scroll-slice-size="30"
                :virtual-scroll-item-size="200"
              >
                <template #default="{ item }">
                  <div class="q-pa-md row q-gutter-md">
                    <ProjectCard :key="item.id" style="max-width: 80vw" :project="item" :parent-delete-project="deleteProject"></ProjectCard>
                  </div>
                </template>
              </q-virtual-scroll>
            </div>
            <div v-else class="q-pa-md row justify-center q-gutter-md" style="overflow-x: auto;">
              <ProjectCard 
                v-for="project in popularProjects" 
                :key="project.id"
                :style="`max-width: ${projectCardWidth}px;`" 
                :project="project" 
                :parent-delete-project="deleteProject"
              >
              </ProjectCard>
            </div>
          </q-card-section>
        </q-card>
      </section>
      <section class="row sectionsize q-ma-none">
        <q-card flat class="col bg-primary" style="width: 100%;">
          <q-card-section class="q-gutter-md">
            <div class="text-h3 text-center text-white text-bold">
              {{ $t('homepage.aboutAg') }}
            </div>
          </q-card-section>
          <q-card-section horizontal>
            <q-card-section vertical class="col-12 col-md-6">
              <q-card flat style="min-height: 45vh;">
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
                        <q-icon name="img:/svg/sud.svg" size="sm">
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
                        </q-tooltip>
                      </a>.
                    </p>
                  </div>
                </q-card-section>
                <q-card-section class="row justify-center">
                  <img src="/svg/arborator.text.primary.svg" alt="grew" style="height: 7vw" />
                </q-card-section>
              </q-card>
            </q-card-section>
            <q-card-section vertical class="col-12 col-md-6">
              <q-card flat style="min-height: 45vh;">
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
                      <q-icon name="img:/svg/grew.svg" size="md" />
                      <q-tooltip content-class="bg-accent" content-style="font-size: 15px">
                        {{ $t('homepage.grewCard.tooltipGrew') }}
                      </q-tooltip>
                    </a>
                    {{ $t('homepage.grewCard.content[1]') }}
                  </div>
                </q-card-section>
                <q-card-section class="row justify-center">
                  <img src="/svg/grew.svg" alt="grew" style="height: 7vw" />
                </q-card-section>
              </q-card>
            </q-card-section>
          </q-card-section>
        </q-card>
      </section>
      <section class="row sectionsize q-ma-none">
        <q-card flat class="q-pa-md" style="width: 100%;">
          <q-card-section>
            <div class="text-h4 text-primary text-center text-bold">
              {{ $t('homepage.toolsCard.title') }}
            </div>
          </q-card-section>
          <q-card-section class="row q-gutter-md justify-center">
            <q-card 
              bordered 
              :class="hoverDraft ? 'shadow-12' : ''" 
              class="my-card grid-style-transition shadow-2"
              @mouseover="hoverDraft = true" 
              @mouseleave="hoverDraft = false"
              @click="openURL('https://arborator.github.io/draft/live.html')"
            >
              <q-card-section class="row text-weight-light">
                {{ $t('homepage.toolsCard.content[0]') }}
              </q-card-section>
              <q-card-section class="row justify-center">
                <q-img src="images/arboratorNano.png" style="width: 4vw;" loading="lazy" />
              </q-card-section>
            </q-card>
            <q-card 
              bordered 
              :class="hoverLegacy ? 'shadow-12' : ''" 
              class="my-card grid-style-transition shadow-2"
              @mouseover="hoverLegacy = true" 
              @mouseleave="hoverLegacy = false"
              @click="openURL('https://arborator.ilpga.fr/')"
            >
              <q-card-section class="row text-weight-light">
                {{ $t('homepage.toolsCard.content[1]') }}
              </q-card-section>
              <q-card-section class="row justify-center">
                <q-img src="svg/arborator.text.primary.svg" style="width: 10vw;" loading="lazy" />
              </q-card-section>
            </q-card>
            <q-card 
              bordered :class="hoverQuick ? 'shadow-12' : ''" 
              class="my-card grid-style-transition shadow-2"
              @mouseover="hoverQuick = true" 
              @mouseleave="hoverQuick = false"
              @click="openURL('https://elizia.net/legacy-arborator/q.cgi')"
            >
              <q-card-section class="row text-weight-light">
                {{ $t('homepage.toolsCard.content[2]') }}
              </q-card-section>
              <q-card-section class="row justify-center">
                <q-img src="svg/arborator.quick.svg" spinner-color="white" style="width: 140px" loading="lazy" />
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
        <q-card flat>
          <q-card-section class="text-h4 text-primary text-center text-bold">
            {{ $t('homepage.aboutUs') }}
          </q-card-section>
          <q-card-section class="row justify-center">
            <q-card flat class="row q-gutter-md justify-center">
              <q-card flat class="col-md-4">
                <q-card-section>
                  <div class="text-h5 text-primary text-center text-bold">
                    {{ $t('homepage.citeCard.title') }}
                  </div>
                </q-card-section>
                <q-separator inset />
                <q-card-section>
                  <a href="http://www.lrec-conf.org/proceedings/lrec2020/pdf/2020.lrec-1.651.pdf" target="_blank">
                    Gaël Guibon, Marine Courtin, Kim Gerdes, Bruno Guillaume. When Collaborative Treebank Curation
                    Meets
                    Graph Grammars: Arborator With a
                    Grew Back-End Actes de LREC 2020.
                  </a>
                  <q-space />
                  <q-badge class="clickable" @click="copy()">
                    BibTeX
                    <q-tooltip content-class="bg-accent" content-style="font-size: 12px"> Copy to clipboard
                    </q-tooltip></q-badge>
                  <q-card class="clickable text-caption" flat bordered @click="copy()">
                    @InProceedings{guibon-EtAl:2020:LREC, author = {Guibon, Gaël and Courtin, Marine and Gerdes, Kim and
                    Guillaume, Bruno}, title = {When
                    Collaborative Treebank Curation Meets Graph Grammars}, booktitle = {Proceedings of The 12th Language
                    Resources and Evaluation
                    Conference}, month = {May}, year = {2020}, address = {Marseille, France}, publisher = {European
                    Language Resources Association}, pages
                    = {5293--5302}, url = {https://www.aclweb.org/anthology/2020.lrec-1.651} }
                    <q-tooltip content-class="bg-accent" content-style="font-size: 12px"> Copy to clipboard </q-tooltip>
                  </q-card>
                </q-card-section>
              </q-card>
              <q-card flat class="col-md-4">
                <q-card-section>
                  <div class="text-h5 text-primary text-center text-bold">
                    {{ $t('homepage.sourceCard.title') }}
                  </div>
                </q-card-section>
                <q-separator inset />
                <q-card-section>
                  {{ $t('homepage.sourceCard.content[0]') }}
                  <q-btn type="a" href="https://github.com/Arborator" target="_blank" icon="fab fa-github" flat round
                    color="primary" size="md">
                    <q-tooltip content-class="bg-accent" content-style="font-size: 16px">
                      {{ $t('homepage.sourceCard.tooltipGit') }}
                    </q-tooltip>
                  </q-btn>
                  {{ $t('homepage.sourceCard.content[1]') }}<br />
                  {{ $t('homepage.sourceCard.content[2]') }}
                  <a href="https://github.com/Arborator/arborator-frontend/issues" target="_blank">
                    {{ $t('homepage.sourceCard.content[3]') }}
                  </a>
                </q-card-section>
              </q-card>
            </q-card>
          </q-card-section>
        </q-card>
      </section>
    </div>
    <q-footer>
      <q-item-label caption class="text-center text-grey-3">
        {{ $t('homepage.footertextmadewith') }}
        <q-icon name="favorite" style="font-size: 22px; color: #dd137b; height: 18px; vertical-align: text-bottom" />
         v3.0 (2024)
      </q-item-label>
    </q-footer>
  </q-page>
</template>

<script lang="ts">
import ProjectCard from 'src/components/project/ProjectCard.vue';
import api from 'src/api/backend-api';

import { project_extended_t } from 'src/api/backend-types';
import { notifyMessage } from 'src/utils/notify';
import { copyToClipboard, openURL } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Index',
  components: {
    ProjectCard,
  },
  data() {
    const popularProjects: project_extended_t[] = [];
    return {
      hover: false,
      hoverDraft: false,
      hoverQuick: false,
      hoverLegacy: false,
      popularProjects,
      projectCardWidth: 0,
    };
  },
  mounted() {
    this.getPopularProjects();
    this.projectCardWidth = Math.trunc(window.innerWidth / 7);
    window.addEventListener('resize', () => {
      this.projectCardWidth = Math.trunc(window.innerWidth / 7);
    });
  },
  methods: {
    openURL,
    copy() {
      copyToClipboard(
        `@InProceedings{guibon-EtAl:2020:LREC,
          author    = {Guibon, Gaël  and  Courtin, Marine  and  Gerdes, Kim  and  Guillaume, Bruno},
          title     = {When Collaborative Treebank Curation Meets Graph Grammars},
          booktitle      = {Proceedings of The 12th Language Resources and Evaluation Conference},
          month          = {May},
          year           = {2020},
          address        = {Marseille, France},
          publisher      = {European Language Resources Association},
          pages     = {5293--5302},
          url       = {https://www.aclweb.org/anthology/2020.lrec-1.651}
          }`
        )
        .then(() => {
          notifyMessage({ message: 'Copied to clipboard!' });
        })
        .catch(() => {
          notifyMessage({ message: 'Failed to copy.' });
        });
    },
    getPopularProjects() {
      api
        .getPopularProjects()
        .then((response) => {
          response.data.sort((a, b) => b.users.length - a.users.length);
          this.popularProjects = response.data.slice(0, 6);
        })
        .catch((error) => {
          console.log(error);
        })
    },
    deleteProject() {
      console.log('Project delete');
    }
  },
});
</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
}
.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}
.brandinglogo {
  height: 7vw;
}
@media only screen and (max-width: 768px) {
  .brandinglogo {
    height: 14vw;
  }
}
.sectionsize {
  min-height: 60vh;
}
</style>
