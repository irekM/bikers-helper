# Wymagania i Plan Wdrozenia: Scraper Cen Sklepow Motocyklowych (Next.js)

## 1. Cel Biznesowy

System ma automatycznie pobierac dane produktowe (nazwa, cena, URL, znacznik czasu) z wybranych sklepow motocyklowych i zapisywac je w bazie danych aplikacji.

Efekt dla uzytkownika:
- Aktualne ceny produktow w dashboardzie.
- Historia zmian cen do analizy trendu.
- Jedno zrodlo prawdy o cenach niezaleznie od sklepu.

## 2. Zakres MVP

MVP obejmuje:
- Pobieranie danych z 2-3 sklepow motocyklowych o stabilnej strukturze HTML.
- Scraping po URL-ach produktow zapisanych w systemie.
- Zapis odczytanych cen do bazy wraz z metadanymi.
- Harmonogram uruchamiania scrapera (np. co 6h lub 12h).
- Logowanie bledow i statusow zadan.
- Endpoint administracyjny do recznego uruchomienia scrapera.

Poza MVP (kolejne etapy):
- Zaawansowane anti-bot strategie.
- Kolejkowanie rozproszone na osobnej infrastrukturze.
- Parsing dynamicznych stron JS przez headless browser.

## 3. Wymagania Funkcjonalne

### 3.1 Zarzadzanie zrodlami
- System musi przechowywac konfiguracje sklepu:
	- `storeId`
	- `storeName`
	- `baseUrl`
	- `parserType`
	- `isActive`
- System musi wspierac rozne parsery per sklep.

### 3.2 Scraping produktu
- Dla danego URL produktu system musi pobrac:
	- `externalProductId` (jesli dostepne)
	- `productName`
	- `price`
	- `currency`
	- `availability` (jesli dostepne)
	- `fetchedAt`
- System musi normalizowac cene do formatu liczbowego.

### 3.3 Zapis i historia cen
- Kazdy odczyt ceny musi byc zapisywany jako rekord historii.
- System musi umiec odczytac ostatnia cene produktu.
- System nie moze nadpisywac historii cen (append-only dla historii).

### 3.4 Harmonogram i trigger reczny
- Scraper musi uruchamiac sie automatycznie wg harmonogramu.
- Scraper musi miec endpoint do triggera recznego (admin).
- Trigger reczny musi zwracac raport wykonania (ile sukcesow, ile bledow).

### 3.5 Obsluga bledow
- Bledy sieciowe i parse musza byc logowane.
- Blad jednego produktu nie moze przerywac calego batcha.
- Dla kazdego produktu musi byc zapisany status: `success` lub `error`.

## 4. Wymagania Niefunkcjonalne

### 4.1 Wydajnosc
- MVP: do 500 URL-i na cykl bez timeoutu globalnego.
- Ograniczenie rownoleglych zapytan (np. 3-8 jednoczesnie), aby nie blokowac hosta i nie triggerowac anti-bot.

### 4.2 Niezawodnosc
- Retry dla bledow przejsciowych (np. 2-3 proby z backoff).
- Timeout per request (np. 8-15s).
- Raport końcowy dla kazdego uruchomienia.

### 4.3 Bezpieczenstwo
- Endpoint reczny musi byc zabezpieczony (token serwisowy lub rola admin).
- Sekrety tylko w `.env`.
- Brak ekspozycji logiki scrapera po stronie klienta (server-only).

### 4.4 Utrzymywalnosc
- Architektura parserow pluginowa: nowy sklep = nowy parser, bez zmian w core.
- Wspolne interfejsy typow i walidacja danych (np. Zod).
- Czytelne logi i metryki.

## 5. Proponowana Architektura w Next.js

## 5.1 Komponenty systemu
- `lib/scrapers/` (obecna struktura projektu):
	- `base.ts` - bazowa klasa scrapera
	- `index.ts` - router scraperow i mapowanie domen
	- `utils.ts` - retry, walidacja URL, helpery
	- parsery sklepow motocyklowych: `louis.ts`, `xlmoto.ts`, `fcmoto.ts`
- `app/api/scrape/route.ts`:
	- reczny trigger scrape dla pojedynczego URL
- `app/api/cron/route.ts`:
	- endpoint odpalany przez scheduler (batch update cen)
- `lib/firebase.ts`:
	- odczyt produktow do aktualizacji
	- zapis nowych cen i historii zmian

### 5.2 Możliwosci Next.js wykorzystywane w rozwiazaniu
- Route Handlers (`app/api/.../route.ts`) jako bezpieczne endpointy backendowe.
- Server Runtime (Node.js) do wykonywania fetch + parsing po stronie serwera.
- Integracja z harmonogramem (Vercel Cron / zewnetrzny cron HTTP).
- `server-only` dla modulow scrapera (bez bundlowania do klienta).

## 6. Model Danych (propozycja)

### 6.1 Produkty monitorowane
- `trackedProducts`
	- `id`
	- `userId`
	- `storeId`
	- `productUrl`
	- `productName`
	- `isActive`
	- `createdAt`

### 6.2 Historia cen
- `priceHistory`
	- `id`
	- `trackedProductId`
	- `storeId`
	- `price`
	- `currency`
	- `availability`
	- `fetchedAt`
	- `sourceUrl`

### 6.3 Log uruchomien
- `scrapeRuns`
	- `id`
	- `startedAt`
	- `endedAt`
	- `total`
	- `successCount`
	- `errorCount`
	- `status`

## 7. Plan Wdrozenia (Etapy)

## Etap 1: Fundament techniczny
1. Zdefiniowac interfejs parsera i typy DTO danych scrape.
2. Dodac modul `scraperRunner` (core flow: fetch -> parse -> validate -> save).
3. Dodac walidacje danych parsera (np. Zod).
4. Dodac timeout i retry policy.

Akceptacja etapu:
- Runner potrafi przetworzyc 1 statyczny URL testowy i zapisac wynik.

## Etap 2: Integracja z baza i logami
1. Dodac funkcje odczytu aktywnych `trackedProducts`.
2. Dodac zapis rekordu do `priceHistory`.
3. Dodac zapis raportu do `scrapeRuns`.
4. Dodac logowanie bledow per produkt.

Akceptacja etapu:
- Po uruchomieniu batcha widac wpis run + historie cen dla sukcesow.

## Etap 3: Endpointy Next.js
1. Utrzymac i rozszerzyc `app/api/scrape/route.ts` (manual trigger URL).
2. Dodac autoryzacje endpointu (admin token).
3. Utrzymac i rozszerzyc `app/api/cron/route.ts` dla harmonogramu.
4. Zaimplementowac odpowiedz JSON z metrykami runu.

Akceptacja etapu:
- Endpoint manualny dziala lokalnie i na preview, zwraca raport.

## Etap 4: Parsery sklepow
1. Rozszerzyc i utrzymac parsery sklepow motocyklowych (Louis, XLMoto, FC-Moto).
2. Dodac kolejny parser sklepu motocyklowego wedlug priorytetu biznesowego.
3. Dodac fallbacki selektorow i testy parserow na fixture HTML.
4. Utrzymac mapowanie parsera po domenie URL (zgodnie z `lib/scrapers/index.ts`).

Akceptacja etapu:
- 2 sklepy zwracaja poprawna cene i nazwe na danych testowych.

## Etap 5: Harmonogram produkcyjny
1. Skonfigurowac cron (np. co 6h).
2. Dodac idempotencje runa (unikniecie podwojnego uruchomienia w tym samym oknie czasu).
3. Dodac alerting dla wzrostu `errorRate`.

Akceptacja etapu:
- Regularne runy dzialaja automatycznie i generuja raporty.

## Etap 6: Stabilizacja i hardening
1. Ograniczyc wspolbieznosc zapytan.
2. Dodac User-Agent rotation (minimum podstawowe).
3. Dodac monitorowanie latency i skutecznosci parserow.
4. Przeglad kosztow i limitow platformy.

Akceptacja etapu:
- Stabilne runy przez min. 7 dni bez krytycznych awarii.

## 8. Ryzyka i Mitigacje

### Ryzyko 1: Zmiana struktury HTML sklepu
- Mitigacja:
	- parsery per sklep,
	- testy fixture,
	- szybka podmiana selektorow.

### Ryzyko 2: Blokady anti-bot
- Mitigacja:
	- rate limit,
	- timeout/retry,
	- stopniowe zwiekszanie ruchu.

### Ryzyko 3: Limity execution platformy
- Mitigacja:
	- dzielenie batchy,
	- kontrola czasu runu,
	- ewentualny migration path do workerow poza Next.js.

## 9. Definition of Done (MVP)

MVP uznajemy za zakonczone, gdy:
1. System automatycznie scrapuje min. 2 sklepy wg harmonogramu.
2. Zapisuje historie cen i raport uruchomienia.
3. Endpoint manual trigger dziala i jest zabezpieczony.
4. Blad pojedynczego produktu nie zatrzymuje batcha.
5. Dashboard moze odczytac i pokazac najnowsza cene oraz trend.

## 10. Dodatkowe Ustalenia Zespolowe

- Kazdy nowy parser musi miec:
	- test fixture,
	- opis selektorow,
	- minimalny zestaw fallbackow.
- Zmiany w modelu danych musza byc wersjonowane i opisane w docs.
- Wszystkie endpointy scrapera tylko server-side i poza kodem klienta.
