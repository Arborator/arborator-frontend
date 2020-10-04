const CONLL_OPTIONS = {
  reverseMode: false,
  conlls: {
    10: {
      ID: 0,
      FORM: 1,
      LEMMA: 2,
      UPOS: 3,
      XPOS: 4,
      FEATS: 5,
      HEAD: 6,
      DEPREL: 7,
      DEPS: 8,
      MISC: 9,
    },
    14: { ID: 0, FORM: 1, LEMMA: 3, UPOS: 5, HEAD: 9, DEPREL: 11 },
    4: { FORM: 0, LEMMA: 0, UPOS: 1, HEAD: 2, DEPREL: 3 },
  },
};

export function conllToJson(sentenceConll) {
  // takes a conll string representation of a single tree as input
  // returns object: {tree:tree, META:META}
  // tree : {1: {ID : "1", FORM : "euuuh", LEMMA : "euh", ...}}
  // META : {sent_id : "3245", text: "euuuh je ne suis pas sur", timestamp: "12341245421", ...}

  // sentenceConll = "# text_id = 3245\n# text = euuuh je ne suis pas sur\n ......"
  var nodes = sentenceConll.trim().split("\n");
  if (CONLL_OPTIONS.reverseMode) {
    nodes.reverse();
  }
  // nodes = nodes.reverse();
  var treeJson = {};
  var metaJson = {}; // sentence features before the actual conll
  var addLines = {}; // node position to additional line
  var uextra = {}; // todo: check this for reconstruction of conllu
  var lastid = 0;
  var skipuntil = 0;
  var words = [];
  nodes.forEach((nodeline, id) => {
    // for each conll line:
    nodeline = nodeline
      .trim()
      .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    if (nodeline.charAt(0) == "#") {
      // metaJson
      var [a, v] = nodeline
        .substring(1)
        .trim()
        .split("=");
      if (v != null) [a, v] = [a.trim(), v.trim()];
      metaJson[a] = v;
      return true;
    }
    var elements = nodeline.split("\t");
    var el = elements.length;
    if (el > 1) {
      if (!(el in CONLL_OPTIONS.conlls) && el > 10) el = 10;
      if (el > 4) id = elements[CONLL_OPTIONS.conlls[el]["ID"]];
      else if (elements[CONLL_OPTIONS.conlls[el]["FORM"]] != "_") id++;
      var form = elements[CONLL_OPTIONS.conlls[el]["FORM"]];
      var tokids = id.split("-");
      if (tokids.length == 1) {
        // simple token
        treeJson[id] = {};
        treeJson[id]["ID"] = parseInt(id);
        treeJson[id]["FORM"] = form;
        treeJson[id]["LEMMA"] = elements[CONLL_OPTIONS.conlls[el]["LEMMA"]];
        treeJson[id]["UPOS"] = elements[CONLL_OPTIONS.conlls[el]["UPOS"]];
        treeJson[id]["HEAD"] = parseInt(elements[CONLL_OPTIONS.conlls[el]["HEAD"]]);
        treeJson[id]["DEPREL"] = elements[CONLL_OPTIONS.conlls[el]["DEPREL"]];
        treeJson[id]["FEATS"] = {};
        treeJson[id]["DEPS"] = {};
        treeJson[id]["MISC"] = {};

        // if (treeJson[id]["DEPREL"] == "_") {
        //   treeJson[id]["DEPREL"] = ""
        // }

        if (id > skipuntil) words.push(form);
        if (el == 10) {
          treeJson[id]["XPOS"] = elements[CONLL_OPTIONS.conlls[el]["XPOS"]];
          treeJson[id]["FEATS"] = analyzeFeaturestring(
            elements[CONLL_OPTIONS.conlls[el]["FEATS"]],
            "=",
            "|"
          );
          treeJson[id]["DEPS"] = analyzeFeaturestring(
            elements[CONLL_OPTIONS.conlls[el]["DEPS"]],
            ":",
            "|"
          );
          treeJson[id]["MISC"] = analyzeFeaturestring(
            elements[CONLL_OPTIONS.conlls[el]["MISC"]],
            "=",
            "|"
          );
        }
      } else if (tokids.length == 2) {
        // n-m type multi-word encoding
        skipuntil = parseInt(tokids[1]);
        words.push(elements[CONLL_OPTIONS.conlls[el]["FORM"]]);
        if (!(lastid in uextra)) uextra[lastid] = [];
        uextra[lastid].push(nodeline);
      } else {
        if (!(lastid in uextra)) uextra[lastid] = [];
        uextra[lastid].push(nodeline);
      }
    } //end if el >1
    else {
      // bizarre line
      if (!(lastid in addLines)) addLines[lastid] = [];
      addLines[lastid].push(nodeline);
      if (tokids.length == 2) {
        // n-m type multi-word encoding
        skipuntil = parseInt(tokids[1]);
        words.push(elements[CONLL_OPTIONS.conlls[el]["FORM"]]);
      }
      treeJson[id]["HEAD"] = parseInt(elements[CONLL_OPTIONS.conlls[el]["HEAD"]]); // todo: think about this
      treeJson[id]["DEPREL"] = elements[CONLL_OPTIONS.conlls[el]["DEPREL"]];
    }

    lastid = id;
  });

  // now always correcting the metaJson.text feature. if this is not desired, uncomment this line:
  // if ("text" in metaJson) return {treeJson:treeJson, metaJson:metaJson};
  // got to contstruct the sentence
  var sentence = [];
  words.forEach((word, i) => {
    sentence.push(word);
    if (
      !(
        "SpaceAfter" in treeJson[i + 1]["MISC"] &&
        treeJson[i + 1]["MISC"]["SpaceAfter"] == "No"
      )
    )
      sentence.push(" ");
    // if(!reverseMode){
    // 	if (i+1 in treeJson && !(("NoSpaceAfter" in treeJson[i+1]) && treeJson[i+1]["NoSpaceAfter"]==false)) sentence.push(" ");
    // } else{ sentence.push(word); }
  });
  metaJson["text"] = sentence.join("");
  return { treeJson: treeJson, metaJson: metaJson };
}

export function jsonToConll({treeJson, metaJson}) {
  // input : sentenceJson {metaJson, treeJson}
  // output : sentenceConll (string)
  const sentenceJson = {treeJson, metaJson}
  if (!sentenceJson) return "";
  var conlines = [];
  for (let a in sentenceJson.metaJson) {
    var v = sentenceJson.metaJson[a];
    if (v != null) conlines.push("# " + a + " = " + v);
    // +'\n'
    else conlines.push("# " + a);
  }
  for (let nr in sentenceJson.treeJson) {
    var node = sentenceJson.treeJson[nr];
    // if (node["DEPREL"] == "_") {
    //   node["DEPREL"] = ""
    // }
    conlines.push(
      [
        nr,
        node["FORM"] || "_",
        node["LEMMA"] || "_",
        node["UPOS"] || "_",
        node["XPOS"] || "_",
        makeFeaturestring(node["FEATS"], "=", "|"),
        node["HEAD"] == parseInt(node["HEAD"]) ? node["HEAD"] : "_",
        node["DEPREL"] || "_",
        makeFeaturestring(node["DEPS"], ":", "|"),
        makeFeaturestring(node["MISC"], "=", "|"),
      ].join("\t")
    );
  }
  const sentenceConll = conlines.join("\n");
  return sentenceConll;
}

export function analyzeFeaturestring(featstr, eq, spl) {
  const o = {};
  if (featstr.indexOf(eq) > -1) {
    featstr.split(spl).forEach(function(
      f // for each feature:
    ) {
      var fs = f.split(eq);
      if (fs.length >= 2) {
        // if it's not just _
        o[fs[0]] = fs.slice(1).join(eq);
      }
    });
  }
  return o;
}

function makeFeaturestring(feato, eq, spl) {
  const strs = [];
  for (const k in feato) {
    strs.push(k + eq + feato[k]);
  }
  const str = strs.join(spl);
  return str || "_";
}

export function getSentenceTextFromJson(treeJson) {
  var toks = Object.values(treeJson).map(({ FORM }) => FORM);
  var spa = Object.values(treeJson).map(({ MISC }) =>
    "SpaceAfter" in MISC && MISC.SpaceAfter == "No" ? 0 : 1
  );
  var sentence = "";
  for (var i = 0; i < toks.length; ++i)
    sentence += toks[i] + (spa[i] ? " " : "");
  return sentence;
}
