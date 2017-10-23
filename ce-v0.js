(function (O, document) {
  if (document.registerElement) return;
  if (typeof customElements === typeof document) {
    document.registerElement = function registerElement(name, info) {
      /*! (c) Andrea Giammarchi - @WebReflection (PoC) */
      var
        construct = Reflect.construct,
        defineProperty = O.defineProperty,
        proto = info.prototype,
        Constructor = O.getPrototypeOf(proto).constructor,
        cC = proto.createdCallback,
        aCC = proto.attributeChangedCallback,
        aC = proto.attachedCallback,
        dC = proto.detachedCallback,
        define = function (name, value) {
          defineProperty(CustomElementV0.prototype, name, {
            configurable: true,
            writable: true,
            value: value
          });
        },
        noop = function () {},
        mo = aCC && new MutationObserver(function (mutations) {
          for (var
            mutation, node, name,
            i = 0, length = mutations.length;
            i < length; i++
          ) {
            mutation = mutations[i];
            node = mutation.target;
            name = mutation.attributeName;
            node.attributeChangedCallback(
              name,
              mutation.oldValue,
              node.getAttribute(name)
            );
          }
        })
      ;
      function CustomElementV0() {
        return construct(Constructor, arguments, CustomElementV0);
      }
      CustomElementV0.prototype = O.create(proto);
      define('createdCallback', function () {
        defineProperty(this, 'createdCallback', {value: noop});
        if (aCC) mo.observe(this, {
          attributes: true,
          attributeOldValue: true
        });
        if (cC) cC.call(this);
      });
      define('attributeChangedCallback', function () {
        this.createdCallback();
        if (aCC) aCC.apply(this, arguments);
      });
      define('connectedCallback', function () {
        this.createdCallback();
        if (aC) aC.apply(this, arguments);
      });
      if (dC) define('disconnectedCallback', dC);
      customElements.define(name, CustomElementV0);
      return CustomElementV0;
    };
  } else {
    // TODO: bring document-register-element poly in
  }
}(Object, document));