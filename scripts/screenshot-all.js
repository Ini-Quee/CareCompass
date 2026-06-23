const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\HP\\carecompass\\docs\\images\\screenshots';

const screens = [
    // App Preview - All 5 phone mockups
    { file: 'C:\\Users\\HP\\carecompass\\app-preview.html', name: '01-dashboard-overview', width: 1400, height: 1000 },
    
    // Landing Page Sections
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '02-landing-hero', width: 1400, height: 900 },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '03-landing-stories', width: 1400, height: 900, scrollTo: '#stories' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '04-landing-features', width: 1400, height: 900, scrollTo: '#features' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '05-landing-how-it-works', width: 1400, height: 900, scrollTo: '#how-it-works' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '06-landing-testimonials', width: 1400, height: 600, scrollOffset: 3200 },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '07-landing-pricing', width: 1400, height: 900, scrollTo: '#pricing' },
    { file: 'C:\\Users\\HP\\carecompass\\landing-page-final.html', name: '08-landing-faq', width: 1400, height: 900, scrollTo: '#faq' },
    
    // Pregnancy Wireframes
    { file: 'C:\\Users\\HP\\patient-health-platform\\pregnancy-companion-wireframes.html', name: '09-pregnancy-dashboard', width: 1400, height: 1000 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\pregnancy-companion-wireframes.html', name: '10-pregnancy-symptoms', width: 1400, height: 1000, scrollTo: 1200 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\pregnancy-companion-wireframes.html', name: '11-pregnancy-bp', width: 1400, height: 1000, scrollTo: 2400 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\pregnancy-companion-wireframes.html', name: '12-pregnancy-ai', width: 1400, height: 1000, scrollTo: 3600 },
    
    // Enhanced Wireframes
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '13-wireframe-onboarding', width: 1400, height: 1000 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '14-wireframe-journal', width: 1400, height: 1000, scrollTo: 1200 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '15-wireframe-medications', width: 1400, height: 1000, scrollTo: 2400 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '16-wireframe-vitals', width: 1400, height: 1000, scrollTo: 3600 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '17-wireframe-ai-assistant', width: 1400, height: 1000, scrollTo: 4800 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\wireframes-enhanced.html', name: '18-wireframe-emergency', width: 1400, height: 1000, scrollTo: 6000 },
    
    // GitHub Hero
    { file: 'C:\\Users\\HP\\patient-health-platform\\github-hero.html', name: '19-github-hero', width: 1200, height: 800 },
    
    // Security Architecture
    { file: 'C:\\Users\\HP\\patient-health-platform\\docs\\images\\security-architecture.html', name: '20-security-threats', width: 1200, height: 800 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\docs\\images\\security-architecture.html', name: '21-security-controls', width: 1200, height: 800, scrollTo: 900 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\docs\\images\\security-architecture.html', name: '22-security-owasp', width: 1200, height: 800, scrollTo: 1800 },
    { file: 'C:\\Users\\HP\\patient-health-platform\\docs\\images\\security-architecture.html', name: '23-security-hipaa', width: 1200, height: 800, scrollTo: 2700 },
    
    // Mobile Screens
    { file: 'C:\\Users\\HP\\patient-health-platform\\docs\\images\\mobile-screens.html', name: '24-mobile-all-screens', width: 1600, height: 1000 },
];

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log(`Taking ${screens.length} screenshots...\n`);

    for (const screen of screens) {
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: screen.width, height: screen.height });
            await page.goto(`file:///${screen.file.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 10000 });
            
            if (screen.scrollTo) {
                if (typeof screen.scrollTo === 'string') {
                    await page.evaluate((selector) => {
                        const element = document.querySelector(selector);
                        if (element) element.scrollIntoView({ behavior: 'instant' });
                    }, screen.scrollTo);
                } else {
                    await page.evaluate((offset) => {
                        window.scrollTo(0, offset);
                    }, screen.scrollTo);
                }
                await new Promise(r => setTimeout(r, 500));
            }

            if (screen.scrollOffset) {
                await page.evaluate((offset) => {
                    window.scrollTo(0, offset);
                }, screen.scrollOffset);
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
    console.log(`\nDone! ${screens.length} screenshots saved to:`);
    console.log(screenshotsDir);
}

takeScreenshots();
