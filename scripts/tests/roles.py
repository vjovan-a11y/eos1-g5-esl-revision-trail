import asyncio, sys
from playwright.async_api import async_playwright
root = sys.argv[1]
async def run(b, who):
    pg = await b.new_page(viewport={"width": 1024, "height": 768})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('file://' + root + '/dist/index.html'); await pg.wait_for_timeout(800)
    if who == 'student': await pg.get_by_text('5B03').first.click(); await pg.fill('input', 'An')
    else: await pg.get_by_text('Teacher / TA').first.click(); await pg.fill('input', 'T')
    await pg.get_by_text('Start my trail').first.click(); await pg.wait_for_timeout(1200)
    await pg.evaluate("location.hash='#stop-7-test'"); await pg.wait_for_timeout(1500)
    tags = await pg.locator('.tp-tag:visible').count()
    await pg.evaluate("location.hash='#stop-7-practise'"); await pg.wait_for_timeout(1000)
    await pg.get_by_role('button', name='Play: Learn it').click(); await pg.wait_for_timeout(1500)
    lo = await pg.locator('.mk__lo:visible').count()
    await pg.evaluate("location.hash='#summit'"); await pg.wait_for_timeout(1500)
    body = await pg.inner_text('body')
    print(who, '| role', await pg.evaluate("document.documentElement.dataset.role"), '| test labels shown', tags, '| game labels shown', lo,
          '| summit locked', 'Opens after' in body, '| Programme', 'Advanced Programme' in body, '|', errs or 'no errors')
    await pg.close()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        await run(b, 'student'); await run(b, 'teacher'); await b.close()
asyncio.run(main())
