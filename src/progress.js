export function settleAction(state,room){
 state.actionPending=false;state.solved=true;
 if(room.kind==='tutorial'){state.mapUnlocked=true;return 'tutorial';}
 if(room.kind==='boss'){
  if(state.bossStep<2){state.bossStep++;state.solved=false;return 'boss-next';}
  if(!state.restored.includes(room.zone))state.restored.push(room.zone);
  return 'reward';
 }
 return 'room';
}
export function nextRoom(state){
 state.puzzle=null;state.actionPending=false;state.solved=false;state.bossStep=0;
 if(state.room===100){state.completed=true;return 'ending';}
 state.room++;return 'explore';
}
export function validSave(s){return !!s&&s.version===1&&Number.isInteger(s.room)&&s.room>=0&&s.room<=100&&Number.isInteger(s.bossStep)&&s.bossStep>=0&&s.bossStep<3&&!!s.learning?.words&&!!s.learning?.phonemes&&Array.isArray(s.learning.history)&&Array.isArray(s.restored)&&s.restored.every(n=>Number.isInteger(n)&&n>=0&&n<10);}

export function stageProgress(state){
 if(state.room===0)return null;
 const index=(state.room-1)%10;
 const finished=state.solved&&!state.actionPending&&(index!==9||state.restored.includes(Math.floor((state.room-1)/10)));
 return {current:index,completed:index+Number(finished)};
}
