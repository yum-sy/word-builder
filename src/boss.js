import {ease} from './encounters.js?v=f4f1eb605fb7ce99';
export const BOSS_INTRO=4.6;
export function bossIntro(t){return {obstacle:ease((t-.7)/1.3),casting:t<2,taunting:t>=2&&t<3.4,turned:t>=3.4,done:t>=BOSS_INTRO};}
export function bossReaction(t,final=false){return {label:t<1.1?'!':final?'...':'',retreat:38*ease(t/.6),teleport:final?0:ease((t-1.5)/1.2),vanish:final?ease((t-2.5)/1):0,casting:!final&&t>=1.2,done:t>=4};}
