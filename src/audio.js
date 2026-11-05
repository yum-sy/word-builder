import {Soundscape} from './soundscape.js?v=6fe8765269f214f1';
import {volumeValue} from './encounters.js?v=6fe8765269f214f1';
import {PHONEMES} from './phonemes.js?v=6fe8765269f214f1';
export class Sound {
 constructor(){this.context=null;this.assets={};this.reviewPreview=['127.0.0.1','localhost'].includes(location.hostname)&&new URLSearchParams(location.search).get('audio')==='review';this.volume=.8;try{const saved=localStorage.getItem('word-builder-volume');if(saved!==null)this.volume=volumeValue(saved);}catch{}this.levels={};this.master=null;this.token=0;this.source=null;this.cache=new Map();this.missing=new Set();}
 async init(){if(!this.context){this.context=new (window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=this.volume;this.master.connect(this.context.destination);this.soundscape=new Soundscape(this.context,this.master);}await this.context.resume();try{this.levels=(await fetch('./assets/audio/levels.json').then(r=>r.json())).files||{};}catch{}try{this.assets=await fetch('./assets/audio/approved.json').then(r=>r.ok?r.json():{});}catch{this.assets={};}if(this.reviewPreview){try{const library=await fetch('/api/library').then(r=>r.json());for(const item of library.sources)if(!this.assets[item.id])this.assets[item.id]={file:item.phonemeFile,reviewStatus:'pending'};for(const item of library.words)if(item.exists&&!this.assets[item.wordAudio])this.assets[item.wordAudio]={file:`assets/audio/words/${item.id}.wav`,reviewStatus:'pending'};}catch{}}}
 setVolume(value){this.volume=volumeValue(value);if(this.master)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.03);try{localStorage.setItem('word-builder-volume',String(this.volume));}catch{}}
 stop(){this.soundscape?.voice(false);this.token++;if(this.source){try{this.source.stop();}catch{}this.source=null;}}
 async play(id){
  this.stop();const token=this.token;
  const asset=this.assets[PHONEMES[id]?.source||id];if(!asset||(asset.reviewStatus!=='approved'&&!this.reviewPreview)){this.missing.add(id);return;}
  this.soundscape?.voice(true);
  try{let buffer=this.cache.get(asset.file);if(!buffer){const response=await fetch('./'+asset.file);if(!response.ok)throw Error('missing');buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.cache.set(asset.file,buffer);}if(token!==this.token)return;const source=this.context.createBufferSource();source.buffer=buffer;const level=this.context.createGain();level.gain.value=this.levels[asset.file]?.gain||1;source.connect(level).connect(this.master);this.source=source;await new Promise(resolve=>{source.onended=resolve;source.start();});}catch{this.missing.add(id);}finally{if(token===this.token)this.soundscape?.voice(false);}
 }
 frame(phase,key,elapsed,word,tutorial,final){if(!document.hidden)this.soundscape?.update(phase,key,elapsed,word,tutorial,final);}
 quiet(){this.soundscape?.pause();}
 chime(success=true){if(!this.context)return;const t=this.context.currentTime;[0,1,2].forEach((n)=>{const osc=this.context.createOscillator(),gain=this.context.createGain();osc.type='sine';osc.frequency.value=(success?[523,659,784]:[330,392,440])[n];gain.gain.setValueAtTime(0,t+n*.1);gain.gain.linearRampToValueAtTime(.035,t+n*.1+.015);gain.gain.exponentialRampToValueAtTime(.001,t+n*.1+.3);osc.connect(gain).connect(this.master);osc.start(t+n*.1);osc.stop(t+n*.1+.32);});}
}
