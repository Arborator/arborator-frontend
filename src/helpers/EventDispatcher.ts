/**
 * Typescript class from @kirianguiller / https://github.com/kirianguiller
 * from JS prototype by @author mrdoob / http://mrdoob.com/
 */


export class EventDispatcher {
  _listeners: { [key: string]: Function[] } = {};

  constructor() {}

  addEventListener(type: string, listener: (event:Event) => void) {
    var listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  hasEventListener(type: string, listener: () => void) {
    if (this._listeners === undefined) return false;

    var listeners = this._listeners;

    return (
      listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
    );
  }

  removeEventListener(type: string, listener: () => void) {
    if (this._listeners === undefined) return;

    var listeners = this._listeners;
    var listenerArray = listeners[type];

    if (listenerArray !== undefined) {
      var index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event) {
    if (this._listeners === undefined) return;

    var listeners = this._listeners;
    var listenerArray = listeners[event.type];

    if (listenerArray !== undefined) {
      // event.target = this; // comment it out because it cause a "TypeError: setting getter-only property "target""

      var array = listenerArray.slice(0);

      for (var i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }
    }
  }
}
