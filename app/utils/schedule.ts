export function rafDebounce<T extends (...args:any)=>void>(fn:T, frames=1) {
  let r:number|undefined, pending=false, lastArgs:any[]=[];
  return (...args:any[]) => {
    lastArgs = args;
    if (pending) return;
    pending = true;
    let count = 0;
    const step = () => {
      if (++count > frames) {
        pending = false;
        fn(...lastArgs);
      } else {
        r = requestAnimationFrame(step);
      }
    };
    r = requestAnimationFrame(step);
  };
}

export function afterInteractions(cb:()=>void) {
  const { InteractionManager } = require('react-native');
  InteractionManager.runAfterInteractions(cb);
}

export function debounceMs<T extends (...a:any)=>void>(fn:T, ms:number) {
  let t:any; return (...a:any[]) => { clearTimeout(t); t=setTimeout(()=>fn(...a), ms); };
}
