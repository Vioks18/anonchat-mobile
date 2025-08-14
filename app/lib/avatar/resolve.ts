import { ENABLE_GRAVATAR } from './config';

export type ResolveSource = 'explicit' | 'gravatar' | 'none';

function tinyMD5(input: string) {
  // Minimal MD5 (RFC1321) implementation for gravatar hashing (lowercased email).
  // NOTE: This is intentionally tiny; if performance ever matters, replace with a vetted lib post-eject.
  /* eslint-disable */
  function r(x: number, n: number): number {return (x<<n)|(x>>> (32-n));}
  function c(q: number, a: number, b: number, x: number, s: number, t: number): number {return ((r(((a+q+ x+ t)|0),s)+b)|0)>>>0;}
  function ff(a: number, b: number, c2: number, d: number, x: number, s: number, t: number): number {return c((b&c2)|((~b)&d),a,b,x,s,t);}
  function gg(a: number, b: number, c2: number, d: number, x: number, s: number, t: number): number {return c((b&d)|(c2&(~d)),a,b,x,s,t);}
  function hh(a: number, b: number, c2: number, d: number, x: number, s: number, t: number): number {return c(b^c2^d,a,b,x,s,t);}
  function ii(a: number, b: number, c2: number, d: number, x: number, s: number, t: number): number {return c(c2^(b|(~d)),a,b,x,s,t);}
  function toBlocks(str: string): number[][]{
    const n=str.length, bytes: number[]=[];
    for(let i=0;i<n;i++) bytes.push(str.charCodeAt(i));
    bytes.push(0x80);
    while((bytes.length%64)!==56) bytes.push(0);
    const bitLen=n*8;
    for(let i=0;i<8;i++) bytes.push((bitLen>>> (8*i)) & 0xff);
    const out: number[][]=[];
    for(let i=0;i<bytes.length;i+=64){
      const w=new Array(16);
      for(let j=0;j<16;j++) w[j]= bytes[i+4*j] | (bytes[i+4*j+1]<<8) | (bytes[i+4*j+2]<<16) | (bytes[i+4*j+3]<<24);
      out.push(w);
    }
    return out;
  }
  function md5(str: string): string{
    const blocks=toBlocks(str);
    let a=0x67452301, b=0xEFCDAB89, c2=0x98BADCFE, d=0x10325476;
    for(const x of blocks){
      let [aa,bb,cc,dd]=[a,b,c2,d];
      a=ff(a,b,c2,d,x[0],7,0xd76aa478); d=ff(d,a,b,c2,x[1],12,0xe8c7b756); c2=ff(c2,d,a,b,x[2],17,0x242070db); b=ff(b,c2,d,a,x[3],22,0xc1bdceee);
      a=ff(a,b,c2,d,x[4],7,0xf57c0faf); d=ff(d,a,b,c2,x[5],12,0x4787c62a); c2=ff(c2,d,a,b,x[6],17,0xa8304613); b=ff(b,c2,d,a,x[7],22,0xfd469501);
      a=ff(a,b,c2,d,x[8],7,0x698098d8); d=ff(d,a,b,c2,x[9],12,0x8b44f7af); c2=ff(c2,d,a,b,x[10],17,0xffff5bb1); b=ff(b,c2,d,a,x[11],22,0x895cd7be);
      a=ff(a,b,c2,d,x[12],7,0x6b901122); d=ff(d,a,b,c2,x[13],12,0xfd987193); c2=ff(c2,d,a,b,x[14],17,0xa679438e); b=ff(b,c2,d,a,x[15],22,0x49b40821);
      a=gg(a,b,c2,d,x[1],5,0xf61e2562); d=gg(d,a,b,c2,x[6],9,0xc040b340); c2=gg(c2,d,a,b,x[11],14,0x265e5a51); b=gg(b,c2,d,a,x[0],20,0xe9b6c7aa);
      a=gg(a,b,c2,d,x[5],5,0xd62f105d); d=gg(d,a,b,c2,x[10],9,0x02441453); c2=gg(c2,d,a,b,x[15],14,0xd8a1e681); b=gg(b,c2,d,a,x[4],20,0xe7d3fbc8);
      a=gg(a,b,c2,d,x[9],5,0x21e1cde6); d=gg(d,a,b,c2,x[14],9,0xc33707d6); c2=gg(c2,d,a,b,x[3],14,0xf4d50d87); b=gg(b,c2,d,a,x[8],20,0x455a14ed);
      a=gg(a,b,c2,d,x[13],5,0xa9e3e905); d=gg(d,a,b,c2,x[2],9,0xfcefa3f8); c2=gg(c2,d,a,b,x[7],14,0x676f02d9); b=gg(b,c2,d,a,x[12],20,0x8d2a4c8a);
      a=hh(a,b,c2,d,x[5],4,0xfffa3942); d=hh(d,a,b,c2,x[8],11,0x8771f681); c2=hh(c2,d,a,b,x[11],16,0x6d9d6122); b=hh(b,c2,d,a,x[14],23,0xfde5380c);
      a=hh(a,b,c2,d,x[1],4,0xa4beea44); d=hh(d,a,b,c2,x[4],11,0x4bdecfa9); c2=hh(c2,d,a,b,x[7],16,0xf6bb4b60); b=hh(b,c2,d,a,x[10],23,0xbebfbc70);
      a=hh(a,b,c2,d,x[13],4,0x289b7ec6); d=hh(d,a,b,c2,x[0],11,0xeaa127fa); c2=hh(c2,d,a,b,x[3],16,0xd4ef3085); b=hh(b,c2,d,a,x[6],23,0x04881d05);
      a=ii(a,b,c2,d,x[1],6,0xf4292244); d=ii(d,a,b,c2,x[8],10,0x432aff97); c2=ii(c2,d,a,b,x[15],15,0xab9423a7); b=ii(b,c2,d,a,x[6],21,0xfc93a039);
      a=ii(a,b,c2,d,x[13],6,0x655b59c3); d=ii(d,a,b,c2,x[4],10,0x8f0ccc92); c2=ii(c2,d,a,b,x[11],15,0xffeff47d); b=ii(b,c2,d,a,x[2],21,0x85845dd1);
      a=(a+aa)|0; b=(b+bb)|0; c2=(c2+cc)|0; d=(d+dd)|0;
    }
    const w=[a,b,c2,d];
    return w.map(v=>('00000000'+(v>>>0).toString(16)).slice(-8)).join('');
  }
  /* eslint-enable */
  return md5(input);
}

export async function resolveAvatarURL(params: {
  userId: string;
  avatarURL?: string | null;
  email?: string | null;
}): Promise<{ url: string | null; source: ResolveSource }> {
  const { avatarURL, email } = params;

  if (avatarURL && avatarURL.trim().length > 0) {
    return { url: avatarURL, source: 'explicit' };
  }
  if (ENABLE_GRAVATAR && email) {
    const hash = tinyMD5(email.trim().toLowerCase());
    // 128px, mp (mystery person), https scheme
    return { url: `https://www.gravatar.com/avatar/${hash}?s=128&d=mp`, source: 'gravatar' };
  }
  return { url: null, source: 'none' };
}
