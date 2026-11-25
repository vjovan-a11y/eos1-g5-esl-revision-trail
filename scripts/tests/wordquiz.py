import asyncio, sys
from playwright.async_api import async_playwright
root=sys.argv[1]; out=sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={"width":1024,"height":768})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+root+'/dist/index.html'); await pg.wait_for_timeout(800)
        await pg.get_by_text('5B03').first.click(); await pg.fill('input','An'); await pg.get_by_text('Start my trail').first.click(); await pg.wait_for_timeout(1200)
        for stop in range(1,10):
            await pg.evaluate(f"location.hash='#stop-{stop}-words'"); await pg.wait_for_timeout(1000)
            sets = await pg.locator('.wd-set').count()
            for s in range(sets):
                await pg.locator('.wd-set').nth(s).click(); await pg.wait_for_timeout(500)
                await pg.get_by_role('button', name='Quiz me').click(); await pg.wait_for_timeout(700)
                for q in range(6):
                    if not await pg.locator('.wd-words .choice').first.is_visible(): break
                    if stop==2 and s==1 and q==0: await pg.screenshot(path=out+'/quiz.png')
                    d = await pg.locator('.wd-mean__def').inner_text()
                    await pg.locator('.wd-words .choice').first.click(); await pg.wait_for_timeout(500)
                    if stop==2 and s==1 and q==0: await pg.screenshot(path=out+'/quiz2.png')
                    await pg.wait_for_timeout(3000)
                res = await pg.locator('body').inner_text()
                if 'out of' not in res: errs.append(f'no result stop{stop} set{s}')
                await pg.evaluate(f"location.hash='#stop-{stop}'"); await pg.wait_for_timeout(300)
                await pg.evaluate(f"location.hash='#stop-{stop}-words'"); await pg.wait_for_timeout(700)
        print(errs or 'no errors')
        await b.close()
asyncio.run(main())
