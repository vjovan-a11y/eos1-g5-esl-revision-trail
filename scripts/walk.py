import sys, asyncio, json
from playwright.async_api import async_playwright
URL = 'file://' + __import__('os').path.abspath('dist/index.html')
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1280
routes = sys.argv[1].split(',')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={"width": W, "height": int(sys.argv[3]) if len(sys.argv)>3 else (820 if W > 600 else 760)})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        await pg.goto(URL)
        await pg.wait_for_timeout(800)
        await pg.get_by_text('Teacher / TA').first.click()
        await pg.wait_for_timeout(300)
        try:
            await pg.fill('input', 'Test Teacher')
        except Exception as e: pass
        await pg.get_by_text('Start my trail').first.click()
        await pg.wait_for_timeout(1200)
        for i, r in enumerate(routes):
            parts = r.split(':')
            if parts[0]:
                await pg.evaluate("h => { location.hash = h }", '#' + parts[0])
                await pg.wait_for_timeout(1400)
            for act in parts[1:]:
                if act.startswith('click='):
                    try: await pg.get_by_text(act[6:]).first.click(timeout=3000)
                    except Exception as e: errs.append('noclick ' + act)
                elif act.startswith('css='):
                    try: await pg.locator(act[4:]).first.click(timeout=3000)
                    except Exception as e: errs.append('nocss ' + act)
                elif act.startswith('type='):
                    await pg.keyboard.type(act[5:])
                elif act.startswith('wait='):
                    await pg.wait_for_timeout(int(act[5:]))
                await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'/tmp/w{i}.png')
        print('\n'.join(errs[:30]) or 'no errors')
        await b.close()
asyncio.run(main())
