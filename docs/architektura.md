# Plan Architektury - Bikers Helper

## Przegląd Systemu

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BIKERS HELPER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │    FRONTEND      │    │     BACKEND      │    │    SCRAPER       │       │
│  │    (Next.js)     │◄──►│  (API Routes)    │◄──►│   (Cheerio)      │       │
│  │                  │    │                  │    │                  │       │
│  │  • Dashboard     │    │  • /api/products │    │  • Louis.eu      │       │
│  │  • Favorites     │    │  • /api/scrape   │    │  • XLMoto        │       │
│  │  • Search        │    │  • /api/auth     │    │  • FC-Moto       │       │
│  │  • Settings      │    │  • /api/cron     │    │  • Motoblouz     │       │
│  └────────┬─────────┘    └────────┬─────────┘    └──────────────────┘       │
│           │                       │                                          │
│           │                       ▼                                          │
│           │              ┌──────────────────┐                               │
│           └─────────────►│    FIREBASE      │                               │
│                          │                  │                               │
│                          │  • Firestore     │                               │
│                          │  • Auth          │                               │
│                          └──────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Architecture

### 1.1 Struktura katalogów

```
app/
├── (auth)/                    # Grupa routingu - autentykacja
│   ├── login/
│   │   └── page.tsx          # Strona logowania
│   ├── register/
│   │   └── page.tsx          # Strona rejestracji
│   └── layout.tsx            # Layout dla auth (bez nawigacji)
│
├── (dashboard)/               # Grupa routingu - zalogowany użytkownik
│   ├── layout.tsx            # Layout z nawigacją
│   ├── page.tsx              # Dashboard główny
│   ├── favorites/
│   │   └── page.tsx          # Lista śledzonych produktów
│   ├── search/
│   │   └── page.tsx          # Wyszukiwarka / dodawanie produktów
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx      # Szczegóły produktu
│   └── settings/
│       └── page.tsx          # Ustawienia użytkownika
│
├── api/                       # API Routes (Backend)
│   ├── products/
│   │   ├── route.ts          # GET (lista), POST (dodaj)
│   │   └── [id]/
│   │       └── route.ts      # GET, PUT, DELETE pojedynczego
│   ├── scrape/
│   │   └── route.ts          # POST - scraping URL
│   └── cron/
│       └── route.ts          # POST - scheduled price check
│
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page (niezalogowani)
├── providers.tsx             # Context providers (Theme, Auth)
└── globals.css               # Globalne style
```

### 1.2 Komponenty UI (Material UI)

```
components/
├── ui/                       # Bazowe komponenty
│   ├── LoadingSpinner.tsx
│   ├── ErrorAlert.tsx
│   └── ConfirmDialog.tsx
│
├── layout/                   # Komponenty layoutu
│   ├── Navbar.tsx           # Górna nawigacja
│   ├── Sidebar.tsx          # Boczne menu (opcjonalne)
│   └── Footer.tsx
│
├── auth/                     # Komponenty autentykacji
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── AuthGuard.tsx        # HOC chroniący strony
│
├── dashboard/                # Komponenty dashboardu
│   ├── StatsCards.tsx       # Karty ze statystykami
│   ├── RecentChanges.tsx    # Lista ostatnich zmian
│   └── TrendCharts.tsx      # Mini wykresy trendów
│
├── products/                 # Komponenty produktów
│   ├── ProductCard.tsx      # Karta produktu
│   ├── ProductList.tsx      # Lista produktów (tabela)
│   ├── ProductForm.tsx      # Formularz dodawania
│   ├── PriceHistoryChart.tsx # Wykres historii cen
│   └── PriceBadge.tsx       # Badge ze zmianą ceny
│
└── search/                   # Komponenty wyszukiwania
    ├── SearchBar.tsx
    └── SearchResults.tsx
```

### 1.3 Hooks

```
hooks/
├── useAuth.ts               # Hook autentykacji
├── useProducts.ts           # CRUD produktów
├── useProduct.ts            # Pojedynczy produkt
├── usePriceHistory.ts       # Historia cen
└── useLocalStorage.ts       # Persystencja lokalna
```

### 1.4 Material UI Theme

```typescript
// theme/theme.ts
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',      // Niebieski
    },
    secondary: {
      main: '#f50057',      // Różowy/Magenta
    },
    success: {
      main: '#4caf50',      // Zielony (spadek ceny)
    },
    error: {
      main: '#f44336',      // Czerwony (wzrost ceny)
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
```

---

## 2. Backend Architecture

### 2.1 API Routes

#### `/api/products` - Zarządzanie produktami

```typescript
// GET /api/products
// Query params: ?userId=xxx&limit=50&sort=name
// Response: Product[]

// POST /api/products
// Body: { url: string, userId: string }
// Response: Product (nowo utworzony)
```

#### `/api/products/[id]` - Pojedynczy produkt

```typescript
// GET /api/products/[id]
// Response: Product z pełną historią cen

// PUT /api/products/[id]
// Body: { alertSettings?: AlertSettings }
// Response: Product (zaktualizowany)

// DELETE /api/products/[id]
// Response: { success: true }
```

#### `/api/scrape` - Scraping produktu

```typescript
// POST /api/scrape
// Body: { url: string }
// Response: ScrapedProduct { name, price, imageUrl, shopName }
```

#### `/api/cron` - Scheduled price check

```typescript
// POST /api/cron
// Headers: Authorization: Bearer CRON_SECRET
// Response: { updated: number, errors: number }
```

### 2.2 Struktura odpowiedzi API

```typescript
// Sukces
{
  success: true,
  data: T,
  meta?: {
    total: number,
    page: number,
    limit: number
  }
}

// Błąd
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

## 3. Scraper Architecture

### 3.1 Struktura scraperów

```
lib/
├── scrapers/
│   ├── index.ts             # Eksport i router scraperów
│   ├── base.ts              # Bazowa klasa/interfejs
│   ├── louis.ts             # Scraper dla Louis.eu
│   ├── xlmoto.ts            # Scraper dla XLMoto
│   ├── fcmoto.ts            # Scraper dla FC-Moto
│   └── motoblouz.ts         # Scraper dla Motoblouz
│
└── utils/
    ├── scraper-utils.ts     # Pomocnicze funkcje
    └── price-parser.ts      # Parsowanie cen
```

### 3.2 Interfejs scrapera

```typescript
interface ScraperResult {
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  available: boolean;
  originalUrl: string;
  shopName: string;
  scrapedAt: Date;
}

interface Scraper {
  shopName: string;
  supportedDomains: string[];
  scrape(url: string): Promise<ScraperResult>;
}
```

### 3.3 Mapowanie domen do scraperów

```typescript
const scraperRegistry: Record<string, Scraper> = {
  'louis.eu': louisScraper,
  'louis.pl': louisScraper,
  'xlmoto.pl': xlmotoScraper,
  'xlmoto.eu': xlmotoScraper,
  'fc-moto.de': fcmotoScraper,
  'fc-moto.pl': fcmotoScraper,
  'motoblouz.com': motoblouzScraper,
  'motoblouz.pl': motoblouzScraper,
};

function getScraperForUrl(url: string): Scraper | null {
  const domain = new URL(url).hostname.replace('www.', '');
  return scraperRegistry[domain] || null;
}
```

### 3.4 Przykład scrapera (Louis.eu)

```typescript
// lib/scrapers/louis.ts
import * as cheerio from 'cheerio';

export const louisScraper: Scraper = {
  shopName: 'Louis',
  supportedDomains: ['louis.eu', 'louis.pl', 'louis.de'],
  
  async scrape(url: string): Promise<ScraperResult> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BikersHelper/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const name = $('h1.product-title').text().trim();
    const priceText = $('.price-current').text().trim();
    const price = parsePrice(priceText);
    const imageUrl = $('img.product-image').attr('src');
    const available = !$('.out-of-stock').length;
    
    return {
      name,
      price,
      currency: 'PLN',
      imageUrl,
      available,
      originalUrl: url,
      shopName: 'Louis',
      scrapedAt: new Date(),
    };
  },
};
```

---

## 4. Firebase / Database Architecture

### 4.1 Struktura Firestore

```
firestore/
│
├── users/                           # Kolekcja użytkowników
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── photoURL?: string
│       ├── preferences: {
│       │     emailNotifications: boolean
│       │     theme: 'light' | 'dark' | 'system'
│       │     checkFrequency: 'hourly' | 'daily' | 'weekly'
│       │   }
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── products/                        # Kolekcja produktów
│   └── {productId}/
│       ├── userId: string           # Właściciel (indeks)
│       ├── url: string
│       ├── name: string
│       ├── imageUrl?: string
│       ├── currentPrice: number
│       ├── previousPrice?: number
│       ├── lowestPrice: number
│       ├── highestPrice: number
│       ├── currency: string
│       ├── shopName: string
│       ├── available: boolean
│       ├── category?: string
│       ├── alertSettings: {
│       │     enabled: boolean
│       │     targetPrice?: number
│       │     notifyOnAnyChange: boolean
│       │     notifyOnDrop: boolean
│       │     dropPercentage?: number
│       │   }
│       ├── lastChecked: Timestamp
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
└── priceHistory/                    # Kolekcja historii cen
    └── {historyId}/
        ├── productId: string        # Referencja (indeks)
        ├── price: number
        ├── available: boolean
        └── timestamp: Timestamp
```

### 4.2 Indeksy Firestore

```
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "shopName", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "priceHistory",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "productId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 4.3 Reguły bezpieczeństwa Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users - tylko własne dane
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - tylko własne produkty
    match /products/{productId} {
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Price History - tylko dla własnych produktów
    match /priceHistory/{historyId} {
      allow read: if request.auth != null && 
                    exists(/databases/$(database)/documents/products/$(resource.data.productId)) &&
                    get(/databases/$(database)/documents/products/$(resource.data.productId)).data.userId == request.auth.uid;
      // Zapis tylko przez backend (Cloud Functions)
      allow write: if false;
    }
  }
}
```

---

## 5. Data Flow

### 5.1 Dodawanie produktu

```
┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User   │───►│  SearchPage  │───►│ POST /scrape │───►│   Scraper    │
│         │    │  (wkleja URL)│    │              │    │              │
└─────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘
                                                               │
                     ┌─────────────────────────────────────────┘
                     ▼
              ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
              │  Scraped     │───►│POST /products│───►│  Firestore   │
              │  Data        │    │              │    │  (save)      │
              └──────────────┘    └──────────────┘    └──────────────┘
```

### 5.2 Aktualizacja cen (CRON)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Scheduler   │───►│ POST /cron   │───►│  Firestore   │
│  (zewn.)     │    │              │    │ (get prods)  │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
          ┌────────────────────────────────────┘
          ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  For each    │───►│   Scraper    │───►│  Compare &   │
   │  product     │    │              │    │  Update      │
   └──────────────┘    └──────────────┘    └──────┬───────┘
                                                  │
                     ┌────────────────────────────┘
                     ▼
              ┌──────────────┐    ┌──────────────┐
              │  Firestore   │───►│  Send alerts │
              │  (save hist) │    │  (if needed) │
              └──────────────┘    └──────────────┘
```

---

## 6. Error Handling

### 6.1 Kody błędów

| Kod | Nazwa | Opis |
|-----|-------|------|
| `AUTH_REQUIRED` | Wymagana autentykacja | Użytkownik nie zalogowany |
| `AUTH_INVALID` | Nieprawidłowe dane | Błędny login/hasło |
| `PRODUCT_NOT_FOUND` | Produkt nie znaleziony | Brak produktu o podanym ID |
| `SCRAPER_NOT_FOUND` | Nieobsługiwany sklep | Brak scrapera dla domeny |
| `SCRAPER_FAILED` | Błąd scrapingu | Nie udało się pobrać danych |
| `VALIDATION_ERROR` | Błąd walidacji | Nieprawidłowe dane wejściowe |
| `RATE_LIMIT` | Limit przekroczony | Za dużo requestów |

### 6.2 Retry Logic (Scraper)

```typescript
async function scrapeWithRetry(url: string, maxRetries = 3): Promise<ScrapedResult> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await scraper.scrape(url);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(attempt * 1000); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}
```

---

## 7. Kluczowe decyzje techniczne

| Decyzja | Wybór | Uzasadnienie |
|---------|-------|--------------|
| Routing | App Router | Nowszy standard Next.js, Server Components |
| State Management | React Query + Context | Cachowanie, server state |
| Forms | React Hook Form + Zod | Wydajność, walidacja typów |
| Charts | Recharts | Dobre wsparcie dla React, customizacja |
| Scraping | Cheerio | Lekki, szybki dla statycznego HTML |
| Cron | External service | Brak hostingu = zewnętrzny trigger |

---

## 8. Przyszłe rozszerzenia

1. **Puppeteer dla dynamicznych stron** - gdy Cheerio nie wystarczy
2. **Redis cache** - cache wyników scrapingu
3. **WebSocket** - real-time updates
4. **Chrome Extension** - szybkie dodawanie produktów
5. **Push Notifications** - Firebase Cloud Messaging
6. **Email Notifications** - SendGrid/Resend

---

*Dokument przygotowany: 31 stycznia 2026*
*Wersja: 1.0*
