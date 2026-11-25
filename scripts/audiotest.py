import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page()
        await pg.goto('file://' + __import__('os').path.abspath('dist/index.html'))
        await pg.wait_for_timeout(800)
        await pg.get_by_text('Teacher / TA').first.click(); await pg.fill('input','T'); await pg.get_by_text('Start my trail').first.click()
        await pg.wait_for_timeout(800)
        await pg.evaluate("location.hash='#stop-5-test'"); await pg.wait_for_timeout(1500)
        await pg.locator('.au__btn').first.click(); await pg.wait_for_timeout(3000)
        print(await pg.evaluate("[...document.querySelectorAll('.au__label')].slice(0,1).map(x=>x.textContent)"),
              await pg.evaluate("(document.querySelector('.au__fill')||{}).style && document.querySelector('.au__fill').style.transform"))
        await b.close()
asyncio.run(main())
