const CONLL_OPTIONS: any = {
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

export const testConllString: string =
  "# user_id = teacher\n# sent_id = 1\n# text = euh bon pour aller du CRDT à la gare euh de Grenoble je euh ben je sors déjà du CRDT\n# timestamp = 1601476174927\n1\teuh\teuh\tINTJ\t_\t_\t17\tcomp\t_\t_\n2\tbon\tbon\tINTJ\t_\t_\t1\tdiscourse\t_\t_\n3\tpour\tpour\tADP\t_\t_\t1\tmod@periph\t_\t_\n4\taller\taller\tVERB\tETRE\t_\t1\tcomp:obj\t_\t_\n5\tdu\tde+le\tADP\t_\t_\t1\tobl@comp\t_\t_\n6\tCRDT\tCRDT\tPROPN\t_\t_\t1\tcomp:obj\t_\t_\n7\tà\tà\tADP\t_\t_\t_\tobl@comp\t_\t_\n8\tla\tle\tDET\t_\t_\t9\tdet\t_\t_\n9\tgare\tgare\tNOUN\t_\t_\t10\tcomp:obj\t_\t_\n10\teuh\teuh\tINTJ\t_\t_\t11\tdiscourse\t_\t_\n11\tde\tde\tADP\t_\t_\t12\tudep\t_\t_\n12\tGrenoble\tGrenoble\tPROPN\t_\t_\t13\tcomp:obj\t_\t_\n13\tje\tje\tPRON\t_\t_\t7\tsubj\t_\t_\n14\teuh\teuh\tINTJ\t_\t_\t13\tdiscourse\t_\t_\n15\tben\tben\tINTJ\t_\t_\t13\tdiscourse\t_\t_\n16\tje\tje\tPRON\t_\t_\t13\tconj@dicto\t_\t_\n17\tsors\tsortir\tVERB\tETRE\t_\t0\troot\t_\t_\n18\tdéjà\tdéjà\tADV\t_\t_\t17\tmod\t_\t_\n19\tdu\tde+le\tADP\t_\t_\t17\tobl@comp\t_\t_\n19-20\tCRDT\tCRDT\tPROPN\t_\t_\t19\tcomp:obj\t_\t_\n20\tCRDT\tCRDT\tPROPN\t_\t_\t19\tcomp:obj\t_\t_\n";

export interface FeatureJson {
  [key: string]: string;
}

export interface TokenJson {
  ID: number;
  FORM: string;
  LEMMA: string;
  UPOS: string;
  XPOS: string;
  FEATS: FeatureJson;
  HEAD: number;
  DEPREL: string;
  DEPS: FeatureJson;
  MISC: FeatureJson;
}

export interface TreeJson {
  [key: number]: TokenJson;
}

export interface MetaJson {
  [key: string]: string | number;
}

export interface SentenceJson {
  treeJson: TreeJson;
  metaJson: MetaJson;
}

export function conllToJson(sentenceConll: string): SentenceJson {
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
  const treeJson: TreeJson = {};
  const metaJson: MetaJson = {};
  var uextra: { [key: number]: string[] } = {}; // todo: check this for reconstruction of conllu
  var lastid = 0;
  var skipuntil = 0;
  let words: string[] = [];
  nodes.forEach((nodeline) => {
    // for each conll line:
    var ID: number = 0;
    var idStr: string;
    nodeline = nodeline
      .trim()
      .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    if (nodeline.charAt(0) == "#") {
      // metaJson
      var [a, v] = nodeline.substring(1).trim().split("=");
      if (v != null) [a, v] = [a.trim(), v.trim()];
      metaJson[a] = v;
      return true;
    }
    var nodeAttributes: string[] = nodeline.split("\t");
    var attrLength = nodeAttributes.length;
    if (attrLength > 1) {
      if (!(attrLength in CONLL_OPTIONS.conlls) && attrLength > 10) {
        attrLength = 10;
      }
      if (attrLength > 4) {
        idStr = nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["ID"]];
      } else {
        throw Error("The conll is not well formated (too few column)");
      }
      var form = nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["FORM"]];
      var tokids = idStr.split("-");
      if (tokids.length == 1) {
        // simple token
        ID = parseInt(idStr);
        var tokenJson: TokenJson = {
          ID: ID,
          FORM: form,
          LEMMA: nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["LEMMA"]],
          UPOS: nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["UPOS"]],
          XPOS: "",
          FEATS: {},
          HEAD: parseInt(
            nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["HEAD"]]
          ),
          DEPREL: nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["DEPREL"]],
          DEPS: {},
          MISC: {},
        };

        treeJson[ID] = tokenJson;

        if (ID > skipuntil) {
          words.push(form);
        }
        if (attrLength == 10) {
          treeJson[ID]["XPOS"] =
            nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["XPOS"]];
          treeJson[ID]["FEATS"] = analyzeFeaturestring(
            nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["FEATS"]],
            "=",
            "|"
          );
          treeJson[ID]["DEPS"] = analyzeFeaturestring(
            nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["DEPS"]],
            ":",
            "|"
          );
          treeJson[ID]["MISC"] = analyzeFeaturestring(
            nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["MISC"]],
            "=",
            "|"
          );
        }
      } else {
        // n-m type multi-word encoding
        if (tokids.length == 2) {
          skipuntil = parseInt(tokids[1]);
          words.push(nodeAttributes[CONLL_OPTIONS.conlls[attrLength]["FORM"]]);
        }

        if (!(lastid in uextra)) {
          uextra[lastid] = [];
        }

        uextra[lastid].push(nodeline);
      }
      //
    } else {
      //end if el >1
      // bizarre line
      throw Error("Conll is not well formated, only 1 element in conll");
    }

    lastid = ID;
  });

  // now always correcting the metaJson.text feature. if this is not desired, uncomment this line:
  // if ("text" in metaJson) return {treeJson:treeJson, metaJson:metaJson};
  // got to contstruct the sentence
  var sentence: string[] = [];
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

  const sentenceJson: SentenceJson = {
    treeJson: treeJson,
    metaJson: metaJson,
  };
  return sentenceJson;
}

export function jsonToConll(sentenceJson: SentenceJson): string {
  // input : sentenceJson {metaJson, treeJson}
  // output : sentenceConll (string)
  if (!sentenceJson) return "";
  var conlines: any[] = [];
  for (const [metaKey, metaValue] of Object.entries(sentenceJson.metaJson)) {
    if (metaValue != null) {
      conlines.push(`# ${metaKey} = ${metaValue}`);
    } else {
      conlines.push(`# ${metaKey}`);
    }
  }
  console.log(sentenceJson.treeJson)
  for (let tokenJson of Object.values(sentenceJson.treeJson)) {
    conlines.push(
      [
        tokenJson.ID || "_",
        tokenJson.FORM || "_",
        tokenJson.LEMMA || "_",
        tokenJson.UPOS || "_",
        tokenJson.XPOS || "_",
        makeFeaturestring(tokenJson.FEATS, "=", "|"),
        tokenJson.HEAD >= 0 ? tokenJson.HEAD : "_",
        tokenJson.DEPREL || "_",
        makeFeaturestring(tokenJson.DEPS, ":", "|"),
        makeFeaturestring(tokenJson.MISC, "=", "|"),
      ].join("\t")
    );
  }
  const sentenceConll = conlines.join("\n");
  return sentenceConll;
}

export function analyzeFeaturestring(
  featureString: string,
  equalizerSign: string,
  separatorSign: string
): FeatureJson {
  const featureJson: FeatureJson = {};
  if (featureString.indexOf(equalizerSign) > -1) {
    featureString.split(separatorSign).forEach(function (
      f // for each feature:
    ) {
      var fs = f.split(equalizerSign);
      if (fs.length >= 2) {
        // if it's not just _
        featureJson[fs[0]] = fs.slice(1).join(equalizerSign);
      }
    });
  }
  return featureJson;
}

function makeFeaturestring(
  featureJson: FeatureJson,
  equalizerSign: string,
  separatorSign: string
): string {
  const strs = [];
  for (const k in featureJson) {
    strs.push(k + equalizerSign + featureJson[k]);
  }
  const featureString = strs.join(separatorSign);
  return featureString || "_";
}

export function getSentenceTextFromJson(treeJson: TreeJson) {
  var toks = Object.values(treeJson).map(({ FORM }) => FORM);
  var spa = Object.values(treeJson).map(({ MISC }) =>
    "SpaceAfter" in MISC && MISC.SpaceAfter == "No" ? 0 : 1
  );
  var sentence = "";
  for (var i = 0; i < toks.length; ++i)
    sentence += toks[i] + (spa[i] ? " " : "");
  return sentence;
}
