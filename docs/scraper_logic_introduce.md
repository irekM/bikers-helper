# Scraper Technical Implementation Guide (Next.js + Playwright)

## 1. Cel dokumentu

Ten dokument opisuje krok po kroku, jak wdrozyc scraper cen dla branzy motocyklowej w aktualnym projekcie `bikers-helper`.

Zakres:
- pobieranie danych produktowych z zewnetrznych sklepow,
- aktualizacja danych w Firebase,
- udostepnienie danych do dashboardu,
- uruchamianie reczne i cykliczne (cron),
- przejscie z prostego `fetch + cheerio` na podejscie oparte o Playwright tam, gdzie jest to potrzebne.

Ten dokument jest techniczny i przeznaczony dla zespolu developerskiego.

## 2. Aktualny stan projektu (as-is)

W projekcie istnieja juz podstawy backendu i frontendu:
- API route `app/api/scrape/route.ts` (manual scrape URL),
- API route `app/api/cron/route.ts` (batch update cen),
- API route `app/api/products/[id]/refresh/route.ts` (odswiezenie pojedynczego produktu),
- scraper registry i parsery w `lib/scrapers/*` (`louis`, `xlmoto`, `fcmoto`),
- Firebase layer w `lib/firebase.ts` z funkcjami `updateProductPrice`, `getAllProductsForUpdate`, historia cen,
- dashboard oparty o hook `hooks/useCurrentUserProducts.ts`.

Wniosek: fundament jest gotowy, ale nalezy dopracowac warstwe scrapingu pod strony dynamiczne i stabilnosc produkcyjna.

## 3. Target architecture (to-be)

Docelowo scraping dzielimy na dwa tryby:

1. `HTTP mode` (lekki):
- dla prostych stron (SSR/static),
- `fetch + cheerio`, szybkie i tansze.

2. `Browser mode` (Playwright):
- dla stron dynamicznych (render JS, lazy content, anti-bot),
- headless browser z kontrola timeoutow i selektorow.

Oba tryby maja zwracac ten sam kontrakt danych (`ScrapedProduct`) i byc obslugiwane przez ten sam runner.

## 4. Kolejnosc implementacji

## Etap 0: Setup i dependencies

### Krok 0.1 - Instalacja Playwright
W katalogu projektu uruchomic:

```bash
npm install -D playwright @playwright/test
npx playwright install chromium
```

Uwaga:
- na CI i produkcji trzeba zapewnic instalacje przegladarki Chromium,
- jesli deployment idzie na Vercel, sprawdzic limity runtime; dla ciezszych scrape jobs rozwazyc osobny worker.

### Krok 0.2 - Scripts w package.json
Dodac skrypty:

```json
{
	"scripts": {
		"playwright:test": "playwright test",
		"playwright:install": "playwright install chromium"
	}
}
```

### Krok 0.3 - Zmienne srodowiskowe
Do `.env.local` dodac:

```bash
CRON_SECRET=...
SCRAPER_ADMIN_TOKEN=...
SCRAPER_CONCURRENCY=3
SCRAPER_REQUEST_TIMEOUT_MS=15000
SCRAPER_BROWSER_TIMEOUT_MS=30000
SCRAPER_USE_PLAYWRIGHT_DEFAULT=false
```

## Etap 1: Kontrakt i core runner

### Krok 1.1 - Rozszerzenie typow
Plik: `types/index.ts`

Rozszerzyc kontrakt o pola pomocne operacyjnie:
- `sourceType: 'http' | 'browser'`,
- `externalProductId?: string`,
- `availabilityText?: string`.

Cel: lepsza diagnostyka i latwiejsze porownanie skutecznosci parserow.

### Krok 1.2 - Wprowadzenie jawnego runnera
Dodac nowy modul:
- `lib/scrapers/runner.ts`

Runner odpowiada za sekwencje:
1. walidacja URL,
2. wybor parsera po domenie,
3. wybor trybu (`http` albo `browser`),
4. retry z backoff,
5. normalizacja i walidacja danych,
6. zwrot wyniku i metryk.

### Krok 1.3 - Walidacja danych wejsciowych/wyjsciowych
Dodac Zod:

```bash
npm install zod
```

Dodac plik:
- `lib/scrapers/schemas.ts`

Zakres:
- walidacja URL input,
- walidacja `ScrapedProduct` output,
- mapowanie bledow parsera na kody aplikacyjne.

## Etap 2: Integracja Playwright

### Krok 2.1 - Utworzenie Playwright base scraper
Dodac plik:
- `lib/scrapers/playwrightBase.ts`

Implementacja:
- singleton browser (ograniczenie kosztu startu),
- helper `newContext()` i `newPage()`,
- timeout globalny i timeout na selektory,
- bezpieczne zamykanie strony po scrape.

### Krok 2.2 - Rozszerzenie parserow sklepowych
Pliki:
- `lib/scrapers/louis.ts`
- `lib/scrapers/xlmoto.ts`
- `lib/scrapers/fcmoto.ts`

Dla kazdego parsera:
1. zostawic lekka sciezke HTTP, jesli dziala,
2. dodac fallback Playwright dla problematycznych przypadkow,
3. dopisac minimum 2 fallback selektory ceny i nazwy,
4. dodac twarda walidacje (`price > 0`, sensowna nazwa produktu).

### Krok 2.3 - URL policy i blokada nieobslugiwanych domen
Plik: `lib/scrapers/index.ts`

Wymagania:
- utrzymac mapowanie domen,
- logowac domeny odrzucone,
- zwracac komunikat z lista wspieranych sklepow.

## Etap 3: API i bezpieczenstwo

### Krok 3.1 - Hardening `/api/scrape`
Plik: `app/api/scrape/route.ts`

Do wdrozenia:
- autoryzacja tokenem admina (`SCRAPER_ADMIN_TOKEN`) dla endpointu manualnego,
- wsparcie body: `{ url, mode?: 'auto' | 'http' | 'browser' }`,
- odpowiedz z metadanymi: czas wykonania, sourceType, parserName.

### Krok 3.2 - Hardening `/api/products/[id]/refresh`
Plik: `app/api/products/[id]/refresh/route.ts`

Do wdrozenia:
- ten sam runner co w `/api/scrape`,
- ochrona przed race condition (opcjonalnie lock per produkt),
- ujednolicona struktura bledu.

### Krok 3.3 - Hardening `/api/cron`
Plik: `app/api/cron/route.ts`

Do wdrozenia:
- pozostaje auth przez `CRON_SECRET`,
- concurrency limit zamiast czysto sekwencyjnego for-loop,
- raport runu: `total`, `success`, `failed`, `durationMs`, `errorRate`.

## Etap 4: Warstwa danych i logowanie

### Krok 4.1 - Rozszerzenie zapisu historii cen
Plik: `lib/firebase.ts`

Do wdrozenia:
- przy zapisie historii ceny dopisac `sourceType` i `scrapedAt`,
- zachowac append-only dla kolekcji historii,
- nie wykonywac update produktu, jesli cena i dostepnosc nie ulegly zmianie (optymalizacja write quota).

### Krok 4.2 - Log uruchomien scrapera
Dodac nowa kolekcje, np. `scrapeRuns`.

Zapisywac:
- start i koniec runu,
- liczbe sukcesow i bledow,
- liste bledow skrcona do limitu (np. 100 wpisow),
- mode summary (ile http, ile browser).

## Etap 5: Wyswietlanie danych w dashboardzie

### Krok 5.1 - Rozszerzenie API produktu
Pliki:
- `app/api/products/[id]/route.ts`
- (opcjonalnie) nowe endpointy diagnostyczne admina

Udostepnic frontendowi:
- ostatni `scrapedAt`,
- status ostatniego odswiezenia,
- trend ceny z historii.

### Krok 5.2 - Hooki i komponenty
Pliki:
- `hooks/useProducts.ts`
- `hooks/useCurrentUserProducts.ts`
- komponenty dashboardu (`components/dashboard/*`, `components/charts/*`)

Do wdrozenia:
- odswiezanie stanu po recznym refresh,
- komunikat o bledzie scrape per produkt,
- widok "last checked" i indicator zmiany ceny.

## Etap 6: Testy i QA

### Krok 6.1 - Testy parserow na fixture
Dodac katalog:
- `lib/scrapers/__fixtures__/`

Dodac testy:
- parser nazwy,
- parser ceny,
- parser dostepnosci,
- fallback selektorow.

### Krok 6.2 - Testy Playwright (E2E/API smoke)
Dodac:
- `playwright.config.ts`
- testy smoke dla endpointu `/api/scrape`.

Przyklad zakresu testu:
1. request dla wspieranej domeny,
2. odpowiedz `success: true`,
3. `price > 0`,
4. `sourceType` zgodny z trybem.

### Krok 6.3 - Checklist przed produkcja
- czy cron dziala z sekretem,
- czy limity concurrency sa ustawione,
- czy parsery min. 2 sklepow przechodza testy,
- czy dashboard pokazuje aktualna cene i historie,
- czy logi runow sa zapisywane.

## Etap 7: Deployment i operacje

### Krok 7.1 - Harmonogram
Opcje:
- Vercel Cron (jesli runtime i limity wystarcza),
- zewnetrzny scheduler HTTP,
- osobny worker (preferowane przy rosnacej skali).

### Krok 7.2 - Monitoring
Minimalnie monitorowac:
- czas wykonania runu,
- error rate,
- skutecznosc parserow per domena,
- liczbe przypadkow fallback do Playwright.

### Krok 7.3 - Incident playbook
Przy naglym wzroscie bledow:
1. zidentyfikowac sklep i parser,
2. sprawdzic zmiany HTML,
3. poprawic selektory,
4. uruchomic test fixture,
5. wdrozyc hotfix.

## 5. Proponowany podzial na PR-y

1. PR-1: Setup Playwright + env + scripts.
2. PR-2: Runner + Zod + typy.
3. PR-3: Playwright base + refactor parserow.
4. PR-4: API hardening (`/api/scrape`, `/api/cron`, `/api/products/[id]/refresh`).
5. PR-5: Firebase logs + historia cen + dashboard integration.
6. PR-6: Testy fixtures + smoke + stabilizacja.

## 6. Definition of Done (techniczne)

Wdrozenie uznajemy za zakonczone, gdy:
1. Scraper poprawnie obsluguje min. 2 sklepy motocyklowe w trybie produkcyjnym.
2. Endpointy API zwracaja ujednolicony raport i bledy.
3. Cron wykonuje cykliczne aktualizacje i zapisuje log uruchomienia.
4. Historia cen jest zapisywana i widoczna na dashboardzie.
5. Zespol posiada testy parserow i procedure szybkiej naprawy po zmianie HTML sklepow.

## 7. Najblizszy start implementation (rekomendacja)

Pierwsze 3 zadania do wykonania od razu:
1. Zainstalowac Playwright i dodac skrypty.
2. Dodac `runner.ts` i `schemas.ts` (Zod).
3. Przepiac `/api/scrape` na nowy runner i dodac `mode: auto/http/browser`.

Po tych 3 krokach bedzie mozna iteracyjnie migrowac parsery sklepowe bez blokowania frontendu.