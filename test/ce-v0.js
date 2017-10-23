function setProto(A, B) {
  A.prototype = Object.create(
    B.prototype,
    {constructor: {
      configurable: true,
      writable: true,
      value: A
    }}
  );
}

wru.test(typeof document === 'undefined' ? [] : [
  {
    name: "V0: attributeChangedCallback with empty values",
    test: function () {
      var done = wru.async(function (condition) {
        wru.assert(condition);
      });
      document.registerElement(
        'attr-changed', {
        prototype: Object.create(
          HTMLElement.prototype, {
            attributeChangedCallback: {value: function(
              name,           // always present
              previousValue,  // if null, it's a new attribute
              value           // if null, it's a removed attribute
            ) {
              done(
                name === 'test' &&
                previousValue === null &&
                value === ''
              );
            }}
          }
        )
      });
      var el = document.createElement('attr-changed');
      document.body.appendChild(el).setAttribute('test', '');
    }
  }, {
    name: "V0: main",
    test: function () {
      wru.assert('registerElement exists', document.registerElement);
      var XDirect = window.XDirect = document.registerElement(
        'x-direct',
        {
          prototype: Object.create(
            HTMLElement.prototype, {
            createdCallback: {value: function() {
              this._info = [{
                type: 'created',
                arguments: arguments
              }];
            }},
            attachedCallback: {value: function() {
              this._info.push({
                type: 'attached',
                arguments: arguments
              });
            }},
            detachedCallback: {value: function() {
              this._info.push({
                type: 'detached',
                arguments: arguments
              });
            }},
            attributeChangedCallback: {value: function(
              name,           // always present
              previousValue,  // if null, it's a new attribute
              value           // if null, it's a removed attribute
            ) {
              this._info.push({
                type: 'attributeChanged',
                arguments: arguments
              });
            }}
          })
        }
      );

      wru.assert('registerElement returns a function',
        typeof XDirect === 'function'
      );

    }
  }, {
    name: 'V0: Observe changes when attached to V1 Shadow Root',
    test: function () {
      if(!HTMLElement.prototype.attachShadow) return;
      var
        a = new XDirect(),
        parentNode = document.createElement('div'),
        root = parentNode.attachShadow({ mode: 'open' })
      ;
      root.appendChild(a);
      setTimeout(wru.async(function () {
        wru.assert('node created', a._info[0].type === 'created');
        if (a._info[1]) wru.assert('node attached', a._info[1].type === 'attached');
      }), 100);
    }
  }, {
    name: 'V0: as XDirect constructor',
    test: function () {
      var node = document.body.appendChild(new XDirect);
      wru.assert('right name', node.nodeName.toUpperCase() === 'X-DIRECT');
      wru.assert('createdInvoked', node._info[0].type === 'created');
      wru.assert('is instance',
        node instanceof XDirect ||
        // IE < 11 where setPrototypeOf is absent
        Object.getPrototypeOf(XDirect.prototype).isPrototypeOf(node)
      );
    }
  }, {
    name: 'V0: as &lt;x-direct&gt; innerHTML',
    test: function () {
      var node = document.body.appendChild(document.createElement('div'));
      node.innerHTML = '<x-direct></x-direct>';
      node = node.firstChild;
      wru.assert('right name', node.nodeName.toUpperCase() === 'X-DIRECT');
      setTimeout(wru.async(function(){
        wru.assert('created callback triggered', node._info[0].type === 'created');
        wru.assert('attached callback triggered', node._info[1].type === 'attached');
        document.body.removeChild(node.parentNode);
        setTimeout(wru.async(function(){
          wru.assert('detached callback triggered', node._info[2].type === 'detached');
        }), 20);
      }), 20);
    }
  }, {
    name: 'V0: as createElement(x-direct)',
    test: function () {
      var node = document.body.appendChild(document.createElement('div')).appendChild(
        document.createElement('x-direct')
      );
      wru.assert('right name', node.nodeName.toUpperCase() === 'X-DIRECT');
      setTimeout(wru.async(function () {
        wru.assert('created callback triggered', node._info[0].type === 'created');
        wru.assert('attached callback triggered', node._info[1].type === 'attached');
        document.body.removeChild(node.parentNode);
        setTimeout(wru.async(function () {
          wru.assert('detached callback triggered', node._info[2].type === 'detached');
        }), 20);
      }), 20);
    }
  }, {
    name: 'V0: attributes',
    test: function () {
      var args, info;
      var node = document.createElement('x-direct');
      document.body.appendChild(document.createElement('div')).appendChild(node);
      setTimeout(wru.async(function () {
        node.setAttribute('what', 'ever');
        wru.assert(node.getAttribute('what') === 'ever');
        setTimeout(wru.async(function () {
          info = node._info.pop();
          wru.assert('attributeChanged was called', info.type === 'attributeChanged');
          args = info.arguments;
          wru.assert('correct arguments with new value', args[0] === 'what' && args[1] == null && args[2] === 'ever');
          node.setAttribute('what', 'else');
          setTimeout(wru.async(function () {
            args = node._info.pop().arguments;
            wru.assert('correct arguments with old value',
              args[0] === 'what' && args[1] === 'ever' && args[2] === 'else');
            node.removeAttribute('what');
            setTimeout(wru.async(function () {
              args = node._info.pop().arguments;
              wru.assert(
                'correct arguments with removed attribute',
                args[0] === 'what' &&
                args[1] === 'else' &&
                args[2] == null
              );
              document.body.removeChild(node.parentNode);
            }), 20);
          }), 20);
        }), 20);
      }), 20);
    }
  },{
    name: 'V0: offline',
    test: function () {
      var node = document.createElement('x-direct');
      node.setAttribute('what', 'ever');
      setTimeout(wru.async(function () {
        wru.assert('created callback triggered', node._info[0].type === 'created');
        wru.assert('attributeChanged was called', node._info[1].type === 'attributeChanged');
        args = node._info[1].arguments;
        wru.assert('correct arguments with new value', args[0] === 'what' && args[1] == null && args[2] === 'ever');
        node.setAttribute('what', 'else');
        setTimeout(wru.async(function () {
          args = node._info[2].arguments;
          wru.assert('correct arguments with old value', args[0] === 'what' && args[1] === 'ever' && args[2] === 'else');
          node.removeAttribute('what');
          setTimeout(wru.async(function () {
            args = node._info[3].arguments;
            wru.assert(
              'correct arguments with removed attribute',
              args[0] === 'what' &&
              args[1] === 'else' &&
              args[2] == null
            );
          }), 20);
        }), 20);
      }), 20);
    }
  },{
    name: 'V0: nested',
    test: function () {
      var
        args,
        parentNode = document.createElement('div'),
        direct = parentNode.appendChild(
          document.createElement('x-direct')
        ),
        indirect = parentNode.appendChild(
          document.createElement('x-direct')
        ),
        indirectNested = direct.appendChild(
          document.createElement('x-direct')
        )
      ;
      document.body.appendChild(parentNode);
      setTimeout(wru.async(function () {
        wru.assert('all node created',
          direct._info[0].type === 'created' &&
          indirect._info[0].type === 'created' &&
          indirectNested._info[0].type === 'created'
        );
        wru.assert('all node attached',
          direct._info[1].type === 'attached' &&
          indirect._info[1].type === 'attached' &&
          indirectNested._info[1].type === 'attached'
        );
      }), 20);
    }
  },{
    name: 'V0: className',
    test: function () {
      // online for className, needed by IE8
      var args, info, node = document.body.appendChild(document.createElement('x-direct'));
      setTimeout(wru.async(function () {
        node.className = 'a';
        wru.assert(node.className === 'a');
        setTimeout(wru.async(function () {
          info = node._info.pop();
          wru.assert('attributeChanged was called', info.type === 'attributeChanged');
          args = info.arguments;
          wru.assert('correct arguments with new value', args[0] === 'class' && args[1] == null && args[2] === 'a');
          node.className += ' b';
          setTimeout(wru.async(function () {
            info = node._info.pop();
            // the only known device that fails this test is Blackberry 7
            wru.assert('attributeChanged was called', info.type === 'attributeChanged');
            args = info.arguments;
            wru.assert('correct arguments with new value', args[0] === 'class' && args[1] == 'a' && args[2] === 'a b');
          }), 20);
        }), 20);
      }), 20);
    }
  },{
    name: 'V0: registered after',
    test: function () {
      var
        node = document.body.appendChild(
          document.createElement('div')
        ),
        xd = node.appendChild(document.createElement('x-direct')),
        laterWeirdoElement = node.appendChild(
          document.createElement('later-weirdo')
        ),
        LaterWeirdo
      ;
      wru.assert('_info is not even present', !laterWeirdoElement._info);
      wru.assert('x-direct behaved regularly', xd._info);
      // now it's registered
      LaterWeirdo = document.registerElement(
        'later-weirdo',
        {
          prototype: Object.create(
            HTMLElement.prototype, {
            createdCallback: {value: function() {
              this._info = [{
                type: 'created',
                arguments: arguments
              }];
            }},
            attachedCallback: {value: function() {
              this._info.push({
                type: 'attached',
                arguments: arguments
              });
            }},
            detachedCallback: {value: function() {
              this._info.push({
                type: 'detached',
                arguments: arguments
              });
            }},
            attributeChangedCallback: {value: function(
              name,           // always present
              previousValue,  // if null, it's a new attribute
              value           // if null, it's a removed attribute
            ) {
              this._info.push({
                type: 'attributeChanged',
                arguments: arguments
              });
            }}
          })
        }
      );
      // later on this should be setup
      setTimeout(wru.async(function(){
        wru.assert('_info is now present', laterWeirdoElement._info);
        wru.assert('_info has right info',  laterWeirdoElement._info.length === 2 &&
                                            laterWeirdoElement._info[0].type === 'created' &&
                                            laterWeirdoElement._info[1].type === 'attached');
        
        wru.assert('xd has right info too', xd._info.length === 2 &&
                                            xd._info[0].type === 'created' &&
                                            xd._info[1].type === 'attached');
      }), 100);
    }
  },{
    name: 'V0: constructor',
    test: function () {
      var XEL, runtime, xEl = document.body.appendChild(
        document.createElement('x-el-created')
      );
      XEL = document.registerElement(
        'x-el-created',
        {
          prototype: Object.create(
            HTMLElement.prototype, {
            createdCallback: {value: function() {
              runtime = this.constructor;
            }}
          })
        }
      );
      setTimeout(wru.async(function () {
        wru.assert(xEl.constructor === runtime);
        // avoid IE8 problems
        if (!('attachEvent' in xEl)) {
          wru.assert(xEl instanceof XEL ||
            // IE9 and IE10 will use HTMLUnknownElement
            // TODO: features tests/detection and use such prototype instead
            xEl instanceof HTMLUnknownElement);
        }
      }), 100);
    }
  }, {
    name: 'V0: nested CustomElement',
    test: function () {
      var a = new XDirect();
      var b = new XDirect();
      var div = document.createElement('div');
      document.body.appendChild(div);
      b.appendChild(a);
      div.appendChild(b);
      setTimeout(wru.async(function () {
        wru.assert('there were info', a._info.length && b._info.length);
        a._info = [];
        b._info = [];
        a.setAttribute('what', 'ever');
        setTimeout(wru.async(function () {
          wru.assert('attributeChanged triggered on a',
            a._info[0].type === 'attributeChanged'
          );
          wru.assert('but it did not trigger on b', !b._info.length);
        }), 100);
      }), 100);
    }
  }, {
    name: 'V0: do not invoke if attribute had same value',
    test: function () {
      var
        info = [],
        ChangingValue = document.registerElement('changing-value', {
          prototype: Object.create(HTMLElement.prototype, {
            attributeChangedCallback: {value: function(
              name,           // always present
              previousValue,  // if null, it's a new attribute
              value           // if null, it's a removed attribute
            ) {
              info.push(arguments);
            }}
          })
        }),
        node = document.body.appendChild(new ChangingValue);
      ;
      node.setAttribute('test', 'value');
      setTimeout(wru.async(function(){
        node.setAttribute('test', 'value');
        wru.assert('OK');
        setTimeout(wru.async(function () {
          wru.assert('was not called twice with the same value',
            info.length === 1 &&
            info[0][0] === 'test' &&
            info[0][1] === null &&
            info[0][2] === 'value'
          );
        }), 100);
      }), 100);
    }
  }, {
    name: 'V0: remove more than one CustomElement',
    test: function () {
      var a = new XDirect();
      var b = new XDirect();

      document.body.appendChild(a);
      document.body.appendChild(b);

      setTimeout(wru.async(function () {
        wru.assert('there were info', a._info.length && b._info.length);
        a._info = [];
        b._info = [];

        document.body.removeChild(a);
        document.body.removeChild(b);

        setTimeout(wru.async(function () {
          wru.assert('detachedCallback triggered on a',
            a._info[0].type === 'detached'
          );
          wru.assert('detachedCallback triggered on b',
            b._info[0].type === 'detached'
          );
        }), 100);
      }), 100);
    }
  }, {
    name: 'V0: using V1 should not break',
    test: function () {
      var MyCreated = document.registerElement(
        'x-creted',
        {
          prototype: Object.create(
            HTMLElement.prototype, {
            createdCallback: {value: function() {
              this.innerHTML = '<strong>OK</strong>';
            }}
          })
        }
      );
      var el = new MyCreated;
      setTimeout(wru.async(function () {
        wru.assert('successfully created',
          '<x-creted><strong>OK</strong></x-creted>' === el.outerHTML
        );
      }), 100);
    }
  }, {
    name: 'Component',
    test: function () {
      var info = [];
      var MyElement = new Component({
        'static': { TEST: 123 },
        name: 'my-element',
        constructor: function () {
          info.push('constructor');
        },
        onattribute: function () {
          info.push('onattribute');
        },
        onconnected: function () {
          info.push('onconnected');
        },
        ondisconnected: function () {
          info.push('ondisconnected');
          this.z();
        },
        z: function () {
          info.push('attribute', 'static');
          wru.assert('attribute is correct', this.getAttribute('test') === '456');
          wru.assert('class property is correct', MyElement.TEST === 123);
        }
      });
      document.body.appendChild(new MyElement);
      setTimeout(wru.async(function () {
        wru.assert('constructor', info[0] === 'constructor');
        wru.assert('onconnected', info[1] === 'onconnected');
        document.body.lastChild.setAttribute('test', 456);
        setTimeout(wru.async(function () {
          wru.assert('onattribute', info[2] === 'onattribute');
          document.body.removeChild(document.body.lastChild);
          setTimeout(wru.async(function () {
            wru.assert('ondisconnected', info[3] === 'ondisconnected');
            wru.assert('all fine', info.length === 6);
          }), 20);
        }), 20);
      }), 20);
    }
  }
]);
