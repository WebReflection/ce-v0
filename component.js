function Component(config) {'use strict';
  /*! (C) 2017 Andrea Giammarchi - Mit Style License */
  var
    define = function (source, keyS, target, keyT) {
      var desc = Object.getOwnPropertyDescriptor(source, keyS);
      if (desc) {
        desc.enumerable = false;
        target[keyT] = desc;
      }
    },
    cDescs = {}, pDescs = {},
    Super = config['extends'] || HTMLElement,
    key, tmp
  ;
  for (key in config) {
    switch (key) {
      // Class related
      case 'extends': break;
      case 'name': break;
      case 'static':
        tmp = config[key];
        for (key in tmp) define(tmp, key, cDescs, key);
        break;
      // Class.prototype related
      case 'constructor':
        define(config, key, pDescs, 'createdCallback'); break;
      case 'onattribute':
        define(config, key, pDescs, 'attributeChangedCallback'); break;
      case 'onconnected':
        define(config, key, pDescs, 'attachedCallback'); break;
      case 'ondisconnected':
        define(config, key, pDescs, 'detachedCallback'); break;
      default:
        define(config, key, pDescs, key); break;
    }
  }
  return (
    Object.setPrototypeOf ||
    function (o, p) {
      o.__proto__ = p;
      // IE < 11
      if (!(o instanceof p)) {
        delete o.__proto__;
        for (key in p) try {
          define(p, key, o, key);
        } catch(o_O) {}
      }
      return o;
    }
  )(
    Object.defineProperties(
      document.registerElement(
        config.name,
        {prototype: Object.create(Super.prototype, pDescs)}
      ),
      cDescs
    ),
    Super
  );
}

try { module.exports = Component; } catch(o_O) {}
