(()=>{"use strict";var e,t,r,a,o,f={},n={};function c(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={id:e,loaded:!1,exports:{}};return f[e].call(r.exports,r,r.exports,c),r.loaded=!0,r.exports}c.m=f,c.c=n,e=[],c.O=(t,r,a,o)=>{if(!r){var f=1/0;for(i=0;i<e.length;i++){r=e[i][0],a=e[i][1],o=e[i][2];for(var n=!0,b=0;b<r.length;b++)(!1&o||f>=o)&&Object.keys(c.O).every((e=>c.O[e](r[b])))?r.splice(b--,1):(n=!1,o<f&&(f=o));if(n){e.splice(i--,1);var d=a();void 0!==d&&(t=d)}}return t}o=o||0;for(var i=e.length;i>0&&e[i-1][2]>o;i--)e[i]=e[i-1];e[i]=[r,a,o]},c.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return c.d(t,{a:t}),t},r=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,c.t=function(e,a){if(1&a&&(e=this(e)),8&a)return e;if("object"==typeof e&&e){if(4&a&&e.__esModule)return e;if(16&a&&"function"==typeof e.then)return e}var o=Object.create(null);c.r(o);var f={};t=t||[null,r({}),r([]),r(r)];for(var n=2&a&&e;"object"==typeof n&&!~t.indexOf(n);n=r(n))Object.getOwnPropertyNames(n).forEach((t=>f[t]=()=>e[t]));return f.default=()=>e,c.d(o,f),o},c.d=(e,t)=>{for(var r in t)c.o(t,r)&&!c.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},c.f={},c.e=e=>Promise.all(Object.keys(c.f).reduce(((t,r)=>(c.f[r](e,t),t)),[])),c.u=e=>"assets/js/"+({53:"935f2afb",74:"4c5c6dbb",85:"1f391b9e",92:"5873b104",189:"3bd150b0",237:"1df93b7f",300:"e999734b",306:"f6aebfbf",368:"a94703ab",403:"1e37097f",414:"393be207",518:"a7bd4aaa",597:"5e8c322a",661:"5e95c892",681:"6ff67fd4",879:"6cd1f720",886:"25a6218c",902:"38e469bb",905:"0331ca43",918:"17896441"}[e]||e)+"."+{53:"005b8f98",74:"5eacaab7",85:"d88969bb",92:"6b616f21",189:"92cbd916",237:"6f0634fa",300:"c18bb241",306:"97187e87",368:"cd0392f4",403:"e7d6a4c4",414:"d3ec89d6",509:"763f462f",518:"0e60e4e4",597:"0241ad9b",661:"0021d3e5",681:"2dba586c",772:"46e3500d",879:"dde22d01",886:"04847128",902:"e8ad1309",905:"0db3cf5f",918:"e433af4f"}[e]+".js",c.miniCssF=e=>{},c.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),c.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a={},o="simple-scaffold-docs:",c.l=(e,t,r,f)=>{if(a[e])a[e].push(t);else{var n,b;if(void 0!==r)for(var d=document.getElementsByTagName("script"),i=0;i<d.length;i++){var l=d[i];if(l.getAttribute("src")==e||l.getAttribute("data-webpack")==o+r){n=l;break}}n||(b=!0,(n=document.createElement("script")).charset="utf-8",n.timeout=120,c.nc&&n.setAttribute("nonce",c.nc),n.setAttribute("data-webpack",o+r),n.src=e),a[e]=[t];var s=(t,r)=>{n.onerror=n.onload=null,clearTimeout(u);var o=a[e];if(delete a[e],n.parentNode&&n.parentNode.removeChild(n),o&&o.forEach((e=>e(r))),t)return t(r)},u=setTimeout(s.bind(null,void 0,{type:"timeout",target:n}),12e4);n.onerror=s.bind(null,n.onerror),n.onload=s.bind(null,n.onload),b&&document.head.appendChild(n)}},c.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.p="/simple-scaffold/",c.gca=function(e){return e={17896441:"918","935f2afb":"53","4c5c6dbb":"74","1f391b9e":"85","5873b104":"92","3bd150b0":"189","1df93b7f":"237",e999734b:"300",f6aebfbf:"306",a94703ab:"368","1e37097f":"403","393be207":"414",a7bd4aaa:"518","5e8c322a":"597","5e95c892":"661","6ff67fd4":"681","6cd1f720":"879","25a6218c":"886","38e469bb":"902","0331ca43":"905"}[e]||e,c.p+c.u(e)},(()=>{var e={303:0,532:0};c.f.j=(t,r)=>{var a=c.o(e,t)?e[t]:void 0;if(0!==a)if(a)r.push(a[2]);else if(/^(303|532)$/.test(t))e[t]=0;else{var o=new Promise(((r,o)=>a=e[t]=[r,o]));r.push(a[2]=o);var f=c.p+c.u(t),n=new Error;c.l(f,(r=>{if(c.o(e,t)&&(0!==(a=e[t])&&(e[t]=void 0),a)){var o=r&&("load"===r.type?"missing":r.type),f=r&&r.target&&r.target.src;n.message="Loading chunk "+t+" failed.\n("+o+": "+f+")",n.name="ChunkLoadError",n.type=o,n.request=f,a[1](n)}}),"chunk-"+t,t)}},c.O.j=t=>0===e[t];var t=(t,r)=>{var a,o,f=r[0],n=r[1],b=r[2],d=0;if(f.some((t=>0!==e[t]))){for(a in n)c.o(n,a)&&(c.m[a]=n[a]);if(b)var i=b(c)}for(t&&t(r);d<f.length;d++)o=f[d],c.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return c.O(i)},r=self.webpackChunksimple_scaffold_docs=self.webpackChunksimple_scaffold_docs||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})()})();