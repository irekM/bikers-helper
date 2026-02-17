# Dashboard - Plan i Dokumentacja Wymagań Projektowych

## 📋 Spis treści

1. [Przegląd projektu](#1-przegląd-projektu)
2. [Architektura widoków](#2-architektura-widoków)
3. [Szczegółowa specyfikacja komponentów](#3-szczegółowa-specyfikacja-komponentów)
4. [Sposób prezentacji danych](#4-sposób-prezentacji-danych)
5. [Biblioteki do wykresów - analiza](#5-biblioteki-do-wykresów---analiza)
6. [Plan wdrożenia](#6-plan-wdrożenia)
7. [Struktura plików](#7-struktura-plików)

---

## 1. Przegląd projektu

### 1.1 Cel aplikacji
Aplikacja webscrapera do porównywania cen produktów motocyklowych. Dashboard umożliwia użytkownikowi:
- Wyszukiwanie produktów z różnych sklepów motocyklowych
- Śledzenie historii cen w czasie
- Porównywanie cen między sklepami
- Otrzymywanie alertów o spadkach cen

### 1.2 Stack technologiczny
- **Frontend:** Next.js 16+ (App Router)
- **UI Framework:** Material UI (MUI) v7
- **Backend/Database:** Firebase (Firestore)
- **Wykresy:** Recharts (rekomendacja - patrz sekcja 5)
- **State Management:** React Context + Hooks

---

## 2. Architektura widoków

### 2.1 Hierarchia nawigacji

```
Dashboard (/)
├── Navbar (góra)
│   └── Logo | Wyszukiwarka | Profil użytkownika
│
├── Breadcrumbs - Kategorie (pod navbar)
│   └── Wszystkie > Kaski > Kaski integralne
│
├── Panel filtrów (pod breadcrumbs)
│   └── DatePicker | Sortowanie | Filtry dodatkowe
│
└── Główny obszar roboczy
    ├── Lista produktów (widok domyślny)
    └── Szczegóły produktu (po wyborze)
        ├── Karta produktu (lewa strona)
        └── Analiza cenowa (prawa strona)
            ├── Wykres cen
            └── Statystyki min/max
```

### 2.2 Mapa widoków (routes)

| Route | Opis | Komponenty |
|-------|------|------------|
| `/` | Dashboard główny | StatsCards, ProductList |
| `/search` | Wyszukiwanie produktów | SearchBar, ProductGrid |
| `/product/[id]` | Szczegóły produktu | ProductCard, PriceChart, PriceStats |
| `/favorites` | Ulubione produkty | ProductList (filtered) |
| `/settings` | Ustawienia użytkownika | SettingsForm |

---

## 3. Szczegółowa specyfikacja komponentów

### 3.1 Breadcrumbs - Kategorie produktów

**Lokalizacja:** Pod głównym navbar, nad filtrem czasu

**Kategorie:**
```typescript
const CATEGORIES = [
  { id: 'helmets', label: 'Kaski', icon: 'helmet' },
  { id: 'jackets', label: 'Kurtki', icon: 'jacket' },
  { id: 'pants', label: 'Spodnie', icon: 'pants' },
  { id: 'gloves', label: 'Rękawice', icon: 'gloves' },
  { id: 'boots', label: 'Buty', icon: 'boots' },
  { id: 'accessories', label: 'Akcesoria', icon: 'accessories' },
  { id: 'parts', label: 'Części', icon: 'parts' },
] as const;
```

**Funkcjonalność:**
- Kliknięcie kategorii filtruje listę produktów
- Breadcrumbs pokazują ścieżkę nawigacji (np. "Wszystkie > Kaski > Kaski integralne")
- Podkategorie ładowane dynamicznie

**Komponent MUI:** `<Breadcrumbs>` + `<Chip>` dla kategorii

**Przykład implementacji:**
```tsx
<Box sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
  <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
    <Link href="/">Wszystkie</Link>
    <Link href="/category/helmets">Kaski</Link>
    <Typography color="text.primary">Kaski integralne</Typography>
  </Breadcrumbs>
  
  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
    {CATEGORIES.map(cat => (
      <Chip 
        key={cat.id}
        label={cat.label}
        onClick={() => handleCategoryClick(cat.id)}
        variant={selected === cat.id ? 'filled' : 'outlined'}
      />
    ))}
  </Stack>
</Box>
```

---

### 3.2 Filtr zakresu czasu (DatePicker)

**Lokalizacja:** Pod breadcrumbs, obok paska wyszukiwania

**Predefiniowane zakresy:**
| Wartość | Label | Opis |
|---------|-------|------|
| `7d` | 7 dni | Ostatni tydzień |
| `30d` | 30 dni | Ostatni miesiąc |
| `6m` | 6 miesięcy | Ostatnie pół roku |
| `1y` | 1 rok | Ostatni rok |
| `all` | Cały czas | Wszystkie dane |
| `custom` | Własny | DatePicker range |

**Stan (priorytet: DO ZROBIENIA PÓŹNIEJ):**
- Faza 1: Przyciski z predefiniowanymi zakresami (ToggleButtonGroup)
- Faza 2: Pełny DateRangePicker dla własnego zakresu

**Biblioteka:** `@mui/x-date-pickers` (już w projekcie)

**Przykład implementacji:**
```tsx
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
  <ToggleButtonGroup
    value={timeRange}
    exclusive
    onChange={handleTimeRangeChange}
    size="small"
  >
    <ToggleButton value="7d">7 dni</ToggleButton>
    <ToggleButton value="30d">30 dni</ToggleButton>
    <ToggleButton value="6m">6 mies.</ToggleButton>
    <ToggleButton value="1y">Rok</ToggleButton>
    <ToggleButton value="all">Wszystko</ToggleButton>
  </ToggleButtonGroup>
  
  {/* Faza 2 - własny zakres */}
  <DateRangePicker
    value={customRange}
    onChange={setCustomRange}
    disabled={timeRange !== 'custom'}
  />
</Box>
```

---

### 3.3 Główny widok produktu (Layout dwukolumnowy)

**Struktura layoutu:**

```
┌─────────────────────────────────────────────────────────┐
│                    BREADCRUMBS                          │
├─────────────────────────────────────────────────────────┤
│                    TIME FILTER                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐   ┌─────────────────────────────┐ │
│  │                 │   │                             │ │
│  │  PRODUCT CARD   │   │      PRICE CHART            │ │
│  │                 │   │                             │ │
│  │  - Zdjęcie      │   │   [Wykres liniowy cen]      │ │
│  │  - Nazwa        │   │                             │ │
│  │  - Cena obecna  │   ├─────────────────────────────┤ │
│  │  - Sklep        │   │      PRICE STATS            │ │
│  │  - Link         │   │                             │ │
│  │  - Dostępność   │   │  📈 Max: 599 PLN (12.01)    │ │
│  │                 │   │  📉 Min: 399 PLN (15.03)    │ │
│  │  [Dodaj alert]  │   │  📊 Średnia: 489 PLN        │ │
│  │  [Ulubione ❤]   │   │  📅 Śledzone od: 01.01     │ │
│  │                 │   │                             │ │
│  └─────────────────┘   └─────────────────────────────┘ │
│        35%                        65%                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Proporcje:** 
- Karta produktu: `xs={12} md={4}` (35%)
- Sekcja analizy: `xs={12} md={8}` (65%)

---

### 3.4 Karta produktu (ProductDetailCard)

**Dane do wyświetlenia:**

```typescript
interface ProductDetailCardProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    currentPrice: number;
    previousPrice: number | null;
    currency: string;
    shopName: string;
    shopLogo?: string;
    url: string;
    available: boolean;
    lastChecked: Date;
    category?: string;
  };
  onAddAlert: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}
```

**Elementy karty:**
1. **Zdjęcie produktu** - `CardMedia` z fallback placeholder
2. **Nazwa produktu** - `Typography variant="h5"`
3. **Cena aktualna** - duża, wyróżniona
4. **Zmiana ceny** - badge (zielony spadek / czerwony wzrost)
5. **Nazwa sklepu** - z logo jeśli dostępne
6. **Dostępność** - Chip (Dostępny / Niedostępny)
7. **Link do sklepu** - Button "Przejdź do sklepu"
8. **Ostatnia aktualizacja** - drobny tekst
9. **Akcje:**
   - Przycisk "Ustaw alert cenowy"
   - Ikona serca (ulubione)

---

### 3.5 Wykres cen (PriceChart)

**Typ wykresu:** Wykres liniowy (Line Chart) z obszarem (Area)

**Dane wejściowe:**
```typescript
interface PriceChartProps {
  data: {
    date: Date;
    price: number;
    available: boolean;
  }[];
  currency: string;
  timeRange: TimeRange;
  lowestPrice: number;
  highestPrice: number;
}
```

**Funkcjonalności wykresu:**
1. **Linia ceny** - główna linia pokazująca trend
2. **Obszar pod linią** - gradient dla lepszej wizualizacji
3. **Tooltip** - szczegóły po najechaniu (data, cena, dostępność)
4. **Punkty** - zaznaczone punkty danych
5. **Linie referencyjne:**
   - Linia min (zielona, przerywana)
   - Linia max (czerwona, przerywana)
6. **Oś X** - daty (formatowane według zakresu)
7. **Oś Y** - ceny (z walutą)
8. **Responsywność** - dostosowanie do szerokości kontenera

**Dodatkowe oznaczenia:**
- Punkty gdzie produkt był niedostępny (szare/puste)
- Adnotacje dla min/max

---

### 3.6 Statystyki cenowe (PriceStats)

**Dane do wyświetlenia:**

| Metryka | Ikona | Opis |
|---------|-------|------|
| Cena maksymalna | 📈 TrendingUp | Najwyższa cena + data |
| Cena minimalna | 📉 TrendingDown | Najniższa cena + data |
| Cena średnia | 📊 BarChart | Średnia arytmetyczna |
| Zmiana % | 🔄 Autorenew | Zmiana względem pierwszej ceny |
| Śledzone od | 📅 CalendarToday | Data pierwszego scrape |
| Liczba zmian | 🔢 Numbers | Ile razy cena się zmieniła |

**Layout:** Grid 2x3 lub lista pionowa

```tsx
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Statystyki cenowe
    </Typography>
    
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <StatItem 
          icon={<TrendingDownIcon color="success" />}
          label="Najniższa cena"
          value={`${lowestPrice} ${currency}`}
          subtitle={`dnia ${formatDate(lowestPriceDate)}`}
        />
      </Grid>
      <Grid item xs={6}>
        <StatItem 
          icon={<TrendingUpIcon color="error" />}
          label="Najwyższa cena"
          value={`${highestPrice} ${currency}`}
          subtitle={`dnia ${formatDate(highestPriceDate)}`}
        />
      </Grid>
      {/* ... pozostałe statystyki */}
    </Grid>
  </CardContent>
</Card>
```

---

## 4. Sposób prezentacji danych

### 4.1 Rekomendacje wyświetlania

| Typ danych | Metoda prezentacji | Uzasadnienie |
|------------|-------------------|--------------|
| **Historia cen** | Wykres liniowy (Area Chart) | Najlepszy do pokazania trendów w czasie |
| **Lista produktów** | Karty w Grid | Wizualnie atrakcyjne, pokazuje zdjęcia |
| **Porównanie sklepów** | Tabela | Łatwe porównanie cen obok siebie |
| **Statystyki** | Karty z ikonami | Szybki wgląd w kluczowe metryki |
| **Kategorie** | Chips/Breadcrumbs | Intuicyjna nawigacja |
| **Alerty** | Lista z badge'ami | Priorytetyzacja informacji |

### 4.2 Kolorystyka dla danych cenowych

```typescript
const PRICE_COLORS = {
  increase: '#f44336',    // Czerwony - wzrost ceny (negatywny)
  decrease: '#4caf50',    // Zielony - spadek ceny (pozytywny)
  unchanged: '#9e9e9e',   // Szary - bez zmian
  unavailable: '#ff9800', // Pomarańczowy - niedostępny
  chart: {
    line: '#1976d2',      // Niebieski - linia główna
    area: 'rgba(25, 118, 210, 0.1)', // Niebieski przezroczysty
    min: '#4caf50',       // Zielony - linia minimum
    max: '#f44336',       // Czerwony - linia maximum
  }
};
```

---

## 5. Biblioteki do wykresów - analiza

### 5.1 Porównanie bibliotek

| Biblioteka | Popularność | Rozmiar | MUI kompatybilność | Trudność | Rekomendacja |
|------------|-------------|---------|-------------------|----------|--------------|
| **Recharts** ⭐ | 24k+ GitHub stars | ~45KB | ✅ Świetna | Łatwa | **REKOMENDOWANA** |
| Chart.js | 65k+ GitHub stars | ~65KB | ⚠️ Wymaga wrappera | Średnia | Dobra alternatywa |
| Nivo | 13k+ GitHub stars | ~80KB | ✅ Dobra | Średnia | Piękne wizualizacje |
| Victory | 11k+ GitHub stars | ~50KB | ✅ Dobra | Średnia | Solidna opcja |
| ApexCharts | 14k+ GitHub stars | ~90KB | ✅ Dobra | Łatwa | Dużo typów wykresów |
| Tremor | 16k+ GitHub stars | ~100KB | ⚠️ Tailwind-first | Łatwa | Dla Tailwind projektów |

### 5.2 Rekomendacja: Recharts

**Dlaczego Recharts?**

1. **Natywny React** - komponenty jako JSX, łatwa integracja
2. **Deklaratywny API** - intuicyjny kod
3. **Lekki** - mały bundle size
4. **Responsywny** - wbudowany `ResponsiveContainer`
5. **Customizacja** - łatwe stylowanie zgodne z MUI
6. **Dokumentacja** - świetna, dużo przykładów
7. **Aktywny rozwój** - regularne aktualizacje

**Instalacja:**
```bash
npm install recharts
```

**Przykład użycia z MUI:**
```tsx
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Area 
} from 'recharts';
import { useTheme } from '@mui/material';

function PriceChart({ data, lowestPrice, highestPrice }) {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => format(date, 'dd.MM')}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${value} PLN`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <ReferenceLine 
          y={lowestPrice} 
          stroke={theme.palette.success.main} 
          strokeDasharray="5 5"
          label="Min"
        />
        <ReferenceLine 
          y={highestPrice} 
          stroke={theme.palette.error.main} 
          strokeDasharray="5 5"
          label="Max"
        />
        <Area 
          type="monotone" 
          dataKey="price" 
          fill={theme.palette.primary.light}
          fillOpacity={0.1}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ fill: theme.palette.primary.main }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 5.3 Alternatywa: Chart.js + react-chartjs-2

**Kiedy wybrać Chart.js:**
- Potrzebujesz więcej typów wykresów (radar, polar, bubble)
- Zespół ma doświadczenie z Chart.js
- Chcesz animacje out-of-the-box

**Instalacja:**
```bash
npm install chart.js react-chartjs-2
```

---

## 6. Plan wdrożenia

### Faza 1: Podstawowa struktura (Sprint 1)
**Czas: 1-2 tygodnie**

| Zadanie | Priorytet | Estymacja | Zależności |
|---------|-----------|-----------|------------|
| 1.1 Instalacja Recharts | 🔴 Wysoki | 0.5h | - |
| 1.2 Komponent CategoryBreadcrumbs | 🔴 Wysoki | 2h | - |
| 1.3 Komponent TimeRangeFilter (przyciski) | 🟡 Średni | 2h | - |
| 1.4 Layout strony produktu (2 kolumny) | 🔴 Wysoki | 3h | - |
| 1.5 Aktualizacja ProductCard dla widoku szczegółów | 🔴 Wysoki | 3h | 1.4 |

**Deliverables:**
- [ ] Nawigacja breadcrumbs działa
- [ ] Filtry czasowe (przyciski) działają
- [ ] Strona produktu ma layout 2-kolumnowy

---

### Faza 2: Wykres cenowy (Sprint 2)
**Czas: 1-2 tygodnie**

| Zadanie | Priorytet | Estymacja | Zależności |
|---------|-----------|-----------|------------|
| 2.1 Komponent PriceChart (podstawowy) | 🔴 Wysoki | 4h | 1.1 |
| 2.2 Tooltip customowy | 🟡 Średni | 2h | 2.1 |
| 2.3 Linie referencyjne min/max | 🟡 Średni | 1h | 2.1 |
| 2.4 Responsywność wykresu | 🔴 Wysoki | 2h | 2.1 |
| 2.5 Hook usePriceHistory | 🔴 Wysoki | 3h | - |

**Deliverables:**
- [ ] Wykres wyświetla historię cen
- [ ] Tooltip pokazuje szczegóły
- [ ] Zaznaczone min/max na wykresie

---

### Faza 3: Statystyki i analiza (Sprint 3)
**Czas: 1 tydzień**

| Zadanie | Priorytet | Estymacja | Zależności |
|---------|-----------|-----------|------------|
| 3.1 Komponent PriceStats | 🔴 Wysoki | 3h | - |
| 3.2 Obliczanie statystyk (hook) | 🔴 Wysoki | 2h | - |
| 3.3 Formatowanie dat i cen | 🟡 Średni | 2h | - |
| 3.4 Animacje zmian | 🟢 Niski | 2h | 3.1 |

**Deliverables:**
- [ ] Statystyki min/max/avg wyświetlane
- [ ] Daty poprawnie formatowane
- [ ] UI responsywny

---

### Faza 4: DatePicker zaawansowany (Sprint 4)
**Czas: 1 tydzień**

| Zadanie | Priorytet | Estymacja | Zależności |
|---------|-----------|-----------|------------|
| 4.1 DateRangePicker komponent | 🟡 Średni | 3h | - |
| 4.2 Integracja z filtrowaniem | 🟡 Średni | 2h | 4.1 |
| 4.3 Persystencja wybranego zakresu | 🟢 Niski | 1h | 4.2 |
| 4.4 URL query params dla zakresu | 🟢 Niski | 2h | 4.2 |

**Deliverables:**
- [ ] Własny zakres dat działa
- [ ] Filtr wpływa na wykres i statystyki

---

### Faza 5: Porównywanie produktów (Sprint 5) - OPCJONALNE
**Czas: 2 tygodnie**

| Zadanie | Priorytet | Estymacja | Zależności |
|---------|-----------|-----------|------------|
| 5.1 Tabela porównawcza | 🟢 Niski | 4h | - |
| 5.2 Multi-select produktów | 🟢 Niski | 3h | - |
| 5.3 Wykres wielu produktów | 🟢 Niski | 4h | 2.1 |
| 5.4 Export do CSV/PDF | 🟢 Niski | 4h | 5.1 |

---

## 7. Struktura plików

### 7.1 Nowe komponenty do utworzenia

```
components/
├── charts/
│   ├── PriceChart.tsx          # Główny wykres cenowy
│   ├── PriceTooltip.tsx        # Customowy tooltip
│   └── ChartLegend.tsx         # Legenda wykresu
│
├── filters/
│   ├── TimeRangeFilter.tsx     # Filtry czasowe
│   ├── CategoryFilter.tsx      # Filtry kategorii
│   └── DateRangePicker.tsx     # Picker zakresu dat
│
├── navigation/
│   └── CategoryBreadcrumbs.tsx # Breadcrumbs kategorii
│
├── products/
│   ├── ProductDetailCard.tsx   # Rozszerzona karta produktu
│   ├── PriceStats.tsx          # Statystyki cenowe
│   └── PriceChangeIndicator.tsx # Badge zmiany ceny
│
└── layout/
    └── TwoColumnLayout.tsx     # Layout dla strony produktu
```

### 7.2 Nowe hooki

```
hooks/
├── usePriceHistory.ts          # Pobieranie historii cen
├── usePriceStats.ts            # Obliczanie statystyk
├── useTimeRange.ts             # Zarządzanie filtrem czasu
└── useCategories.ts            # Zarządzanie kategoriami
```

### 7.3 Nowe typy

```typescript
// types/index.ts - rozszerzenie

export type TimeRange = '7d' | '30d' | '6m' | '1y' | 'all' | 'custom';

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  price: number;
  available: boolean;
  timestamp: Date;
}

export interface PriceStats {
  lowestPrice: number;
  lowestPriceDate: Date;
  highestPrice: number;
  highestPriceDate: Date;
  averagePrice: number;
  priceChangePercent: number;
  totalChanges: number;
  trackedSince: Date;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  parentId?: string;
  children?: Category[];
}

export interface DateRange {
  start: Date;
  end: Date;
}
```

---

## 📎 Załączniki

### A. Mockup widoku produktu (ASCII)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  🏍️ Bikers Helper           [🔍 Szukaj...]              [👤 Profil]      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Wszystkie > Kaski > Kaski integralne                                     ║
║                                                                           ║
║  [Kaski] [Kurtki] [Rękawice] [Buty] [Spodnie] [Akcesoria]                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Zakres: [7d] [30d] [6m] [1r] [Wszystko]    📅 01.01.2026 - 16.02.2026   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌──────────────────────┐    ┌─────────────────────────────────────────┐ ║
║  │  [  📷 ZDJĘCIE   ]   │    │            📈 Historia cen              │ ║
║  │                      │    │                                         │ ║
║  │  Shoei X-SPR Pro     │    │    600 ┤    ╭─╮                         │ ║
║  │  Kask integralny     │    │        │   ╱   ╲    ╭──╮               │ ║
║  │                      │    │    500 ┤──╯     ╲──╯    ╲──────        │ ║
║  │  💰 2 499 PLN        │    │        │                               │ ║
║  │  ↓ -15% (było 2 939) │    │    400 ┤─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (min)     │ ║
║  │                      │    │        ┼────┬────┬────┬────┬────►      │ ║
║  │  🏪 FC-Moto          │    │        Sty  Lut  Mar  Kwi  Maj         │ ║
║  │  ✅ Dostępny         │    ├─────────────────────────────────────────┤ ║
║  │                      │    │  📊 Statystyki                         │ ║
║  │  [🔔 Ustaw alert]    │    │                                         │ ║
║  │  [❤️ Ulubione]       │    │  📉 Min: 2 299 PLN (15.03)             │ ║
║  │  [🔗 Idź do sklepu]  │    │  📈 Max: 2 939 PLN (01.01)             │ ║
║  │                      │    │  📊 Średnia: 2 567 PLN                 │ ║
║  │  Aktualizacja: 2h    │    │  📅 Śledzony od: 01.01.2026            │ ║
║  └──────────────────────┘    └─────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### B. User Flow

```
[Strona główna] 
     │
     ▼
[Wybór kategorii] ──────────────────┐
     │                              │
     ▼                              ▼
[Lista produktów] ◄──────── [Wyszukiwarka]
     │
     ▼
[Kliknięcie produktu]
     │
     ▼
[Strona szczegółów produktu]
     │
     ├──► [Ustaw alert] ──► [Modal alertu]
     │
     ├──► [Dodaj do ulubionych]
     │
     ├──► [Zmień zakres czasu] ──► [Aktualizacja wykresu]
     │
     └──► [Przejdź do sklepu] ──► [Zewnętrzna strona]
```

---

## ✅ Checklist gotowości do implementacji

- [ ] Zainstalowana biblioteka Recharts
- [ ] Zdefiniowane typy TypeScript
- [ ] Przygotowane mockowe dane do testów
- [ ] Skonfigurowane kolory w theme MUI
- [ ] Zdefiniowane breakpointy responsywności
- [ ] Przygotowane API endpoints dla historii cen

---

*Dokument utworzony: 16.02.2026*
*Wersja: 1.0*
*Autor: Zespół Bikers Helper*
