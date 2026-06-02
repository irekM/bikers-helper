import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { cleanProductName, defaultHeaders, detectCurrency, normalizeImageUrl, parsePrice } from './utils';

interface BrowserPageOptions {
	timeoutMs?: number;
	waitUntil?: 'commit' | 'domcontentloaded' | 'load' | 'networkidle';
}

export interface BrowserPageProductSnapshot {
	name: string;
	price: number;
	currency: string;
	imageUrl?: string;
	available: boolean;
	availabilityText?: string;
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

function extractPriceTextFallback(bodyText: string): string {
	const compactText = bodyText.replace(/\s+/g, ' ');
	const currencyAfter = compactText.match(/\d[\d\s.,]*\s*(?:z\u0142|PLN|€|EUR|\$|USD|£|GBP)/i);

	if (currencyAfter?.[0]) {
		return currencyAfter[0];
	}

	const currencyBefore = compactText.match(/(?:z\u0142|PLN|€|EUR|\$|USD|£|GBP)\s*\d[\d\s.,]*/i);

	if (currencyBefore?.[0]) {
		return currencyBefore[0];
	}

	const generic = compactText.match(/\d{1,3}(?:[ .]\d{3})*(?:[.,]\d{2})?/);
 return generic?.[0] ?? '';
}

function resolveAvailability(availabilityText: string): boolean {
	if (!availabilityText) {
		return true;
	}

	const normalized = availabilityText.toLowerCase();
	const unavailableMarkers = [
		'niedost',
		'wyprzed',
		'brak w magazynie',
		'out of stock',
		'unavailable',
		'sold out',
		'nicht verfugbar',
		'nicht lieferbar',
	];

	return !unavailableMarkers.some((marker) => normalized.includes(marker));
}

export async function scrapeBasicProductInPageContext(
	url: string,
	options: BrowserPageOptions = {}
): Promise<BrowserPageProductSnapshot> {
	const timeout = getBrowserTimeout(options.timeoutMs);

	const snapshot = await withBrowserPage(async (page) => {
		await page.goto(url, {
			waitUntil: options.waitUntil ?? 'domcontentloaded',
			timeout,
		});

		await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 5000) }).catch(() => undefined);

		return page.evaluate(() => {
			const textFromSelectors = (selectors: string[]): string => {
				for (const selector of selectors) {
					const element = document.querySelector(selector);
					const text = element?.textContent?.trim();
					if (text) {
						return text;
					}
				}

				return '';
			};

			const attrFromSelectors = (selectors: string[], attr: string): string => {
				for (const selector of selectors) {
					const element = document.querySelector(selector);
					const value = element?.getAttribute(attr)?.trim();
					if (value) {
						return value;
					}
				}

				return '';
			};

			const nameSelectors = ['h1', '[itemprop="name"]', '[data-testid="product-name"]', '.product-title'];
			const priceSelectors = [
				'[itemprop="price"]',
				'[data-price]',
				'[data-testid="product-price"]',
				'.price',
				'.product-price',
			];
			const availabilitySelectors = [
				'[itemprop="availability"]',
				'.availability',
				'.product-availability',
				'[data-testid="availability"]',
			];
			const imageSelectors = ['img[itemprop="image"]', 'meta[property="og:image"]', '.product-image img'];

			const name = textFromSelectors(nameSelectors) || document.title || '';
			const priceText =
				attrFromSelectors(['[itemprop="price"]', '[data-price]'], 'content') ||
				attrFromSelectors(['[data-price]'], 'data-price') ||
				textFromSelectors(priceSelectors);
			const availabilityText =
				attrFromSelectors(['[itemprop="availability"]'], 'content') ||
				attrFromSelectors(['[itemprop="availability"]'], 'href') ||
				textFromSelectors(availabilitySelectors);

			let imageUrl = attrFromSelectors(['meta[property="og:image"]'], 'content');
			if (!imageUrl) {
				imageUrl = attrFromSelectors(imageSelectors, 'src');
			}

			return {
				name,
				priceText,
				availabilityText,
				imageUrl,
				bodyText: document.body?.innerText ?? '',
			};
		});
	}, options);

	const name = cleanProductName(snapshot.name);
	if (!name) {
		throw new Error('Could not extract product name from rendered page');
	}

	const resolvedPriceText = snapshot.priceText || extractPriceTextFallback(snapshot.bodyText);
	if (!resolvedPriceText) {
		throw new Error('Could not extract product price from rendered page');
	}

	const price = parsePrice(resolvedPriceText);
	if (!Number.isFinite(price) || price <= 0) {
		throw new Error('Could not parse a valid product price from rendered page');
	}

	const availabilityText = (snapshot.availabilityText || '').trim();

	return {
		name,
		price,
		currency: detectCurrency(`${resolvedPriceText} ${snapshot.bodyText}`),
		imageUrl: normalizeImageUrl(snapshot.imageUrl, url),
		available: resolveAvailability(availabilityText),
		availabilityText: availabilityText || undefined,
	};
}

export async function closeBrowser(): Promise<void> {
	if (!browserPromise) {
		return;
	}

	const browser = await browserPromise;
	await browser.close().catch(() => undefined);
	browserPromise = null;
}
