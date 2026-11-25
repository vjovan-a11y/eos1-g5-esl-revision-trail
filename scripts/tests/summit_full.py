import asyncio, sys
from playwright.async_api import async_playwright
root=sys.argv[1]; out=sys.argv[2]
async def clickall(pg, label, n):
    for k in range(n):
        loc = pg.get_by_role('button', name=label)
        if await loc.count()==0: return k
        try: await loc.first.click(timeout=1500)
        except: return k
        await pg.wait_for_timeout(250)
    return n
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={"width":1024,"height":900})
        await pg.goto('file://'+root+'/dist/index.html'); await pg.wait_for_timeout(800)
        await pg.get_by_text('Teacher / TA').first.click(); await pg.wait_for_timeout(300)
        await pg.fill('input','Test Teacher'); await pg.get_by_text('Start my trail').first.click(); await pg.wait_for_timeout(1000)
        await pg.evaluate("location.hash='#summit-test'"); await pg.wait_for_timeout(1200)
        await pg.get_by_text('Start Paper 1').first.click(); await pg.wait_for_timeout(1200)
        print('p1 marks clicks', await clickall(pg, 'Mark my paper', 60))
        await pg.screenshot(path=out+'/m1.png')
        await pg.get_by_text('Next: Paper 2').first.click(); await pg.wait_for_timeout(1200)
        print('p2 marks clicks', await clickall(pg, 'Mark my paper', 80))
        await pg.get_by_text('See my result').first.click(); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=out+'/result.png')
        print(await pg.inner_text('body'))
        await b.close()
asyncio.run(main())
