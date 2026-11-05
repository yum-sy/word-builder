import {clearMatte,silhouetteRegions} from './sprite-matte.js?v=da860f5ec528b24c';
import {PARK_PLOTS,PARK_SCALES,trainPoint} from './park.js?v=da860f5ec528b24c';
import {actionFrame,ease,clamp} from './encounters.js?v=da860f5ec528b24c';
import {SCENES} from './content.js?v=da860f5ec528b24c';
const paintings={},spriteLayers={};
const actorFrames={};
function prepareSprite(id,img){
 const layer=document.createElement('canvas');layer.width=img.naturalWidth;layer.height=img.naturalHeight;
 const lc=layer.getContext('2d',{willReadFrequently:true});lc.drawImage(img,0,0);
 const pixels=lc.getImageData(0,0,layer.width,layer.height);
 clearMatte(pixels.data,layer.width,layer.height);lc.putImageData(pixels,0,0);spriteLayers[id]=layer;
 if(id==='story'||id==='villain'){
  const regions=silhouetteRegions(pixels.data,layer.width,layer.height,4);
  if(regions.length===4)actorFrames[id]=regions.map(r=>{
   const tile=document.createElement('canvas');tile.width=r.maxX-r.minX+5;tile.height=r.maxY-r.minY+5;
   const tc=tile.getContext('2d'),out=tc.createImageData(tile.width,tile.height);
   for(const i of r.pixels){const j=((Math.floor(i/layer.width)-r.minY+2)*tile.width+i%layer.width-r.minX+2)*4;out.data.set(pixels.data.subarray(i*4,i*4+4),j);}
   tc.putImageData(out,0,0);const feet=r.pixels.filter(i=>Math.floor(i/layer.width)>r.maxY-25);tile.anchor=feet.reduce((sum,i)=>sum+i%layer.width-r.minX+2,0)/feet.length;return tile;
  });
 }
}
function actorTile(id,index,height){const tile=actorFrames[id]?.[index];if(!tile)return false;const factor=height/spriteLayers[id].height;c.drawImage(tile,-tile.anchor*factor,-tile.height*factor,tile.width*factor,tile.height*factor);return true;}
const assetLoads=[];
let readyCount=0;
export function artLoadProgress(){return {ready:readyCount,total:assetLoads.length};}
export function loadArt(){return Promise.all(assetLoads);}
if(typeof Image!=='undefined')for(const [id,file] of Object.entries({heroActions:'hero-actions-v4.png',villainMotion:'villain-motion-v4.png',heroMotion:'hero-motion-v4.png',heroStory:'hero-story-v3.png',parkTitle:'park-title-v4.png',story:'villain-story-v3.png',map:'park-map-v3.png',rides:'ride-atlas-v3.png',road:'park-road-v2.png',zones:'zone-atlas-v2.png',insideA:'interiors-a-v2.png',insideB:'interiors-b-v2.png',hero:'hero-poses-v2.png',villain:'villain-poses-v2.png'})){
 const img=new Image();paintings[id]=img;
 assetLoads.push(new Promise((resolve,reject)=>{
  img.onload=()=>{try{if(!['parkTitle','map','road','zones','insideA','insideB'].includes(id))prepareSprite(id,img);readyCount++;resolve();}catch(error){reject(error);}};
  img.onerror=()=>reject(new Error('Image unavailable: '+file));
  img.src='./assets/art/'+file;
 }));
}

const loaded=id=>['parkTitle','map','road','zones','insideA','insideB'].includes(id)?paintings[id]?.complete&&paintings[id].naturalWidth>0:!!spriteLayers[id];
function sprite(id,sx,sy,sw,sh,x,y,w,h){c.drawImage(spriteLayers[id],sx,sy,sw,sh,x,y,w,h);}
export const palette={ink:'#40594b',dark:'#3f6550',green:'#7f9f70',leaf:'#a7bf83',gold:'#efbe69',cream:'#fff7df',peach:'#e8ac85',blue:'#83b6ba',purple:'#806f9a'};
let c,currentScene='road';
export function use(ctx){c=ctx;}
export function ellipse(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
export function line(points,color,width=4){c.beginPath();c.moveTo(...points[0]);points.slice(1).forEach(p=>c.lineTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
export function poly(points,fill,stroke){c.beginPath();c.moveTo(...points[0]);points.slice(1).forEach(p=>c.lineTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
export function box(x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}}
function text(t,x,y,size,color=palette.ink){c.fillStyle=color;c.font=`bold ${size}px Trebuchet MS`;c.textAlign='center';c.fillText(t,x,y);}
function cloud(x,y,s=1,color='#fffdf1'){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,0,65,23,color);ellipse(-30,-13,30,27,color);ellipse(12,-25,39,36,color);ellipse(44,-9,25,25,color);c.restore();}
function tree(x,y,s=1,variant=0){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,0,70,13,'#5e7e491b');line([[0,0],[0,-145]],'#967657',20);line([[0,-78],[-35,-115]],'#967657',11);const fill=variant?'#90aa77':'#77996d';ellipse(-40,-142,59,68,fill);ellipse(22,-176,64,77,fill);ellipse(59,-127,51,60,fill);ellipse(9,-120,72,56,fill);ellipse(-5,-190,30,27,'#abc18455');c.restore();}
function flower(x,y,color='#f6e4ba',s=1){line([[x,y],[x,y-18*s]],'#83a078',2*s);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(x+Math.cos(a)*6*s,y-21*s+Math.sin(a)*6*s,5*s,5*s,color);}ellipse(x,y-21*s,3*s,3*s,'#d7ab61');}
export function child(x,y,time=0,{scale=1,walking=false,running=false,pose='',face=1}={}){
 const actionPose={push:0,pull:1,plant:2,blow:3,crouch:4,jump:5,slide:6,cheer:7}[pose];
 if(actionPose!==undefined&&loaded('heroActions')){
  const img=spriteLayers.heroActions,tw=img.width/4,th=img.height/2,baseline=actionPose===5?.75:.91;
  c.save();c.translate(x,y);c.scale(scale*face,scale);ellipse(0,3,37,8,'#573f2828');
  const effort=['push','pull'].includes(pose)?Math.sin(time*7)*.018:0;c.transform(1,0,effort,1,0,0);
  sprite('heroActions',actionPose%4*tw,Math.floor(actionPose/4)*th,tw,th,-94,-240*baseline,188,240);c.restore();return;
 }
 const storyPose={brake:0,impact:1,fall:2,seated:3,rise:4,relief:5}[pose];if(storyPose!==undefined&&loaded('heroStory')){const img=spriteLayers.heroStory,tw=img.width/3,th=img.height/2,baseline=[465,465,380,446,446,446][storyPose]/512; c.save();c.translate(x,y);c.scale(scale*face,scale);ellipse(0,4,40,8,'#573f2828');sprite('heroStory',(storyPose%3)*tw,Math.floor(storyPose/3)*th,tw,th,-125,-250*baseline,250,250);c.restore();return;}
 if((walking||running)&&!pose&&loaded('heroMotion')){
  const img=spriteLayers.heroMotion,tw=img.width/4,th=img.height/2,frame=Math.floor(time*(running?10:7))%4+(running?4:0);
  c.save();c.translate(x,y);c.scale(scale*face,scale);ellipse(0,3,37,8,'#573f2828');
  sprite('heroMotion',(frame%4)*tw,Math.floor(frame/4)*th,tw,th,-90,-225,180,240);c.restore();return;
 }
 if(loaded('hero')){c.save();c.translate(x,y);c.scale(scale*face,scale);ellipse(0,3,37,9,'#573f2828');const frame=pose==='map'?7:pose==='clap'?6:pose==='reach'?5:running?3+Math.floor(time*7)%2:walking?1+Math.floor(time*5)%2:0;const bob=walking||running?Math.abs(Math.sin(time*12))*4:Math.sin(time*2)*1.5;sprite('hero',(frame%4)*384,Math.floor(frame/4)*512,384,512,-83,-218-bob,166,230);c.restore();return;}
 c.save();c.translate(x,y);c.scale(scale*face,scale);const cycle=Math.sin(time*(running?19:9));const bob=walking||running?Math.abs(cycle)*5:Math.sin(time*2)*1.5;c.translate(0,-bob);
 ellipse(0,2,31,8,'#34503725');const stride=walking||running?cycle*(running?24:15):0;
 line([[-12,-38],[-16+stride,-12],[-12+stride,0]],'#526d70',12);line([[12,-38],[15-stride,-12],[20-stride,0]],'#526d70',12);
 box(-23+stride,-6,25,10,5,'#eee5cf');box(8-stride,-6,26,10,5,'#eee5cf');
 box(-29,-82,23,40,10,'#b58651');box(-23,-85,47,51,17,'#e9b45e');poly([[-21,-72],[23,-72],[20,-35],[-18,-35]],'#e8b460');line([[-11,-76],[-12,-42]],'#efce82',3);
 const arm=running?cycle*20:walking?cycle*10:0;
 if(pose==='clap') {line([[-20,-71],[-3,-62],[9,-70]],palette.peach,10);line([[20,-71],[14,-61],[7,-70]],palette.peach,10);}else if(pose==='reach'){line([[21,-72],[43,-91],[57,-91]],palette.peach,10);line([[-22,-70],[-35,-47]],palette.peach,10);}else{line([[-23,-72],[-29+arm,-44]],palette.peach,10);line([[23,-72],[29-arm,-44]],palette.peach,10);}
 ellipse(0,-108,32,34,palette.peach);ellipse(-30,-106,6,9,palette.peach);ellipse(30,-106,6,9,palette.peach);
 c.beginPath();c.moveTo(-32,-113);c.bezierCurveTo(-39,-155,20,-162,33,-122);c.lineTo(26,-110);c.lineTo(18,-132);c.bezierCurveTo(6,-114,-8,-126,-20,-116);c.closePath();c.fillStyle='#5c4a3d';c.fill();
 ellipse(10,-108,3.1,4.3,palette.ink);ellipse(-11,-108,3.1,4.3,palette.ink);ellipse(-19,-96,6,3.5,'#d98c75');ellipse(20,-96,6,3.5,'#d98c75');
 if(pose==='surprise')ellipse(0,-93,4,6,'#7a4a3c');else{c.beginPath();c.arc(0,-98,9,.2,Math.PI-.2);c.strokeStyle='#925b42';c.lineWidth=2.5;c.stroke();}
 c.restore();
}
export function villain(x,y,time=0,{scale=1,hit=false,unmasked=false,face=1,casting=false,pose='',walking=false}={}){
 if(loaded('villainMotion')&&(walking||casting||hit||pose==='deflated')){
  const img=spriteLayers.villainMotion,tw=img.width/4,th=img.height/2;
  const frame=walking?Math.floor(time*7)%4:pose==='deflated'?7:hit&&!casting?6:pose==='prepare'?4:5;
  c.save();c.translate(x,y);c.scale(scale*(walking?1:face),scale);ellipse(0,4,45,9,'#573f2828');
  const h=320,w=h*tw/th;sprite('villainMotion',frame%4*tw,Math.floor(frame/4)*th,tw,th,-w/2,-310,w,h);c.restore();return;
 }
 if(pose&&loaded('story')){const index={backcast:0,inspect:1,cape:2,away:3}[pose];if(index!==undefined){const img=spriteLayers.story;const cuts=[[0,.23],[.23,.20],[.43,.34],[.79,.21]],range=cuts[index],sw=img.width*range[1],height=320*scale,width=height*sw/img.height;c.save();c.translate(x,y-(walking?Math.abs(Math.sin(time*7))*5:0));c.rotate(walking?Math.sin(time*7)*.025:0);ellipse(0,4,45*scale,10*scale,'#573f2828');if(!actorTile('story',index,height))sprite('story',img.width*range[0],0,sw,img.height,-width/2,-height+10,width,height);c.restore();return;}}
 if(loaded('villain')){c.save();c.translate(x,y);c.scale(scale*face,scale);ellipse(0,4,48,10,'#573f2828');const frame=unmasked?3:hit?2:casting?1:0;const crops=[[0,0,310,1024],[310,0,420,1024],[730,0,420,1024],[1150,0,386,1024]],r=crops[frame];c.translate(0,-Math.sin(time*2)*1.5);c.rotate(hit?Math.sin(time*17)*.015:casting?Math.sin(time*3)*.012:0);if(!actorTile('villain',frame,330))sprite('villain',...r,-r[2]*.165,-309,r[2]*.33,330);c.restore();return;}
 c.save();c.translate(x,y);c.scale(scale,scale);ellipse(0,4,45,10,'#53496420');const sway=Math.sin(time*4)*12;
 poly([[-26,-131],[-56-sway,-28],[-23,-39],[4,-19],[53,-32],[37+sway,-131]],'#71618c');poly([[27,-130],[55+sway,-40],[28,-53]],'#a38bad');
 line([[-17,-55],[-20,0]],'#4c5265',16);line([[17,-55],[23,0]],'#4c5265',16);box(-31,-5,26,12,5,'#65526c');box(12,-5,28,12,5,'#65526c');box(-29,-136,58,90,18,'#677994');box(-30,-73,60,12,4,'#e3bb65');poly([[0,-116],[8,-103],[0,-90],[-8,-103]],'#efcb79');
 line([[-26,-123],[-47,-86]],'#677994',15);line([[27,-122],[48,-100],[55,-125]],'#677994',15);ellipse(55,-130,9,11,palette.peach);
 ellipse(0,-162,30,33,palette.peach);poly([[-30,-170],[-28,-193],[-17,-207],[-4,-194],[13,-204],[29,-181],[30,-169]],'#48495f');
 if(!unmasked){poly([[-30,-173],[-9,-177],[0,-171],[13,-177],[31,-171],[23,-152],[7,-155],[0,-149],[-9,-155],[-25,-152]],'#4b536d');line([[-20,-165],[-10,-163]],'#fff3dd',4);line([[10,-163],[21,-165]],'#fff3dd',4);}else{ellipse(-10,-166,3,4,palette.ink);ellipse(10,-166,3,4,palette.ink);}
 line([[-8,-143],[0,hit?-149:-140],[9,-144]],'#9a634f',3);c.restore();
}
export function ride(x,y,kind,time=0,s=1){
 if(loaded('rides')){const index=['carousel','ferris','swings','pirate','teacups','coaster','boats','cars','balloons','train'].indexOf(kind);if(index>=0){const img=spriteLayers.rides,tw=img.width/5,th=img.height/2;c.save();c.translate(x,y);c.scale(s,s);sprite('rides',(index%5)*tw,Math.floor(index/5)*th,tw,th,-85,-156,170,165);c.restore();return;}}

 c.save();c.translate(x,y);c.scale(s,s);const I='#7b927c',G='#d8a757',R='#d6957b',B='#80a9af';
 if(kind==='ferris'){line([[-32,0],[0,-91],[32,0]],I,6);c.strokeStyle=I;c.lineWidth=4;c.beginPath();c.arc(0,-85,62,0,7);c.stroke();for(let i=0;i<8;i++){const a=time*.15+i*Math.PI/4;const x=Math.cos(a)*62,y=-85+Math.sin(a)*62;line([[0,-85],[x,y]],I,2);box(x-12,y-4,24,20,6,i%2?G:R);}ellipse(0,-85,9,9,G);}
 else if(kind==='carousel'||kind==='swings'){line([[0,0],[0,-110]],I,7);poly([[-68,-71],[0,-119],[68,-71]],G);box(-67,-76,134,14,5,R);for(let i=-1;i<=1;i++){line([[i*40,-65],[i*40+Math.sin(time)*4,-17]],I,3);if(kind==='carousel'){ellipse(i*40,-20,16,9,'#eee0c1');line([[i*40-8,-15],[i*40-10,-3]],I,3);}else box(i*40-10,-18,25,9,3,B);}ellipse(0,3,72,9,'#e2d0a9');}
 else if(kind==='coaster'){line([[-65,0],[-65,-42],[-35,-88],[-3,-35],[28,-106],[62,-24],[62,0]],I,7);for(let i=-50;i<65;i+=30)line([[i,0],[i,-55]],I,3);box(-47,-80,25,16,5,R);}
 else if(kind==='pirate'||kind==='boats'){if(kind==='pirate'){line([[-55,0],[0,-115],[55,0]],I,6);}poly([[-53,-40],[48,-40],[29,-12],[-29,-12]],R);line([[0,-35],[0,-82]],I,4);poly([[2,-81],[2,-46],[34,-47]],'#f6e7bf');}
 else if(kind==='train'||kind==='cars'){box(-65,-33,43,29,7,R);box(-16,-37,44,33,7,B);box(33,-45,32,40,6,G);for(let i=-50;i<70;i+=30)ellipse(i,0,8,8,I);}
 else if(kind==='balloons'){for(let i=-1;i<=1;i++){ellipse(i*42,-70-Math.abs(i)*22,24,32,i===0?G:i===1?B:R);line([[i*42,-40-Math.abs(i)*22],[i*24,-8]],I,2);}box(-30,-9,60,18,6,G);}
 else {ellipse(0,-3,72,13,'#d1c7a4');for(let i=-1;i<=1;i++){box(i*42-18,-32,36,28,10,i%2?R:G);c.strokeStyle=B;c.lineWidth=4;c.beginPath();c.arc(i*42+19,-22,9,-1.5,1.5);c.stroke();}}
 c.restore();
}
export function background(ctx,{time=0,zone=0,opening=0,restored=[],title=false,scene='road'}={}){
 use(ctx);currentScene=scene;
 if(title&&loaded('parkTitle')){c.drawImage(paintings.parkTitle,0,0,1400,900);return;}
 if(loaded('road')){
 const location=SCENES[scene]||SCENES.road;if(location.asset!=='road'&&loaded(location.asset)){const img=paintings[location.asset],tw=img.naturalWidth/2,th=img.naturalHeight/2,tile=location.tile;c.drawImage(img,(tile%2)*tw,Math.floor(tile/2)*th,tw,th,0,0,1400,900);}else c.drawImage(paintings.road,0,0,1400,900);
 if(zone>0){c.fillStyle=['','#c0e96c0c','#eddb640c','#51a9c31a','#efb56512','#8171b51a','#5badd91a','#e79d3e16','#ad76cc1a','#6278b216'][zone];c.fillRect(0,0,1400,900);}
 // No freestanding ride sprites over the painted distant park.
 for(let i=0;i<10;i++){const px=(time*7+i*137)%1400,py=190+(i*79)%380+Math.sin(time+i)*10;ellipse(px,py,1.5,1.5,'#fff5bc66');}
 return;
 }
 let sky=c.createLinearGradient(0,0,0,620);sky.addColorStop(0,['#dcece7','#e7ecda','#e6edde','#d9e9eb','#f3e8cc','#e4e5ef','#dceaf0','#efdfce','#e8e3f0','#dfe8ec'][zone]);sky.addColorStop(1,'#faf3de');c.fillStyle=sky;c.fillRect(0,0,1400,900);
 ellipse(1110,144,52,52,'#f7dca0');ellipse(1110,144,67,67,'#f7dca024');cloud(260+Math.sin(time*.05)*25,150,1.1,'#fffdf1a0');cloud(785,110,.65,'#fffdf1b0');cloud(1270,265,.8,'#fffdf199');
 poly([[0,450],[0,403],[160,350],[340,406],[540,326],[720,384],[915,315],[1140,371],[1400,314],[1400,500]],'#b9cdb2');
 c.beginPath();c.moveTo(0,490);c.bezierCurveTo(260,330,460,500,700,393);c.bezierCurveTo(1050,271,1170,450,1400,374);c.lineTo(1400,700);c.lineTo(0,700);c.fillStyle='#a9bf97';c.fill();
 // Park architecture remains even after the rides disappear.
 c.save();c.translate(1040,371);c.scale(.72,.72);box(-163,-21,331,20,4,'#b3bc96');for(let i=0;i<10;i++){const x=-170+(i%5)*78,y=-28-Math.floor(i/5)*47;const visible=title||restored.includes(i)||(opening>0&&opening<2.7+i*.19);if(visible)ride(x,y,['carousel','ferris','swings','pirate','teacups','coaster','boats','cars','balloons','train'][i],time,.43);else ellipse(x,y,24,5,'#9cac8a');}box(-31,-62,62,63,8,'#cbbf99');box(-17,-45,34,47,15,'#849b7b');poly([[-43,-63],[0,-92],[43,-63]],'#d2a177');c.restore();
 c.beginPath();c.moveTo(0,525);c.bezierCurveTo(270,430,400,510,680,491);c.bezierCurveTo(1010,452,1200,500,1400,451);c.lineTo(1400,900);c.lineTo(0,900);c.fillStyle=['#bfd0a4','#bbd09c','#c4d19f','#b2cda7','#cdd0a2','#bfc7ac','#b8cdaa','#c8c6a0','#c2c6b1','#bfcca9'][zone];c.fill();
 // A warm, continuous walkable road.
 c.beginPath();c.moveTo(-80,618);c.bezierCurveTo(380,550,700,600,1460,565);c.lineTo(1460,735);c.bezierCurveTo(800,720,450,695,-80,785);c.closePath();c.fillStyle='#e8d8b7';c.fill();
 c.beginPath();c.moveTo(-60,651);c.bezierCurveTo(380,586,750,636,1450,611);c.strokeStyle='#f2e5c9';c.lineWidth=55;c.stroke();
 for(let i=0;i<28;i++){const x=(i*137+37)%1400,y=670+(i*19)%50;ellipse(x,y,3+i%3,1.5,'#bda98255');}
 tree(105,560,1.6);tree(1312,550,1.35,1);tree(35,507,.7,1);tree(1218,493,.67);
 for(let i=0;i<36;i++){const x=(i*97+22)%1400,y=742+(i*47)%150;if(i%3===0)flower(x,y,i%2?'#f4e0ae':'#e7d5c8',.7+i%3*.2);else{line([[x-6,y],[x,y-12],[x+3,y-2],[x+10,y-14]],'#8fac79',2);}}
 // Foreground leaves frame the stage.
 for(let i=0;i<9;i++){ellipse(-20+i*22,900-i%3*17,40,65,i%2?'#6d9067':'#83a273');ellipse(1410-i*20,905-i%3*16,38,65,i%2?'#6d9067':'#83a273');}
}
function puddle(x,y){ellipse(x,y,115,20,'#8bb8bc');ellipse(x-20,y-6,65,4,'#cee2d9');}
function bridge(x,y,down){line([[x-100,y+12],[x+100,y+12]],SCENES[currentScene]?.indoor?'#82674c':'#96b3a6',28);c.save();c.translate(x-90,y);c.rotate(-1.2*(1-Number(down)));box(0,-8,185,17,4,'#a78459');for(let i=0;i<9;i++)line([[i*22,-8],[i*22,10]],'#d2b88c',3);c.restore();}
function bell(x,y){line([[x,y],[x,y-90]],'#97825d',7);line([[x,y-88],[x+40,y-88]],'#97825d',6);poly([[x+28,y-81],[x+19,y-52],[x+58,y-52],[x+49,y-81]],'#e7b75e');ellipse(x+38,y-49,5,5,'#9b7755');}
function snail(x,y,moving){ellipse(x,y,42,12,'#b5bc80');ellipse(x-8,y-17,24,24,'#c3a07a');c.strokeStyle='#977657';c.lineWidth=3;c.beginPath();c.arc(x-8,y-17,13,0,5.5);c.stroke();line([[x+24,y],[x+29,y-26]],'#89986b',5);ellipse(x+30,y-29,4,4,palette.ink);}
function boat(x,y,large=false){poly([[x-75,y-14],[x+75,y-14],[x+47,y+22],[x-46,y+22]],'#b97e5d');line([[x-65,y-8],[x+65,y-8]],'#efc180',5);line([[x,y-12],[x,y-105]],'#86705b',5);poly([[x+4,y-98],[x+4,y-23],[x+67,y-23]],large?'#e7bd75':'#f5eccd');if(large)poly([[x-5,y-83],[x-5,y-23],[x-48,y-23]],'#e6dfc2');}
function cart(x,y){box(x-50,y-60,100,45,9,'#ba9667');for(const dx of [-30,30]){ellipse(x+dx,y-10,16,16,'#6b7e70');ellipse(x+dx,y-10,7,7,'#c8b98e');}}
export function prop(word,x,y,t=0,p=0,variant=0){
 const done=p>=1, active=p>0&&p<1,wig=Math.sin(t*8),ink=palette.ink;
 c.save();c.translate(x,y);
 switch(word){
 case 'run':box(-70,-155,15,160,5,'#a48d66');box(78,-155,15,160,5,'#a48d66');box(-78,-164,181,20,7,'#9a805c');if(!done)box(-50,-142+Math.sin(t)*15,113,70,10,'#bd9f70');break;
 case 'sun':if(!done)puddle(0,0);if(!done)cloud(0,-188,1,'#a3b5b1');if(p>0){ellipse(0,-190,42,42,'#f2c46a');for(let i=0;i<10;i++){const a=i*Math.PI/5+t*.2;line([[Math.cos(a)*53,-190+Math.sin(a)*53],[Math.cos(a)*67,-190+Math.sin(a)*67]],'#e8b65c',4);}for(let i=-2;i<3;i++)flower(i*38,-2,'#fff0ba',p);}break;
 case 'cut':if(!SCENES[currentScene]?.indoor)puddle(0,8);bridge(0,0,p);if(!done){line([[75,-160],[-90,0]],'#907554',5);line([[75,-160],[75,15]],'#89765e',9);}if(active){line([[-40,-65],[45,-105]],'#819c9b',8);line([[-40,-105],[45,-65]],'#819c9b',8);ellipse(-47,-62,13,10,'#e3a868');ellipse(-47,-108,13,10,'#e3a868');}break;
 case 'hop':puddle(0,8);for(let i=-1;i<=1;i++){ellipse(i*70,-8-(i===0?12:0),29,14,'#9caaa0');ellipse(i*70,-13-(i===0?12:0),23,7,'#b9c4b3');}break;
 case 'dig':if(!done){ellipse(0,-12,95,40,'#b79a75');for(let i=0;i<7;i++)ellipse(i*21-65,-23+(i%2)*10,7,4,'#8e755b');}else{for(let i=-2;i<3;i++)ellipse(i*32,0,17,8,'#a7b3a0');}if(active){line([[wig*12,-140],[0,-40]],'#8e7956',7);poly([[-16,-50],[17,-50],[13,-22],[0,-11],[-13,-22]],'#8da6a4');}break;
 case 'tap':bell(-45,0);snail(25+p*150,-p*42,done);if(active)for(let i=0;i<3;i++)ellipse(0,-90-i*15,4,4,'#e6bb67');break;
 case 'pop':if(!done)for(let i=0;i<5;i++){if(p>i*.2+.1)continue;const bx=Math.sin(i*8)*60,by=-30-i*27+Math.sin(t+i)*6;ellipse(bx,by,30,30,'#a4cbd866');c.strokeStyle='#e9faf1';c.lineWidth=3;c.beginPath();c.arc(bx,by,29,0,7);c.stroke();ellipse(bx-8,by-11,6,4,'#fff9');}break;
 case 'net':case 'fish':puddle(0,8);if(!done){ellipse(20,-15,12,12,'#d6ad5b');line([[20,-15],[48,-15],[48,-8]],'#d6ad5b',5);}if(active||done){line([[-70,-10],[-15,-135]],'#8e7658',6);if(word==='net'){c.strokeStyle='#e9dec1';c.lineWidth=3;c.beginPath();c.ellipse(5,-122,29,21,-.4,0,7);c.stroke();for(let i=-2;i<=2;i++)line([[i*10,-142],[i*10+10,-102]],'#e9dec1',2);}else line([[-15,-135],[55,-80],[35,-22-p*90]],'#eee8cc',2);}if(done)bridge(0,7,true);break;
 case 'stop':cart(done?95:Math.sin(t*2)*50,0);if(active)poly([[-10,-80],[-20,-102],[-8,-110],[0,-90],[2,-118],[12,-118],[14,-90],[25,-108],[33,-100],[25,-73]],palette.peach);break;
 case 'spin':line([[0,0],[0,-150]],'#8a795c',9);c.save();c.translate(0,-120);c.rotate(p? t*5:.4);for(let i=0;i<4;i++){c.rotate(Math.PI/2);poly([[0,0],[0,-62],[43,-28]],i%2?'#e7b36f':'#83b3b0');}ellipse(0,0,9,9,'#f7e7bf');c.restore();if(done)box(-90,-12,180,17,6,'#a88b60');break;
 case 'clap':for(let i=0;i<5;i++){const bx=i*37-75,by=done?-240:active?-p*180:-8;ellipse(bx,by,15,12,'#8b9d9a');poly([[bx+12,by],[bx+25,by+3],[bx+12,by+7]],'#d5a768');line([[bx-2,by],[bx-17,by-(p?18+wig*10:5)]],'#6e8480',6);}break;
 case 'drum':case 'horn':snail(35+p*150,-p*42,done);if(p){if(word==='drum'){box(-75,-59,62,46,8,'#bd8468');ellipse(-44,-59,31,9,'#eee2bd');line([[-90,-95],[-50,-65+wig*8]],'#887455',5);line([[-20,-92],[-40,-62-wig*8]],'#887455',5);}else{poly([[-80,-60],[-28,-70],[-4,-95],[-4,-37],[-27,-57]],'#d7ac5e');}for(let i=0;i<3;i++)text('♪',-30+i*32,-100-i*15-Math.sin(t+i)*8,25,'#879d7c');}break;
 case 'ship':case 'boat':puddle(0,12);if(p)boat(-80+p*160,0,word==='ship');break;
 case 'chop':c.save();c.rotate(done?.18:0);box(-95,-40,190,42,15,'#977454');ellipse(87,-19,15,21,'#c6a679');if(done)box(-8,-48,16,58,0,'#d9ceaa');c.restore();if(active){line([[-10,-125],[10,-50]],'#937352',7);poly([[-25,-122],[7,-132],[27,-111],[1,-91]],'#8ca3a0');}break;
 case 'shut':line([[-70,-160],[-70,0]],'#a18c66',9);box(-65,-150,35+p*85,145,6,'#b9a079');for(let i=0;i<4&&!done;i++)line([[-25,-120+i*30],[95,-125+i*30],[140,-113+i*30]],'#e4ecd5',4);break;
 case 'rope':box(-45,10-p*85,80,42,7,'#bd9969');for(let i=-2;i<=2;i++)line([[i*15,12-p*85],[i*15,48-p*85]],'#e5c58e',2);if(p)line([[0,-160],[0,12-p*85]],'#917554',5);break;
 case 'kite':line([[30,-130],[30,0]],'#927b5a',8);box(18,-142,27,17,4,'#e1b962');if(p){const ky=-80-p*160;poly([[-65,ky-40],[-20,ky],[-65,ky+47],[-95,ky]],'#dca27f');poly([[-65,ky-40],[-20,ky],[-65,ky+47]],'#eecb79');line([[-65,ky+47],[-40,-20]],'#9a896d',2);line([[-65,ky+47],[-83,ky+66],[-63,ky+87]],'#9dbaa7',3);}break;
 case 'slide':poly([[-100,-140],[-60,-140],[110,0],[65,0]],'#c2a883');line([[-90,-143],[90,-4]],'#eee0bb',8);break;
 case 'cube':box(30,-115,100,115,5,'#a9b899');if(p){box(-55,-62,65,62,7,'#d9ad65');poly([[-55,-62],[-34,-78],[30,-78],[10,-62]],'#efd18b');poly([[10,-62],[30,-78],[30,-18],[10,0]],'#c79754');}break;
 case 'rain':ellipse(0,0,100,20,p?'#8bb8bc':'#beab86');cloud(0,-185,1,'#a5bab5');if(p)for(let i=0;i<15;i++){const ry=((t*110+i*31)%160)-165;line([[i*13-90,ry],[i*13-94,ry+10]],'#79abb8',3);}if(done)bridge(0,0,true);break;
 case 'seed':box(-38,-25,76,33,8,'#be8b69');ellipse(0,-25,40,10,'#8b7858');if(p){line([[0,-25],[0,-25-p*150]],'#72966c',8);for(let i=1;i<=5;i++){ellipse((i%2?1:-1)*18,-25-i*25*p,22,10,'#89ac75');}}break;
 case 'team':cart(30+p*150,-p*65);if(p){child(-95+p*35,5,t,{scale:.65,walking:true,pose:'reach'});child(-145+p*35,5,t+1,{scale:.7,walking:true,pose:'reach'});}break;
 case 'car':if(p){box(-90+p*150,-55,120,45,14,'#c58b6f');box(-60+p*150,-87,62,35,12,'#c58b6f');box(-52+p*150,-81,46,25,5,'#b8d3ca');ellipse(-65+p*150,-8,16,16,'#586b63');ellipse(5+p*150,-8,16,16,'#586b63');}else line([[-80,-5],[80,-5]],'#f4ead4',8);break;
 case 'fork':if(!done){for(let i=0;i<12;i++)line([[i*12-70,0],[i*9-55,-60]],'#c7ae6c',7);}if(p){line([[-45,-140],[-20,-40]],'#937b56',6);for(let i=0;i<4;i++)line([[-40+i*12,-53],[-45+i*12,-88]],'#8caaa0',4);}break;
 case 'turn':puddle(0,8);c.save();c.rotate((1-p)*Math.PI*.24);bridge(0,0,true);c.restore();ellipse(-95,-65,22,22,'#a7b2a0');line([[-95,-65],[-95+Math.sin(t*(p?5:0))*25,-85]],'#8b785a',6);break;
 case 'coin':box(25,-90,55,90,7,'#91a5a0');box(35,-72,35,7,3,'#546f63');bridge(-80,5,p);if(p&&!done){ellipse(-40+p*88,-120+p*51,18,18,'#efc360');ellipse(-40+p*88,-120+p*51,10,10,'#d4a853');}break;
 case 'toy':ellipse(done?95:0,-26,30,23,'#bf9472');ellipse(done?120:23,-49,21,22,'#bf9472');ellipse(done?135:38,-52,5,5,'#4a5148');line([[done?109:12,-63],[done?111:14,-37]],'#98745a',10);if(p){ellipse(65,-7,20,20,'#d4a76b');line([[51,-20],[78,6]],'#f0d8a1',5);}break;
 case 'cloud':for(let i=-1;i<2;i++)ellipse(i*65,0,28,12,done?'#a9b6aa':'#d5a57d');ellipse(0,-190,40,40,'#eec36f');if(p)cloud(-100+p*100,-192,1.2,'#a7b9b5');break;
 }
 c.restore();
}
export function sparkles(x,y,t,count=20){for(let i=0;i<count;i++){const a=i*2.4,dist=(t%1)*100+20;const px=x+Math.cos(a)*dist,py=y+Math.sin(a)*dist*.7;ellipse(px,py,3+(i%3),3+(i%3),i%2?'#f5d78e':'#fff8d8');}}
export function map(ctx,width,height,restored,time=0,reveal=-1,revealProgress=1){
 use(ctx);c.save();c.scale(width/1000,height/650);
 if(loaded('map')){
  c.drawImage(paintings.map,0,0,1000,650);
  parkRailway(time,restored.includes(9),reveal===9?revealProgress:1);
  const plots=PARK_PLOTS,kinds=['carousel','ferris','swings','pirate','teacups','coaster','boats','cars','balloons','train'];
  for(const [i,[x,y]] of plots.entries()){
   const restoredHere=restored.includes(i);ellipse(x,y+5,65,20,restoredHere?'#574c3833':'#66825244');
   if(restoredHere){const arrival=i===reveal?ease(revealProgress):1;ride(x,y,kinds[i],time,PARK_SCALES[i]*arrival);if(i===reveal&&revealProgress<1){c.save();c.globalAlpha=1-revealProgress;sparkles(x,y-50,revealProgress,22);c.restore();}}
   else{c.save();c.globalAlpha=.21;c.filter='sepia(1)';ride(x,y,kinds[i],0,PARK_SCALES[i]);c.restore();c.strokeStyle='#f9edc8aa';c.setLineDash([4,6]);c.lineWidth=2;c.beginPath();c.ellipse(x,y+3,55,18,0,0,7);c.stroke();c.setLineDash([]);}
  }
  box(393,611,214,26,13,'#fff4dcdd');for(let i=0;i<10;i++)ellipse(419+i*18,624,5,5,restored.includes(i)?'#64886b':'#caba93');
  c.restore();return;
 }
 const paper=c.createLinearGradient(0,0,1000,650);paper.addColorStop(0,'#fff4d6');paper.addColorStop(1,'#e7d6af');c.fillStyle=paper;c.fillRect(0,0,1000,650);
 // A park plan, with winding paths, a lake and distinct planted neighbourhoods.
 ellipse(500,335,439,273,'#b3c099');ellipse(495,320,420,254,'#d2d8af');
 for(let i=0;i<90;i++){const a=i*2.399,r=80+((i*67)%330);ellipse(500+Math.cos(a)*r,320+Math.sin(a)*r*.61,12+i%17,5+i%9,i%2?'#bfcd9a55':'#ebdfb555');}
 ellipse(750,343,131,73,'#7aaca8');ellipse(748,335,122,63,'#aed1c2');for(let i=0;i<7;i++)line([[680+i*19,321+i%3*14],[704+i*19,321+i%3*14]],'#dfecce',3);
 const plots=[[220,213],[435,171],[663,185],[825,273],[807,450],[602,477],[387,453],[176,405],[470,326],[237,541]];
 c.beginPath();c.moveTo(500,615);c.bezierCurveTo(525,490,90,520,133,330);c.bezierCurveTo(144,123,436,92,696,139);c.bezierCurveTo(950,171,944,505,659,537);c.bezierCurveTo(486,556,536,398,470,326);c.strokeStyle='#bda77d';c.lineWidth=33;c.stroke();c.strokeStyle='#f4e4bb';c.lineWidth=26;c.stroke();
 for(const [i,[x,y]] of plots.entries()){
  line([[x,y+20],[x+14,y+45]],'#ebd7ad',20);ellipse(x,y+7,69,25,'#80957044');ellipse(x,y,65,23,restored.includes(i)?'#e6cea0':'#b7bc98');
  if(restored.includes(i)){
   const arrival=i===reveal?ease(revealProgress):1;
   c.save();c.translate(x,y);c.scale(.8*arrival,.8*arrival);ride(0,0,['carousel','ferris','swings','pirate','teacups','coaster','boats','cars','balloons','train'][i],time,1);c.restore();
   for(let k=0;k<5;k++){const bx=x-45+k*23;ellipse(bx,y+20,3,3,'#f8e6a9');}
   if(i===reveal&&revealProgress<1){c.save();c.globalAlpha=1-revealProgress;sparkles(x,y-45,revealProgress,18);c.restore();}
  }else{
   c.save();c.globalAlpha=.18;ride(x,y,['carousel','ferris','swings','pirate','teacups','coaster','boats','cars','balloons','train'][i],0,.72);c.restore();
   c.strokeStyle='#879777';c.setLineDash([4,6]);c.lineWidth=2;c.beginPath();c.ellipse(x,y,53,17,0,0,7);c.stroke();c.setLineDash([]);
  }
 }
 for(const [x,y,s] of [[106,259,.42],[327,250,.35],[549,218,.4],[902,397,.45],[679,590,.36],[102,482,.45],[355,570,.35],[584,352,.3],[730,109,.4],[298,113,.35]])tree(x,y,s,1);
 for(let i=0;i<18;i++)flower(90+(i*137)%820,90+(i*71)%490,i%2?'#f4bf8c':'#fff1bd',.65);
 // Gate and pennants keep this recognisably the same park the child left.
 timber(454,568,12,58);timber(544,568,12,58);poly([[434,570],[505,529],[576,570]],'#b97458');line([[435,570],[575,570]],'#f2ce91',6);
 line([[70,60],[270,93],[500,61],[730,92],[930,60]],'#a58c66',2);for(let i=0;i<18;i++){const x=80+i*49,y=64+Math.sin(i*.4)*14;poly([[x,y],[x+21,y+2],[x+10,y+24]],['#b77662','#82a59c','#dbb65e'][i%3]);}
 for(let i=0;i<10;i++){ellipse(422+i*17,638,5,5,restored.includes(i)?'#688c76':'#c6b48e');}
 c.restore();
}
export function bubble(ctx,x,y,word,t,variant=0,tutorial=false,head=null){
 use(ctx);if(head){for(let i=0;i<3;i++){const p=i/3;ellipse(head.x+28+(x-100-head.x-28)*p,head.y-25+(y+65-head.y+25)*p,6+i*5,6+i*4,"#fffdf1");}}else{ellipse(x-35,y+153,7,7,'#fffdf1');ellipse(x-20,y+127,12,11,'#fffdf1');ellipse(x-5,y+96,20,16,'#fffdf1');}
 c.save();c.shadowColor='#46382435';c.shadowBlur=15;
 c.beginPath();c.moveTo(x-172,y+50);
 c.bezierCurveTo(x-225,y+18,x-216,y-42,x-179,y-58);
 c.bezierCurveTo(x-192,y-117,x-141,y-151,x-99,y-132);
 c.bezierCurveTo(x-70,y-178,x-9,y-175,x+20,y-143);
 c.bezierCurveTo(x+74,y-178,x+134,y-146,x+138,y-107);
 c.bezierCurveTo(x+200,y-110,x+225,y-53,x+194,y-15);
 c.bezierCurveTo(x+225,y+45,x+173,y+88,x+125,y+67);
 c.bezierCurveTo(x+88,y+110,x+32,y+94,x+9,y+76);
 c.bezierCurveTo(x-40,y+105,x-91,y+91,x-107,y+65);
 c.bezierCurveTo(x-140,y+87,x-171,y+75,x-172,y+50);c.closePath();c.fillStyle='#fffbed';c.fill();c.strokeStyle='#a18b6d';c.lineWidth=4;c.stroke();c.shadowBlur=0;c.clip();
 c.translate(x-143,y+43);c.scale(.68,.68);const f=actionFrame(word,t,620,variant);
 if(tutorial&&word==='run'){
  const approach=ease(t/4.6);
  villain(420,0,t,{scale:.55,pose:'away',walking:approach<1});
  child(55+270*approach,0,t,{scale:.67,running:approach<1});
 }else{
  encounter(word,240,0,t,f.effect,variant,f.cross);
  child(f.x-665,f.y-653,t,{scale:.67,pose:f.pose,walking:f.walking,running:f.running});
 }
 c.restore();
}
export function reaction(x,y,label){box(x-42,y-40,84,65,24,'#fff9e7','#806a57');poly([[x-12,y+23],[x-5,y+44],[x+12,y+23]],'#fff9e7');text(label,x,y+8,label==='!'?43:31,'#735576');}
export function magic(x,y,t,strength=1){c.save();c.globalAlpha=strength;for(let i=0;i<3;i++){c.strokeStyle=i%2?'#f6d495':'#b99bdd';c.lineWidth=5-i;c.beginPath();c.ellipse(x,y,25+((t*80+i*30)%110),14+((t*45+i*20)%65),-.4,0,Math.PI*2);c.stroke();}sparkles(x,y,t,13);c.restore();}
// Painted materials retain outlines, highlights and ground contact while their parts move.
function timber(x,y,w,h){const grain=c.createLinearGradient(x,y,x,y+h);grain.addColorStop(0,'#d8a76c');grain.addColorStop(.3,'#b17c4d');grain.addColorStop(1,'#805536');box(x,y,w,h,5,grain,'#654e37');line([[x+5,y+5],[x+w-6,y+5]],'#e5b67d',3);for(let i=0;i<3;i++)line([[x+8,y+h*(i+1)/4],[x+w-12,y+h*(i+1)/4+2]],'#81543655',2);}
function water(x,y,w=280){ellipse(x,y,w/2,26,'#527c83');ellipse(x,y-5,w/2-5,18,'#88bfc3');for(let i=0;i<5;i++)line([[x-w*.36+i*48,y-8+(i%2)*9],[x-w*.36+i*48+24,y-8+(i%2)*9]],'#d9f1df',2);}
function ripple(x,y,r,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle='#e3efe0';c.lineWidth=2;c.beginPath();c.ellipse(x,y,r,r*.22,0,0,Math.PI*2);c.stroke();c.restore();}
function crossingGap(x,y,w=280){if(SCENES[currentScene]?.indoor&&currentScene!=='boathouse'){ellipse(x,y,w/2,25,'#4f443b');line([[x-w/2,y],[x-w/2,y+15]],'#ae8c62',8);line([[x+w/2,y],[x+w/2,y+15]],'#ae8c62',8);}else water(x,y,w);}
function scissors(x,y,open){c.save();c.translate(x,y);c.rotate(-.45);for(const side of [-1,1]){c.save();c.rotate(side*(.05+.36*open));line([[-32*side,22],[36*side,-32]],'#526f78',10);line([[-28*side,19],[36*side,-32]],'#d1e1db',4);c.strokeStyle='#df9855';c.lineWidth=8;c.beginPath();c.ellipse(-39*side,31,15,20,side*.4,0,7);c.stroke();c.restore();}ellipse(0,0,6,6,'#f6d59a');c.restore();}
export function wordEcho(word,x,y,t){if(t>1.5)return;c.save();c.globalAlpha=Math.min(1,t*4)*clamp((1.5-t)*2);c.shadowColor='#fff2b9';c.shadowBlur=24;text(word,x,y-t*18,44,'#fff8df');c.restore();}
export function encounter(word,x,y,t,p=0,variant=0,cross=0){
 c.save();c.translate(x,y);ellipse(0,12,145,21,'#3e372327');
 if(word==='cut'){
  const snip=ease((p-.28)/.3),fall=ease((p-.55)/.45);
  if(variant===0){
   water(0,12,300);timber(-155,-20,35,45);timber(130,-20,35,45);
   c.save();c.translate(-135,-10);c.rotate(-1.38*(1-fall));for(let i=0;i<10;i++)timber(i*28,-12,27,24);line([[4,-15],[270,-15]],'#ecd4a5',3);c.restore();
   timber(122,-207,16,214);
   if(snip<.4)line([[-108,-155],[130,-200]],'#edcf9d',7);
   else{line([[-108,-155+fall*145],[-20,-180+fall*180]],'#edcf9d',6);line([[130,-200],[65,-190+fall*110]],'#edcf9d',6);}
  }else if(variant===1){
   timber(-152,-240,18,249);timber(135,-240,18,249);timber(-156,-249,314,20);
   for(let i=0;i<12;i++){const side=i<6?-1:1,dx=side*fall*125;const fold=c.createLinearGradient(-135+i*23+dx,0,-110+i*23+dx,0);fold.addColorStop(0,'#614867');fold.addColorStop(.45,'#b18ca5');fold.addColorStop(1,'#775575');box(-135+i*23+dx,-225,25,220*(1-fall*.1),5,fold);}
   if(snip===0)line([[-145,-170],[145,-170]],'#efd39c',6);else{line([[-145,-170],[-15-snip*125,-170+snip*120]],'#efd39c',6);line([[15+snip*125,-170+snip*120],[145,-170]],'#efd39c',6);}
  }else{
   const drift=fall*205;cart(drift,-fall*55);timber(-115,-105,17,114);line([[-107,-95],[-20,-60+snip*95]],'#edcf9d',6);if(snip<.5)line([[-20,-60],[45,-65]],'#edcf9d',6);
  }
  if(p>0&&p<.82){const sy=variant===0?-176:variant===1?-170:-70;scissors(-150,sy,1-snip);}
  if(snip>.05&&snip<.95)for(let i=0;i<7;i++){const a=i*2.4;line([[Math.cos(a)*20,-170+Math.sin(a)*20],[Math.cos(a)*38,-170+Math.sin(a)*38]],'#fff0bd',3);}
 }else if(word==='sun'){
  const dry=ease((p-.25)/.75);c.save();c.globalAlpha=1-dry;
  if(variant===1){for(let i=0;i<4;i++){poly([[-130+i*67,0],[-112+i*67,-65],[-64+i*67,-56],[-63+i*67,0]],'#b6dce4','#719eaf');line([[-107+i*67,-48],[-86+i*67,-16]],'#ecfbf8',4);}}
  else water(0,8,300);c.restore();
  if(p>0){c.save();c.globalAlpha=p*.22;const glow=c.createRadialGradient(0,-230,5,0,-130,260);glow.addColorStop(0,'#fff8a5');glow.addColorStop(1,'#fff3b000');c.fillStyle=glow;c.fillRect(-280,-420,560,460);c.restore();
   for(let i=0;i<10;i++){const a=i*Math.PI/5+t*.1;line([[Math.cos(a)*54,-235+Math.sin(a)*54],[Math.cos(a)*76,-235+Math.sin(a)*76]],'#f6cd66',6);}
   ellipse(0,-235,44,44,'#f4bf50');ellipse(-9,-246,28,24,'#ffde84');
   for(let i=0;i<5;i++){c.save();c.globalAlpha=Math.sin(dry*Math.PI)*.6;const ex=-100+i*49;line([[ex,-15-dry*40],[ex+7,-35-dry*70],[ex,-55-dry*85]],'#fff8e4',4);c.restore();}
  }
  c.save();c.globalAlpha=1-p;cloud(-p*130,-230,1.3,'#879b9c');c.restore();
  if(variant===2)for(let i=-2;i<3;i++)flower(i*55,-8,'#ffe8a7',.25+dry*1.6);
 }else if(word==='hop'){
  if(variant===0)water(0,12,320);
  else if(variant===1){for(let i=-1;i<=1;i++){timber(i*95-30,-42,60,49);line([[i*95-23,-35],[i*95+21,-5]],'#e5b67d',3);}}
  else {water(0,12,320);for(let i=-1;i<=1;i++){ellipse(i*95,-5,36,13,'#658c62');ellipse(i*95-3,-9,27,8,'#b2ce7b');}}
  if(variant===0)for(let i=-1;i<=1;i++){ellipse(i*95,-4,35,18,'#77867a');ellipse(i*95-4,-12,29,11,'#b4c2aa');}
  if(cross>0&&cross<1){const land=Math.floor(cross*4),rx=-155+land*95;ellipse(rx,8,20+(cross*4%1)*20,6,'#fff2c655');}
 }else if(word==='run'){
  // A magical path moving left: walking loses ground, running overcomes it.
  box(-170,-9,350,34,12,'#665775','#baa2cf');
  c.save();c.beginPath();c.rect(-165,-8,340,30);c.clip();
  for(let i=0;i<9;i++){const bx=-170+((i*48-t*95)%432+432)%432;line([[bx+15,-1],[bx+3,7],[bx+15,15]],'#d8c3e8',4);}c.restore();
  for(const edge of [-170,180]){ellipse(edge,6,14,20,'#9e80b9');ellipse(edge,6,6,11,'#e9d7ef');}
  if(p>0&&cross<1)for(let i=0;i<4;i++)line([[-250-i*14,-50-i*24],[-200-i*14,-50-i*24]],'#ffefd3',4);
 }else if(['boat','ship','car'].includes(word)){
  if(word!=='car')water(0,14,word==='ship'?420:330);else{
   line([[-220,12],[230,12]],'#b6b5a3',44);for(let i=-3;i<4;i++)line([[i*66-20,12],[i*66+8,12]],'#fff3d2',4);
   const pressed=ease((p-.2)/.35),open=ease((p-.6)/.4);
   for(const dx of [-195,-113]){box(dx-24,8+pressed*5,48,9,3,pressed>.8?'#8dbb89':'#d8ae65','#867252');line([[dx,18],[dx,36],[115,36],[115,-90]],'#8f8267',3);ellipse(dx,31,5,5,pressed>.8?'#c4efae':'#dbc697');}
   timber(106,-125,20,137);box(99,-112,34,59,7,'#819787','#506d60');for(let i=0;i<2;i++)ellipse(116,-97+i*22,7,7,pressed>.8?'#c2e4a0':'#d9ad69');
   c.save();c.translate(115,-124);c.rotate(open*Math.PI/2);box(-195,-9,198,18,6,'#eee0bd','#947d5a');for(let i=0;i<5;i++)poly([[-183+i*38,-8],[-165+i*38,-8],[-176+i*38,8],[-194+i*38,8]],'#b77e64');c.restore();
  }
  if(p>0){c.save();c.globalAlpha=clamp(p*3);const bx=-155+cross*380;
   if(word==='car'){box(bx-65,-58,130,48,15,'#bc7656','#774a38');box(bx-34,-92,69,42,13,'#dca277');box(bx-25,-85,49,28,5,'#b9dad6');for(const dx of [-40,42]){ellipse(bx+dx,-8,18,18,'#4a615d');ellipse(bx+dx,-8,8,8,'#ddc69c');}}
   else{if(cross>0&&cross<1)for(let i=0;i<3;i++)ripple(bx-75-i*22,15,17+i*12,(1-i/3)*.65);c.save();c.translate(bx,-Math.sin(cross*Math.PI)*30);c.scale(word==='ship'?1.35:1,word==='ship'?1.2:1);boat(0,0,word==='ship');c.restore();}c.restore();}
 }else if(['net','fish'].includes(word)){
  water(-50,14,240);const caught=ease((p-.2)/.45),unlock=ease((p-.65)/.35);
  timber(118,-190,14,200);c.save();c.translate(125,-180);c.scale(1-unlock*.94,1);timber(0,0,110,177);for(let i=0;i<3;i++)line([[20+i*33,5],[20+i*33,170]],'#e5bb82',4);c.restore();
  box(109,-98,30,34,6,unlock<.5?'#d2a65f':'#9bb582','#7c6846');ellipse(124,-84,4,5,'#61513a');
  const keyX=-30+caught*150,keyY=-12-Math.sin(caught*Math.PI)*155-caught*60;
  if(caught>0&&caught<.5)ripple(-30,8,18+caught*90,1-caught*2);
  if(unlock<1){c.strokeStyle='#e5bc60';c.lineWidth=7;c.beginPath();c.arc(keyX,keyY,12,0,7);c.stroke();line([[keyX+12,keyY],[keyX+35,keyY],[keyX+35,keyY+8]],'#e5bc60',6);}
  if(p>0&&p<.85){line([[-150,-15],[-60,-180]],'#94704b',7);if(word==='fish')line([[-60,-180],[keyX,keyY-15]],'#f5e8c9',2);else{c.strokeStyle='#eee1be';c.lineWidth=3;c.beginPath();c.ellipse(keyX,keyY-5,35,24,0,0,7);c.stroke();for(let i=-2;i<=2;i++)line([[keyX-26,keyY+i*8],[keyX+26,keyY+i*8]],'#eee1be',2);}}
 }else if(word==='pop'){
  for(let i=0;i<7;i++){const bx=Math.sin(i*8)*85,by=-25-i*27+Math.sin(t+i)*4,burst=clamp((p-i/9)*7);
   if(burst===0){const g=c.createRadialGradient(bx-12,by-14,3,bx,by,34);g.addColorStop(0,'#fff9');g.addColorStop(.65,'#b5dce966');g.addColorStop(1,'#e4c6e8cc');ellipse(bx,by,34,34,g);line([[bx-18,by-15],[bx-12,by-22],[bx-3,by-25]],'#fff8e5',3);}
   else if(burst<1){if(burst<.35){line([[bx-65,by+12],[bx-32,by]],'#ebbc94',8);ellipse(bx-30,by,6,5,'#f5d1ac');}c.save();c.globalAlpha=1-burst;for(let j=0;j<7;j++){const a=j*Math.PI*2/7;ellipse(bx+Math.cos(a)*(34+burst*44),by+Math.sin(a)*(34+burst*44),4,4,['#e1c0d8','#b5dce9','#f6dc96'][j%3]);}c.restore();}}
 }else if(['tap','drum','horn','clap'].includes(word)){
  const soundOn=ease((p-.12)/.25),response=ease((p-.4)/.6),beat=Math.sin(clamp((p-.12)/.42)*Math.PI*4);
  if(word==='clap'){
   for(let i=0;i<5;i++){const bx=-65+i*32+response*(80+i*15),by=-12-response*(130+i*25);ellipse(bx,by,15,11,'#86a4a4');poly([[bx+11,by],[bx+24,by+3],[bx+11,by+6]],'#dbad66');line([[bx,by],[bx-18,by-(response>0?14+Math.sin(t*14+i)*12:4)]],'#597f86',6);}
  }else{
   snail(30+response*175,-response*75,response>0);
   if(response===0){for(let i=0;i<2;i++){c.strokeStyle='#8b806b';c.lineWidth=2;c.beginPath();c.arc(27+i*22,-62-i*16,5,-.7,2);c.stroke();}}
   if(word==='tap'){
    timber(-105,-120,12,125);line([[-99,-119],[-44,-119]],'#ac8455',7);poly([[-61,-112],[-44,-112],[-34,-72],[-73,-72]],'#e5bd68','#9b754b');ellipse(-53,-68,5,6,'#8a704e');
    if(p>0&&p<.55){const touch=Math.sin(clamp(p/.4)*Math.PI);line([[-151,-85],[-100+touch*30,-83]],'#e9b68c',11);ellipse(-94+touch*30,-83,8,6,'#f1c69b');}
   }else if(word==='drum'){
    box(-117,-65,78,53,8,'#bd8468','#80583e');ellipse(-78,-65,39,11,'#f0dfb4');for(let i=0;i<4;i++)line([[-111+i*21,-57],[-101+i*21,-17]],'#e7c78d',3);
    if(p>0&&p<.65){line([[-131,-117],[-87,-76+beat*10]],'#826244',6);line([[-38,-119],[-66,-76-beat*10]],'#826244',6);}
   }else{
    poly([[-125,-129],[-64,-137],[-33,-171],[-33,-95],[-64,-121]],'#dbad58','#9a713c');ellipse(-33,-133,9,38,'#eed08b');ellipse(-33,-133,5,27,'#9b773f');
   }
  }
  if(soundOn>0&&response<1){c.save();c.globalAlpha=(1-response)*soundOn;for(let i=0;i<3;i++){c.beginPath();c.arc(-60,-92,35+((p*240+i*34)%120),-.7,.7);c.strokeStyle='#e4bb67';c.lineWidth=4;c.stroke();}c.restore();}
 }else if(word==='dig'){
  const scoop=ease((p-.2)/.8);c.save();c.scale(1,1-scoop*.92);ellipse(0,-24,115,53,'#a07a51');ellipse(-15,-40,87,27,'#c5a270');c.restore();
  for(let i=0;i<5;i++){const rx=-90+i*45;ellipse(rx,-3,23,10,'#a9b39b');}
  if(p>0&&p<1){c.save();c.translate(-100,-70);c.rotate(Math.sin(t*7)*.5);line([[0,-105],[0,5]],'#9b7148',9);poly([[-23,-5],[23,-5],[18,28],[0,42],[-18,28]],'#91a8a2','#566f69');c.restore();for(let i=0;i<8;i++){const flight=(t*1.7+i*.13)%1;ellipse(-10+flight*170,-40-Math.sin(flight*Math.PI)*80,5+i%4,4,'#b48c5e');}}
 }else if(word==='chop'){
  const split=ease((p-.35)/.65);for(const side of [-1,1]){c.save();c.translate(side*split*115,-split*45);c.rotate(side*split*.4);timber(side<0?-115:3,-48,112,46);c.restore();}
  if(p>0&&p<.75){c.save();c.translate(-70,-65);c.rotate(-.8+ease(p/.5)*1.6);line([[0,-110],[0,15]],'#986d46',8);poly([[-8,-105],[28,-112],[48,-81],[-8,-69]],'#b7cac7','#69827f');c.restore();}
 }else if(['spin','turn','coin'].includes(word)){
  crossingGap(45,15,255);const move=ease((p-.25)/.75);
  c.save();c.translate(-70,0);c.rotate(word==='turn'?(1-move)*.8:-(1-move)*1.3);for(let i=0;i<8;i++)timber(i*28,-13,27,23);c.restore();
  timber(-150,-115,20,125);line([[-140,-85],[-140,-20],[-70,-20],[-70,0]],'#8a7962',6);ellipse(-70,0,13,13,'#d3b777');line([[-79,-9],[-61,9]],'#846c4b',3);
  if(word==='coin'){box(-173,-108,65,85,8,'#789b92','#456960');box(-159,-89,37,8,4,'#3a5652');if(p>0&&p<.55){ellipse(-210+p*135,-155+p*130,18,18,'#f4cd73');ellipse(-210+p*135,-155+p*130,11,11,'#dca650');}}
  else{c.save();c.translate(-140,-110);c.rotate(p*t*3);if(word==='spin'){for(let i=0;i<4;i++){c.rotate(Math.PI/2);poly([[0,0],[0,-58],[37,-25]],i%2?'#d99b69':'#8bb8ad');}}else{c.strokeStyle='#d5ac6e';c.lineWidth=7;c.beginPath();c.arc(0,0,29,0,7);c.stroke();line([[-29,0],[29,0]],'#d5ac6e',5);}ellipse(0,0,7,7,'#f3d9a3');c.restore();}
 }else if(word==='rain'){
  ellipse(0,12,150,30,'#aa8d66');c.save();c.globalAlpha=p;water(0,12,290);c.restore();
  for(let i=0;i<8;i++)timber(-120+i*32,18-p*28,31,16);
  if(p>0&&p<1)for(let i=0;i<5;i++)ripple(-110+i*55,9,(t*25+i*9)%32,.45);
  cloud(0,-240,1.4,'#94a9a7');if(p>0&&p<1)for(let i=0;i<24;i++){const ry=((t*160+i*37)%210)-220;line([[-130+i*11,ry],[-134+i*11,ry+15]],'#91c6d7',3);}
 }else if(word==='team'){
  const push=ease((p-.45)/.55);cart(-40+push*170,-push*65);if(p>.25){child(-245,-25,t,{scale:.65,walking:push>0&&push<1,pose:'reach'});child(-330,-25,t+1,{scale:.65,walking:push>0&&push<1,pose:'reach'});}
 }else if(word==='stop'){
  // Cart repeatedly crosses the route until the hand stops and parks it.
  const park=ease((p-.4)/.6),cx=p===0?Math.sin(t*2)*90:90*park,cy=-park*90;
  line([[-150,4],[150,4]],'#d5b990',8);line([[0,4],[90,-90],[150,-90]],'#c1a57f',7);cart(cx,cy);if(p>.1&&p<.4){line([[cx-58,-8],[cx-74,-1]],'#c5b089',3);line([[cx+58,-8],[cx+74,-1]],'#c5b089',3);}
  if(p>0){c.save();c.globalAlpha=1-park;poly([[-90,-80],[-100,-112],[-89,-117],[-80,-96],[-79,-130],[-67,-130],[-65,-98],[-53,-120],[-43,-113],[-51,-77]],'#edba8c');c.restore();}
  if(p===0)for(let i=0;i<3;i++)line([[cx-76-i*12,cy-25],[cx-58-i*12,cy-25]],'#e6d6b4',3);
 }else if(word==='shut'){
  // Side window: closing it stops the crosswind, not the forward path.
  timber(-15,-230,140,16);timber(-15,-230,15,150);timber(110,-230,15,150);timber(-15,-90,140,16);
  box(0,-214,110,124,0,'#a5d0d3');c.save();c.translate(0,-214);c.scale(.12+.88*p,1);timber(0,0,110,124);ellipse(92,65,5,5,'#efd399');c.restore();
  if(p<1){c.save();c.globalAlpha=1-p;for(let i=0;i<5;i++){const wx=130-((t*150+i*51)%290),wy=-160+i*30;line([[wx,wy],[wx-60,wy+8]],'#edf4d9',4);ellipse(wx-35,wy+12,12,5,'#9cb779');}c.restore();}
 }else if(word==='rope'||word==='kite'){
  crossingGap(30,13,280);const latch=ease((p-.12)/.5),lower=ease((p-.6)/.4);
  c.save();c.translate(-110,-5);c.rotate(-1.35*(1-lower));for(let i=0;i<9;i++)timber(i*28,-10,27,20);c.restore();
  timber(145,-175,12,185);ellipse(150,-165,15,15,'#c6a071');
  if(word==='rope'){
   // Rope exists visibly coiled before use; pulling it releases bridge latch.
   c.strokeStyle='#d9ba81';c.lineWidth=6;c.beginPath();c.ellipse(-110,-23,26,12,0,0,Math.PI*4);c.stroke();
   line([[-150-latch*15,-105],[150,-165],[150,-140+latch*60]],'#e8cb92',5);
  }else{
   const kx=-45-latch*35,ky=-70-latch*190;
   poly([[kx,ky-44],[kx+32,ky],[kx,ky+43],[kx-32,ky]],'#e9b46a','#9f775b');poly([[kx,ky-44],[kx+32,ky],[kx,ky+43]],'#a1c4bc');
   line([[kx,ky+43],[kx-12,ky+65],[kx+7,ky+86]],'#d69788',4);
   line([[kx,ky+43],[150,-140-latch*30]],'#e3ce9f',3);line([[-150,-105],[kx,ky+43]],'#e3ce9f',3);
   if(latch<1)for(let i=0;i<3;i++)line([[-150,-180+i*30],[-105,-187+i*30]],'#e6efd7',3);
  }
  box(135,-140+latch*18,28,13,3,latch<.9?'#d6a967':'#b9cda4');
 }else if(word==='seed'){
  crossingGap(30,13,280);const plant=ease(p/.25),grow=ease((p-.25)/.75);
  box(-145,-30,60,38,8,'#b78062');ellipse(-115,-30,31,9,'#776145');
  if(p<.3)ellipse(-115,-65+plant*30,7,11,'#d6a768');
  if(plant>0&&grow<.15){for(let i=0;i<4;i++)ellipse(-128+i*9,-32,5,3,'#b38b5d');}
  if(grow>0){c.beginPath();c.moveTo(-115,-30);for(let j=1;j<=30;j++){const u=grow*j/30;c.lineTo(-115+u*265,-20-Math.sin(u*Math.PI)*75);}c.strokeStyle='#5c8554';c.lineWidth=14*grow;c.stroke();
   for(let i=0;i<8;i++){const u=i/7;if(u>grow)continue;const vx=-115+u*265,vy=-20-Math.sin(u*Math.PI)*75;ellipse(vx,vy,24,10,'#93b96c');line([[vx-18,vy],[vx+18,vy]],'#d1df9e',2);}}
 }else if(word==='slide'){
  poly([[-155,-125],[-120,-125],[225,0],[190,0]],'#bd9365','#816648');
  line([[-155,-129],[225,-4]],'#f5db9e',9);
  timber(-160,-120,18,130);for(let i=0;i<4;i++)timber(-191,-26-i*27,42,9);
  timber(-30,-175,18,110);timber(137,-119,18,110);line([[-30,-175],[150,-116]],'#af8757',22);
  if(cross>0&&cross<1)for(let i=0;i<3;i++)line([[-170+cross*380-i*15,-105+cross*125+i*9],[-195+cross*380-i*15,-114+cross*125+i*9]],'#fff1c9',3);
 }else if(word==='cube'){
  timber(15,-115,135,115);const appear=ease(p/.6);
  if(appear>0){c.save();c.globalAlpha=appear;box(-70,-62*appear,62,62*appear,3,'#d7a75e','#97713f');poly([[-70,-62],[-52,-77],[10,-77],[-8,-62]],'#f1cf83');poly([[-8,-62],[10,-77],[10,-15],[-8,0]],'#b88645');c.restore();}
 }else if(word==='fork'){
  const lift=ease((p-.2)/.8);for(let i=0;i<15;i++){const dx=lift*160,dy=-lift*95;line([[-75+i*11+dx,dy],[-60+i*8+dx,-62+dy]],i%2?'#c7a459':'#e1c37c',6);}
  if(p>0){c.save();c.translate(-50+lift*160,-25-lift*95);c.rotate(-.2-lift*.5);line([[0,-120],[0,0]],'#98734e',7);line([[-28,-25],[28,-25]],'#8ca9a5',6);for(let i=0;i<4;i++)line([[-27+i*18,-25],[-27+i*18,5]],'#a5c0b7',5);c.restore();}
 }else if(word==='toy'){
  const chase=ease((p-.25)/.75);const dogX=chase*170,dogY=-chase*80;
  ellipse(dogX,dogY-25,36,24,'#b58963');ellipse(dogX+30,dogY-45,22,24,'#c69b74');ellipse(dogX+46,dogY-48,5,5,'#3c4741');line([[dogX+15,dogY-58],[dogX+14,dogY-31]],'#936a4d',11);line([[dogX-32,dogY-30],[dogX-47,dogY-50+Math.sin(t*8)*8]],'#b58963',7);
  if(p>0){const bx=65+chase*150,by=-15-chase*80-Math.sin(chase*Math.PI)*40;ellipse(bx,by,21,21,'#d59d63');line([[bx-15,by-14],[bx+15,by+14]],'#f7d99b',5);}
 }else if(word==='cloud'){
  const shade=ease(p);ellipse(0,-230,44,44,'#f1be5d');
  for(let i=-1;i<=1;i++){ellipse(i*85,0,35,15,p<.6?'#cd9570':'#a6b7ae');if(p<1){c.save();c.globalAlpha=1-p;line([[i*85,-25],[i*85+8,-55],[i*85,-80]],'#e9bf7c',3);c.restore();}}
  if(p>0){c.save();c.globalAlpha=shade*.3;poly([[-110,-170],[110,-170],[170,15],[-170,15]],'#58798a');c.restore();cloud(-180+shade*180,-228,1.5,'#aec5c4');}
 }else{
  prop(word,0,0,t,p,variant);
  // Ground traces make the route and the villain's destination readable without text.
 }
 c.restore();
}
export function portal(x,y,t,amount=1){c.save();c.translate(x,y);c.scale(Math.max(.01,amount),1);const glow=c.createRadialGradient(0,-140,10,0,-140,180);glow.addColorStop(0,'#f9efffee');glow.addColorStop(.5,'#c591e8aa');glow.addColorStop(1,'#7652a100');ellipse(0,-140,150,190,glow);for(let i=0;i<3;i++){c.strokeStyle=['#fff1c5','#d3a6ef','#f5cf7f'][i];c.lineWidth=6-i;c.beginPath();c.ellipse(0,-140,70+i*15,145+i*12,0,0,Math.PI*2);c.stroke();}for(let i=0;i<12;i++){const a=i*Math.PI/6+t*2;ellipse(Math.cos(a)*98,-140+Math.sin(a)*175,5,5,'#fff1c5');}c.restore();}
function parkRailway(time,restored,arrival=1){
 // Rails and sleepers occupy a separate perimeter strip. A small pedestrian
 // bridge carries the entrance path over the circuit at the bottom centre.
 c.save();c.strokeStyle='#94795c';c.lineWidth=2;
 for(let i=0;i<110;i++){const a=i/110*Math.PI*2,x=500+465*Math.cos(a),y=280+200*Math.sin(a);line([[x-7*Math.cos(a),y-7*Math.sin(a)],[x+7*Math.cos(a),y+7*Math.sin(a)]],'#987a54',3);}
 for(const inset of [-4,4]){c.beginPath();c.ellipse(500,280,465+inset,200+inset,0,0,Math.PI*2);c.strokeStyle='#b5ada0';c.lineWidth=3;c.stroke();c.strokeStyle='#695f52';c.lineWidth=1;c.stroke();}
 if(restored){const p=trainPoint((time/65+.29)%1),next=trainPoint((time/65+.291)%1);c.save();c.translate(p.x,p.y);c.scale(next.x<p.x?1:-1,1);ride(0,0,'train',time,.46*ease(arrival));c.restore();}
 else{c.save();c.globalAlpha=.2;ride(290,517,'train',0,.4);c.restore();}
 // Small station entirely inside the fence, adjacent to the line.
 box(225,512,96,15,5,'#cfb487');line([[235,511],[235,487]],'#90714e',4);line([[310,511],[310,487]],'#90714e',4);poly([[225,487],[273,471],[320,487]],'#9b7860');
 timber(466,466,69,30);line([[466,462],[535,462]],'#ebd0a3',4);line([[466,498],[535,498]],'#ebd0a3',4);
 c.restore();
}
