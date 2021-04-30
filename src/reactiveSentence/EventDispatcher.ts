/**
 * Typescript class from @kirianguiller / https://github.com/kirianguiller
 * from JS prototype by @author mrdoob / http://mrdoob.com/
 */

export class EventDispatcher {
  _listeners: { [key: string]: Function[] } = {};

  constructor() {
    // do nothing
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  hasEventListener(type: string, listener: () => void) {
    if (this._listeners === undefined) return false;

    const listeners = this._listeners;

    return (
      listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
    );
  }

  removeEventListener(type: string, listener: () => void) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event) {
    if (this._listeners === undefined) return;

    const listeners = this._listeners;
    const listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      // event.target = this; // comment it out because it cause a "TypeError: setting getter-only property "target""

      const array = listenerArray.slice(0);

      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }
    }
  }
}
