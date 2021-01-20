/* jeForth 4.01 A minimal Forth in Javascript
2021/1/8    Chen-Hanson Ting
    colon words have word lists in parameter fields. 
2021/1/7    Chen-Hanson Ting update for svfig
    execute-next-nest-exit, quit loop 
2011/12/23 initial version by yapcheahshen@gmail.com */
"uses strict";
(function() {
    function KsanaVm(dictsize) {
    var ip=0, wp=0, w=0; // instruction pointer
    var stack = [] , rstack =[];         // array allows push and pop
    var tib="", ntib=0 , here=4;
    var token="";
    var compiling=false;
    this.ticktype=0;                     // 'type vector
    var newname,newxt;                   // for word under construction
  function reset() { stack=[]; rstack=[];}
  function nexttoken() {
    token="";
    while (tib.substr(ntib,1)==' ') ntib++;
    while (ntib<tib.length && tib.substr(ntib,1)!=' ') token+=tib.substr(ntib++,1);
    if (token==="") { throw("<"+stack.join(" ")+">ok");}
    return token;}
  function findword(name) {
    for (var i=words.length-1;i>0;i--) {if (words[i].name===name) return i;}
    return -1;}
  function dictcompile(n) {words[words.length-1].pf.push(n);} 
  function compilecode(nword) { 
    if ( typeof(nword) ==="string" ) {var n=findword(nword); }
    else n=nword;
    if (n>-1) dictcompile(n);
    else {reset(); throw(" "+nword+"?");}}
  function execute(n){w=n;words[n].xt();}
  function next(){setTimeout(function() {try{var n=words[wp].pf[ip++];execute(n);} catch(e) { }}, 0);}
  function exit(){ip=rstack.pop();wp=rstack.pop();next();}
  function nest(){rstack.push(wp);rstack.push(ip);wp=w;ip=0;next();}
  function exectoken(cmd){               // outer loop
    var n=parseInt(cmd);                 // convert to number
    var nword=findword(cmd);
    if (nword>-1) { 
      if (compiling && !words[nword].immediate) {dictcompile(nword);}
      else {execute(nword);}}               // nest, docon, dovar need pf
    else if (n || token==0) {                        // if the token is a number
      if (compiling) {    
        compilecode("dolit");            // compile an literal
        dictcompile(n); }
      else {stack.push(n);}}
    else {reset();throw(" "+cmd+"?");}} 
  function exec(cmd) {                   // : quit begin token exec again ;
    tib=cmd;ntib=0;wp=0;ip=0;w=0;compiling=false;execute(0);}
  var words = [
    {name:"quit" ,xt:function(){nest();},pf:[1,2,3,0]}
   ,{name:"token",xt:function(){token=nexttoken();next();}}
   ,{name:"exec" ,xt:function(){exectoken(token);next();}}
   ,{name:"bran" ,xt:function(){ip=words[wp].pf[ip];next();}}
   ,{name:"here" ,xt:function(){stack.push(here);next();}}
   ,{name:","    ,xt:function(){dictcompile(stack.pop());next();}}
   ,{name:"dolit",xt:function(){stack.push(words[wp].pf[ip++]);next();}}
   ,{name:"ret"  ,xt:function(){exit();}}
   ,{name:":"    ,xt:function(){newname=nexttoken();compiling=true;
                     words.push({name:newname,xt:function(){nest(this.pf);},pf:[]});next();}}
   ,{name:";"    ,xt:function(){compiling=false;compilecode("ret");next();},immediate:true}
   ,{name:"*"    ,xt:function(){stack.push(stack.pop()*stack.pop());next();}}
   ,{name:"."    ,xt:function(){ticktype(stack.pop()+" ");next();}}
   ,{name:"dup"  ,xt:function(){stack.push(stack[stack.length-1]);next();next();}}
   ]
  this.exec= exec;  // make exec become a public interface
  }
window.KsanaVm=KsanaVm;  // export KsanaVm as a global variable 
})();
