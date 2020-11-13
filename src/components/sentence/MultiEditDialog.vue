<template>
  <q-dialog v-model="dialogOpened">
    <q-card style="height: 90vh; width: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Multi edit</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <table v-if="treeJson">
        <tr>
          <th>ID</th>
          <th>TOKEN</th>
          <th v-for="metaLabel in metaLabels" :key="metaLabel">
            {{ metaLabel }}
          </th>
        </tr>
        <tr>
          <th>0</th>
          <th>All :</th>
          <td v-for="metaLabel in metaLabels" :key="metaLabel">
            <input
              type="checkbox"
              :name="metaLabel"
              :checked="checkboxesAll[metaLabel]"
              @input="toggleAll(metaLabel)"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2" class="divider"><hr /></td>
        </tr>
        <tr v-for="token of treeJson" :key="token.ID">
          <th>{{ token.ID }}</th>
          <th>{{ token.FORM }}</th>
          <td v-for="metaLabel in metaLabels" :key="metaLabel">
            <input
              type="checkbox"
              :name="metaLabel"
              :class="metaLabel"
              v-model="checkboxes[token.ID][metaLabel]"
            />
          </td>
        </tr>
      </table>

      <q-separator />
      <q-card-actions align="around">
        <!-- @click="ondialoghide()" -->
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <q-btn
          color="primary"
          @click="onDialogOk()"
          label="Ok"
          v-close-popup
          style="width: 45%; margin-left: auto; margin-right: auto"
        />
        <!-- :disabled="!someFeatureChanged" -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: ["sentenceBus", "reactiveSentencesObj"],
  data() {
    return {
      dialogOpened: false,
      userId: "",
      treeJson: {},
      checkboxes: {},
      metaLabels: ["UPOS", "DEPREL", "HEAD", "LEMMA"],
      checkboxesAll: { UPOS: false, DEPREL: false, HEAD: false, LEMMA: false },
    };
  },
  mounted() {
    this.sentenceBus.$on("open:openMultiEditDialog", ({ userId, event }) => {
      this.userId = userId;
      this.treeJson = JSON.parse(
        JSON.stringify(this.sentenceBus[this.userId].treeJson)
      );
      for (const metaLabel of this.metaLabels) {
        this.checkboxesAll[metaLabel] = false
      }
      for (const token in this.treeJson) {
        const checkboxesToken = {};
        // checkboxesToken["UPOS"] = false;
        // checkboxesToken["DEPREL"] = false;
        // checkboxesToken["HEAD"] = false;
        this.checkboxes[token] = checkboxesToken;
      }
      this.dialogOpened = true;
    });
  },
  beforeDestroy() {
    this.sentenceBus.$off("open:openMultiEditDialog");
  },
  methods: {
    onDialogOk() {
      for (var token in this.treeJson) {
        for (var metaLabel of this.metaLabels) {
          var toDeleteBool = this.checkboxes[token][metaLabel];
          if (toDeleteBool) {
            this.treeJson[token][metaLabel] =
              typeof this.treeJson[token][metaLabel] === "string" ? "_" : NaN;
          }
        }
      }
      this.sentenceBus.$emit("tree-update:tree", {
        tree: this.treeJson,
        userId: this.userId,
      });
      this.uncheckToggles();
    },
    toggleAll(metaLabel) {
      this.checkboxesAll[metaLabel] = !this.checkboxesAll[metaLabel];
      for (const token in this.treeJson) {
        this.checkboxes[token][metaLabel] = this.checkboxesAll[metaLabel];
      }
    },
    uncheckToggles() {
      for (const metaLabel of this.metaLabels) {
        this.checkboxesAll[metaLabel] = false;
      }
    },
  },
};
</script>
<style>
</style>