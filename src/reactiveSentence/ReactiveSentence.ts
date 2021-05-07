import conllup from "conllup";
const { emptySentenceJson, sentenceConllToJson, sentenceJsonToConll, emptyTokenJson } = conllup;

import {
  SentenceJson,
  TreeJson,
  TokenJson,
  FeatureJson,
  MetaJson,
} from "conllup/lib/conll";

import { IOriginator, IMemento, ICaretaker } from "./MementoPattern";
import { ISubject, IObserver } from "./ObserverPattern";

/**
 * The Concrete Memento contains the infrastructure for storing the Originator's
 * state.
 */
export class SentenceMemento implements IMemento {
  private state: string;

  private date: string;

  constructor(state: string) {
    this.state = state;
    this.date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
  }

  /**
   * The Originator uses this method when restoring its state.
   */
  public getState(): string {
    return this.state;
  }

  /**
   * The rest of the methods are used by the Caretaker to display metadata.
   */
  public getName(): string {
    return `${this.date}`;
    // return `${this.date} / (${this.state.substr(0, 9)}...)`;
  }

  public getDate(): string {
    return this.date;
  }
}

/**
 * The Subject owns some important state and notifies observers when the state
 * changes.
 */

export class ReactiveSentence implements IOriginator, ISubject {
  /**
   * @type {number} For the sake of simplicity, the Subject's state, essential
   * to all subscribers, is stored in this variable.
   */
  public state: SentenceJson = emptySentenceJson();

  /**
   * @type {Observer[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  private observers: IObserver[] = [];

  /**
   * The subscription management methods.
   */
  public attach(observer: IObserver): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log("Subject: Observer has been attached already.");
    }

    console.log("Subject: Attached an observer.");
    this.observers.push(observer);
  }

  public detach(observer: IObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log("Subject: Nonexistent observer.");
    }

    this.observers.splice(observerIndex, 1);
    console.log("Subject: Detached an observer.");
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  /**
   * Originator implementation
   */
  public save(): IMemento {
    return new SentenceMemento(JSON.stringify(this.state));
  }

  /**
   * Restores the Originator's state from a memento object.
   */
  public restore(memento: IMemento): void {
    this.state = JSON.parse(memento.getState());
    this.notify();
  }

  /**
   * Usually, the subscription logic is only a fraction of what a Subject can
   * really do. Subjects commonly hold some important business logic, that
   * triggers a notification method whenever something important is about to
   * happen (or after it).
   */
  public fromSentenceConll(sentenceConll: string): void {
    this.state = sentenceConllToJson(sentenceConll);
    this.notify();
  }

  public updateToken(tokenJson: TokenJson): void {
    tokenJson.ID = tokenJson.ID.toString();
    Object.assign(this.state.treeJson[tokenJson.ID], tokenJson);
    this.notify();
  }

  public updateTree(treeJson: TreeJson): void {
    this.state.treeJson = JSON.parse(JSON.stringify(treeJson));
    this.notify();
  }

  public updateSentence(sentenceJson: SentenceJson): void {
    this.state = JSON.parse(JSON.stringify(sentenceJson));
    this.notify();
  }

  public addEmptyToken(): void {
    const newToken = emptyTokenJson()
    let idLastToken = "1"
    for (const tokenJson of Object.values(this.state.treeJson)) {
      if (tokenJson.isGroup === false) {
        idLastToken = (parseInt(tokenJson.ID) + 1).toString()
      }
    }
    newToken.ID = idLastToken
    newToken.FORM = "new_token"
    this.state.treeJson[newToken.ID] = newToken
    this.state.treeJson = JSON.parse(JSON.stringify(this.state.treeJson))
    this.notify()
  }

  public exportConll() {
    return sentenceJsonToConll({
      treeJson: this.state.treeJson,
      metaJson: this.state.metaJson
    });
  }

  public getSentenceText(): string {
    let sentence = "";
    for (const tokenId in this.state.treeJson) {
      const token = this.state.treeJson[tokenId];
      const form = token.FORM;
      const space = token.MISC.SpaceAfter === "No" ? "" : " ";
      sentence = sentence + form + space;
    }
    return sentence;
  }

  public getUndescoredText(): string {
    const tokensForms = [];
    for (const tokenId in this.state.treeJson) {
      const token = this.state.treeJson[tokenId];
      tokensForms.push(token.FORM);
    }
    const underscoredText = tokensForms.join("_");
    return underscoredText;
  }

  public getAllFeaturesSet(): string[] {
    const allFeaturesSet: string[] = ["FORM", "LEMMA", "UPOS", "XPOS"];
    for (const tokenId in this.state.treeJson) {
      const features: FeatureJson = this.state.treeJson[tokenId].FEATS;
      const miscs: FeatureJson = this.state.treeJson[tokenId].MISC;
      for (const feat in features) {
        if (!allFeaturesSet.includes(`FEATS.${feat}`)) {
          allFeaturesSet.push(`FEATS.${feat}`);
        }
      }

      for (const misc in miscs) {
        if (!allFeaturesSet.includes(`MISC.${misc}`)) {
          allFeaturesSet.push(`MISC.${misc}`);
        }
      }
    }
    return allFeaturesSet;
  }

  public exportConllWithModifiedMeta(newMetaJson: MetaJson): string {
    for (const [metaName, metaValue] of Object.entries(this.state.metaJson)) {
      if (!Object.keys(newMetaJson).includes(metaName)) {
        newMetaJson[metaName] = metaValue;
      }
    }

    const sentenceJsonToExport: SentenceJson = {
      treeJson: this.state.treeJson,
      metaJson: newMetaJson,
    };

    return sentenceJsonToConll(sentenceJsonToExport);
  }
}

export class SentenceCaretaker implements ICaretaker {
  private mementos: IMemento[] = [];
  private currentStateIndex: number = -1; 
  private originator: IOriginator;

  constructor(originator: IOriginator) {
    this.originator = originator;
  }

  public backup(): void {
    this.mementos = this.mementos.slice(0, this.currentStateIndex + 1)
    this.mementos.push(this.originator.save());
    this.currentStateIndex ++;
  }

  public canUndo(): boolean {
    return this.currentStateIndex !== 0
  }

  public canRedo(): boolean {
    return this.currentStateIndex + 1 !== this.mementos.length
  }


  public undo(): void {
    if (!this.canUndo()) {
      console.log("caretaker: the caretaker mementos was empty")
      return;
    }
    this.currentStateIndex --;
    const memento = this.mementos[this.currentStateIndex];
    if (memento) {
      this.originator.restore(memento);

    }
  }

  public redo(): void {
    if (!this.canRedo() ) {
      console.log("caretaker: can't redo, you are already at the end of your mementos")
      return
    }
    this.currentStateIndex ++;
    const memento = this.mementos[this.currentStateIndex]
    if (memento) {
      this.originator.restore(memento)
    }
  }

  public showHistory(): void {
    for (const memento of this.mementos) {
      console.log(memento.getName(), memento.getState());
    }
  }
}
