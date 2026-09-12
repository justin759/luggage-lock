(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const STEP=Math.PI/5,state={digits:[0,0,0],code:[3,1,4],mode:'locked',busy:false,view:'assembled',highlight:null};
let sceneApi=null,notice='',noticeType='',angleTargets=[0,0,0];
const details={dial:'Click a dark gray number wheel to advance one digit. Drag up or down to turn it either way. Each wheel normally drives its brass sleeve.',gate:'Look for the missing wedge in each brass sleeve. All three gaps must face the green fence.',fence:'The green fence is rigidly joined to the release and latch. Three fingers enter the sleeve notches together; one round edge stops the entire carriage.',latch:'The reset tongue crosses behind the carriage stop before the clutches separate. It keeps the latch open until the clutches re-engage. While setting a code, click the release to test the physical stop.'};
function aligned(){return state.digits.map((d,i)=>d===state.code[i])}
function editable(){return state.mode!=='open'&&!state.busy&&state.view!=='exploded'}
const pause=()=>sceneApi?sceneApi.settle():Promise.resolve();
async function transition(fn){if(state.busy||state.view==='exploded')return;state.busy=true;render();try{await fn()}finally{state.busy=false;render()}}
function say(t,type=''){notice=t;noticeType=type}
function turn(i,delta){if(!editable())return;state.digits[i]=((state.digits[i]+delta)%10+10)%10;angleTargets[i]-=delta*STEP;notice='';noticeType='';render()}
function setDigit(i,d){const delta=(d-state.digits[i]+15)%10-5;turn(i,delta)}
for(let i=0;i<3;i++){
 const b=document.createElement('button');b.className='model-hit dial-hit';b.id=`model-dial-${i}`;b.dataset.dial=i;b.type='button';$('#model-ui').append(b);
 b.onclick=e=>{if(e.detail===0)turn(i,e.shiftKey?-1:1)};
 b.onkeydown=e=>{if(!editable())return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(i,['ArrowUp','ArrowRight'].includes(e.key)?1:-1)}else if(/^\d$/.test(e.key)){e.preventDefault();setDigit(i,+e.key)}};
}
function render(){
 const a=aligned(),count=a.filter(Boolean).length,open=state.mode==='open',setting=state.mode==='setting',ready=count===3;
 $('#saved-code').textContent=state.code.join(' ');
 $('#intro-reference-code').textContent=state.code.join('');
 $('#status').textContent=setting?'● Setting code':open?'● Unlocked':ready?'● Ready':'● Locked';$('#status').className='status '+(setting?'setting':open?'open':ready?'ready':'');
 $('#action-title').textContent=setting?'Choose your numbers.':open?'That’s the click.':ready?'Everything lines up.':'Touch the mechanism.';
 $('#action-desc').textContent=setting?'Turn the wheels on the model. Click the reset pin again to save the combination.':open?'The release is held inward. Click it again to close, or click the reset pin to change the code.':ready?'All three notches face the fence. Click the orange release on the model to open.':'Click or drag the three number wheels on the model, then click the orange release.';
 $$('.dial-hit').forEach((b,i)=>{b.setAttribute('aria-label',`Dial ${i+1}, ${state.digits[i]}. Click to advance, drag or use arrow keys.`);b.disabled=!editable()});
 $('#model-release').disabled=state.busy||state.view==='exploded';$('#model-release').setAttribute('aria-label',setting?'Release: test reset interlock':open?'Release: close the lock':'Release: open the lock');
 $('#model-reset').disabled=state.busy||state.view==='exploded';$('#model-reset').setAttribute('aria-label',setting?'Reset pin: save combination':'Reset pin: set combination');
 $$('[data-view]').forEach(b=>b.disabled=state.busy||setting);
 $('#feedback').textContent=state.view==='exploded'?'Inspection only. Return to Cutaway or Assembled to operate connected parts.':notice||(setting?'The reset pin is held inward. Click it again to save your chosen numbers.':open?'The latch is clear of the socket. The wheels remain exactly where you left them.':ready?'Click the orange release to move the connected fence and latch.':'Try the release with the wrong numbers to see what blocks it.');$('#feedback').className='feedback '+noticeType;
 $('#reset-desc').textContent=setting?'The reset tongue sits behind the carriage stop, keeping the latch open. Click the release to test it. Save with the pin to withdraw the tongue.':open?'Click The purple reset pin at the left end. Turn the wheels, then click the pin again to save.':'The purple reset pin is physically blocked until the release is held open.';
 $$('.segmented button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===state.view));
 $$('.part-card').forEach(b=>b.setAttribute('aria-pressed',b.dataset.highlight===state.highlight));
 $('#part-detail').textContent=state.highlight?details[state.highlight]:'Select a part to highlight it in the model.';
 sceneApi?.sync();
}
function releaseAction(){return transition(async()=>{
 if(state.mode==='setting'){say('Held open: the reset tongue contacts the carriage stop. Save with the reset pin to re-engage the clutches and clear the stop.','error');render();sceneApi?.heldOpen();await pause();return}
 if(state.mode==='open'){state.mode='locked';say('The spring returns the carriage. The wheels stay in place.');render();await pause();say('Closed. Turn a wheel yourself to block the release again.')}
 else if(aligned().every(Boolean)){say('Waiting for the dials to settle into their detents…');render();await pause();state.mode='open';say('Moving the connected fence and latch…');render();await pause();say('Unlocked. Release held inward; the latch is clear of the socket.','success')}
 else{say('Blocked: a round sleeve edge stops the fence. Align all three notches.','error');render();sceneApi?.blocked();await pause()}
})}
function resetAction(){return transition(async()=>{
 if(state.mode==='locked'){say('Reset pin blocked. Open the lock first to clear the mechanical stop.','error');return}
 if(state.mode==='open'){state.mode='setting';say('Pressing the reset pin to slide the inner sleeves away from the fixed dials…');render();await pause();say('Reset engaged. Turn the wheels, then click the reset pin again to save.')}
 else{say('Waiting for the dials to settle before re-engaging the clutches…');render();await pause();state.code=[...state.digits];state.mode='open';say('Returning the reset pin and re-engaging the clutches…');render();await pause();say(`Combination ${state.code.join(' ')} saved. Click the release to close; the wheels will stay put.`,'success')}
})}
$('#model-release').onclick=releaseAction;$('#model-reset').onclick=resetAction;
$$('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.highlight=null;render()});
$$('[data-highlight]').forEach(b=>b.onclick=()=>{state.highlight=state.highlight===b.dataset.highlight?null:b.dataset.highlight;if(state.highlight&&state.view==='assembled'&&!state.busy)state.view='cutaway';render()});
$('#home-view').onclick=()=>sceneApi?.home();$('#zoom-in').onclick=()=>sceneApi?.zoom(.87);$('#zoom-out').onclick=()=>sceneApi?.zoom(1.15);
render();
try{init3D()}catch(e){$('#fallback').hidden=false;$('#model-ui').hidden=true;console.error('3D initialization failed',e)}
function init3D(){
 const T=THREE,stage=$('#stage'),scene=new T.Scene(),renderer=new T.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=false;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;stage.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const camera=new T.PerspectiveCamera(33,1,.1,100);let azimuth=.3,elevation=.94,distance=18,blockedAt=-1e5,blockedDirection=-1;
 const root=new T.Group();scene.add(root);root.position.y=-.25;
 scene.add(new T.HemisphereLight(0xffffff,0xc6c9ce,1.8));const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(0,12,0);key.castShadow=false;scene.add(key);
 const mat=(color,metalness=.2,roughness=.45)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const green=mat(0x34483c,.45,.36),edge=mat(0x66725c,.55,.32),dark=mat(0x303338,.15,.48),brass=mat(0xd6ab5c,.65,.29),fenceGreen=mat(0x338f81,.52,.3),steel=mat(0x96aaae,.7,.25),black=mat(0x202d23,.3,.42),light=mat(0xe0e8c8,.1,.42),resetMat=mat(0xbda971,.5,.35);
 const dialRim=mat(0x44484e,.4,.4),baseGray=mat(0xcbd0d5,.15,.55),baseEdge=mat(0x34383e,.3,.5),orange=mat(0xef781f,.12,.38),violet=mat(0x8e53c1,.12,.4);
 const parts={dial:[],gate:[],fence:[],latch:[]};
 function mesh(geo,material,parent=root,part){const o=new T.Mesh(geo,material);o.castShadow=false;o.receiveShadow=false;parent.add(o);if(part){o.userData.part=part;parts[part].push(o)}return o}
 function box(w,h,d,x,y,z,m,parent=root,part){const o=mesh(new T.BoxGeometry(w,h,d),m,parent,part);o.position.set(x,y,z);return o}
 function cyl(r,len,x,y,z,m,parent=root,part){const o=mesh(new T.CylinderGeometry(r,r,len,48),m,parent,part);o.rotation.z=Math.PI/2;o.position.set(x,y,z);return o}
 function extrude(shape,width,x,y,z,m,parent=root,part){const o=mesh(new T.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,curveSegments:64}),m,parent,part);o.rotation.y=Math.PI/2;o.position.set(x-width/2,y,z);return o}
 function ring(r,ri,width,x,y,z,m,parent=root,part){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,ri,0,Math.PI*2,true);s.holes.push(hole);return extrude(s,width,x,y,z,m,parent,part)}
 function sector(ro,ri,start,end,width,x,y,z,m,parent,part){const s=new T.Shape();s.moveTo(-ro*Math.cos(start),ro*Math.sin(start));for(let n=1;n<=6;n++){const t=start+(end-start)*n/6;s.lineTo(-ro*Math.cos(t),ro*Math.sin(t))}for(let n=6;n>=0;n--){const t=start+(end-start)*n/6;s.lineTo(-ri*Math.cos(t),ri*Math.sin(t))}s.closePath();return extrude(s,width,x,y,z,m,parent,part)}
 function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 function plate(w,d,h,x,y,z,m,parent=root){const o=mesh(new T.ExtrudeGeometry(rounded(w,d,.3),{depth:h,bevelEnabled:false,curveSegments:20}),m,parent);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);return o}
 const housing=new T.Group();root.add(housing);
 // Dimensions are in illustrative units. Axial clutch gaps and bearing bores are real geometry.
 plate(9.4,4.05,.24,0,-.95,0,green,housing);plate(8.9,3.57,.04,0,-.68,0,baseGray,housing);
 for(const x of [-4.12,4.12])for(const z of [-1.48,1.48]){const screw=mesh(new T.CylinderGeometry(.085,.085,.04,24),steel,housing);screw.position.set(x,-.615,z);box(.105,.004,.018,x,-.592,z,black,housing)}
 const wheelY=.61,wheelZ=-.21,centers=[-2.95,-1.35,.25];
 cyl(.115,5.48,-1.2,wheelY,wheelZ,steel);
 for(const x of [-3.89,1.49]){box(.15,.95,.5,x,-.145,wheelZ,edge);ring(.28,.135,.17,x,wheelY,wheelZ,steel)}
 const wheels=[],sleeves=[],digitMeshes=[];
 const digits=Array.from({length:10},(_,i)=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#303338';ctx.fillRect(0,0,128,128);ctx.font='600 93px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f4f5f6';ctx.fillText(i,64,67);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:texture,roughness:.55})});
 const resetYoke=new T.Group();root.add(resetYoke);
 box(4.95,.12,.14,-1.235,wheelY,-1.35,resetMat,resetYoke,'latch');
 // Cross-interlock: this broad tongue slides behind the open carriage stop.
 // It overlaps the stop before clutch disengagement and retains .005 return play.
 box(.33,.66,.285,-3.775,.34,-1.4325,resetMat,resetYoke,'latch');
 box(.87,.16,.14,-4.13,wheelY,-1.35,resetMat,resetYoke,'latch');
 const resetPin=box(.23,.27,.44,-4.68,wheelY,-1.35,violet,resetYoke,'latch');resetPin.userData.reset=true;
 for(const z of [-1.53,-1.17]){box(.12,1.37,.10,-4.13,.045,z,edge)}
 box(.12,.12,.46,-4.13,.79,-1.35,edge);box(.12,.08,.26,-4.13,.47,-1.35,edge);
 // Dial retainers are fixed to the base. Reset moves only the internal sleeves.
 // Each sliding sleeve is driven by a yoke thrust ring captured in its hub groove.
 for(let i=0;i<3;i++){
  const wheel=new T.Group();wheel.position.set(centers[i],wheelY,wheelZ);root.add(wheel);wheel.userData.dial=i;wheels.push(wheel);
  const drum=ring(.89,.46,.53,-.055,0,0,dark,wheel,'dial');drum.userData.dial=i;digitMeshes.push(drum);
  ring(.19,.145,.65,-.175,0,0,steel,wheel,'dial');
  for(let n=0;n<6;n++){const t=n*Math.PI/3;sector(.465,.185,t-.09,t+.09,.09,-.19,0,0,dialRim,wheel,'dial')}
  // A stationary thrust bearing sits between these dial flanges: axial play .01 each side.
  ring(.405,.19,.06,-.45,0,0,dialRim,wheel,'dial');ring(.405,.19,.06,-.29,0,0,dialRim,wheel,'dial');
  ring(.38,.205,.08,centers[i]-.37,wheelY,wheelZ,steel);
  box(.08,.87,.18,centers[i]-.37,-.205,wheelZ,edge);
  // The face web carries clutch teeth while clearing the fixed shaft collar.
  ring(.46,.20,.04,.19,0,0,dialRim,wheel,'dial');
  // Reset fork fits in the INTERNAL sleeve groove, not in the dial.
  ring(.255,.215,.06,centers[i]+.47,wheelY,wheelZ,resetMat,resetYoke,'latch');
  box(.06,.12,.87,centers[i]+.47,wheelY,-.865,resetMat,resetYoke,'latch');
  for(const x of [-.29,.18]){ring(.91,.87,.055,x,0,0,dialRim,wheel,'dial');for(let n=0;n<50;n++){const th=n*Math.PI*2/50;const grip=box(.06,.02,.045,x,.917*Math.cos(th),.917*Math.sin(th),dark,wheel);grip.rotation.x=th}}
  for(let n=0;n<10;n++){const theta=n*STEP,o=mesh(new T.PlaneGeometry(.40,.47),digits[n],wheel,'dial');o.position.set(-.055,.899*Math.cos(theta),.899*Math.sin(theta));o.rotation.x=theta-Math.PI/2;o.userData.dial=i;digitMeshes.push(o);const t=n*STEP;sector(.32,.20,t+.19,t+.44,.16,.29,0,0,dialRim,wheel,'dial')}
  const sleeve=new T.Group();sleeve.position.set(centers[i]+.65,wheelY,wheelZ);root.add(sleeve);sleeves.push(sleeve);
  const s=new T.Shape(),r=.62,cut=.29;for(let n=0;n<=100;n++){const th=cut+(Math.PI*2-2*cut)*n/100,x=-r*Math.cos(th),y=r*Math.sin(th);n?s.lineTo(x,y):s.moveTo(x,y)}s.lineTo(-.32,-r*Math.sin(cut));s.lineTo(-.32,r*Math.sin(cut));s.closePath();const hole=new T.Path();hole.absarc(0,0,.145,0,Math.PI*2,true);s.holes.push(hole);extrude(s,.2,0,0,0,brass,sleeve,'gate');
  // Sleeve hub spans x=+.23…+.55 relative to the dial center.
  ring(.20,.145,.32,-.26,0,0,brass,sleeve,'gate');
  for(let n=0;n<10;n++){const t=n*STEP;sector(.30,.20,t-.12,t+.12,.22,-.35,0,0,brass,sleeve,'gate')}
  // Two sleeve flanges capture the nonrotating yoke ring, with .005 axial clearance.
  ring(.28,.20,.03,-.23,0,0,brass,sleeve,'gate');
  ring(.28,.20,.03,-.13,0,0,brass,sleeve,'gate');
  // These shaft collars bound sleeve travel; they do not move with reset.
  ring(.19,.119,.055,centers[i]+1.05,wheelY,wheelZ,steel);
  ring(.19,.119,.05,centers[i]+.185,wheelY,wheelZ,steel);
 }
 // Rigid carriage: the release cap, fence fingers, and latch translate together along z.
 const carriage=new T.Group();root.add(carriage);
 box(5.86,.16,.28,-.87,wheelY,1.11,fenceGreen,carriage,'fence');
 for(let i=0;i<3;i++)box(.49,.16,.535,centers[i]+.775,wheelY,.7025,fenceGreen,carriage,'fence');
 box(1.50,.16,.28,2.81,wheelY,1.11,fenceGreen,carriage,'fence');
 box(.38,.16,1.04,3.4,wheelY,1.77,fenceGreen,carriage,'fence'); // tongue reaches z=2.29
 box(.26,.16,1.58,2.85,wheelY,.18,fenceGreen,carriage,'fence'); // rigid stem to release cap
 box(.25,.53,.28,2.85,.955,-.58,fenceGreen,carriage,'fence');
 const slider=plate(1.15,.85,.20,2.85,1.22,-.58,orange,carriage);slider.userData.release=true;
 for(let k=0;k<4;k++)box(.64,.014,.035,2.85,1.427,-.76+k*.12,orange,carriage).userData.release=true;
 // Lower return bridge connects the front carriage to its rear reset interlock stop.
 box(.12,1.10,.16,-3.72,.08,1.11,fenceGreen,carriage,'fence');
 box(.18,.10,2.59,-3.72,-.47,-.105,fenceGreen,carriage,'fence');
 box(.33,.10,.15,-3.645,-.47,-1.35,fenceGreen,carriage,'fence');
 box(.12,.53,.14,-3.54,-.155,-1.35,fenceGreen,carriage,'fence');
 // Guide shoes constrain the carriage, with .03 clearance around its stem.
 for(const x of [2.65,3.05]){box(.10,1.19,.50,x,-.025,.03,edge);box(.10,.14,.50,x,.64,.03,edge)}
 box(.50,.10,.50,2.85,.76,.03,edge);box(.40,.08,.50,2.85,.47,.03,edge);
 // Fixed socket receives the tongue; the open central volume is empty.
 const catchGroup=new T.Group();root.add(catchGroup);catchGroup.position.z=.08;
 plate(1.15,1.15,.24,3.4,-.95,2.23,baseEdge,housing);box(.86,1.05,.54,3.4,-.185,2.36,edge,catchGroup,'latch');
 box(.86,.12,.54,3.4,.40,2.36,edge,catchGroup,'latch');box(.86,.12,.54,3.4,.82,2.36,edge,catchGroup,'latch');
 box(.12,.30,.54,3.03,.61,2.36,edge,catchGroup,'latch');box(.12,.30,.54,3.77,.61,2.36,edge,catchGroup,'latch');box(.62,.30,.12,3.4,.61,2.57,edge,catchGroup,'latch');
 // Compression spring: one endpoint fixed to the base, one seated against the carriage.
 box(.34,1.4,.13,1.97,.06,-.82,edge);box(.31,.25,.08,1.97,wheelY,.95,fenceGreen,carriage,'fence');
 const springMat=steel.clone(),spring=new T.Mesh(new T.BufferGeometry(),springMat);root.add(spring);spring.castShadow=false;
 const springPts=[];let lastSpring=99;
 const cover=new T.Group();root.add(cover);
 const coverShape=rounded(9.4,4.05,.35);
 centers.forEach(x=>{const h=new T.Path(),a=-wheelZ-1.085,b=-wheelZ+1.085;h.moveTo(x-.38,a);h.lineTo(x-.38,b);h.lineTo(x+.27,b);h.lineTo(x+.27,a);h.closePath();coverShape.holes.push(h)});
 const sh=new T.Path();sh.moveTo(2.1,.03);sh.lineTo(2.1,1.48);sh.lineTo(3.6,1.48);sh.lineTo(3.6,.03);sh.closePath();coverShape.holes.push(sh);
 const top=mesh(new T.ExtrudeGeometry(coverShape,{depth:.12,bevelEnabled:false,curveSegments:24}),green,cover);top.rotation.x=-Math.PI/2;top.position.y=1.28;
 box(8.7,1.99,.14,0,.285,-1.96,green,cover);box(6.75,1.99,.14,-.775,.285,1.96,green,cover);box(.45,1.99,.14,4.12,.285,1.96,green,cover);
 box(.14,1.99,2.5,-4.57,.285,.45,green,cover);box(.14,1.99,3.5,4.57,.285,0,green,cover);
 // Paired index marks sit on the shaft's center line; the selected digit is at the crown.
 for(const x of centers)for(const offset of [-.49,.38])box(.10,.02,.07,x+offset,1.41,wheelZ,light,cover);
 
 const grid=new T.GridHelper(26,52,0xc7cec0,0xd7ddcf);grid.position.y=-1.218;grid.material.transparent=true;grid.material.opacity=.32;scene.add(grid);
 const hitPoints=[new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3()];const focus=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
 function viewTarget(){return focus.clone().add(new T.Vector3(0,state.view==='exploded'?.7:0,.1))}
 function cameraUpdate(){const target=viewTarget();camera.position.copy(target).add(new T.Vector3(Math.sin(azimuth)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(azimuth)*Math.cos(elevation)*distance));camera.lookAt(target);camera.updateMatrixWorld();stage.dataset.cameraDistance=distance.toFixed(4)}
 function zoomBy(factor,anchor){
  const next=Math.min(32,Math.max(5,distance*factor));
  if(anchor){const b=renderer.domElement.getBoundingClientRect();pointer.set((anchor.x-b.left)/b.width*2-1,-(anchor.y-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);const target=viewTarget(),plane=new T.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new T.Vector3()),target),point=ray.ray.intersectPlane(plane,new T.Vector3());if(point)focus.add(point.sub(target).multiplyScalar(1-next/distance))}
  distance=next;cameraUpdate();
 }
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<440?43:33;camera.updateProjectionMatrix();cameraUpdate()}
 new ResizeObserver(resize).observe(stage);resize();
 function isVisible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true}
 function hitData(hit){const data={};for(let o=hit?.object;o;o=o.parent)Object.assign(data,o.userData);return data}
 function pick(e){const b=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(root.children,true).find(h=>isVisible(h.object))}
 function pointerAction(e){
  const direct=hitData(pick(e));if(direct.dial!==undefined||direct.release||direct.reset)return direct;
  // Nearby clicks use a single nearest visible part, never overlapping DOM rectangles.
  const choices=[$('#model-dial-0'),$('#model-dial-1'),$('#model-dial-2'),$('#model-release'),$('#model-reset')].map((b,i)=>{const r=b.getBoundingClientRect();return {i,b,d:Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)}}).filter(v=>!v.b.disabled&&v.b.style.visibility==='visible'&&v.d<22).sort((a,b)=>a.d-b.d);
  if(!choices.length)return direct;const i=choices[0].i;return i<3?{dial:i}:i===3?{release:true}:{reset:true};
 }
 const gestures=createLockGestures({pick:pointerAction,turn,orbit:(dx,dy)=>{azimuth-=dx*.008;elevation=Math.max(.27,Math.min(1.46,elevation+dy*.006));cameraUpdate()},zoom:zoomBy,activate:(hit,shift)=>{if(hit.dial!==undefined)turn(hit.dial,shift?-1:1);else if(hit.release)releaseAction();else if(hit.reset)resetAction()}});
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();renderer.domElement.setPointerCapture(e.pointerId);gestures.down(e)});
 renderer.domElement.addEventListener('pointermove',e=>{e.preventDefault();gestures.move(e)});
 renderer.domElement.addEventListener('pointerup',e=>{e.preventDefault();gestures.up(e)});
 renderer.domElement.addEventListener('pointercancel',e=>gestures.cancel(e));
 renderer.domElement.addEventListener('lostpointercapture',e=>gestures.cancel(e));
 window.addEventListener('blur',()=>gestures.clear());
 renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(e.deltaY*(e.ctrlKey?.01:.0015)),{x:e.clientX,y:e.clientY})},{passive:false});
 for(const list of Object.values(parts))for(const o of list)o.material=o.material.clone();
 function sync(){cover.visible=state.view==='assembled';housing.visible=state.view!=='exploded';for(const[part,list]of Object.entries(parts))for(const o of list){o.material.emissive.setHex(state.highlight===part||(state.highlight==='latch'&&part==='fence')?0x73932d:0);o.material.emissiveIntensity=.3}cameraUpdate()}
 let travel=0,spread=0,resetShift=0,previous=0,occlusionAt=0;const occluded=[false,false,false,false,false];const settlers=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function snap(){travel=0;spread=0;resetShift=0;wheels.forEach((w,i)=>{w.rotation.x=angleTargets[i];sleeves[i].rotation.x=-(state.digits[i]-state.code[i])*STEP})}
 sceneApi={sync,settle:()=>new Promise(r=>settlers.push(r)),blocked:()=>{blockedAt=performance.now();blockedDirection=-1},heldOpen:()=>{blockedAt=performance.now();blockedDirection=1},reset:snap,home:()=>{azimuth=.3;elevation=.94;distance=18;focus.set(0,0,0);cameraUpdate()},zoom:zoomBy};
 function tick(time){requestAnimationFrame(tick);const dt=Math.min((time-previous)/1000,.05);previous=time;const smooth=reduced?1:1-Math.exp(-18*dt),setting=state.mode==='setting';
  spread=Number(state.view==='exploded');resetShift+=((setting?.26:0)-resetShift)*smooth;
  cover.position.set(0,spread*1.9,-spread*.8);
  const blockedAge=performance.now()-blockedAt,press=blockedAge<400?Math.sin(blockedAge/400*Math.PI)*(blockedDirection===1?.005:-.025):0;
  travel+=((state.mode!=='locked'?-.30:0)-travel)*smooth;carriage.position.z=travel+press;resetYoke.position.x=resetShift;
  // Exploded separates the dials for inspection; reset never translates them.
  wheels.forEach((w,i)=>{w.rotation.x+=(angleTargets[i]-w.rotation.x)*smooth;w.position.x=centers[i];sleeves[i].position.x=centers[i]+.65+resetShift;w.position.y=wheelY+spread*1.20;if(!setting)sleeves[i].rotation.x=w.rotation.x+state.code[i]*STEP;});
  resetYoke.position.y=0;
  stage.dataset.dialAxialPositions=wheels.map(w=>w.position.x.toFixed(4)).join(',');
  stage.dataset.sleeveAxialPositions=sleeves.map(s=>s.position.x.toFixed(4)).join(',');
  stage.dataset.resetTravel=resetShift.toFixed(4);
  stage.dataset.carriageTravel=carriage.position.z.toFixed(4);
  stage.dataset.selectedDigitAngles=wheels.map((w,i)=>Math.atan2(Math.sin(state.digits[i]*STEP+w.rotation.x),Math.cos(state.digits[i]*STEP+w.rotation.x)).toFixed(4)).join(',');
  stage.dataset.interlockOverlap=Math.max(0,Math.min(-3.61+resetShift,-3.48)-Math.max(-3.94+resetShift,-3.60)).toFixed(4);
  stage.dataset.interlockReturnGap=(-1.575-(-1.28+carriage.position.z)).toFixed(4);
  const end=.91+travel+press,start=-.755;
  if(Math.abs(end-lastSpring)>.0001){lastSpring=end;springPts.length=0;springPts.push(new T.Vector3(1.97,wheelY,start));for(let n=0;n<=144;n++){const p=n/144;springPts.push(new T.Vector3(1.97+.10*Math.cos(p*Math.PI*14),wheelY+.10*Math.sin(p*Math.PI*14),start+p*(end-start)))}springPts.push(new T.Vector3(1.97,wheelY,end));spring.geometry.dispose();spring.geometry=new T.TubeGeometry(new T.CatmullRomCurve3(springPts),180,.018,8,false)}
  root.updateMatrixWorld(true);
  for(let i=0;i<3;i++)hitPoints[i].set(centers[i]-.055,wheelY+spread*1.20+.899,wheelZ);
  hitPoints[3].set(2.85,1.425,-.58+travel);hitPoints[4].set(-4.68+resetShift,wheelY+.13,-1.35);
  const hitButtons=[$('#model-dial-0'),$('#model-dial-1'),$('#model-dial-2'),$('#model-release'),$('#model-reset')];
  if(time-occlusionAt>100){occlusionAt=time;hitButtons.forEach((b,i)=>{const world=hitPoints[i].clone().add(root.position),dir=world.clone().sub(camera.position).normalize();ray.set(camera.position,dir);const h=ray.intersectObjects(root.children,true).find(hit=>isVisible(hit.object));const data=hitData(h);occluded[i]=i<3?data.dial!==i:i===3?!data.release:!data.reset;});}
  const projected=hitPoints.map(p=>p.clone().add(root.position).project(camera));
  hitButtons.forEach((b,i)=>{const p=projected[i],x=(p.x*.5+.5)*stage.clientWidth,y=(-p.y*.5+.5)*stage.clientHeight;const inside=x>15&&x<stage.clientWidth-15&&y>75&&y<stage.clientHeight-35;
   if(i<3){const gap=Math.min(...projected.slice(0,3).filter((_,j)=>j!==i).map(q=>Math.abs(q.x-p.x)*stage.clientWidth*.5));b.style.width=Math.max(24,Math.min(44,gap-5))+'px';}
   b.style.left=x+'px';b.style.top=y+'px';b.style.visibility=inside&&!occluded[i]&&state.view!=='exploded'?'visible':'hidden';
  });
  renderer.render(scene,camera);
  if(settlers.length&&Math.abs(travel-(state.mode!=='locked'?-.30:0))<.00001&&Math.abs(resetShift-(setting?.26:0))<.00001&&wheels.every((w,i)=>Math.abs(w.rotation.x-angleTargets[i])<.00001)&&blockedAge>420){settlers.splice(0).forEach(r=>r())}
 }
 snap();sync();requestAnimationFrame(tick);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#fallback').hidden=false});
}
})();
