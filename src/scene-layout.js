// Coordinates use the game's 1400 x 900 drawing space.
export function thoughtLayout(headX,top,bottom){
 const scale=Math.min(1,Math.max(.2,(bottom-top)/270));
 return {scale,x:Math.max(225*scale,Math.min(1400-225*scale,headX+270*scale)),y:top+165*scale};
}
// Pixel-space overlay keeps portrait hints readable instead of shrinking with the scene.
export function portraitThoughtLayout(width,headX,top,bottom){
 const scale=Math.max(.1,Math.min(1,(width-24)/450,(bottom-top)/270));
 return {scale,x:Math.max(225*scale,Math.min(width-225*scale,headX+270*scale)),y:bottom-105*scale};
}
