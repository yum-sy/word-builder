import {sourceToPhoneme} from './phonemes.js?v=cb17e6fb03d912ce';
// Explicit grapheme-to-phoneme correspondence. Silent-e groups are noncontiguous.
const records = [
 ['run','r,u,n','r-rid,u-up,n-nap','run',0],
 ['sun','s,u,n','s-sit-mess,u-up,n-nap','sun',1],
 ['cut','c,u,t','c-cut,u-up,t-tuck','cut',1],
 ['hop','h,o,p','h-hat,o-octopus,p-pick','hop',1],
 ['dig','d,i,g','d-dip,i-igloo,g-get','dig',2],
 ['tap','t,a,p','t-tuck,a-apple,p-pick','tap',2],
 ['pop','p,o,p','p-pick,o-octopus,p-pick','pop',2],
 ['net','n,e,t','n-nap,e-elephant,t-tuck','net',2],
 ['stop','s,t,o,p','s-sit-mess,t-tuck,o-octopus,p-pick','stop',3],
 ['spin','s,p,i,n','s-sit-mess,p-pick,i-igloo,n-nap','spin',3],
 ['clap','c,l,a,p','c-cut,l-lip,a-apple,p-pick','clap',3],
 ['drum','d,r,u,m','d-dip,r-rid,u-up,m-mug','drum',3],
 ['ship','sh,i,p','sh-ship,i-igloo,p-pick','ship',4],
 ['chop','ch,o,p','ch-chick,o-octopus,p-pick','chop',4],
 ['fish','f,i,sh','f-fun,i-igloo,sh-ship','fish',4],
 ['shut','sh,u,t','sh-ship,u-up,t-tuck','shut',4],
 ['rope','r,o_e,p','r-rid,o-rope,p-pick','rope',6],
 ['kite','k,i_e,t','k-kit,i-kite,t-tuck','kite',6],
 ['slide','s,l,i_e,d','s-sit-mess,l-lip,i-kite,d-dip','slide',6],
 ['cube','c,u_e,b','c-cut,u-use-cue,b-bat','cube',6],
 ['rain','r,ai,n','r-rid,a-cake,n-nap','rain',7],
 ['seed','s,ee,d','s-sit-mess,e-team,d-dip','seed',7],
 ['boat','b,oa,t','b-bat,o-rope,t-tuck','boat',7],
 ['team','t,ea,m','t-tuck,e-team,m-mug','team',7],
 ['car','c,ar','c-cut,ar-jar','car',8],
 ['horn','h,or,n','h-hat,or-fork,n-nap','horn',8],
 ['fork','f,or,k','f-fun,or-fork,k-kit','fork',8],
 ['turn','t,ur,n','t-tuck,er-herd-bird-turn,n-nap','turn',8],
 ['coin','c,oi,n','c-cut,oi-soil-toy,n-nap','coin',9],
 ['toy','t,oy','t-tuck,oi-soil-toy','toy',9],
 ['cloud','c,l,ou,d','c-cut,l-lip,ou-how-out,d-dip','cloud',9],
];
export const WORDS=Object.fromEntries(records.map(([id,graphemes,audio,action,zone])=>{
 let cursor=0; const groups=graphemes.split(',').map((g,i)=>{
  let indices;
  if(g.includes('_')) {indices=[cursor,id.length-1];cursor++;}
  else {indices=Array.from({length:g.length},()=>cursor++);}
  return {grapheme:g,indices,phoneme:sourceToPhoneme[audio.split(',')[i]]};
 });
 return [id,{id,letters:[...id],groups,action,zone,wordAudio:`word-${id}`,reviewStatus:'draft'}];
}));
const sourceLetters={a:'a-apple',b:'b-bat',c:'c-cut',d:'d-dip',e:'e-elephant',f:'f-fun',g:'g-get',h:'h-hat',i:'i-igloo',j:'j-jog',k:'k-kit',l:'l-lip',m:'m-mug',n:'n-nap',o:'o-octopus',p:'p-pick',q:'qu-quest',r:'r-rid',s:'s-sit-mess',t:'t-tuck',u:'u-up',v:'v-van',w:'w-will',x:'x-mix-rocks',y:'y-yes',z:'z-zip-buzz'};
export const LETTER_SOUNDS=Object.fromEntries(Object.entries(sourceLetters).map(([l,source])=>[l,sourceToPhoneme[source]]));
export const ZONES=[
 {name:'The park road',goal:'Basic CVC /ʌ, ɒ/; run, sun, cut, hop',color:'#d5ead5',ride:'carousel',sequence:['sun','cut','run','hop','sun','cut','hop','sun','run'],boss:['run','cut','hop']},
 {name:'The garden',goal:'CVC /æ, ɪ, e/ contrasted with prior vowels',color:'#c6dfc0',ride:'ferris',sequence:['dig','tap','sun','pop','dig','net','tap','pop','hop'],boss:['dig','pop','net']},
 {name:'The music meadow',goal:'Separate consonants in clusters',color:'#d7e6b5',ride:'swings',sequence:['stop','spin','tap','clap','stop','drum','spin','clap','run'],boss:['stop','spin','drum']},
 {name:'The riverside',goal:'sh and ch as one sound across two letters',color:'#b8e2df',ride:'pirate',sequence:['ship','chop','hop','fish','ship','shut','chop','fish','cut'],boss:['ship','chop','shut']},
 {name:'The picnic trail',goal:'Spaced CVC, blend and digraph review',color:'#ecdcb2',ride:'teacups',sequence:['sun','dig','clap','ship','hop','chop','net','stop','shut'],boss:['hop','clap','shut']},
 {name:'The wind hills',goal:'Long vowels in split vowel-consonant-e patterns',color:'#dcd9f0',ride:'coaster',sequence:['rope','kite','cut','slide','rope','cube','kite','slide','hop'],boss:['rope','kite','cube']},
 {name:'The lakeside',goal:'ai, ee, oa, ea vowel teams',color:'#b8dfec',ride:'boats',sequence:['rain','seed','sun','boat','rain','team','seed','boat','ship'],boss:['rain','seed','team']},
 {name:'The workshop',goal:'ar, or, ur; rhotic pronunciation pending review',color:'#f0d1b6',ride:'cars',sequence:['car','horn','stop','fork','car','turn','horn','fork','spin'],boss:['car','horn','turn']},
 {name:'The cloud path',goal:'oi / oy and ou diphthongs',color:'#e7d6ed',ride:'balloons',sequence:['coin','toy','kite','cloud','coin','rain','toy','cloud','boat'],boss:['coin','toy','cloud']},
 {name:'The castle gate',goal:'Integrated review and cooperation',color:'#cfdbec',ride:'train',sequence:['run','rope','seed','ship','cut','cloud','team','slide','sun'],boss:['run','cut','team']},
];
export const SCENARIOS={
 run:['A magical path moves backwards; walking loses ground','Run faster than the moving path to reach the far end; tutorial: chase the departing villain'],
 sun:['A cold puddle blocks the path under a grey cloud','Sunlight dries the puddle and the flowers open'],
 cut:['A rope holds a footbridge upright','Cut the rope; the bridge lowers across the stream'],
 hop:['Stepping stones rise above a muddy puddle','Hop from stone to stone to the far bank'],
 dig:['A mound buries the end of the path','Dig out the mound and reveal the stone path'],
 tap:['A sleepy snail rests in the middle of the path','Tap the bell; the snail wakes and crawls aside'],
 pop:['Large soap bubbles fill the passage','Pop the bubbles to clear the passage'],
 net:['A gate key floats out of reach','Scoop the key with a visible mesh net, lift it to the lock and open the gate'],
 stop:['A runaway cart rolls across the path','Stop the cart safely with an outstretched hand'],
 spin:['A pinwheel mechanism holds a bridge upright','Spin the blades around their centre to lower the connected bridge'],
 clap:['A flock of birds rests across the path','Clap hands; the birds fly into the trees'],
 drum:['A sleeping snail blocks the path','Strike a visible drum; sound waves wake the snail and it crawls aside'],
 ship:['A wide river has no crossing','A ship arrives and carries the child across'],
 chop:['A fallen log blocks the road','Chop the log into short pieces and clear it'],
 fish:['A key on a hook has fallen into the water','Fish the key out with a rod; open the gate'],
 shut:['An open wind gate blows leaves into the road','Shut the gate to stop the wind'],
 rope:['A raised bridge has an out-of-reach release','Pull a visible rope threaded over a pulley; the latch releases and the bridge lowers'],
 kite:['A bridge release must be lifted above reach','Wind lifts a kite and its attached string pulls the high latch; the bridge lowers'],
 slide:['A smooth slope leads down to the path','Slide down the slope safely'],
 cube:['A low platform is missing its first step','A three-dimensional cube supplies the lower step; climb onto and off the platform'],
 rain:['A dry pond leaves a floating bridge on the ground','Rain fills the pond and raises the bridge'],
 seed:['A gap in the path has an empty planter at its edge','Plant a visible seed; a magical vine grows across the gap into a leafy crossing'],
 boat:['A narrow stream separates the two banks','A small boat carries the child across'],
 team:['A heavy cart needs more than one person to move it','A team of friends pushes the cart together'],
 car:['A long road leads to a distant arch','Ride in a car to reach the arch'],
 horn:['A sleeping animal blocks the road','Sound a horn; it wakes and moves aside'],
 fork:['Hay blocks the trail','Use a garden fork to lift the hay aside'],
 turn:['A rotating bridge points away from the far bank','Turn the handle to align the bridge'],
 coin:['A coin-operated footbridge needs its token','Place a coin in its slot to lower the bridge'],
 toy:['A puppy guards the narrow path','Give the puppy a toy; it plays beside the path'],
 cloud:['The stepping stones are too hot in bright sun','A cloud shades the stones so the child can cross'],
};
// Authored order, never procedurally generated. A room may choose a documented review variant later.
export const ROOMS=ZONES.flatMap((z,zi)=>[...z.sequence.map((word,i)=>({id:zi*10+i+1,zone:zi,word,words:[word],kind:'room',variant:i%3,scenario:SCENARIOS[word],next:zi*10+i+2})),{id:zi*10+10,zone:zi,word:z.boss[0],words:z.boss,kind:'boss',variant:0,next:zi===9?null:zi*10+11}]);
export const TUTORIAL={id:0,zone:0,word:'run',words:['run'],kind:'tutorial',variant:0,next:1};

export const SCENES={
 road:{name:'Park road',asset:'road',indoor:false},garden:{name:'Riverside garden',asset:'zones',tile:0,indoor:false},hills:{name:'Wind hills',asset:'zones',tile:1,indoor:false},yard:{name:'Workshop courtyard',asset:'zones',tile:2,indoor:false},
 workshop:{name:'Repair workshop',asset:'insideA',tile:0,indoor:true},greenhouse:{name:'Glass greenhouse',asset:'insideA',tile:1,indoor:true},theatre:{name:'Little theatre',asset:'insideA',tile:2,indoor:true},boathouse:{name:'Boathouse',asset:'insideA',tile:3,indoor:true},
 fortress:{name:'Modern fortress approach',asset:'insideB',tile:0,indoor:false},gallery:{name:'The villain’s gallery',asset:'insideB',tile:1,indoor:true},atelier:{name:'The villain’s private workshop',asset:'insideB',tile:2,indoor:true},hall:{name:'The grand glass hall',asset:'insideB',tile:3,indoor:true},
};
const routes=[
 ['road','workshop','workshop','yard','greenhouse','greenhouse','garden','road','road','yard'],
 ['garden','greenhouse','greenhouse','workshop','garden','boathouse','boathouse','yard','garden','garden'],
 ['yard','workshop','workshop','theatre','theatre','theatre','yard','garden','road','theatre'],
 ['garden','boathouse','boathouse','garden','garden','boathouse','workshop','garden','boathouse','boathouse'],
 ['greenhouse','garden','theatre','garden','boathouse','workshop','boathouse','yard','theatre','theatre'],
 ['workshop','hills','yard','hills','boathouse','workshop','hills','yard','garden','hills'],
 ['garden','greenhouse','greenhouse','garden','greenhouse','workshop','greenhouse','garden','garden','greenhouse'],
 ['yard','workshop','workshop','garden','yard','workshop','yard','garden','workshop','workshop'],
 ['theatre','atelier','hills','hills','gallery','garden','atelier','fortress','garden','fortress'],
 ['fortress','gallery','greenhouse','boathouse','atelier','fortress','gallery','hall','greenhouse','hall'],
];
ROOMS.forEach(r=>{r.scene=routes[r.zone][(r.id-1)%10];r.indoor=SCENES[r.scene].indoor;});TUTORIAL.scene='road';
// A bounded set of authored alternatives for repeated review rooms, never random room generation.
const sceneWords={road:['run','sun','hop','cut'],garden:['sun','hop','dig','net','fish','rain','seed','boat'],hills:['run','sun','hop','kite','slide','cloud'],yard:['run','cut','hop','pop','stop','car','horn','team'],workshop:['cut','tap','pop','stop','spin','rope','cube','team','turn'],greenhouse:['sun','tap','seed','rain','dig'],theatre:['run','tap','clap','drum','spin','shut','coin'],boathouse:['cut','hop','net','ship','fish','rope','boat','turn'],fortress:['run','hop','stop','kite','cloud','car'],gallery:['run','pop','shut','cube','team','coin'],atelier:['cut','tap','pop','spin','cube','toy','team','turn'],hall:['run','cut','shut','team']};
const introduced=new Set(['run']),zoneSeen=ZONES.map(()=>new Set());
ROOMS.forEach(r=>{const repeated=introduced.has(r.word)&&zoneSeen[r.zone].has(r.word);r.reviewOptions=r.kind==='room'&&repeated?[r.word,...sceneWords[r.scene].filter(w=>w!==r.word&&introduced.has(w))]:[r.word];r.words.forEach(w=>{introduced.add(w);zoneSeen[r.zone].add(w);});});
