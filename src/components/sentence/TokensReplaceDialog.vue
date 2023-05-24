<template>
  <q-dialog v-model="tokensReplaceDialogOpened">
    <q-card style="width: 90vh">
      <q-bar class="bg-primary text-white" style="height: max-content">
        <div class="text-weight-bold">{{$t('attributeTable.tokenReplaceDial[0]')}} "{{ currentword }}" {{$t('attributeTable.tokenReplaceDial[1]')}}:</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="max-height: 70vh" class="scroll">
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
      </q-card-section>
      <q-card-actions align="around">
        <q-btn v-close-popup flat :label="$t('cancel')" style="width: 45%; margin-left: auto; margin-right: auto" />
        <q-btn
          v-close-popup
          color="primary"
          :label="$t('attributeTable.tokenReplaceDial[3]')"
          style="width: 45%; margin-left: auto; margin-right: auto"
          no-caps
          @click="onTokensReplaceDialogOk()"
        >
          <q-tooltip content-class="bg-negative" content-style="font-size: 16px" transition-show="rotate" transition-hide="rotate"
            >⚠ {{$t('attributeTable.tokenReplaceDial[2]')}}</q-tooltip
          >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import AttributeTable from './AttributeTable.vue';
import { mapState } from 'pinia';
import { PropType } from 'vue';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { replaceArrayOfTokens } from 'conllup/lib/conll';

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
      tokensReplaceDialog: false,
      tokensReplaceDialogOpened: false,
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
  mounted() {
    this.sentenceBus.on('open:tokensReplaceDialog', ({ userId, event }) => {
      this.userId = userId;
      if (event.target !== null) {
        if (event.type === 'select') {
          this.startIndex = (event.target as HTMLInputElement).selectionStart || 0;
          this.endIndex = (event.target as HTMLInputElement).selectionEnd || 0;
          this.selection = (event.target as HTMLInputElement).value.substring(this.startIndex, this.endIndex);
          this.openTokensReplaceDialog(this.startIndex, this.endIndex, this.selection);
        } else {
          this.startIndex = 0;
          this.endIndex = this.reactiveSentencesObj[this.userId].getSentenceText().length;
          this.selection = this.reactiveSentencesObj[this.userId].getSentenceText();
          this.openTokensReplaceDialog(this.startIndex, this.endIndex, this.selection);
        }
      }
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:tokensReplaceDialog');
  },
  methods: {
    // begin index, end index, selected token of text field in sentenceCard
    openTokensReplaceDialog(selectionBegin: number, selectionEnd: number, selectionText: string) {
      this.tokensReplaceDialogOpened = true;

      while (selectionText[selectionText.length - 1] === ' ') {
        selectionText = selectionText.substring(0, selectionText.length - 1);
        selectionEnd -= 1;
      }
      while (selectionText[0] === ' ') {
        selectionText = selectionText.substring(1);
        selectionBegin += 1;
      }

      const { treeJson } = this.sentenceBus.sentenceSVGs[this.userId];
      const tokensForms = Object.values(treeJson.nodesJson).map(({ FORM }) => FORM);
      const spaceAfters = Object.values(treeJson.nodesJson).map(({ MISC }) => ('SpaceAfter' in MISC && MISC.SpaceAfter === 'No' ? 0 : 1));

      const tokens = [];
      let cumulativeLength = 0;
      let sentence = '';
      for (let i = 0; i < tokensForms.length; i += 1) {
        sentence += tokensForms[i] + (spaceAfters[i] ? ' ' : '');
        tokens.push({
          i: i + 1,
          form: tokensForms[i],
          begin: cumulativeLength,
          end: cumulativeLength + tokensForms[i].length,
        });
        cumulativeLength += tokensForms[i].length + spaceAfters[i];
      }
      // stricly inside VS partly inside (the following line is the sentence, and the line after is the selection (SSS represent the selected text)) :
      //    The apple jump on the floor
      //    °°°°°°SSSSSSSSSS°°°°°°°°°°°
      // strictlyInside = ["jump"]
      // partlyInside = ["apple", "jump", "on"]
      const strictlyInside = tokens.filter((tok) => tok.begin >= selectionBegin && tok.end <= selectionEnd);
      const partlyInside = tokens.filter((tok) => tok.end > selectionBegin && tok.begin < selectionEnd);

      if (!partlyInside.length) {
        // this happens when we select white space
        this.tokensReplaceDialogOpened = false;
        return;
      }

      const proposedav = [];

      if (partlyInside.length === 1 && strictlyInside.length === 0) {
        proposedav.push(
          { a: 1, v: partlyInside[0].form.substring(0, selectionBegin - partlyInside[0].begin) },
          { a: 2, v: partlyInside[0].form.substring(selectionBegin - partlyInside[0].begin, selectionEnd - partlyInside[0].begin) },
          { a: 3, v: partlyInside[0].form.substring(selectionEnd - partlyInside[0].begin) }
        );
      } else {
        if (partlyInside[0].begin < selectionBegin) {
          proposedav.push(
            { a: 1, v: partlyInside[0].form.substring(0, selectionBegin - partlyInside[0].begin) },
            { a: 2, v: partlyInside[0].form.substring(selectionBegin - partlyInside[0].begin) }
          );
        }
        for (const token of strictlyInside) {
          proposedav.push({ a: proposedav.length + 1, v: token.form });
        }
        if (partlyInside[partlyInside.length - 1].end > selectionEnd) {
          proposedav.push(
            {
              a: proposedav.length + 1,
              v: partlyInside[partlyInside.length - 1].form.substring(0, selectionEnd - partlyInside[partlyInside.length - 1].begin),
            },
            {
              a: proposedav.length + 2,
              v: partlyInside[partlyInside.length - 1].form.substring(selectionEnd - partlyInside[partlyInside.length - 1].begin),
            }
          );
        }
      }
      this.tokidsequence = partlyInside.map(({ i }) => i);
      if (partlyInside) {
        this.currentword = sentence.substring(partlyInside[0].begin, partlyInside[partlyInside.length - 1].end);
        this.tokl = proposedav;
      }
    },
    onTokensReplaceDialogOk() {
      this.tokensReplaceDialog = !this.tokensReplaceDialog;
      const ttokl = this.tokl.map(({ v }) => v).filter((x) => x.trim().length > 0);
      const oldTree = this.reactiveSentencesObj[this.userId].state.treeJson;
      const oldTokensIndexes = this.tokidsequence;
      const newTokensForm = ttokl;
      const newTree = replaceArrayOfTokens(oldTree, oldTokensIndexes, newTokensForm, true);
      const newMetaText = Object.values(newTree.nodesJson)
        .map(({ FORM }) => FORM)
        .join(' ');
      this.sentenceBus.emit('tree-update:tree', {
        tree: newTree,
        userId: this.userId,
      });
      this.sentenceBus.emit('changed:metaText', { newMetaText });
    },
  },
});
</script>
<style></style>
