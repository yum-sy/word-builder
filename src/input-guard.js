// Keep browser gestures separate from the game's own pointer-based letter drag.
export function protectGameInput(root,onCancel,{doc=document,win=window,now=()=>performance.now()}={}){
 const adult=target=>!!target?.closest?.('.parent, .install-dialog, [data-allow-native]');
 const protectedTarget=target=>!adult(target)&&(root.contains(target)||target===doc.body||target===doc.documentElement);
 const stop=event=>{if(event.cancelable)event.preventDefault();};
 const active=new Set(),blocked=new Set();let lastAction='',lastTime=-Infinity;
 const cancel=()=>{active.clear();onCancel();};
 for(const type of ['selectstart','dragstart','dragover','drop','contextmenu','dblclick','gesturestart','gesturechange','gestureend'])doc.addEventListener(type,event=>{if(protectedTarget(event.target))stop(event);},{capture:true,passive:false});
 doc.addEventListener('wheel',event=>{if(protectedTarget(event.target))stop(event);},{capture:true,passive:false});
 doc.addEventListener('touchmove',event=>{if(protectedTarget(event.target))stop(event);},{passive:false});
 doc.addEventListener('pointerdown',event=>{
  if(!protectedTarget(event.target))return;
  if(event.button!==0||event.isPrimary===false||active.size>0){
   for(const id of active)blocked.add(id);blocked.add(event.pointerId);onCancel();stop(event);event.stopImmediatePropagation();return;
  }
  active.add(event.pointerId);
 },true);
 for(const type of ['pointerup','pointercancel'])doc.addEventListener(type,event=>{
  active.delete(event.pointerId);
  if(blocked.has(event.pointerId)){stop(event);event.stopImmediatePropagation();win.setTimeout(()=>blocked.delete(event.pointerId),600);}
  if(type==='pointercancel')onCancel();
 },true);
 doc.addEventListener('click',event=>{
  if(!protectedTarget(event.target))return;
  if(blocked.has(event.pointerId)){stop(event);event.stopImmediatePropagation();return;}
  // Only navigation actions are debounced; repeated letters remain playable.
  const id=event.target.closest?.('button')?.id;
  if(!['play-button','start-over','next-button','home-button','map-button','close-map','install-app'].includes(id))return;
  const time=now();if(id===lastAction&&time-lastTime<500){stop(event);event.stopImmediatePropagation();return;}
  lastAction=id;lastTime=time;
 },true);
 doc.addEventListener('keydown',event=>{
  if(!protectedTarget(event.target))return;
  if((event.ctrlKey||event.metaKey)&&['+','=','-','0','a'].includes(event.key.toLowerCase()))stop(event);
  if(!event.target.closest?.('button,input,select,textarea,a')&&[' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key))stop(event);
 });
 win.addEventListener('blur',cancel);win.addEventListener('pagehide',cancel);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel();});
}
