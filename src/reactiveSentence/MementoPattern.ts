import { SentenceJson } from "conllup/lib/conll";

export interface IOriginator {
  save(): IMemento;

  restore(memento: IMemento): void;
}

/**
 * The Memento interface provides a way to retrieve the memento's metadata, such
 * as creation date or name. However, it doesn't expose the Originator's state.
 */
export interface IMemento {
  getState(): string;

  getName(): string;

  getDate(): string;
}

/**
 * The Caretaker doesn't depend on the Concrete Memento class. Therefore, it
 * doesn't have access to the originator's state, stored inside the memento. It
 * works with all mementos via the base Memento interface.
 */

export interface ICaretaker {
  backup(): void;
  undo(): void;
  showHistory(): void;
}
