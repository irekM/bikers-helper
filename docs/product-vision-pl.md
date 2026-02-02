# Specyfikacja Produktu: MotoPrice Tracker

## 1. Przegląd Projektu

### 1.1 Nazwa Projektu
**Bikers helper** - System monitorowania i archiwizacji cen produktów motocyklowych

### 1.2 Cel Biznesowy
Stworzenie aplikacji webowej umożliwiającej użytkownikom śledzenie historii cen produktów dla motocyklistów ze sklepów internetowych. Aplikacja ma wspierać świadome decyzje zakupowe poprzez udostępnienie danych o bieżących oraz archiwalnych cenach wybranych produktów.

### 1.3 Problem Biznesowy
Motocykliści planujący zakup ubrań i akcesoriów motocyklowych nie mają łatwego dostępu do informacji o historycznych zmianach cen produktów. Uniemożliwia to:
- Ocenę, czy aktualna cena jest korzystna
- Identyfikację najlepszego momentu na zakup
- Weryfikację autentyczności promocji i wyprzedaży
- Świadome porównanie ofert w czasie

### 1.4 Rozwiązanie
Aplikacja webowa z systemem web scrapingu, która:
- Automatycznie zbiera dane o cenach produktów motocyklowych ze wskazanych sklepów internetowych
- Archiwizuje historię zmian cen
- Prezentuje dane w przystępnej formie graficznej
- Umożliwia wyszukiwanie i filtrowanie produktów

---

## 2. Grupa Docelowa

### 2.1 Główni Użytkownicy
- Motocykliści planujący zakup ubrań motocyklowych
- Osoby poszukujące najlepszych ofert cenowych
- Entuzjaści motocyklizmu zainteresowani monitorowaniem rynku

### 2.2 Potrzeby Użytkowników
- Szybki dostęp do historii cen konkretnego produktu
- Możliwość porównania cen w czasie
- Intuicyjne wyszukiwanie produktów po nazwie lub producencie
- Przejrzysta prezentacja danych

---

## 3. Zakres Funkcjonalny MVP (Minimum Viable Product)

### 3.1 Funkcje Podstawowe

#### F1: Wyszukiwanie Produktów
**Opis:** Użytkownik może wyszukać produkt poprzez wprowadzenie nazwy produktu lub nazwy firmy producenta w polu wyszukiwania.

**Kryteria Akceptacji:**
- System umożliwia wprowadzenie frazy wyszukiwania w nawigacji
- Wyszukiwanie działa w czasie rzeczywistym (live search) lub po zatwierdzeniu
- Wyniki są filtrowane na podstawie nazwy produktu i nazwy producenta
- Brak wyników skutkuje wyświetleniem odpowiedniego komunikatu

#### F2: Wyświetlanie Karty Produktu
**Opis:** Po wyszukaniu lub wybraniu produktu, system wyświetla szczegółową kartę produktu zawierającą podstawowe informacje.

**Kryteria Akceptacji:**
- Karta zawiera nazwę produktu
- Karta zawiera nazwę producenta
- Karta zawiera aktualną cenę produktu
- Karta zawiera link do produktu w sklepie źródłowym
- Karta zawiera zdjęcie produktu (jeśli dostępne)

#### F3: Archiwum Cen
**Opis:** Dla każdego produktu system prezentuje historię zmian cen w wybranym okresie czasu.

**Kryteria Akceptacji:**
- Historia cen wyświetlana jest w formie listy lub wykresu
- Każda zmiana ceny zawiera datę i wartość
- Użytkownik może wybrać okres czasu do wyświetlenia (np. ostatni tydzień, miesiąc, rok)
- System pokazuje najniższą i najwyższą cenę w wybranym okresie
- System pokazuje średnią cenę w wybranym okresie

#### F4: System Web Scrapingu (Backend)
**Opis:** Automatyczny system zbierający dane o produktach i cenach ze sklepów internetowych.

**Kryteria Akceptacji:**
- System automatycznie zbiera dane ze wskazanych sklepów
- Dane są zapisywane z timestampem
- System wykrywa zmiany cen
- Scraping odbywa się w regularnych interwałach czasowych

---

## 4. Specyfikacja Głównego Widoku

### 4.1 Nazwa Widoku
**Product Search & Details View** (Widok Wyszukiwania i Szczegółów Produktu)

### 4.2 Cel Widoku
Umożliwienie użytkownikowi wyszukania produktu i natychmiastowego dostępu do jego aktualnych informacji oraz historii cen.

### 4.3 Komponenty UI

#### 4.3.1 Navbar (Nawigacja Górna)
**Pozycja:** Górna część aplikacji, fixed/sticky

**Elementy:**
- Logo aplikacji (po lewej stronie)
- Search Bar (centralnie lub po prawej stronie)
  - Pole tekstowe do wprowadzenia nazwy produktu/producenta
  - Ikona lupy/wyszukiwania
  - Placeholder: "Wyszukaj produkt lub producenta..."
- Opcjonalnie: Menu użytkownika/ustawienia

**Funkcjonalność:**
- Search bar działa jako główny punkt interakcji
- Po wprowadzeniu frazy uruchamia filtrowanie/wyszukiwanie
- Navbar pozostaje widoczny podczas scrollowania

#### 4.3.2 Main Content Area (Główna Przestrzeń Treści)
**Pozycja:** Poniżej navbara

**Elementy:**

##### Karta Produktu
Wyświetlana po wybraniu/wyszukaniu produktu

**Sekcje karty:**

1. **Header Karty Produktu**
   - Zdjęcie produktu (miniatura)
   - Nazwa produktu (h1)
   - Nazwa producenta (subtitle)
   - Aktualna cena (duży, wyróżniony tekst)
   - Link do sklepu ("Zobacz w sklepie" - przycisk/link)

2. **Sekcja Archiwum Cen**
   - Tytuł sekcji: "Historia cen"
   - Selektor okresu czasu (dropdown lub przyciski):
     - Ostatnie 7 dni
     - Ostatnie 30 dni
     - Ostatnie 3 miesiące
     - Cała historia
   
   - **Wykres cen** (wizualizacja)
     - Oś X: czas
     - Oś Y: cena w PLN
     - Linia pokazująca zmiany cen
   
   - **Statystyki**
     - Najniższa cena w okresie
     - Najwyższa cena w okresie
     - Średnia cena
     - Obecny trend (spadek/wzrost)
   
   - **Lista zmian cen** (tabela/timeline)
     - Data zmiany
     - Nowa cena
     - Zmiana % (jeśli dotyczy)

### 4.4 Layout i Responsywność

**Desktop (>1024px):**
- Navbar full width na górze
- Karta produktu centrowana, max-width ~1200px
- Wykres cen w całej szerokości karty
- Lista zmian cen w dwóch kolumnach

**Tablet (768px - 1024px):**
- Navbar full width
- Karta produktu z paddingiem
- Wykres cen full width
- Lista zmian cen w jednej kolumnie

**Mobile (<768px):**
- Navbar z możliwością zwinięcia menu
- Search bar full width
- Karta produktu stack layout (elementy jeden pod drugim)
- Wykres cen z uproszczoną legendą
- Lista zmian cen w formie listy pionowej

### 4.5 Stany Widoku

#### Stan Początkowy (Empty State)
- Navbar z search bar
- Main area z komunikatem powitalnym
- Sugestia: "Wpisz nazwę produktu lub producenta aby rozpocząć"
- Opcjonalnie: Popularne/ostatnio przeglądane produkty

#### Stan Wyszukiwania
- Navbar z wypełnionym search bar
- Loading indicator podczas wyszukiwania
- Lista wyników wyszukiwania (jeśli wiele produktów pasuje)

#### Stan Wyświetlania Produktu
- Navbar z możliwością edycji wyszukiwania
- Pełna karta produktu z wszystkimi danymi
- Archiwum cen z wykresem i tabelą

#### Stan Błędu
- Komunikat "Nie znaleziono produktu"
- Sugestie alternatywnych fraz wyszukiwania
- Opcja powrotu do wyszukiwania

---

## 5. Technologia i Stack

### 5.1 Frontend
- **Framework:** Next.js (React)
- **UI Library:** Material-UI (MUI)
- **Wykresy:** Recharts lub Chart.js
- **Styling:** MUI Theme + styled-components/emotion

### 5.2 Backend
- **API:** Next.js API Routes
- **Web Scraping:** Puppeteer lub Cheerio
- **Database:** Firebase (do archiwizacji cen)
- **Scheduling:** Node-cron (do automatycznego scrapingu)

---

## 6. Wymagania Niefunkcjonalne

### 6.1 Wydajność
- Czas ładowania strony głównej: <2s
- Czas wyszukiwania produktu: <1s
- Wykres cen renderuje się płynnie bez lagów

### 6.2 Dostępność
- Aplikacja zgodna z WCAG 2.1 (Level AA)
- Obsługa nawigacji klawiaturą
- Odpowiednie kontrasty kolorów

### 6.3 SEO
- Server-side rendering dla lepszego SEO
- Meta tagi dla każdego produktu
- Sitemap.xml

### 6.4 Bezpieczeństwo
- Ochrona przed SQL injection
- Rate limiting dla API
- Zabezpieczenie przed web scraping abuse

---

## 7. Metryki Sukcesu

### 7.1 KPI (Key Performance Indicators)
- Liczba wyszukiwanych produktów dziennie
- Średni czas spędzony na karcie produktu
- Wskaźnik powrotów użytkowników (retention rate)
- Liczba kliknięć w linki do sklepów

### 7.2 Cele Biznesowe
- **Miesiąc 1:** 100 użytkowników aktywnych tygodniowo
- **Miesiąc 3:** 500 produktów w bazie danych
- **Miesiąc 6:** 1000 użytkowników aktywnych miesięcznie

---

## 8. Roadmapa Rozwoju

### Faza 1: MVP (4-6 tygodni)
- ✅ Setup projektu Next.js + MUI
- ✅ Implementacja navbara z search bar
- ✅ Implementacja karty produktu
- ✅ Podstawowy web scraper dla 1-2 sklepów
- ✅ Archiwum cen z prostą wizualizacją
- ✅ Deploy MVP

### Faza 2: Rozszerzenie (6-8 tygodni)
- 📊 Dodanie zaawansowanych wykresów
- 🔔 System notyfikacji o obniżkach cen
- 💾 Panel użytkownika z ulubionymi produktami
- 🏪 Rozszerzenie o więcej sklepów
- 📱 Optymalizacja mobile

### Faza 3: Skalowanie (ongoing)
- 🤖 Machine learning do predykcji cen
- 🔗 Integracja z API sklepów (jeśli dostępne)
- 📈 Dashboard z trendami rynkowymi
- 👥 Social features (dzielenie się produktami)

---

## 9. Ryzyka i Mitygacja

### 9.1 Ryzyko: Blokada przez sklepy internetowe
**Prawdopodobieństwo:** Wysokie  
**Wpływ:** Krytyczny  
**Mitygacja:**
- Implementacja rate limiting
- Rotacja IP / użycie proxy
- User-agent rotation
- Rozważenie oficjalnych API

### 9.2 Ryzyko: Zmiany struktury HTML sklepów
**Prawdopodobieństwo:** Średnie  
**Wpływ:** Wysoki  
**Mitygacja:**
- Modułowa architektura scraperów
- Automatyczne testy scrapingu
- Monitoring błędów scrapingu
- Szybka reakcja na zmiany

### 9.3 Ryzyko: Koszty infrastruktury
**Prawdopodobieństwo:** Średnie  
**Wpływ:** Średni  
**Mitygacja:**
- Optymalizacja częstotliwości scrapingu
- Cachowanie danych
- Wybór ekonomicznego hostingu
- Monitoring kosztów

---

## 10. Załączniki

### 10.1 Referencje UI/UX
- CamelCamelCamel (Amazon price tracker)
- Keepa (Amazon price history)
- Ceneo (polski agregator cen)

### 10.2 Przykładowe Sklepy do Scrapingu
- RRmoto

