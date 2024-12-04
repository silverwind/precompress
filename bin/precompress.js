#!/usr/bin/env node
import {createRequire} from 'module';const require = createRequire(import.meta.url);
var Ye=Object.create;var Vt=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var We=Object.getOwnPropertyNames;var Ze=Object.getPrototypeOf,je=Object.prototype.hasOwnProperty;var zt=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(n,e)=>(typeof require<"u"?require:n)[e]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var tt=(t,n)=>()=>(n||t((n={exports:{}}).exports,n),n.exports);var Je=(t,n,e,u)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of We(n))!je.call(t,r)&&r!==e&&Vt(t,r,{get:()=>n[r],enumerable:!(u=Qe(n,r))||u.enumerable});return t};var ht=(t,n,e)=>(e=t!=null?Ye(Ze(t)):{},Je(n||!t||!t.__esModule?Vt(e,"default",{value:t,enumerable:!0}):e,t));var Zt=tt((xr,Wt)=>{"use strict";function tn(t,n){var e=t;n.slice(0,-1).forEach(function(r){e=e[r]||{}});var u=n[n.length-1];return u in e}function Yt(t){return typeof t=="number"||/^0x[0-9a-f]+$/i.test(t)?!0:/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(t)}function Qt(t,n){return n==="constructor"&&typeof t[n]=="function"||n==="__proto__"}Wt.exports=function(t,n){n||(n={});var e={bools:{},strings:{},unknownFn:null};typeof n.unknown=="function"&&(e.unknownFn=n.unknown),typeof n.boolean=="boolean"&&n.boolean?e.allBools=!0:[].concat(n.boolean).filter(Boolean).forEach(function(d){e.bools[d]=!0});var u={};function r(d){return u[d].some(function(S){return e.bools[S]})}Object.keys(n.alias||{}).forEach(function(d){u[d]=[].concat(n.alias[d]),u[d].forEach(function(S){u[S]=[d].concat(u[d].filter(function(O){return S!==O}))})}),[].concat(n.string).filter(Boolean).forEach(function(d){e.strings[d]=!0,u[d]&&[].concat(u[d]).forEach(function(S){e.strings[S]=!0})});var l=n.default||{},a={_:[]};function p(d,S){return e.allBools&&/^--[^=]+$/.test(S)||e.strings[d]||e.bools[d]||u[d]}function b(d,S,O){for(var g=d,E=0;E<S.length-1;E++){var A=S[E];if(Qt(g,A))return;g[A]===void 0&&(g[A]={}),(g[A]===Object.prototype||g[A]===Number.prototype||g[A]===String.prototype)&&(g[A]={}),g[A]===Array.prototype&&(g[A]=[]),g=g[A]}var o=S[S.length-1];Qt(g,o)||((g===Object.prototype||g===Number.prototype||g===String.prototype)&&(g={}),g===Array.prototype&&(g=[]),g[o]===void 0||e.bools[o]||typeof g[o]=="boolean"?g[o]=O:Array.isArray(g[o])?g[o].push(O):g[o]=[g[o],O])}function _(d,S,O){if(!(O&&e.unknownFn&&!p(d,O)&&e.unknownFn(O)===!1)){var g=!e.strings[d]&&Yt(S)?Number(S):S;b(a,d.split("."),g),(u[d]||[]).forEach(function(E){b(a,E.split("."),g)})}}Object.keys(e.bools).forEach(function(d){_(d,l[d]===void 0?!1:l[d])});var y=[];t.indexOf("--")!==-1&&(y=t.slice(t.indexOf("--")+1),t=t.slice(0,t.indexOf("--")));for(var m=0;m<t.length;m++){var h=t[m],x,R;if(/^--.+=/.test(h)){var N=h.match(/^--([^=]+)=([\s\S]*)$/);x=N[1];var U=N[2];e.bools[x]&&(U=U!=="false"),_(x,U,h)}else if(/^--no-.+/.test(h))x=h.match(/^--no-(.+)/)[1],_(x,!1,h);else if(/^--.+/.test(h))x=h.match(/^--(.+)/)[1],R=t[m+1],R!==void 0&&!/^(-|--)[^-]/.test(R)&&!e.bools[x]&&!e.allBools&&(!u[x]||!r(x))?(_(x,R,h),m+=1):/^(true|false)$/.test(R)?(_(x,R==="true",h),m+=1):_(x,e.strings[x]?"":!0,h);else if(/^-[^-]+/.test(h)){for(var I=h.slice(1,-1).split(""),w=!1,T=0;T<I.length;T++){if(R=h.slice(T+2),R==="-"){_(I[T],R,h);continue}if(/[A-Za-z]/.test(I[T])&&R[0]==="="){_(I[T],R.slice(1),h),w=!0;break}if(/[A-Za-z]/.test(I[T])&&/-?\d+(\.\d*)?(e-?\d+)?$/.test(R)){_(I[T],R,h),w=!0;break}if(I[T+1]&&I[T+1].match(/\W/)){_(I[T],h.slice(T+2),h),w=!0;break}else _(I[T],e.strings[I[T]]?"":!0,h)}x=h.slice(-1)[0],!w&&x!=="-"&&(t[m+1]&&!/^(-|--)[^-]/.test(t[m+1])&&!e.bools[x]&&(!u[x]||!r(x))?(_(x,t[m+1],h),m+=1):t[m+1]&&/^(true|false)$/.test(t[m+1])?(_(x,t[m+1]==="true",h),m+=1):_(x,e.strings[x]?"":!0,h))}else if((!e.unknownFn||e.unknownFn(h)!==!1)&&a._.push(e.strings._||!Yt(h)?h:Number(h)),n.stopEarly){a._.push.apply(a._,t.slice(m+1));break}}return Object.keys(l).forEach(function(d){tn(a,d.split("."))||(b(a,d.split("."),l[d]),(u[d]||[]).forEach(function(S){b(a,S.split("."),l[d])}))}),n["--"]?a["--"]=y.slice():y.forEach(function(d){a._.push(d)}),a}});var it=tt((gr,re)=>{"use strict";var Q="\\\\/",Jt=`[^${Q}]`,j="\\.",en="\\+",nn="\\?",dt="\\/",rn="(?=.)",te="[^/]",gt=`(?:${dt}|$)`,ee=`(?:^|${dt})`,wt=`${j}{1,2}${gt}`,on=`(?!${j})`,sn=`(?!${ee}${wt})`,un=`(?!${j}{0,1}${gt})`,an=`(?!${wt})`,cn=`[^.${dt}]`,ln=`${te}*?`,fn="/",ne={DOT_LITERAL:j,PLUS_LITERAL:en,QMARK_LITERAL:nn,SLASH_LITERAL:dt,ONE_CHAR:rn,QMARK:te,END_ANCHOR:gt,DOTS_SLASH:wt,NO_DOT:on,NO_DOTS:sn,NO_DOT_SLASH:un,NO_DOTS_SLASH:an,QMARK_NO_DOT:cn,STAR:ln,START_ANCHOR:ee,SEP:fn},pn={...ne,SLASH_LITERAL:`[${Q}]`,QMARK:Jt,STAR:`${Jt}*?`,DOTS_SLASH:`${j}{1,2}(?:[${Q}]|$)`,NO_DOT:`(?!${j})`,NO_DOTS:`(?!(?:^|[${Q}])${j}{1,2}(?:[${Q}]|$))`,NO_DOT_SLASH:`(?!${j}{0,1}(?:[${Q}]|$))`,NO_DOTS_SLASH:`(?!${j}{1,2}(?:[${Q}]|$))`,QMARK_NO_DOT:`[^.${Q}]`,START_ANCHOR:`(?:^|[${Q}])`,END_ANCHOR:`(?:[${Q}]|$)`,SEP:"\\"},hn={alnum:"a-zA-Z0-9",alpha:"a-zA-Z",ascii:"\\x00-\\x7F",blank:" \\t",cntrl:"\\x00-\\x1F\\x7F",digit:"0-9",graph:"\\x21-\\x7E",lower:"a-z",print:"\\x20-\\x7E ",punct:"\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",space:" \\t\\r\\n\\v\\f",upper:"A-Z",word:"A-Za-z0-9_",xdigit:"A-Fa-f0-9"};re.exports={MAX_LENGTH:1024*64,POSIX_REGEX_SOURCE:hn,REGEX_BACKSLASH:/\\(?![*+?^${}(|)[\]])/g,REGEX_NON_SPECIAL_CHARS:/^[^@![\].,$*+?^{}()|\\/]+/,REGEX_SPECIAL_CHARS:/[-*+?.^${}(|)[\]]/,REGEX_SPECIAL_CHARS_BACKREF:/(\\?)((\W)(\3*))/g,REGEX_SPECIAL_CHARS_GLOBAL:/([-*+?.^${}(|)[\]])/g,REGEX_REMOVE_BACKSLASH:/(?:\[.*?[^\\]\]|\\(?=.))/g,REPLACEMENTS:{"***":"*","**/**":"**","**/**/**":"**"},CHAR_0:48,CHAR_9:57,CHAR_UPPERCASE_A:65,CHAR_LOWERCASE_A:97,CHAR_UPPERCASE_Z:90,CHAR_LOWERCASE_Z:122,CHAR_LEFT_PARENTHESES:40,CHAR_RIGHT_PARENTHESES:41,CHAR_ASTERISK:42,CHAR_AMPERSAND:38,CHAR_AT:64,CHAR_BACKWARD_SLASH:92,CHAR_CARRIAGE_RETURN:13,CHAR_CIRCUMFLEX_ACCENT:94,CHAR_COLON:58,CHAR_COMMA:44,CHAR_DOT:46,CHAR_DOUBLE_QUOTE:34,CHAR_EQUAL:61,CHAR_EXCLAMATION_MARK:33,CHAR_FORM_FEED:12,CHAR_FORWARD_SLASH:47,CHAR_GRAVE_ACCENT:96,CHAR_HASH:35,CHAR_HYPHEN_MINUS:45,CHAR_LEFT_ANGLE_BRACKET:60,CHAR_LEFT_CURLY_BRACE:123,CHAR_LEFT_SQUARE_BRACKET:91,CHAR_LINE_FEED:10,CHAR_NO_BREAK_SPACE:160,CHAR_PERCENT:37,CHAR_PLUS:43,CHAR_QUESTION_MARK:63,CHAR_RIGHT_ANGLE_BRACKET:62,CHAR_RIGHT_CURLY_BRACE:125,CHAR_RIGHT_SQUARE_BRACKET:93,CHAR_SEMICOLON:59,CHAR_SINGLE_QUOTE:39,CHAR_SPACE:32,CHAR_TAB:9,CHAR_UNDERSCORE:95,CHAR_VERTICAL_LINE:124,CHAR_ZERO_WIDTH_NOBREAK_SPACE:65279,extglobChars(t){return{"!":{type:"negate",open:"(?:(?!(?:",close:`))${t.STAR})`},"?":{type:"qmark",open:"(?:",close:")?"},"+":{type:"plus",open:"(?:",close:")+"},"*":{type:"star",open:"(?:",close:")*"},"@":{type:"at",open:"(?:",close:")"}}},globChars(t){return t===!0?pn:ne}}});var yt=tt(q=>{"use strict";var{REGEX_BACKSLASH:dn,REGEX_REMOVE_BACKSLASH:yn,REGEX_SPECIAL_CHARS:mn,REGEX_SPECIAL_CHARS_GLOBAL:An}=it();q.isObject=t=>t!==null&&typeof t=="object"&&!Array.isArray(t);q.hasRegexChars=t=>mn.test(t);q.isRegexChar=t=>t.length===1&&q.hasRegexChars(t);q.escapeRegex=t=>t.replace(An,"\\$1");q.toPosixSlashes=t=>t.replace(dn,"/");q.removeBackslashes=t=>t.replace(yn,n=>n==="\\"?"":n);q.escapeLast=(t,n,e)=>{let u=t.lastIndexOf(n,e);return u===-1?t:t[u-1]==="\\"?q.escapeLast(t,n,u-1):`${t.slice(0,u)}\\${t.slice(u)}`};q.removePrefix=(t,n={})=>{let e=t;return e.startsWith("./")&&(e=e.slice(2),n.prefix="./"),e};q.wrapOutput=(t,n={},e={})=>{let u=e.contains?"":"^",r=e.contains?"":"$",l=`${u}(?:${t})${r}`;return n.negated===!0&&(l=`(?:^(?!${l}).*$)`),l};q.basename=(t,{windows:n}={})=>{let e=t.split(n?/[\\/]/:"/"),u=e[e.length-1];return u===""?e[e.length-2]:u}});var fe=tt((Cr,le)=>{"use strict";var oe=yt(),{CHAR_ASTERISK:Ct,CHAR_AT:bn,CHAR_BACKWARD_SLASH:ut,CHAR_COMMA:En,CHAR_DOT:$t,CHAR_EXCLAMATION_MARK:Tt,CHAR_FORWARD_SLASH:ce,CHAR_LEFT_CURLY_BRACE:Ot,CHAR_LEFT_PARENTHESES:vt,CHAR_LEFT_SQUARE_BRACKET:_n,CHAR_PLUS:Rn,CHAR_QUESTION_MARK:se,CHAR_RIGHT_CURLY_BRACE:xn,CHAR_RIGHT_PARENTHESES:ie,CHAR_RIGHT_SQUARE_BRACKET:Sn}=it(),ue=t=>t===ce||t===ut,ae=t=>{t.isPrefix!==!0&&(t.depth=t.isGlobstar?1/0:1)},gn=(t,n)=>{let e=n||{},u=t.length-1,r=e.parts===!0||e.scanToEnd===!0,l=[],a=[],p=[],b=t,_=-1,y=0,m=0,h=!1,x=!1,R=!1,N=!1,U=!1,I=!1,w=!1,T=!1,d=!1,S=!1,O=0,g,E,A={value:"",depth:0,isGlob:!1},o=()=>_>=u,X=()=>b.charCodeAt(_+1),G=()=>(g=E,b.charCodeAt(++_));for(;_<u;){E=G();let v;if(E===ut){w=A.backslashes=!0,E=G(),E===Ot&&(I=!0);continue}if(I===!0||E===Ot){for(O++;o()!==!0&&(E=G());){if(E===ut){w=A.backslashes=!0,G();continue}if(E===Ot){O++;continue}if(I!==!0&&E===$t&&(E=G())===$t){if(h=A.isBrace=!0,R=A.isGlob=!0,S=!0,r===!0)continue;break}if(I!==!0&&E===En){if(h=A.isBrace=!0,R=A.isGlob=!0,S=!0,r===!0)continue;break}if(E===xn&&(O--,O===0)){I=!1,h=A.isBrace=!0,S=!0;break}}if(r===!0)continue;break}if(E===ce){if(l.push(_),a.push(A),A={value:"",depth:0,isGlob:!1},S===!0)continue;if(g===$t&&_===y+1){y+=2;continue}m=_+1;continue}if(e.noext!==!0&&(E===Rn||E===bn||E===Ct||E===se||E===Tt)===!0&&X()===vt){if(R=A.isGlob=!0,N=A.isExtglob=!0,S=!0,E===Tt&&_===y&&(d=!0),r===!0){for(;o()!==!0&&(E=G());){if(E===ut){w=A.backslashes=!0,E=G();continue}if(E===ie){R=A.isGlob=!0,S=!0;break}}continue}break}if(E===Ct){if(g===Ct&&(U=A.isGlobstar=!0),R=A.isGlob=!0,S=!0,r===!0)continue;break}if(E===se){if(R=A.isGlob=!0,S=!0,r===!0)continue;break}if(E===_n){for(;o()!==!0&&(v=G());){if(v===ut){w=A.backslashes=!0,G();continue}if(v===Sn){x=A.isBracket=!0,R=A.isGlob=!0,S=!0;break}}if(r===!0)continue;break}if(e.nonegate!==!0&&E===Tt&&_===y){T=A.negated=!0,y++;continue}if(e.noparen!==!0&&E===vt){if(R=A.isGlob=!0,r===!0){for(;o()!==!0&&(E=G());){if(E===vt){w=A.backslashes=!0,E=G();continue}if(E===ie){S=!0;break}}continue}break}if(R===!0){if(S=!0,r===!0)continue;break}}e.noext===!0&&(N=!1,R=!1);let F=b,s="",i="";y>0&&(s=b.slice(0,y),b=b.slice(y),m-=y),F&&R===!0&&m>0?(F=b.slice(0,m),i=b.slice(m)):R===!0?(F="",i=b):F=b,F&&F!==""&&F!=="/"&&F!==b&&ue(F.charCodeAt(F.length-1))&&(F=F.slice(0,-1)),e.unescape===!0&&(i&&(i=oe.removeBackslashes(i)),F&&w===!0&&(F=oe.removeBackslashes(F)));let V={prefix:s,input:t,start:y,base:F,glob:i,isBrace:h,isBracket:x,isGlob:R,isExtglob:N,isGlobstar:U,negated:T,negatedExtglob:d};if(e.tokens===!0&&(V.maxDepth=0,ue(E)||a.push(A),V.tokens=a),e.parts===!0||e.tokens===!0){let v;for(let D=0;D<l.length;D++){let Z=v?v+1:y,z=l[D],J=t.slice(Z,z);e.tokens&&(D===0&&y!==0?(a[D].isPrefix=!0,a[D].value=s):a[D].value=J,ae(a[D]),V.maxDepth+=a[D].depth),(D!==0||J!=="")&&p.push(J),v=z}if(v&&v+1<t.length){let D=t.slice(v+1);p.push(D),e.tokens&&(a[a.length-1].value=D,ae(a[a.length-1]),V.maxDepth+=a[a.length-1].depth)}V.slashes=l,V.parts=p}return V};le.exports=gn});var de=tt(($r,he)=>{"use strict";var mt=it(),W=yt(),{MAX_LENGTH:At,POSIX_REGEX_SOURCE:wn,REGEX_NON_SPECIAL_CHARS:Cn,REGEX_SPECIAL_CHARS_BACKREF:$n,REPLACEMENTS:pe}=mt,Tn=(t,n)=>{if(typeof n.expandRange=="function")return n.expandRange(...t,n);t.sort();let e=`[${t.join("-")}]`;try{new RegExp(e)}catch{return t.map(r=>W.escapeRegex(r)).join("..")}return e},st=(t,n)=>`Missing ${t}: "${n}" - use "\\\\${n}" to match literal characters`,It=(t,n)=>{if(typeof t!="string")throw new TypeError("Expected a string");t=pe[t]||t;let e={...n},u=typeof e.maxLength=="number"?Math.min(At,e.maxLength):At,r=t.length;if(r>u)throw new SyntaxError(`Input length: ${r}, exceeds maximum allowed length: ${u}`);let l={type:"bos",value:"",output:e.prepend||""},a=[l],p=e.capture?"":"?:",b=mt.globChars(e.windows),_=mt.extglobChars(b),{DOT_LITERAL:y,PLUS_LITERAL:m,SLASH_LITERAL:h,ONE_CHAR:x,DOTS_SLASH:R,NO_DOT:N,NO_DOT_SLASH:U,NO_DOTS_SLASH:I,QMARK:w,QMARK_NO_DOT:T,STAR:d,START_ANCHOR:S}=b,O=f=>`(${p}(?:(?!${S}${f.dot?R:y}).)*?)`,g=e.dot?"":N,E=e.dot?w:T,A=e.bash===!0?O(e):d;e.capture&&(A=`(${A})`),typeof e.noext=="boolean"&&(e.noextglob=e.noext);let o={input:t,index:-1,start:0,dot:e.dot===!0,consumed:"",output:"",prefix:"",backtrack:!1,negated:!1,brackets:0,braces:0,parens:0,quotes:0,globstar:!1,tokens:a};t=W.removePrefix(t,o),r=t.length;let X=[],G=[],F=[],s=l,i,V=()=>o.index===r-1,v=o.peek=(f=1)=>t[o.index+f],D=o.advance=()=>t[++o.index]||"",Z=()=>t.slice(o.index+1),z=(f="",H=0)=>{o.consumed+=f,o.index+=H},J=f=>{o.output+=f.output!=null?f.output:f.value,z(f.value)},Ve=()=>{let f=1;for(;v()==="!"&&(v(2)!=="("||v(3)==="?");)D(),o.start++,f++;return f%2===0?!1:(o.negated=!0,o.start++,!0)},lt=f=>{o[f]++,F.push(f)},rt=f=>{o[f]--,F.pop()},$=f=>{if(s.type==="globstar"){let H=o.braces>0&&(f.type==="comma"||f.type==="brace"),c=f.extglob===!0||X.length&&(f.type==="pipe"||f.type==="paren");f.type!=="slash"&&f.type!=="paren"&&!H&&!c&&(o.output=o.output.slice(0,-s.output.length),s.type="star",s.value="*",s.output=A,o.output+=s.output)}if(X.length&&f.type!=="paren"&&(X[X.length-1].inner+=f.value),(f.value||f.output)&&J(f),s&&s.type==="text"&&f.type==="text"){s.output=(s.output||s.value)+f.value,s.value+=f.value;return}f.prev=s,a.push(f),s=f},ft=(f,H)=>{let c={..._[H],conditions:1,inner:""};c.prev=s,c.parens=o.parens,c.output=o.output;let C=(e.capture?"(":"")+c.open;lt("parens"),$({type:f,value:H,output:o.output?"":x}),$({type:"paren",extglob:!0,value:D(),output:C}),X.push(c)},ze=f=>{let H=f.close+(e.capture?")":""),c;if(f.type==="negate"){let C=A;if(f.inner&&f.inner.length>1&&f.inner.includes("/")&&(C=O(e)),(C!==A||V()||/^\)+$/.test(Z()))&&(H=f.close=`)$))${C}`),f.inner.includes("*")&&(c=Z())&&/^\.[^\\/.]+$/.test(c)){let P=It(c,{...n,fastpaths:!1}).output;H=f.close=`)${P})${C})`}f.prev.type==="bos"&&(o.negatedExtglob=!0)}$({type:"paren",extglob:!0,value:i,output:H}),rt("parens")};if(e.fastpaths!==!1&&!/(^[*!]|[/()[\]{}"])/.test(t)){let f=!1,H=t.replace($n,(c,C,P,K,k,xt)=>K==="\\"?(f=!0,c):K==="?"?C?C+K+(k?w.repeat(k.length):""):xt===0?E+(k?w.repeat(k.length):""):w.repeat(P.length):K==="."?y.repeat(P.length):K==="*"?C?C+K+(k?A:""):A:C?c:`\\${c}`);return f===!0&&(e.unescape===!0?H=H.replace(/\\/g,""):H=H.replace(/\\+/g,c=>c.length%2===0?"\\\\":c?"\\":"")),H===t&&e.contains===!0?(o.output=t,o):(o.output=W.wrapOutput(H,o,n),o)}for(;!V();){if(i=D(),i==="\0")continue;if(i==="\\"){let c=v();if(c==="/"&&e.bash!==!0||c==="."||c===";")continue;if(!c){i+="\\",$({type:"text",value:i});continue}let C=/^\\+/.exec(Z()),P=0;if(C&&C[0].length>2&&(P=C[0].length,o.index+=P,P%2!==0&&(i+="\\")),e.unescape===!0?i=D():i+=D(),o.brackets===0){$({type:"text",value:i});continue}}if(o.brackets>0&&(i!=="]"||s.value==="["||s.value==="[^")){if(e.posix!==!1&&i===":"){let c=s.value.slice(1);if(c.includes("[")&&(s.posix=!0,c.includes(":"))){let C=s.value.lastIndexOf("["),P=s.value.slice(0,C),K=s.value.slice(C+2),k=wn[K];if(k){s.value=P+k,o.backtrack=!0,D(),!l.output&&a.indexOf(s)===1&&(l.output=x);continue}}}(i==="["&&v()!==":"||i==="-"&&v()==="]")&&(i=`\\${i}`),i==="]"&&(s.value==="["||s.value==="[^")&&(i=`\\${i}`),e.posix===!0&&i==="!"&&s.value==="["&&(i="^"),s.value+=i,J({value:i});continue}if(o.quotes===1&&i!=='"'){i=W.escapeRegex(i),s.value+=i,J({value:i});continue}if(i==='"'){o.quotes=o.quotes===1?0:1,e.keepQuotes===!0&&$({type:"text",value:i});continue}if(i==="("){lt("parens"),$({type:"paren",value:i});continue}if(i===")"){if(o.parens===0&&e.strictBrackets===!0)throw new SyntaxError(st("opening","("));let c=X[X.length-1];if(c&&o.parens===c.parens+1){ze(X.pop());continue}$({type:"paren",value:i,output:o.parens?")":"\\)"}),rt("parens");continue}if(i==="["){if(e.nobracket===!0||!Z().includes("]")){if(e.nobracket!==!0&&e.strictBrackets===!0)throw new SyntaxError(st("closing","]"));i=`\\${i}`}else lt("brackets");$({type:"bracket",value:i});continue}if(i==="]"){if(e.nobracket===!0||s&&s.type==="bracket"&&s.value.length===1){$({type:"text",value:i,output:`\\${i}`});continue}if(o.brackets===0){if(e.strictBrackets===!0)throw new SyntaxError(st("opening","["));$({type:"text",value:i,output:`\\${i}`});continue}rt("brackets");let c=s.value.slice(1);if(s.posix!==!0&&c[0]==="^"&&!c.includes("/")&&(i=`/${i}`),s.value+=i,J({value:i}),e.literalBrackets===!1||W.hasRegexChars(c))continue;let C=W.escapeRegex(s.value);if(o.output=o.output.slice(0,-s.value.length),e.literalBrackets===!0){o.output+=C,s.value=C;continue}s.value=`(${p}${C}|${s.value})`,o.output+=s.value;continue}if(i==="{"&&e.nobrace!==!0){lt("braces");let c={type:"brace",value:i,output:"(",outputIndex:o.output.length,tokensIndex:o.tokens.length};G.push(c),$(c);continue}if(i==="}"){let c=G[G.length-1];if(e.nobrace===!0||!c){$({type:"text",value:i,output:i});continue}let C=")";if(c.dots===!0){let P=a.slice(),K=[];for(let k=P.length-1;k>=0&&(a.pop(),P[k].type!=="brace");k--)P[k].type!=="dots"&&K.unshift(P[k].value);C=Tn(K,e),o.backtrack=!0}if(c.comma!==!0&&c.dots!==!0){let P=o.output.slice(0,c.outputIndex),K=o.tokens.slice(c.tokensIndex);c.value=c.output="\\{",i=C="\\}",o.output=P;for(let k of K)o.output+=k.output||k.value}$({type:"brace",value:i,output:C}),rt("braces"),G.pop();continue}if(i==="|"){X.length>0&&X[X.length-1].conditions++,$({type:"text",value:i});continue}if(i===","){let c=i,C=G[G.length-1];C&&F[F.length-1]==="braces"&&(C.comma=!0,c="|"),$({type:"comma",value:i,output:c});continue}if(i==="/"){if(s.type==="dot"&&o.index===o.start+1){o.start=o.index+1,o.consumed="",o.output="",a.pop(),s=l;continue}$({type:"slash",value:i,output:h});continue}if(i==="."){if(o.braces>0&&s.type==="dot"){s.value==="."&&(s.output=y);let c=G[G.length-1];s.type="dots",s.output+=i,s.value+=i,c.dots=!0;continue}if(o.braces+o.parens===0&&s.type!=="bos"&&s.type!=="slash"){$({type:"text",value:i,output:y});continue}$({type:"dot",value:i,output:y});continue}if(i==="?"){if(!(s&&s.value==="(")&&e.noextglob!==!0&&v()==="("&&v(2)!=="?"){ft("qmark",i);continue}if(s&&s.type==="paren"){let C=v(),P=i;(s.value==="("&&!/[!=<:]/.test(C)||C==="<"&&!/<([!=]|\w+>)/.test(Z()))&&(P=`\\${i}`),$({type:"text",value:i,output:P});continue}if(e.dot!==!0&&(s.type==="slash"||s.type==="bos")){$({type:"qmark",value:i,output:T});continue}$({type:"qmark",value:i,output:w});continue}if(i==="!"){if(e.noextglob!==!0&&v()==="("&&(v(2)!=="?"||!/[!=<:]/.test(v(3)))){ft("negate",i);continue}if(e.nonegate!==!0&&o.index===0){Ve();continue}}if(i==="+"){if(e.noextglob!==!0&&v()==="("&&v(2)!=="?"){ft("plus",i);continue}if(s&&s.value==="("||e.regex===!1){$({type:"plus",value:i,output:m});continue}if(s&&(s.type==="bracket"||s.type==="paren"||s.type==="brace")||o.parens>0){$({type:"plus",value:i});continue}$({type:"plus",value:m});continue}if(i==="@"){if(e.noextglob!==!0&&v()==="("&&v(2)!=="?"){$({type:"at",extglob:!0,value:i,output:""});continue}$({type:"text",value:i});continue}if(i!=="*"){(i==="$"||i==="^")&&(i=`\\${i}`);let c=Cn.exec(Z());c&&(i+=c[0],o.index+=c[0].length),$({type:"text",value:i});continue}if(s&&(s.type==="globstar"||s.star===!0)){s.type="star",s.star=!0,s.value+=i,s.output=A,o.backtrack=!0,o.globstar=!0,z(i);continue}let f=Z();if(e.noextglob!==!0&&/^\([^?]/.test(f)){ft("star",i);continue}if(s.type==="star"){if(e.noglobstar===!0){z(i);continue}let c=s.prev,C=c.prev,P=c.type==="slash"||c.type==="bos",K=C&&(C.type==="star"||C.type==="globstar");if(e.bash===!0&&(!P||f[0]&&f[0]!=="/")){$({type:"star",value:i,output:""});continue}let k=o.braces>0&&(c.type==="comma"||c.type==="brace"),xt=X.length&&(c.type==="pipe"||c.type==="paren");if(!P&&c.type!=="paren"&&!k&&!xt){$({type:"star",value:i,output:""});continue}for(;f.slice(0,3)==="/**";){let pt=t[o.index+4];if(pt&&pt!=="/")break;f=f.slice(3),z("/**",3)}if(c.type==="bos"&&V()){s.type="globstar",s.value+=i,s.output=O(e),o.output=s.output,o.globstar=!0,z(i);continue}if(c.type==="slash"&&c.prev.type!=="bos"&&!K&&V()){o.output=o.output.slice(0,-(c.output+s.output).length),c.output=`(?:${c.output}`,s.type="globstar",s.output=O(e)+(e.strictSlashes?")":"|$)"),s.value+=i,o.globstar=!0,o.output+=c.output+s.output,z(i);continue}if(c.type==="slash"&&c.prev.type!=="bos"&&f[0]==="/"){let pt=f[1]!==void 0?"|$":"";o.output=o.output.slice(0,-(c.output+s.output).length),c.output=`(?:${c.output}`,s.type="globstar",s.output=`${O(e)}${h}|${h}${pt})`,s.value+=i,o.output+=c.output+s.output,o.globstar=!0,z(i+D()),$({type:"slash",value:"/",output:""});continue}if(c.type==="bos"&&f[0]==="/"){s.type="globstar",s.value+=i,s.output=`(?:^|${h}|${O(e)}${h})`,o.output=s.output,o.globstar=!0,z(i+D()),$({type:"slash",value:"/",output:""});continue}o.output=o.output.slice(0,-s.output.length),s.type="globstar",s.output=O(e),s.value+=i,o.output+=s.output,o.globstar=!0,z(i);continue}let H={type:"star",value:i,output:A};if(e.bash===!0){H.output=".*?",(s.type==="bos"||s.type==="slash")&&(H.output=g+H.output),$(H);continue}if(s&&(s.type==="bracket"||s.type==="paren")&&e.regex===!0){H.output=i,$(H);continue}(o.index===o.start||s.type==="slash"||s.type==="dot")&&(s.type==="dot"?(o.output+=U,s.output+=U):e.dot===!0?(o.output+=I,s.output+=I):(o.output+=g,s.output+=g),v()!=="*"&&(o.output+=x,s.output+=x)),$(H)}for(;o.brackets>0;){if(e.strictBrackets===!0)throw new SyntaxError(st("closing","]"));o.output=W.escapeLast(o.output,"["),rt("brackets")}for(;o.parens>0;){if(e.strictBrackets===!0)throw new SyntaxError(st("closing",")"));o.output=W.escapeLast(o.output,"("),rt("parens")}for(;o.braces>0;){if(e.strictBrackets===!0)throw new SyntaxError(st("closing","}"));o.output=W.escapeLast(o.output,"{"),rt("braces")}if(e.strictSlashes!==!0&&(s.type==="star"||s.type==="bracket")&&$({type:"maybe_slash",value:"",output:`${h}?`}),o.backtrack===!0){o.output="";for(let f of o.tokens)o.output+=f.output!=null?f.output:f.value,f.suffix&&(o.output+=f.suffix)}return o};It.fastpaths=(t,n)=>{let e={...n},u=typeof e.maxLength=="number"?Math.min(At,e.maxLength):At,r=t.length;if(r>u)throw new SyntaxError(`Input length: ${r}, exceeds maximum allowed length: ${u}`);t=pe[t]||t;let{DOT_LITERAL:l,SLASH_LITERAL:a,ONE_CHAR:p,DOTS_SLASH:b,NO_DOT:_,NO_DOTS:y,NO_DOTS_SLASH:m,STAR:h,START_ANCHOR:x}=mt.globChars(e.windows),R=e.dot?y:_,N=e.dot?m:_,U=e.capture?"":"?:",I={negated:!1,prefix:""},w=e.bash===!0?".*?":h;e.capture&&(w=`(${w})`);let T=g=>g.noglobstar===!0?w:`(${U}(?:(?!${x}${g.dot?b:l}).)*?)`,d=g=>{switch(g){case"*":return`${R}${p}${w}`;case".*":return`${l}${p}${w}`;case"*.*":return`${R}${w}${l}${p}${w}`;case"*/*":return`${R}${w}${a}${p}${N}${w}`;case"**":return R+T(e);case"**/*":return`(?:${R}${T(e)}${a})?${N}${p}${w}`;case"**/*.*":return`(?:${R}${T(e)}${a})?${N}${w}${l}${p}${w}`;case"**/.*":return`(?:${R}${T(e)}${a})?${l}${p}${w}`;default:{let E=/^(.*?)\.(\w+)$/.exec(g);if(!E)return;let A=d(E[1]);return A?A+l+E[2]:void 0}}},S=W.removePrefix(t,I),O=d(S);return O&&e.strictSlashes!==!0&&(O+=`${a}?`),O};he.exports=It});var Ae=tt((Tr,me)=>{"use strict";var On=fe(),Lt=de(),ye=yt(),vn=it(),In=t=>t&&typeof t=="object"&&!Array.isArray(t),B=(t,n,e=!1)=>{if(Array.isArray(t)){let y=t.map(h=>B(h,n,e));return h=>{for(let x of y){let R=x(h);if(R)return R}return!1}}let u=In(t)&&t.tokens&&t.input;if(t===""||typeof t!="string"&&!u)throw new TypeError("Expected pattern to be a non-empty string");let r=n||{},l=r.windows,a=u?B.compileRe(t,n):B.makeRe(t,n,!1,!0),p=a.state;delete a.state;let b=()=>!1;if(r.ignore){let y={...n,ignore:null,onMatch:null,onResult:null};b=B(r.ignore,y,e)}let _=(y,m=!1)=>{let{isMatch:h,match:x,output:R}=B.test(y,a,n,{glob:t,posix:l}),N={glob:t,state:p,regex:a,posix:l,input:y,output:R,match:x,isMatch:h};return typeof r.onResult=="function"&&r.onResult(N),h===!1?(N.isMatch=!1,m?N:!1):b(y)?(typeof r.onIgnore=="function"&&r.onIgnore(N),N.isMatch=!1,m?N:!1):(typeof r.onMatch=="function"&&r.onMatch(N),m?N:!0)};return e&&(_.state=p),_};B.test=(t,n,e,{glob:u,posix:r}={})=>{if(typeof t!="string")throw new TypeError("Expected input to be a string");if(t==="")return{isMatch:!1,output:""};let l=e||{},a=l.format||(r?ye.toPosixSlashes:null),p=t===u,b=p&&a?a(t):t;return p===!1&&(b=a?a(t):t,p=b===u),(p===!1||l.capture===!0)&&(l.matchBase===!0||l.basename===!0?p=B.matchBase(t,n,e,r):p=n.exec(b)),{isMatch:!!p,match:p,output:b}};B.matchBase=(t,n,e)=>(n instanceof RegExp?n:B.makeRe(n,e)).test(ye.basename(t));B.isMatch=(t,n,e)=>B(n,e)(t);B.parse=(t,n)=>Array.isArray(t)?t.map(e=>B.parse(e,n)):Lt(t,{...n,fastpaths:!1});B.scan=(t,n)=>On(t,n);B.compileRe=(t,n,e=!1,u=!1)=>{if(e===!0)return t.output;let r=n||{},l=r.contains?"":"^",a=r.contains?"":"$",p=`${l}(?:${t.output})${a}`;t&&t.negated===!0&&(p=`^(?!${p}).*$`);let b=B.toRegex(p,n);return u===!0&&(b.state=t),b};B.makeRe=(t,n={},e=!1,u=!1)=>{if(!t||typeof t!="string")throw new TypeError("Expected a non-empty string");let r={negated:!1,fastpaths:!0};return n.fastpaths!==!1&&(t[0]==="."||t[0]==="*")&&(r.output=Lt.fastpaths(t,n)),r.output||(r=Lt(t,n)),B.compileRe(r,n,e,u)};B.toRegex=(t,n)=>{try{let e=n||{};return new RegExp(t,e.flags||(e.nocase?"i":""))}catch(e){if(n&&n.debug===!0)throw e;return/$^/}};B.constants=vn;me.exports=B});var Ht=tt((Or,_e)=>{"use strict";var be=Ae(),Ln=()=>{if(typeof navigator<"u"&&navigator.platform){let t=navigator.platform.toLowerCase();return t==="win32"||t==="windows"}return typeof process<"u"&&process.platform?process.platform==="win32":!1};function Ee(t,n,e=!1){return n&&(n.windows===null||n.windows===void 0)&&(n={...n,windows:Ln()}),be(t,n,e)}Object.assign(Ee,be);_e.exports=Ee});var Oe=tt(nt=>{"use strict";var kn=nt&&nt.__awaiter||function(t,n,e,u){function r(l){return l instanceof e?l:new e(function(a){a(l)})}return new(e||(e=Promise))(function(l,a){function p(y){try{_(u.next(y))}catch(m){a(m)}}function b(y){try{_(u.throw(y))}catch(m){a(m)}}function _(y){y.done?l(y.value):r(y.value).then(p,b)}_((u=u.apply(t,n||[])).next())})};Object.defineProperty(nt,"__esModule",{value:!0});nt.isBinaryFileSync=nt.isBinaryFile=void 0;var et=zt("fs"),Ft=zt("util"),Un=(0,Ft.promisify)(et.stat),Kn=(0,Ft.promisify)(et.open),Xn=(0,Ft.promisify)(et.close),at=512,Mt=class{constructor(n,e){this.fileBuffer=n,this.size=e,this.offset=0,this.error=!1}hasError(){return this.error}nextByte(){return this.offset===this.size||this.hasError()?(this.error=!0,255):this.fileBuffer[this.offset++]}next(n){let e=new Array;for(let u=0;u<n;u++)e[u]=this.nextByte();return e}};function Pt(t){let n=0,e=0;for(;!t.hasError();){let u=t.nextByte();if(e=e|(u&127)<<7*n,!(u&128))break;n++}return e}function qn(t){switch(Pt(t)&7){case 0:return Pt(t),!0;case 1:return t.next(8),!0;case 2:let u=Pt(t);return t.next(u),!0;case 5:return t.next(4),!0}return!1}function Vn(t,n){let e=new Mt(t,n),u=0;for(;;){if(!qn(e)&&!e.hasError())return!1;if(e.hasError())break;u++}return u>0}function zn(t,n){return kn(this,void 0,void 0,function*(){if($e(t)){let e=yield Un(t);Te(e);let u=yield Kn(t,"r"),r=Buffer.alloc(at);return new Promise((l,a)=>{et.read(u,r,0,at,0,(p,b,_)=>{Xn(u),p?a(p):l(bt(r,b))})})}else return n===void 0&&(n=t.length),bt(t,n)})}nt.isBinaryFile=zn;function Yn(t,n){if($e(t)){let e=et.statSync(t);Te(e);let u=et.openSync(t,"r"),r=Buffer.alloc(at),l=et.readSync(u,r,0,at,0);return et.closeSync(u),bt(r,l)}else return n===void 0&&(n=t.length),bt(t,n)}nt.isBinaryFileSync=Yn;function bt(t,n){if(n===0)return!1;let e=0,u=Math.min(n,at);if(n>=3&&t[0]===239&&t[1]===187&&t[2]===191||n>=4&&t[0]===0&&t[1]===0&&t[2]===254&&t[3]===255||n>=4&&t[0]===255&&t[1]===254&&t[2]===0&&t[3]===0||n>=4&&t[0]===132&&t[1]===49&&t[2]===149&&t[3]===51)return!1;if(u>=5&&t.slice(0,5).toString()==="%PDF-")return!0;if(n>=2&&t[0]===254&&t[1]===255||n>=2&&t[0]===255&&t[1]===254)return!1;for(let r=0;r<u;r++){if(t[r]===0)return!0;if((t[r]<7||t[r]>14)&&(t[r]<32||t[r]>127)){if(t[r]>193&&t[r]<224&&r+1<u){if(r++,t[r]>127&&t[r]<192)continue}else if(t[r]>223&&t[r]<240&&r+2<u&&(r++,t[r]>127&&t[r]<192&&t[r+1]>127&&t[r+1]<192)){r++;continue}if(e++,r>=32&&e*100/u>10)return!0}}return!!(e*100/u>10||e>1&&Vn(t,u))}function $e(t){return typeof t=="string"}function Te(t){if(!t.isFile())throw new Error("Path provided was not a file!")}});var ke=ht(Zt(),1);async function St(t,n,{concurrency:e=Number.POSITIVE_INFINITY,stopOnError:u=!0,signal:r}={}){return new Promise((l,a)=>{if(t[Symbol.iterator]===void 0&&t[Symbol.asyncIterator]===void 0)throw new TypeError(`Expected \`input\` to be either an \`Iterable\` or \`AsyncIterable\`, got (${typeof t})`);if(typeof n!="function")throw new TypeError("Mapper function is required");if(!(Number.isSafeInteger(e)&&e>=1||e===Number.POSITIVE_INFINITY))throw new TypeError(`Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${e}\` (${typeof e})`);let p=[],b=[],_=new Map,y=!1,m=!1,h=!1,x=0,R=0,N=t[Symbol.iterator]===void 0?t[Symbol.asyncIterator]():t[Symbol.iterator](),U=w=>{y=!0,m=!0,a(w)};r&&(r.aborted&&U(r.reason),r.addEventListener("abort",()=>{U(r.reason)}));let I=async()=>{if(m)return;let w=await N.next(),T=R;if(R++,w.done){if(h=!0,x===0&&!m){if(!u&&b.length>0){U(new AggregateError(b));return}if(m=!0,_.size===0){l(p);return}let d=[];for(let[S,O]of p.entries())_.get(S)!==jt&&d.push(O);l(d)}return}x++,(async()=>{try{let d=await w.value;if(m)return;let S=await n(d,T);S===jt&&_.set(T,S),p[T]=S,x--,await I()}catch(d){if(u)U(d);else{b.push(d),x--;try{await I()}catch(S){U(S)}}}})()};(async()=>{for(let w=0;w<e;w++){try{await I()}catch(T){U(T);break}if(h||y)break}})()})}var jt=Symbol("skip");import{readdir as Hn,stat as Re,lstat as Nn}from"node:fs/promises";var Nt=ht(Ht(),1);import{sep as Ce,resolve as xe}from"node:path";var Se=new TextEncoder,Dn=Se.encode.bind(Se),ge=new TextDecoder,we=ge.decode.bind(ge),Pn=Dn(Ce),Mn={strict:!1,stats:!1,followSymlinks:!1,exclude:void 0,include:void 0,insensitive:!1};function Fn(t,n,e){return e==="buffer"?n==="."?t.name:Uint8Array.from([...n,...Pn,...t.name]):n==="."?t.name:`${n}${Ce}${t.name}`}function Bn(t,n,e,u){return{path:n,directory:(e||t).isDirectory(),symlink:(e||t).isSymbolicLink(),...u.stats?{stats:e}:{}}}function Gn({include:t,exclude:n,insensitive:e}){let u={dot:!0,flags:e?"i":void 0};return{includeMatcher:t?.length?r=>(0,Nt.default)(t,u)(xe(r)):null,excludeMatcher:n?.length?r=>(0,Nt.default)(n,u)(xe(r)):null}}async function*Dt(t,n={},{includeMatcher:e,excludeMatcher:u,encoding:r}={}){e===void 0&&(n={...Mn,...n},{includeMatcher:e,excludeMatcher:u}=Gn(n),/[/\\]$/.test(t)&&(t=t.substring(0,t.length-1)),r=t instanceof Uint8Array?"buffer":void 0);let l=[];try{l=await Hn(t,{encoding:r,withFileTypes:!0})}catch(a){if(n.strict)throw a;yield{path:t,err:a}}if(l.length)for(let a of l){let p=Fn(a,t,r);if(u?.(r==="buffer"?we(p):p))continue;let b=n.followSymlinks&&a.isSymbolicLink(),_=r==="buffer"?we(p):p,y=!e||e(_),m;if(y){if(n.stats||b)try{m=await(n.followSymlinks?Re:Nn)(p)}catch(x){if(n.strict)throw x;yield{path:p,err:x}}yield Bn(a,p,m,n)}let h=!1;if(b){if(!m)try{m=await Re(p)}catch{}m&&m.isDirectory()&&(h=!0)}else a.isDirectory()&&(h=!0);h&&(yield*await Dt(p,n,{includeMatcher:e,excludeMatcher:u,encoding:r}))}}var Ke=ht(Oe(),1);import{constants as ot,gzip as tr,brotliCompress as er}from"node:zlib";import Fe from"node:os";import{argv as nr,exit as rr,versions as or}from"node:process";import{promisify as Ue}from"node:util";import{stat as ct,readFile as sr,writeFile as ir,realpath as ur,mkdir as ar,unlink as cr}from"node:fs/promises";import{extname as lr,relative as fr,join as pr,dirname as hr}from"node:path";import{readFileSync as dr}from"node:fs";import Bt from"node:process";import Qn from"node:os";import ve from"node:tty";function Y(t,n=globalThis.Deno?globalThis.Deno.args:Bt.argv){let e=t.startsWith("-")?"":t.length===1?"-":"--",u=n.indexOf(e+t),r=n.indexOf("--");return u!==-1&&(r===-1||u<r)}var{env:M}=Bt,Et;Y("no-color")||Y("no-colors")||Y("color=false")||Y("color=never")?Et=0:(Y("color")||Y("colors")||Y("color=true")||Y("color=always"))&&(Et=1);function Wn(){if("FORCE_COLOR"in M)return M.FORCE_COLOR==="true"?1:M.FORCE_COLOR==="false"?0:M.FORCE_COLOR.length===0?1:Math.min(Number.parseInt(M.FORCE_COLOR,10),3)}function Zn(t){return t===0?!1:{level:t,hasBasic:!0,has256:t>=2,has16m:t>=3}}function jn(t,{streamIsTTY:n,sniffFlags:e=!0}={}){let u=Wn();u!==void 0&&(Et=u);let r=e?Et:u;if(r===0)return 0;if(e){if(Y("color=16m")||Y("color=full")||Y("color=truecolor"))return 3;if(Y("color=256"))return 2}if("TF_BUILD"in M&&"AGENT_NAME"in M)return 1;if(t&&!n&&r===void 0)return 0;let l=r||0;if(M.TERM==="dumb")return l;if(Bt.platform==="win32"){let a=Qn.release().split(".");return Number(a[0])>=10&&Number(a[2])>=10586?Number(a[2])>=14931?3:2:1}if("CI"in M)return"GITHUB_ACTIONS"in M||"GITEA_ACTIONS"in M?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some(a=>a in M)||M.CI_NAME==="codeship"?1:l;if("TEAMCITY_VERSION"in M)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(M.TEAMCITY_VERSION)?1:0;if(M.COLORTERM==="truecolor"||M.TERM==="xterm-kitty")return 3;if("TERM_PROGRAM"in M){let a=Number.parseInt((M.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(M.TERM_PROGRAM){case"iTerm.app":return a>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(M.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(M.TERM)||"COLORTERM"in M?1:l}function Ie(t,n={}){let e=jn(t,{streamIsTTY:t&&t.isTTY,...n});return Zn(e)}var Jn={stdout:Ie({isTTY:ve.isatty(1)}),stderr:Ie({isTTY:ve.isatty(2)})},Le=Jn;var He=!0;function Ne(){He=!1}function _t(t,n,e){return He?`\x1B[${n}m${t.join(" ")}\x1B[${e}m`:t.join(" ")}var De=(...t)=>_t(t,31,39),Gt=(...t)=>_t(t,32,39),Pe=(...t)=>_t(t,33,39);var Me=(...t)=>_t(t,35,39);var kt=ht(Ht(),1),Xe=["**.gz","**.br"],Ut=Fe.availableParallelism?.()??Fe.cpus().length??4;or?.uv&&Ut>4&&(process.env.UV_THREADPOOL_SIZE=String(Ut));var L=(0,ke.default)(nr.slice(2),{boolean:["d","delete","E","extensionless","f","follow","h","help","m","mtime","s","silent","S","sensitive","v","version","V","verbose"],string:["b","basedir","o","outdir","t","types","_"],number:["c","concurrency"],alias:{b:"basedir",c:"concurrency",d:"delete",e:"exclude",E:"extensionless",h:"help",i:"include",o:"outdir",m:"mtime",s:"silent",S:"sensitive",t:"types",v:"version",V:"verbose"}});Le.stdout||Ne();function Rt(t){t&&console.error(t.stack||t.message||t),rr(t?1:0)}var Kt="12.0.3";Kt||(Kt=JSON.parse(dr(new URL("package.json",import.meta.url))).version);L.version&&(console.info("12.0.3"),Rt());(!L._.length||L.help)&&(console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>    Types of files to generate. Default: gz,br
    -i, --include <glob,...>  Only include given globs. Default: unset
    -e, --exclude <glob,...>  Exclude given globs. Default: ${Xe}
    -m, --mtime               Skip creating existing files when source file is newer
    -f, --follow              Follow symbolic links
    -d, --delete              Delete source file after compression
    -o, --outdir              Output directory, will preserve relative path structure
    -b, --basedir             Base directory to derive output path, use with --outdir
    -E, --extensionless       Do not output a extension, use with single --type and --outdir
    -s, --silent              Do not print anything
    -S, --sensitive           Treat include and exclude patterns case-sensitively
    -c, --concurrency <num>   Number of concurrent operations. Default: auto
    -V, --verbose             Print individual file compression times
    -h, --help                Show this text
    -v, --version             Show the version

  Examples:
    $ precompress ./build`),Rt());function yr(t,n){return lr(n).toLowerCase()===".woff2"?ot.BROTLI_MODE_FONT:(0,Ke.isBinaryFileSync)(t)?ot.BROTLI_MODE_GENERIC:ot.BROTLI_MODE_TEXT}function mr(t,n){let e=(n.byteLength/t.byteLength*100).toPrecision(3);return e<=80?`(${Gt(`${e}%`)} size)`:e<100?`(${Pe(`${e}%`)} size)`:`(${De(`${e}%`)} size)`}var qe=L.types?L.types.split(","):["gz","br"],Xt=qe.includes("gz")&&((t,n)=>Ue(tr)(t,{level:ot.Z_BEST_COMPRESSION})),qt=qe.includes("br")&&((t,n)=>Ue(er)(t,{params:{[ot.BROTLI_PARAM_MODE]:yr(t,n),[ot.BROTLI_PARAM_QUALITY]:ot.BROTLI_MAX_QUALITY}}));function Be(t){return typeof t=="boolean"||!t?[]:(Array.isArray(t)?t:[t]).flatMap(n=>n.split(",")).filter(Boolean)}function Ar(t,n){let e=L.basedir?fr(L.basedir,t):t,u=L.outdir?pr(L.outdir,e):e;return L.extensionless?u:`${u}.${n}`}async function Ge(t,n,e,u){let r=Ar(n,u),l=await(u==="gz"?Xt:qt)(t,n);if(await ar(hr(r),{recursive:!0}),await ir(r,l),L.delete&&await cr(n),e){let a=Math.round(performance.now()-e),p=mr(t,l);console.info(`\u2713 compressed ${Me(r)} in ${a}ms ${p}`)}}async function br(t){let n=L.silent||!L.verbose?null:performance.now(),e=!1,u=!1;if(L.mtime&&Xt)try{let[r,l]=await Promise.all([ct(t),ct(`${t}.gz`)]);r&&l&&l.mtime>r.mtime&&(e=!0)}catch{}if(L.mtime&&qt)try{let[r,l]=await Promise.all([ct(t),ct(`${t}.br`)]);r&&l&&l.mtime>r.mtime&&(u=!0)}catch{}if(!(e&&u))try{let r=await sr(t);!e&&Xt&&await Ge(r,t,n,"gz"),!u&&qt&&await Ge(r,t,n,"br")}catch(r){console.info(`Error on ${t}: ${r.code} ${r.message}`)}}function Er(t,n,e){return e?.(t)?!1:n?n(t):!0}async function _r(){let t=L.silent?null:performance.now(),n=new Set(Be(L.include)),e=new Set([...Xe,...Be(L.exclude)]),u={include:n.size?Array.from(n):null,exclude:e.size?Array.from(e):null,followSymlinks:L.follow,insensitive:!L.sensitive},r={dot:!0,flags:L.sensitive?"i":void 0},l=n.size&&(0,kt.default)(Array.from(n),r),a=e.size&&(0,kt.default)(Array.from(e),r),p=[];for(let y of L._)if((await ct(y)).isDirectory())for await(let h of Dt(y,u))h.directory||p.push(h.path);else Er(y,l,a)&&p.push(L.follow?await ur(y):y);let b=`${p.length} file${p.length>1?"s":""}`;if(!p.length)throw new Error("No matching files found");L.silent||console.info(`precompress ${Kt} compressing ${b}...`);let _=L.concurrency>0?L.concurrency:Math.min(p.length,Ut);await St(p,br,{concurrency:_}),t&&console.info(Gt(`\u2713 ${b} done in ${Math.round(performance.now()-t)}ms`))}_r().then(Rt).catch(Rt);