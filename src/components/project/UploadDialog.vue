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
          v-if="maximizedUploadToggle"
          dense
          flat
          icon="minimize"
          @click="maximizedUploadToggle = false"
        >
          <q-tooltip
            v-if="maximizedUploadToggle"
            content-class="bg-white text-primary"
            >{{ $t("projectView").tooltipWindows[0] }}</q-tooltip
          >
        </q-btn>
        <q-btn
            v-if="!maximizedUploadToggle"
            dense
            flat
            icon="crop_square"
            @click="maximizedUploadToggle = true"
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
        <!-- <input type="file" id="input-conllu" multiple /> -->
        <q-file
          v-model="uploadSample.attachment.file"
          @input="preprocess"
          label="Pick or drop files"
          outlined
          use-chips
          clearable
          :loading="uploadSample.submitting"
          multiple
          style="max-width: 600px, min-height:1300px"
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
        <template >
          <!-- <p> 
              v-if="uploadSample.attachment.file"
              For each of the following user_id, choose a name that will replace
              it. If one single sentence for two differents user_id get rename
              with the same user_id, the most recent tree will be taken
            </p> -->

          <!-- <table>
              <q-tooltip>
                For each of the following user ids, choose a name that will replace
              it. <br>If the same sentence with two differents user ids gets renamed
              with the same user_id, the most recent tree will be taken.
            </q-tooltip>
            <tr>
              <th>previous name</th>
              <th>new name</th>
            </tr>
            <tr v-for="(userId, index) of userIds" :key="index">
              <td>
                <label :for="`f${index}`">{{ userId.old }} :</label>
              </td>
              <td>
                <input
                  :id="`f${index}`"
                  v-model="userId.new"
                  :placeholder="userId.old"
                />
              </td>
            </tr>
          </table> -->
          <!-- columns{{columns}}<br>
          rows{{rows}}<br> -->
          <q-space/>&nbsp;
          <q-expansion-item
                v-if="userIds.length>0"
                icon="perm_identity"
                label="Custom user id on import"
                :caption="'By default we use your user name ' + userid"
                header-class="primary"
            >
            <div class="q-pa-md">
                <q-table
                hide-pagination
                title="Old and new user ids when importing"
                :data="userIds"
                row-key="old"
                :columns="columns"
                    >
                <template v-slot:body="props">
                    <q-tr :props="props">
                    <q-td key="old" :props="props">
                        {{ props.row.old }}
                    </q-td>
                    <q-td key="new" :props="props">
                        {{ props.row.new }}
                        <q-popup-edit v-model="props.row.new"  dense>
                            <q-input color="primary" v-model="props.row.new" dense autofocus/>
                        </q-popup-edit>
                    </q-td>
                    
                    </q-tr>
                </template>

                
                <!-- <template slot="col-message" slot-scope="cell">
                    <q-input :v-model="userIds[cell.row.__index].message" ></q-input>
                </template> -->
                </q-table>
                </div>
            </q-expansion-item>
        </template>

    <q-card-section>
        <q-tooltip>TODO: to be removed? </q-tooltip>
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
      </q-card-section>

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
      userIds: [],
      userIdsList: [],
      userIdsPreprocessed: false,
      columns:    [
        {
            name: 'old',
            required: true,
            label: 'Original',
            align: 'left',
            field: row => row.old,
            format: val => `${val}`,
            sortable: true
        },
          { 
            name: 'new',
            required: true,
            label: 'New',
            align: 'left',
            field: row => row.new,
            format: val => `${val}`,
            sortable: true
         },
      ],





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
    userid: {
      get() {return this.$store.getters["user/getUserInfos"].username;
      },
    },
 },

  methods: {
    async preprocess() {
      if (!this.uploadSample.attachment.file) {
        return;
      }
      
      this.userIds = [
        {
          old: "default",
          new: this.$store.getters["user/getUserInfos"].username,
        },
      ];
      for (const file of this.uploadSample.attachment.file) {
        const reader = new FileReader();
        reader.onload = () => {
          var lines = reader.result.split(/[\r\n]+/g);
          // lines.forEach((line) => {
          for (var line of lines) {
            if (line[0] == "#") {
              if (line.slice(2, 9) == "user_id") {
                var splitted_meta = line.split(" ");
                var userId = splitted_meta[splitted_meta.length - 1];
                if (
                  !this.userIds.map((userId) => userId.old).includes(userId)
                ) {
                  this.userIds.push({ old: userId, new: userId });
                }
              }
            }
          }
        };
        reader.readAsText(file);
      }
      this.userIdsPreprocessed = true;

    },
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
      form.append("userIdsConvertor", JSON.stringify(this.userIds));
      api
        .uploadSample(this.$route.params.projectname, form)
        .then((response) => {
          this.uploadSample.attachment.file = [];
          this.$emit("uploaded:sample"); // tell to the parent that a new sample was uploaded and to fetch all samples
          this.uploadDialModel = false;
          this.uploadSample.submitting = false;
          this.showNotif("top-right", "uploadsuccess");
        })
        .catch((error) => {
          if (error.response) {
            error.message = error.response.data.message;
            error.permanent = true;
          }
          this.$emit("uploaded:sample"); // tell to the parent that a new sample was uploaded and to fetch all samples

          error.caption = "Check your file please and try again.";
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