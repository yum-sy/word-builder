// Pedagogical sound identities are separate from filenames; source is a candidate, not a pronunciation assertion.
const entries=[
 ['a','æ','a-apple'],['b','b','b-bat'],['k','k','c-cut'],['d','d','d-dip'],['e','ɛ','e-elephant'],['f','f','f-fun'],['g','ɡ','g-get'],['h','h','h-hat'],['i','ɪ','i-igloo'],['j','dʒ','j-jog'],['l','l','l-lip'],['m','m','m-mug'],['n','n','n-nap'],['o','ɑ','o-octopus'],['p','p','p-pick'],['kw','kw','qu-quest'],['r','ɹ','r-rid'],['s','s','s-sit-mess'],['t','t','t-tuck'],['u','ʌ','u-up'],['v','v','v-van'],['w','w','w-will'],['ks','ks','x-mix-rocks'],['y','j','y-yes'],['z','z','z-zip-buzz'],['sh','ʃ','sh-ship'],['ch','tʃ','ch-chick'],['long-a','eɪ','a-cake'],['long-e','iː','e-team'],['long-i','aɪ','i-kite'],['long-o','oʊ','o-rope'],['long-u','juː','u-use-cue'],['ar','ɑɹ','ar-jar'],['or','ɔɹ','or-fork'],['er','ɝ','er-herd-bird-turn'],['oi','ɔɪ','oi-soil-toy'],['ou','aʊ','ou-how-out']
];
export const PHONEMES=Object.fromEntries(entries.map(([id,ipa,source])=>[id,{id,ipa,source,dialect:'en-US',reviewStatus:'pending'}]));
export const sourceToPhoneme=Object.fromEntries(entries.map(([id,,source])=>[source,id]));sourceToPhoneme['k-kit']='k';
