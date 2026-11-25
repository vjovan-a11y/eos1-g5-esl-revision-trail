import asyncio, sys
from playwright.async_api import async_playwright
root, out = sys.argv[1], sys.argv[2]


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={"width": 1024, "height": 768}, device_scale_factor=2)
        await pg.goto('file://' + root + '/dist/index.html'); await pg.wait_for_timeout(900)
        await pg.get_by_text('5B03').first.click(); await pg.fill('input', 'An'); await pg.get_by_text('Start my trail').first.click()
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=out + '/1-trail-map.png')
        await pg.evaluate("location.hash='#stop-4'"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=out + '/2-stop-page.png')
        await pg.evaluate("location.hash='#stop-4-practise'"); await pg.wait_for_timeout(1200)
        await pg.get_by_role('button', name='Play: Learn it').click(); await pg.wait_for_timeout(3500)
        await pg.screenshot(path=out + '/3-listening-question.png')
        await pg.evaluate("location.hash='#stop-6-test'"); await pg.wait_for_timeout(1800)
        await pg.mouse.wheel(0, 380); await pg.wait_for_timeout(600)
        await pg.screenshot(path=out + '/4-reading-test.png')
        await pg.evaluate("location.hash='#stop-1-words'"); await pg.wait_for_timeout(1200)
        await pg.locator('.wd-set').nth(1).click(); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=out + '/5-word-list.png')
        await b.close()

asyncio.run(main())
