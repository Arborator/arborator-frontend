<template>
  <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]"
                 style="z-index: 999">
    <q-btn-group v-if="showGrewBtn" push flat rounded>
      <q-btn v-if="isLoggedIn" push color="primary" no-caps @click="openGrewDialog('user')">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
          {{ $t('projectView.tooltipFabGrewUser') }}
        </q-tooltip>
        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"/></q-avatar>
        <q-icon v-else name="account_circle"/>
      </q-btn>
      <q-btn v-if="isLoggedIn && canSeeOtherUsersTrees" push color="primary" no-caps
             @click="openGrewDialog('user_recent')">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
          {{ $t('projectView.tooltipFabGrewUserRecent') }}
        </q-tooltip>
        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"/></q-avatar>
        <q-icon v-else name="account_circle"/>
        <div>+</div>
      </q-btn>
      <q-btn v-if="canSeeOtherUsersTrees" push icon="schedule" color="primary" no-caps
             @click="openGrewDialog('recent')">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
          {{ $t('projectView.tooltipFabGrewRecent') }}
        </q-tooltip>
      </q-btn>
      <q-btn v-if="canSeeOtherUsersTrees" push icon="groups" color="primary" no-caps @click="openGrewDialog('all')">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
          {{ $t('projectView.tooltipFabGrewAll') }}
        </q-tooltip>
      </q-btn>
    </q-btn-group>
    <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="showGrewBtn = !showGrewBtn">
      <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{ $t('projectView.tooltipFabGrew') }}
      </q-tooltip>
    </q-btn>
  </q-page-sticky>
  <q-dialog v-model="grewDialog" seamless position="right" full-width>
    <GrewRequestCard :parent-on-search="onSearch" :parent-on-try-rules="onTryRules" :grewquery="$route.query.q || ''"
                     :userType="userType" :parent-on-show-diffs="onShowDiffs"></GrewRequestCard>
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
import {useProjectStore} from 'src/pinia/modules/project';
import {useUserStore} from 'src/pinia/modules/user';
import {notifyError} from 'src/utils/notify';
import {defineComponent, PropType} from 'vue';
import {grewSearchResult_t} from 'src/api/backend-types';
import {sentenceConllToJson, SentenceJson} from "conllup/lib/conll";

type userType_t = 'user' | 'user_recent' | 'recent' | 'all'
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
      showGrewBtn: boolean,
      resultSearch: grewSearchResult_t
      queryType: string,
      userType: userType_t,
      rulesGrew: any,
      window: { width: number; height: number },
    } = {
      resultSearchDialog: false,
      showGrewBtn: false,
      resultSearch: {},
      queryType: "",
      userType: "user",
      rulesGrew: {},
      window: {width: 0, height: 0},
    };
    return result
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    ...mapState(useProjectStore, ['canSeeOtherUsersTrees']),
    ...mapState(useUserStore, ['isLoggedIn', 'avatar', 'username']),
  },
  methods: {
    openGrewDialog(userType: userType_t) {
      this.grewDialog = true;
      this.userType = userType;
    },
    onShowTable(resultSearchDialog: any) {
      this.resultSearchDialog = resultSearchDialog;
      this.grewDialog = false;
    },
    onSearch(searchPattern: string) {
      const data = {pattern: searchPattern, userType: this.userType};
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
    onTryRules(query: string) {
      const sampleId = (this.$route.params.samplename as string) || null;
      this.queryType = 'REWRITE';
      api
        .tryPackage(this.$route.params.projectname as string, sampleId, query, this.userType)
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
    onShowDiffs() {
      if (this.userType !== "all") {
        return
      }
      const data = {pattern: "pattern { }", userType: this.userType};

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
