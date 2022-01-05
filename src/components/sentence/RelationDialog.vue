<template>
  <q-dialog v-model="relationDialogOpened">
    <q-card>
      <q-bar v-if="gov && dep" class="bg-primary text-white">
        <div class="text-weight-bold">Select a relation going from "{{ gov.FORM }}" to "{{ dep.FORM }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <AttributeTable
        :featdata="options.relav"
        :columns="featTable.columns"
        :feat-options="options.currentoptions"
        open-features="false"
        modifiable="false"
        title="Dependency relation"
        prepend="true"
      ></AttributeTable>
      <!-- @feature-changed="informFeatureChanged()" -->
      <q-space />

      <q-card-actions>
        <q-btn v-close-popup flat label="Cancel" style="width: 25%; margin-left: auto; margin-right: auto" />
        <!-- @click="ondialoghide()" -->
        <q-space />
        <q-btn v-close-popup color="negative" label="Delete" style="width: 25%; margin-left: auto" @click="onDeleteRelation()" />
        <q-space />
        <q-btn v-close-popup color="primary" label="Ok" style="width: 25%; margin-left: auto; margin-right: auto" @click="onChangeRelation()" />
      </q-card-actions>
      <!-- :disabled="!someFeatureChanged" -->
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import AttributeTable from './AttributeTable.vue';
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { annotationFeatures_t } from 'src/api/backend-types';
import { TokenJson, emptyTokenJson } from 'conllup/lib/conll';

export default {
  components: { AttributeTable },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const annof: annotationFeatures_t = {
      META: [],
      UPOS: [],
      XPOS: [],
      FEATS: [],
      MISC: [],
      DEPREL: [],
      DEPS: [],
    };
    const shownfeatures: string[] = [];
    const shownmeta: string[] = [];
    const dep: TokenJson = emptyTokenJson();
    const gov: TokenJson = emptyTokenJson();
    const depDeprel = '';
    const depDeprelSplitted: string[] = [];

    const currentoptions: {
      name: string;
      values: string[];
      join: string;
    }[] = [];

    const relav: {
      a: string;
      v: string;
      join: string;
    }[] = [];
    return {
      relationDialogOpened: false,
      dep,
      gov,
      userId: '',
      depDeprel,
      depDeprelSplitted,
      options: {
        // attribute table dialog specific stuff
        annof, // = annotationFeatures from conf!!!
        shownfeatures,
        shownmeta,
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: new RegExp('', ''),
        relav,
        extendedrel: false,
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        currentoptions,
      },
      featTable: {
        featl: [],
        miscl: [],
        lemma: [],
        columns: [
          {
            name: 'a',
            align: 'center',
            label: 'Attribute',
            field: 'a',
            sortable: true,
            style: 'width: 33%',
          },
          {
            name: 'v',
            label: 'Value',
            field: 'v',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            field: '',
            align: 'center',
            style: 'width: 8%',
          },
        ],
      },
    };
  },
  created() {
    this.options.annof = this.annotationFeatures;
    this.options.shownfeatures = this.shownfeatures;
    this.options.shownmeta = this.shownmeta;
    // precompute to check for changes quickly:
    this.options.annofFEATS = this.options.annof.FEATS.reduce((obj, r) => {
      if (r.values) (obj as { [key: string]: string[] })[r.name] = r.values;
      return obj;
    }, {});
    this.options.annofMISC = this.options.annof.MISC.reduce((obj, r) => {
      if (r.values) (obj as { [key: string]: string[] | string })[r.name] = r.values;
      return obj;
    }, {});
    this.options.splitregex = new RegExp(`[${this.options.annof.DEPREL.map(({ join }) => join).join('')}]`, 'g'); // = /[:@]/g
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures', 'shownfeatures', 'shownmeta']),
  },
  mounted() {
    this.sentenceBus.on('open:relationDialog', ({ dep, gov, userId }) => {
      this.dep = dep;
      this.gov = gov;
      this.userId = userId;
      this.depDeprel = dep.DEPREL;
      this.depDeprelSplitted = dep.DEPREL.split(this.options.splitregex);

      /// /// TODO TO REFACTOR //////
      const depr = this.options.annof.DEPREL;
      this.options.currentoptions = depr;

      this.options.relav = depr.map((sr) => ({
        a: sr.name,
        v: '',
        join: sr.join,
      }));

      for (let i = 0; i < this.depDeprelSplitted.length; i += 1) {
        for (let ii = i; ii < depr.length; ii += 1) {
          if (this.depDeprel.includes(depr[ii].join + this.depDeprelSplitted[i])) {
            this.options.relav[ii] = {
              a: depr[ii].name,
              v: this.depDeprelSplitted[i],
              join: depr[ii].join,
            };
            break;
          }
        }
      }
      this.relationDialogOpened = true;

      /// //// END TODO //////
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:relationDialog');
  },
  methods: {
    onChangeRelation() {
      this.relationDialogOpened = false;
      const newDeprel = this.options.relav.reduce((tot, cur, i) => {
        tot += this.options.relav[i].v ? this.options.annof.DEPREL[i].join + cur.v : '';
        return tot;
      }, '');
      if (this.gov.ID === undefined || this.gov.ID === null) {
        this.dep.DEPREL = '_';
        this.dep.HEAD = -1;
      } else {
        this.dep.DEPREL = newDeprel || '_';
        this.dep.HEAD = parseInt(this.gov.ID, 10) || -1;
      }
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        // gov: this.gov,
        userId: this.userId,
      });
    },
    onDeleteRelation() {
      this.dep.DEPREL = '_';
      this.dep.HEAD = -1;
      this.sentenceBus.emit('tree-update:token', {
        token: this.dep,
        // gov: this.gov,
        userId: this.userId,
      });
    },
  },
};
</script>

<style></style>
