import asyncio, os, glob, sys
from playwright.async_api import async_playwright
root=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page()
        await pg.goto('file://'+root+'/dist/index.html')
        ids=[os.path.basename(f) for f in sorted(glob.glob(root+'/dist/audio/*.mp3'))]
        res = await pg.evaluate("""async ids => { const out=[]; for (const f of ids){ out.push(await new Promise(r=>{const a=new Audio('audio/'+f); a.onloadedmetadata=()=>r([f,a.duration]); a.onerror=()=>r([f,-1]); setTimeout(()=>r([f,-2]),8000);})) } return out }""", ids)
        bad=[r for r in res if not r[1] or r[1]<=0]
        print('loaded',len(res)-len(bad),'of',len(res),'total minutes',round(sum(r[1] for r in res if r[1] and r[1]>0)/60,1),'bad',bad)
        await b.close()
asyncio.run(main())
