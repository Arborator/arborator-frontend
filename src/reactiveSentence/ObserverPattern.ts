/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface ISubject {
  // Attach an observer to the subject.
  attach(observer: IObserver): void;

  // Detach an observer from the subject.
  detach(observer: IObserver): void;

  // Notify all observers about an event.
  notify(): void;
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface IObserver {
  // Receive update from subject.
  update(subject: ISubject): void;
}
