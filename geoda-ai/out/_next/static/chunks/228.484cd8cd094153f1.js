!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},t=Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="9d811f88-41ce-4f2f-ada8-186157061454",e._sentryDebugIdIdentifier="sentry-dbid-9d811f88-41ce-4f2f-ada8-186157061454")}catch(e){}}();"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[228],{56228:function(e,t,r){r.d(t,{LiveAudioVisualizer:function(){return f}});var n,a=r(2265),l={exports:{}},i={};l.exports=function(){if(n)return i;n=1;var e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,l=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function u(t,n,a){var i,u={},s=null,f=null;for(i in void 0!==a&&(s=""+a),void 0!==n.key&&(s=""+n.key),void 0!==n.ref&&(f=n.ref),n)r.call(n,i)&&!o.hasOwnProperty(i)&&(u[i]=n[i]);if(t&&t.defaultProps)for(i in n=t.defaultProps)void 0===u[i]&&(u[i]=n[i]);return{$$typeof:e,type:t,key:s,ref:f,props:u,_owner:l.current}}return i.Fragment=t,i.jsx=u,i.jsxs=u,i}();var o=l.exports;let u=(e,t,r,n)=>{let a=t/(r+n),l=Math.floor(e.length/a);a>e.length&&(a=e.length,l=1);let i=[];for(let t=0;t<a;t++){let r=0;for(let n=0;n<l&&t*l+n<e.length;n++)r+=e[t*l+n];i.push(r/l)}return i},s=(e,t,r,n,a,l)=>{let i=t.height/2,o=t.getContext("2d");o&&(o.clearRect(0,0,t.width,t.height),"transparent"!==a&&(o.fillStyle=a,o.fillRect(0,0,t.width,t.height)),e.forEach((e,t)=>{o.fillStyle=l;let a=t*(r+n),u=i-e/2,s=e||1;o.beginPath(),o.roundRect?(o.roundRect(a,u,r,s,50),o.fill()):o.fillRect(a,u,r,s)}))},f=({mediaRecorder:e,width:t="100%",height:r="100%",barWidth:n=2,gap:l=1,backgroundColor:i="transparent",barColor:f="rgb(160, 198, 255)",fftSize:c=1024,maxDecibels:d=-10,minDecibels:h=-90,smoothingTimeConstant:g=.4})=>{let[m]=(0,a.useState)(()=>new AudioContext),[y,p]=(0,a.useState)(),b=(0,a.useRef)(null);(0,a.useEffect)(()=>{if(!e.stream)return;let t=m.createAnalyser();p(t),t.fftSize=c,t.minDecibels=h,t.maxDecibels=d,t.smoothingTimeConstant=g,m.createMediaStreamSource(e.stream).connect(t)},[e.stream]),(0,a.useEffect)(()=>{y&&"recording"===e.state&&w()},[y,e.state]);let w=(0,a.useCallback)(()=>{if(!y)return;let t=new Uint8Array(null==y?void 0:y.frequencyBinCount);"recording"===e.state?(null==y||y.getByteFrequencyData(t),_(t),requestAnimationFrame(w)):"paused"===e.state?_(t):"inactive"===e.state&&"closed"!==m.state&&m.close()},[y,m.state]),_=e=>{b.current&&s(u(e,b.current.width,n,l),b.current,n,l,i,f)};return o.jsx("canvas",{ref:b,width:t,height:r,style:{aspectRatio:"unset"}})},c=(e,t,r,n,a)=>{let l=e.getChannelData(0),i=r/(n+a),o=Math.floor(l.length/i),u=t/2,s=[],f=0;for(let t=0;t<i;t++){let r=[],n=0,a=[],i=0;for(let u=0;u<o&&t*o+u<e.length;u++){let e=l[t*o+u];e<=0&&(r.push(e),n++),e>0&&(a.push(e),i++)}let u=r.reduce((e,t)=>e+t,0)/n,c={max:a.reduce((e,t)=>e+t,0)/i,min:u};c.max>f&&(f=c.max),Math.abs(c.min)>f&&(f=Math.abs(c.min)),s.push(c)}if(.8*u>f*u){let e=.8*u/f;s=s.map(t=>({max:t.max*e,min:t.min*e}))}return s},d=(e,t,r,n,a,l,i,o=0,u=1)=>{let s=t.height/2,f=t.getContext("2d");if(!f)return;f.clearRect(0,0,t.width,t.height),"transparent"!==a&&(f.fillStyle=a,f.fillRect(0,0,t.width,t.height));let c=(o||0)/u;e.forEach((t,a)=>{let o=a/e.length;f.fillStyle=c>o&&i?i:l;let u=a*(r+n),d=s+t.min,h=s+t.max-d;f.beginPath(),f.roundRect?(f.roundRect(u,d,r,h,50),f.fill()):f.fillRect(u,d,r,h)})};(0,a.forwardRef)(({blob:e,width:t,height:r,barWidth:n=2,gap:l=1,currentTime:i,style:u,backgroundColor:s="transparent",barColor:f="rgb(184, 184, 184)",barPlayedColor:h="rgb(160, 198, 255)"},g)=>{let m=(0,a.useRef)(null),[y,p]=(0,a.useState)([]),[b,w]=(0,a.useState)(0);return(0,a.useImperativeHandle)(g,()=>m.current,[]),(0,a.useEffect)(()=>{(async()=>{if(!m.current)return;if(!e){d(Array.from({length:100},()=>({max:0,min:0})),m.current,n,l,s,f,h);return}let a=await e.arrayBuffer();await new AudioContext().decodeAudioData(a,e=>{if(!m.current)return;w(e.duration);let a=c(e,r,t,n,l);p(a),d(a,m.current,n,l,s,f,h)})})()},[e,m.current]),(0,a.useEffect)(()=>{m.current&&d(y,m.current,n,l,s,f,h,i,b)},[i,b]),o.jsx("canvas",{ref:m,width:t,height:r,style:{...u}})}).displayName="AudioVisualizer"}}]);