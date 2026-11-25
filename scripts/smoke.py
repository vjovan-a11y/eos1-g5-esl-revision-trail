import sys, asyncio
from playwright.async_api import async_playwright
URL = 'file://' + __import__('os').path.abspath('dist/index.html')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': int(sys.argv[2]) if len(sys.argv)>2 else 1280, 'height': 800})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.type + ' ' + m.text) if m.type in ('error','warning') else None)
        await pg.goto(URL + (sys.argv[1] if len(sys.argv)>1 else ''))
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/shot.png')
        print('\n'.join(errs[:20]) or 'no errors')
        print((await pg.inner_text('body'))[:600])
        await b.close()
asyncio.run(main())
