// Pointer events cover mouse, pen, and touch. A pinch owns the gesture until
// every finger lifts, so its remaining finger cannot accidentally turn a dial.
function createLockGestures({pick,turn,orbit,zoom,activate}){
 const pointers=new Map();let drag=null,pinching=false,span=0;
 const pair=()=>[...pointers.values()].slice(0,2);
 const separation=()=>{const[a,b]=pair();return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0};
 return {
  down(e){
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size>1){pinching=true;drag=null;span=separation();return}
   if(!pinching)drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,lastY:e.clientY,moved:false,part:pick(e),shift:e.shiftKey};
  },
  move(e){
   if(!pointers.has(e.pointerId))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinching){
    if(pointers.size>1){const next=separation(),[a,b]=pair();if(span>1&&next>1)zoom(span/next,{x:(a.x+b.x)/2,y:(a.y+b.y)/2});span=next}
    return;
   }
   if(!drag||drag.id!==e.pointerId)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6)drag.moved=true;
   if(drag.part.dial!==undefined){const steps=Math.trunc((drag.lastY-e.clientY)/22);if(steps){turn(drag.part.dial,steps);drag.lastY-=steps*22}}
   else if(drag.moved)orbit(dx,dy);
   drag.x=e.clientX;drag.y=e.clientY;
  },
  up(e){
   if(!pointers.has(e.pointerId))return;
   pointers.delete(e.pointerId);
   if(pinching){span=separation();if(!pointers.size)pinching=false;return}
   if(drag?.id===e.pointerId){if(!drag.moved)activate(drag.part,drag.shift);drag=null}
  },
  cancel(e){pointers.delete(e.pointerId);drag=null;span=separation();if(!pointers.size)pinching=false},
  clear(){pointers.clear();drag=null;pinching=false;span=0}
 };
}
if(typeof module!=='undefined'&&module.exports)module.exports=createLockGestures;
