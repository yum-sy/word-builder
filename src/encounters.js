// One timeline drives both the real encounter and the imagined demonstration.
export const clamp = n => Math.max(0, Math.min(1, n));
export const ease = n => { const p=clamp(n); return p*p*(3-2*p); };
export const ACTION_DURATION=6.8;
export const WAIT_X=620;
// Standing bodies stay left of solid fixtures; hands may reach into the tool area.
export function actionAnchor(word){return ({cut:700,dig:730,chop:730,drum:730,tap:715,spin:675,turn:675,coin:675,rope:700,kite:700,seed:700,net:750,fish:750,sun:700,rain:700,cloud:700,shut:800})[word]||750;}

export function encounterVariant(word,history=[],pending=false,scene=''){
 const count=history.filter(entry=>entry.word===word).length-(pending?1:0);
 const indoors=['workshop','greenhouse','theatre','gallery','atelier','hall'].includes(scene);
 if(word==='cut'&&indoors)return 1+Math.max(0,count)%2;
 if(word==='hop'&&indoors)return 1;
 return Math.max(0,count)%3;
}
export function actionFrame(word,seconds,origin=WAIT_X,variant=0){
 const effect=ease((seconds-.8)/2.3),cross=ease((seconds-3.25)/2.9),anchor=actionAnchor(word);
 let x=origin+(anchor-origin)*ease(seconds/.8),y=653,pose=seconds<3.25?'reach':'',walking=false,running=false;
 if(seconds>=3.25){x=anchor+cross*(1130-anchor);walking=cross<1;}
 if(seconds<3.25){
  const acting={clap:'clap',rope:'pull',kite:'pull',net:'pull',fish:'pull',team:'push',shut:'push',stop:'push',seed:'plant',dig:'plant',fork:'pull',horn:'blow',hop:'crouch'};
  pose=seconds<.55?'':acting[word]||'reach';
 }
 if(word==='run'){x=seconds<.7?origin-25*ease(seconds/.7):origin-25+(1155-origin)*ease((seconds-.7)/4.6);running=seconds>.7&&seconds<5.3;walking=seconds<=.7;pose='';}
 if(word==='hop'&&seconds>=3.25){const step=clamp((seconds-3.25)/2.9)*4,index=Math.min(3,Math.floor(step)),part=step>=4?1:step%1,landings=[750,810,905,1000,1130],height=variant===1?42:10,heights=[0,height,height,height,0];x=landings[index]+(landings[index+1]-landings[index])*part;y-=heights[index]+(heights[index+1]-heights[index])*part+Math.sin(part*Math.PI)*83;walking=false;pose=part>.08&&part<.92?'jump':'crouch';}
 if(word==='slide'){y-=seconds<3.25?125*ease(seconds/2):125*(1-cross);pose=seconds>=3.25?'slide':pose;}
 if(['boat','ship','car'].includes(word)&&seconds>=1.2){const board=ease((seconds-1.2)/.65),exit=ease((seconds-6.15)/.65);y-=(35*board+10*Math.sin(cross*Math.PI))*(1-exit);walking=false;pose='slide';}
 if(word==='cube'&&seconds>=3.25){const u=cross;y-=u<.35?62*ease(u/.35):u<.7?62+53*ease((u-.35)/.35):115*(1-ease((u-.7)/.3));}
 if(word==='seed'&&seconds>=3.25)y-=Math.sin(cross*Math.PI)*75;
 if(seconds>=6.2){pose='cheer';walking=false;running=false;}
 return {effect,cross,x,y,pose,walking,running,done:seconds>=ACTION_DURATION};
}
export function volumeValue(value){const n=Number(value);return Number.isFinite(n)?Math.max(.2,Math.min(1,n)):.8;}
