# Custom Elements V0 API
A cross browser [document.registerElement](https://github.com/WebReflection/document-register-element) without built-in extends.

[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate) [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

### How to use it
Simply include the polyfill on top of your page and use `document.registerElement(name, info)` like the good old days.
```html
<script src="https://unpkg.com/ce-v0/min.js"></script>
```

### V0 API
```js
var MyElement = document.registerElement(
  'my-element',
  {
    prototype: Object.create(
      HTMLElement.prototype, {
      createdCallback: {value: function() {
        console.log('custom element ready');
      }},
      attachedCallback: {value: function() {
        console.log('custom element connected');
      }},
      detachedCallback: {value: function() {
        console.log('custom element disconnected');
      }},
      attributeChangedCallback: {value: function(
        name, oldValue, newValue
      ) {
        console.log('*any* attribute change');
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

### Why resurrecting s deprecated API?
Let's face it. Custom Elements V0 API was ugly, and yet most popular Custom Elements projects used it in production and behind my polyfill.

Google [AMPHTML](https://www.ampproject.org) and [AFrame](https://aframe.io) are just two, out of many major projects, that used V0, while everyone else on the Web is still trying to fix transpilation problems with V1 classes.

It is not by accident that Chrome still ships with V0 enabled and the current state-of-the-web is that every other browser is being polyfilled to work like Chrome V0 API, because no other browser ever shipped such API.

Not only this means that [my polyfill](https://github.com/WebReflection/document-register-element) has been working for years on any sort of mobile and desktop browsers, the V1 API which shipped in Safari / WebKit, and it's going to be implemented by Edge and Firefox too soon, is perfectly capable of behaving, with few lines of code, like the old V0 was behaving.

As it is for every Web standard rolled out and then abandoned, it's never an hazard to use the feature/namespace/callback that's still shipped here or there, because that will never be replaced on top by other functionalities: it's simply death!

Accordingly, it is perfectly safe to polyfill a `document.registerElement` everywhere, 'cause that's what my polyfill has done for the last 3 years, and that's what still ships in Chrome.

This project brings back the simplicity that made Custom Elements a great primitive for every old and new browser,
recycling every V0 related code from the [document-register-element](https://github.com/WebReflection/document-register-element) repository, and ditching Custom Elements builtins.

As result, this polyfill weight less than 3KB and it gives a robust, reliable, pseudo native primitive to create Custom Elements that work, like it is already for the majority of Custom Elements projects out there.

#### Still future friendly!
By no means this project wants to stop adoption or usage of V1 API, quite the opposite, it's waiting for the time where every browser ships it natively, and every part of V0 related code can be dropped to make it a 1KB downgrade fully based on V1, like it is already for both Chrome and Safari.