// Append() polyfill for IE APEX Chart
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t():"function"==typeof define&&define.amd?define(t):t()}(0,function(){"use strict";function e(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})}function t(e){return new this(function(t,n){function o(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var f=n.then;if("function"==typeof f)return void f.call(n,function(t){o(e,t)},function(n){r[e]={status:"rejected",reason:n},0==--i&&t(r)})}r[e]={status:"fulfilled",value:n},0==--i&&t(r)}if(!e||"undefined"==typeof e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);for(var i=r.length,f=0;r.length>f;f++)o(f,r[f])})}function n(e){return!(!e||"undefined"==typeof e.length)}function o(){}function r(e){if(!(this instanceof r))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],l(e,this)}function i(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,r._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var o;try{o=n(e._value)}catch(r){return void u(t.promise,r)}f(t.promise,o)}else(1===e._state?f:u)(t.promise,e._value)})):e._deferreds.push(t)}function f(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof r)return e._state=3,e._value=t,void c(e);if("function"==typeof n)return void l(function(e,t){return function(){e.apply(t,arguments)}}(n,t),e)}e._state=1,e._value=t,c(e)}catch(o){u(e,o)}}function u(e,t){e._state=2,e._value=t,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&r._immediateFn(function(){e._handled||r._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;n>t;t++)i(e,e._deferreds[t]);e._deferreds=null}function l(e,t){var n=!1;try{e(function(e){n||(n=!0,f(t,e))},function(e){n||(n=!0,u(t,e))})}catch(o){if(n)return;n=!0,u(t,o)}}var a=setTimeout;r.prototype["catch"]=function(e){return this.then(null,e)},r.prototype.then=function(e,t){var n=new this.constructor(o);return i(this,new function(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}(e,t,n)),n},r.prototype["finally"]=e,r.all=function(e){return new r(function(t,o){function r(e,n){try{if(n&&("object"==typeof n||"function"==typeof n)){var u=n.then;if("function"==typeof u)return void u.call(n,function(t){r(e,t)},o)}i[e]=n,0==--f&&t(i)}catch(c){o(c)}}if(!n(e))return o(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var f=i.length,u=0;i.length>u;u++)r(u,i[u])})},r.allSettled=t,r.resolve=function(e){return e&&"object"==typeof e&&e.constructor===r?e:new r(function(t){t(e)})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,o){if(!n(e))return o(new TypeError("Promise.race accepts an array"));for(var i=0,f=e.length;f>i;i++)r.resolve(e[i]).then(t,o)})},r._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},r._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var s=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("unable to locate global object")}();"function"!=typeof s.Promise?s.Promise=r:s.Promise.prototype["finally"]?s.Promise.allSettled||(s.Promise.allSettled=t):s.Promise.prototype["finally"]=e});
"document"in self&&("classList"in document.createElement("_")&&(!document.createElementNS||"classList"in document.createElementNS("http://www.w3.org/2000/svg","g"))||!function(t){"use strict";if("Element"in t){var e="classList",n="prototype",i=t.Element[n],s=Object,r=String[n].trim||function(){return this.replace(/^\s+|\s+$/g,"")},o=Array[n].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1},c=function(t,e){this.name=t,this.code=DOMException[t],this.message=e},a=function(t,e){if(""===e)throw new c("SYNTAX_ERR","The token must not be empty.");if(/\s/.test(e))throw new c("INVALID_CHARACTER_ERR","The token must not contain space characters.");return o.call(t,e)},l=function(t){for(var e=r.call(t.getAttribute("class")||""),n=e?e.split(/\s+/):[],i=0,s=n.length;s>i;i++)this.push(n[i]);this._updateClassName=function(){t.setAttribute("class",this.toString())}},u=l[n]=[],h=function(){return new l(this)};if(c[n]=Error[n],u.item=function(t){return this[t]||null},u.contains=function(t){return~a(this,t+"")},u.add=function(){var t,e=arguments,n=0,i=e.length,s=!1;do t=e[n]+"",~a(this,t)||(this.push(t),s=!0);while(++n<i);s&&this._updateClassName()},u.remove=function(){var t,e,n=arguments,i=0,s=n.length,r=!1;do for(t=n[i]+"",e=a(this,t);~e;)this.splice(e,1),r=!0,e=a(this,t);while(++i<s);r&&this._updateClassName()},u.toggle=function(t,e){var n=this.contains(t),i=n?e!==!0&&"remove":e!==!1&&"add";return i&&this[i](t),e===!0||e===!1?e:!n},u.replace=function(t,e){var n=a(t+"");~n&&(this.splice(n,1,e),this._updateClassName())},u.toString=function(){return this.join(" ")},s.defineProperty){var f={get:h,enumerable:!0,configurable:!0};try{s.defineProperty(i,e,f)}catch(p){void 0!==p.number&&-2146823252!==p.number||(f.enumerable=!1,s.defineProperty(i,e,f))}}else s[n].__defineGetter__&&i.__defineGetter__(e,h)}}(self),function(){"use strict";var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var n,i=arguments.length;for(n=0;i>n;n++)t=arguments[n],e.call(this,t)}};e("add"),e("remove")}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var n=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:n.call(this,t)}}"replace"in document.createElement("_").classList||(DOMTokenList.prototype.replace=function(t,e){var n=this.toString().split(" "),i=n.indexOf(t+"");~i&&(n=n.slice(i),this.remove.apply(this,n),this.add(e),this.add.apply(this,n.slice(1)))}),t=null}());
Array.prototype.findIndex||Object.defineProperty(Array.prototype,"findIndex",{value:function(r){if(null==this)throw new TypeError('"this" is null or not defined');var e=Object(this),t=e.length>>>0;if("function"!=typeof r)throw new TypeError("predicate must be a function");for(var n=arguments[1],i=0;i<t;){var o=e[i];if(r.call(n,o,i,e))return i;i++}return-1},configurable:!0,writable:!0});
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.ES6Promise=e()}(this,function(){"use strict";function t(t){var e=typeof t;return null!==t&&("object"===e||"function"===e)}function e(t){return"function"==typeof t}function n(t){I=t}function r(t){J=t}function o(){return function(){return process.nextTick(a)}}function i(){return"undefined"!=typeof H?function(){H(a)}:c()}function s(){var t=0,e=new V(a),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function u(){var t=new MessageChannel;return t.port1.onmessage=a,function(){return t.port2.postMessage(0)}}function c(){var t=setTimeout;return function(){return t(a,1)}}function a(){for(var t=0;t<G;t+=2){var e=$[t],n=$[t+1];e(n),$[t]=void 0,$[t+1]=void 0}G=0}function f(){try{var t=require,e=t("vertx");return H=e.runOnLoop||e.runOnContext,i()}catch(n){return c()}}function l(t,e){var n=arguments,r=this,o=new this.constructor(p);void 0===o[et]&&k(o);var i=r._state;return i?!function(){var t=n[i-1];J(function(){return x(i,o,t,r._result)})}():E(r,o,t,e),o}function h(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(p);return g(n,t),n}function p(){}function v(){return new TypeError("You cannot resolve a promise with itself")}function d(){return new TypeError("A promises callback cannot return that same promise.")}function _(t){try{return t.then}catch(e){return it.error=e,it}}function y(t,e,n,r){try{t.call(e,n,r)}catch(o){return o}}function m(t,e,n){J(function(t){var r=!1,o=y(n,e,function(n){r||(r=!0,e!==n?g(t,n):S(t,n))},function(e){r||(r=!0,j(t,e))},"Settle: "+(t._label||" unknown promise"));!r&&o&&(r=!0,j(t,o))},t)}function b(t,e){e._state===rt?S(t,e._result):e._state===ot?j(t,e._result):E(e,void 0,function(e){return g(t,e)},function(e){return j(t,e)})}function w(t,n,r){n.constructor===t.constructor&&r===l&&n.constructor.resolve===h?b(t,n):r===it?(j(t,it.error),it.error=null):void 0===r?S(t,n):e(r)?m(t,n,r):S(t,n)}function g(e,n){e===n?j(e,v()):t(n)?w(e,n,_(n)):S(e,n)}function A(t){t._onerror&&t._onerror(t._result),T(t)}function S(t,e){t._state===nt&&(t._result=e,t._state=rt,0!==t._subscribers.length&&J(T,t))}function j(t,e){t._state===nt&&(t._state=ot,t._result=e,J(A,t))}function E(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+rt]=n,o[i+ot]=r,0===i&&t._state&&J(T,t)}function T(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,o=void 0,i=t._result,s=0;s<e.length;s+=3)r=e[s],o=e[s+n],r?x(n,r,o,i):o(i);t._subscribers.length=0}}function M(){this.error=null}function P(t,e){try{return t(e)}catch(n){return st.error=n,st}}function x(t,n,r,o){var i=e(r),s=void 0,u=void 0,c=void 0,a=void 0;if(i){if(s=P(r,o),s===st?(a=!0,u=s.error,s.error=null):c=!0,n===s)return void j(n,d())}else s=o,c=!0;n._state!==nt||(i&&c?g(n,s):a?j(n,u):t===rt?S(n,s):t===ot&&j(n,s))}function C(t,e){try{e(function(e){g(t,e)},function(e){j(t,e)})}catch(n){j(t,n)}}function O(){return ut++}function k(t){t[et]=ut++,t._state=void 0,t._result=void 0,t._subscribers=[]}function Y(t,e){this._instanceConstructor=t,this.promise=new t(p),this.promise[et]||k(this.promise),B(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?S(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&S(this.promise,this._result))):j(this.promise,q())}function q(){return new Error("Array Methods must be provided an Array")}function F(t){return new Y(this,t).promise}function D(t){var e=this;return new e(B(t)?function(n,r){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(n,r)}:function(t,e){return e(new TypeError("You must pass an array to race."))})}function K(t){var e=this,n=new e(p);return j(n,t),n}function L(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function N(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function U(t){this[et]=O(),this._result=this._state=void 0,this._subscribers=[],p!==t&&("function"!=typeof t&&L(),this instanceof U?C(this,t):N())}function W(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;if(n){var r=null;try{r=Object.prototype.toString.call(n.resolve())}catch(e){}if("[object Promise]"===r&&!n.cast)return}t.Promise=U}var z=void 0;z=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var B=z,G=0,H=void 0,I=void 0,J=function(t,e){$[G]=t,$[G+1]=e,G+=2,2===G&&(I?I(a):tt())},Q="undefined"!=typeof window?window:void 0,R=Q||{},V=R.MutationObserver||R.WebKitMutationObserver,X="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),Z="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,$=new Array(1e3),tt=void 0;tt=X?o():V?s():Z?u():void 0===Q&&"function"==typeof require?f():c();var et=Math.random().toString(36).substring(16),nt=void 0,rt=1,ot=2,it=new M,st=new M,ut=0;return Y.prototype._enumerate=function(t){for(var e=0;this._state===nt&&e<t.length;e++)this._eachEntry(t[e],e)},Y.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===h){var o=_(t);if(o===l&&t._state!==nt)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===U){var i=new n(p);w(i,t,o),this._willSettleAt(i,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},Y.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===nt&&(this._remaining--,t===ot?j(r,n):this._result[e]=n),0===this._remaining&&S(r,this._result)},Y.prototype._willSettleAt=function(t,e){var n=this;E(t,void 0,function(t){return n._settledAt(rt,e,t)},function(t){return n._settledAt(ot,e,t)})},U.all=F,U.race=D,U.resolve=h,U.reject=K,U._setScheduler=n,U._setAsap=r,U._asap=J,U.prototype={constructor:U,then:l,"catch":function(t){return this.then(null,t)}},U.polyfill=W,U.Promise=U,U.polyfill(),U});
(function(window){"use strict";function createDocumentFragment(){return document.createDocumentFragment()}function createElement(nodeName){return document.createElement(nodeName)}function enoughArguments(length,name){if(!length)throw new Error("Failed to construct "+name+": 1 argument required, but only 0 present.")}function mutationMacro(nodes){if(nodes.length===1){return textNodeIfString(nodes[0])}for(var fragment=createDocumentFragment(),list=slice.call(nodes),i=0;i<nodes.length;i++){fragment.appendChild(textNodeIfString(list[i]))}return fragment}function textNodeIfString(node){return typeof node==="string"?document.createTextNode(node):node}for(var head,property,TemporaryPrototype,TemporaryTokenList,wrapVerifyToken,document=window.document,hOP=Object.prototype.hasOwnProperty,defineProperty=Object.defineProperty||function(object,property,descriptor){if(hOP.call(descriptor,"value")){object[property]=descriptor.value}else{if(hOP.call(descriptor,"get"))object.__defineGetter__(property,descriptor.get);if(hOP.call(descriptor,"set"))object.__defineSetter__(property,descriptor.set)}return object},indexOf=[].indexOf||function indexOf(value){var length=this.length;while(length--){if(this[length]===value){break}}return length},verifyToken=function(token){if(!token){throw"SyntaxError"}else if(spaces.test(token)){throw"InvalidCharacterError"}return token},DOMTokenList=function(node){var noClassName=typeof node.className==="undefined",className=noClassName?node.getAttribute("class")||"":node.className,isSVG=noClassName||typeof className==="object",value=(isSVG?noClassName?className:className.baseVal:className).replace(trim,"");if(value.length){properties.push.apply(this,value.split(spaces))}this._isSVG=isSVG;this._=node},classListDescriptor={get:function get(){return new DOMTokenList(this)},set:function(){}},trim=/^\s+|\s+$/g,spaces=/\s+/,SPACE=" ",CLASS_LIST="classList",toggle=function toggle(token,force){if(this.contains(token)){if(!force){this.remove(token)}}else if(force===undefined||force){force=true;this.add(token)}return!!force},DocumentFragmentPrototype=window.DocumentFragment&&DocumentFragment.prototype,Node=window.Node,NodePrototype=(Node||Element).prototype,CharacterData=window.CharacterData||Node,CharacterDataPrototype=CharacterData&&CharacterData.prototype,DocumentType=window.DocumentType,DocumentTypePrototype=DocumentType&&DocumentType.prototype,ElementPrototype=(window.Element||Node||window.HTMLElement).prototype,HTMLSelectElement=window.HTMLSelectElement||createElement("select").constructor,selectRemove=HTMLSelectElement.prototype.remove,SVGElement=window.SVGElement,properties=["matches",ElementPrototype.matchesSelector||ElementPrototype.webkitMatchesSelector||ElementPrototype.khtmlMatchesSelector||ElementPrototype.mozMatchesSelector||ElementPrototype.msMatchesSelector||ElementPrototype.oMatchesSelector||function matches(selector){var parentNode=this.parentNode;return!!parentNode&&-1<indexOf.call(parentNode.querySelectorAll(selector),this)},"closest",function closest(selector){var parentNode=this,matches;while((matches=parentNode&&parentNode.matches)&&!parentNode.matches(selector)){parentNode=parentNode.parentNode}return matches?parentNode:null},"prepend",function prepend(){var firstChild=this.firstChild,node=mutationMacro(arguments);if(firstChild){this.insertBefore(node,firstChild)}else{this.appendChild(node)}},"append",function append(){this.appendChild(mutationMacro(arguments))},"before",function before(){var parentNode=this.parentNode;if(parentNode){parentNode.insertBefore(mutationMacro(arguments),this)}},"after",function after(){var parentNode=this.parentNode,nextSibling=this.nextSibling,node=mutationMacro(arguments);if(parentNode){if(nextSibling){parentNode.insertBefore(node,nextSibling)}else{parentNode.appendChild(node)}}},"replace",function replace(){this.replaceWith.apply(this,arguments)},"replaceWith",function replaceWith(){var parentNode=this.parentNode;if(parentNode){parentNode.replaceChild(mutationMacro(arguments),this)}},"remove",function remove(){var parentNode=this.parentNode;if(parentNode){parentNode.removeChild(this)}}],slice=properties.slice,i=properties.length;i;i-=2){property=properties[i-2];if(!(property in ElementPrototype)){ElementPrototype[property]=properties[i-1]}if(property==="remove"){HTMLSelectElement.prototype[property]=function(){return 0<arguments.length?selectRemove.apply(this,arguments):ElementPrototype.remove.call(this)}}if(/^(?:before|after|replace|replaceWith|remove)$/.test(property)){if(CharacterData&&!(property in CharacterDataPrototype)){CharacterDataPrototype[property]=properties[i-1]}if(DocumentType&&!(property in DocumentTypePrototype)){DocumentTypePrototype[property]=properties[i-1]}}if(/^(?:append|prepend)$/.test(property)){if(DocumentFragmentPrototype){if(!(property in DocumentFragmentPrototype)){DocumentFragmentPrototype[property]=properties[i-1]}}else{try{createDocumentFragment().constructor.prototype[property]=properties[i-1]}catch(o_O){}}}}if(!createElement("a").matches("a")){ElementPrototype[property]=function(matches){return function(selector){return matches.call(this.parentNode?this:createDocumentFragment().appendChild(this),selector)}}(ElementPrototype[property])}DOMTokenList.prototype={length:0,add:function add(){for(var j=0,token;j<arguments.length;j++){token=arguments[j];if(!this.contains(token)){properties.push.call(this,property)}}if(this._isSVG){this._.setAttribute("class",""+this)}else{this._.className=""+this}},contains:function(indexOf){return function contains(token){i=indexOf.call(this,property=verifyToken(token));return-1<i}}([].indexOf||function(token){i=this.length;while(i--&&this[i]!==token){}return i}),item:function item(i){return this[i]||null},remove:function remove(){for(var j=0,token;j<arguments.length;j++){token=arguments[j];if(this.contains(token)){properties.splice.call(this,i,1)}}if(this._isSVG){this._.setAttribute("class",""+this)}else{this._.className=""+this}},toggle:toggle,toString:function toString(){return properties.join.call(this,SPACE)}};if(SVGElement&&!(CLASS_LIST in SVGElement.prototype)){defineProperty(SVGElement.prototype,CLASS_LIST,classListDescriptor)}if(!(CLASS_LIST in document.documentElement)){defineProperty(ElementPrototype,CLASS_LIST,classListDescriptor)}else{TemporaryTokenList=createElement("div")[CLASS_LIST];TemporaryTokenList.add("a","b","a");if("a b"!=TemporaryTokenList){TemporaryPrototype=TemporaryTokenList.constructor.prototype;if(!("add"in TemporaryPrototype)){TemporaryPrototype=window.TemporaryTokenList.prototype}wrapVerifyToken=function(original){return function(){var i=0;while(i<arguments.length){original.call(this,arguments[i++])}}};TemporaryPrototype.add=wrapVerifyToken(TemporaryPrototype.add);TemporaryPrototype.remove=wrapVerifyToken(TemporaryPrototype.remove);TemporaryPrototype.toggle=toggle}}if(!("contains"in NodePrototype)){defineProperty(NodePrototype,"contains",{value:function(el){while(el&&el!==this)el=el.parentNode;return this===el}})}if(!("head"in document)){defineProperty(document,"head",{get:function(){return head||(head=document.getElementsByTagName("head")[0])}})}(function(){for(var raf,rAF=window.requestAnimationFrame,cAF=window.cancelAnimationFrame,prefixes=["o","ms","moz","webkit"],i=prefixes.length;!cAF&&i--;){rAF=rAF||window[prefixes[i]+"RequestAnimationFrame"];cAF=window[prefixes[i]+"CancelAnimationFrame"]||window[prefixes[i]+"CancelRequestAnimationFrame"]}if(!cAF){if(rAF){raf=rAF;rAF=function(callback){var goOn=true;raf(function(){if(goOn)callback.apply(this,arguments)});return function(){goOn=false}};cAF=function(id){id()}}else{rAF=function(callback){return setTimeout(callback,15,15)};cAF=function(id){clearTimeout(id)}}}window.requestAnimationFrame=rAF;window.cancelAnimationFrame=cAF})();try{new window.CustomEvent("?")}catch(o_O){window.CustomEvent=function(eventName,defaultInitDict){function CustomEvent(type,eventInitDict){var event=document.createEvent(eventName);if(typeof type!="string"){throw new Error("An event name must be provided")}if(eventName=="Event"){event.initCustomEvent=initCustomEvent}if(eventInitDict==null){eventInitDict=defaultInitDict}event.initCustomEvent(type,eventInitDict.bubbles,eventInitDict.cancelable,eventInitDict.detail);return event}function initCustomEvent(type,bubbles,cancelable,detail){this.initEvent(type,bubbles,cancelable);this.detail=detail}return CustomEvent}(window.CustomEvent?"CustomEvent":"Event",{bubbles:false,cancelable:false,detail:null})}try{new Event("_")}catch(o_O){o_O=function($Event){function Event(type,init){enoughArguments(arguments.length,"Event");var out=document.createEvent("Event");if(!init)init={};out.initEvent(type,!!init.bubbles,!!init.cancelable);return out}Event.prototype=$Event.prototype;return Event}(window.Event||function Event(){});defineProperty(window,"Event",{value:o_O});if(Event!==o_O)Event=o_O}try{new KeyboardEvent("_",{})}catch(o_O){o_O=function($KeyboardEvent){var initType=0,defaults={char:"",key:"",location:0,ctrlKey:false,shiftKey:false,altKey:false,metaKey:false,altGraphKey:false,repeat:false,locale:navigator.language,detail:0,bubbles:false,cancelable:false,keyCode:0,charCode:0,which:0},eventType;try{var e=document.createEvent("KeyboardEvent");e.initKeyboardEvent("keyup",false,false,window,"+",3,true,false,true,false,false);initType=(e.keyIdentifier||e.key)=="+"&&(e.keyLocation||e.location)==3&&(e.ctrlKey?e.altKey?1:3:e.shiftKey?2:4)||9}catch(o_O){}eventType=0<initType?"KeyboardEvent":"Event";function getModifier(init){for(var out=[],keys=["ctrlKey","Control","shiftKey","Shift","altKey","Alt","metaKey","Meta","altGraphKey","AltGraph"],i=0;i<keys.length;i+=2){if(init[keys[i]])out.push(keys[i+1])}return out.join(" ")}function withDefaults(target,source){for(var key in source){if(source.hasOwnProperty(key)&&!source.hasOwnProperty.call(target,key))target[key]=source[key]}return target}function withInitValues(key,out,init){try{out[key]=init[key]}catch(o_O){}}function KeyboardEvent(type,init){enoughArguments(arguments.length,"KeyboardEvent");init=withDefaults(init||{},defaults);var out=document.createEvent(eventType),ctrlKey=init.ctrlKey,shiftKey=init.shiftKey,altKey=init.altKey,metaKey=init.metaKey,altGraphKey=init.altGraphKey,modifiers=initType>3?getModifier(init):null,key=String(init.key),chr=String(init.char),location=init.location,keyCode=init.keyCode||(init.keyCode=key)&&key.charCodeAt(0)||0,charCode=init.charCode||(init.charCode=chr)&&chr.charCodeAt(0)||0,bubbles=init.bubbles,cancelable=init.cancelable,repeat=init.repeat,locale=init.locale,view=init.view||window,args;if(!init.which)init.which=init.keyCode;if("initKeyEvent"in out){out.initKeyEvent(type,bubbles,cancelable,view,ctrlKey,altKey,shiftKey,metaKey,keyCode,charCode)}else if(0<initType&&"initKeyboardEvent"in out){args=[type,bubbles,cancelable,view];switch(initType){case 1:args.push(key,location,ctrlKey,shiftKey,altKey,metaKey,altGraphKey);break;case 2:args.push(ctrlKey,altKey,shiftKey,metaKey,keyCode,charCode);break;case 3:args.push(key,location,ctrlKey,altKey,shiftKey,metaKey,altGraphKey);break;case 4:args.push(key,location,modifiers,repeat,locale);break;default:args.push(char,key,location,modifiers,repeat,locale)}out.initKeyboardEvent.apply(out,args)}else{out.initEvent(type,bubbles,cancelable)}for(key in out){if(defaults.hasOwnProperty(key)&&out[key]!==init[key]){withInitValues(key,out,init)}}return out}KeyboardEvent.prototype=$KeyboardEvent.prototype;return KeyboardEvent}(window.KeyboardEvent||function KeyboardEvent(){});defineProperty(window,"KeyboardEvent",{value:o_O});if(KeyboardEvent!==o_O)KeyboardEvent=o_O}try{new MouseEvent("_",{})}catch(o_O){o_O=function($MouseEvent){function MouseEvent(type,init){enoughArguments(arguments.length,"MouseEvent");var out=document.createEvent("MouseEvent");if(!init)init={};out.initMouseEvent(type,!!init.bubbles,!!init.cancelable,init.view||window,init.detail||1,init.screenX||0,init.screenY||0,init.clientX||0,init.clientY||0,!!init.ctrlKey,!!init.altKey,!!init.shiftKey,!!init.metaKey,init.button||0,init.relatedTarget||null);return out}MouseEvent.prototype=$MouseEvent.prototype;return MouseEvent}(window.MouseEvent||function MouseEvent(){});defineProperty(window,"MouseEvent",{value:o_O});if(MouseEvent!==o_O)MouseEvent=o_O}if(!document.querySelectorAll("*").forEach){(function(){function patch(what){var querySelectorAll=what.querySelectorAll;what.querySelectorAll=function qSA(css){var result=querySelectorAll.call(this,css);result.forEach=Array.prototype.forEach;return result}}patch(document);patch(HTMLElement.prototype)})()}try{document.querySelector(":scope *")}catch(o_O){(function(){var counter=0;var parent=createElement("div");var prefix="scope-"+(Math.random()*1e9>>>0)+"-";var proto=HTMLElement.prototype;var querySelector=proto.querySelector;var querySelectorAll=proto.querySelectorAll;proto.querySelector=function qS(css){return find(this,querySelector,css)};proto.querySelectorAll=function qSA(css){return find(this,querySelectorAll,css)};function find(node,method,css){var oldID=node.id;var noParent=!node.parentNode;node.id=oldID||prefix+counter++;if(noParent)parent.appendChild(node);var result=method.call(node.parentNode,css.replace(/(^|,\s*)(:scope([ >]|$))?/g,function($0,$1,$2,$3){return $1+"#"+node.id+($3||" ")}));if(noParent)parent.removeChild(node);node.id=oldID;return result}})()}})(window);(function(global){"use strict";var DOMMap=global.WeakMap||function(){var counter=0,dispatched=false,drop=false,value;function dispatch(key,ce,shouldDrop){drop=shouldDrop;dispatched=false;value=undefined;key.dispatchEvent(ce)}function Handler(value){this.value=value}Handler.prototype.handleEvent=function handleEvent(e){dispatched=true;if(drop){e.currentTarget.removeEventListener(e.type,this,false)}else{value=this.value}};function DOMMap(){counter++;this.__ce__=new Event("@DOMMap:"+counter+Math.random())}DOMMap.prototype={constructor:DOMMap,delete:function del(key){return dispatch(key,this.__ce__,true),dispatched},get:function get(key){dispatch(key,this.__ce__,false);var v=value;value=undefined;return v},has:function has(key){return dispatch(key,this.__ce__,false),dispatched},set:function set(key,value){dispatch(key,this.__ce__,true);key.addEventListener(this.__ce__.type,new Handler(value),false);return this}};return DOMMap}();function Dict(){}Dict.prototype=(Object.create||Object)(null);function createEventListener(type,callback,options){function eventListener(e){if(eventListener.once){e.currentTarget.removeEventListener(e.type,callback,eventListener);eventListener.removed=true}if(eventListener.passive){e.preventDefault=createEventListener.preventDefault}if(typeof eventListener.callback==="function"){eventListener.callback.call(this,e)}else if(eventListener.callback){eventListener.callback.handleEvent(e)}if(eventListener.passive){delete e.preventDefault}}eventListener.type=type;eventListener.callback=callback;eventListener.capture=!!options.capture;eventListener.passive=!!options.passive;eventListener.once=!!options.once;eventListener.removed=false;return eventListener}createEventListener.preventDefault=function preventDefault(){};var Event=global.CustomEvent,dE=global.dispatchEvent,aEL=global.addEventListener,rEL=global.removeEventListener,counter=0,increment=function(){counter++},indexOf=[].indexOf||function indexOf(value){var length=this.length;while(length--){if(this[length]===value){break}}return length},getListenerKey=function(options){return"".concat(options.capture?"1":"0",options.passive?"1":"0",options.once?"1":"0")},augment;try{aEL("_",increment,{once:true});dE(new Event("_"));dE(new Event("_"));rEL("_",increment,{once:true})}catch(o_O){}if(counter!==1){(function(){var dm=new DOMMap;function createAEL(aEL){return function addEventListener(type,handler,options){if(options&&typeof options!=="boolean"){var info=dm.get(this),key=getListenerKey(options),i,tmp,wrap;if(!info)dm.set(this,info=new Dict);if(!(type in info))info[type]={handler:[],wrap:[]};tmp=info[type];i=indexOf.call(tmp.handler,handler);if(i<0){i=tmp.handler.push(handler)-1;tmp.wrap[i]=wrap=new Dict}else{wrap=tmp.wrap[i]}if(!(key in wrap)){wrap[key]=createEventListener(type,handler,options);aEL.call(this,type,wrap[key],wrap[key].capture)}}else{aEL.call(this,type,handler,options)}}}function createREL(rEL){return function removeEventListener(type,handler,options){if(options&&typeof options!=="boolean"){var info=dm.get(this),key,i,tmp,wrap;if(info&&type in info){tmp=info[type];i=indexOf.call(tmp.handler,handler);if(-1<i){key=getListenerKey(options);wrap=tmp.wrap[i];if(key in wrap){rEL.call(this,type,wrap[key],wrap[key].capture);delete wrap[key];for(key in wrap)return;tmp.handler.splice(i,1);tmp.wrap.splice(i,1);if(tmp.handler.length===0)delete info[type]}}}}else{rEL.call(this,type,handler,options)}}}augment=function(Constructor){if(!Constructor)return;var proto=Constructor.prototype;proto.addEventListener=createAEL(proto.addEventListener);proto.removeEventListener=createREL(proto.removeEventListener)};if(global.EventTarget){augment(EventTarget)}else{augment(global.Text);augment(global.Element||global.HTMLElement);augment(global.HTMLDocument);augment(global.Window||{prototype:global});augment(global.XMLHttpRequest)}})()}})(self);
