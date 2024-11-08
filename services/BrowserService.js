const puppeteer = require('puppeteer');

class BrowserService {

    static getBrowser() {
        return puppeteer.launch(
            //{ devtools: true }
        );
    }

    static closeBrowser(browser) {
        if (!browser) {
            return;
        }
        return browser.close();
    }

    static async getNewPage(browser, url) {
        const page = await browser.newPage();
        if (url) await page.goto(url);
        return page;
    }

    static async navigate(page, url) {
        return await page.goto(url)
    }
}
module.exports = BrowserService;
