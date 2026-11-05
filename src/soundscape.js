// Original sparse pentatonic music: no vocals or percussion under phonics.
export const BEAT=60/68;
const melody=[74,null,78,null,81,null,78,null,76,null,74,null,71,null,null,null,74,null,76,null,78,null,76,null,69,null,71,null,74,null,null,null];
export function musicNote(step){const i=step%32;return {melody:melody[i],bass:i%8===0?[50,47,43,45][Math.floor(i/8)]:null};}
export function actionCues(word){
 const pair=(kind,times)=>times.map(at=>({at,kind}));
 const groups={run:pair('step',[1,1.6,2.2,2.8,3.4,4,4.6,5.2]),hop:pair('land',[3.97,4.7,5.42,6.15]),cut:[{at:1.9,kind:'snip'},{at:2.8,kind:'wood'}],dig:pair('sand',[1.4,2,2.6]),pop:pair('pop',[1.2,1.5,1.8,2.1,2.4,2.7]),chop:pair('wood',[1.8,2.4]),tap:pair('bell',[1.5]),drum:pair('drum',[1.4,1.75,2.1]),horn:pair('horn',[1.5]),clap:pair('clap',[1.5,1.9]),net:[{at:1.5,kind:'water'},{at:2.9,kind:'latch'}],fish:[{at:1.5,kind:'water'},{at:2.9,kind:'latch'}],rope:pair('wood',[1.6,2.8]),kite:[{at:1.5,kind:'air'},{at:2.8,kind:'latch'}],spin:pair('turn',[1.5,2.2]),turn:pair('turn',[1.5,2.2]),coin:[{at:1.5,kind:'bell'},{at:2.8,kind:'latch'}],shut:pair('wood',[2.7]),stop:pair('sand',[1.6]),slide:pair('air',[3.6]),cube:pair('wood',[2,4.2,5]),seed:pair('grow',[1.4,2.4]),rain:pair('water',[1.4,2,2.6]),boat:pair('water',[3.5,4.6,5.7]),ship:pair('water',[3.5,4.6,5.7]),car:[{at:2.6,kind:'latch'},{at:3.6,kind:'roll'}],team:pair('wood',[2.5]),fork:pair('sand',[1.7,2.5]),toy:pair('pop',[1.8,2.4]),sun:pair('glow',[2]),cloud:pair('air',[2])};return groups[word]||[];
}
export function sceneCues(phase,word,tutorial=false,final=false){
 if(phase==='opening')return [{at:1.5,kind:'magic'},{at:4,kind:'glow'},{at:6.5,kind:'magic'}];
 if(phase==='boss-intro')return [{at:.7,kind:'magic'},{at:2,kind:'wood'}];
 if(phase==='boss-reaction')return final?[{at:2.5,kind:'portal'}]:[{at:.08,kind:'pop'},{at:1.5,kind:'portal'}];
 if(phase!=='action')return [];
 if(tutorial)return [{at:1,kind:'step'},{at:2,kind:'step'},{at:3,kind:'step'},{at:3.7,kind:'sand'},{at:4.4,kind:'bump'},{at:5.4,kind:'land'},{at:10.3,kind:'portal'}];
 return actionCues(word);
}
export class Soundscape{
 constructor(context,master){this.context=context;this.music=context.createGain();this.effects=context.createGain();this.music.gain.value=0;this.effects.gain.value=.12;this.music.connect(master);this.effects.connect(master);this.nodes=new Set();this.step=0;this.next=0;this.mode='title';this.speaking=false;this.hold=0;this.scene='';this.fired=new Set();this.timer=null;this.noise=context.createBuffer(1,context.sampleRate,context.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
 voice(active){this.speaking=active;if(!active)this.hold=this.context.currentTime+.65;this.mix();}
 mix(){const t=this.context.currentTime,duck=this.speaking||t<this.hold,level=this.mode==='title'?0:this.mode==='puzzle'?.055:.1;this.music.gain.setTargetAtTime(duck?level*.06:level,t,duck?.025:.5);this.effects.gain.setTargetAtTime(duck?0:.12,t,.025);}
 tone(freq,at,duration,peak,bus=this.music,type='sine',end=freq){const osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(peak,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain).connect(bus);this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+duration+.03);}
 hiss(at,duration,freq,peak=.14){const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();source.buffer=this.noise;filter.type='lowpass';filter.frequency.value=freq;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(peak,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(filter).connect(gain).connect(this.effects);this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+duration);}
 fx(kind){if(this.speaking||this.context.currentTime<this.hold||this.mode==='title')return;const t=this.context.currentTime,b=this.effects;
 if(['magic','portal','grow','glow'].includes(kind)){const notes=kind==='portal'?[784,587,392]:kind==='grow'?[294,370,440]:[587,740,880];notes.forEach((n,i)=>this.tone(n,t+i*.11,.5,.16,b));if(kind==='portal')this.hiss(t,.6,900,.12);}
 else if(kind==='water'){this.hiss(t,.55,1100,.12);this.tone(440,t,.2,.1,b,'sine',220);}
 else if(['air','sand','snip','clap','roll'].includes(kind)){this.hiss(t,kind==='air'?.65:kind==='roll'?.7:.15,kind==='clap'?1500:900,kind==='snip'?.2:.13);}
 else if(kind==='bell'){this.tone(784,t,.5,.2,b);this.tone(1176,t,.3,.04,b);}
 else if(kind==='horn'){this.tone(196,t,.55,.18,b,'triangle');this.tone(294,t,.5,.05,b);}
 else if(kind==='pop'){this.tone(460,t,.11,.25,b,'sine',140);}
 else if(kind==='turn'){this.tone(180,t,.25,.14,b,'triangle',240);}
 else {this.tone(kind==='drum'?130:kind==='wood'?220:95,t,.18,.23,b,'sine',55);if(kind==='latch'||kind==='wood')this.hiss(t,.08,1000,.09);}
 }
 tick(){if(this.mode==='title'||this.context.state!=='running')return;this.mix();const t=this.context.currentTime;if(this.next<t-.3)this.next=t+.05;while(this.next<t+.15){const note=musicNote(this.step++);if(note.melody)this.tone(440*2**((note.melody-69)/12),this.next,1.5,.085);if(note.bass)this.tone(440*2**((note.bass-69)/12),this.next,3,.06);this.next+=BEAT;}}
 update(phase,key,elapsed,word,tutorial,final){if(this.mode!==phase){this.mode=phase;this.mix();}if(phase==='title'){this.pause();return;}if(!this.timer){this.next=this.context.currentTime+.1;this.timer=setInterval(()=>this.tick(),100);this.tick();}if(key!==this.scene){this.scene=key;this.fired.clear();}sceneCues(phase,word,tutorial,final).forEach((cue,i)=>{if(!this.fired.has(i)&&elapsed>=cue.at){this.fired.add(i);if(elapsed-cue.at<.25)this.fx(cue.kind);}});}
 pause(){if(this.timer){clearInterval(this.timer);this.timer=null;}for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();this.music.gain.setTargetAtTime(0,this.context.currentTime,.03);}
}
