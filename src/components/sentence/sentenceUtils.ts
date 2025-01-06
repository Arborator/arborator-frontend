import { sentence_bus_t, reactive_sentences_obj_t } from 'src/types/main_types';


export function replaceNewMetaText(data : { userId: string; sentenceBus: sentence_bus_t }) {
  const newMetaJson = data.sentenceBus.sentenceSVGs[data.userId].metaJson;
  const newTree = data.sentenceBus.sentenceSVGs[data.userId].treeJson;

  const groupsFromFirstID = Object.fromEntries(
    Object.entries(newTree.groupsJson).map(([key, value]) => {
      const ids = key.split('-')
      const newKey = ids[0]
      const newValue = { 'end': Number(ids[1]), 'form': value.FORM, noSpaceAfter: value.MISC.SpaceAfter}
      return [newKey, newValue];
    })
  );

  let newMetaText = '';
  let skip = -1;        // set the upper bound of MWT, used to ignore inside regular tokens
  let separator = '';   // store the separator for the next concatenation (avoid trailing whitespace)

  Object.entries(newTree.nodesJson).forEach(([key, node]) => {
    if (key in groupsFromFirstID) {
      newMetaText += separator + groupsFromFirstID[key].form;
      separator = (groupsFromFirstID[key].noSpaceAfter) ? '' : ' ';
      skip = groupsFromFirstID[key].end;
    } else {
      if (Number(key) > skip) {
        newMetaText += separator + node.FORM;
        separator = (node.MISC.SpaceAfter === 'No') ? '' : ' ';
      }
    }
  });
  newMetaJson.text = newMetaText;
  data.sentenceBus.emit('tree-update:sentence', {
    sentenceJson: {
      metaJson: newMetaJson,
      treeJson: data.sentenceBus.sentenceSVGs[data.userId].treeJson,
    },
    userId: data.userId,
  });
}
