const assert=require('node:assert/strict');
const createLockGestures=require('./app/gestures.js');
function harness(part={dial:0}){
 const calls={turn:[],orbit:[],zoom:[],activate:[]};
 const controller=createLockGestures({pick:()=>part,...Object.fromEntries(Object.keys(calls).map(name=>[name,(...args)=>calls[name].push(args)]))});
 const event=(id,x,y,extra={})=>({pointerId:id,clientX:x,clientY:y,pointerType:'touch',...extra});
 return {controller,calls,event};
}
{
 const {controller:g,calls:c,event:e}=harness();
 g.down(e(1,50,100));g.move(e(1,52,98));g.up(e(1,52,98));
 assert.equal(c.activate.length,1,'A jittery touch tap activates exactly once');assert.equal(c.turn.length,0);
 g.down(e(1,50,100));g.move(e(1,50,34));g.up(e(1,50,34));
 assert.deepEqual(c.turn,[[0,3]],'Fast wheel drag keeps all three crossed detents');assert.equal(c.activate.length,1,'Drag does not add a tap');
}
{
 const {controller:g,calls:c,event:e}=harness();
 g.down(e(1,50,100));for(let y=96;y>=76;y-=4)g.move(e(1,50,y));g.up(e(1,50,76));
 assert.deepEqual(c.turn,[[0,1]],'Small move events accumulate into a turn');assert.equal(c.activate.length,0);
}
{
 const {controller:g,calls:c,event:e}=harness();
 g.down(e(1,50,100));g.down(e(2,100,100));g.move(e(2,150,100));
 assert.equal(c.zoom[0][0],.5,'Spreading fingers zooms in');assert.deepEqual(c.zoom[0][1],{x:100,y:100});
 g.move(e(2,75,100));assert.equal(c.zoom[1][0],4,'Bringing fingers together zooms out');
 g.up(e(2,75,100));g.move(e(1,50,20));g.up(e(1,50,20));
 assert.equal(c.turn.length,0,'Pinching over a dial cannot turn it');assert.equal(c.activate.length,0,'No tap after either finger lifts');assert.equal(c.orbit.length,0);
 g.down(e(3,50,100));g.up(e(3,50,100));assert.equal(c.activate.length,1,'New tap works after pinch finishes');
}
{
 const {controller:g,calls:c,event:e}=harness({release:true});
 g.down(e(1,10,10));g.cancel(e(1,10,10));g.up(e(1,10,10));assert.equal(c.activate.length,0,'Cancelled touch cannot activate release');
 g.down(e(1,10,10));g.down(e(2,60,10));g.down(e(3,80,10));g.cancel(e(2,60,10));g.up(e(1,10,10));g.up(e(3,80,10));
 assert.equal(c.activate.length,0,'Third finger and cancellation do not create ghost taps');
 g.down(e(1,10,10));g.clear();g.up(e(1,10,10));assert.equal(c.activate.length,0,'Blur clears pending input');
}
{
 const {controller:g,calls:c,event:e}=harness({});g.down(e(1,10,10));g.move(e(1,40,30));g.up(e(1,40,30));
 assert.deepEqual(c.orbit,[[30,20]],'Background drag orbits without a tap');assert.equal(c.activate.length,0);
}
console.log('PASS: tap, jitter, cumulative/fast dial drag, pinch in/out, pinch suppression, cancellation, third finger, blur, orbit.');
