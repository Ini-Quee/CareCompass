const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\HP\\carecompass\\docs\\images\\screenshots';

// Create directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

const screens = [
    { file: 'C:\\Users\\HP\\carecompass\\app-preview.html', name: '01-app-preview-dashboard', width: 1400, height: 900 },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '02-landing-page-hero', width: 1400, height: 900 },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '03-landing-page-stories', width: 1400, height: 900, scrollTo: '#stories' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '04-landing-page-features', width: 1400, height: 900, scrollTo: '#features' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '05-landing-page-pricing', width: 1400, height: 900, scrollTo: '#pricing' },
];

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const screen of screens) {
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: screen.width, height: screen.height });
            await page.goto(`file:///${screen.file.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
            
            if (screen.scrollTo) {
                await page.evaluate((selector) => {
                    const element = document.querySelector(selector);
                    if (element) element.scrollIntoView({ behavior: 'instant' });
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
    console.log('\nDone! Screenshots saved to:', screenshotsDir);
}

takeScreenshots();
