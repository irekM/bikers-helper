// Types for the Bikers Helper application

// ============================================
// User Types
// ============================================

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultUserPreferences: UserPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  checkFrequency: 'daily',
  theme: 'system',
};

// ============================================
// Product Types
// ============================================

export interface AlertSettings {
  enabled: boolean;
  targetPrice?: number;
  notifyOnAnyChange: boolean;
  notifyOnDrop: boolean;
  dropPercentage?: number;
}

export const defaultAlertSettings: AlertSettings = {
  enabled: false,
  notifyOnAnyChange: false,
  notifyOnDrop: true,
  dropPercentage: 10,
};

export interface Product {
  id: string;
  userId: string;
  url: string;
  name: string;
  imageUrl?: string;
  currentPrice: number;
  previousPrice?: number;
  lowestPrice: number;
  highestPrice: number;
  currency: string;
  shopName: string;
  shopLogo?: string;
  category?: string;
  available: boolean;
  alertSettings: AlertSettings;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  url: string;
}

// ============================================
// Price History Types
// ============================================

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  price: number;
  available: boolean;
  timestamp: Date;
}

// ============================================
// Scraper Types
// ============================================

export interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  imageUrl?: string;
  available: boolean;
  originalUrl: string;
  shopName: string;
  scrapedAt: Date;
  sourceType?: 'http' | 'browser';
  externalProductId?: string;
  availabilityText?: string;
}

export interface Scraper {
  shopName: string;
  supportedDomains: string[];
  scrape(url: string): Promise<ScrapedProduct>;
}

export type ScrapeMode = 'auto' | 'http' | 'browser';

export interface ScrapeRequestOptions {
  mode?: ScrapeMode;
}

export interface ScrapeRunResult {
  success: boolean;
  data?: ScrapedProduct;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    url: string;
    mode: ScrapeMode;
    resolvedMode: 'http' | 'browser';
    durationMs: number;
  };
}

// ============================================
// API Response Types
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Error Codes
// ============================================

export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  SCRAPER_NOT_FOUND: 'SCRAPER_NOT_FOUND',
  SCRAPER_FAILED: 'SCRAPER_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalProducts: number;
  priceDrops: number;
  priceIncreases: number;
  activeAlerts: number;
}

export interface PriceChange {
  product: Product;
  previousPrice: number;
  currentPrice: number;
  changePercent: number;
  changeAbsolute: number;
}

// ============================================
// Filter & Sort Types
// ============================================

export type ProductSortField = 'name' | 'price' | 'createdAt' | 'changePercent';
export type SortDirection = 'asc' | 'desc';

export interface ProductFilters {
  shopName?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  changeType?: 'all' | 'drops' | 'increases' | 'unchanged';
  available?: boolean;
}

export interface ProductSortOptions {
  field: ProductSortField;
  direction: SortDirection;
}
