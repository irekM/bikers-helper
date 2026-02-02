# Product Specification: MotoPrice Tracker

## 1. Project Overview

### 1.1 Project Name
**Bikers helper** - Motorcycle Product Price Monitoring and Archiving System

### 1.2 Business Objective
Create a web application that enables users to track price history of motorcycle products from online stores. The application aims to support informed purchasing decisions by providing access to current and historical price data for selected products.

### 1.3 Business Problem
Motorcyclists planning to purchase motorcycle clothing and accessories lack easy access to historical price change information. This prevents them from:
- Assessing whether the current price is favorable
- Identifying the best time to make a purchase
- Verifying the authenticity of promotions and sales
- Making informed offer comparisons over time

### 1.4 Solution
A web application with a web scraping system that:
- Automatically collects price data for motorcycle products from specified online stores
- Archives price change history
- Presents data in an accessible graphical format
- Enables product search and filtering

---

## 2. Target Audience

### 2.1 Primary Users
- Motorcyclists planning to purchase motorcycle clothing
- People seeking the best price deals
- Motorcycle enthusiasts interested in market monitoring

### 2.2 User Needs
- Quick access to specific product price history
- Ability to compare prices over time
- Intuitive product search by name or manufacturer
- Clear data presentation

---

## 3. MVP Functional Scope (Minimum Viable Product)

### 3.1 Core Features

#### F1: Product Search
**Description:** User can search for a product by entering the product name or manufacturer name in the search field.

**Acceptance Criteria:**
- System allows entering a search phrase in the navigation
- Search works in real-time (live search) or upon confirmation
- Results are filtered based on product name and manufacturer name
- No results triggers display of an appropriate message

#### F2: Product Card Display
**Description:** After searching or selecting a product, the system displays a detailed product card containing basic information.

**Acceptance Criteria:**
- Card contains product name
- Card contains manufacturer name
- Card contains current product price
- Card contains link to product in source store
- Card contains product image (if available)

#### F3: Price Archive
**Description:** For each product, the system presents price change history within a selected time period.

**Acceptance Criteria:**
- Price history is displayed as a list or chart
- Each price change includes date and value
- User can select time period to display (e.g., last week, month, year)
- System shows lowest and highest price in selected period
- System shows average price in selected period

#### F4: Web Scraping System (Backend)
**Description:** Automated system collecting product and price data from online stores.

**Acceptance Criteria:**
- System automatically collects data from specified stores
- Data is saved with timestamp
- System detects price changes
- Scraping occurs at regular time intervals

---

## 4. Main View Specification

### 4.1 View Name
**Product Search & Details View**

### 4.2 View Purpose
Enable user to search for a product and immediately access its current information and price history.

### 4.3 UI Components

#### 4.3.1 Navbar (Top Navigation)
**Position:** Top of application, fixed/sticky

**Elements:**
- Application logo (left side)
- Search Bar (center or right side)
  - Text field for entering product/manufacturer name
  - Search/magnifying glass icon
  - Placeholder: "Search for product or manufacturer..."
- Optional: User menu/settings

**Functionality:**
- Search bar serves as main interaction point
- After entering phrase, triggers filtering/search
- Navbar remains visible during scrolling

#### 4.3.2 Main Content Area
**Position:** Below navbar

**Elements:**

##### Product Card
Displayed after selecting/searching for product

**Card sections:**

1. **Product Card Header**
   - Product image (thumbnail)
   - Product name (h1)
   - Manufacturer name (subtitle)
   - Current price (large, highlighted text)
   - Store link ("View in store" - button/link)

2. **Price Archive Section**
   - Section title: "Price History"
   - Time period selector (dropdown or buttons):
     - Last 7 days
     - Last 30 days
     - Last 3 months
     - Full history
   
   - **Price Chart** (visualization)
     - X axis: time
     - Y axis: price in PLN/EUR/USD
     - Line showing price changes
   
   - **Statistics**
     - Lowest price in period
     - Highest price in period
     - Average price
     - Current trend (decrease/increase)
   
   - **Price Changes List** (table/timeline)
     - Change date
     - New price
     - Change % (if applicable)

### 4.4 Layout and Responsiveness

**Desktop (>1024px):**
- Full width navbar at top
- Centered product card, max-width ~1200px
- Price chart in full card width
- Price changes list in two columns

**Tablet (768px - 1024px):**
- Full width navbar
- Product card with padding
- Full width price chart
- Price changes list in single column

**Mobile (<768px):**
- Navbar with collapsible menu option
- Full width search bar
- Product card stack layout (elements stacked)
- Price chart with simplified legend
- Price changes list in vertical list format

### 4.5 View States

#### Initial State (Empty State)
- Navbar with search bar
- Main area with welcome message
- Suggestion: "Enter product or manufacturer name to begin"
- Optional: Popular/recently viewed products

#### Search State
- Navbar with filled search bar
- Loading indicator during search
- Search results list (if multiple products match)

#### Product Display State
- Navbar with ability to edit search
- Full product card with all data
- Price archive with chart and table

#### Error State
- "Product not found" message
- Alternative search phrase suggestions
- Option to return to search

---

## 5. Technology and Stack

### 5.1 Frontend
- **Framework:** Next.js (React)
- **UI Library:** Material-UI (MUI)
- **Charts:** Recharts or Chart.js
- **Styling:** MUI Theme + styled-components/emotion

### 5.2 Backend
- **API:** Next.js API Routes
- **Web Scraping:** Puppeteer or Cheerio
- **Database:** PostgreSQL or MongoDB (for price archiving)
- **Scheduling:** Node-cron (for automated scraping)

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Homepage load time: <2s
- Product search time: <1s
- Price chart renders smoothly without lag

### 6.2 Accessibility
- Application compliant with WCAG 2.1 (Level AA)
- Keyboard navigation support
- Appropriate color contrasts

### 6.3 SEO
- Server-side rendering for better SEO
- Meta tags for each product
- Sitemap.xml

### 6.4 Security
- SQL injection protection
- API rate limiting
- Web scraping abuse prevention

---

## 7. Success Metrics

### 7.1 KPI (Key Performance Indicators)
- Number of daily product searches
- Average time spent on product card
- User retention rate
- Number of clicks on store links

### 7.2 Business Goals
- **Month 1:** 100 weekly active users
- **Month 3:** 500 products in database
- **Month 6:** 1000 monthly active users

---

## 8. Development Roadmap

### Phase 1: MVP (4-6 weeks)
- ✅ Next.js + MUI project setup
- ✅ Navbar with search bar implementation
- ✅ Product card implementation
- ✅ Basic web scraper for 1-2 stores
- ✅ Price archive with simple visualization
- ✅ MVP deployment

### Phase 2: Extension (6-8 weeks)
- 📊 Advanced charts addition
- 🔔 Price drop notification system
- 💾 User panel with favorite products
- 🏪 Expansion to more stores
- 📱 Mobile optimization

### Phase 3: Scaling (ongoing)
- 🤖 Machine learning for price prediction
- 🔗 Store API integration (if available)
- 📈 Dashboard with market trends
- 👥 Social features (product sharing)

---

## 9. Risks and Mitigation

### 9.1 Risk: Blocking by Online Stores
**Probability:** High  
**Impact:** Critical  
**Mitigation:**
- Rate limiting implementation
- IP rotation / proxy usage
- User-agent rotation
- Consider official APIs

### 9.2 Risk: Changes to Store HTML Structure
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Modular scraper architecture
- Automated scraping tests
- Scraping error monitoring
- Quick response to changes

### 9.3 Risk: Infrastructure Costs
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Scraping frequency optimization
- Data caching
- Economical hosting selection
- Cost monitoring

---

## 10. Appendices

### 10.1 UI/UX References
- CamelCamelCamel (Amazon price tracker)
- Keepa (Amazon price history)
- Honey (price drop alerts)

### 10.2 Example Stores for Scraping
- RRmoto

---

