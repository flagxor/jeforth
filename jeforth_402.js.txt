
/* jeForth 4.01 A minimal Forth in Javascript
2021/1/8    Chen-Hanson Ting
    colon words have word lists in parameter fields. 
2021/1/7    Chen-Hanson Ting update for svfig
    execute-next-nest-exit, quit loop 
2011/12/23 initial version by yapcheahshen@gmail.com */
"uses strict";
(function() {
    function KsanaVm(dictsize) {
    var ip=0,wp=0,w=0; // instruction pointer
    var stack=[],rstack=[];         // array allows push and pop
    var tib="",ntib=0,base=10;
    var token="";
    var compiling=false;
    this.ticktype=0;                     // 'type vector
    var newname,newxt;                   // for word under construction
  function cr(){ticktype("<br/>\n");}
  function reset() { stack=[]; rstack=[];}
   function nexttoken(deli){
       token=""; 
       if (deli===undefined) deli=" "; 
       while (tib.charCodeAt(ntib)<=32) ntib++;
       while(ntib<tib.length && tib.substr(ntib,1)!=deli && tib.substr(ntib,1)!="\n") {
         token+=tib.substr(ntib++,1); }
       if (deli!=" ") ntib++;
       if (token==="") throw("<"+stack.join(" ")+">ok");
       return token;
   }
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
  function next(){var n=words[wp].pf[ip++];execute(n);}
  function exit(){ip=rstack.pop();wp=rstack.pop();next();}
  function nest(){rstack.push(wp);rstack.push(ip);wp=w;ip=0;next();}
  function dovar(){stack.push(w);next();}
  function docon(){stack.push(words[w].pf[0]);next();}
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
  function tick(){token=nexttoken(); var i=findword(token); if(i>=0)stack.push(i);
      else throw(" "+token)+" ? ";}
  function exec(cmd) {                   // : quit begin token exec again ;
    tib=cmd;ntib=0;wp=0;ip=0;w=0;compiling=false;execute(0);}
  var words = [
    {name:"quit" ,xt:function(){nest();},pf:[1,2,3,0]}
   ,{name:"token",xt:function(){token=nexttoken();next();}}
   ,{name:"exec" ,xt:function(){exectoken(token);next();}}
   ,{name:"bran" ,xt:function(){ip=words[wp].pf[ip];next();}}
   ,{name:"here" ,xt:function(){stack.push(words.length);next();}}
   ,{name:","    ,xt:function(){dictcompile(stack.pop());next();}}
   ,{name:"dolit",xt:function(){stack.push(words[wp].pf[ip++]);next();}}
   ,{name:"exit"  ,xt:function(){exit();}}
   ,{name:":"    ,xt:function(){newname=nexttoken();compiling=true;
                     words.push({name:newname,xt:function(){nest();},pf:[]});next();}}
   ,{name:";"    ,xt:function(){compiling=false;compilecode("exit");next();},immediate:true}
   ,{name:"."    ,xt:function(){ticktype(stack.pop()+" ");next();}}
  ,{name:"dup"     ,xt:function(){ // dup    ( n -- n n ) 
      stack.push(stack[stack.length-1]);next();}}
  ,{name:"drop"    ,xt:function(){ // drop    ( n -- ) 
      stack.pop();next();}}
  ,{name:"@"    ,xt:function(){ // @ ( w -- n ) 
     var a=stack.pop();stack.push(words[a].pf[0]);next();}}
  ,{name:"!"    ,xt:function(){ // ! ( n w -- ) 
     var a=stack.pop();words[a].pf[0]=stack.pop();next();}}
  ,{name:"swap"     ,xt:function(){ // swap    ( a b -- b a )
      var t=stack.length-1; var b=stack[t]; stack[t]=stack[t-1]; stack[t-1]=b;next();}}
  ,{name:"over"     ,xt:function(){ // dup    ( n -- n n ) 
      stack.push(stack[stack.length-2]);next();}}
  ,{name:"nip"     ,xt:function(){ // nip    ( a b -- b )
      stack[stack.length-2]=stack.pop();next();}}
  ,{name:"rot"     ,xt:function(){ // rot    ( a b c -- b c a )
      var t=stack.length-1; var a=stack[t-2]; stack[t-2]=stack[t-1]; stack[t-1]=stack[t]; stack[t]=a;next();}}
  ,{name:"-rot"     ,xt:function(){ // rot    ( a b c -- c a b )
      var t=stack.length-1; var a=stack[t-2]; stack[t-2]=stack[t]; stack[t]=stack[t-1]; stack[t-1]=a;next();}}
  ,{name:"pick"     ,xt:function(){ // pick    ( nj ... n1 n0 j -- nj ... n1 n0 nj )
      var t=stack.length-1; var j=stack[t]; stack[t]=stack[t-j-1];next();}}
  ,{name:"roll"     ,xt:function(){ // roll    ( nj ... n1 n0 j -- ... n1 n0 nj )
      var j=stack.pop();
      if(j>0){
        var t=stack.length-1;
        var nj=stack[t-j];
        for(i=j-1;i>=0;i--) stack[t-i-1]=stack[t-i];
      stack[t]=nj;next();}}}
  ,{name:"2dup"     ,xt:function(){ // swap    ( a b -- b a )
      stack.push(stack[stack.length-2]);stack.push(stack[stack.length-2]);next();}}
  ,{name:"2drop"    ,xt:function(){ // drop    ( n -- ) 
      stack.pop();stack.pop();next();}}
  ,{name:">r"     ,xt:function(){ // >r    ( n -- )
      rstack.push(stack.pop());next();}}
  ,{name:"r>"     ,xt:function(){ // r>    ( -- n )
      stack.push(rstack.pop());next();}}
  ,{name:"r@"     ,xt:function(){ // r>    ( -- i )
      stack.push(rstack[rstack.length-1]);next();}}
  ,{name:"push"     ,xt:function(){ // >r    ( n -- )
      rstack.push(stack.pop());next();}}
  ,{name:"pop"     ,xt:function(){ // r>    ( -- n )
      stack.push(rstack.pop());next();}}
  ,{name:"and"    ,xt:function(){ 
      stack.push(stack.pop() & stack.pop());next();}}
  ,{name:"or"    ,xt:function(){ 
      stack.push(stack.pop() | stack.pop());next();}}
  ,{name:"xor"    ,xt:function(){ 
      stack.push(stack.pop() ^ stack.pop());next();}}
  ,{name:"negate"    ,xt:function(){ 
      stack.push(0-stack.pop());next();}}
  ,{name:"2*"    ,xt:function(){ 
      stack.push(stack.pop()<<1);next();}}
  ,{name:"2/"    ,xt:function(){ 
      stack.push(stack.pop()>>1);next();}}

// math
  ,{name:"1+"       ,xt:function(){ // 1+    ( a b -- c ) 
      stack.push(stack.pop()+1);next();}}
  ,{name:"2+"       ,xt:function(){ // 2+    ( a b -- c ) 
      stack.push(stack.pop()+2);next();}}
  ,{name:"1-"       ,xt:function(){ // 1-    ( a b -- c ) 
      stack.push(stack.pop()-1);next();}}
  ,{name:"2-"       ,xt:function(){ // 2-    ( a b -- c ) 
      stack.push(stack.pop()-2);next();}}
  ,{name:"+"    ,xt:function(){ // +    ( a b -- c ) 
      stack.push(stack.pop()-(0-stack.pop()));next();}}
  ,{name:"-"    ,xt:function(){ // -    ( a b -- c ) 
      var b=stack.pop(); stack.push(stack.pop()-b);next();}}
  ,{name:"*"       ,xt:function(){ // *    ( a b -- c ) 
      stack.push(stack.pop()*stack.pop());next();}}
  ,{name:"/"    ,xt:function(){ // /    ( a b -- c ) 
      var b=stack.pop(); stack.push(stack.pop()/b);next();}}
  ,{name:"mod"      ,xt:function(){ // mod    ( a b -- c ) 
      var b=stack.pop(); stack.push(stack.pop()%b);next();}}
  ,{name:"div"      ,xt:function(){ // div    ( a b -- c ) 
      var b=stack.pop(); var a=stack.pop(); stack.push((a-(a%b))/b);next();}}

// transcendental
  ,{name:"pi"       ,xt:function(){ 
      stack.push(Math.PI);next();}}
  ,{name:"random"      ,xt:function(){ 
      stack.push(Math.random());next();}}
  ,{name:"int"      ,xt:function(){ // 
      stack.push(Math.trunc(stack.pop()));next();}}
  ,{name:"ceil"      ,xt:function(){ 
      stack.push(Math.ceil(stack.pop()));next();}}
  ,{name:"floor"      ,xt:function(){ // 
      stack.push(Math.floor(stack.pop()));next();}}
  ,{name:"sin"      ,xt:function(){ // 
      stack.push(Math.sin(stack.pop()));next();}}
  ,{name:"cos"      ,xt:function(){ // 
      stack.push(Math.cos(stack.pop()));next();}}
  ,{name:"tan"      ,xt:function(){ // 
      stack.push(Math.tan(stack.pop()));next();}}
  ,{name:"asin"      ,xt:function(){ // 
      stack.push(Math.asin(stack.pop()));next();}}
  ,{name:"acos"      ,xt:function(){ // 
      stack.push(Math.acos(stack.pop()));next();}}
  ,{name:"exp"      ,xt:function(){ // 
      stack.push(Math.exp(stack.pop()));next();}}
  ,{name:"log"      ,xt:function(){ // 
      stack.push(Math.log(stack.pop()));next();}}
  ,{name:"sqrt"      ,xt:function(){ // 
      stack.push(Math.sqrt(stack.pop()));next();}}
  ,{name:"int"      ,xt:function(){ // 
      stack.push(Math.trunc(stack.pop()));next();}}
  ,{name:"abs"      ,xt:function(){ // 
      stack.push(Math.abs(stack.pop()));next();}}
  ,{name:"max"    ,xt:function(){ // max    ( a b -- max ) 
      var b=stack.pop(); stack.push(Math.max(stack.pop(),b));next();}}
  ,{name:"min"    ,xt:function(){ // min    ( a b -- min ) 
      var b=stack.pop(); stack.push(Math.min(stack.pop(),b));next();}}
  ,{name:"atan2"       ,xt:function(){ 
      var b=stack.pop(); stack.push(Math.atan2(stack.pop(),b));next();}}
  ,{name:"pow"    ,xt:function(){ // power    ( a b -- a**b ) 
      var b=stack.pop(); stack.push(Math.pow(stack.pop(),b));next();}}

// compare
  ,{name:"0="       ,xt:function(){ // 0=    ( a -- f ) 
      stack.push(stack.pop()===0);next();}}
  ,{name:"0<"       ,xt:function(){ // 0<    ( a -- f ) 
      stack.push(stack.pop()<0);next();}}
  ,{name:"0>"       ,xt:function(){ // 0>    ( a -- f ) 
      stack.push(stack.pop()>0);next();}}
  ,{name:"0<>"      ,xt:function(){ // 0<>    ( a -- f ) 
      stack.push(stack.pop()!==0);next();}}
  ,{name:"0<="      ,xt:function(){ // 0<=    ( a -- f ) 
      stack.push(stack.pop()<=0);next();}}
  ,{name:"0>="      ,xt:function(){ // 0>=    ( a -- f ) 
      stack.push(stack.pop()>=0);next();}}
  ,{name:"="    ,xt:function(){ // =    ( a b -- f ) 
      stack.push(stack.pop()===stack.pop());next();}}
  ,{name:">"    ,xt:function(){ // >    ( a b -- f ) 
      var b=stack.pop(); stack.push(stack.pop()>b);next();}}
  ,{name:"<"    ,xt:function(){ // >    ( a b -- f ) 
      var b=stack.pop(); stack.push(stack.pop()<b);next();}}
  ,{name:"<>"       ,xt:function(){ // <>    ( a b -- f ) 
      stack.push(stack.pop()!==stack.pop());next();}}
  ,{name:">="       ,xt:function(){ // >    ( a b -- f ) 
      var b=stack.pop(); stack.push(stack.pop()>=b);next();}}
  ,{name:"<="       ,xt:function(){ // >    ( a b -- f ) 
      var b=stack.pop(); stack.push(stack.pop()<=b);next();}}
  ,{name:"=="       ,xt:function(){ // ==    ( a b -- f ) 
      stack.push(stack.pop()==stack.pop());next();}}

// output
  ,{name:"base@"   ,xt:function(){ // base@    ( -- n ) 
         stack.push(base);next();}}
  ,{name:"base!"   ,xt:function(){ // base!    ( n -- ) 
         base=stack.pop();next();}}
  ,{name:"hex"     ,xt:function(){ // hex    ( -- ) 
     base=16;next();}}
  ,{name:"decimal" ,xt:function(){ // decimal    ( -- ) 
     base=10;next();}}
  ,{name:"cr"      ,xt:cr}    // cr    ( -- ) 
  ,{name:"?"    ,xt:function(){ // ? ( a -- ) 
     ticktype(dictionary[stack.pop()].toString(base)+"&nbsp;");next();}}
  ,{name:".r"     ,xt:function(){ // .r    ( i n -- )
      var n=stack.pop(); var i=stack.pop();
      i=i.toString(base);
      n=n-i.length;
      if(n>0) do{ i="&nbsp;"+i; n--;}while(n>0);
      ticktype(i); }}
  ,{name:"emit"     ,xt:function(){
      var s=String.fromCharCode(stack.pop());
      ticktype(s);next();}}
  ,{name:"space"     ,xt:function(){
      var s="&nbsp;";
      ticktype(s);next();}}
  ,{name:"spaces"     ,xt:function(){   // ( n -- )
      var n=stack.pop(); 
      var s="";
      for (i=0;i<n;i++) s+="&nbsp;";
      ticktype(s);next();}}

// strings
  ,{name:"["       ,xt:function(){ // [    ( -- ) 
      compiling=false;next();},immediate:true}
  ,{name:"]"       ,xt:function(){ // ]    ( -- ) 
      compiling=true;next();}}
  ,{name:"findword",xt:function(){ // findword    ( <name> -- i | -1 ) 
     token=nexttoken(); stack.push(findword(token));next();}}
  ,{name:"'"       ,xt:function(){
     tick();next();}}
  ,{name:"(')"     ,xt:function(){ // '    ( -- i ) 
     stack.push(words[w].pf[ip++]);next();}}
  ,{name:"[']"     ,xt:function(){ // '    ( <name> -- i ) 
     compilecode("(')"); tick(); compilecode(stack.pop());next();},immediate:true}
  ,{name:"dostr"     ,xt:function(){ // next
      stack.push(words[w].pf[ip++]);next();}}
  ,{name:'s"'     ,xt:function(){ // next
      var s=nexttoken('"');
      if (compiling) {compilecode("dostr");dictcompile(s);
      } else {stack.push(s);};next();},immediate:true}
  ,{name:"dotstr"     ,xt:function(){ 
      var n=words[wp].pf[ip++];
      ticktype(n);
      next();}}
  ,{name:'."'     ,xt:function(){ 
      var s=nexttoken('"');
      if (compiling) {compilecode("dotstr");dictcompile(s);
      } else {ticktype(s);};next();},immediate:true}
  ,{name:'('     ,xt:function(){ 
      var s=nexttoken(')');next();},immediate:true}
  ,{name:'.('     ,xt:function(){ 
      var s=nexttoken(')');
      ticktype(s);next();},immediate:true}
  ,{name:'\\'     ,xt:function(){ 
      var s=nexttoken('\n');next();},immediate:true}

// structures
  ,{name:"branch"    ,xt:function(){ // branch    ( -- ) 
     ip=words[wp].pf[ip];next();}}
  ,{name:"0branch"    ,xt:function(){ // 0branch    ( n -- ) 
     if(stack.pop()) ip++;else ip=words[wp].pf[ip];next();}}
  ,{name:"donext"     ,xt:function(){ // donext    ( nj ... n1 n0 j -- ... n1 n0 nj )
      var i=rstack.pop()-1;if(i>=0){ip=words[wp].pf[ip];rstack.push(i);}
      else {ip++;};next();}}
  ,{name:"if"      ,xt:function(){ // if    ( -- here ) 
      compilecode("0branch");stack.push(words[words.length-1].pf.length);dictcompile(0);next();},immediate:true}
  ,{name:"else"    ,xt:function(){ // else    ( there -- here ) 
      compilecode("branch");var h=words[words.length-1].pf.length;dictcompile(0);
      words[words.length-1].pf[stack.pop()]=words[words.length-1].pf.length;stack.push(h);},immediate:true}
  ,{name:"then"    ,xt:function(){ // then    ( there -- ) 
      words[words.length-1].pf[stack.pop()]=words[words.length-1].pf.length;next();},immediate:true}
  ,{name:"begin"    ,xt:function(){ // begin    ( -- here ) 
      stack.push(words[words.length-1].pf.length);next();},immediate:true}
  ,{name:"again"    ,xt:function(){ // again    ( there -- ) 
      compilecode("branch");compilecode(stack.pop());next();},immediate:true}
  ,{name:"until"    ,xt:function(){ // until    ( there -- ) 
      compilecode("0branch");compilecode(stack.pop());next();},immediate:true}
  ,{name:"while"    ,xt:function(){ // while    ( there -- there here ) 
      compilecode("0branch"); stack.push(words[words.length-1].pf.length); dictcompile(0);},immediate:true}
  ,{name:"repeat"   ,xt:function(){ // repeat    ( there1 there2 -- ) 
      compilecode("branch");var t=stack.pop();compilecode(stack.pop());
      words[words.length-1].pf[t]=words[words.length-1].pf.length;next();},immediate:true}
  ,{name:"for"     ,xt:function(){ // for ( -- here )
      compilecode(">r"); stack.push(words[words.length-1].pf.length);next();},immediate:true}
  ,{name:"next"     ,xt:function(){ // next ( here -- )
      compilecode("donext"); compilecode(stack.pop());next();},immediate:true}
  ,{name:"aft"     ,xt:function(){ // aft ( here -- here there )
      stack.pop();compilecode("branch");var h=words[words.length-1].pf.length;dictcompile(0);
      stack.push(words[words.length-1].pf.length);stack.push(h);next()},immediate:true}

// tools
  ,{name:"words"   ,xt:function(){ // words    ( -- ) 
     for(var i=words.length-1;i>0;i--)ticktype(words[i].name+" ");next();}}
  ,{name:"date"   ,xt:function(){ // date   ( -- ) 
     var d= new Date(); ticktype(d+"<br/>");next();}}
  ,{name:"see"       ,xt:function(){
     token=nexttoken();var n=findword(token);
     if (n>-1) {ticktype(words[n].pf.join(' '));next();}
     else {reset();throw(" "+token+"?");}}} 

// defining words
  ,{name:"does>"     ,xt:function(){ 
      words[words.length-1].pf.push(ip);compilecode("exit");next();}}
  ,{name:"create"   ,xt:function(){ // create ( -- ) 
     newname=nexttoken(); words.push({name:newname,xt:dovar(),pf:[]});next();}}
  ,{name:"variable" ,xt:function(){ // variable ( -- ) 
     newname=nexttoken(); words.push({name:newname,xt:dovar(),pf:[0]});next();}}
  ,{name:"constant" ,xt:function(){ // constant ( n -- ) 
     newname=nexttoken(); words.push({name:newname,xt:dovar(),pf:[stack.pop()]});next();}}
  ,{name:"allot"    ,xt:function(){ // allot ( n -- ) 
     var n=stack.pop(); for(var i=0;i<n;i++) words[words.length-1].pf.push(0);next();}}
   ]
  this.exec= exec;  // make exec become a public interface
  }
window.KsanaVm=KsanaVm;  // export KsanaVm as a global variable 
})();
