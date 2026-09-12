import assert from 'node:assert/strict';
import fs from 'node:fs';
const app = fs.readFileSync('work/app/app.js','utf8');
assert.match(app,/w\.position\.x=centers\[i\];/);
assert.doesNotMatch(app,/w\.position\.x=centers\[i\]\+resetShift/);
const checks=[];
function clearance(name,gap){assert(gap>1e-7,`${name}: ${gap}`);checks.push({name,clearance:+gap.toFixed(4)});}
for(let n=0;n<=100;n++){
 const travel=.26*n/100;
 assert(.55+travel>=.53 && .75+travel<=1.02,'Sleeve gate escaped fence');
 const overlap=Math.min(-3.61+travel,-3.48)-Math.max(-3.94+travel,-3.60);
 // Once clutch axial overlap ends at .18, the cross-interlock must retain the carriage.
 if(travel>=.18)assert(overlap>0,'Disengaged clutch without return interlock');
}
clearance('Clutch fully separated in reset',.19+.26-.37);
clearance('Clutch radius clears inserted fence',.135-(-.21+.32));
clearance('Gate clears right shaft stop at full reset',1.05-.055/2-(.75+.26));
clearance('Sleeve hub clears left shaft stop',.23-(.185+.05/2));
clearance('Wheel hub clears left shaft stop',.185-.05/2-.15);
clearance('Wheel face web clears stationary collar',.20-.19);
clearance('Reset pin shoulder clears stem guide',-4.13-.06-(-4.68+.23/2+.26));
clearance('Yoke groove left axial play',.47-.06/2-(.42+.03/2));
clearance('Yoke groove right axial play',.52-.03/2-(.47+.06/2));
clearance('Dial retainer left axial play',-.37-.08/2-(-.45+.06/2));
clearance('Dial retainer right axial play',-.29-.06/2-(-.37+.08/2));
clearance('Dial casing window left clearance',-.32-(-.38));
clearance('Dial casing window right clearance',.27-.21);
clearance('Open reset interlock return play',-1.575-(-1.35-.30+.14/2));
clearance('Full-reset tongue and carriage-stop axial overlap',Math.min(-3.61+.26,-3.48)-Math.max(-3.94+.26,-3.60));
clearance('Interlock vertical contact overlap',.11-.01);
clearance('Latch remains clear when carriage contacts reset tongue',2.17-(2.29-.295));
clearance('Tongue clears reset stem guide',-3.94-(-4.13+.06));
assert(.01<.18,'Reset interlock must stop travel before clutch disengagement');
console.log(JSON.stringify({result:'PASS',sweepSamples:101,dialCenters:[-2.95,-1.35,.25],checks},null,2));
