"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[812],{61152:function(e,t,r){function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach(function(t){var n;n=r[t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=Array(t);r<t;r++)n[r]=e[r];return n}function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach(function(t){var n;n=r[t],t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function a(e){return function t(){for(var r=this,n=arguments.length,i=Array(n),o=0;o<n;o++)i[o]=arguments[o];return i.length>=e.length?e.apply(this,i):function(){for(var e=arguments.length,n=Array(e),o=0;o<e;o++)n[o]=arguments[o];return t.apply(r,[].concat(i,n))}}}function l(e){return({}).toString.call(e).includes("Object")}function s(e){return"function"==typeof e}r.d(t,{ZP:function(){return J}});var E,f,d=a(function(e,t){throw Error(e[t]||e.default)})({initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"}),T={changes:function(e,t){return l(t)||d("changeType"),Object.keys(t).some(function(t){return!Object.prototype.hasOwnProperty.call(e,t)})&&d("changeField"),t},selector:function(e){s(e)||d("selectorType")},handler:function(e){s(e)||l(e)||d("handlerType"),l(e)&&Object.values(e).some(function(e){return!s(e)})&&d("handlersType")},initial:function(e){e||d("initialIsRequired"),l(e)||d("initialType"),Object.keys(e).length||d("initialContent")}};function A(e,t){return s(t)?t(e.current):t}function O(e,t){return e.current=c(c({},e.current),t),t}function g(e,t,r){return s(t)?t(e.current):Object.keys(r).forEach(function(r){var n;return null===(n=t[r])||void 0===n?void 0:n.call(t,e.current[r])}),r}var p={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:"Deprecation warning!\n    You are using deprecated way of configuration.\n\n    Instead of using\n      monaco.config({ urls: { monacoBase: '...' } })\n    use\n      monaco.config({ paths: { vs: '...' } })\n\n    For more please check the link https://github.com/suren-atoyan/monaco-loader#config\n  "},R=(E=function(e,t){throw Error(e[t]||e.default)},function e(){for(var t=this,r=arguments.length,n=Array(r),i=0;i<r;i++)n[i]=arguments[i];return n.length>=E.length?E.apply(this,n):function(){for(var r=arguments.length,i=Array(r),o=0;o<r;o++)i[o]=arguments[o];return e.apply(t,[].concat(n,i))}})(p),h={config:function(e){return e||R("configIsRequired"),({}).toString.call(e).includes("Object")||R("configType"),e.urls?(console.warn(p.deprecation),{paths:{vs:e.urls.monacoBase}}):e}},M=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(e){return t.reduceRight(function(e,t){return t(e)},e)}},S={type:"cancelation",msg:"operation is manually canceled"},_=function(e){var t=!1,r=new Promise(function(r,n){e.then(function(e){return t?n(S):r(e)}),e.catch(n)});return r.cancel=function(){return t=!0},r},y=function(e){if(Array.isArray(e))return e}(f=({create:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};T.initial(e),T.handler(t);var r={current:e},n=a(g)(r,t),i=a(O)(r),o=a(T.changes)(e),u=a(A)(r);return[function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(e){return e};return T.selector(e),e(r.current)},function(e){(function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(e){return t.reduceRight(function(e,t){return t(e)},e)}})(n,i,o,u)(e)}]}}).create({config:{paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"}},isInitialized:!1,resolve:null,reject:null,monaco:null}))||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var r=[],n=!0,i=!1,o=void 0;try{for(var u,c=e[Symbol.iterator]();!(n=(u=c.next()).done)&&(r.push(u.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e}finally{try{n||null==c.return||c.return()}finally{if(i)throw o}}return r}}(f,2)||function(e,t){if(e){if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if("Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(e,t)}}(f,2)||function(){throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}(),m=y[0],b=y[1];function I(e){return document.body.appendChild(e)}function P(e){var t,r,n=m(function(e){return{config:e.config,reject:e.reject}}),i=(t="".concat(n.config.paths.vs,"/loader.js"),r=document.createElement("script"),t&&(r.src=t),r);return i.onload=function(){return e()},i.onerror=n.reject,i}function D(){var e=m(function(e){return{config:e.config,resolve:e.resolve,reject:e.reject}}),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],function(t){Y(t),e.resolve(t)},function(t){e.reject(t)})}function Y(e){m().monaco||b({monaco:e})}var N=new Promise(function(e,t){return b({resolve:e,reject:t})}),v={config:function(e){var t=h.config(e),r=t.monaco,n=function(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}(t,["monaco"]);b(function(e){return{config:function e(t,r){return Object.keys(r).forEach(function(n){r[n]instanceof Object&&t[n]&&Object.assign(r[n],e(t[n],r[n]))}),i(i({},t),r)}(e.config,n),monaco:r}})},init:function(){var e=m(function(e){return{monaco:e.monaco,isInitialized:e.isInitialized,resolve:e.resolve}});if(!e.isInitialized){if(b({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),_(N);if(window.monaco&&window.monaco.editor)return Y(window.monaco),e.resolve(window.monaco),_(N);M(I,P)(D)}return _(N)},__getMonacoInstance:function(){return m(function(e){return e.monaco})}},j=r(2265),G={wrapper:{display:"flex",position:"relative",textAlign:"initial"},fullWidth:{width:"100%"},hide:{display:"none"}},L={container:{display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"}},w=function({children:e}){return j.createElement("div",{style:L.container},e)},C=(0,j.memo)(function({width:e,height:t,isEditorReady:r,loading:n,_ref:i,className:o,wrapperProps:u}){return j.createElement("section",{style:{...G.wrapper,width:e,height:t},...u},!r&&j.createElement(w,null,n),j.createElement("div",{ref:i,style:{...G.fullWidth,...!r&&G.hide},className:o}))}),F=function(e){(0,j.useEffect)(e,[])},k=function(e,t,r=!0){let n=(0,j.useRef)(!0);(0,j.useEffect)(n.current||!r?()=>{n.current=!1}:e,t)};function x(){}function B(e,t,r,n){return e.editor.getModel(U(e,n))||e.editor.createModel(t,r,n?U(e,n):void 0)}function U(e,t){return e.Uri.parse(t)}(0,j.memo)(function({original:e,modified:t,language:r,originalLanguage:n,modifiedLanguage:i,originalModelPath:o,modifiedModelPath:u,keepCurrentOriginalModel:c=!1,keepCurrentModifiedModel:a=!1,theme:l="light",loading:s="Loading...",options:E={},height:f="100%",width:d="100%",className:T,wrapperProps:A={},beforeMount:O=x,onMount:g=x}){let[p,R]=(0,j.useState)(!1),[h,M]=(0,j.useState)(!0),S=(0,j.useRef)(null),_=(0,j.useRef)(null),y=(0,j.useRef)(null),m=(0,j.useRef)(g),b=(0,j.useRef)(O),I=(0,j.useRef)(!1);F(()=>{let e=v.init();return e.then(e=>(_.current=e)&&M(!1)).catch(e=>e?.type!=="cancelation"&&console.error("Monaco initialization: error:",e)),()=>{let t;return S.current?(t=S.current?.getModel(),void(c||t?.original?.dispose(),a||t?.modified?.dispose(),S.current?.dispose())):e.cancel()}}),k(()=>{if(S.current&&_.current){let t=S.current.getOriginalEditor(),i=B(_.current,e||"",n||r||"text",o||"");i!==t.getModel()&&t.setModel(i)}},[o],p),k(()=>{if(S.current&&_.current){let e=S.current.getModifiedEditor(),n=B(_.current,t||"",i||r||"text",u||"");n!==e.getModel()&&e.setModel(n)}},[u],p),k(()=>{let e=S.current.getModifiedEditor();e.getOption(_.current.editor.EditorOption.readOnly)?e.setValue(t||""):t!==e.getValue()&&(e.executeEdits("",[{range:e.getModel().getFullModelRange(),text:t||"",forceMoveMarkers:!0}]),e.pushUndoStop())},[t],p),k(()=>{S.current?.getModel()?.original.setValue(e||"")},[e],p),k(()=>{let{original:e,modified:t}=S.current.getModel();_.current.editor.setModelLanguage(e,n||r||"text"),_.current.editor.setModelLanguage(t,i||r||"text")},[r,n,i],p),k(()=>{_.current?.editor.setTheme(l)},[l],p),k(()=>{S.current?.updateOptions(E)},[E],p);let P=(0,j.useCallback)(()=>{if(!_.current)return;b.current(_.current);let c=B(_.current,e||"",n||r||"text",o||""),a=B(_.current,t||"",i||r||"text",u||"");S.current?.setModel({original:c,modified:a})},[r,t,i,e,n,o,u]),D=(0,j.useCallback)(()=>{!I.current&&y.current&&(S.current=_.current.editor.createDiffEditor(y.current,{automaticLayout:!0,...E}),P(),_.current?.editor.setTheme(l),R(!0),I.current=!0)},[E,l,P]);return(0,j.useEffect)(()=>{p&&m.current(S.current,_.current)},[p]),(0,j.useEffect)(()=>{h||p||D()},[h,p,D]),j.createElement(C,{width:d,height:f,isEditorReady:p,loading:s,_ref:y,className:T,wrapperProps:A})});var V=function(e){let t=(0,j.useRef)();return(0,j.useEffect)(()=>{t.current=e},[e]),t.current},$=new Map,J=(0,j.memo)(function({defaultValue:e,defaultLanguage:t,defaultPath:r,value:n,language:i,path:o,theme:u="light",line:c,loading:a="Loading...",options:l={},overrideServices:s={},saveViewState:E=!0,keepCurrentModel:f=!1,width:d="100%",height:T="100%",className:A,wrapperProps:O={},beforeMount:g=x,onMount:p=x,onChange:R,onValidate:h=x}){let[M,S]=(0,j.useState)(!1),[_,y]=(0,j.useState)(!0),m=(0,j.useRef)(null),b=(0,j.useRef)(null),I=(0,j.useRef)(null),P=(0,j.useRef)(p),D=(0,j.useRef)(g),Y=(0,j.useRef)(),N=(0,j.useRef)(n),G=V(o),L=(0,j.useRef)(!1),w=(0,j.useRef)(!1);F(()=>{let e=v.init();return e.then(e=>(m.current=e)&&y(!1)).catch(e=>e?.type!=="cancelation"&&console.error("Monaco initialization: error:",e)),()=>b.current?void(Y.current?.dispose(),f?E&&$.set(o,b.current.saveViewState()):b.current.getModel()?.dispose(),b.current.dispose()):e.cancel()}),k(()=>{let u=B(m.current,e||n||"",t||i||"",o||r||"");u!==b.current?.getModel()&&(E&&$.set(G,b.current?.saveViewState()),b.current?.setModel(u),E&&b.current?.restoreViewState($.get(o)))},[o],M),k(()=>{b.current?.updateOptions(l)},[l],M),k(()=>{b.current&&void 0!==n&&(b.current.getOption(m.current.editor.EditorOption.readOnly)?b.current.setValue(n):n===b.current.getValue()||(w.current=!0,b.current.executeEdits("",[{range:b.current.getModel().getFullModelRange(),text:n,forceMoveMarkers:!0}]),b.current.pushUndoStop(),w.current=!1))},[n],M),k(()=>{let e=b.current?.getModel();e&&i&&m.current?.editor.setModelLanguage(e,i)},[i],M),k(()=>{void 0!==c&&b.current?.revealLine(c)},[c],M),k(()=>{m.current?.editor.setTheme(u)},[u],M);let U=(0,j.useCallback)(()=>{if(!(!I.current||!m.current)&&!L.current){D.current(m.current);let a=o||r,f=B(m.current,n||e||"",t||i||"",a||"");b.current=m.current?.editor.create(I.current,{model:f,automaticLayout:!0,...l},s),E&&b.current.restoreViewState($.get(a)),m.current.editor.setTheme(u),void 0!==c&&b.current.revealLine(c),S(!0),L.current=!0}},[e,t,r,n,i,o,l,s,E,u,c]);return(0,j.useEffect)(()=>{M&&P.current(b.current,m.current)},[M]),(0,j.useEffect)(()=>{_||M||U()},[_,M,U]),N.current=n,(0,j.useEffect)(()=>{M&&R&&(Y.current?.dispose(),Y.current=b.current?.onDidChangeModelContent(e=>{w.current||R(b.current.getValue(),e)}))},[M,R]),(0,j.useEffect)(()=>{if(M){let e=m.current.editor.onDidChangeMarkers(e=>{let t=b.current.getModel()?.uri;if(t&&e.find(e=>e.path===t.path)){let e=m.current.editor.getModelMarkers({resource:t});h?.(e)}});return()=>{e?.dispose()}}return()=>{}},[M,h]),j.createElement(C,{width:d,height:T,isEditorReady:M,loading:a,_ref:I,className:A,wrapperProps:O})})},45706:function(e,t,r){e.exports={Analyzer:r(87706),DATA_TYPES:r(91139).DATA_TYPES,RegexList:r(80511)}},87706:function(e,t,r){var n=r(91139),i=r(41174),o=r(12725),u={};u._category=function(e){return n.TYPES_TO_CATEGORIES[e]||n.CATEGORIES.DIMENSION};var c={PAIR_GEOMETRY_FROM_STRING:!0,GEOMETRY_FROM_STRING:!0,NUMBER:!0},a={INT:!0,NUMBER:!0,FLOAT:!0};function l(e,t){e.push(t)}function s(){}u.computeColMeta=function(e,t,r){var E=(r=r||{}).ignoredDataTypes||[],f=r.keepUnknowns?l:s,d=n.VALIDATORS.filter(function(e){return 0>this.indexOf(e)},E);return e&&0!==Object.keys(e).length?Object.keys(e[0]).reduce(function(r,l){var s="",E=(t||[]).reduce(function(e,t){return e||(t.name&&t.name===l||t.regex&&t.regex.test(l)?t.dataType:e)},!1);E||(E=d.find(function(t){var r=e.filter(function(e){var r;return!(null===(r=e[l])||r===n.NULL||r===n.DB_NULL||void 0===r||Number.isNaN(r)&&a[t])&&(""!==r||!c[t])}),o=i[t],u=Math.min(3,r.length),s=0;return r.some(function(e){return o(e[l])?s++:u--,u<=0}),u>0&&s>0}));var T=u._category(E),A={key:l,label:l,type:n.DATA_TYPES.STRING,category:T||n.CATEGORIES.DIMENSION,format:""};if(!E)return f(r,A),r;if(A.type=E,E&&-1!==n.TIME_VALIDATORS.indexOf(E)){var O=o.findFirstNonNullValue(e,l);if(null===O)return f(r,A),r;s=o.detectTimeFormat(O,E)}if(A.format=s,E===n.DATA_TYPES.GEOMETRY){var g=o.findFirstNonNullValue(e,l);if(null===g)return f(r,A),r;A.geoType="string"==typeof g.type?g.type.toUpperCase():null}if(E===n.DATA_TYPES.GEOMETRY_FROM_STRING){var p=o.findFirstNonNullValue(e,l);if(null===p)return f(r,A),r;A.geoType=p.split(" ")[0].toUpperCase()}return E===n.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING&&(A.geoType="POINT"),r.push(A),r},[]):[]},e.exports=u},91139:function(e){var t={DATA_TYPES:{DATE:"DATE",TIME:"TIME",DATETIME:"DATETIME",NUMBER:"NUMBER",INT:"INT",FLOAT:"FLOAT",CURRENCY:"CURRENCY",PERCENT:"PERCENT",STRING:"STRING",ZIPCODE:"ZIPCODE",BOOLEAN:"BOOLEAN",GEOMETRY:"GEOMETRY",GEOMETRY_FROM_STRING:"GEOMETRY_FROM_STRING",PAIR_GEOMETRY_FROM_STRING:"PAIR_GEOMETRY_FROM_STRING",NONE:"NONE",ARRAY:"ARRAY",DATE_OBJECT:"DATE_OBJECT",OBJECT:"OBJECT"},CATEGORIES:{GEOMETRY:"GEOMETRY",TIME:"TIME",DIMENSION:"DIMENSION",MEASURE:"MEASURE"},BOOLEAN_TRUE_VALUES:["true","yes"],BOOLEAN_FALSE_VALUES:["false","no"],DB_NULL:"\\N",NULL:"NULL"};t.POSSIBLE_TYPES={},t.POSSIBLE_TYPES[t.CATEGORIES.GEOMETRY]=[t.DATA_TYPES.GEOMETRY_FROM_STRING,t.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING,t.DATA_TYPES.GEOMETRY],t.POSSIBLE_TYPES[t.CATEGORIES.TIME]=[t.DATA_TYPES.DATETIME,t.DATA_TYPES.DATE,t.DATA_TYPES.TIME],t.POSSIBLE_TYPES[t.CATEGORIES.DIMENSION]=[t.DATA_TYPES.STRING,t.DATA_TYPES.BOOLEAN,t.DATA_TYPES.ZIPCODE],t.POSSIBLE_TYPES[t.CATEGORIES.MEASURE]=[t.DATA_TYPES.NUMBER,t.DATA_TYPES.INT,t.DATA_TYPES.FLOAT,t.DATA_TYPES.CURRENCY,t.DATA_TYPES.PERCENT],t.TYPES_TO_CATEGORIES=Object.keys(t.POSSIBLE_TYPES).reduce(function(e,r){return t.POSSIBLE_TYPES[r].forEach(function(t){e[t]=r}),e},{}),t.VALIDATORS=[t.DATA_TYPES.GEOMETRY,t.DATA_TYPES.GEOMETRY_FROM_STRING,t.DATA_TYPES.PAIR_GEOMETRY_FROM_STRING,t.DATA_TYPES.BOOLEAN,t.DATA_TYPES.ARRAY,t.DATA_TYPES.DATE_OBJECT,t.DATA_TYPES.OBJECT,t.DATA_TYPES.CURRENCY,t.DATA_TYPES.PERCENT,t.DATA_TYPES.DATETIME,t.DATA_TYPES.DATE,t.DATA_TYPES.TIME,t.DATA_TYPES.INT,t.DATA_TYPES.FLOAT,t.DATA_TYPES.NUMBER,t.DATA_TYPES.ZIPCODE,t.DATA_TYPES.STRING],t.TIME_VALIDATORS=[t.DATA_TYPES.DATETIME,t.DATA_TYPES.DATE,t.DATA_TYPES.TIME],e.exports=t},80511:function(e,t,r){var n=r(27183),i={isNumber:/^(\+|\-)?\$?[\d,]*\.?\d+((e|E)(\+|\-)\d+)?%?$/,isInt:/^(\+|\-)?[\d,]+$/,isFloat:/^(\+|\-)?[\d,]*\.\d+?$/,isCurrency:/(?=.)^\$(([1-9][0-9]{0,2}(,[0-9]{3})*)|0)?(\.[0-9]{1,2})?$/,isPercentage:/^(\+|\-)?[\d,]*\.?\d+%$/,isZipCode:/(^\d{5}$)|(^\d{5}-\d{4}$)|(^\d{6}$)|(^\d{6}-\d{2}$)/,isTime:n.ALL_TIME_FORMAT_REGEX,isDate:n.DATE_FORMAT_REGEX,isDateTime:n.ALL_DATE_TIME_REGEX,isStringGeometry:/^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON)/,isPairwisePointGeometry:/(\+|\-)?\d*\.\d*,( )?(\+|\-)?\d*\.\d*/,isObject:/^{([\s\S]*)}$/,isArray:/^\[([\s\S]*)\]$/};e.exports=i},27183:function(e){function t(e){return"("+e.join("|")+")"}var r="\\d{1,2}",n="\\d{1,2}",i="\\d{1,2}",o="\\d{1,2}",u="\\d{2}",c="(\\.\\d{1,6})",a="\\d{2}",l="(\\+|-)(\\d{4}|\\d{1,2}:\\d{2})",s="(am|pm)",E=["X","x","H:m","HH:mmZ","h:m a","H:m:s","h:m:s a","HH:mm:ssZZ","HH:mm:ss.SSSS","HH:mm:ss.SSSSZZ"].reverse(),f=["\\b\\d{12,13}\\b","\\b\\d{9,10}(\\.\\d{1,3})?\\b",n+":"+i,r+":"+a+"(\\+|-)\\d{1,2}:\\d{1,2}","\\d{1,2}:"+i+" "+s,n+":"+i+":"+o,n+":"+i+":"+o+" "+s,r+":"+a+":"+u+l,r+":"+a+":"+u+c,r+":"+a+":"+u+c+l].reverse(),d=E.reduce(function(e,t,r){return e[f[r]]=t,e},{}),T=RegExp("^"+t(Object.keys(d))+"$","i"),A="\\d{2,4}",O="\\d{1,2}",g=t(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]),p=t(["January","February","March","April","May","June","July","August","September","October","November","December"]),R="\\d{1,2}",h="\\d{2}",M="\\d{1,2}(st|nd|rd|th)",S=[A+"-"+O+"-"+R,A+"\\/"+O+"\\/"+R,O+"\\/"+R+"\\/"+A,p+" "+h+", "+A,g+" "+h+", "+A,p+" "+M+", "+A,g+" "+M+", "+A],_=RegExp("^"+t(S)+"$","i"),y=["YYYY-M-D","YYYY/M/D","M/D/YYYY","MMMM DD, YYYY","MMM DD, YYYY","MMMM Do, YYYY","MMM Do, YYYY"].reduce(function(e,t,r){return e[S[r]]=t,e},{}),m=Object.keys(y).reduce(function(e,t){var r=y[t];return Object.keys(d).forEach(function(n){var i=d[n];e[t+" "+n]=r+" "+i,e[t+"T"+n]=r+"T"+i,e[n+"T"+t]=i+"T"+r,e[n+" "+t]=i+" "+r}),e},{}),b=new RegExp(t(Object.keys(m)));e.exports={ALL_TIME_FORMAT_REGEX:T,TIME_FORMAT_REGEX_MAP:d,DATE_FORMAT_REGEX:_,DATE_FORMAT_REGEX_MAP:y,ALL_DATE_TIME_REGEX:b,DATE_TIME_MAP:m}},12725:function(e,t,r){var n=r(91139),i=r(80511),o=r(27183);function u(e,t){return function(r){if(e.test(r))for(var n=Object.keys(t),i=0;i<n.length;i++){var o=n[i],u=t[o];if(new RegExp(o).test(r))return u}return!1}}var c=u(o.ALL_TIME_FORMAT_REGEX,o.TIME_FORMAT_REGEX_MAP),a=u(o.DATE_FORMAT_REGEX,o.DATE_FORMAT_REGEX_MAP),l=u(o.ALL_DATE_TIME_REGEX,o.DATE_TIME_MAP);function s(e){let t;try{t=JSON.parse(e)}catch(e){return!1}return t}function E(e){return"string"==typeof e}function f(e){return e===Object(e)&&"function"!=typeof e&&!Array.isArray(e)}function d(e){return Array.isArray(e)}e.exports={buildRegexCheck:function(e){return function(t){return i[e].test(t.toString())}},detectTimeFormat:function(e,t){switch(t){case n.DATA_TYPES.DATETIME:return l(e);case n.DATA_TYPES.DATE:default:return a(e);case n.DATA_TYPES.TIME:return c(e)}},findFirstNonNullValue:function(e,t){for(var r=0;r<e.length;r++)if(null!==e[r][t]&&e[r][t]!==n.NULL)return e[r][t];return null},isBoolean:function(e){return n.BOOLEAN_TRUE_VALUES.concat(n.BOOLEAN_FALSE_VALUES).indexOf(String(e).toLowerCase())>-1},isGeographic:function(e){return!!e&&"object"==typeof e&&e.hasOwnProperty("type")&&e.hasOwnProperty("coordinates")},isString:E,isArray:function(e){return!!(d(e)||function(e){if(!E(e)||!i.isArray.test(e))return!1;let t=s(e);return!!(t&&d(t))}(e))},isDateObject:function(e){return e instanceof Date},isObject:function(e){return!!(f(e)||function(e){if(!E(e)||!i.isObject.test(e))return!1;let t=s(e);return!!(t&&f(t))}(e))},whichFormatTime:c,whichFormatDate:a,whichFormatDateTime:l}},41174:function(e,t,r){var n=r(91139),i=r(12725),o=n.DATA_TYPES,u={};u[o.GEOMETRY]=i.isGeographic,u[o.GEOMETRY_FROM_STRING]=i.buildRegexCheck("isStringGeometry"),u[o.PAIR_GEOMETRY_FROM_STRING]=i.buildRegexCheck("isPairwisePointGeometry"),u[o.BOOLEAN]=i.isBoolean,u[o.DATE_OBJECT]=i.isDateObject,u[o.CURRENCY]=i.buildRegexCheck("isCurrency"),u[o.PERCENT]=i.buildRegexCheck("isPercentage"),u[o.ARRAY]=i.isArray,u[o.OBJECT]=i.isObject,u[o.DATETIME]=i.buildRegexCheck("isDateTime"),u[o.DATE]=i.buildRegexCheck("isDate"),u[o.TIME]=i.buildRegexCheck("isTime");let c=i.buildRegexCheck("isInt");function a(e){if(c(e)){var t=parseInt(e.toString().replace(/(\+|,)/g,""),10);return t>Number.MIN_SAFE_INTEGER&&t<Number.MAX_SAFE_INTEGER}return!1}u[o.INT]=a;let l=i.buildRegexCheck("isFloat");function s(e){return l(e)||a(e)}u[o.FLOAT]=s,u[o.NUMBER]=function(e){return!isNaN(e)||a(e)||s(e)},u[o.ZIPCODE]=i.buildRegexCheck("isZipCode"),u[o.STRING]=i.isString,e.exports=u}}]);