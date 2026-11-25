import asyncio, sys
from playwright.async_api import async_playwright
root, out = sys.argv[1], sys.argv[2]
TEXT = ("Hi Felix! First, you need two paper cups and some string. Next, make a hole in each cup. "
        "Then put the string through and tie a knot. Finally, pull it tight because the sound needs a tight string.")


async def mark_rows(pg, sel, pick):
    rows = pg.locator(sel + ' .wd-crit__opts')
    n = await rows.count()
    for r in range(n):
        await rows.nth(r).locator('.wd-lv').nth(pick).click()
        await pg.wait_for_timeout(150)
    return n


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={"width": 1024, "height": 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + root + '/dist/index.html'); await pg.wait_for_timeout(800)
        await pg.get_by_text('Teacher / TA').first.click(); await pg.wait_for_timeout(300)
        await pg.fill('input', 'Test Teacher'); await pg.get_by_text('Start my trail').first.click(); await pg.wait_for_timeout(1000)
        # --- Stop 9 writing desk
        await pg.evaluate("location.hash='#stop-9-practise'"); await pg.wait_for_timeout(1200)
        await pg.get_by_text('Writing desk').first.click(); await pg.wait_for_timeout(400)
        if await pg.locator('.wd-card').count() == 0:
            await pg.locator('.actionbar__primary:visible').first.click(); await pg.wait_for_timeout(1500)
        await pg.locator('.wd-card').first.click(); await pg.wait_for_timeout(600)
        await pg.locator('.wd-area').fill(TEXT); await pg.wait_for_timeout(300)
        await pg.get_by_role('button', name='Check my writing').click(); await pg.wait_for_timeout(800)
        print('models visible before marking:', await pg.locator('.wd-models').count())
        print('practice rows:', await mark_rows(pg, '.wd-practice', 1))
        await pg.wait_for_timeout(400)
        print('compare shown:', await pg.locator('.wd-compare').is_visible())
        await pg.locator('.wd-practice').screenshot(path=out + '/practice.png')
        print('own rows:', await mark_rows(pg, '.wd-self:not(.wd-practice)', 1))
        await pg.wait_for_timeout(400)
        print('models after marking:', await pg.locator('.wd-models').count(), '| marks line:', await pg.locator('.wd-marks').first.inner_text())
        await pg.locator('.wd-models').screenshot(path=out + '/models.png')
        await pg.locator('.actionbar__primary').click(); await pg.wait_for_timeout(1500)
        print('after Next:', (await pg.locator('body').inner_text())[:200].replace('\n', ' | '))
        # --- Summit writing paper
        await pg.evaluate("location.hash='#summit-writing'"); await pg.wait_for_timeout(1500)
        areas = pg.locator('.wd-area')
        for i in range(await areas.count()):
            await areas.nth(i).fill(TEXT)
        await pg.get_by_role('button', name='Check my writing').click(); await pg.wait_for_timeout(800)
        print('summit practice sections:', await pg.locator('.wd-practice').count())
        for i in range(await pg.locator('.wd-practice').count()):
            rows = pg.locator('.wd-practice').nth(i).locator('.wd-crit__opts')
            for r in range(await rows.count()):
                await rows.nth(r).locator('.wd-lv').nth(2).click(); await pg.wait_for_timeout(100)
        await pg.wait_for_timeout(300)
        selfs = pg.locator('.wd-self:not(.wd-practice)')
        for i in range(await selfs.count()):
            rows = selfs.nth(i).locator('.wd-crit__opts')
            for r in range(await rows.count()):
                await rows.nth(r).locator('.wd-lv').nth(1).click(); await pg.wait_for_timeout(100)
        print('summit models shown:', await pg.locator('.wd-models').count())
        await pg.screenshot(path=out + '/summitw.png', full_page=True)
        print(errs or 'no errors')
        await b.close()

asyncio.run(main())
