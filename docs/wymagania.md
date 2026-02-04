# Dokumentacja Wymagań Projektowych
## Aplikacja do Śledzenia Cen Produktów

---

## 1. Wprowadzenie

### 1.1 Cel dokumentu
Niniejszy dokument zawiera szczegółowe wymagania projektowe dla aplikacji do monitorowania i śledzenia cen produktów w sklepach internetowych.

### 1.2 Zakres projektu
Aplikacja webowa umożliwiająca użytkownikom śledzenie cen wybranych produktów, wizualizację zmian cenowych w czasie oraz otrzymywanie powiadomień o zmianach cen.

### 1.3 Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes / Server Actions
- **Baza danych**: Firebase Firestore
- **Autentykacja**: Firebase Authentication
- **Hosting**: Lokalnie (development)
- **Styling**: Material UI (MUI) v7+
- **Wykresy**: Recharts

---

## 2. Analiza Konkurencji

### 2.1 Istniejące podobne produkty

| Produkt | Opis | Mocne strony | Słabe strony |
|---------|------|--------------|--------------|
| **Ceneo.pl** | Polski porównywarka cen | Duża baza produktów, historia cen, alerty cenowe | Ograniczony do partnerskich sklepów |
| **Skąpiec.pl** | Porównywarka cen | Historia cen, powiadomienia | Mniej intuicyjny interfejs |
| **Keepa** (Amazon) | Tracker cen Amazon | Szczegółowe wykresy, rozszerzenie Chrome | Tylko Amazon |
| **CamelCamelCamel** | Tracker cen Amazon | Prosty interfejs, alerty | Tylko Amazon |
| **Honey** | Rozszerzenie do cen i kuponów | Automatyczne kupony, tracking | Ograniczony do wybranych sklepów |
| **PriceSpy** | Międzynarodowa porównywarka | Wiele krajów, historia cen | Mniej popularny w Polsce |
| **Idealo** | Europejska porównywarka | Duża baza, wiarygodność | Ograniczona funkcjonalność alertów |

### 2.2 Wnioski z analizy konkurencji
- Większość serwisów opiera się na partnerstwach ze sklepami (dostęp do API/feedów)
- Historia cen w formie wykresu jest standardem
- Powiadomienia o zmianach cen są kluczową funkcją
- Rozszerzenia przeglądarkowe zwiększają wygodę użytkowania

---

## 3. Wymagania Funkcjonalne

### 3.1 Widoki aplikacji

#### 3.1.1 Ekran logowania / Rejestracji
- Logowanie przez email/hasło
- Logowanie przez Google (Firebase Auth)
- Formularz rejestracji
- Reset hasła

#### 3.1.2 Dashboard (Ekran główny po zalogowaniu)
**Elementy:**
- **Podsumowanie** - liczba śledzonych produktów, liczba produktów ze zmianą ceny
- **Ostatnie zmiany cen** - lista produktów z ostatnimi zmianami (trend ↑↓)
- **Największe spadki** - produkty z największymi obniżkami (okazje)
- **Największe wzrosty** - produkty które podrożały
- **Wykresy** - mini wykresy trendów dla najważniejszych produktów
- **Szybki dostęp** - przyciski do dodania produktu, przejścia do ulubionych

**Mockup struktury:**
```
┌─────────────────────────────────────────────────────────────┐
│  LOGO    [Dashboard] [Ulubione] [Szukaj]     [Profil] [+]   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Śledzone │ │ Spadki   │ │ Wzrosty  │ │ Alerty   │        │
│  │    24    │ │    5     │ │    3     │ │    2     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│  OSTATNIE ZMIANY CEN                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🏍️ Kask Shoei GT   1899 zł → 1699 zł  ↓ -10.5%    │    │
│  │ 🧥 Kurtka Revit     1499 zł → 1599 zł  ↑ +6.7%     │    │
│  │ 🧤 Rękawice Alpines  349 zł → 349 zł   → 0%        │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  WYKRESY TRENDÓW                                            │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ Produkt 1      │ │ Produkt 2      │ │ Produkt 3      │   │
│  │   📈           │ │   📉           │ │   📊           │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.3 Ulubione i Zapisane
**Funkcje:**
- Lista wszystkich śledzonych produktów
- Filtrowanie: wszystkie / spadki / wzrosty / bez zmian
- Sortowanie: po nazwie, cenie, dacie dodania, % zmiany
- Grupowanie po kategoriach (opcjonalne)
- Akcje: usuń, edytuj alert, zobacz historię

**Dla każdego produktu wyświetlać:**
- Zdjęcie produktu (jeśli dostępne)
- Nazwa produktu
- Aktualna cena
- Poprzednia cena
- Zmiana (% i wartość)
- Mini wykres trendu (ostatnie 7-30 dni)
- Sklep źródłowy
- Data ostatniej aktualizacji

#### 3.1.4 Wyszukiwarka Produktów
**Funkcje:**
- Pole wyszukiwania z autouzupełnianiem
- Opcja 1: Wklej link do produktu
- Opcja 2: Wyszukaj po nazwie (przyszła funkcjonalność)
- Wyniki wyszukiwania z możliwością dodania do śledzenia
- Historia wyszukiwań

#### 3.1.5 Widok szczegółów produktu
- Pełna historia cen (wykres)
- Lista wszystkich zarejestrowanych cen
- Statystyki: min, max, średnia, mediana
- Ustawienia alertów dla tego produktu
- Link do sklepu

#### 3.1.6 Ustawienia / Profil
- Dane użytkownika
- Preferencje powiadomień
- Częstotliwość sprawdzania cen
- Eksport danych
- Usunięcie konta

---

## 4. Mechanizm Wprowadzania Produktów

### 4.1 Analiza opcji

| Opcja | Zalety | Wady | Rekomendacja |
|-------|--------|------|--------------|
| **Link do produktu** | Precyzyjność, łatwa implementacja | Użytkownik musi znaleźć produkt | ✅ **MVP** |
| **Nazwa produktu + auto-wyszukiwanie** | Wygoda użytkownika | Złożona implementacja, potrzeba wielu integracji | ⏳ Faza 2 |

### 4.2 Rekomendowane podejście (MVP)

**Faza 1 - MVP: Wprowadzanie przez link**
1. Użytkownik wkleja URL produktu ze wspieranego sklepu
2. System rozpoznaje sklep i parsuje stronę (web scraping)
3. System pobiera: nazwę, cenę, zdjęcie, dostępność
4. Produkt jest dodawany do listy śledzonych

**Wspierane sklepy (początkowa lista):**
- Allegro (trudne - wymaga API partnera)
- Moto-Point.pl
- Motoblouz.pl
- Louis.eu
- FC-Moto.pl
- Xlmoto.pl
- Amazon.pl
- Allegro
- Motocyklista24.pl
- Gmoto.pl

**Faza 2 - Wyszukiwanie po nazwie:**
1. Użytkownik wpisuje nazwę produktu
2. System przeszukuje wspierane sklepy
3. Wyświetla znalezione produkty z cenami
4. Użytkownik wybiera które chce śledzić

---

## 5. Mechanizm Pobierania Danych

### 5.1 Analiza metod pobierania danych

| Metoda | Opis | Zalety | Wady |
|--------|------|--------|------|
| **Web Scraping** | Parsowanie HTML stron | Uniwersalne, bez umów | Niestabilne, może łamać ToS |
| **Oficjalne API** | Integracja z API sklepów | Stabilne, legalne | Wymaga partnerstw, ograniczone |
| **Feedy produktowe** | XML/JSON z danymi | Kompletne dane | Tylko dla partnerów |
| **Zewnętrzne API** | Serwisy agregujące ceny | Gotowe rozwiązanie | Koszty, zależność |

### 5.2 Dostępne zewnętrzne API/źródła danych

| Serwis | Dostęp | Cena | Uwagi |
|--------|--------|------|-------|
| **Ceneo API** | Partner | Płatne | Wymaga umowy partnerskiej |
| **Allegro API** | Developer | Darmowe (limity) | Tylko dla aplikacji w Allegro |
| **Keepa API** | Publiczne | $15-50/mies | Tylko Amazon |
| **Price API** | Publiczne | Od $49/mies | Wiele sklepów |
| **ScrapingBee/Bright Data** | Publiczne | Od $49/mies | Proxy do scrapingu |

### 5.3 Rekomendowany mechanizm (MVP)

**Architektura:**
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Scheduler     │────▶│  Scraping Worker │────▶│  Firestore  │
│ (CRON/Firebase) │     │  (Puppeteer/     │     │  (Historia  │
│                 │     │   Cheerio)       │     │   cen)      │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

**Komponenty:**

1. **Scheduler (Harmonogram)**
   - Firebase Cloud Functions z CRON trigger
   - Lub: Vercel Cron Jobs (jeśli hosting na Vercel)
   - Lub: Zewnętrzny serwis (cron-job.org) wywołujący API
   - Częstotliwość: 1-4 razy dziennie

2. **Scraping Worker**
   - Next.js API Route lub Firebase Cloud Function
   - Biblioteki: Puppeteer (dynamiczne strony) / Cheerio (statyczne HTML)
   - Obsługa błędów i retry logic
   - Rate limiting (nie przeciążać sklepów)

3. **Baza danych (Firestore)**
   ```
   /users/{userId}
     - email
     - preferences
     
   /users/{userId}/products/{productId}
     - url
     - name
     - imageUrl
     - currentPrice
     - lastUpdated
     - shopName
     - alertSettings
     
   /users/{userId}/products/{productId}/priceHistory/{timestamp}
     - price
     - timestamp
     - available
   ```

### 5.4 Częstotliwość sprawdzania

| Opcja | Użycie | Koszt zasobów |
|-------|--------|---------------|
| Co godzinę | Dla VIP/premium | Wysoki |
| Co 6 godzin | Standardowe | Średni |
| Co 24 godziny | MVP/podstawowe | Niski |

**Rekomendacja MVP:** 1-2 razy dziennie z możliwością ręcznego odświeżenia

---

## 6. Wyświetlanie Danych

### 6.1 Formaty prezentacji

| Format | Kiedy używać | Biblioteka |
|--------|--------------|------------|
| **Tabela** | Lista produktów, porównania | TanStack Table |
| **Wykres liniowy** | Historia cen w czasie | Recharts / Chart.js |
| **Karty** | Dashboard, przegląd | Custom components |
| **Mini sparkline** | Trend w tabeli | Recharts Sparkline |

### 6.2 Wskaźniki wizualne

```
↑ Wzrost ceny    - kolor czerwony
↓ Spadek ceny    - kolor zielony  
→ Bez zmian      - kolor szary
🔥 Gorąca okazja - spadek > 20%
⚠️ Alert         - osiągnięto próg cenowy
```

### 6.3 Przykładowy wykres historii cen

```
Cena (PLN)
   │
600├────●
   │     ╲
550├──────●─────●
   │             ╲
500├──────────────●────●
   │
   └────┬────┬────┬────┬────▶ Czas
       01   08   15   22   29
       Sty  Sty  Sty  Sty  Sty
```

---

## 7. Strategia doboru produktów

### 7.1 Analiza podejść

| Podejście | Zalety | Wady |
|-----------|--------|------|
| **Predefiniowane produkty** | Kontrola jakości danych | Ograniczony wybór |
| **Pełna swoboda użytkownika** | Elastyczność | Trudność w utrzymaniu scraperów |
| **Hybrydowe** | Balans | Średnia złożoność |

### 7.2 Rekomendacja

**Podejście hybrydowe:**
1. Użytkownik może dodać dowolny produkt z wspieranych sklepów
2. System utrzymuje listę "sprawdzonych" produktów (popularne)
3. Dla niewspieranych sklepów - informacja o ograniczeniach

**Wspierane kategorie (focus na motocykle - "Bikers Helper"):**
- Motocykle i skutery
- Kaski motocyklowe
- Odzież motocyklowa (kurtki, spodnie, kombinezony)
- Buty motocyklowe
- Rękawice motocyklowe
- Części i akcesoria motocyklowe
- Bagaż motocyklowy (kufry, sakwy)
- Elektronika motocyklowa (intercom, nawigacja, kamery)

---

## 8. Wymagania Niefunkcjonalne

### 8.1 Wydajność
- Czas ładowania strony: < 3s
- Czas odpowiedzi API: < 500ms
- Obsługa do 1000 produktów na użytkownika

### 8.2 Bezpieczeństwo
- Autentykacja przez Firebase Auth
- Reguły bezpieczeństwa Firestore
- Walidacja danych wejściowych
- HTTPS tylko

### 8.3 Skalowalność
- Architektura serverless (Firebase Functions)
- Możliwość dodania kolejnych sklepów
- Przygotowanie pod hosting (Vercel/Firebase Hosting)

### 8.4 UX/UI
- Responsywny design (mobile-first)
- Dark mode (opcjonalnie)
- Dostępność (WCAG 2.1 AA)
- Intuicyjna nawigacja

---

## 9. Plan Implementacji (Fazy)

### Faza 1 - MVP (2-3 tygodnie)
- [ ] Setup projektu (Next.js + Firebase)
- [ ] Autentykacja użytkowników
- [ ] Dodawanie produktów przez URL (2-3 sklepy)
- [ ] Podstawowy dashboard
- [ ] Lista śledzonych produktów
- [ ] Ręczne odświeżanie cen
- [ ] Podstawowa historia cen

### Faza 2 - Core Features (2-3 tygodnie)
- [ ] Automatyczny scheduler (CRON)
- [ ] Wykresy historii cen
- [ ] Więcej wspieranych sklepów
- [ ] Alerty cenowe (email)
- [ ] Filtrowanie i sortowanie

### Faza 3 - Polish (1-2 tygodnie)
- [ ] Wyszukiwarka produktów
- [ ] Ulepszone UI/UX
- [ ] Powiadomienia push
- [ ] Eksport danych
- [ ] Optymalizacja wydajności

### Faza 4 - Rozszerzenie (przyszłość)
- [ ] Rozszerzenie Chrome
- [ ] Porównywanie produktów między sklepami
- [ ] Rekomendacje produktów
- [ ] API dla zewnętrznych integracji

---

## 10. Struktura Projektu

```
bikers-helper/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx          # Dashboard główny
│   │   ├── favorites/
│   │   │   └── page.tsx      # Ulubione/Śledzone
│   │   ├── search/
│   │   │   └── page.tsx      # Wyszukiwarka
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Szczegóły produktu
│   │   └── settings/
│   │       └── page.tsx      # Ustawienia
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.ts      # CRUD produktów
│   │   │   └── scrape/
│   │   │       └── route.ts  # Scraping endpoint
│   │   └── cron/
│   │       └── route.ts      # Scheduler endpoint
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Komponenty bazowe
│   ├── dashboard/
│   ├── products/
│   └── charts/
├── lib/
│   ├── firebase.ts           # Firebase config
│   ├── scrapers/             # Scrapery dla sklepów
│   │   ├── louis.ts
│   │   ├── xlmoto.ts
│   │   ├── fcmoto.ts
│   │   └── index.ts
│   └── utils/
├── hooks/
├── types/
└── docs/
    ├── plan.md
    └── wymagania.md
```

---

## 11. Definicje typów (TypeScript)

```typescript
// types/product.ts
interface Product {
  id: string;
  userId: string;
  url: string;
  name: string;
  imageUrl?: string;
  currentPrice: number;
  previousPrice?: number;
  currency: string;
  shopName: string;
  shopLogo?: string;
  category?: string;
  available: boolean;
  lastUpdated: Date;
  createdAt: Date;
  alertSettings?: AlertSettings;
}

interface PriceHistoryEntry {
  price: number;
  timestamp: Date;
  available: boolean;
}

interface AlertSettings {
  enabled: boolean;
  targetPrice?: number;
  notifyOnAnyChange: boolean;
  notifyOnDrop: boolean;
  dropPercentage?: number;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  theme: 'light' | 'dark' | 'system';
}
```

---

## 12. Podsumowanie

Aplikacja "Bikers Helper" będzie narzędziem do śledzenia cen sprzętu motocyklowego, z możliwością rozszerzenia na inne kategorie. MVP skupia się na:

1. **Prostocie** - dodawanie produktów przez URL
2. **Użyteczności** - czytelny dashboard z trendami
3. **Niezawodności** - regularne aktualizacje cen

Kluczowe decyzje:
- ✅ Wprowadzanie przez link (MVP) → wyszukiwanie po nazwie (przyszłość)
- ✅ Web scraping jako główna metoda pobierania danych
- ✅ Scheduler 1-2x dziennie z ręcznym odświeżaniem
- ✅ Tabele + wykresy jako główne formy prezentacji
- ✅ Pełna swoboda użytkownika w wyborze produktów (w ramach wspieranych sklepów)

---

*Dokument przygotowany: 31 stycznia 2026*
*Wersja: 1.0*
