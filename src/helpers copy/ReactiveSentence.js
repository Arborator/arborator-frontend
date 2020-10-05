import { jsonToConll, conllToJson, getSentenceTextFromJson } from "./Conll.js";
import { EventDispatcher } from "./EventDispatcher.js";
import {testt} from "./app"

///////////////                            ////////////////
///////////////    ReactiveSentence    ////////////////
///////////////                            ////////////////

export class ReactiveSentence {
  constructor() {
    this.treeJson = {};
    this.metaJson = {};
  }

  fromConll(sentenceConll) {
    this.sentenceConll = sentenceConll;

    const sentenceJson = conllToJson(this.sentenceConll);
    Object.assign(this.treeJson, sentenceJson.treeJson);
    Object.assign(this.metaJson, sentenceJson.metaJson);
    this._emitEvent({ treeJson: this.treeJson });
  }

  updateToken(tokenJson) {
    this.treeJson[tokenJson.ID] = tokenJson;
    this._emitEvent({ tokenJson: this.treeJson[tokenJson.ID] });
  }

  updateTree(treeJson) {
    for (const [tokenIndex, tokenJson] of Object.entries(treeJson)) {
      this.treeJson[tokenIndex] = tokenJson;
      Object.assign(this.treeJson[tokenIndex], tokenJson);
    }

    this._emitEvent({ treeJson: this.treeJson });
  }

  _emitEvent({ treeJson, tokenJson }) {
    const event = new CustomEvent("token-updated", {
      detail: {
        treeJson,
        tokenJson,
      },
    });

    this.dispatchEvent(event);
  }

  resetRecentChanges() {
    const sentenceJson = conllToJson(this.sentenceConll);
    Object.assign(this.treeJson, sentenceJson.treeJson);
    Object.assign(this.metaJson, sentenceJson.metaJson);
    this._emitEvent({ treeJson: this.treeJson });
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
  }
}

Object.assign(ReactiveSentence.prototype, EventDispatcher.prototype);
