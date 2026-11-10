// Exercise the complete stealth gate in a disposable minimal distribution.
// The upstream OFL notice is permitted; edited notices and leaked terms fail.
import { mkdtemp, mkdir, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const revamp=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const work=await mkdtemp(join(tmpdir(),'fora-licence-gate-'));
try {
  await mkdir(join(work,'scripts/lib'),{recursive:true});
  await cp(join(revamp,'build-scripts/stealth.mjs'),join(work,'scripts/stealth.mjs'));
  await cp(join(revamp,'../scripts/lib/stealth-terms.mjs'),join(work,'scripts/lib/stealth-terms.mjs'));
  const notice=await readFile(join(revamp,'public/fonts/Newsreader-LICENSE.txt'),'utf8');
  for(const [name,file,content,passes] of [
    ['unmodified upstream licence','fonts/Newsreader-LICENSE.txt',notice,true],
    ['changed licence','fonts/Newsreader-LICENSE.txt',notice+'\nEdited notice\n',false],
    ['licence in another file','notice.txt',notice,false],
    ['prohibited content elsewhere','index.html','<p>OpenAI</p>',false],
  ]) {
    await rm(join(work,'dist'),{recursive:true,force:true});
    await mkdir(dirname(join(work,'dist',file)),{recursive:true});
    await writeFile(join(work,'dist',file),content);
    const result=spawnSync(process.execPath,[join(work,'scripts/stealth.mjs')],{encoding:'utf8'});
    if((result.status===0)!==passes)throw new Error(`${name}: unexpected gate result\n${result.stdout}\n${result.stderr}`);
    console.log(`PASS: ${name} ${passes?'accepted':'rejected'}`);
  }
} finally { await rm(work,{recursive:true,force:true}); }
