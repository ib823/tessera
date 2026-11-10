import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const phone = { width:360, height:640 };
async function mounted(page: import('@playwright/test').Page, path='/') {
  await page.goto(path);
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

test('Phase 1 dock selects Top stories, Latest and Saved, with Graphics reachable', async ({page}) => {
  await page.setViewportSize(phone); await mounted(page);
  const nav=page.getByRole('navigation',{name:'Primary navigation'});
  await expect(nav.getByRole('button')).toHaveCount(3);
  await nav.getByRole('button',{name:'Latest',exact:true}).click();
  await expect(page.locator('[data-latest-list]')).toBeVisible();
  await expect(page).toHaveURL(/feed=latest/);
  await page.reload(); await expect(page.locator('[data-latest-list]')).toBeVisible();
  await nav.getByRole('button',{name:'Saved',exact:true}).click();
  await expect(page).toHaveURL(/view=library/);
  await expect(page.getByRole('button',{name:'Angle Code · sync your library'})).toBeVisible();
  await nav.getByRole('button',{name:'Top stories',exact:true}).click();
  await expect(page.locator('[data-lead-label]')).toBeVisible();
  await expect(page.getByRole('link',{name:'Graphics',exact:true})).toHaveAttribute('href','/infographics');
});

test('shipped typography uses Newsreader and system UI, with no font failures',async({page})=>{
  const failures:string[]=[];
  page.on('response',r=>{if(r.url().includes('/fonts/')&&!r.ok())failures.push(r.url());});
  await mounted(page);
  await page.evaluate(() => Promise.all([document.fonts.load('400 18px Newsreader'), document.fonts.load('700 24px Newsreader')]));
  const fonts=await page.evaluate(()=>({headline:getComputedStyle(document.querySelector('[data-fora-home] h1')!).fontFamily,body:getComputedStyle(document.body).fontFamily,regular:document.fonts.check('400 18px Newsreader'),bold:document.fonts.check('700 24px Newsreader')}));
  expect(fonts.headline).toContain('Newsreader');expect(fonts.body).toContain('system-ui');expect(fonts.regular&&fonts.bold).toBe(true);expect(failures).toEqual([]);
});

test('desktop reader stays readable when every hero image request fails',async({page,request})=>{
  await page.setViewportSize({width:1440,height:900});
  const issue=await(await request.get('/issues/1976.json')).json();
  await page.route('**/og/**',route=>route.abort());
  await mounted(page,'/issue/1976');
  await expect(page.getByRole('heading',{level:1,name:issue.headline,exact:true})).toBeVisible();
  for(const card of issue.cards) await expect(page.getByText(card.big,{exact:true}).last()).toBeVisible();
});

for(const [name,path] of [['home','/'],['saved','/?view=library&tab=archive'],['search','/?q=malaysia'],['topic','/topic/legal']] as const){
  test(`${name} reflows at 200% text on a short phone and passes axe`,async({page})=>{
    await page.setViewportSize(phone);await page.goto(path);
    if(!path.startsWith('/topic/')) await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
    await page.addStyleTag({content:'html { font-size:200% !important; }'});
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(result.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
}

test('Alerts presents one existing push control and browser permission state',async({page})=>{
  await page.setViewportSize(phone);await mounted(page);
  await page.getByRole('button',{name:'Alerts',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Alerts',exact:true});
  await expect(dialog.getByRole('switch')).toHaveCount(1);
  await expect(dialog.getByText('Up to 3 a week, on Tuesday, Thursday and Saturday.')).toBeVisible();
  await expect(dialog.getByText(/Notifications off|Notifications on|Notifications blocked|Push alerts are unavailable/)).toBeVisible();
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await expect(dialog.getByRole('textbox')).toHaveCount(0);
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Alerts',exact:true})).toBeFocused();
});


test('dossier print styles retain dark ink on white paper',async({page})=>{
  await page.goto('/dossier/D001'); await page.emulateMedia({media:'print'});
  const colors=await page.locator('body').evaluate(el=>({background:getComputedStyle(el).backgroundColor,ink:getComputedStyle(el).color}));
  expect(colors.background).toBe('rgb(255, 255, 255)');
  expect(colors.ink).toBe('rgb(15, 15, 35)');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
});
