const headers={'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'};
export default async function handler(request){
 const value=new URL(request.url).searchParams.get('src');
 let url;try{url=new URL(value);}catch{return new Response('Invalid logo',{status:400});}
 if(url.protocol!=='https:'||url.hostname!=='owcdn.net'||url.port||url.username||url.password||!/^\/img\/[a-z0-9_-]+\.(png|jpg|jpeg|webp)$/i.test(url.pathname)||url.search){return new Response('Invalid logo',{status:400});}
 try{
  const upstream=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{Accept:'image/png,image/jpeg,image/webp',Referer:'https://www.vlr.gg/'}});
  if(!upstream.ok)return new Response('Logo unavailable',{status:502});
  const type=upstream.headers.get('content-type')?.split(';')[0];
  if(!['image/png','image/jpeg','image/webp'].includes(type))return new Response('Invalid image',{status:502});
  const bytes=await upstream.arrayBuffer();
  if(bytes.byteLength>2*1024*1024)return new Response('Image too large',{status:502});
  return new Response(bytes,{headers:{...headers,'Content-Type':type}});
 }catch{return new Response('Logo unavailable',{status:502});}
}
