let promptEvent=null;
const standalone=window.matchMedia('(display-mode: standalone)');
let installed=standalone.matches||navigator.standalone===true;
const notify=()=>window.dispatchEvent(new Event('app-install-state'));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;notify();});
window.addEventListener('appinstalled',()=>{installed=true;promptEvent=null;document.querySelector('#install-dialog')?.close();notify();});
standalone.addEventListener('change',event=>{installed=event.matches;notify();});
export const isInstalled=()=>installed;
export async function installApp(){
 if(promptEvent){const event=promptEvent;promptEvent=null;try{await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted')installed=true;notify();return;}catch{ /* Browser can revoke a saved prompt; offer its menu instead. */ }}
 let dialog=document.querySelector('#install-dialog');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='install-dialog';dialog.className='install-dialog';
  const appleMobile=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const safari=/Safari/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg/.test(navigator.userAgent);
  const instructions=appleMobile?'Tap Share, then “Add to Home Screen”.':safari?'In Safari, choose File → Add to Dock.':'Open this page in Chrome or Edge. Use the install icon in the address bar, or choose “Install app” in the browser menu.';
  dialog.innerHTML=`<form method="dialog"><button class="install-close" aria-label="Close">×</button><img class="install-portrait" src="./assets/art/app-icon-192.png" alt="Word Builder villain"><h2>Install app</h2><p>Play from your desktop!</p><p class="install-help">${instructions}</p><p class="install-url"></p><button type="button" id="copy-install-link">Copy link</button><button class="install-done">Done</button><p class="install-status" role="status"></p></form>`;
  dialog.querySelector('.install-url').textContent=new URL('../',import.meta.url).href;
  dialog.querySelector('#copy-install-link').onclick=async()=>{try{await navigator.clipboard.writeText(new URL('../',import.meta.url).href);dialog.querySelector('.install-status').textContent='Link copied!';}catch{dialog.querySelector('.install-status').textContent='Select the link above to copy it.';}};
  document.body.append(dialog);
 }
 dialog.showModal();
}
// Development review pages keep their live, uncached behavior.
if('serviceWorker' in navigator&&location.protocol==='https:'&&!['localhost','127.0.0.1'].includes(location.hostname)){
 window.addEventListener('load',()=>{navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{scope:new URL('../',import.meta.url).pathname,updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{});});
}
