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
        <q-img :ratio="16 / 9" :src="cleanedImage" basic>
          <div class="absolute-bottom text-h6">
            <q-icon
              v-show="visibility == 0"
              name="lock"
              :color="$q.dark.isActive ? 'red-13' : 'negative'"
              size="lg"
            ></q-icon>
            <q-icon
              v-show="visibility == 1"
              name="lock"
              :color="$q.dark.isActive ? 'red-13' : 'positive'"
              size="lg"
            ></q-icon>
            <q-icon
              v-show="visibility == 2"
              name="public"
              :color="$q.dark.isActive ? 'red-13' : 'positive'"
              size="lg"
            ></q-icon>
            {{ projectname }}
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
        v-model="description"
        style="height: 100px"
        label="Description"
        filled
        clearable
        type="textarea"
      />
      <q-btn
        color="primary"
        @click="saveDescription"
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
                  label="Visibility"
                  glossy
                  v-model="visibility"
                  toggle-color="primary"
                  :options="[
                    { label: 'Private', value: 0 },
                    { label: 'Visible', value: 1 },
                    { label: 'Open', value: 2 },
                  ]"
                />
              </div>
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

          <q-item id="option__diff-mode" tag="label" v-ripple>
            <q-item-section>
              <q-item-label>{{
                $t("projectSettings").toggleDiffMode
              }}</q-item-label>
              <q-item-label caption>{{
                $t("projectSettings").toggleDiffModeCaption
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle
                color="blue"
                v-model="diffMode"
                checked-icon="check"
                unchecked-icon="clear"
              />
            </q-item-section>
          </q-item>

          <q-item id="option__usertree-diff" tag="label" v-ripple>
            <q-item-section>
              <q-item-label>{{
                $t("projectSettings").chooseUserDiff
              }}</q-item-label>
              <q-item-label caption>{{
                $t("projectSettings").chooseUserDiffCaption
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-select
                color="blue"
                v-model="diffUserId"
                :options="projectTreesFrom"
              />
                <!-- checked-icon="check"
                unchecked-icon="clear" -->
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-card-section>
    <q-card-section class="full row justify-between q-gutter-md">
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
              v-for="dut in default_user_trees"
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
      </q-card>
    </q-card-section>
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
import { mapGetters } from "vuex";
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
  props: ["projectname", "projectTreesFrom"],
  data() {
    return {
      default_user_trees: [],
      addAdminDial: false,
      addGuestDial: false,
      addDefaultUserTreeDial: false,
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: "",
      uploadImage: { image: null, submitting: false },
      annofjson: "",
      annofok: true,
      annofcomment: "",
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
    this.annofjson = this.$store.getters["config/getAnnofjson"];
  },
  computed: {
    ...mapGetters("config", [
      "admins",
      "guests",
      "cleanedImage",
      "shownfeatureschoices",
      "shownmetachoices",
    ]),
    description: {
      get() {
        return this.$store.getters["config/description"];
      },
      set(value) {
        this.$store.commit("config/set_project_settings", {
          description: value,
        });
      },
    },
    showAllTrees: {
      get() {
        return this.$store.getters["config/showAllTrees"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          toUpdateObject: { showAllTrees: value },
        });
      },
    },
    exerciseMode: {
      get() {
        let value = this.$store.getters["config/exerciseMode"];
        return value ? value : false;
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          toUpdateObject: { exerciseMode: value },
        });
      },
    },
    diffMode: {
      get() {
        let value = this.$store.getters["config/diffMode"];
        return value ? value : false;
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          toUpdateObject: { diffMode: value },
        });
      },
    },
    diffUserId: {
      get() {
        let value = this.$store.getters["config/diffUserId"];
        return value ? value : "";
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          toUpdateObject: { diffUserId: value },
        });
      },
    },
    visibility: {
      get() {
        return this.$store.getters["config/visibility"];
      },
      set(value) {
        this.$store.dispatch("config/updateProjectSettings", {
          toUpdateObject: { visibility: value },
        });
      },
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
    saveAnnotationSettings() {
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
    addDefaultUserTree(selected) {
      api
        .addDefaultUserTree(this.$props.projectname, selected[0])
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    removeDefaultUserTree(dutid) {
      api
        .removeDefaultUserTree(this.$props.projectname, dutid)
        .then((response) => {
          this.$q.notify({ message: `Change saved!` });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    saveDescription() {
      this.$store.dispatch("config/putProjectDescription");
    },
    uploadProjectImage() {
      this.uploadImage.submitting = true;
      this.$store
        .dispatch("config/postImage", this.uploadImage.image)
        .then(() => {
          this.uploadImage.submitting = false;
          this.$q.notify({ message: `Uploaded image saved!` });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          this.uploadImage.submitting = false;
        });
    },
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