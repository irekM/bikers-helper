import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { defaultHeaders } from './utils';

interface BrowserPageOptions {
	timeoutMs?: number;
	waitUntil?: 'commit' | 'domcontentloaded' | 'load' | 'networkidle';
}

let browserPromise: Promise<Browser> | null = null;

function getBrowserTimeout(timeoutMs?: number): number {
	return timeoutMs ?? Number(process.env.SCRAPER_BROWSER_TIMEOUT_MS ?? 30000);
}

async function getBrowser(): Promise<Browser> {
	if (!browserPromise) {
		browserPromise = chromium.launch({
			headless: true,
		});
	}

	return browserPromise;
}

async function createContext(browser: Browser): Promise<BrowserContext> {
	return browser.newContext({
		userAgent: defaultHeaders['User-Agent'],
		locale: 'pl-PL',
		extraHTTPHeaders: {
			Accept: defaultHeaders.Accept,
			'Accept-Language': defaultHeaders['Accept-Language'],
			'Cache-Control': defaultHeaders['Cache-Control'],
			Pragma: defaultHeaders.Pragma,
		},
		viewport: {
			width: 1440,
			height: 1200,
		},
	});
}

export async function withBrowserPage<T>(
	callback: (page: Page, context: BrowserContext) => Promise<T>,
	options: BrowserPageOptions = {}
): Promise<T> {
	const browser = await getBrowser();
	const context = await createContext(browser);
	const page = await context.newPage();
	const timeout = getBrowserTimeout(options.timeoutMs);

	page.setDefaultTimeout(timeout);
	page.setDefaultNavigationTimeout(timeout);

	try {
		return await callback(page, context);
	} finally {
		await page.close().catch(() => undefined);
		await context.close().catch(() => undefined);
	}
}

export async function fetchRenderedHtml(
	url: string,
	options: BrowserPageOptions = {}
): Promise<string> {
	const timeout = getBrowserTimeout(options.timeoutMs);

	return withBrowserPage(async (page) => {
		await page.goto(url, {
			waitUntil: options.waitUntil ?? 'domcontentloaded',
			timeout,
		});

		await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 5000) }).catch(() => undefined);

		return page.content();
	}, options);
}

export async function closeBrowser(): Promise<void> {
	if (!browserPromise) {
		return;
	}

	const browser = await browserPromise;
	await browser.close().catch(() => undefined);
	browserPromise = null;
}
