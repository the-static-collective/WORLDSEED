// Browser-compatible SHA-256. Stable bytes are integrity witnesses, not signatures.
const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
const RR=(x,n)=>(x>>>n)|(x<<(32-n));
export function sha256(text){
 const input=new TextEncoder().encode(text),bitLen=input.length*8;
 const length=Math.ceil((input.length+9)/64)*64;
 const bytes=new Uint8Array(length);bytes.set(input);bytes[input.length]=128;
 const view=new DataView(bytes.buffer);view.setUint32(length-8,Math.floor(bitLen/4294967296),false);view.setUint32(length-4,bitLen>>>0,false);
 const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
 const w=new Uint32Array(64);
 for(let offset=0;offset<length;offset+=64){
  for(let i=0;i<16;i++)w[i]=view.getUint32(offset+i*4,false);
  for(let i=16;i<64;i++){let a=w[i-15],b=w[i-2];w[i]=(((RR(b,17)^RR(b,19)^(b>>>10))+w[i-7])|0)+((RR(a,7)^RR(a,18)^(a>>>3))+w[i-16])|0;}
  let [a,b,c,d,e,f,g,j]=h;
  for(let i=0;i<64;i++){
   const S1=RR(e,6)^RR(e,11)^RR(e,25),ch=(e&f)^(~e&g),t1=(j+S1+ch+K[i]+w[i])|0;
   const S0=RR(a,2)^RR(a,13)^RR(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)|0;
   j=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
  }
  for(let i=0;i<8;i++)h[i]=(h[i]+[a,b,c,d,e,f,g,j][i])|0;
 }
 return h.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
}
export function canonical(v){
 if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
 if(typeof v==='number'){if(!Number.isFinite(v))throw new Error('NON_FINITE');return JSON.stringify(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype)return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
 throw new Error('UNSUPPORTED_CANONICAL_VALUE');
}
export const hashRecord=(namespace,value)=>`sha256:${sha256(`${namespace}\n${canonical(value)}`)}`;
export const clone=x=>structuredClone(x);
export function assertUnique(rows,field='id'){const ids=rows.map(x=>x[field]);if(ids.some(x=>typeof x!=='string'||!x))throw new Error('BLANK_ID');if(new Set(ids).size!==ids.length)throw new Error('DUPLICATE_ID');}
