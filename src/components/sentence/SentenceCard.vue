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
      <q-tab-panels v-model="tab" keep-alive>
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
                :conll="tree"
                :sentenceId="sentenceId"
                :sentenceBus="sentenceBus"
                :userId="user"
                :conllSavedCounter="conllSavedCounter"
                :teacherConll="
                  (exerciseLevel <= 2 || isAdmin) && user !== 'teacher'
                    ? sentenceData.conlls.teacher
                    : ''
                "
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
    <TokenDialog :sentenceBus="sentenceBus" @changed:metaText="changeMetaText" />
    <StatisticsDialog
      :sentenceBus="sentenceBus"
      :conlls="sentenceData.conlls"
    />
  </q-card>
</template>

<script>
import Vue from "vue";

import { mapGetters } from "vuex";

// import ConllGraph from "./ConllGraph.vue";
import api from "../../boot/backend-api";

import VueDepTree from "./VueDepTree.vue";
import RelationDialog from "./RelationDialog.vue";
import UposDialog from "./UposDialog.vue";
import FeaturesDialog from "./FeaturesDialog.vue";
import MetaDialog from "./MetaDialog.vue";
import ConlluDialog from "./ConlluDialog.vue";
import ExportSVG from "./ExportSVG.vue";
import TokenDialog from "./TokenDialog.vue";
import StatisticsDialog from "./StatisticsDialog.vue";

// ArboratorDraft is the svg tree handler
const arboratorDraft = new ArboratorDraft();

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
      tab: "",
      sentenceData: this.$props.sentence,
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
    };
  },

  computed: {
    ...mapGetters("config", [
      // "visibility",
      "isAdmin",
      "isGuest",
      "guests",
      "admins",
      // "image",
      "exerciseMode",
    ]),
    // ...mapGetters("sample", ["exerciseLevel"]), //module store is not set yet
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
  },
  mounted() {
    this.shownmetanames = this.$store.getters[
      "config/getProjectConfig"
    ].shownmeta;

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
        this.sentence.samplename +
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
      const currentTreeUser = this.tab;
      var conll = this.sentenceBus[currentTreeUser].exportConll();

      var changedConllUser = this.$store.getters["user/getUserInfos"].username;
      if (mode == "teacher") {
        changedConllUser = "teacher";
      }

      // TODO add this METAedit() in the tree object
      conll = conll.replace(
        /# user_id = .+\n/,
        "# user_id = " + changedConllUser + "\n"
      );

      const timestamp = Math.round(Date.now());
      conll = conll.replace(
        /# timestamp = \d+(\.\d*)?\n/,
        "# timestamp = " + timestamp + "\n"
      );
      console.log("KK conllu\n", conll);
      var data = {
        trees: [
          {
            sent_id: this.sentenceId,
            conll: conll,
            sample_name: this.$props.sentence.samplename,
          },
        ],
        user_id: changedConllUser,
      };
      console.log("data", data);
      api
        .saveTrees(this.$route.params.projectname, data)
        .then((response) => {
          if (response.status == 200) {
            this.sentenceData.conlls[changedConllUser] = conll;
            this.tab = changedConllUser;
            // this.sentenceBus.$emit("saved:tree", {userId: changedConllUser})
            this.conllSavedCounter++;
            this.graphInfo.dirty = false;
            this.showNotif("top", "saveSuccess");
          }
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
      // var conll = this.sentenceBus[this.tab]
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
      this.sentenceData.sentence = newMetaText
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

<style scoped>
.scrollable {
  overflow: scroll;
}
</style>