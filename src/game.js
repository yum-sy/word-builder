import {thoughtLayout,portraitThoughtLayout} from './scene-layout.js?v=3bd75bd146ccb453';
import {protectGameInput} from './input-guard.js?v=3bd75bd146ccb453';
import {isInstalled,installApp} from './install.js?v=3bd75bd146ccb453';
import {collisionFrame,TUTORIAL_END} from './story.js?v=3bd75bd146ccb453';
import {bossIntro,bossReaction} from './boss.js?v=3bd75bd146ccb453';
import {actionFrame,encounterVariant,ACTION_DURATION,WAIT_X} from './encounters.js?v=3bd75bd146ccb453';
import {settleAction,nextRoom,validSave,stageProgress} from './progress.js?v=3bd75bd146ccb453';
import {WORDS,ROOMS,ZONES,TUTORIAL,LETTER_SOUNDS} from './content.js?v=3bd75bd146ccb453';
import {emptyLearning,chooseReview,levelFor,recordResult,recordSupport,downgrade,candidates,sharedPool} from './learning.js?v=3bd75bd146ccb453';
import {Sound} from './audio.js?v=3bd75bd146ccb453';
import * as art from './art.js?v=3bd75bd146ccb453';
const $=s=>document.querySelector(s), canvas=$('#world'),ctx=canvas.getContext('2d'),ui=$('#ui'),panel=$('#puzzle'),overlay=$('#overlay');
const thoughtCanvas=$('#thought-layer'),thoughtContext=thoughtCanvas.getContext('2d'),tallScreen=matchMedia('(max-aspect-ratio:6/5)');
const qaParams=new URLSearchParams(location.search),qaMode=['127.0.0.1','localhost'].includes(location.hostname)&&qaParams.get('qa')==='1';
const SAVE=qaMode&&qaParams.has('room')?'word-builder-qa-v1':qaParams.get('audio')==='review'?'word-builder-audio-review-v1':qaMode?'word-builder-qa-v1':'word-builder-v1',sound=new Sound();
const fresh=()=>({version:1,room:0,bossStep:0,mapUnlocked:false,restored:[],completed:false,solved:false,puzzle:null,learning:emptyLearning()});
let save;try{save=JSON.parse(localStorage.getItem(SAVE));if(!validSave(save))save=fresh();}catch{save=fresh();}
if(qaMode&&qaParams.has('room')){save=fresh();save.room=Math.max(0,Math.min(100,Number(qaParams.get('room'))||0));save.mapUnlocked=save.room>0;save.restored=Array.from({length:Math.floor(Math.max(0,save.room-1)/10)},(_,i)=>i);}
let phase='title',hero=280,target=280,time=0,start=0,actionStart=0,actionWord='',hintUntil=0,hintStarted=0,puzzle=null,selected=0,locked=false,mapReason='',mapOpenedAt=0,last=performance.now(),openingElapsed=0,frame=0,volumeOpen=false,drag=null,dragSuppressedUntil=0,storageFailed=false,sceneOffset=0,cameraX=0,bossStarted=0,heroFace=1;
const room=()=>{const base=save.room===0?TUTORIAL:ROOMS[save.room-1];return base.kind==='room'&&save.roomWord?{...base,word:save.roomWord,words:[save.roomWord]}:base;};
function prepareReview(){if(save.room>0&&!save.roomWord){const r=ROOMS[save.room-1];if(qaMode&&qaParams.has('room')){save.roomWord=r.word;return;}if(r.kind==='room')save.roomWord=chooseReview(r.reviewOptions,save.learning,{lastWord:save.learning.history.at(-1)?.word});persist();}}
const word=()=>WORDS[room().words[save.bossStep]||room().word];
const waitX=()=>room().kind==='tutorial'?720:WAIT_X;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function persist(){try{localStorage.setItem(SAVE,JSON.stringify(save));}catch{storageFailed=true;}}
function shuffle(a){return a.map(value=>({value,k:Math.random()})).sort((a,b)=>a.k-b.k).map(x=>x.value);}
function icon(name){const paths={map:'<path d="m3 7 7-3 8 3 7-3v21l-7 3-8-3-7 3Z"/><path d="M10 4v21M18 7v21"/>',sound:'<path d="M5 12h5l7-6v22l-7-6H5Z"/><path d="M22 10q7 7 0 14M25 5q12 12 0 24"/>',home:'<path d="m4 15 13-11 13 11M8 12v17h18V12M14 29v-10h6v10"/>'};if(paths[name])return `<svg viewBox="0 0 34 34" width="29" height="29" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;return {close:'×',next:'➜',play:'▶',hint:'?',solve:'!',check:'✓',back:'↶'}[name]||name;}
function button(label,symbol,cls='round',id=''){return `<button class="${cls}" ${id?`id="${id}"`:''} aria-label="${label}">${icon(symbol)}</button>`;}
function hud(){
 const progress=stageProgress(save);
 ui.innerHTML=`<div class="topbar"><div class="brand"><span class="brand-mark">w</span>WORD BUILDER</div><div class="top-right">${save.mapUnlocked?button('Park map','map','round','map-button'):''}${button('Volume','sound','round','sound-button')}${button('Home','home','round','home-button')}</div></div>${progress?`<div class="progress" role="progressbar" aria-label="Stages in this area" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${progress.completed}">${Array.from({length:10},(_,i)=>`<i class="${i<progress.completed?'done':i===progress.current?'current':''}"></i>`).join('')}</div>`:''}`;
 $('#map-button')?.addEventListener('click',()=>showMap('view'));
 $('#sound-button').onclick=()=>{volumeOpen=!volumeOpen;hud();};
 if(volumeOpen){ui.insertAdjacentHTML('beforeend',`<div class="volume-control"><span aria-hidden="true">${icon('sound')}</span><input id="volume" aria-label="Voice volume" type="range" min="20" max="100" step="5" value="${Math.round(sound.volume*100)}"><output id="volume-value">${Math.round(sound.volume*100)}%</output></div>`);$('#volume').oninput=e=>{sound.setVolume(e.target.value/100);$('#volume-value').value=e.target.value+'%';};}
 $('#home-button').onclick=()=>{if(locked)return;sound.stop();save.puzzle=puzzle;persist();phase='title';panel.hidden=true;overlay.hidden=true;$('#game').classList.remove('puzzle-open');drawTitle();};
 if(phase==='explore'&&!locked&&hintUntil<=time&&!save.solved&&Math.abs(hero-waitX())<90){const el=document.createElement('div');el.className='interact';el.style.left=(hero/14)+'%';el.style.top='43%';el.innerHTML=button('Imagine the action','hint','round hint-button','hint-button')+button('Build the word','solve','round solve-button','solve-button');ui.append(el);$('#hint-button').onclick=()=>hint();$('#solve-button').onclick=()=>openPuzzle();}
 if(phase==='explore'&&save.solved&&!locked){ui.insertAdjacentHTML('beforeend',button('Continue','next','round next','next-button'));$('#next-button').onclick=advance;}
}
function drawTitle(){
 sound.quiet();
 const continuing=!!(save.started||save.room>0||save.puzzle||save.solved||save.completed);
 ui.innerHTML=`<div class="title-screen"><h1>WORD<br><span>BUILDER</span></h1><div class="title-actions">${continuing?'<button class="play resume-play" id="play-button"><span aria-hidden="true">▶</span> Keep playing</button><button class="start-over" id="start-over">Start over</button>':button('Play','play','play','play-button')} </div><small>✦ &nbsp; A LITTLE WORD. A BIG ADVENTURE. &nbsp; ✦</small></div><div style="position:absolute;right:25px;bottom:20px;pointer-events:auto">${button('For grown-ups','ⓘ','round','parents')}</div>`;
 $('#play-button').onclick=begin;
 $('#start-over')?.addEventListener('click',()=>{
  sound.stop();save=fresh();puzzle=null;selected=0;locked=false;hintUntil=0;volumeOpen=false;drag=null;heroFace=1;
  panel.hidden=true;overlay.hidden=true;$('#game').classList.remove('puzzle-open');persist();begin();
 });
 $('#parents').onclick=parents;
 if(!isInstalled()){
  ui.insertAdjacentHTML('beforeend','<button class="install-app" id="install-app"><img src="./assets/art/app-icon-192.png" alt="">Install app</button>');
  $('#install-app').onclick=installApp;
 }
}
window.addEventListener('app-install-state',()=>{if(phase==='title')drawTitle();});

function parents(){overlay.hidden=false;overlay.innerHTML=`<section class="parent"><h2>For grown-ups</h2><p>Touch the path to walk. Use the thought bubble for a picture hint. Build a word, then tap Go!</p><p>Progress stays in this browser. No timers, lives, or penalties.</p><p>Whole-word voices, when enabled, are AI-generated. Only reviewed audio is played. </p><p>${storageFailed?'Storage is unavailable. Progress cannot be saved.':'Audio approval and pronunciation review are managed separately.'}</p><button id="parent-close">Close</button></section>`;$('#parent-close').onclick=()=>overlay.hidden=true;}
async function begin(){prepareReview();try{await sound.init();}catch{overlay.hidden=false;overlay.innerHTML='<section class="parent"><p>Audio could not start. Tap Play to try again.</p><button id="retry-audio">Play</button></section>';$('#retry-audio').onclick=begin;return;}save.started=true;persist();overlay.hidden=true;if(save.completed){phase='ending';start=time;hud();return;}if(save.room===0&&!save.puzzle&&!save.solved){phase='opening';start=time;openingElapsed=0;hero=235;target=520;locked=true;hud();}else{phase='explore';hero=save.solved?1100:qaMode&&qaParams.has('room')?waitX():360;target=hero;hud();if(save.actionPending){if(save.room===0)hero=target=325;phase='action';actionStart=time;actionWord=word().id;locked=true;}else if(save.solved&&room().kind==='boss'){showMap('reward');}else if(save.puzzle){puzzle=save.puzzle;openPuzzle(true);}else if(room().kind==='boss')startBossIntro();}}
function newPuzzle(){const w=word();return {word:w.id,letters:w.letters.map(()=>''),level:qaMode&&qaParams.has('level')?Math.max(1,Math.min(4,Number(qaParams.get('level'))||1)):levelFor(w,save.learning,room().kind==='boss'),errors:0,consecutive:0,hint:false,confusions:[],pool:shuffle(sharedPool(w)),options:w.letters.map(l=>shuffle(candidates(l,2)))};}
async function hint(auto=false){if(locked)return;puzzle=puzzle||newPuzzle();recordSupport(save.learning,puzzle,'picture',{automatic:auto});save.puzzle=puzzle;persist();locked=true;if(phase==='puzzle'){panel.setAttribute('aria-busy','true');panel.querySelectorAll('button').forEach(b=>b.disabled=true);}hintStarted=time;hintUntil=Infinity;hud();await sound.play(word().wordAudio);await wait(600);await sound.play(word().wordAudio);await wait(1900);await wait(Math.max(0,(4.8-(time-hintStarted))*1000));hintUntil=0;locked=false;if(phase==='puzzle'){panel.removeAttribute('aria-busy');renderPuzzle();}if(auto)openPuzzle();else hud();}
function openPuzzle(restore=false){if(locked)return;puzzle=restore?puzzle:(puzzle||newPuzzle());if(puzzle.word!==word().id)puzzle=newPuzzle();phase='puzzle';selected=Math.max(0,puzzle.letters.findIndex(l=>!l));panel.hidden=false;$('#game').classList.add('puzzle-open');hud();renderPuzzle();save.puzzle=puzzle;persist();}
function renderPuzzle(bad=[]){const w=word(),level=puzzle.level;panel.style.setProperty('--word-length',w.letters.length);panel.dataset.bank ||= '0';panel.classList.toggle('columns-mode',level<=2);panel.innerHTML=`<div class="puzzle-head">${button('Close puzzle','close','','close-puzzle')}<button id="picture-hint" class="picture-hint" aria-label="Play hint">☁ ▶ Hint</button><button id="submit-word" class="submit" aria-label="Go! Check word"><span>Go!</span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 16h21M17 7l9 9-9 9"/></svg></button></div><div class="slots">${w.letters.map((_,i)=>`<button class="slot ${i===selected?'active':''} ${bad.includes(i)?'bad':''}" data-slot="${i}" aria-label="Letter slot ${i+1}">${puzzle.letters[i]||''}</button>`).join('')}</div><div class="choices"></div>`;
 $('#close-puzzle').onclick=()=>{if(locked)return;phase='explore';panel.hidden=true;$('#game').classList.remove('puzzle-open');hud();};
 $('#picture-hint').onclick=()=>hint();

 panel.querySelectorAll('[data-slot]').forEach(el=>el.onclick=()=>{if(locked)return;selected=Number(el.dataset.slot);if(puzzle.letters[selected])puzzle.letters[selected]='';save.puzzle=puzzle;persist();renderPuzzle();});
 const choices=panel.querySelector('.choices');
 if(level<=2){choices.innerHTML=w.letters.map((l,i)=>{let options=level===1?puzzle.options[i].filter(x=>candidates(l,1).includes(x)):puzzle.options[i];return `<div class="column ${i===selected?'active-column':''}">${options.map(x=>`<button class="letter" data-letter="${x}" data-column="${i}" aria-label="${x}, slot ${i+1}">${x}</button>`).join('')}</div>`;}).join('');}
 else{choices.className='pool';const all=level===4?[...'abcdefghijklmnopqrstuvwxyz']:puzzle.pool;const used={};puzzle.letters.forEach(l=>used[l]=(used[l]||0)+1);choices.innerHTML=all.map((l,i)=>{const consumed=level===3&&used[l]>0;if(consumed)used[l]--;return `<button class="letter" data-letter="${l}" data-pool-index="${i}" data-bank="${Math.floor(i/9)}" ${consumed?'disabled':''} aria-label="${l}">${l}</button>`;}).join('');}
 if(level===4){panel.insertAdjacentHTML('beforeend',`<div class="letter-banks" role="group" aria-label="Letters">${['a–i','j–r','s–z'].map((label,i)=>`<button data-bank-index="${i}" aria-pressed="${panel.dataset.bank===String(i)}">${label}</button>`).join('')}</div>`);panel.querySelectorAll('[data-bank-index]').forEach(b=>b.onclick=()=>{if(locked)return;panel.dataset.bank=b.dataset.bankIndex;renderPuzzle();});}
 panel.querySelectorAll('[data-letter]').forEach(el=>{
 el.onclick=()=>{if(drag?.moved||locked||performance.now()<dragSuppressedUntil)return;place(el.dataset.letter,el.dataset.column===undefined?selected:Number(el.dataset.column));};
 if(level>=3)el.onpointerdown=e=>{if(locked||e.isPrimary===false||e.button!==0||drag)return;drag={pointerId:e.pointerId,letter:el.dataset.letter,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture(e.pointerId);};
 });
 $('#submit-word').disabled=puzzle.letters.some(l=>!l);$('#submit-word').onclick=submit;
}
function place(letter,index){if(!puzzle||phase!=='puzzle'||locked)return;if(index<0||index>=puzzle.letters.length)return;puzzle.letters[index]=letter;selected=puzzle.letters.findIndex(l=>!l);if(selected<0)selected=index;save.puzzle=puzzle;persist();const group=word().groups.find(g=>g.indices.includes(index));sound.play(letter===word().letters[index]?group.phoneme:LETTER_SOUNDS[letter]);renderPuzzle();}
window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)drag.moved=true;if(drag.moved){let ghost=$('.ghost');if(!ghost){ghost=document.createElement('div');ghost.className='ghost';ghost.textContent=drag.letter;document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}});
window.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;$('.ghost')?.remove();if(d.moved){dragSuppressedUntil=performance.now()+350;const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');if(slot&&panel.contains(slot)&&!panel.hidden&&!locked&&phase==='puzzle')place(d.letter,Number(slot.dataset.slot));}setTimeout(()=>{if(drag===d)drag=null;},0);});
function cancelDrag(){if(drag)dragSuppressedUntil=performance.now()+350;$('.ghost')?.remove();drag=null;}
window.addEventListener('pointercancel',cancelDrag);
window.addEventListener('lostpointercapture',e=>{if(drag?.pointerId===e.pointerId){$('.ghost')?.remove();if(drag.moved)dragSuppressedUntil=performance.now()+350;drag=null;}});
protectGameInput($('#game'),cancelDrag);
async function submit(){if(locked||puzzle.letters.some(l=>!l))return;const w=word(),bad=w.letters.map((l,i)=>l!==puzzle.letters[i]?i:-1).filter(i=>i>=0);
 if(bad.length){puzzle.errors++;puzzle.consecutive++;bad.forEach(i=>puzzle.confusions.push({expected:w.letters[i],actual:puzzle.letters[i]}));const next=downgrade(puzzle.level,puzzle.consecutive);if(next!==puzzle.level){puzzle.level=next;puzzle.consecutive=0;}save.puzzle=puzzle;persist();renderPuzzle(bad);return;}
 locked=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);const slots=[...panel.querySelectorAll('.slot')];slots.forEach(s=>s.classList.add('correct'));
 for(const g of w.groups){slots.forEach((s,i)=>s.classList.toggle('speaking',g.indices.includes(i)));await sound.play(g.phoneme);await wait(220);}
 slots.forEach(s=>s.classList.remove('speaking'));await sound.play(w.wordAudio);sound.chime();
 recordResult(save.learning,w,{...puzzle,boss:room().kind==='boss'});save.solved=true;save.actionPending=true;save.puzzle=null;persist();puzzle=null;panel.hidden=true;$('#game').classList.remove('puzzle-open');phase='action';actionStart=time;actionWord=w.id;hud();
}
function startBossIntro(){phase='boss-intro';bossStarted=time;hero=save.bossStep>0?280:waitX();target=waitX();heroFace=1;locked=true;hud();}
function completeAction(){locked=false;phase='explore';const result=settleAction(save,room());persist();
 if(result==='tutorial'||result==='reward')showMap(result);
 else if(result==='boss-next')startBossIntro();
 else {phase='explore';hero=1120;target=1120;hud();}
}
function advance(){if(locked)return;sound.stop();puzzle=null;phase=nextRoom(save);save.roomWord=null;prepareReview();persist();if(phase==='ending'){start=time;locked=true;hud();return;}hero=230;target=230;if(room().kind==='boss')startBossIntro();else hud();}
function showMap(reason){if(locked&&reason==='view')return;mapReason=reason;mapOpenedAt=time;overlay.hidden=false;overlay.innerHTML=`<div class="map-card"><canvas id="map-canvas" aria-label="Amusement park restoration map"></canvas>${button('Close map','close','round close','close-map')}</div>`;$('#close-map').onclick=()=>{overlay.hidden=true;if(mapReason==='tutorial'||mapReason==='reward')advance();};}
canvas.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button!==0||phase!=='explore'||locked||!overlay.hidden)return;const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*1400+cameraX;target=Math.max(130,Math.min(save.solved?1220:waitX(),x));if(x>waitX()-70&&!save.solved)target=waitX();});
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden)sound.quiet();});
window.addEventListener('pagehide',()=>{if(puzzle)save.puzzle=puzzle;persist();});
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);const area=$('#game').getBoundingClientRect();thoughtCanvas.width=Math.round(area.width*d);thoughtCanvas.height=Math.round(area.height*d);cancelDrag();}window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);new ResizeObserver(resize).observe(canvas);resize();
function draw(now){const elapsedDelta=(now-last)/1000,dt=Math.min(elapsedDelta,.1);last=now;time+=document.hidden?0:dt;frame++;const cueStart=phase==='action'?actionStart:phase.startsWith('boss-')?bossStarted:start;sound.frame(phase,phase+':'+cueStart,time-cueStart,word().id,room().kind==='tutorial',save.bossStep===2);ctx.setTransform(canvas.width/1400,0,0,canvas.height/900,0,0);const r=room();
 if(phase==='opening'){openingElapsed=time-start;hero=235+Math.min(openingElapsed,3)*30;if(openingElapsed>11){locked=false;phase='explore';hero=325;target=325;hud();hint(true);}}
 if(phase==='explore'){const old=hero;if(Math.abs(target-hero)>2)heroFace=target>hero?1:-1;hero+=Math.sign(target-hero)*Math.min(Math.abs(target-hero),dt*190);if(Math.abs(old-waitX())>=90&&Math.abs(hero-waitX())<90)hud();if(Math.abs(old-waitX())<90&&Math.abs(hero-waitX())>=90)hud();}
 const stageBox=canvas.getBoundingClientRect(),puzzleShift=phase!=='puzzle'?0:Math.min(tallScreen.matches?0:-125,(panel.getBoundingClientRect().top-stageBox.top-60)/stageBox.height*900-478);sceneOffset+=(puzzleShift-sceneOffset)*Math.min(1,dt*8);const backdrop={time,zone:phase==='ending'&&time-start>12?0:r.zone,scene:phase==='title'?'road':phase==='ending'?(time-start>12?'road':'hall'):r.scene,opening:phase==='opening'?openingElapsed:0,restored:save.restored,title:phase==='title'};art.background(ctx,backdrop);ctx.translate(0,sceneOffset);if(Math.abs(sceneOffset)>.1)art.background(ctx,backdrop);
 // Follow the encounter without changing contact points or shrinking the characters.
 const focusX=r.kind==='tutorial'?0:phase==='boss-reaction'?450:phase==='boss-intro'?320:r.kind==='boss'&&phase==='action'?205+245*actionFrame(actionWord,time-actionStart,hero).cross:['title','ending'].includes(phase)?0:Math.max(0,Math.min(205,(hero-230)*.6));
 if(r.kind==='tutorial')cameraX=0;else cameraX+=(focusX-cameraX)*Math.min(1,dt*3);
 ctx.translate(-cameraX,0);
 const interact=$('.interact');if(interact){const box=canvas.getBoundingClientRect(),gameBox=$('#game').getBoundingClientRect();interact.style.left=(box.left-gameBox.left+(hero-cameraX)/1400*box.width)+'px';interact.style.top=(box.top-gameBox.top+383/900*box.height)+'px';}
 let px=hero,py=653,walk=Math.abs(hero-target)>2&&phase==='explore',running=false,pose='';
 if(phase==='opening'){
  const casting=openingElapsed>=1.5&&openingElapsed<8;
  art.villain(850+Math.max(0,openingElapsed-8)*85,640,time,{pose:openingElapsed<8?'backcast':'away',walking:openingElapsed>=8});walk=openingElapsed<3;pose=openingElapsed>3?'surprise':'';
  if(casting){art.line([[900,400],[980,340],[1135,360]],'#d7a5ef88',11);art.line([[900,400],[980,340],[1135,360]],'#fff2c7',3);art.magic(1135,360,time);art.magic(900,400,time);
   const theft=(openingElapsed-2)/.48,i=Math.floor(theft),p=theft-i;if(i>=0&&i<10){art.ride(1135-p*220,360+p*60,ZONES[i].ride,time,.28*(1-p*.8));}}
 }
 else if(phase==='ending'){
 const et=time-start;
 if(et<=12){
  const drift=Math.max(0,Math.min(et-8,4))*70;
  art.villain(820+drift,640,time,{unmasked:et>3});
  art.child(650+drift,653,time,{walking:et>8,pose:et>5&&et<8?'reach':''});
  if(et>4&&et<8){art.box(748,536,48,28,5,'#efcb78');art.line([[760,540],[760,559]],'#b38b49',2);}
 }else{
  const journey=Math.min(1,(et-12)/8),scale=1-journey*.75;
  if(journey<1){art.child(300+journey*875,653-journey*270,time,{walking:true,scale});art.villain(450+journey*730,640-journey*255,time,{unmasked:true,scale});}
  if(et>20){locked=false;art.sparkles(1165,350,et,35);if(!$('#ending-map')){ui.insertAdjacentHTML('beforeend',button('See restored park','map','round next','ending-map'));$('#ending-map').onclick=()=>showMap('view');}}
 }
 }
 else if(phase!=='title'){
 const activeWord=['action','boss-reaction'].includes(phase)?actionWord:word().id;
 const elapsed=phase==='action'?time-actionStart:save.solved?ACTION_DURATION:0;
 const variant=encounterVariant(activeWord,save.learning.history,phase==='action'||save.solved,r.scene);
 const af=actionFrame(activeWord,elapsed,hero,variant);
 if(r.kind!=='tutorial'){ctx.save();if(phase==='boss-intro'){const bi=bossIntro(time-bossStarted);ctx.globalAlpha=bi.obstacle;ctx.translate(0,-55*(1-bi.obstacle));}art.encounter(activeWord,905,650,time,phase==='action'||save.solved?af.effect:0,variant,af.cross);ctx.restore();}
 if(r.kind==='boss'){
  const intro=phase==='boss-intro'?bossIntro(time-bossStarted):null;
  const reaction=phase==='boss-reaction'?bossReaction(time-bossStarted,save.bossStep===2):null;
  ctx.save();if(reaction)ctx.globalAlpha=1-reaction.vanish;
  art.villain(1190+(reaction?.retreat||0),640,time,{scale:.78,hit:!!reaction,face:reaction||intro&&!intro.turned?1:-1,casting:!!intro?.casting||!!reaction?.casting,pose:reaction&&reaction.label==='...'? 'deflated':intro?.casting&&time-bossStarted<.7?'prepare':!reaction&&(!intro||intro.turned)?'away':''});ctx.restore();
  if(intro){if(intro.casting){art.magic(1130,500,time);art.magic(905,560,time,intro.obstacle);}if(intro.taunting)art.reaction(1190,355,'♪');if(intro.done){phase='explore';locked=false;hud();}}
  if(reaction){px=1130-reaction.teleport*850;py=653-Math.sin(reaction.teleport*Math.PI)*125;pose='surprise';walk=false;
   if(reaction.label)art.reaction(1215,345,reaction.label);
   if(reaction.casting){art.magic(px,570,time);art.magic(1190,490,time);}
   if(reaction.vanish>0){art.magic(1225,530,time,1-reaction.vanish);art.ride(1180,610,ZONES[r.zone].ride,time,.4);}
   if(reaction.done)completeAction();
  }
 }else if(r.kind==='tutorial'){
  const cf=collisionFrame(elapsed,hero),acting=phase==='action';
  if(acting&&cf.portal>0)art.portal(cf.villainX,640,time,cf.portal);
  ctx.save();ctx.globalAlpha=acting?1-cf.vanish:1;
  const departing=1105+Math.min(45,Math.max(0,time-start-11)*9);
  art.villain(acting?cf.villainX:departing,640,time,{scale:.9,walking:acting?cf.villainWalking:departing<1150,hit:acting&&cf.hit,pose:acting?(cf.inspect?'inspect':cf.cape?'cape':cf.hit?'':'away'):'away'});ctx.restore();
  if(acting&&cf.hit)art.reaction(cf.villainX,330,'!');
 }
 if(phase==='action'){
  px=af.x;py=af.y;walk=af.walking;running=af.running;pose=af.pose;
  art.wordEcho(activeWord,px,py-235,elapsed);
  if(r.kind==='tutorial'){
   const cf=collisionFrame(elapsed,hero);px=cf.x;py=cf.y;pose=cf.pose;walk=cf.walking;running=cf.running;
   if(elapsed>=3.65&&elapsed<4.4){for(let i=0;i<3;i++)art.ellipse(px-25-i*17,656+i%2*3,9+i*2,4,'#e6d2a788');}
   if(elapsed>=5.4&&elapsed<5.8){const puff=(elapsed-5.4)/.4;ctx.save();ctx.globalAlpha=1-puff;for(let i=0;i<5;i++)art.ellipse(900+(i-2)*(18+puff*22),655,12+puff*12,5,'#e5cca4');ctx.restore();}
   if(elapsed>11.8&&cf.pickup<1)art.box(1165,620,38,24,4,'#f5e5bb');
  }
  if(r.kind==='tutorial'?elapsed>=TUTORIAL_END:af.done){if(r.kind==='boss'){phase='boss-reaction';bossStarted=time;}else completeAction();}
 }
 }
 if(phase!=='ending'){if(phase==='title'){art.child(180,860,time,{scale:1.1});art.villain(1250,860,time,{scale:1});}else art.child(px,py,time,{walking:walk,running,pose,face:phase==='explore'?heroFace:1});}

 thoughtContext.clearRect(0,0,thoughtCanvas.width,thoughtCanvas.height);
 if(hintUntil>time&&phase!=='title'&&tallScreen.matches){const gameBox=$('#game').getBoundingClientRect(),box=canvas.getBoundingClientRect(),bar=$('.topbar').getBoundingClientRect(),head={x:box.left-gameBox.left+(px-cameraX)/1400*box.width,y:box.top-gameBox.top+(py+sceneOffset-175)/900*box.height};const top=bar.bottom-gameBox.top+35,bottom=Math.min(panel.hidden?gameBox.height:panel.getBoundingClientRect().top-gameBox.top-14,head.y-20);const {scale,x:cx,y:cy}=portraitThoughtLayout(gameBox.width,head.x,top,bottom);thoughtContext.save();thoughtContext.scale(thoughtCanvas.width/gameBox.width,thoughtCanvas.height/gameBox.height);thoughtContext.translate(cx,cy);thoughtContext.scale(scale,scale);art.bubble(thoughtContext,0,0,word().id,Math.min(6.8,(time-hintStarted)*1.42),encounterVariant(word().id,save.learning.history,false,r.scene),r.kind==='tutorial',{x:(head.x-cx)/scale,y:(head.y-cy)/scale});thoughtContext.restore();}
 if(hintUntil>time&&phase!=='title'&&!tallScreen.matches){ctx.save();ctx.translate(cameraX,-sceneOffset);const head={x:px-cameraX,y:py+sceneOffset-175};let layout={x:Math.max(230,Math.min(1170,head.x+270)),y:310,scale:1};if(phase==='puzzle'){const bounds=canvas.getBoundingClientRect(),bar=$('.topbar').getBoundingClientRect(),tray=panel.getBoundingClientRect();layout=thoughtLayout(head.x,(bar.bottom-bounds.top)/bounds.height*900+16,(tray.top-bounds.top)/bounds.height*900-20);}ctx.translate(layout.x,layout.y);ctx.scale(layout.scale,layout.scale);art.bubble(ctx,0,0,word().id,Math.min(6.8,(time-hintStarted)*1.42),encounterVariant(word().id,save.learning.history,false,r.scene),r.kind==='tutorial',{x:(head.x-layout.x)/layout.scale,y:(head.y-layout.y)/layout.scale});ctx.restore();}
 if(phase==='explore'&&!save.solved&&hero<waitX()-100){art.use(ctx);art.ellipse(waitX(),664,22+Math.sin(time*3)*4,7,'#fff3cd99');art.line([[waitX()-12,656],[waitX(),646],[waitX()+12,656]],'#f9f0da',4);}
 if(!overlay.hidden&&$('#map-canvas')){const mc=$('#map-canvas'),rect=mc.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(mc.width!==Math.round(rect.width*d)){mc.width=Math.round(rect.width*d);mc.height=Math.round(rect.height*d);}art.map(mc.getContext('2d'),mc.width,mc.height,save.restored,time,mapReason==='reward'?room().zone:-1,Math.min(1,(time-mapOpenedAt)/2));}
 requestAnimationFrame(draw);
}
async function startGame(){
 const boot=$('#boot-screen'),progress=$('#boot-progress');
 const update=setInterval(()=>{const status=art.artLoadProgress();progress.value=status.total?status.ready/status.total*100:0;},80);
 try{
  await art.loadArt();clearInterval(update);progress.value=100;
  $('#game').setAttribute('aria-busy','false');boot.remove();last=performance.now();drawTitle();requestAnimationFrame(draw);
 }catch{
  clearInterval(update);$('#boot-message').textContent='Could not load the game.';
  $('#boot-retry').hidden=false;$('#boot-retry').onclick=()=>location.reload();
 }
}
startGame();
