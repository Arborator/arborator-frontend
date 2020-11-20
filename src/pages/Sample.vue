<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div v-show="!loading" class="q-pa-md row q-gutter-md">
      <q-virtual-scroll
        ref="virtualListRef"
        :items="sentencesFrozen.list"
        style="max-height: 95vh; width: 99vw"
        :virtual-scroll-slice-size="7"
        :virtual-scroll-item-size="200"
      >
        <template v-slot="{ item, index }">
          <SentenceCard
            :key="index"
            :ref="'sc' + index"
            :id="'sc' + index"
            :sentence="sentences[item]"
            :index="index"
            :sentenceId="item"
            searchResult=""
            v-on:refresh:trees="getSampleTrees"
            :exerciseLevel="exerciseLevel"
          >
          </SentenceCard>
        </template>
      </q-virtual-scroll>
    </div>
    <div v-show="loading" class="q-pa-md row justify-center">
      <div class="absolute-center">
        <q-circular-progress
          indeterminate
          size="70px"
          :thickness="0.22"
          color="primary"
          track-color="grey-3"
        />
      </div>
    </div>

    <template
      v-if="
        !(
          $store.getters['config/exerciseMode'] &&
          !$store.getters['config/isTeacher']
        )
      "
    >
      <q-page-sticky
        :position="breakpoint ? 'bottom-right' : 'bottom-right'"
        :offset="breakpoint ? [18, 18] : [30, 80]"
        style="z-index: 999"
      >
        <q-btn
          size="20px"
          round
          @click="searchDialog = !searchDialog"
          color="primary"
          icon="img:../statics/svg/g.svg"
        >
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            Search with Grew in this sample
          </q-tooltip>
        </q-btn>
      </q-page-sticky>
      <q-page-sticky
        :position="breakpoint ? 'bottom-right' : 'bottom-right'"
        :offset="breakpoint ? [18, 88] : [30, 10]"
        style="z-index: 999"
      >
        <q-btn-group push flat rounded v-if="reltablebuttons">
          <q-btn @click="getRelationTable('user')" push color="primary" no-caps>
            <q-tooltip
              content-class="bg-primary"
              content-style="font-size: 16px"
            >
              View only my trees
            </q-tooltip>
            <q-avatar v-if="isLoggedIn" size="1.2rem"
              ><img :src="avatar"
            /></q-avatar>
            <q-icon v-else name="account_circle" />
          </q-btn>
          <q-btn
            @click="getRelationTable('user_recent')"
            push
            color="primary"
            no-caps
          >
            <q-tooltip
              content-class="bg-primary"
              content-style="font-size: 16px"
            >
              View my trees, filled up with the most recent trees
            </q-tooltip>
            <q-avatar v-if="isLoggedIn" size="1.2rem"
              ><img :src="avatar"
            /></q-avatar>
            <q-icon v-else name="account_circle" />
            <div>+</div>
          </q-btn>
          <q-btn
            @click="getRelationTable('recent')"
            push
            icon="schedule"
            color="primary"
            no-caps
            v-if="isAdmin || isSuperAdmin"
          >
            <q-tooltip
              content-class="bg-primary"
              content-style="font-size: 16px"
            >
              View most recent trees
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="getRelationTable('all')"
            push
            icon="ion-md-globe"
            color="primary"
            no-caps
            v-if="isAdmin || isSuperAdmin"
          >
            <q-tooltip
              content-class="bg-primary"
              content-style="font-size: 16px"
            >
              View all trees
            </q-tooltip>
          </q-btn>
        </q-btn-group>
        <q-btn
          size="20px"
          round
          @click="reltablebuttons = !reltablebuttons"
          color="primary text-green"
          icon="ion-md-grid"
        >
          <q-tooltip content-class="bg-primary" content-style="font-size: 16px">
            Get Relation Tables
          </q-tooltip>
        </q-btn>
      </q-page-sticky>

      <q-dialog v-model="searchDialog" seamless position="right" full-width>
        <!-- v-if="false" -->
        <GrewRequestCard
          :parentOnSearch="onSearch"
          :grewquery="$route.query.q || ''"
        ></GrewRequestCard>
      </q-dialog>
    </template>

    <q-dialog
      v-model="resultSearchDialog"
      transition-show="fade"
      transition-hide="fade"
    >
      <result-view
        :searchresults="resultSearch"
        :totalsents="sentenceCount"
        searchscope="sample"
      ></result-view>
    </q-dialog>

    <q-dialog
      v-model="relationTableDial"
      transition-show="fade"
      transition-hide="fade"
    >
      <relation-table :edges="relationTableInfos"></relation-table>
    </q-dialog>
  </q-page>
</template>

<script>
import Vue from "vue";
// Vue.config.ignoredElements = ["conll"];
import { LocalStorage, openURL } from "quasar";
import api from "../boot/backend-api";
import Store from "../store/index";
import SentenceCard from "../components/sentence/SentenceCard";
import RelationTable from "../components/RelationTable";
import GrewRequestCard from "../components/GrewRequestCard";
import ResultView from "../components/ResultView";

import { mapGetters } from "vuex";

var heavyList = [];

export default {
  components: {
    SentenceCard,
    GrewRequestCard,
    ResultView,
    RelationTable,
  },
  props: ["projectname", "samplename", "nr", "user"],
  data() {
    return {
      exerciseLevel: 4,
      svg: "",
      tab: "gold",
      loading: true,
      searchDialog: false,
      resultSearchDialog: false,
      relationTableDial: false,
      relationTableInfos: {},
      reltablebuttons: false,
      resultSearch: {},
      sentences: {},
      sentencesFrozen: { list: [], indexes: {} },
      window: { width: 0, height: 0 },
      virtualListIndex: 15,
      intri: 10, // give the scroll 10 seconds
    };
  },
  computed: {
    ...mapGetters("config", [
      "isAdmin",
      "isGuest",
      "guests",
      "admins",
      "image",
      "exerciseMode",
    ]),
    ...mapGetters("user", [
      "isLoggedIn",
      "isSuperAdmin",
      "loggedWithGithub",
      "avatar",
    ]),
    sentenceCount() {
      return Object.keys(this.sentences).length;
    },
    breakpoint() {
      return this.window.width <= 400;
    },
  },
  created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
  mounted() {
    this.getSampleTrees();
    // this.getProjectConfig();
    document.title =
      this.$route.params.projectname + "/" + this.$route.params.samplename;
    if (this.$route.query.q && this.$route.query.q.length > 0)
      this.searchDialog = true;
    LocalStorage.remove("save_status");
    // console.log(this.isAdmin || this.isSuperAdmin,this.isAdmin, this.isSuperAdmin)
  },
  beforeRouteLeave(to, from, next) {
    if (this.$store.getters.getPendingModifications.size > 0) {
      const answer = window.confirm(
        "Do you really want to leave? you have unsaved changes!"
      );
      if (answer) {
        this.$store.commit("empty_pending_modification");
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },
    getSampleTrees() {
      this.loading = true;
      api
        .getSampleTrees(this.projectname, this.samplename)
        .then((response) => {
          this.sentences = response.data.sample_trees;
          this.exerciseLevel = response.data.exercise_level;
          this.freezesentences();
          this.$forceUpdate();
          this.loading = false;
          // console.log(777777,this.$route.params.nr in this.sentences,this.$refs.virtualListRef)
          if (this.$refs && this.$refs.virtualListRef && this.$route.params.nr)
            this.intr = setInterval(() => {
              this.scrolala();
            }, 1000);
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          this.loading = false;
        });
    },
    getRelationTable(type) {
      // var data = { table_type:type};
      // console.log(type, data);
      var data = { table_type: type };
      api
        .getRelationTable(this.$route.params.projectname, data)
        .then((response) => {
          this.relationTableInfos = response.data;
          this.relationTableDial = true;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    scrolala() {
      // console.log("***scrolala", this.$route.params.user) //&& this.$route.params.user!=undefined
      if (
        !this.loading &&
        this.$refs &&
        this.$refs.virtualListRef &&
        this.$route.params.nr != undefined &&
        parseInt(this.$route.params.nr) <= this.sentencesFrozen.list.length
      ) {
        var id = parseInt(this.$route.params.nr) - 1;
        this.$refs.virtualListRef.scrollTo(id);
        clearInterval(this.intr);
        setTimeout(() => {
          if ("sc" + id in this.$refs)
            this.$refs["sc" + id].autoopen(this.$route.params.user);
        }, 2000);
      }
      this.intri--;
      if (!this.intri) clearInterval(this.intr);
    },

    onSearch(searchPattern) {
      var query = { pattern: searchPattern };
      api
        .searchSample(this.projectname, this.samplename, query)
        .then((response) => {
          // console.log(555,response.data)
          this.resultSearch = response.data;
          this.resultSearchDialog = true;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    // closeSearchDialog(searchDialog) { searchDialog = this.searchDialog; },
    // commit() {
    //     api.commit(this.projectname, this.samplename)
    //     .then(response => {console.log("wooohoo");})
    //     .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
    //     },
    // pullSample() {
    // api.pull(this.projectname, this.samplename)
    // .then(response => {console.log("wooohoo");})
    // .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
    //     },
    freezesentences() {
      var index = 0;
      var listsentences = [];
      var index2sentId = {};
      for (let sentId in this.sentences) {
        listsentences.push(sentId);
        index2sentId[index] = sentId;
        index++;
      }
      heavyList = listsentences;
      Object.freeze(heavyList);
      this.sentencesFrozen = { list: heavyList, indexes: index2sentId };
    },
  },
};
</script>

