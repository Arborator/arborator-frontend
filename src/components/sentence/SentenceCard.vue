<template>
  <q-card :id="index">
    <q-card-section>
      <div class="row items-center">
        <!-- icon="textsms"  ref="self" -->
        <span class="text-grey">{{ index + 1 }}</span>
        <q-chip
          class="text-center"
          :color="$q.dark.isActive ? 'primary' : ''"
          dense
        >
          {{ sentenceId }}</q-chip
        >&nbsp;&nbsp;&nbsp;
        <template>
          <q-input
            style="width: 70%"
            class="row items-center justify-center"
            :value="sentenceData.sentence"
            v-on="$listeners"
            v-bind="$attrs"
            @select="ttselect"
          >
            <template v-slot:prepend>
              <q-icon name="chat_bubble_outline" /><!-- 言 -->
            </template>
          </q-input>
        </template>
        <q-space />
        <q-btn
          v-if="isLoggedIn && exerciseLevel <= 3"
          flat
          round
          dense
          icon="assessment"
          @click="openStatisticsDialog"
          :disable="tab == ''"
          ><q-tooltip>See your annotation errors</q-tooltip>
        </q-btn>

        <q-btn
          v-if="isLoggedIn && $store.getters['config/isTeacher']"
          flat
          round
          dense
          icon="school"
          :disable="tab == ''"
          @click="save('teacher')"
        >
          <q-tooltip>Save as teacher</q-tooltip>
        </q-btn>

        <q-btn
          v-if="isBernardCaron"
          flat
          round
          dense
          icon="face"
          :disable="tab == ''"
          @click="save(EMMETT)"
        >
          <q-tooltip>Save as Emmett</q-tooltip>
        </q-btn>

        <q-btn
          v-if="isLoggedIn"
          flat
          round
          dense
          icon="save"
          :disable="tab == ''"
          @click="save('user')"
        >
          <q-tooltip>Save this tree {{ this.tab }}</q-tooltip>
        </q-btn>

        <!-- TODO : still display the metadata when the user is not logged in, but hide all the buttons for deleting and saving them -->
        <q-btn
          v-if="isLoggedIn"
          flat
          round
          dense
          icon="post_add"
          :disable="tab == ''"
          @click="openMetaDialog()"
        >
          <q-tooltip>Edit this tree's metadata</q-tooltip>
        </q-btn>

        <q-btn-dropdown :disable="tab == ''" icon="more_vert" flat dense>
          <q-tooltip>More</q-tooltip>
          <q-list>
            <q-item
              v-if="!exerciseMode"
              clickable
              v-close-popup
              @click="toggleDiffMode()"
            >
              <q-item-section avatar>
                <q-avatar
                  icon="ion-git-network"
                  color="primary"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >{{ diffMode ? "Leave" : "Enter" }} Diff Mode</q-item-label
                >
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="getlink()">
              <q-item-section avatar>
                <q-avatar
                  icon="ion-md-link"
                  color="primary"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Get direct link to this tree</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="openConllDialog()">
              <q-item-section avatar>
                <q-avatar
                  icon="format_list_numbered"
                  color="primary"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Get CoNLL-U of this tree</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="exportSVG()">
              <q-item-section avatar>
                <q-avatar
                  icon="ion-md-color-palette"
                  color="primary"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Get SVG of this tree</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div class="full-width row justify-end">
        <q-input
          ref="linkinput"
          dense
          v-show="sentenceLink.length != 0"
          class="col-4 self-stretch"
          :value="sentenceLink"
        >
          <template v-slot:prepend>
            <q-icon name="ion-md-link" />
          </template>
        </q-input>
      </div>

      <q-tabs
        v-model="tab"
        :class="
          ($q.dark.isActive ? 'text-grey-5' : 'text-grey-8') + ' shadow-2'
        "
        dense
        :active-color="$q.dark.isActive ? 'info' : 'accent'"
        :active-bg-color="$q.dark.isActive ? '' : 'grey-2'"
      >
        <!-- v-for="(tree, user) in filteredConlls" -->
        <q-tab
          v-for="(tree, user) in filteredConlls"
          :key="user"
          :props="user"
          :label="user"
          :name="user"
          icon="person"
          no-caps
          :ripple="false"
          :ref="'tab' + user"
        />
      </q-tabs>
      <q-separator />
      <q-tab-panels
        v-model="tab"
        keep-alive
        @transition="transitioned"
        :animated="animated ? true : false"
        :class="animated ? 'easeOutSine' : ''"
      >
        <q-tab-panel
          v-for="(tree, user) in filteredConlls"
          :key="user"
          :props="tree"
          :name="user"
        >
          <q-card flat>
            <q-card-section
              :class="($q.dark.isActive ? '' : '') + ' scrollable'"
            >
              <VueDepTree
                v-if="reactiveSentencesObj"
                :conll="tree"
                :reactiveSentence="reactiveSentencesObj[user]"
                :teacherReactiveSentence="
                  exerciseMode
                    ? reactiveSentencesObj['teacher']
                    : diffMode
                    ? reactiveSentencesObj[userId]
                    : {}
                "
                :sentenceId="sentenceId"
                :sentenceBus="sentenceBus"
                :userId="user"
                :conllSavedCounter="conllSavedCounter"
              ></VueDepTree>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
      <q-list dense>
        <q-item v-for="m in shownmetas" :key="m.a">
          <q-chip dense size="xs">{{ m.a }}</q-chip
          >{{ m.v }}
        </q-item>
      </q-list>
    </q-card-section>
    <RelationDialog :sentenceBus="sentenceBus" />
    <UposDialog :sentenceBus="sentenceBus" />
    <FeaturesDialog :sentenceBus="sentenceBus" />
    <MetaDialog :sentenceBus="sentenceBus" />
    <ConlluDialog :sentenceBus="sentenceBus" />
    <ExportSVG :sentenceBus="sentenceBus" />
    <TokenDialog
      :sentenceBus="sentenceBus"
      @changed:metaText="changeMetaText"
    />
    <StatisticsDialog
      :sentenceBus="sentenceBus"
      :conlls="sentenceData.conlls"
    />
  </q-card>
</template>

<script>
import Vue from "vue";

import { mapGetters } from "vuex";

import api from "../../boot/backend-api";

import { ReactiveSentence } from "../../helpers/ReactiveSentence"; // for test ony at the moment

import VueDepTree from "./VueDepTree.vue";
import RelationDialog from "./RelationDialog.vue";
import UposDialog from "./UposDialog.vue";
import FeaturesDialog from "./FeaturesDialog.vue";
import MetaDialog from "./MetaDialog.vue";
import ConlluDialog from "./ConlluDialog.vue";
import ExportSVG from "./ExportSVG.vue";
import TokenDialog from "./TokenDialog.vue";
import StatisticsDialog from "./StatisticsDialog.vue";
import user from "src/store/modules/user";

export default {
  name: "SentenceCard",
  components: {
    VueDepTree,
    RelationDialog,
    UposDialog,
    FeaturesDialog,
    MetaDialog,
    ConlluDialog,
    ExportSVG,
    TokenDialog,
    StatisticsDialog,
  },
  props: ["index", "sentence", "sentenceId", "searchResult", "exerciseLevel"],
  data() {
    return {
      sentenceBus: new Vue(), // Event/Object Bus that communicate between all components
      reactiveSentencesObj: {},
      tab: "",
      animated: false,
      sentenceData: this.$props.sentence,
      EMMETT: "emmett.strickland",
      graphInfo: { conllGraph: null, dirty: false, redo: false, user: "" },
      alerts: {
        saveSuccess: { color: "positive", message: "Saved!" },
        saveFail: {
          color: "negative",
          message: "Oops, could not save...",
          icon: "report_problem",
        },
      },
      conllSavedCounter: 0,
      shownmetanames: [],
      shownmetas: {},
      view: null,
      sentenceLink: "",
      diffMode: false,
    };
  },

  computed: {
    ...mapGetters("config", [
      "isAdmin",
      "isGuest",
      "guests",
      "admins",
      "exerciseMode",
    ]),
    /**
     * Never used ?!
     * Check if the graph is dirty (I.E. modified but not saved) or open to see if it's supposed to be possible to save
     * @returns {Boolean}
     */
    cannotSave() {
      let dirty = this.graphInfo.dirty;
      return !dirty;
    },
    /**
     * Check the store to see if a user is logged in or not
     * @returns {Boolean}
     */
    isLoggedIn() {
      return this.$store.getters["user/isLoggedIn"];
    },
    filteredConlls() {
      Object.filter = (obj, predicate) =>
        Object.fromEntries(Object.entries(obj).filter(predicate));

      if (this.exerciseLevel != 1 && !this.isAdmin) {
        return Object.filter(
          this.sentenceData.conlls,
          ([user, conll]) => user != "teacher"
        );
      } else {
        return this.sentenceData.conlls;
      }
    },
    userId() {
      return this.$store.getters["user/getUserInfos"].username;
    },
    isBernardCaron() {
      return (
        this.$store.getters["user/getUserInfos"].username ==
          "bernard.l.caron" ||
        this.$store.getters["user/getUserInfos"].username == "kirianguiller"
      );
    },
  },
  created() {
    this.shownmetanames = this.$store.getters[
      "config/getProjectConfig"
    ].shownmeta;

    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      reactiveSentence.fromConll(conll);
      this.reactiveSentencesObj[userId] = reactiveSentence;
    }
  },
  methods: {
    // to delete KK
    refresh() {
      this.$emit("refresh:trees");
      this.$forceUpdate();
    },
    /**
     * Set the sentence link and copy it after 500 ms
     *
     * @returns void
     */
    getlink() { 
      this.sentenceLink =
        window.location.href.split(
          "/projects/" + this.$route.params.projectname
        )[0] +
        "/projects/" +
        this.$route.params.projectname +
        "/" +
        this.sentence.sample_name +
        "/" +
        (this.index + 1) +
        "/" +
        this.graphInfo.user;
      setTimeout(() => {
        this.$refs.linkinput.select();
        document.execCommand("copy");
      }, 500);
    },
    openStatisticsDialog() {
      this.sentenceBus.$emit("open:statisticsDialog", { userId: this.tab });
    },
    /**
     * Show the conll graph
     *
     * @returns void
     */
    openConllDialog() {
      this.sentenceBus.$emit("open:conlluDialog", { userId: this.tab });
    },
    /**
     * Get the SVG by creating it using snap arborator plugin and then replacing the placeholder in the current DOM
     * @todo instead of this long string, read the actual css file and put it there.
     *
     * @returns void
     */
    exportSVG() {
      // todo: instead of this long string, read the actual css file and put it there.
      this.sentenceBus.$emit("export:SVG", { userId: this.tab });
    },
    /**
     * Handle token click event to display the related dialog
     *
     * @param {Event} event
     * @returns void
     */
    ttselect(event) {
      // only if a tab is open
      if (this.tab !== "") {
        this.sentenceBus.$emit("open:tokenDialog", {
          userId: this.tab,
          event: event,
        });
      }
    },
    /**
     * @todo undo
     */
    undo() {},
    /**
     * Save the graph to backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    save(mode) {
      const openedTreeUser = this.tab;
      // var conll = this.sentenceBus[currentTreeUser].exportConll();

      var changedConllUser = this.$store.getters["user/getUserInfos"].username;
      if (mode == "teacher") {
        changedConllUser = "teacher";
      }
      if (mode == this.EMMETT) {
        changedConllUser = this.EMMETT;
      }
      const metaToReplace = {
        user_id: changedConllUser,
        timestamp: Math.round(Date.now()),
      };

      const exportedConll = this.reactiveSentencesObj[
        openedTreeUser
      ].exportConllWithModifiedMeta(metaToReplace);

      var data = {
        trees: [
          {
            sent_id: this.sentenceId,
            conll: exportedConll,
            sample_name: this.$props.sentence.sample_name,
          },
        ],
        user_id: changedConllUser,
      };
      // console.log("data", data);
      api
        .saveTrees(this.$route.params.projectname, data)
        .then((response) => {
          if (response.status == 200) {
            if (this.sentenceData.conlls[changedConllUser]) {
              this.sentenceData.conlls[changedConllUser] = exportedConll;
              this.reactiveSentencesObj[changedConllUser].sentenceConll = exportedConll;
            } else {
              const reactiveSentence = new ReactiveSentence();
              reactiveSentence.fromConll(exportedConll);
              this.reactiveSentencesObj[changedConllUser] = reactiveSentence;
              this.sentenceData.conlls[changedConllUser] = exportedConll
            }

            if (this.tab != changedConllUser) {
              console.log("KK this.tab 1", this.tab)

              this.reactiveSentencesObj[openedTreeUser].resetRecentChanges();
              this.tab = changedConllUser;
              console.log("KK this.tab 2", this.tab)

              if (!this.reactiveSentencesObj[changedConllUser]) {
                this.reactiveSentencesObj[
                  changedConllUser
                ] = new ReactiveSentence();
              }

              this.changedConllUser = changedConllUser;
              this.exportedConll = exportedConll;
            }
            this.graphInfo.dirty = false;
            this.showNotif("top", "saveSuccess");
          }
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    transitioned() {
      if (this.exportedConll) {
        this.reactiveSentencesObj[this.changedConllUser].fromConll(
          this.exportedConll
        );
        this.exportedConll = "";
      }
    },
    /**
     * Set the graph infos according to the event payload. This event shoudl be trigerred from the ConllGraph
     *
     * @returns void
     */
    onConllGraphUpdate(payload) {
      this.graphInfo = payload;
      if (this.graphInfo.dirty == true)
        this.$store.commit("add_pending_modification", this.sentenceId);
      else this.$store.commit("remove_pending_modification", this.sentenceId);
    },
    openMetaDialog() {
      // "this.tab" contains the user name
      this.sentenceBus.$emit("open:metaDialog", { userId: this.tab });
    },
    /**
     * Show a notification. Wrapper considering parameters
     * @deprecated should use this.$q.notify instead. Global params are already set
     *
     * @param {String} position 'top-right' etc
     * @param {String} alert 'warn', ect.
     * @returns void
     */
    changeMetaText(newMetaText) {
      this.sentenceData.sentence = newMetaText;
    },

    toggleDiffMode() {
      this.diffMode = !this.diffMode;
      for (const otherUserId in this.reactiveSentencesObj) {
        if (otherUserId != this.userId) {
          if (this.sentenceBus[otherUserId]) {
            this.sentenceBus[otherUserId].plugDiffTree(
              this.diffMode ? this.reactiveSentencesObj[this.userId] : {}
            );
            // this.sentenceBus[otherUserId].drawTree()
          }
          console.log("KK conllSavedCounter+1");
          this.conllSavedCounter += 1;
        }
      }
    },

    showNotif(position, alert) {
      const {
        color,
        textColor,
        multiLine,
        icon,
        message,
        avatar,
        actions,
      } = this.alerts[alert];
      const buttonColor = color ? "white" : void 0;
      this.$q.notify({
        color,
        textColor,
        icon: icon,
        message,
        position,
        avatar,
        multiLine,
        actions: actions,
        timeout: 2000,
      });
    },
  },
};
</script>

<style>
.scrollable {
  overflow: scroll;
}

.custom-fade-enter-active {
  transition: all 0.3s ease;
}
.custom-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.custom-fade-enter, .custom-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

.easeOutSine.q-transition--slide-right-leave-active,
.easeOutSine.q-transition--slide-left-leave-active {
  transition: opacity 1s !important;
}

.easeOutSine.q-transition--slide-right-enter-active,
.easeOutSine.q-transition--slide-left-enter-active {
  transition: opacity 1s !important;
}
/* transition-delay: 2s !important; */

.easeOutSine.q-transition--slide-right-enter,
.easeOutSine.q-transition--slide-left-enter {
  opacity: 0 !important;
  transition-delay: 2s !important;
}

.easeOutSine.q-transition--slide-right-leave-to,
.easeOutSine.q-transition--slide-left-leave-to {
  opacity: 0 !important;
}

.easeOutSine .q-transition--slide-right-leave-from,
.easeOutSine .q-transition--slide-left-leave-from {
  opacity: 1 !important;
}

/* .easeOutCubic .q-transition--slide-right-enter-active,
.easeOutCubic .q-transition--slide-left-enter-active,
.easeOutCubic .q-transition--slide-up-enter-active,
.easeOutCubic .q-transition--slide-down-enter-active,
.easeOutCubic .q-transition--slide-right-leave-active,
.easeOutCubic .q-transition--slide-left-leave-active,
.easeOutCubic .q-transition--slide-up-leave-active,
.easeOutCubic .q-transition--slide-down-leave-active { */
/* easeOutCubic */
/* transition: transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1) !important;
} */
</style>