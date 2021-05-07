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
            style="width: 65%"
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
        <template v-if="this.tab!==''">
          <q-btn
            v-if="
              isLoggedIn &&
              exerciseLevel <= 3 &&
              !$store.getters['config/isTeacher']
            "
            flat
            round
            dense
            icon="assessment"
            @click="openStatisticsDialog"
            :disable="tab == ''"
            ><q-tooltip>See your annotation errors</q-tooltip>
          </q-btn>

          <q-btn
            v-if="$store.getters['config/isTeacher']"
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
            v-if="$store.getters['config/isTeacher']"
            flat
            round
            dense
            icon="linear_scale"
            :disable="tab == ''"
            @click="save('base_tree')"
          >
            <q-tooltip>Save as base_tree</q-tooltip>
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
            v-if="isLoggedIn && !$store.getters['config/isTeacher']"
            flat
            round
            dense
            icon="save"
            :disable="tab == '' || !canSave"
            @click="save('')"
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
          <q-btn
            v-if="isLoggedIn && $store.getters['config/isTeacher']"
            flat
            round
            dense
            icon="filter_9_plus"
            :disable="tab == ''"
            @click="openMultiEditDialog"
          >
            <q-tooltip>multi edit dialog</q-tooltip>
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
          <q-btn
            v-if="isLoggedIn"
            flat
            round
            dense
            icon="undo"
            :disable="tab == '' || !canUndo"
            @click="undo('user')"
            v-bind:class="'undo-button'"
          >
          </q-btn>
          <q-btn
            v-if="isLoggedIn"
            flat
            round
            dense
            icon="ion-redo"
            :disable="tab == '' || !canRedo"
            @click="redo('user')"
            v-bind:class="'redo-button'"
          >
          </q-btn>
          <q-btn
            v-if="isLoggedIn"
            flat
            round
            dense
            icon="add"
            :disable="tab == ''"
            @click="addEmptyToken()"
          >
            <q-tooltip>Add an new empty token in the tree</q-tooltip>
          </q-btn>
        </template>
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
          :alert="hasPendingChanges[user] ? 'orange' : ''"
          :alert-icon="hasPendingChanges[user] ? 'save' : ''"
          :icon="diffMode && user === diffUserId ? 'school' : 'person'"
          no-caps
          :ripple="false"
          :ref="'tab' + user"
          @click="handleTabChange"
          ><q-tooltip v-if="hasPendingChanges[user]"
            >The tree has some pendings modifications not saved</q-tooltip
          ></q-tab
        >
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
                v-on:statusChanged="handleStatusChange"
                :cardId="index"
                :conll="tree"
                :reactiveSentence="reactiveSentencesObj[user]"
                :teacherReactiveSentence="
                  showDiffTeacher
                    ? reactiveSentencesObj['teacher']
                    : diffMode
                    ? reactiveSentencesObj[diffUserId]
                    : {}
                "
                :sentenceId="sentenceId"
                :sentenceBus="sentenceBus"
                :userId="user"
                :conllSavedCounter="conllSavedCounter"
                :hasPendingChanges="hasPendingChanges"
              ></VueDepTree>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
      <q-list class="sentence__meta-features" v-if="tab" dense>
        <q-item v-for="meta in shownmeta" :key="meta">
          <q-chip dense size="xs">{{ meta }}</q-chip
          >{{ reactiveSentencesObj[tab].state.metaJson[meta] }}
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
      :reactiveSentencesObj="reactiveSentencesObj"
      @changed:metaText="changeMetaText"
    />
    <MultiEditDialog
      :sentenceBus="sentenceBus"
      :reactiveSentencesObj="reactiveSentencesObj"
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

import { LocalStorage } from "quasar";

import api from "../../boot/backend-api";

// import { ReactiveSentence } from "../../helpers/ReactiveSentence"; // for test ony at the moment
import { ReactiveSentence } from "../../reactiveSentence/ReactiveSentence"; // for test ony at the moment

import VueDepTree from "./VueDepTree.vue";
import RelationDialog from "./RelationDialog.vue";
import UposDialog from "./UposDialog.vue";
import FeaturesDialog from "./FeaturesDialog.vue";
import MetaDialog from "./MetaDialog.vue";
import ConlluDialog from "./ConlluDialog.vue";
import ExportSVG from "./ExportSVG.vue";
import TokenDialog from "./TokenDialog.vue";
import StatisticsDialog from "./StatisticsDialog.vue";
import MultiEditDialog from "./MultiEditDialog.vue";
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
    MultiEditDialog,
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
      canUndo: false,
      canRedo: false,
      canSave: false,
      hasPendingChanges: {},
    };
  },

  computed: {
    ...mapGetters("config", [
      "isAdmin",
      "isGuest",
      "guests",
      "admins",
      "exerciseMode",
      "shownmeta",
    ]),
    usersConll() {
      return Object.keys(this.sentenceData.conlls)
    },
    showDiffTeacher() {
      return this.exerciseMode && this.exerciseLevel <= 2;
    },
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
      let filteredConlls = this.sentenceData.conlls
      if (this.exerciseLevel != 1 && !this.isAdmin && this.exerciseMode) {
        filteredConlls = Object.filter(
          this.sentenceData.conlls,
          ([user, conll]) => user != "teacher"
        );
      } 
      return this.orderConlls(filteredConlls)
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
    diffUserId() {
      let value = this.$store.getters["config/diffUserId"];
      return value ? value : this.userId;
    },
  },
  created() {
    this.shownmetanames = this.$store.getters[
      "config/getProjectConfig"
    ].shownmeta;

    for (const [userId, conll] of Object.entries(this.sentence.conlls)) {
      const reactiveSentence = new ReactiveSentence();
      reactiveSentence.fromSentenceConll(conll);
      this.reactiveSentencesObj[userId] = reactiveSentence;
      this.hasPendingChanges[userId] = false;
    }

    this.diffMode = !!this.$store.getters["config/diffMode"];

    this.sentenceBus.$on("changed:metaText", ({ newMetaText }) => {
      this.changeMetaText(newMetaText);
    });
  },
  methods: {
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
    openMultiEditDialog() {
      this.sentenceBus.$emit("open:openMultiEditDialog", { userId: this.tab });
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
    undo(mode) {
      if (this.tab !== "") {
        this.sentenceBus.$emit("action:undo", {
          userId: this.tab,
        });
      }
    },
    redo(mode) {
      if (this.tab !== "") {
        this.sentenceBus.$emit("action:redo", {
          userId: this.tab,
        });
      }
    },
    addEmptyToken() {
      if (this.tab !== "") {
        this.sentenceBus.$emit("action:addEmptyToken", {
          userId: this.tab,
        });
      }
    },
    /**
     * Receive canUndo, canRedo status from VueDepTree child component and
     * decide whether to disable undo, redo buttons or not
     */
    handleStatusChange(event) {
      this.canUndo = event.canUndo;
      this.canRedo = event.canRedo;
      this.canSave = event.canSave;
    },
    /**
     * triggers when the user selects another tab, and update canUndo, canRedo,
     * canSave status
     */
    handleTabChange() {
      // wait for 10ms until this.tab get changed
      setTimeout(() => {
        this.sentenceBus.$emit("action:tabSelected", {
          userId: this.tab,
        });
        const newMetaText = this.reactiveSentencesObj[
          this.tab
        ].getSentenceText();
        this.sentenceBus.$emit("changed:metaText", { newMetaText });
      }, 10);
    },
    /**
     * Save the graph to backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    save(mode) {
      const openedTreeUser = this.tab;

      var changedConllUser = this.$store.getters["user/getUserInfos"].username;
      if (mode) {
        changedConllUser = mode;
      }

      const metaToReplace = {
        user_id: changedConllUser,
        timestamp: Math.round(Date.now()),
      };

      const exportedConll = this.reactiveSentencesObj[
        openedTreeUser
      ].exportConllWithModifiedMeta(metaToReplace);

      var data = {
        sent_id: this.sentenceId,
        conll: exportedConll,
        user_id: changedConllUser,
      };
      api
        .updateTree(
          this.$route.params.projectname,
          this.$props.sentence.sample_name,
          data
        )
        .then((response) => {
          if (response.status == 200) {
            this.sentenceBus.$emit("action:saved", {
              userId: this.tab,
            });
            if (this.sentenceData.conlls[changedConllUser]) { 
              // the user already had a tree
              this.hasPendingChanges[changedConllUser] = false;
              this.sentenceData.conlls[changedConllUser] = exportedConll;
              this.reactiveSentencesObj[
                changedConllUser
              ].fromSentenceConll(exportedConll);
            } else {
              const reactiveSentence = new ReactiveSentence();
              reactiveSentence.fromSentenceConll(exportedConll);
              Vue.set(this.sentenceData.conlls, changedConllUser, exportedConll)
              Vue.set(this.reactiveSentencesObj, changedConllUser, reactiveSentence)
            }
            if (this.tab !== changedConllUser) {
              
              this.tab = changedConllUser;

              if (!this.reactiveSentencesObj[changedConllUser]) {
                Vue.set(this.reactiveSentencesObj, changedConllUser, reactiveSentence)
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
        this.reactiveSentencesObj[this.changedConllUser].fromSentenceConll(
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
        if (otherUserId != this.diffUserId) {
          if (this.sentenceBus[otherUserId]) {
            this.sentenceBus[otherUserId].plugDiffTree(
              this.diffMode ? this.reactiveSentencesObj[this.diffUserId] : {}
            );
            // this.sentenceBus[otherUserId].drawTree()
          }
          this.conllSavedCounter += 1;
        }
      }
    },
    orderConlls(filteredConlls) {
      let users = Object.keys(filteredConlls);
      let sortedUsers = users.sort();

      const orderedConlls = {};
      for (const user of sortedUsers) {
        orderedConlls[user] = filteredConlls[user];
      }
      return orderedConlls;
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
</style>