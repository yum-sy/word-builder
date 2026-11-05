// White-matte removal also handles enclosed gaps without erasing small eye highlights.
// Authored alpha is preserved; this fallback is for the original opaque atlases.
export function clearMatte(data,width,height){
 const size=width*height;
 let transparent=0;for(let i=0;i<size;i++)if(data[i*4+3]<16)transparent++;
 if(transparent>size*.05)return;
 const visited=new Uint8Array(size),queue=new Int32Array(size);
 const white=i=>{const k=i*4,a=data[k],b=data[k+1],c=data[k+2];return Math.min(a,b,c)>235&&Math.max(a,b,c)-Math.min(a,b,c)<15;};
 for(let seed=0;seed<size;seed++){
  if(visited[seed]||!white(seed))continue;
  let head=0,tail=1,border=false;queue[0]=seed;visited[seed]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);if(x===0||x===width-1||y===0||y===height-1)border=true;
   for(const n of [x>0?i-1:-1,x<width-1?i+1:-1,y>0?i-width:-1,y<height-1?i+width:-1])if(n>=0&&!visited[n]&&white(n)){visited[n]=1;queue[tail++]=n;}
  }
  if(border||tail>400)for(let j=0;j<tail;j++)data[queue[j]*4+3]=0;
 }
}
// Separate complete silhouettes instead of slicing capes at guessed column edges.
export function silhouetteRegions(data,width,height,count){
 const size=width*height,seen=new Uint8Array(size),queue=new Int32Array(size),regions=[];
 for(let seed=0;seed<size;seed++){
  if(seen[seed]||data[seed*4+3]<32)continue;
  let head=0,tail=1,minX=width,minY=height,maxX=0,maxY=0;queue[0]=seed;seen[seed]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const n of [x>0?i-1:-1,x<width-1?i+1:-1,y>0?i-width:-1,y<height-1?i+width:-1])if(n>=0&&!seen[n]&&data[n*4+3]>=32){seen[n]=1;queue[tail++]=n;}
  }
  if(tail>1000)regions.push({minX,minY,maxX,maxY,pixels:queue.slice(0,tail),area:tail});
 }
 return regions.sort((a,b)=>b.area-a.area).slice(0,count).sort((a,b)=>a.minX-b.minX);
}
