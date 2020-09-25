<template>
  <q-card :id="index">
    <!-- <q-toolbar :class="$q.dark.isActive?'text-white':'text-primary'"> -->
    <!-- <q-btn flat round dense icon="undo" :disable="!graphInfo.dirty" @click="undo()"><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" :disable="!graphInfo.redo"><q-tooltip>Redo</q-tooltip></q-btn> -->
    <!-- <q-toolbar-title>
            </q-toolbar-title> -->
    <!-- </q-toolbar> -->
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
        <!-- for checking data : to delete -->
        <q-btn
          v-if="isLoggedIn && $store.getters['config/isTeacher']"
          flat
          round
          dense
          icon="construction"
          @click="checkData"
        >
        </q-btn>
        <q-btn
          v-if="isLoggedIn && $store.getters['config/isTeacher']"
          flat
          round
          dense
          icon="refresh"
          @click="refresh"
        >
        </q-btn>
        <q-btn
          v-if="isLoggedIn && $store.getters['config/isTeacher']"
          flat
          round
          dense
          icon="school"
          :disable="!graphInfo.dirty"
          @click="save('teacher')"
        >
        </q-btn>

        <q-tooltip>Save as teacher</q-tooltip>
        <q-btn
          v-if="isLoggedIn"
          flat
          round
          dense
          icon="save"
          :disable="!graphInfo.dirty"
          @click="save('user')"
        >
          <q-tooltip>Save this tree</q-tooltip>
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

            <q-item clickable v-close-popup @click="showconll()">
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

            <q-item clickable v-close-popup @click="getSVG()">
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
        <q-tab
          v-for="(tree, user) in sentenceData.conlls"
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
          v-for="(tree, user) in sentenceData.conlls"
          :key="user"
          :props="tree"
          :name="user"
        >
          <q-card flat>
            <q-card-section
              :class="($q.dark.isActive ? '' : '') + ' scrollable'"
            >
              <ConllGraph
                ref="conllGraph"
                :conll="tree"
                :user="user"
                :sentenceId="sentenceId"
                :matches="sentenceData.matches"
                :id="
                  searchResult +
                  'conllGraph_' +
                  sentenceId +
                  '_' +
                  index +
                  '_' +
                  user
                "
                @update-conll="onConllGraphUpdate($event)"
                @meta-changed="metaUpdate($event)"
              ></ConllGraph>
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
  </q-card>
</template>

<script>
import ConllGraph from "./ConllGraph";
import api from "../../boot/backend-api";

export default {
  name: "SentenceCard",
  components: {
    ConllGraph,
  },
  props: ["index", "sentence", "sentenceId", "searchResult"],
  data() {
    return {
      tab: "",
      sentenceData: this.$props.sentence,
      // graphInfo: { svgId: '',  draft: '', dirty: false, redo: false, conll: '', user: '' },
      graphInfo: { conllGraph: null, dirty: false, redo: false, user: "" },
      alerts: {
        saveSuccess: { color: "positive", message: "Saved!" },
        saveFail: {
          color: "negative",
          message: "Oops, could not save...",
          icon: "report_problem",
        },
      },
      changed: false,
      shownmetanames: [],
      shownmetas: {},
      view: null,
      sentenceLink: "",
    };
  },

  computed: {
    /**
     * Never used ?!
     * Check if the graph is dirty (I.E. modified but not saved) or open to see if it's supposed to be possible to save
     * @returns {Boolean}
     */
    cannotSave() {
      let dirty = this.graphInfo.dirty;
      let open = this.$store.getters.projectConfig.is_open;
      return !dirty || !open;
    },
    /**
     * Check the store to see if a user is logged in or not
     * @returns {Boolean}
     */
    isLoggedIn() {
      return this.$store.getters["user/isLoggedIn"];
    },
  },
  mounted() {
    this.shownmetanames = this.$store.getters[
      "config/getProjectConfig"
    ].shownmeta;
  },
  methods: {
    // to delete KK
    checkData() {
      console.log("KK props.sentence.conlls", this.sentence.conlls);
      console.log("KK sentenceData", this.sentenceData);
    },
    refresh() {
      this.$emit("refresh:trees");
      this.$forceUpdate()
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
    /**
     * Show the conll graph
     *
     * @returns void
     */
    showconll() {
      if ("conllGraph" in this.$refs)
        var cg = this.$refs.conllGraph.filter((c) => c.user == this.tab)[0];
      if (cg) cg.openConllDialog();
    },
    /**
     * Get the SVG by creating it using snap arborator plugin and then replacing the placeholder in the current DOM
     * @todo instead of this long string, read the actual css file and put it there.
     *
     * @returns void
     */
    getSVG() {
      // todo: instead of this long string, read the actual css file and put it there.
      var svg = this.graphInfo.conllGraph.snap.treedata.s.toString();
      var style = `<style> 
<![CDATA[  
   .curve {
	stroke: black;
	stroke-width: 1;
	fill: none;
}
.dark .curve {
	stroke: rgb(248, 244, 244);
	stroke-width: 1;
	fill: none;	
}
.arrowhead {
	fill: white;
	stroke: black;
	stroke-width: .8;
}
.FORM {
	fill:black;
	text-align: center;
} 
.dark .FORM {
		fill:rgb(255, 255, 255);
		text-align: center;
	}
.LEMMA {
	font: 15px DejaVu Sans;
	fill: black;
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.dark .LEMMA {
	font: 15px DejaVu Sans;
	fill: rgb(238, 232, 232);
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.MISC-Gloss {
	font: 15px DejaVu Sans;
	fill: rgb(124, 96, 86);
	font-family:sans-serif;
	text-align: center;
	font-style: italic;
} 
.UPOS {
	font: 11px DejaVu Sans;
	fill: rgb(80, 29, 125);
	text-align: center;
} 
.UPOSselected {
	font: 11px DejaVu Sans;
	fill: #dd137bff;
	font-weight: bold;
	text-align: center;
} 
.DEPREL {
	font: 12px Arial;
	fill: #501d7d;
	font-style: oblique;
	font-family:sans-serif;
	cursor:pointer;
	--funcCurveDist:3; /* distance between the function name and the curves highest point */
} 
.dark .DEPREL {
	font: 12px Arial;
	fill: #aab3ff;
	font-style: oblique;
	font-family:sans-serif;
	cursor:pointer;
	--funcCurveDist:3; /* distance between the function name and the curves highest point */
}
    ]]>  
</style> `;

      svg = svg.replace(
        /<desc>Created with Snap<\/desc>/g,
        "<desc>Created with Snap on Arborator</desc>"
      );
      svg = svg.replace(/>/g, ">\n");
      svg = svg.replace(/(<svg.*>)/, "$1\n" + style);
      const url = window.URL.createObjectURL(
        new Blob([svg], { type: "image/svg+xml" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", this.sentenceId + ".svg");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // this.table.exporting = false;
      this.$q.notify({ message: `Files downloaded` });
    },
    /**
     * Handle token click event to display the related dialog
     *
     * @param {Event} event
     * @returns void
     */
    ttselect(event) {
      // triggered if some letters of the sentence are selected
      if ("conllGraph" in this.$refs)
        var cg = this.$refs.conllGraph.filter((c) => c.user == this.tab)[0];
      if (cg)
        cg.openTokenDialog(
          // if the user's conllGraph is open:
          event.srcElement.selectionStart,
          event.srcElement.selectionEnd,
          event.srcElement.value.substring(
            event.srcElement.selectionStart,
            event.srcElement.selectionEnd
          )
        );
    },
    /**
     * @todo undo
     */
    undo() {
      // log("sentenceid", this.$props.sentenceId);
      // log("dirty user");
      // // log(this.data); // undefined
      // // log(this.graphInfo);
      // log(this.$props); // index, projectname, sentence...
      // log("lastsvg", this.graphInfo.svgId);
    },
    /**
     * Save the graph into backend after modifying its metadata and changing it into an object
     *
     * @returns void
     */
    save(mode) {
      var userId = this.$store.getters["user/getUserInfos"].username;
      if (mode == "teacher") {
        userId = "teacher";
      }
      console.log("_________before", JSON.stringify(this.$props.sentence));

      // timestamp in milliseconds type int
      var timestamp = Math.round(Date.now());
      var conll = this.graphInfo.conllGraph.draft.getConll(
        this.graphInfo.conllGraph.snap.treedata
      );
      conll = conll.replace(
        /# user_id = .+\n/,
        "# user_id = " +
          this.$store.getters["user/getUserInfos"].username +
          "\n"
      );
      conll = conll.replace(
        /# timestamp = \d+(\.\d*)?\n/,
        "# timestamp = " + timestamp + "\n"
      );
      this.$props.sentence.conlls["teacher"] = "bala";
      // this.$props.sentence.conlls["teacher"] = conll;
      console.log("_________after", this.$props.sentence);
      console.log("KK conll", conll);

      var data = {
        trees: [
          {
            sent_id: this.sentenceId,
            conll: conll,
            sample_name: this.$props.sentence.samplename,
          },
        ],
        user_id: userId,
      };
      console.log("data", data);
      api
        .saveTrees(this.$route.params.projectname, data)
        .then((response) => {
          if (response.status == 200) {
            this.graphInfo.dirty = false;
            // console.log("status", this.graphInfo.dirty);
            // console.log("user", this.$store.getters['user/getUserInfos'].username);
            this.showNotif("top", "saveSuccess");
            this.sentenceData.conlls[
              this.$store.getters["user/getUserInfos"].username
            ] = conll;
            this.$forceUpdate();
            this.tab = userId;
          }
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
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
    /**
     * Update shown metadata considering the event payload
     *
     * @param {Event} metas
     * @returns void
     */
    metaUpdate(metas) {
      this.shownmetas = Object.keys(metas)
        .filter((m) => this.shownmetanames.includes(m))
        .map((m) => ({ a: m, v: metas[m] }));
      if (metas.text) this.sentenceData.sentence = metas.text;
    },
    /**
     * Open the metadata dialog considering the conllGraph related function
     *
     * @returns void
     */
    openMetaDialog() {
      // "this.tab" contains the user name, calls the openMetaDialog function in ConllGraph.vue
      this.$refs.conllGraph
        .filter((c) => c.user == this.tab)[0]
        .openMetaDialog();
    },
    /**
     * Never used ?!
     * Auto open the conll graph component related to the current user. Never used due to computing time slowing down the whole interface.
     *
     * @param {String} user
     * @returns void
     */
    autoopen(user) {
      console.log(
        4444545454,
        "conllGraph_" + this.sentenceId + "_" + this.index + "_" + user
      );
      // called from Sample.vue to open specific tree
      if ("tab" + user in this.$refs) {
        var usertab = this.$refs["tab" + user][0];
        usertab.__activate();
        setTimeout(() => {
          document
            .getElementById(
              "conllGraph_" + this.sentenceId + "_" + this.index + "_" + user
            )
            .scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
        }, 1000);
      } else {
        var t = Object.keys(this.$refs).filter((c) => c.includes("tab"))[0];
        if (t != undefined && t.length > 3) this.autoopen(t.substring(3));
      }
    },
    /**
     * Show a notification. Wrapper considering parameters
     * @deprecated should use this.$q.notify instead. Global params are already set
     *
     * @param {String} position 'top-right' etc
     * @param {String} alert 'warn', ect.
     * @returns void
     */
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