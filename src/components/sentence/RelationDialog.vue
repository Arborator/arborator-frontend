<template>
  <q-dialog v-model="relationDialogOpened">
    <q-card style="min-width: 700px">
      <q-bar v-if="gov && dep" class="bg-primary text-white">
        <div class="text-weight-bold">
          {{ $t('attributeTable.relation[0]') }} "{{ gov.FORM }}" {{ $t('attributeTable.relation[1]') }} "{{ dep.FORM }}"
        </div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section v-for="(deprel, i) in deprels" class="q-gutter-md">
        <div class="text-h6">
          {{ deprel.name }}
        </div>
        <div class="row">
          <div v-for="(val, j) in deprel.values" >
            <q-chip 
              outline 
              v-if="val != ''"
              color="primary" 
              v-model:selected="selectedDep[i].selected[j]"
              @update:selected="unselectOtherDep(i, j)" 
            >
            {{ val }}
            </q-chip>
          </div>
        </div>
        <q-separator />
      </q-card-section>
      <q-card-actions>
        <q-btn
          v-close-popup
          outline
          color="primary"
          :label="$t('delete')"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onDeleteRelation()"
        />
        <q-space />
        <q-btn
          id="catselectvalidate"
          v-close-popup
          color="primary"
          label="Ok"
          style="width: 25%; margin-left: auto; margin-right: auto"
          @click="onChangeRelation()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import AttributeTable from './AttributeTable.vue';
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { tokenJson_T } from 'conllup/lib/conll';
import conllup from 'conllup';
const emptyTokenJson = conllup.emptyTokenJson;

import { defineComponent } from 'vue';

export default defineComponent({
  components: { AttributeTable },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const selectedDep: {
      name: string;
      selected: boolean[];
    }[] = [];
    const dep: tokenJson_T = emptyTokenJson();
    const gov: tokenJson_T = emptyTokenJson();
    const deprelSplitted: string[] = [];
    const deprels: {
      name: string;
      values: string[];
      join: string;
    }[] = [];
    return {
      relationDialogOpened: false,
      dep,
      gov,
      userId: '',
      deprelSplitted,
      deprels,
      splitRegex: new RegExp('', ''),
      selectedDep,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
  created() {
    this.deprels = this.annotationFeatures.DEPREL;
    this.splitRegex = new RegExp(`[${this.deprels.map(({ join }) => join).join('')}]`, 'g');
  },
  mounted() {
    this.sentenceBus.on('open:relationDialog', ({ dep, gov, userId }) => {
      this.dep = dep;
      this.gov = gov;
      this.userId = userId;
      this.deprelSplitted = this.dep.DEPREL.split(this.splitRegex);

      this.selectedDep = this.deprels.map((dep) => ({
        name: dep.name,
        selected: Array(dep.values.length).fill(false),
      }));

      for (let i = 0; i < this.deprelSplitted.length; i += 1) {
        for (let ii = i; ii < this.deprels.length; ii += 1) {
          if (dep.DEPREL.includes(this.deprels[ii].join + this.deprelSplitted[i])) {
            this.selectedDep[ii].selected[this.deprels[ii].values.indexOf(this.deprelSplitted[i])] = true;
          }
        }
      }
      this.relationDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:relationDialog');
  },
  methods: {
    unselectOtherDep(depName: number, depValue: number ){
      this.selectedDep[depName].selected.forEach((dep, i) => {
        if (dep && i != depValue) {
          this.selectedDep[depName].selected[i] = false;
        }
      });
    },
    onChangeRelation() {
      this.relationDialogOpened = false;
      let newDeprel = ''
      for(const i in this.deprels){
        if (this.selectedDep[i].selected.includes(true)){
          newDeprel += this.deprels[i].join + this.deprels[i].values[this.selectedDep[i].selected.indexOf(true)]
        }
      }
      if (this.gov.ID === undefined || this.gov.ID === null) {
        this.dep.DEPREL = newDeprel || '_';
      } else {
        this.dep.DEPREL = newDeprel || '_';
        this.dep.HEAD = parseInt(this.gov.ID, 10);
      }
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        userId: this.userId,
      });
    },
    onDeleteRelation() {
      this.dep.DEPREL = '_';
      this.dep.HEAD = -1;
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        userId: this.userId,
      });
    },
  },
});
</script>

<style></style>
