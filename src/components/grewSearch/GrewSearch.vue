<template>
  <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]" style="z-index: 999">
    <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="grewDialog = !grewDialog">
      <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{ $t('projectView.tooltipFabGrew') }}
      </q-tooltip>
    </q-btn>
  </q-page-sticky>
  <q-dialog v-model="grewDialog" seamless position="right" full-width>
    <GrewRequestCard 
      :parent-on-search="onSearch" 
      :parent-on-try-rules="onTryRules" 
      :grewquery="$route.query.q || ''"
      :parent-on-show-diffs="onShowDiffs"
    ></GrewRequestCard>
  </q-dialog>
  <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade">
    <ResultView
      :searchresults="resultSearch"
      :totalsents="sentenceCount"
      :searchscope="searchScope"
      :parent-on-show-table="onShowTable"
      :query-type="queryType"
    ></ResultView>
  </q-dialog>
</template>

<script lang="ts">
import GrewRequestCard from './GrewRequestCard.vue';
import ResultView from '../ResultView.vue';
import api from '../../api/backend-api';
import {useGrewSearchStore} from 'src/pinia/modules/grewSearch';
import {mapWritableState, mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';
import {notifyError} from 'src/utils/notify';
import {defineComponent, PropType} from 'vue';
import {grewSearchResult_t} from 'src/api/backend-types';
import {sentenceConllToJson, SentenceJson} from "conllup/lib/conll";

export default defineComponent({
  components: {
    GrewRequestCard,
    ResultView,
  },
  props: {
    sentenceCount: {
      type: Number as PropType<number>,
      required: true,
    },
    searchScope: {
      type: String as PropType<string>,
      required: true,
    }
  },
  data() {
    const result: {
      resultSearchDialog: boolean,
      resultSearch: grewSearchResult_t,
      queryType: string,
      window: { width: number; height: number },
    } = {
      resultSearchDialog: false,
      resultSearch: {},
      queryType: "",
      window: {width: 0, height: 0},
    };
    return result
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    ...mapState(useUserStore, ['username']),
  },
  methods: {

    onShowTable(resultSearchDialog: any) {
      this.resultSearchDialog = resultSearchDialog;
      this.grewDialog = false;
    },
    onSearch(searchPattern: string, userType: string) {
      const data = {pattern: searchPattern, userType: userType};
      this.queryType = 'SEARCH';
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({error});
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({error});
          });
      }
    },
    onTryRules(query: string, userType: string) {
      const sampleId = (this.$route.params.samplename as string) || null;
      this.queryType = 'REWRITE';
      api
        .tryPackage(this.$route.params.projectname as string, sampleId, query, userType)
        .then((response) => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data;
        })
        .catch((error) => {
          notifyError({
            error: error.response.data.message,
          });
        });
    },
    onShowDiffs(userType: string) {
      if (userType !== "all") {
        return
      }
      const data = {pattern: "pattern { }", userType: userType};

      function sentencesJsonHaveDiffs(leftSentenceJson: SentenceJson, rightSentenceJson: SentenceJson): boolean {
        const leftNodesJson = leftSentenceJson.treeJson.nodesJson
        const rightNodesJson = rightSentenceJson.treeJson.nodesJson
        if (Object.values(leftNodesJson).length !== Object.values(rightNodesJson).length) {
          return true
        }
        // both tree have same token length
        for (const tokenId in leftNodesJson) {
          const leftToken = leftNodesJson[tokenId]
          const rightToken = rightNodesJson[tokenId]
          if (JSON.stringify(leftToken) !== JSON.stringify(rightToken)) {
            return true
          }
        }
        return false
      }

      function postProcessDiffs(grewSearchResult: grewSearchResult_t, thisUserId: string): grewSearchResult_t {
        const postProcessedResult: grewSearchResult_t = {}
        for (const sampleName in grewSearchResult) {
          postProcessedResult[sampleName] = {}
          for (const sentId in grewSearchResult[sampleName]) {
            if (grewSearchResult[sampleName][sentId].conlls[thisUserId]) {
              const usersThatHaveDiffs: string[] = [];
              const userSentenceJson = sentenceConllToJson(grewSearchResult[sampleName][sentId].conlls[thisUserId])
              for (const otherUserId in grewSearchResult[sampleName][sentId].conlls) {
                if (otherUserId !== thisUserId) {
                  // different tree, we can compare the tree and look for diffs
                  const otherSentenceJson = sentenceConllToJson(grewSearchResult[sampleName][sentId].conlls[otherUserId])
                  if (sentencesJsonHaveDiffs(userSentenceJson, otherSentenceJson)) {
                    usersThatHaveDiffs.push(otherUserId);
                  }
                }
              }
              if (usersThatHaveDiffs.length >= 1) {
                // user tree has differences with at least another tree, adding them
                postProcessedResult[sampleName][sentId] = {
                  sentence: grewSearchResult[sampleName][sentId].sentence,
                  sample_name: grewSearchResult[sampleName][sentId].sample_name,
                  conlls: {},
                  matches: {},
                  packages: {},
                }
                postProcessedResult[sampleName][sentId].conlls[thisUserId] = grewSearchResult[sampleName][sentId].conlls[thisUserId]
                for (const otherUserId of usersThatHaveDiffs) {
                  postProcessedResult[sampleName][sentId].conlls[otherUserId] = grewSearchResult[sampleName][sentId].conlls[otherUserId]
                }
              }
            }
          }
        }
        return postProcessedResult
      }

      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, data)
          .then((response) => {
            this.resultSearch = postProcessDiffs(response.data, this.username);
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({error});
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, data)
          .then((response) => {
            this.resultSearch = postProcessDiffs(response.data, this.username);
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({error});
          });
      }
    }
  },
});
</script>

<style></style>
