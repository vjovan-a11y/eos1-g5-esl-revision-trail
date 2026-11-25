import asyncio, sys
from playwright.async_api import async_playwright
root, out = sys.argv[1], sys.argv[2]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={"width": 1024, "height": 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + root + '/dist/index.html'); await pg.wait_for_timeout(800)
        await pg.get_by_text('Teacher / TA').first.click(); await pg.wait_for_timeout(300)
        await pg.fill('input', 'Test Teacher'); await pg.get_by_text('Start my trail').first.click(); await pg.wait_for_timeout(1000)
        await pg.evaluate("location.hash='#stop-4-test'"); await pg.wait_for_timeout(1500)
        au = pg.locator('.au').first
        print('before:', await au.locator('.au__count').inner_text(), '| slower shown:', await au.locator('.au__slow').is_visible())
        await au.locator('.au__btn').click(); await pg.wait_for_timeout(1200)
        print('reading:', await au.locator('.au__count').inner_text())
        await au.locator('.au__btn').click(); await pg.wait_for_timeout(1500)       # Start now
        print('playing:', await au.locator('.au__count').inner_text(), '| button disabled:', await au.locator('.au__btn').is_disabled())
        # jump to the end of play 1
        await pg.evaluate("() => { const a = [...document.querySelectorAll('audio')]; }")
        for k in range(60):
            t = await au.locator('.au__count').inner_text()
            if 'again in' in t: break
            await pg.wait_for_timeout(1000)
        print('gap:', await au.locator('.au__count').inner_text())
        for k in range(60):
            t = await au.locator('.au__count').inner_text()
            if 'two times' in t: break
            await pg.wait_for_timeout(1000)
        print('end:', await au.locator('.au__count').inner_text(), '| label:', await au.locator('.au__label').inner_text())
        # practice: slower button
        await pg.evaluate("location.hash='#stop-4-see'"); await pg.wait_for_timeout(1500)
        print('practice slower shown:', await pg.locator('.au__slow').first.is_visible())
        print(errs or 'no errors')
        await b.close()

asyncio.run(main())
