const options = {
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
}

export function conllToTree(conllString) {
  // takes a conll string representation of a single tree as input
  // returns object: {tree:tree, META:META}
  // tree : {1: {ID : "1", FORM : "euuuh", LEMMA : "euh", ...}}
  // META : {sent_id : "3245", text: "euuuh je ne suis pas sur", timestamp: "12341245421", ...}

  // conllString = "# text_id = 3245\n# text = euuuh je ne suis pas sur\n ......"
  var nodes = conllString.trim().split("\n");
  if (options.reverseMode) nodes.reverse();
  // nodes = nodes.reverse();
  var tree = {};
  var META = {}; // sentence features before the actual conll
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
      // META
      var [a, v] = nodeline
        .substring(1)
        .trim()
        .split("=");
      if (v != null) [a, v] = [a.trim(), v.trim()];
      META[a] = v;
      return true;
    }
    var elements = nodeline.split("\t");
    var el = elements.length;
    if (el > 1) {
      if (!(el in options.conlls) && el > 10) el = 10;
      if (el > 4) id = elements[options.conlls[el]["ID"]];
      else if (elements[options.conlls[el]["FORM"]] != "_") id++;
      var form = elements[options.conlls[el]["FORM"]];
      var tokids = id.split("-");
      if (tokids.length == 1) {
        // simple token
        tree[id] = {};
        tree[id]["ID"] = parseInt(id);
        tree[id]["FORM"] = form;
        tree[id]["LEMMA"] = elements[options.conlls[el]["LEMMA"]];
        tree[id]["UPOS"] = elements[options.conlls[el]["UPOS"]];
        tree[id]["HEAD"] = parseInt(elements[options.conlls[el]["HEAD"]]);
        tree[id]["DEPREL"] = elements[options.conlls[el]["DEPREL"]];
        tree[id]["FEATS"] = {};
        tree[id]["DEPS"] = {};
        tree[id]["MISC"] = {};

        if (id > skipuntil) words.push(form);
        if (el == 10) {
          tree[id]["XPOS"] = elements[options.conlls[el]["XPOS"]];
          tree[id]["FEATS"] = analyzeFeaturestring(
            elements[options.conlls[el]["FEATS"]],
            "=",
            "|"
          );
          tree[id]["DEPS"] = analyzeFeaturestring(
            elements[options.conlls[el]["DEPS"]],
            ":",
            "|"
          );
          tree[id]["MISC"] = analyzeFeaturestring(
            elements[options.conlls[el]["MISC"]],
            "=",
            "|"
          );
        }
      } else if (tokids.length == 2) {
        // n-m type multi-word encoding
        skipuntil = parseInt(tokids[1]);
        words.push(elements[options.conlls[el]["FORM"]]);
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
        words.push(elements[options.conlls[el]["FORM"]]);
      }
      tree[id]["HEAD"] = parseInt(elements[options.conlls[el]["HEAD"]]); // todo: think about this
      tree[id]["DEPREL"] = elements[options.conlls[el]["DEPREL"]];
    }

    lastid = id;
  });

  // now always correcting the META.text feature. if this is not desired, uncomment this line:
  // if ("text" in META) return {tree:tree, META:META};
  // got to contstruct the sentence
  var sentence = [];
  words.forEach((word, i) => {
    sentence.push(word);
    if (
      !(
        "SpaceAfter" in tree[i + 1]["MISC"] &&
        tree[i + 1]["MISC"]["SpaceAfter"] == "No"
      )
    )
      sentence.push(" ");
    // if(!reverseMode){
    // 	if (i+1 in tree && !(("NoSpaceAfter" in tree[i+1]) && tree[i+1]["NoSpaceAfter"]==false)) sentence.push(" ");
    // } else{ sentence.push(word); }
  });
  META["text"] = sentence.join("");
  return { tree: tree, META: META };
}


export function treeToConll(treedata) {
  // constructs a conllu string from the current treedata
  // log('treeDataToConll',treedata)
  if (!treedata) return "";
  var conlines = [];
  for (let a in treedata.META) {
    var v = treedata.META[a];
    if (v != null) conlines.push("# " + a + " = " + v);
    // +'\n'
    else conlines.push("# " + a);
  }
  for (let nr in treedata.tree) {
    var node = treedata.tree[nr];
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
  const conllstr = conlines.join("\n");
  return conllstr;
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
