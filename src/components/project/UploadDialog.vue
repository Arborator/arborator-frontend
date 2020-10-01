<template>
  <q-dialog
    v-model="uploadDialModel"
    :maximized="maximizedUploadToggle"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card style="max-width: 100vw">
      <q-bar>
        <q-space />
        <q-btn
          dense
          flat
          icon="minimize"
          @click="maximizedUploadToggle = false"
          :disable="!maximizedUploadToggle"
        >
          <q-tooltip
            v-if="maximizedUploadToggle"
            content-class="bg-white text-primary"
            >{{ $t("projectView").tooltipWindows[0] }}</q-tooltip
          >
        </q-btn>
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximizedUploadToggle = true"
          :disable="maximizedUploadToggle"
        >
          <q-tooltip
            v-if="!maximizedUploadToggle"
            content-class="bg-white text-primary"
            >{{ $t("projectView").tooltipWindows[1] }}</q-tooltip
          >
        </q-btn>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip content-class="bg-white text-primary">{{
            $t("projectView").tooltipWindows[2]
          }}</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6 text-blue-grey-8">
          {{ $t("projectView").uploadSelectDial }}
        </div>
      </q-card-section>

      <q-card-section>
        <template v-if="!$store.getters['config/exerciseMode']">
          <!-- v-model="robot.active" -->
          <q-toggle
            v-model="robot.active"
            checked-icon="check"
            color="warning"
            label="Choose a custom import name?"
            unchecked-icon="clear"
          />
          <q-input
            v-show="robot.active"
            v-model="robot.name"
            label="Custom Name for non real user import"
          />
        </template>
        <!-- TODO : add proper styling for the following paragraph -->
        <p v-else>trees will be imported as "teacher"</p>
      </q-card-section>

      <q-card-section>
        <q-file
          v-model="uploadSample.attachment.file"
          label="Pick files"
          outlined
          use-chips
          clearable
          :loading="uploadSample.submitting"
          multiple
          style="max-width: 400px"
        >
          <template v-slot:after>
            <q-btn
              color="primary"
              dense
              icon="cloud_upload"
              round
              @click="upload()"
              :loading="uploadSample.submitting"
              :disable="uploadSample.attachment.file == null"
            />
          </template>
        </q-file>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import api from "../../boot/backend-api.js";

export default {
  props: ["uploadDial"],
  data() {
    return {
      maximizedUploadToggle: false,
      robot: { active: false, name: "parser", exerciseModeName: "teacher" },
      uploadSample: {
        submitting: false,
        attachment: { name: null, file: null },
      },
      alerts: {
        uploadsuccess: { color: "positive", message: "Upload success" },
        uploadfail: {
          color: "negative",
          message: "Upload failed",
          icon: "report_problem",
        },
        deletesuccess: { color: "positive", message: "Delete success" },
        deletefail: {
          color: "negative",
          message: "Delete failed",
          icon: "report_problem",
        },
        GitHubPushSuccess: {
          color: "positive",
          message: "Successfully pushed your data to GitHub",
        },
        getLexiconSuccess: {
          color: "positive",
          message: "got lexicon. TODO: get the real lexicon!!!",
        },
      },
    };
  },
  computed: {
    uploadDialModel: {
      get() {
        return this.uploadDial;
      },
      set(newValue) {
        this.$emit("update:uploadDial", newValue);
      },
    },
  },
  methods: {
    upload() {
      var form = new FormData();
      if (this.$store.getters["config/exerciseMode"]) {
        this.robot.name = "teacher";
        this.robot.active = true;
      }
      form.append("robotname", this.robot.name);
      form.append("robot", this.robot.active);
      this.uploadSample.submitting = true;
      for (const file of this.uploadSample.attachment.file) {
        form.append("files", file);
      }
      form.append(
        "import_user",
        this.$store.getters["user/getUserInfos"].username
      );
      api
        .uploadSample(this.$route.params.projectname, form)
        .then((response) => {
          this.uploadSample.attachment.file = [];
          // this.getProjectInfos();
          // this.$store.dispatch("config/fetchProjectSettings", {
          //   projectname: this.$route.params.projectname,
          // });
          this.$emit("uploaded:sample"); // tell to the parent that a new sample was uploaded and to fetch all samples
          this.uploadDialModel = false;
          this.uploadSample.submitting = false;
          this.showNotif("top-right", "uploadsuccess");
        })
        .catch((error) => {
          if (error.response) {
            error.response.message = error.response.data.message;
            error.permanent = true;
          }
          this.$emit("uploaded:sample"); // tell to the parent that a new sample was uploaded and to fetch all samples

          error.caption = "Check your file please!";
          this.uploadSample.submitting = false;
          this.uploadDialModel = false;
          this.$store.dispatch("notifyError", { error: error });
        });
    },
    // TODO : refactor all of these $q.notify in a proper single file
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
</style>