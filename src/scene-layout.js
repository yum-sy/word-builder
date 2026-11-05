// Coordinates use the game's 1400 x 900 drawing space.
export function thoughtLayout(headX,top,bottom){
 const scale=Math.min(1,Math.max(.2,(bottom-top)/270));
 return {scale,x:Math.max(225*scale,Math.min(1400-225*scale,headX+270*scale)),y:top+165*scale};
}
