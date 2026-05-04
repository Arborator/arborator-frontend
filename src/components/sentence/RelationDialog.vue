<template>
  <q-dialog v-model="relationDialogOpened" @keydown.enter="onChangeRelation()">
    <q-card style="min-width: 700px">
      <q-bar v-if="gov && dep" class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">
          {{ $t('attributeTable.relation[0]') }} "{{ gov.FORM }}" {{ $t('attributeTable.relation[1]') }} "{{ dep.FORM }}" (
          {{ $t('attributeTable.relation[2]') }} : {{ activeRelation }})
        </div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section v-for="(deprel, i) in deprels" class="q-gutter-md">
        <div class="text-h6">{{ deprel.name }} : {{ deprels[i].values[selectedDep[i].selected.indexOf(true)] }}</div>
        <div class="row">
          <div v-for="(val, j) in deprel.values">
            <q-chip
              :outline="!selectedDep[i].selected[j]"
              v-if="val != ''"
              text-color="white"
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
      <q-card-actions class="sticky-card-actions">
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
import { emptyTokenJson, tokenJson_T } from 'conllup/lib/conll';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { sentence_bus_t } from 'src/types/main_types';
import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';


export default defineComponent({
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
      newDeprel: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
    activeRelation() {
      let newDeprel = '';
      for (const i in this.deprels) {
        if (this.selectedDep[i].selected.includes(true)) {
          newDeprel += this.deprels[i].join + this.deprels[i].values[this.selectedDep[i].selected.indexOf(true)];
        }
      }
      return newDeprel;
    },
  },
  mounted() {
    this.sentenceBus.on('open:relationDialog', ({ dep, gov, userId }) => {
      this.deprels = this.annotationFeatures.DEPREL;
      this.splitRegex = new RegExp(`[${this.deprels.map(({ join }) => join).join('')}]`, 'g');
      this.dep = dep;
      this.gov = gov;
      this.userId = userId;
      this.deprelSplitted = this.dep.DEPREL.split(this.splitRegex);

      this.selectedDep = this.deprels.map((dep) => ({
        name: dep.name,
        selected: Array(dep.values.length).fill(false),
      }));

      for (let i = 0; i < this.deprelSplitted.length; i += 1) {
        for (let j = i; j < this.deprels.length; j += 1) {
          if (dep.DEPREL.includes(this.deprels[j].join + this.deprelSplitted[i]) && this.deprelSplitted[i] !== '') {
            this.selectedDep[j].selected[this.deprels[j].values.indexOf(this.deprelSplitted[i])] = true;
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
    unselectOtherDep(depName: number, depValue: number) {
      this.selectedDep[depName].selected.forEach((dep, i) => {
        if (dep && i != depValue) {
          this.selectedDep[depName].selected[i] = false;
        }
      });
      if (depName == 0) {
        for (let i = 1; i < this.deprels.length; i += 1) {
          this.selectedDep[i].selected[this.selectedDep[i].selected.indexOf(true)] = false;
        }
      }
    },
    onChangeRelation() {
      this.relationDialogOpened = false;
      this.newDeprel = this.activeRelation;
      if (this.gov.ID === undefined || this.gov.ID === null) {
        this.dep.DEPREL = this.newDeprel || '_';
      } else {
        this.dep.DEPREL = this.newDeprel || '_';
        this.dep.HEAD = parseInt(this.gov.ID, 10);
      }
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        userId: this.userId,
      });
      this.checkSeveralRoots();
    },
    onDeleteRelation() {
      this.dep.DEPREL = '_';
      this.dep.HEAD = -1;
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        userId: this.userId,
      });
    },
    checkSeveralRoots() {
      const rootsNumber = Object.values(this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson).filter(
        (token) => token.DEPREL === 'root'
      ).length;
      if (rootsNumber > 1) {
        notifyMessage({
          message: 'This sentence has several roots it should be splitted into two sentences !',
          type: 'warning',
          icon: 'warning',
        });
      }
    },
  },
});
</script>
