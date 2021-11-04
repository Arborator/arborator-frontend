export function computeFeatureString(featuresObject) {
  return Object.entries(featuresObject)
    .map((keyValue) => `${keyValue[0]}=${keyValue[1]}`)
    .join('|');
}

export function computeUniqueKey(lexiconItem) {
  const featuresString = computeFeatureString(lexiconItem.features);
  return `${lexiconItem.form}-${lexiconItem.lemma}-${lexiconItem.gloss}-${lexiconItem.pos}-${featuresString}`;
}
