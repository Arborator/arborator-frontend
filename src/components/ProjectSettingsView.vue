<template>
  <q-card
    :class="$q.dark.isActive ? '' : 'bg-blue-grey-1 text-black'"
    class="full"
  >
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">{{ $t("projectSettings").title }}</div>
      <q-space />
      <q-btn dense flat icon="close" v-close-popup>
        <q-tooltip content-class="bg-white text-primary">{{
          $t("projectSettings").windowClose
        }}</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section class="q-pa-sm row q-gutter-md">
      <q-banner rounded class="col-md-4 offset-md-4 col-xs-12 col-sm-12">
        <q-img
          :ratio="16 / 9"
          :src="
            imageEmpty
              ? '../statics/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg'
              : imageCleaned
          "
          basic
        >
          <div class="absolute-bottom text-h6">
            <q-icon
              v-show="infos.visibility == 0"
              name="lock"
              :color="$q.dark.isActive ? 'red-13' : 'negative'"
              size="lg"
            ></q-icon>
            <q-icon
              v-show="infos.visibility == 1"
              name="lock"
              :color="$q.dark.isActive ? 'red-13' : 'positive'"
              size="lg"
            ></q-icon>
            <q-icon
              v-show="infos.visibility == 2"
              name="public"
              :color="$q.dark.isActive ? 'red-13' : 'positive'"
              size="lg"
            ></q-icon>
            {{ infos.name }}
          </div>
        </q-img>

        <template v-slot:action>
          <q-file
            v-model="uploadImage.image"
            label="Change Image"
            borderless
            standout
            filled
            use-chips
            clearable
            :loading="uploadImage.submitting"
          >
            <template v-slot:after>
              <q-btn
                color="primary"
                icon="cloud_upload"
                round
                @click="uploadProjectImage()"
                :loading="uploadImage.submitting"
                :disable="uploadImage.image == null"
                accept=".jpg, image/*"
              />
            </template>
          </q-file>
        </template>
      </q-banner>
    </q-card-section>
    <q-card-section>
      <q-input
        v-model="infos.description"
        style="height: 100px"
        label="Description"
        filled
        clearable
        type="textarea"
      />
      <q-btn
        color="primary"
        @click="changeDescription()"
        :label="$t('projectSettings').descriptionSave"
        icon="save"
        dense
        flat
      ></q-btn>
    </q-card-section>
    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card class="col col-sm-12">
        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>{{
                $t("projectSettings").togglePrivate
              }}</q-item-label>
              <q-item-label caption>{{
                $t("projectSettings").togglePrivateCaption
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <div>
                <q-btn-toggle
                  @input="changeIsPrivate()"
                  label="Visibility"
                  glossy
                  v-model="infos.visibility"
                  toggle-color="primary"
                  :options="[
                    { label: 'Private', value: 0 },
                    { label: 'Visible', value: 1 },
                    { label: 'Open', value: 2 },
                  ]"
                />
              </div>
              <!-- <q-toggle  color="blue" v-model="infos.visibility" checked-icon="check" unchecked-icon="clear" @input="changeIsPrivate()" /> -->
            </q-item-section>
          </q-item>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>{{
                $t("projectSettings").toggleAllVisible
              }}</q-item-label>
              <q-item-label caption>{{
                $t("projectSettings").toggleAllVisibleCaption
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle
                color="blue"
                v-model="showAllTrees"
                checked-icon="check"
                unchecked-icon="clear"
              />
            </q-item-section>
          </q-item>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>{{
                $t("projectSettings").toggleExerciseMode
              }}</q-item-label>
              <q-item-label caption>{{
                $t("projectSettings").toggleExerciseModeCaption
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle
                color="blue"
                v-model="exerciseMode"
                checked-icon="check"
                unchecked-icon="clear"
              />
            </q-item-section>
          </q-item>
          <!-- <q-item tag="label" v-ripple>
						<q-item-section>
						<q-item-label>{{$t('projectSettings').toggleOpenProject}}</q-item-label>
						<q-item-label caption>{{$t('projectSettings').toggleOpenProjectCaption}}</q-item-label>
						</q-item-section>
						<q-item-section avatar>
						<q-toggle  color="green" v-model="infos.is_open" checked-icon="check" unchecked-icon="clear" @input="changeOpenProject()" />
						</q-item-section>
          </q-item>-->
        </q-list>
      </q-card>
    </q-card-section>
    <q-card-section class="full row justify-between q-gutter-md">
      <!-- q-pa-sm row items-start q-gutter-md -->
      <!-- <div class="fit row  justify-between"> -->
      <q-card class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t("projectSettings").defaultUserTreePanel }}
            <q-btn
              v-show="isAdmin"
              flat
              round
              icon="add"
              :color="$q.dark.isActive ? 'purple-12' : 'primary'"
              @click="addDefaultUserTreeDial = true"
            ></q-btn>
          </div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator class="list-size">
            <q-item
              v-for="dut in infos.default_user_trees"
              :key="dut.id"
              clickable
              v-ripple
            >
              <q-item-section>{{ dut.username }}</q-item-section>
              <q-item-section side>
                <q-btn
                  v-show="isAdmin"
                  dense
                  round
                  flat
                  icon="remove"
                  :color="$q.dark.isActive ? 'red-13' : 'negative'"
                  @click="triggerConfirm(removeDefaultUserTree, dut.id)"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- <q-card-section class="row items-start q-gutter-md"> -->
      <q-card class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t("projectSettings").adminsPanel }}
            <q-btn
              v-show="isAdmin"
              flat
              round
              icon="add"
              :color="$q.dark.isActive ? 'purple-12' : 'primary'"
              @click="addAdminDial = true"
            ></q-btn>
          </div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator class="list-size">
            <q-item v-for="admin in admins" :key="admin" clickable v-ripple>
              <q-item-section>{{ admin }}</q-item-section>
              <q-item-section side>
                <q-btn
                  v-show="isAdmin"
                  dense
                  round
                  flat
                  icon="remove"
                  :color="$q.dark.isActive ? 'red-13' : 'negative'"
                  @click="triggerConfirm(removeAdmin, admin)"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t("projectSettings").guestsPanel }}
            <q-btn
              v-show="isAdmin"
              flat
              round
              icon="add"
              :color="$q.dark.isActive ? 'purple-12' : 'primary'"
              @click="addGuestDial = true"
            ></q-btn>
          </div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator class="list-size">
            <q-item v-for="guest in guests" :key="guest" clickable v-ripple>
              <q-item-section>{{ guest }}</q-item-section>
              <q-item-section side>
                <q-btn
                  v-show="isAdmin"
                  dense
                  round
                  flat
                  icon="remove"
                  :color="$q.dark.isActive ? 'red-13' : 'negative'"
                  @click="triggerConfirm(removeGuest, guest)"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t("projectSettings").shownFeaturesPanel }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-select
            filled
            v-model="shownfeatures"
            multiple
            :options="$store.getters['config/shownfeatureschoices']"
            use-chips
            stack-label
            :label="$t('projectSettings').shownFeaturesTokens"
          />
        </q-card-section>
        <!-- @input="saveannofshown" -->
        <q-card-section>
          <q-select
            filled
            v-model="shownmeta"
            multiple
            :options="$store.getters['config/shownmetachoices']"
            use-chips
            stack-label
            :label="$t('projectSettings').shownFeaturesSentences"
          />
        </q-card-section>
        <!-- @input="savemetashown" -->
      </q-card>
    </q-card-section>
    <!-- </div> -->
    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card class="col col-sm-12">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t("projectSettings").annotationSettingsInput }}
          </div>
        </q-card-section>
        <q-card-section>
          <codemirror
            v-model="annofjson"
            :options="cmOption"
            @input="checkAnnotationFeatures"
          ></codemirror>
        </q-card-section>
        <q-btn
          color="bg-primary"
          text-color="primary"
          @click="saveAnnotationSettings()"
          :label="$t('projectSettings').annotationSettingsSave"
          icon="save"
          dense
          flat
          :disabled="!annofok"
          no-caps
        ></q-btn>
        <q-btn
          color="bg-primary"
          text-color="primary"
          @click="resetAnnotationFeatures()"
          label="reset to SUD"
          icon="replay"
          dense
          flat
          :disabled="!annofok"
          no-caps
        ></q-btn>
        <q-chip
          text-color="primary"
          :icon="
            annofok ? 'sentiment_satisfied_alt' : 'sentiment_very_dissatisfied'
          "
          >{{ annofcomment }}</q-chip
        >
      </q-card>
    </q-card-section>

    <q-dialog
      v-model="addAdminDial"
      transition-show="fade"
      transition-hide="fade"
    >
      <UserSelectTable
        :parentCallback="updateAdminsOrGuests"
        :general="true"
        selectiontype="Project Admin"
        targetRole="admin"
        singlemultiple="multiple"
        :preselected="admins"
      ></UserSelectTable>
    </q-dialog>
    <q-dialog
      v-model="addGuestDial"
      transition-show="fade"
      transition-hide="fade"
    >
      <UserSelectTable
        :parentCallback="updateAdminsOrGuests"
        :general="true"
        selectiontype="Project Guest"
        targetRole="guest"
        singlemultiple="multiple"
        :preselected="guests"
      ></UserSelectTable>
    </q-dialog>
    <q-dialog
      v-model="addDefaultUserTreeDial"
      transition-show="fade"
      transition-hide="fade"
    >
      <UserSelectTable
        :parentCallback="addDefaultUserTree"
        :general="false"
        :projectname="$props.projectname"
      ></UserSelectTable>
    </q-dialog>
    <q-dialog v-model="confirmActionDial">
      <confirm-action
        :parentAction="confirmActionCallback"
        :arg1="confirmActionArg1"
      ></confirm-action>
    </q-dialog>
  </q-card>
</template>



<script>
import { codemirror } from "vue-codemirror";
import "codemirror/mode/python/python.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css";
import api from "../boot/backend-api.js";
import UserSelectTable from "../components/UserSelectTable.vue";
import ConfirmAction from "../components/ConfirmAction.vue";

export default {
  name: "project-settings-view",
  components: { codemirror, UserSelectTable, ConfirmAction },
  props: ["projectname"],
  data() {
    return {
      addAdminDial: false,
      addGuestDial: false,
      // addLabelDial: false,
      // addCatDial: false,
      addDefaultUserTreeDial: false,
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: "",
      entryCat: "",
      entryLabel: "",
      stockid: "",
      uploadImage: { image: null, submitting: false },
      infos: { admins: [], guests: [], description: "" },
      // infos: {admins:[], guests:[], labels:[], cats:[], description: ''},
      projectconfig: {},
      annofjson: "",
      annofok: true,
      annofcomment: "",
      txtCats: `# please drop your categories here in a comma separated format. For instance:
VER,DET,NOMcom`,
      txtLabels: `# please drop your labels here in a comma separated format with one column per line. For instance:
subj,comp,vocative
:aux,:caus,:cleft`,
      config: ``,
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: "python",
        theme: "default",
      },
    };
  },
  mounted() {
    this.getProjectInfos();
    // console.log(this.infos);
    this.annofjson = this.$store.getters["config/getAnnofjson"];
  },
  computed: {
    admins() {
      return this.$store.getters["config/admins"];
    },
    guests() {
      return this.$store.getters["config/guests"];
    },
    showAllTrees: {
      get() {
        return this.$store.getters["config/showAllTrees"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          projectname: this.$props.projectname,
          toUpdateObject: { showAllTrees: value },
        });
      },
    },
    exerciseMode: {
      get() {
        return this.$store.getters["config/exerciseMode"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          projectname: this.$props.projectname,
          toUpdateObject: { exerciseMode: value },
        });
      },
    },
    shownfeatureschoices() {
      return this.$store.getters["config/shownfeatureschoices"];
    },
    shownfeatures: {
      get() {
        return this.$store.getters["config/shownfeatures"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectShownFeatures", {
          projectname: this.$props.projectname,
          toUpdateObject: { shownfeatures: value },
        });
      },
    },
    shownmetachoices() {
      return this.$store.getters["config/shownmetachoices"];
    },
    shownmeta: {
      get() {
        return this.$store.getters["config/shownmeta"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectShownFeatures", {
          projectname: this.$props.projectname,
          toUpdateObject: { shownmeta: value },
        });
      },
    },
    imageEmpty() {
      if (this.infos.image == null) {
        this.infos.image = "b''";
      }
      if (this.infos.image == "b''") {
        return true;
      } else if (this.infos.image.length < 1) {
        return true;
      } else {
        return false;
      }
    },
    imageCleaned() {
      var clean = this.infos.image.replace("b", "");
      clean = clean.replace(/^'/g, "");
      clean = clean.replace(/'$/g, "");
      return "data:image/png;base64, " + clean;
    },
    guest() {
      return this.infos.guests.includes(
        this.$store.getters["user/getUserInfos"].id
      );
    },
    admin() {
      return (
        this.infos.admins.includes(
          this.$store.getters["user/getUserInfos"].id
        ) || this.$store.getters["user/getUserInfos"].super_admin
      );
    },
    // create a new computed property `isAdmin` for better clarity
    isAdmin() {
      return (
        this.$store.getters["config/isAdmin"] ||
        this.$store.getters["user/getUserInfos"].super_admin
      );
    },
    isGuest() {
      return this.guests.includes(this.$store.getters["user/getUserInfos"].id);
    },
  },
  methods: {
    /**
     * Handle project infos request from backend
     *
     * @returns void
     */
    getProjectInfos() {
      // this.$store.dispatch("config/fetchProjectConlluSchema", {projectname:this.$props.projectname})
      // .then(response=> {
      // 	this.annofjson = this.$store.getters['config/getAnnofjson']
      // })
      // this.$store.dispatch("config/fetchConfigShown", {projectname:this.$props.projectname})
      // 	})
      // .catch(error => {
      // 		this.$store.dispatch("notifyError", {error: error});
      // 		this.$q.notify({message: `${error}`, color:'negative', position: 'bottom'});
      // });
      api.getProjectInfos(this.projectname).then((response) => {
        this.infos = response.data;
      })
    },
    /**
     * Parse annotation features. Display a related informative message dependeing on success
     *
     * @returns void
     */
    checkAnnotationFeatures() {
      try {
        JSON.parse(this.annofjson);
        this.annofok = true;
        this.annofcomment = this.$t("projectSettings").checkAnnotation;
      } catch (e) {
        this.annofok = false;
        this.annofcomment = e;
      }
    },
    /**
     * @todo : Save annotation settings : UPOS, relations, features and their values...
     *
     * @returns void
     */
    saveAnnotationSettings() {
      // send the update to grew
      // api.updateProjectSettings(this.$props.projectname, {"annotationFeatures":JSON.stringify(config.annotationFeatures)})
      this.$store
        .dispatch("config/updateProjectConlluSchema", {
          annotationFeatures: JSON.parse(this.annofjson),
          projectname: this.projectname,
        })
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          this.$q.notify({
            message: `${error}`,
            color: "negative",
            position: "bottom",
          });
        });
    },
    resetAnnotationFeatures() {
      this.$store.dispatch("config/resetAnnotationFeatures", {
        projectname: this.projectname,
      });
      this.annofjson = this.$store.getters["config/getAnnofjson"];
    },
    /**
     * Add an administrator by requesting backend
     * @todo change backend function to accept multiple users
     *
     * @param {Object[]} selected list of selected rows (objects)
     * @returns void
     */
    updateAdminsOrGuests(usersArray, targetRole) {
      const newRolesArrayId = [];
      for (const user of usersArray) {
        newRolesArrayId.push(user.id);
      }
      api
        .updateManyProjectUserAccess(
          this.$props.projectname,
          targetRole,
          newRolesArrayId
        )
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.$store.commit("config/set_project_settings", {
            admins: response.data.admins,
            guests: response.data.guests,
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },

    removeAdmin(userid) {
      api
        .deleteProjectUserAccess(this.$props.projectname, userid)
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.$store.commit("config/set_project_settings", {
            admins: response.data.admins,
            guests: response.data.guests,
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    /**
     * Remove a user from the guests using its userId
     *
     * @param {String} userId the user id
     * @returns void
     */
    removeGuest(userid) {
      api
        .deleteProjectUserAccess(this.$props.projectname, userid)
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.$store.commit("config/set_project_settings", {
            admins: response.data.admins,
            guests: response.data.guests,
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    // addLabel(){  api.addProjectStockLabel(this.$props.projectname, this.stockid, this.entryLabel).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; this.entryLabel='';}).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
    // removeLabel(item){ api.removeProjectStockLabel(this.$props.projectname, item.id, item.stock_id, item.value).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
    // resetLabel(){ this.entryLabel = ''; },
    // addLabelColumn(){ api.addProjectStock(this.$props.projectname).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
    // removeLabelColumn(stockid){ api.removeProjectStock(this.$props.projectname, stockid).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })  },
    // addCat(){ api.addProjectCatLabel(this.$props.projectname, this.entryCat).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data; this.entryCat = '';}).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
    // removeCat(cat){ api.removeProjectCatLabel(this.$props.projectname, cat).then(response => {this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); })},
    // resetCat(){ this.entryCat = ''; },

    /**
     * Add a default user for the tree to be uploaded if not specified.
     * @todo change backend function to accept multiple users
     *
     * @param {Object[]} selected list of selected rows (objects)
     * @returns void
     */
    addDefaultUserTree(selected) {
      api
        .addDefaultUserTree(this.$props.projectname, selected[0])
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.infos = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    /**
     * Remove a default user for the tree to be uploaded if not specified
     *
     * @param {String} dutid id of the DUT (defautUserTree Object)
     * @returns void
     */
    removeDefaultUserTree(dutid) {
      api
        .removeDefaultUserTree(this.$props.projectname, dutid)
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.infos = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    /**
     * Change the boolean of the project in backend : to show all trees to every users or not
     *
     * @returns void
     */
    changeShowAllTrees() {
      api
        .updateProject(this.$props.projectname, {
          showAllTrees: this.showAllTrees,
        })
        .then((response) => {
          this.$q.notify({ message: "Change saved!" });
          this.infos = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    // changeOpenProject(){ api.modifyOpenProject(this.$props.projectname, this.infos.is_open).then(response => {this.$q.notify({message:`Change saved!`}); this.infos = response.data; }).catch(error => { this.$store.dispatch("notifyError", {error: error}); }) },
    /**
     * Change the project's boolean in backend : whether it is private or not
     *
     * @returns void
     */
    changeIsPrivate() {
      api
        .updateProject(this.$props.projectname, {
          visibility: this.infos.visibility,
        })
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.infos = response.data;
          this.$forceUpdate();
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    /**
     * Change the project description in backend using the infos data
     *
     * @returns void
     */
    changeDescription() {
      api
        .updateProject(this.$props.projectname, {
          description: this.infos.description,
        })
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
          this.infos = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    /**
     * Upload a project image by creating formdata to be send to the backend
     *
     * @returns void
     */
    uploadProjectImage() {
      this.uploadImage.submitting = true;
      var form = new FormData();
      form.append("files", this.uploadImage.image);
      // for(const file of this.uploadImage.image){ form.append('files',file); }
      api
        .uploadProjectImage(this.$props.projectname, form)
        .then((response) => {
          this.uploadImage.submitting = false;
          this.uploadImage.image = null;
          this.$q.notify({ message: `Uploaded image saved!` });
          this.infos = response.data;
          console.log(this.infos);
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          this.uploadImage.submitting = false;
        });
    },

    // saveTextCats(){
    // 	api.saveTxtCats(this.$props.projectname, this.txtCats).then(response => { this.$q.notify({message:`Change saved!`}); this.infos.cats = response.data;}).catch(error => { this.$store.dispatch("notifyError", {error: error}); });
    // },
    // saveTextLabels(){
    // 	api.saveTxtLabels(this.$props.projectname, this.txtLabels).then(response => { console.log(JSON.stringify(response.data)); this.$q.notify({message:`Change saved!`}); this.infos.labels = response.data;}).catch(error => { this.$store.dispatch("notifyError", {error: error}); });
    // },

    /**
     * Wrapper to display the confirm dialog prior to executing the method
     *
     * @param {method} method
     * @param {*} arg
     * @returns void
     */
    triggerConfirm(method, arg) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
      this.confirmActionArg1 = arg;
    },
  },
};
</script>

<style scoped>
.full {
  width: 90vw;
  min-width: 90vw;
}
.list-size {
  height: 150px;
}
.cm-height {
  height: 50px;
}
</style>