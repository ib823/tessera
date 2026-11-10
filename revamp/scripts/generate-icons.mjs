import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
const revamp=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir=resolve(revamp,'public'); mkdirSync(dir+'/icons',{recursive:true});
const mark=readFileSync(dir+'/favicon.svg','utf8').replace(/<style>.*?<\/style>/s,'').replace('<svg xmlns','<svg fill="#16181B" xmlns');
for(const name of readdirSync(resolve(revamp,'../public/icons'))) {
 const size=name==='apple-touch-icon.png'?180:Number(name.match(/(\d+)\.png$/)?.[1]); if(!size)continue;
 const monochrome=/^(badge|notif)-/.test(name);
 const content=monochrome?mark.replace(/fill="[^"]*"/g,'fill="#ffffff"'):mark;
 const ratio=name.includes('maskable')?.64:.8;
 const inset=Math.round(size*(1-ratio)/2); const inner=size-inset*2;
 const icon=await sharp(Buffer.from(content)).resize(inner,inner).png().toBuffer();
 await sharp({create:{width:size,height:size,channels:4,background:monochrome?{r:0,g:0,b:0,alpha:0}:'#FAF9F6'}}).composite([{input:icon,left:inset,top:inset}]).png().toFile(dir+'/icons/'+name);
}
await sharp(Buffer.from(mark)).resize(48,48).png().toFile(dir+'/favicon.png');
await sharp(Buffer.from(readFileSync(dir+'/fora-lockup.svg','utf8').replace(/<style>.*?<\/style>/s,'').replace('<svg xmlns','<svg fill="#16181B" xmlns'))).resize(448,112).png().toFile(dir+'/logo.png');
console.log('Compass icons rendered at all existing icon URLs; PWA identity preserved.');

const iconPng=await sharp(dir+'/favicon.png').resize(32,32).png().toBuffer();
const ico=Buffer.alloc(22); ico.writeUInt16LE(1,2); ico.writeUInt16LE(1,4); ico[6]=32; ico[7]=32; ico.writeUInt16LE(1,10); ico.writeUInt16LE(32,12); ico.writeUInt32LE(iconPng.length,14); ico.writeUInt32LE(22,18);
writeFileSync(dir+'/favicon.ico',Buffer.concat([ico,iconPng]));
