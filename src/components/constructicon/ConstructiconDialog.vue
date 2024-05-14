<template>
  <q-card flat>
    <q-card-section class="row q-gutter-md" style="justify-content: right">
      <q-btn 
        v-if="canSaveTreeInProject" 
        no-caps 
        dense 
        color="primary"
        icon="file_upload" 
        label="Upload constructicon" 
        @click="uploadConstructiconDialog = true"
      >
        <q-tooltip>{{ $t('constructicon.uploadTooltip') }}</q-tooltip>
      </q-btn>
      <q-dialog v-model="uploadConstructiconDialog">
        <q-uploader :url="backendApi.generateURLforConstructiconUpload(name)" label="Choose a File" @uploaded="loadConstructiconEntries" />
      </q-dialog>
      <q-btn no-caps outline color="primary" label="Download constructicon" dense icon="file_download" @click="downloadConstructicon">
        <q-tooltip>{{ $t('constructicon.downloadTooltip') }}</q-tooltip>
      </q-btn>
    </q-card-section>
    <q-card-section>
      <q-splitter v-model="splitterModel" style="height: 400px" :limits="[30, 50]">
        <template v-slot:before>
          <div style="height: 100%; width: 100%; display: flex; flex-direction: column">
            <!-- Search bar -->
            <q-input v-model="search" outlined dense debounce="300" :placeholder="$t('constructicon.searchLabel')">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Items -->
            <q-scroll-area style="height: 100%; width: 100%">
              <q-list bordered>
                <q-item v-for="(entry, index) in filteredEntries" :key="index" clickable @click="setActiveItem(entry)">
                  <q-item-section>
                    <q-item-label>{{ entry.title }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>

            <!-- Add new item -->
            <q-btn
              v-if="canSaveTreeInProject"
              :disable="editMode"
              class="q-mt-md"
              color="primary"
              :label="$t('constructicon.addNewItem')"
              icon="add"
              @click="addNewItem"
            />
          </div>
        </template>

        <template v-slot:after>
          <div v-if="activeEntry" style="height: 100%; position: relative">
            <!-- Entry content -->
            <div style="overflow-y: auto; max-height: calc(100% - 68px); padding: 10px">
              <div v-if="editMode">
                <q-input dense outlined v-model="activeEntry.title" :label="$t('constructicon.title')" class="q-mb-md" />
                <q-input dense outlined v-model="activeEntry.description" :label="$t('constructicon.description')" class="q-mb-md" />
              </div>
              <div v-else>
                <h6 class="q-my-sm">{{ activeEntry.title }}</h6>
                <p class="q-my-sm">{{ activeEntry.description }}</p>
              </div>

              <div>
                <div class="text-h6 q-mb-xs">{{ $t('constructicon.grewQuery') }}</div>
                <!-- Replace the following line with your CodeMirror component -->
                <GrewCodeMirror v-model:value="activeEntry.grew_query" :disabled="editMode === false"></GrewCodeMirror>
              </div>

              <!-- QChip for tags -->
              <div class="q-mt-md">
                <div class="text-h6 q-mb-xs">Tags</div>
                <q-chip v-for="(tag, index) in activeEntry.tags" :key="index" :removable="editMode" @remove="removeTag(index)">
                  {{ tag }}
                </q-chip>
                <q-input v-if="editMode" v-model="newTag" outlined dense placeholder="Add tag" @keyup.enter="addTag" />
              </div>
            </div>

            <!-- bottom toolbar -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0">
              <q-toolbar class="q-pa-md q-gutter-md" style="display: flex; justify-content: space-between">
                <div class="q-gutter-md" style="display: flex; justify-content: space-between">
                  <q-btn v-if="canSaveTreeInProject" no-caps color="primary" @click="changeEditMode">
                    {{ editMode ? $t('constructicon.saveBtn') : $t('constructicon.editBtn') }}
                  </q-btn>
                  <q-btn v-if="canSaveTreeInProject" no-caps outline color="primary" @click="deleteItem">{{ $t('constructicon.deleteBtn') }}</q-btn>
                </div>
                <q-btn :disabled="editMode" color="secondary" @click="grewSearch(activeEntry.grew_query)"> {{ $t('constructicon.search') }} </q-btn>
              </q-toolbar>
            </div>
          </div>
        </template>
      </q-splitter>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import GrewCodeMirror from 'components/codemirrors/GrewCodeMirror.vue';

import api from '../../api/backend-api';
import { mapActions, mapState } from 'pinia';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { ConstructiconEntry_t } from 'src/api/backend-types';

import { v4 as uuidv4 } from 'uuid';
import { defineComponent } from 'vue';


interface data_t {
  splitterModel: number;
  constructiconEntries: ConstructiconEntry_t[];
  activeEntry: ConstructiconEntry_t | null;
  search: string;
  newTag: string;
  newMeta: string;
  editMode: boolean;
  uploadConstructiconDialog: boolean;
  file: File | null;
}

export default defineComponent({
  name: 'ConstructiconDialog',
  components: { GrewCodeMirror },
  data(): data_t {
    return {
      splitterModel: 30,
      constructiconEntries: [],
      activeEntry: null,
      search: '',
      newTag: '',
      newMeta: '',
      editMode: false,
      uploadConstructiconDialog: false,
      file: null,
    };
  },
  computed: {
    backendApi() {
      return api;
    },
    ...mapState(useProjectStore, ['name', 'canSaveTreeInProject']),
    // filter the items based on the search term
    filteredEntries(): ConstructiconEntry_t[] {
      return this.constructiconEntries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(this.search.toLowerCase()) || entry.description.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  mounted() {
    this.loadConstructiconEntries();
  },
  methods: {
    ...mapActions(useGrewSearchStore, ['switchGrewDialog', 'changeLastGrewQuery']),
    setActiveItem(entry: ConstructiconEntry_t) {
      this.activeEntry = entry;
    },
    addNewItem() {
      this.editMode = true;
      const newEntry: ConstructiconEntry_t = {
        id: uuidv4(),
        title: '',
        grew_query: '',
        description: '',
        tags: [],
      };
      this.constructiconEntries.push(newEntry);
      this.activeEntry = newEntry;
    },
    deleteItem() {
      if (this.activeEntry) {
        const toDeleteEntry = this.activeEntry;
        api
          .deleteConstructiconEntry(this.name, this.activeEntry.id)
          .then(() => {
            this.editMode = false;
            this.loadConstructiconEntries();
            this.activeEntry = null;
            notifyMessage({ message: `Entry '${toDeleteEntry.title}' deleted` });
          })
          .catch((err) => {
            console.log(err);
            notifyError({ error: 'Error while deleting constructicon entry' });
          });
      }
    },
    addTag() {
      if (this.newTag.trim() !== '' && this.activeEntry) {
        this.activeEntry.tags.push(this.newTag);
        this.newTag = '';
      }
    },
    removeTag(index: number) {
      if (this.activeEntry) {
        this.activeEntry.tags.splice(index, 1);
      }
    },
    loadConstructiconEntries() {
      api
        .getConstructiconEntries(this.name)
        .then((response) => {
          this.activeEntry = null;
          this.constructiconEntries = response.data;
        })
        .catch((err) => {
          console.log(err);
          notifyError({ error: 'Error while loading constructicon entries' });
        });
    },
    grewSearch(query: string) {
      console.log(query);
      this.switchGrewDialog(true);
      this.changeLastGrewQuery({ text: query, type: 'SEARCH', userType: 'user' });
    },
    changeEditMode() {
      if (!this.activeEntry) {
        // we need an active entry to edit or save it
        return;
      }
      if (this.editMode) {
        api
          .saveConstructiconEntry(this.name, this.activeEntry)
          .then(() => {
            this.editMode = false;
            notifyMessage({ message: 'Changes saved' });
          })
          .catch((err) => {
            console.log(err);
            notifyError({ error: 'Error while saving changes' });
          });
      } else {
        // enter edit mode
        this.editMode = true;
      }
    },
    downloadConstructicon() {
      this.downloadListAsJson(this.constructiconEntries, `${this.name}_constructicon.json`);
    },
    downloadListAsJson(list: any[], filename: string) {
      // Convert list to JSON
      let jsonString = JSON.stringify(list, null, 2); // 'null' and '2' are for pretty formatting

      // Create a Blob from the JSON string
      let blob = new Blob([jsonString], { type: 'application/json' });

      // Create a URL from the Blob
      let url = URL.createObjectURL(blob);

      // Create a link element
      let link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Append the link to the body (required for Firefox)
      document.body.appendChild(link);

      // Simulate a click on the link
      link.click();

      // Clean up: remove the link from the body
      document.body.removeChild(link);
    },
  },
});
</script>
