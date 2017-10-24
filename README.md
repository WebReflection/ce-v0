# Custom Elements V0 API
A cross browser [document.registerElement](https://github.com/WebReflection/document-register-element) without built-in extends.

[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate) [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

### How to use it
Simply include the polyfill on top of your page and use `document.registerElement(name, info)` like the good old days.
```html
<script src="https://unpkg.com/ce-v0@latest/min.js"></script>
```

### Compatibility
Same compatibility of original polyfill: every Mobile and Desktop browser.

You can **verify** your browser **compatibility [live](https://webreflection.github.io/ce-v0/)**.

### V0 API
```js
var MyElement = document.registerElement(
  'my-element',
  {
    prototype: Object.create(
      HTMLElement.prototype, {
      createdCallback: {value: function() {
        console.log('custom element ready/upgraded');
        // better than V1 constructor() {}
        // because the element here will always
        // be already upgraded
      }},
      attachedCallback: {value: function() {
        console.log('custom element connected');
        // same as connectedCallback
      }},
      detachedCallback: {value: function() {
        console.log('custom element disconnected');
        // same as disconnectedCallback
      }},
      attributeChangedCallback: {value: function(
        name, oldValue, newValue
      ) {
        console.log('*any* attribute change');
        // different from V1 in two ways:
        //  * it does not trigger twice with same attribute value
        //  * it triggers for any attribute change, no need
        //    to define static get observedAttributes() {[...]}
      }}
    })
  }
);

// example via createElement
document.body.appendChild(document.createElement('my-element'));
// using the class directly
document.body.appendChild(new MyElement);
```
No `extends` will be performed, create extends from your own classes if needed (i.e. from `MyElement.prototype`).

### Why resurrecting a deprecated API?
TL;DR with native V1 API available it's easy to re-create V0 behavior keeping performance while it's not true the other way around.

This projects solves all transpilations and compatibility issues, providing a reliable, battle tested, V0 API for every browser.

To know more, please read the [related blog entry](https://medium.com/@WebReflection/a-custom-elements-v0-grampafill-dc1319420e9b).


#### Still future friendly!
By no means this project wants to stop adoption or usage of V1 API, quite the opposite, it's waiting for the time where every browser ships it natively, and every part of V0 related code can be dropped to make it a 1KB downgrade fully based on V1, like it is already for both Chrome and Safari.

### Don't you like it? Use Component
```js
const MyElement = new Component({
  // the Custom Element name
  name: 'my-element',
  // one or more static property
  static: {
    TEST: 123,
    method() {}
  },
  // alias for createdCallback
  // the component is ready/upgraded here
  constructor() {},
  // alias for attributeChangedCallback
  onattribute() {},
  // alias for attachedCallback
  onconnected() {},
  // alias for detachedCallback
  ondisconnected() {}
  // any other prototype definition is allowed
  // including getters and setters
});
```
