"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[604],{30604:function(e,t,a){a.r(t),a.d(t,{default:function(){return S}});var n,i,s=a(57437),r=a(2265);a(91159);var o=a(9448),l=a(26564),u=a(16347),c=a(2336),d=a(16081),m=a(89687),p=a(81179),f=a(48892);(n=i||(i={})).SUMMARIZE_DATA="summarizeData",n.QUANTILE_BREAKS="quantileBreaks",n.NATURAL_BREAKS="naturalBreaks";let w={summarizeData:function(e){let{tableName:t}=e;return console.log("calling summarizeData() with arguments:",t),(0,m.EW)()},quantileBreaks:async function(e){let{k:t,variableName:a}=e,n=await (0,m.eR)(a);return n&&0!==n.length?{type:"mapping",name:"Quantile Breaks",result:await (0,p.H)(t,n)}:{result:"column data is empty"}},naturalBreaks:async function(e){let{k:t,variableName:a}=e,n=await (0,m.eR)(a);return n&&0!==n.length?{type:"mapping",name:"Natural Breaks",result:await (0,f.a)(t,n)}:{result:"column data is empty"}}},g=null,y=null,h=null;var A=a(81898),E=a(37431),b=a(80512),v=a(8455),T=a.n(v),_=a(52295);let x=e=>{let{key:t,functionArgs:a,output:n,dispatch:i,geodaState:r}=e,{createCustomScaleMap:o}=(0,_.M)();return"mapping"===n.type&&(0,s.jsx)(b.A,{radius:"full",className:"m-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg",onClick:()=>{if("mapping"===n.type){let e=n.result,{variableName:t}=a;o({breaks:e,mappingType:n.name,colorFieldName:t,dispatch:i,geodaState:r})}},children:(0,s.jsx)(T(),{options:{strings:"Click to Create a ".concat(n.name," Map"),autoStart:!0,loop:!1,delay:10}})},t)},k=e=>{let{openAIKey:t}=e,a=(0,l.Z)(),n=(0,u.I0)(),p=(0,u.v9)(e=>e),{initOpenAI:f,processMessage:A}={initOpenAI:async function(e){g||(g=new d.ZP({apiKey:e,dangerouslyAllowBrowser:!0}),y=await g.beta.assistants.retrieve("asst_nowaCi4DNY6SwLJIiLtDOuLG"),h=await g.beta.threads.create())},processMessage:async function(e){if(!g||!h||!y)return null;await g.beta.threads.messages.create(h.id,{role:"user",content:e});let t=await g.beta.threads.runs.create(h.id,{assistant_id:y.id}),a=await g.beta.threads.runs.retrieve(h.id,t.id),n=null;for(;"completed"!==a.status;){if(await new Promise(e=>setTimeout(e,1e3)),"requires_action"===(a=await g.beta.threads.runs.retrieve(h.id,t.id)).status){var i;let e=null===(i=a.required_action)||void 0===i?void 0:i.submit_tool_outputs.tool_calls,s=[];for(let t=0;(null==e?void 0:e.length)&&t<e.length;t++){let a=e[t],i=a.function.name;console.log("This question requires us to call a function: ".concat(i));let r=JSON.parse(a.function.arguments),o=Object.keys(r).map(e=>r[e]);console.log("The arguments for this function are: ".concat(o," and ").concat(r));let l=w[i];if(l){let e=await l(r);s.push({tool_call_id:a.id,output:JSON.stringify(e.result)}),n={functionName:i,functionArgs:r,output:e}}else{let e="The function ".concat(i," is not defined. You can contact GeoDa.AI team for assistance.");console.error(e),s.push({tool_call_id:a.id,output:e})}}await g.beta.threads.runs.submitToolOutputs(h.id,t.id,{tool_outputs:s});continue}if(["failed","cancelled","expired"].includes(a.status)){console.log("Run status is '".concat(a.status,"'. Unable to complete the request."));break}}let s=(await g.beta.threads.messages.list(h.id)).data.filter(e=>e.run_id===t.id&&"assistant"===e.role).pop();if(s){if("text"in s.content[0]){let e=s.content[0].text.value;return console.log("The assistant responded with: ".concat(e)),[{message:e,sender:"ChatGPT",direction:"incoming",position:"normal"},...n?[function(e){let{functionName:t,functionArgs:a,output:n}=e;return{type:"custom",message:"",sender:"GeoDa.AI",direction:"incoming",position:"normal",payload:{type:"custom",functionName:t,functionArgs:a,output:n}}}(n)]:[]]}}else["failed","cancelled","expired"].includes(a.status)||console.log("No response received from the assistant.");return null},uploadSummary:async function(e){if(g&&y&&e){let t=await (0,m.Zi)(e),a=new Blob([t],{type:"text/plain;charset=utf-8"}),n=await g.files.create({purpose:"assistants",file:new File([a],"data_summary_".concat(e,".txt"))}),i=await g.beta.assistants.retrieve(y.id),s=i.file_ids||[];console.log("existingFileIds",s),await g.beta.assistants.update(y.id,{file_ids:[...s,n.id]}),i.file_ids=[...s,n.id],console.log("updatedExistingFileIds",(await g.beta.assistants.retrieve(y.id)).file_ids||[])}}},[E,b]=(0,r.useState)([]);(0,r.useEffect)(()=>{b([{message:a.formatMessage({id:"chatGpt.initialMessage",defaultMessage:"Hello, I'm GeoDa.AI powered by ChatGPT! Let's do spatial analysis! Ask me anything about your data."}),sentTime:"just now",sender:"ChatGPT",direction:"incoming",position:"first"}]),t&&f(t)},[]);let[v,T]=(0,r.useState)(!1),_=async e=>{let t=[...E,{message:e,direction:"outgoing",sender:"user",position:"normal"}];b(t),T(!0);let a=await A(e);a&&b([...t,...a]),T(!1)};return(0,s.jsx)(c.ZP,{children:e=>{let{height:t,width:r}=e;return(0,s.jsx)("div",{style:{position:"relative",height:"".concat(t,"px"),width:"".concat(r,"px")},children:(0,s.jsx)(o.tz,{children:(0,s.jsxs)(o.uU,{children:[(0,s.jsx)(o.rN,{autoScrollToBottom:!0,scrollBehavior:"smooth",typingIndicator:v?(0,s.jsx)(o.c2,{content:a.formatMessage({id:"chatGpt.isTyping",defaultMessage:"GeoDa.AI is typing"})}):null,children:E.map((e,t)=>"custom"===e.type?function(e,t){let{functionName:a,functionArgs:s,output:r}=e;if(a===i.QUANTILE_BREAKS||a===i.NATURAL_BREAKS)return x({key:t,functionArgs:s,output:r,dispatch:n,geodaState:p})}(e.payload,t):(0,s.jsx)(o.v0,{model:e},t))}),(0,s.jsx)(o.Ru,{placeholder:a.formatMessage({id:"chatGpt.inputPlaceholder",defaultMessage:"Type message here"}),onSend:_})]})})})}})};var S=()=>{let e=(0,l.Z)(),t=(0,u.v9)(e=>{var t,a;return null===(a=e.root.file)||void 0===a?void 0:null===(t=a.rawFileData)||void 0===t?void 0:t.name}),a=(0,u.v9)(e=>e.root.uiState.openAIKey);return(0,s.jsx)(E.c,{title:e.formatMessage({id:"chatGpt.title",defaultMessage:"GeoDa.AI ChatBot"}),description:e.formatMessage({id:"chatGpt.description",defaultMessage:"Powered by ChatGPT"}),children:a?t?(0,s.jsx)(k,{openAIKey:a}):(0,s.jsx)(A.Xr,{message:"Please load a map first before chatting.",type:"warning"}):(0,s.jsx)(A.Xr,{message:"Please config your OpenAI API key in Settings.",type:"warning"})})}},89687:function(e,t,a){a.d(t,{EW:function(){return f},Zi:function(){return p},bW:function(){return g},eR:function(){return w}});var n=a(2265),i=a(36629),s=a(79121),r=a(37037),o=a(41762);let l={mvp:{mainModule:r,mainWorker:new a.U(a(82471)).toString()},eh:{mainModule:o,mainWorker:new a.U(a(37770)).toString()}},u=null,c=null,d=null;async function m(){if(null===u){await new Promise(e=>setTimeout(e,2e3));let e=await s.Dn(l),t=new Worker(e.mainWorker),a=new s.kw;return u=new s.ak(a,t),await u.instantiate(e.mainModule,e.pthreadWorker),u}return null}async function p(e){if(u){if(!d){!c&&e&&(c=e);let t=await u.connect(),a=(await t.query('SUMMARIZE "'.concat(c,'"'))).toArray().map(e=>e.toJSON());await t.close();let n=a.map(e=>Object.values(e).join(",")).join("\n"),i=Object.keys(a[0]).join(",");d="".concat(i,"\n").concat(n)}return d}return""}function f(){return d}async function w(e){if(u){let t=await u.connect(),a=(await t.query('SELECT "'.concat(e,'" FROM "').concat(c,'"'))).toArray().map(e=>e.toArray()[0]);return await t.close(),a}return[]}function g(){return{query:(0,n.useCallback)(async e=>{var t;if("SELECT"!==(e=e.trim()).substring(0,6).toUpperCase())throw Error("Only SELECT queries are supported");if(!u)throw Error("DuckDB is not initialized");e="SELECT row_index AS selected_index, ".concat(e.substring(6));let a=await u.connect(),n=null===(t=(await a.query(e)).getChildAt(0))||void 0===t?void 0:t.toArray();return await a.close(),n||[]},[]),importArrowFile:(0,n.useCallback)(async e=>{if(u){let t=await u.connect();if(c=e.name,!(await t.query("select * from information_schema.tables")).toArray().map(e=>e.toJSON()).some(e=>e.table_name===c))try{let a=await e.arrayBuffer(),n=(0,i.p)(a);await t.insertArrowTable(n,{name:c}),await t.query('ALTER TABLE "'.concat(c,'" ADD COLUMN row_index INTEGER DEFAULT 0')),await t.query("CREATE SEQUENCE serial"),await t.query('UPDATE "'.concat(c,"\" SET row_index = nextval('serial') - 1"));let s=await p();console.log("summary",s)}catch(e){console.error(e)}await t.close()}},[])}}setTimeout(async()=>{u=await m()},200)}}]);