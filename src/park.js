// Ground anchors in the 1000×650 park painting. The train has its own circuit.
export const PARK_PLOTS=[[220,235],[445,215],[670,215],[685,345],[805,410],[575,475],[400,465],[185,415],[480,345]];
export const PARK_SCALES=[.72,.70,.72,.67,.70,.78,.65,.70,.65];
export function trainPoint(t){
 const a=t*Math.PI*2;
 // Wide perimeter circuit, outside the central walks and clear of the pond.
 return {x:500+465*Math.cos(a),y:280+200*Math.sin(a)};
}
