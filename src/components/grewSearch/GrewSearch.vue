<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 18] : [30, 80]" style="z-index: 999">
      <q-btn-group v-if="grewBtn" push flat rounded>
        <q-btn push color="primary" no-caps @click="userType = 'user', grewDialog = !grewDialog">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewUser')}} </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar" /></q-avatar>
          <q-icon v-else name="account_circle" />
        </q-btn>
        <q-btn push color="primary" no-caps @click="userType = 'user_recent', grewDialog = !grewDialog">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewUserRecent')}} </q-tooltip>
          <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar" /></q-avatar>
          <q-icon v-else name="account_circle" />
          <div>+</div>
        </q-btn>
        <q-btn v-if="isAdmin || isSuperAdmin" push icon="schedule" color="primary" no-caps @click="userType = 'recent', grewDialog = !grewDialog">
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrewRecent')}} </q-tooltip>
        </q-btn>
      </q-btn-group>
      <q-btn size="20px" round color="primary" icon="img:/svg/g.svg" @click="grewBtn = !grewBtn">
        <q-tooltip content-class="bg-primary" content-style="font-size: 16px"> {{$t('projectView.tooltipFabGrew')}} </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog v-model="grewDialog" seamless position="right" full-width>
      <GrewRequestCard :parent-on-search="onSearch" :parent-on-try-rules="onTryRules" :grewquery="$route.query.q || ''"></GrewRequestCard>
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
  </div>
</template>

<script lang="ts">
import GrewRequestCard from './GrewRequestCard.vue';
import ResultView from '../ResultView.vue';
import api from '../../api/backend-api';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { mapWritableState, mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError } from 'src/utils/notify';
import { defineComponent, PropType } from 'vue';
import { grewSearchResult_t } from 'src/api/backend-types';

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
    const resultSearch: grewSearchResult_t = {};
    const queryType = '';
    const userType = '';
    return {
      resultSearchDialog: false,
      grewBtn: false,
      resultSearch,
      queryType,
      userType,
      rulesGrew: {},
      window: { width: 0, height: 0 },
    };
  },
  computed: {
    breakpoint() {
      return this.window.width <= 400;
    },
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    ...mapState(useProjectStore, ['isAdmin']),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'avatar', 'getUserInfos']),
  },
  methods: {
    onShowTable(resultSearchDialog: any) {
      this.resultSearchDialog = resultSearchDialog;
      this.grewDialog = false;
    },
    onSearch(searchPattern: string) {
      const data = { pattern: searchPattern, userType: this.userType };
      this.queryType = 'SEARCH';
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.resultSearchDialog = true;
          })
          .catch((error) => {
            notifyError({ error });
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
  },
});
</script>

<style></style>
