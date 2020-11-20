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
    <GrewSearch :sentenceCount="sentenceCount"/>

  </q-page>
</template>

<script>
import Vue from "vue";

import { mapGetters } from "vuex";

import { LocalStorage, openURL } from "quasar";

import api from "../boot/backend-api";

import Store from "../store/index";

import SentenceCard from "../components/sentence/SentenceCard";
import GrewSearch from "../components/grewSearch/GrewSearch";


var heavyList = [];

export default {
  components: {
    SentenceCard,
    GrewSearch,
  },
  props: ["projectname", "samplename", "nr", "user"],
  data() {
    return {
      exerciseLevel: 4,
      svg: "",
      tab: "gold",
      loading: true,
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
    // getRelationTable(type) {
    //   // var data = { table_type:type};
    //   // console.log(type, data);
    //   var data = { table_type: type };
    //   api
    //     .getRelationTable(this.$route.params.projectname, data)
    //     .then((response) => {
    //       this.relationTableInfos = response.data;
    //       this.relationTableDial = true;
    //     })
    //     .catch((error) => {
    //       this.$store.dispatch("notifyError", { error: error });
    //     });
    // },
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

    // onSearch(searchPattern) {
    //   var query = { pattern: searchPattern };
    //   api
    //     .searchSample(this.projectname, this.samplename, query)
    //     .then((response) => {
    //       // console.log(555,response.data)
    //       this.resultSearch = response.data;
    //       this.resultSearchDialog = true;
    //     })
    //     .catch((error) => {
    //       this.$store.dispatch("notifyError", { error: error });
    //     });
    // },
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

