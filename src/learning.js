export function emptyLearning(){return {words:{},phonemes:{},confusions:{},history:[]};}
export function levelFor(word,state,boss=false){
 const scores=word.groups.map(g=>state.phonemes[g.phoneme]?.score||0);
 const score=Math.min(state.words[word.id]?.score||0,...scores);
 const base=score>=12?4:score>=7?3:score>=3?2:1;
 return Math.min(4,base+(boss?1:0));
}
export function recordResult(state,word,{errors=0,hint=false,boss=false,now=Date.now(),confusions=[]}={}){
 const old=state.words[word.id]||{score:0,successes:0,last:0};
 const spaced=old.last>0&&now-old.last>=24*60*60*1000;
 const gain=errors?0.25:hint?0.5:spaced?2:1;
 const score=Math.max(0,old.score+gain-(boss?0:Math.min(2,errors*.5)));
 state.words[word.id]={score,successes:old.successes+1,last:now,due:now+(errors?1:score<3?1:score<7?3:7)*86400000};
 for(const g of word.groups){const p=state.phonemes[g.phoneme]||{score:0,successes:0};state.phonemes[g.phoneme]={score:Math.max(0,p.score+gain-(boss?0:Math.min(1,errors*.25))),successes:p.successes+1};}
 for(const {expected,actual} of confusions){const key=expected+'>'+actual;state.confusions[key]=(state.confusions[key]||0)+1;}
 state.history.push({word:word.id,errors,hint,boss,spaced,now});state.history=state.history.slice(-1000);
 return state;
}
export function downgrade(level,consecutive){return consecutive>=2?Math.max(1,level-1):level;}
export function candidates(letter,level=1){
 const sets={a:'aoeu',e:'eiac',i:'ieul',o:'oauc',u:'uona',b:'bdpq',d:'dbpq',p:'pbqd',q:'qpgb',m:'mnwh',n:'nmhr',r:'rnwv',s:'szcf',t:'tdlf',c:'cksg',k:'kcgx',g:'gckd',h:'hnmf',l:'lrti',f:'fvth',v:'vfwz',w:'wvmn',y:'yijv',j:'jygz',x:'xksz',z:'zsvj'};
 return [...new Set(letter+(sets[letter]||'mnsa'))].slice(0,level===1?3:5).concat(level===2?['a','t','s'].filter(x=>!(letter+(sets[letter]||'mnsa')).includes(x)).slice(0,1):[]);
}
export function sharedPool(word){return [...word.letters,...[...new Set(word.letters.flatMap(l=>candidates(l)))].filter(l=>!word.letters.includes(l)).slice(0,4)];}
export function chooseReview(options,state,{now=Date.now(),lastWord=null}={}){
 const known=options.filter(id=>state.words[id]?.successes>0);if(!known.length)return options[0];
 const score=id=>{const w=state.words[id];return (w.due<=now?8:0)+Math.max(0,8-w.score)+(id===lastWord?-6:0);};
 return known.reduce((best,id)=>score(id)>score(best)?id:best,known[0]);
}
