import { jsonToConll, conllToJson, getSentenceTextFromJson } from "./Conll.js";
import { EventDispatcher } from "./EventDispatcher.js";

///////////////                            ////////////////
///////////////    ReactiveSentence    ////////////////
///////////////                            ////////////////

export class ReactiveSentence {
  constructor() {
    this.treeJson = {}
    this.metaJson = {}
  }

  fromConll(sentenceConll) {
    this.sentenceConll = sentenceConll;

    const sentenceJson = conllToJson(this.sentenceConll);
    Object.assign(this.treeJson,sentenceJson.treeJson);
    Object.assign(this.metaJson,sentenceJson.metaJson);
    // this.metaJson = sentenceJson.metaJson;
    const event = new CustomEvent("token-updated", {
      detail: {
        treeJson: this.treeJson,
      },
    });
    this.dispatchEvent(event);
  }

  updateToken(tokenJson) {
    this.treeJson[tokenJson.ID] = tokenJson;

    const event = new CustomEvent("token-updated", {
      detail: {
        tokenJson: this.treeJson[tokenJson.ID],
      },
    });
    this.dispatchEvent(event);
  }

  updateTree(treeJson) {
    for (const [tokenIndex, tokenJson] of Object.entries(treeJson)) {
      this.treeJson[tokenIndex] = tokenJson;
      Object.assign(this.treeJson[tokenIndex], tokenJson)
    }
    
    const event = new CustomEvent("token-updated", {
      detail: {
        treeJson: this.treeJson,
      },
    });
    this.dispatchEvent(event);
  }

  resetRecentChanges() {
    const sentenceJson = conllToJson(this.sentenceConll);
    Object.assign(this.treeJson,sentenceJson.treeJson);
    Object.assign(this.metaJson,sentenceJson.metaJson);
    const event = new CustomEvent("token-updated", {
      detail: {
        treeJson: this.treeJson,
      },
    });
    this.dispatchEvent(event);
  }

  exportConllWithModifiedMeta(newMetaJson) {
    for (const [metaName, metaValue] of Object.entries(this.metaJson)) {
      if (!Object.keys(newMetaJson).includes(metaName)) {
        newMetaJson[metaName] = metaValue;
      }
    }

    const sentenceJsonToExport = {
      treeJson: this.treeJson,
      metaJson: newMetaJson,
    };
    return jsonToConll(sentenceJsonToExport);
    // console.log("KK transformed meta", newMetaJson)
  }

  // updateToken({ ID, HEAD, DEPREL }) {
  //   this.treeJson[ID].HEAD = HEAD;
  //   this.treeJson[ID].DEPREL = DEPREL;

  //   const event = new CustomEvent("token-updated", {
  //     detail: {
  //       tokenJson: this.treeJson[ID],
  //     },
  //   });
  //   this.dispatchEvent(event);
  // }
}

Object.assign(ReactiveSentence.prototype, EventDispatcher.prototype);
