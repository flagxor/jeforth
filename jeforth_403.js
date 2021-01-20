/* jeForth 4.03 eForth in Javascript
2021/1/18    Chen-Hanson Ting
    4.01-4.03 haiku eforth 
2021/1/8    Chen-Hanson Ting
    3.01,3.02 colon words have word lists in parameter fields. 
2021/1/7    Chen-Hanson Ting update for svfig
    2.01-2.03 execute-nest-exit, quit loop 
2011/12/23 initial version by Yap cheahshen and Sam Chen */
"use strict";

function jeforth() {

(function() {
    function KsanaVm(dictsize) {
    var ip=0,wp=0,w=0; // instruction pointer
    var stack=[],rstack=[];         // array allows push and pop
    var tib="",ntib=0,base=10;
    var token="";
    var compiling=false;
    var fence=0;
    this.ticktype=0;                     // 'type vector
    var newname;                   // for word under construction
  function reset() {stack=[];}
  function dotstack() { var s=" < ";var i=0;
    for (i=0;i<stack.length;i++){s+=stack[i].toString(base);s+=" ";}
    return s+=">";}
  function nexttoken(deli){
    token=""; 
    if (deli===undefined) deli=" "; 
    while (tib.charCodeAt(ntib)<=32) ntib++;
    while(ntib<tib.length && tib.substr(ntib,1)!=deli && tib.substr(ntib,1)!="\n") {
      token+=tib.substr(ntib++,1); }
    if (deli!=" ") ntib++;
    if (token==="") throw(dotstack()+"ok");
    return token;}
  function findword(name) {
    for (var i=words.length-1;i>0;i--) {if (words[i].name===name) return i;}
    return -1;}
  function dictcompile(n) {words[words.length-1].pf.push(n);} 
  function compilecode(nword) { 
    if ( typeof(nword) ==="string" ) {var n=findword(nword); }
    else n=nword;
    if (n>-1) dictcompile(n);
    else {reset(); throw(" "+nword+" ? ");}}
  function execute(n){w=n;words[n].xt();}
  function exit(){ip=-1;}
  function nest(){
    rstack.push(wp);rstack.push(ip);wp=w;ip=0;
    while (ip>=0){w=words[wp].pf[ip++];words[w].xt();}
    ip=rstack.pop();wp=rstack.pop();}
  function dovar(){stack.push(w);}
  function docon(){stack.push(words[w].pf[0]);}
  function exectoken(cmd){               // outer loop
    var n=parseFloat(token);       // convert to number, javascript allow parseInt(str,base)
    var nword=findword(token);
    if (base!=10) {n=parseInt(token,base);}
    if (nword>-1) { 
      if (compiling && !words[nword].immediate) {dictcompile(nword);}
      else {execute(nword);}}               // nest, docon, dovar need pf
    else if (n || token==0) {                        // if the token is a number
      if (compiling) {    
        compilecode("dolit");            // compile an literal
        dictcompile(n); }
      else {stack.push(n);}}
    else {
      if (compiling) words.pop();
      reset();throw(" "+cmd+" ? ");}} 
  function tick(){token=nexttoken(); var i=findword(token); if(i>=0)stack.push(i);
      else throw(" "+token+" ? ");}
  function exec(cmd) {                   // : quit begin token exec again ;
    tib=cmd;ntib=0;rstack=[];wp=0;ip=0;w=0;compiling=false;execute(0);}

// params of javascript function
   var js_nparam = {lineTo:2 , moveTo:2, fillRect:4 , lineWidth:1};

  var words = [
   {name:"quit"  ,xt:function(){nest();},pf:[1,2,3,0]}
  ,{name:"token" ,xt:function(){token=nexttoken();}}
  ,{name:"exec"  ,xt:function(){exectoken(token);}}
  ,{name:"bran"  ,xt:function(){ip=words[wp].pf[ip];}}
  ,{name:","     ,xt:function(){dictcompile(stack.pop());}}
  ,{name:"dolit" ,xt:function(){stack.push(words[wp].pf[ip++]);}}
  ,{name:"exit"  ,xt:function(){exit();}}
  ,{name:":"     ,xt:function(){newname=nexttoken();compiling=true;
                     words.push({name:newname,xt:function(){nest();},pf:[]});}}
  ,{name:";"     ,xt:function(){compiling=false;compilecode("exit");},immediate:true}
  ,{name:"."     ,xt:function(){ticktype(stack.pop().toString(base)+" ");}}
  ,{name:"dup"   ,xt:function(){stack.push(stack[stack.length-1]);}}
  ,{name:"drop"  ,xt:function(){stack.pop();}}
  ,{name:"swap"  ,xt:function(){var t=stack.length-1;var b=stack[t];stack[t]=stack[t-1];stack[t-1]=b;}}
  ,{name:"over"  ,xt:function(){stack.push(stack[stack.length-2]);}}
  ,{name:"nip"   ,xt:function(){stack[stack.length-2]=stack.pop();}}
  ,{name:"rot"   ,xt:function(){ // rot    ( a b c -- b c a )
      var t=stack.length-1; var a=stack[t-2]; stack[t-2]=stack[t-1]; stack[t-1]=stack[t]; stack[t]=a;}}
  ,{name:"-rot"  ,xt:function(){ // -rot    ( a b c -- c a b )
      var t=stack.length-1; var a=stack[t-2]; stack[t-2]=stack[t]; stack[t]=stack[t-1]; stack[t-1]=a;}}
  ,{name:"pick"  ,xt:function(){ // pick    ( nj ... n1 n0 j -- nj ... n1 n0 nj )
      var t=stack.length-1; var j=stack[t]; stack[t]=stack[t-j-1];}}
  ,{name:"roll"  ,xt:function(){ // roll    ( nj ... n1 n0 j -- ... n1 n0 nj )
      var j=stack.pop();
      if(j>0){var t=stack.length-1;var nj=stack[t-j];
        for(i=j-1;i>=0;i--) stack[t-i-1]=stack[t-i];
        stack[t]=nj;}}}
  ,{name:"2dup"  ,xt:function(){stack.push(stack[stack.length-2]);stack.push(stack[stack.length-2]);}}
  ,{name:"2drop" ,xt:function(){stack.pop();stack.pop();}}
  ,{name:">r"    ,xt:function(){rstack.push(stack.pop());}}
  ,{name:"r>"    ,xt:function(){stack.push(rstack.pop());}}
  ,{name:"r@"    ,xt:function(){stack.push(rstack[rstack.length-1]);}}
  ,{name:"push"  ,xt:function(){rstack.push(stack.pop());}}
  ,{name:"pop"   ,xt:function(){stack.push(rstack.pop());}}
  ,{name:"and"   ,xt:function(){stack.push(stack.pop() & stack.pop());}}
  ,{name:"or"    ,xt:function(){stack.push(stack.pop() | stack.pop());}}
  ,{name:"xor"   ,xt:function(){stack.push(stack.pop() ^ stack.pop());}}
  ,{name:"negate",xt:function(){stack.push(0-stack.pop());}}
  ,{name:"2*"    ,xt:function(){stack.push(stack.pop()<<1);}}
  ,{name:"2/"    ,xt:function(){stack.push(stack.pop()>>1);}}

// math
  ,{name:"1+"    ,xt:function(){stack.push(stack.pop()+1);}}
  ,{name:"2+"    ,xt:function(){stack.push(stack.pop()+2);}}
  ,{name:"1-"    ,xt:function(){stack.push(stack.pop()-1);}}
  ,{name:"2-"    ,xt:function(){stack.push(stack.pop()-2);}}
  ,{name:"+"     ,xt:function(){stack.push(stack.pop()-(0-stack.pop()));}}
  ,{name:"-"     ,xt:function(){var b=stack.pop(); stack.push(stack.pop()-b);}}
  ,{name:"*"     ,xt:function(){stack.push(stack.pop()*stack.pop());}}
  ,{name:"/"     ,xt:function(){var b=stack.pop(); stack.push(stack.pop()/b);}}
  ,{name:"mod"   ,xt:function(){var b=stack.pop(); stack.push(stack.pop()%b);}}
  ,{name:"div"   ,xt:function(){var b=stack.pop(); var a=stack.pop(); stack.push((a-(a%b))/b);}}

// transcendental
  ,{name:"pi"    ,xt:function(){stack.push(Math.PI);}}
  ,{name:"random",xt:function(){stack.push(Math.random());}}
  ,{name:"int"   ,xt:function(){stack.push(Math.trunc(stack.pop()));}}
  ,{name:"ceil"  ,xt:function(){stack.push(Math.ceil(stack.pop()));}}
  ,{name:"floor" ,xt:function(){stack.push(Math.floor(stack.pop()));}}
  ,{name:"sin"   ,xt:function(){stack.push(Math.sin(stack.pop()));}}
  ,{name:"cos"   ,xt:function(){stack.push(Math.cos(stack.pop()));}}
  ,{name:"tan"   ,xt:function(){stack.push(Math.tan(stack.pop()));}}
  ,{name:"asin"  ,xt:function(){stack.push(Math.asin(stack.pop()));}}
  ,{name:"acos"  ,xt:function(){stack.push(Math.acos(stack.pop()));}}
  ,{name:"exp"   ,xt:function(){stack.push(Math.exp(stack.pop()));}}
  ,{name:"log"   ,xt:function(){stack.push(Math.log(stack.pop()));}}
  ,{name:"sqrt"  ,xt:function(){stack.push(Math.sqrt(stack.pop()));}}
  ,{name:"int"   ,xt:function(){stack.push(Math.trunc(stack.pop()));}}
  ,{name:"abs"   ,xt:function(){stack.push(Math.abs(stack.pop()));}}
  ,{name:"max"   ,xt:function(){var b=stack.pop(); stack.push(Math.max(stack.pop(),b));}}
  ,{name:"min"   ,xt:function(){var b=stack.pop(); stack.push(Math.min(stack.pop(),b));}}
  ,{name:"atan2" ,xt:function(){var b=stack.pop(); stack.push(Math.atan2(stack.pop(),b));}}
  ,{name:"pow"   ,xt:function(){var b=stack.pop(); stack.push(Math.pow(stack.pop(),b));}}

// compare
  ,{name:"0="    ,xt:function(){stack.push(stack.pop()===0);}}
  ,{name:"0<"    ,xt:function(){stack.push(stack.pop()<0);}}
  ,{name:"0>"    ,xt:function(){stack.push(stack.pop()>0);}}
  ,{name:"0<>"   ,xt:function(){stack.push(stack.pop()!==0);}}
  ,{name:"0<="   ,xt:function(){stack.push(stack.pop()<=0);}}
  ,{name:"0>="   ,xt:function(){stack.push(stack.pop()>=0);}}
  ,{name:"="     ,xt:function(){stack.push(stack.pop()===stack.pop());}}
  ,{name:">"     ,xt:function(){var b=stack.pop(); stack.push(stack.pop()>b);}}
  ,{name:"<"     ,xt:function(){var b=stack.pop(); stack.push(stack.pop()<b);}}
  ,{name:"<>"    ,xt:function(){stack.push(stack.pop()!==stack.pop());}}
  ,{name:">="    ,xt:function(){var b=stack.pop(); stack.push(stack.pop()>=b);}}
  ,{name:"<="    ,xt:function(){var b=stack.pop(); stack.push(stack.pop()<=b);}}
  ,{name:"=="    ,xt:function(){stack.push(stack.pop()==stack.pop());}}

// output
  ,{name:"base@",xt:function(){stack.push(base);}}
  ,{name:"base!",xt:function(){base=stack.pop();}}
  ,{name:"hex"  ,xt:function(){base=16;}}
  ,{name:"decimal" ,xt:function(){base=10;}}
  ,{name:"cr"   ,xt:function(){ticktype("<br/>\n");}}
  ,{name:"?"    ,xt:function(){ticktype(words[stack.pop()].pf[0].toString(base)+"&nbsp;");}}
  ,{name:".r"   ,xt:function(){ // .r    ( i n -- )
      var n=stack.pop(); var i=stack.pop();i=i.toString(base);n=n-i.length;
      if(n>0) do{ i="&nbsp;"+i; n--;}while(n>0);ticktype(i); }}
  ,{name:"emit"  ,xt:function(){var s=String.fromCharCode(stack.pop());ticktype(s);}}
  ,{name:"space"  ,xt:function(){var s="&nbsp;";ticktype(s);}}
  ,{name:"spaces"  ,xt:function(){var n=stack.pop();var s="";
      for (i=0;i<n;i++) s+="&nbsp;";ticktype(s);}}

// strings
  ,{name:"["    ,xt:function(){compiling=false;},immediate:true}
  ,{name:"]"    ,xt:function(){compiling=true;}}
  ,{name:"find" ,xt:function(){token=nexttoken(); stack.push(findword(token));}}
  ,{name:"'"    ,xt:function(){tick();}}
  ,{name:"(')"  ,xt:function(){stack.push(words[w].pf[ip++]);}}
  ,{name:"[']"  ,xt:function(){compilecode("(')"); tick(); compilecode(stack.pop());},immediate:true}
  ,{name:"dostr",xt:function(){stack.push(words[w].pf[ip++]);}}
  ,{name:'s"'   ,xt:function(){
      var s=nexttoken('"');
      if (compiling) {compilecode("dostr");dictcompile(s);}
      else {stack.push(s);};},immediate:true}
  ,{name:"dotstr"  ,xt:function(){var n=words[wp].pf[ip++];ticktype(n);}}
  ,{name:'."'   ,xt:function(){ 
      var s=nexttoken('"');
      if (compiling) {compilecode("dotstr");dictcompile(s);}
      else {ticktype(s);};},immediate:true}
  ,{name:'('   ,xt:function(){var s=nexttoken(')');},immediate:true}
  ,{name:'.('  ,xt:function(){var s=nexttoken(')');ticktype(s);},immediate:true}
  ,{name:'\\'  ,xt:function(){var s=nexttoken('\n');},immediate:true}

// structures
  ,{name:"to"  ,xt:function(){
      var a=words[wp].pf[ip++]; // only in colon words like branch
      words[a].pf[0]=stack.pop();}}
  ,{name:"branch" ,xt:function(){ip=words[wp].pf[ip];}}
  ,{name:"0branch",xt:function(){if(stack.pop()) ip++;else ip=words[wp].pf[ip];}}
  ,{name:"donext" ,xt:function(){
      var i=rstack.pop()-1;if(i>=0){ip=words[wp].pf[ip];rstack.push(i);}else {ip++;};}}
  ,{name:"if"  ,xt:function(){
      compilecode("0branch");stack.push(words[words.length-1].pf.length);dictcompile(0);},immediate:true}
  ,{name:"else",xt:function(){ // else ( here -- there )
      compilecode("branch");var h=words[words.length-1].pf.length;dictcompile(0);
      words[words.length-1].pf[stack.pop()]=words[words.length-1].pf.length;stack.push(h);},immediate:true}
  ,{name:"then",xt:function(){ // then    ( there -- ) 
      words[words.length-1].pf[stack.pop()]=words[words.length-1].pf.length;},immediate:true}
  ,{name:"begin"  ,xt:function(){ // begin    ( -- here ) 
      stack.push(words[words.length-1].pf.length);},immediate:true}
  ,{name:"again"  ,xt:function(){ // again    ( there -- ) 
      compilecode("branch");compilecode(stack.pop());},immediate:true}
  ,{name:"until"  ,xt:function(){ // until    ( there -- ) 
      compilecode("0branch");compilecode(stack.pop());},immediate:true}
  ,{name:"while"  ,xt:function(){ // while    ( there -- there here ) 
      compilecode("0branch"); stack.push(words[words.length-1].pf.length); dictcompile(0);},immediate:true}
  ,{name:"repeat" ,xt:function(){ // repeat    ( there1 there2 -- ) 
      compilecode("branch");var t=stack.pop();compilecode(stack.pop());
      words[words.length-1].pf[t]=words[words.length-1].pf.length;},immediate:true}
  ,{name:"for" ,xt:function(){ // for ( -- here )
      compilecode(">r"); stack.push(words[words.length-1].pf.length);},immediate:true}
  ,{name:"next",xt:function(){ // next ( here -- )
      compilecode("donext"); compilecode(stack.pop());},immediate:true}
  ,{name:"aft" ,xt:function(){ // aft ( here -- here there )
      stack.pop();compilecode("branch");var h=words[words.length-1].pf.length;dictcompile(0);
      stack.push(words[words.length-1].pf.length);stack.push(h);},immediate:true}

// tools
  ,{name:"date"  ,xt:function(){var d= new Date(); ticktype(d+"<br/>");}}
  ,{name:"here"  ,xt:function(){stack.push(words.length);}}
  ,{name:"words" ,xt:function(){for(var i=words.length-1;i>=0;i--)ticktype(words[i].name+" ");}}
  ,{name:"see"   ,xt:function(){
     tick();var n=stack.pop();ticktype(words[n].pf.join(" "));}}
  ,{name:"forget",xt:function(){
     tick();var n=stack.pop();if (n < fence) {reset();throw(" "+token+" below fence" );}
     for(var i=words.length-1;i>=n;i--)words.pop();}}
  ,{name:"reboot",xt:function(){
     for(var i=words.length-1;i>=fence;i--)words.pop();}}
  ,{name:"@"     ,xt:function(){ // @ ( w -- n ) 
     var a=stack.pop();stack.push(words[a].pf[0]);}}
  ,{name:"!"     ,xt:function(){ // ! ( n w -- ) 
     var a=stack.pop();words[a].pf[0]=stack.pop();}}
  ,{name:"array@",xt:function(){ // array@ ( w i -- n ) 
     var i=stack.pop();var a=stack.pop();stack.push(words[a].pf[i]);}}
  ,{name:"array!",xt:function(){ // array! ( n w i -- ) 
     var i=stack.pop();var a=stack.pop();words[a].pf[i]=stack.pop();}}

// defining words
  ,{name:"does>" ,xt:function(){ 
      words[words.length-1].pf.push(ip);compilecode("exit");}}
  ,{name:"create",xt:function(){ // create ( -- ) 
     newname=nexttoken(); words.push({name:newname,xt:function(){dovar();},pf:[]});}}
  ,{name:"variable" ,xt:function(){ // variable ( -- ) 
     newname=nexttoken(); words.push({name:newname,xt:function(){dovar();},pf:[0]});}}
  ,{name:"constant" ,xt:function(){ // constant ( n -- ) 
     newname=nexttoken(); words.push({name:newname,xt:function(){docon();},pf:[stack.pop()]});}}
  ,{name:"allot" ,xt:function(){ // allot ( n -- ) 
     var n=stack.pop(); for(var i=0;i<n;i++) words[words.length-1].pf.push(0);}}

// canvas
/*
  ,{name:"width" ,xt:function(){docon();},pf:[width]}
  ,{name:"height",xt:function(){docon();},pf:[height]}
*/
  ,{name:"image@",xt: function() {  // ( a -- r g b )
      var a=stack.pop(); 
          stack.push(imagedata.data[a]);       // Red
          stack.push(imagedata.data[a+1]);     // Green
          stack.push(imagedata.data[a+2]);     // Blue
      }}
  ,{name:"image!" , xt: function() {  // ( r g b a -- )
      var a=stack.pop(); var b=stack.pop(); var g=stack.pop(); var r=stack.pop();
          imagedata.data[a]   = r;     // Red
          imagedata.data[a+1] = g;     // Green
          imagedata.data[a+2] = b;     // Blue
          imagedata.data[a+3] = 255;   // Alpha
      }}   
  ,{name:"proto"  ,xt:function()       // ( x y -- r g b )
      {nest();},pf:[11,11,5,0,5,255,5,0,6]}
  ,{name:"vector"  ,xt:function(){     // ( a b -- ) vector b to a )
      var b=stack.pop(); var a=stack.pop(); 
      words[b].pf=words[a].pf;
      }}
  ,{name:"show" , xt: function() {  // ( vol freq seconds -- )
      context.putImageData(imagedata, 0, 0);
      }}    

// tone
  ,{name:"tone" , xt: function() {  // ( vol freq seconds -- )
      var a=stack.pop(); var b=stack.pop(); var c=stack.pop();
      beep(c,b,a);
      }}    
   ]
  fence=words.length;
  this.exec= exec;  // make exec become a public interface
  }

var sharedArrayInt;
var sharedArray;
var kvm=new KsanaVm();
kvm.ticktype = ticktype;

function send(op) {
  Atomics.store(sharedArrayInt, 0, op);
  Atomics.wait(sharedArrayInt, 0, op);
}

function ticktype(t) {
  sharedArray[1] = t.length;
  for (var i = 0; i < t.length; ++i) {
    sharedArray[i + 2] = t.charCodeAt(i);
  }
  // Send a print message (1) atomically.
  send(1);
}

function readline() {
  // Send a print message (2) atomically.
  send(2);
  var len = sharedArray[1];
  var ret = '';
  for (var i = 0; i < len; ++i) {
    ret += String.fromCharCode(sharedArray[i + 2]);
  }
  return ret;
}

function beep(vol, freq, duration) {
  sharedArray[1] = vol;
  sharedArray[2] = parseFloat(freq);
  sharedArray[3] = duration;
  // Send a beep message (3) atomically.
  send(3);
}

function finish() {
  // Send a finish message (4) atomically.
  send(4);
}

function fortheval(cmd) {
  try {
    kvm.exec(cmd);
  } catch(err) {
    ticktype(err.toString()+"<br/>");
  }
}

self.addEventListener('message', (m) => {
  sharedArrayInt = new Int32Array(m.data);
  sharedArray = new Float64Array(m.data);
  while (true) {
    var cmd = readline();
    fortheval(cmd);
    finish();
  }
});

})();

}
