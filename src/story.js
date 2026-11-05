import {ease,clamp} from './encounters.js?v=f4f1eb605fb7ce99';
export const TUTORIAL_END=15.4;
export const STORY_BEATS={stop:3.5,brake:3.65,impact:4.4,recoil:4.65,land:5.4,rise:7.6,relief:8.6,cape:9.2,portal:10.3,pickup:12.8};
export function collisionFrame(t,origin=325){
 const b=STORY_BEATS,flight=clamp((t-b.recoil)/(b.land-b.recoil)),pickup=ease((t-b.pickup)/1.5);
 let x,y=653,pose='',running=false,walking=false;
 if(t<b.brake){x=origin+(1080-origin)*clamp(t/b.brake);running=true;}
 else if(t<b.impact){const u=clamp((t-b.brake)/(b.impact-b.brake));x=1080+85*(1-(1-u)*(1-u));pose='brake';}
 else if(t<b.recoil){x=1165;pose='impact';}
 else if(t<b.land){x=1165-265*(1-(1-flight)*(1-flight));y-=Math.sin(flight*Math.PI)*92;pose='fall';}
 else if(t<b.rise){x=900;pose='seated';y+=Math.sin(clamp((t-b.land)/.22)*Math.PI)*7;}
 else if(t<b.relief){x=900;pose='rise';}
 else if(t<b.pickup){x=900;pose='relief';}
 else{x=900+265*pickup;walking=pickup<1;pose=pickup>=1?'map':'';}
 const stopped=t>=b.stop,recoil=ease((t-b.impact)/.5);
 return {x,y,pose,running,walking,tilt:0,villainX:1150+60*ease(t/b.stop)+40*recoil,villainWalking:!stopped,stopped,hit:t>=b.impact&&t<5.6,inspect:t>=5.6&&t<b.cape,cape:t>=b.cape,vanish:ease((t-b.portal)/1.8),portal:t>=b.portal&&t<12.8?Math.sin(clamp((t-b.portal)/2.5)*Math.PI):0,pickup,done:t>=TUTORIAL_END};
}
