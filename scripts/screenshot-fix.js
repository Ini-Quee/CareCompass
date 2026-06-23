const puppeteer = require('puppeteer');
const path = require('path');

const screenshotsDir = 'C:\\Users\\HP\\carecompass\\docs\\images\\screenshots';

const screens = [
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\github-hero.html', name: '19-github-hero', width: 1200, height: 800 },
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\security-architecture.html', name: '20-security-threats', width: 1200, height: 800 },
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\security-architecture.html', name: '21-security-controls', width: 1200, height: 800, scrollTo: 900 },
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\security-architecture.html', name: '22-security-owasp', width: 1200, height: 800, scrollTo: 1800 },
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\security-architecture.html', name: '23-security-hipaa', width: 1200, height: 800, scrollTo: 2700 },
    { file: 'C:\\Users\\HP\\carecompass\\docs\\images\\mobile-screens.html', name: '24-mobile-all-screens', width: 1600, height: 1000 },
];

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log(`Taking ${screens.length} remaining screenshots...\n`);

    for (const screen of screens) {
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: screen.width, height: screen.height });
            await page.goto(`file:///${screen.file.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 10000 });
            
            if (screen.scrollTo) {
                await page.evaluate((offset) => {
                    window.scrollTo(0, offset);
                }, screen.scrollTo);
                await new Promise(r => setTimeout(r, 500));
            }

            await page.screenshot({
                path: path.join(screenshotsDir, `${screen.name}.png`),
                fullPage: false
            });
            console.log(`✓ ${screen.name}.png`);
            await page.close();
        } catch (err) {
            console.log(`✗ ${screen.name}: ${err.message}`);
        }
    }

    await browser.close();
    console.log('\nDone!');
}

takeScreenshots();
