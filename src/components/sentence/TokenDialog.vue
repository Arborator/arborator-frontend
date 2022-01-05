<template>
  <!----------------- Start TokenDialog ------------------->

  <q-dialog v-model="tokenDialogOpened">
    <q-card style="height: 90vh; width: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Replacing "{{ currentword }}" by:</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <AttributeTable
        :featdata="tokl"
        :columns="featTable.columns"
        :feat-options="['String']"
        open-features="true"
        modifiable="true"
        title="Token"
        :numbered="currentword"
      ></AttributeTable>
      <q-separator />
      <q-card-actions align="around">
        <q-btn v-close-popup flat label="Cancel" style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn
          v-close-popup
          color="primary"
          label="I know what I'm doing"
          style="width: 45%; margin-left: auto; margin-right: auto"
          no-caps
          @click="onTokenDialogOk()"
        >
          <q-tooltip content-class="bg-negative" content-style="font-size: 16px" transition-show="rotate" transition-hide="rotate"
            >⚠ Changing tokens breaks the comparability of different annotations of the same sentence!</q-tooltip
          >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!----------------- End TokenDialog ------------------->
</template>

<script lang="ts">
import conllup from 'conllup';
import AttributeTable from './AttributeTable.vue';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { PropType } from 'vue';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
const replaceArrayOfTokens = conllup.replaceArrayOfTokens;

import { defineComponent } from 'vue';

export default defineComponent({
  components: { AttributeTable },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
  },
  data() {
    const tokidsequence: number[] = [];
    const tokl: {
      a: number;
      v: string;
    }[] = [];
    return {
      tokenDialog: false,
      tokenDialogOpened: false,
      tokidsequence,
      startIndex: 0,
      endIndex: 0,
      selection: '',
      token: {},
      userId: '',
      currentword: '',
      tokl,
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
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
  mounted() {
    this.sentenceBus.on('open:tokenDialog', ({ userId, event }) => {
      this.userId = userId;
      if (event.target !== null) {
        this.startIndex = (event.target as HTMLInputElement).selectionStart || 0;
        this.endIndex = (event.target as HTMLInputElement).selectionEnd || 0;
        this.selection = (event.target as HTMLInputElement).value.substring(this.startIndex, this.endIndex);
        this.openTokenDialog(this.startIndex, this.endIndex, this.selection);
      }
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:tokenDialog');
  },
  methods: {
    openTokenDialog(b: number, e: number, t: string) {
      this.tokenDialogOpened = true;

      // begin index, end index, selected token of text field in sentenceCard
      while (t[t.length - 1] === ' ') {
        t = t.substring(0, t.length - 1);
        e -= 1;
      }
      while (t[0] === ' ') {
        t = t.substring(1);
        b += 1;
      }
      const { treeJson } = this.sentenceBus.sentenceSVGs[this.userId];
      const toks = Object.values(treeJson).map(({ FORM }) => FORM);
      const spa = Object.values(treeJson).map(({ MISC }) => ('SpaceAfter' in MISC && MISC.SpaceAfter === 'No' ? 0 : 1));
      const toktok = [];
      let currp = 0;
      let sentence = '';
      for (let i = 0; i < toks.length; i += 1) {
        sentence += toks[i] + (spa[i] ? ' ' : '');
        toktok.push({
          i: i + 1,
          t: toks[i],
          b: currp,
          e: currp + toks[i].length,
        });
        currp += toks[i].length + spa[i];
      }
      const ints = toktok.filter((x) => x.b >= b && x.e <= e);
      const outts = toktok.filter((x) => (x.b >= b && x.b <= e) || (x.e >= b && x.e <= e));
      if (!outts.length) return; // strange, shouldn't happen
      const proposedav = [];
      if (outts[0].b < b) {
        proposedav.push({ a: 1, v: outts[0].t.substring(0, b - outts[0].b) }, { a: 2, v: outts[0].t.substring(b - outts[0].b) });
      }
      for (const to of ints) proposedav.push({ a: proposedav.length + 1, v: to.t });
      if (e < outts[outts.length - 1].e) {
        proposedav.push(
          {
            a: proposedav.length + 1,
            v: outts[outts.length - 1].t.substring(0, e - outts[outts.length - 1].b),
          },
          {
            a: proposedav.length + 2,
            v: outts[outts.length - 1].t.substring(e - outts[outts.length - 1].b),
          }
        );
      }
      this.tokidsequence = outts.map(({ i }) => i);
      if (outts) {
        this.currentword = sentence.substring(outts[0].b, outts[outts.length - 1].e);
        this.tokl = proposedav;
        // this.tokenDialog = !this.tokenDialog;
      }
    },
    onTokenDialogOk() {
      this.tokenDialog = !this.tokenDialog;
      const ttokl = this.tokl.map(({ v }) => v).filter((x) => x.trim().length > 0);
      const oldTree = this.reactiveSentencesObj[this.userId].state.treeJson;
      const oldTokensIndexes = this.tokidsequence;
      const newTokensForm = ttokl;
      const newTree = replaceArrayOfTokens(oldTree, oldTokensIndexes, newTokensForm);
      this.sentenceBus.emit('tree-update:tree', {
        tree: newTree,
        userId: this.userId,
      });

      // this.$emit(
      //   "changed:metaText",
      //   this.sentenceBus[this.userId].metaJson.text
      // );
    },
  },
});
</script>
<style></style>
