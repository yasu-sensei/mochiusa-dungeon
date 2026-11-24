(()=>{
// Keep the outer game shell as the fullscreen owner across inner screen changes.
const game=document.getElementById('game');
const seen=new WeakSet();
let requested=false, busy=false, userExited=false;
function request(e){
 if(!e||!e.isTrusted||userExited||busy||document.fullscreenElement||document.fullscreenEnabled===false)return;
 const fn=document.documentElement.requestFullscreen;
 if(typeof fn!=='function')return;
 busy=true;requested=true;
 try{Promise.resolve(fn.call(document.documentElement)).catch(()=>{}).finally(()=>{busy=false;});}
 catch(_){busy=false;}
}
function bindDoc(doc){
 if(!doc||seen.has(doc))return;
 seen.add(doc);
 // pointerdown is a user gesture even when a nested iframe handles the click.
 doc.addEventListener('pointerdown',request,true);
 doc.addEventListener('click',request,true);
 doc.addEventListener('keydown',request,true);
 // New battle / encyclopedia frames are created without replacing the outer page.
 const scan=()=>{try{doc.querySelectorAll('iframe').forEach(bindFrame)}catch(_){}};
 scan();
 try{new MutationObserver(scan).observe(doc.documentElement,{childList:true,subtree:true});}catch(_){}
}
function bindFrame(frame){
 try{
  if(!frame.__chiteiFullscreenObserved){
   frame.__chiteiFullscreenObserved=true;
   frame.addEventListener('load',()=>{try{bindDoc(frame.contentDocument);if(frame!==game)enableRecovery();}catch(_){}});
  }
  bindDoc(frame.contentDocument);
 }catch(_){}
}
// Do not immediately re-enter fullscreen when the user presses Escape/back.
// A subsequent intentional interaction with the game can restore it.
document.addEventListener('fullscreenchange',()=>{
 if(!document.fullscreenElement&&requested){requested=false;userExited=true;}
 else if(document.fullscreenElement){userExited=false;}
});
// When a screen transition exits fullscreen, permit recovery on the next game gesture.
// This event is emitted only when the nested battle view loads, not on arbitrary clicks.
function enableRecovery(){userExited=false;}
try{
 game.addEventListener('load',()=>{bindFrame(game);enableRecovery();});
 bindFrame(game);
}catch(_){}
bindDoc(document);
})();