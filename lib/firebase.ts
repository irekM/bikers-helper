// Firebase configuration and utilities
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  setDoc,
} from 'firebase/firestore';
import type {
  User,
  Product,
  PriceHistoryEntry,
  UserPreferences,
} from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// ============================================
// Klucz do localStorage dla sesji użytkownika
// ============================================
const AUTH_STORAGE_KEY = 'bikers_helper_user';

// ============================================
// PROSTA AUTENTYKACJA (bez hashowania - tylko do nauki!)
// Hasła są przechowywane jako plain text w Firestore
// ⚠️ NIGDY nie rób tego w produkcji!
// ============================================

/**
 * Rejestracja nowego użytkownika
 * Zapisuje email i hasło w plain text do kolekcji 'users'
 */
export async function registerUser(email: string, password: string): Promise<User> {
  // Sprawdź czy użytkownik już istnieje
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const existingUsers = await getDocs(q);

  if (!existingUsers.empty) {
    throw new Error('Użytkownik z tym emailem już istnieje');
  }

  // Utwórz nowego użytkownika z hasłem w plain text
  const now = Timestamp.now();
  const userData = {
    email: email,
    password: password, // ⚠️ Plain text - tylko do nauki!
    displayName: '',
    photoURL: '',
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      checkFrequency: 'daily',
      theme: 'system',
    },
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(usersRef, userData);

  const user: User = {
    id: docRef.id,
    email: userData.email,
    displayName: userData.displayName,
    photoURL: userData.photoURL,
    preferences: userData.preferences as UserPreferences,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };

  // Zapisz użytkownika w localStorage (sesja)
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Logowanie użytkownika
 * Sprawdza email i hasło w kolekcji 'users'
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Nie znaleziono użytkownika o podanym emailu');
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  // Sprawdź hasło (plain text comparison)
  if (userData.password !== password) {
    throw new Error('Nieprawidłowe hasło');
  }

  const user: User = {
    id: userDoc.id,
    email: userData.email,
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    preferences: userData.preferences,
    createdAt: userData.createdAt.toDate(),
    updatedAt: userData.updatedAt.toDate(),
  };

  // Zapisz użytkownika w localStorage (sesja)
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Wylogowanie użytkownika
 * Usuwa sesję z localStorage
 */
export async function logoutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Pobierz aktualnie zalogowanego użytkownika z localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const user = JSON.parse(stored);
    // Konwertuj stringi dat z powrotem na obiekty Date
    user.createdAt = new Date(user.createdAt);
    user.updatedAt = new Date(user.updatedAt);
    return user as User;
  } catch {
    return null;
  }
}

// ============================================
// User Functions
// ============================================

export async function getUserData(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      preferences: data.preferences,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }
  return null;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    preferences,
    updatedAt: Timestamp.now(),
  });
}

// ============================================
// Product Functions
// ============================================

export async function getProducts(userId: string): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => documentToProduct(docSnap.id, docSnap.data()));
}

export async function getProduct(productId: string): Promise<Product | null> {
  const productRef = doc(db, 'products', productId);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    return documentToProduct(productSnap.id, productSnap.data());
  }
  return null;
}

export async function addProduct(
  userId: string,
  productData: {
    url: string;
    name: string;
    price: number;
    currency: string;
    imageUrl?: string;
    shopName: string;
    available: boolean;
  }
): Promise<string> {
  const now = Timestamp.now();
  const newProduct = {
    userId,
    url: productData.url,
    name: productData.name,
    imageUrl: productData.imageUrl || null,
    currentPrice: productData.price,
    previousPrice: null,
    lowestPrice: productData.price,
    highestPrice: productData.price,
    currency: productData.currency,
    shopName: productData.shopName,
    available: productData.available,
    category: null,
    alertSettings: {
      enabled: false,
      notifyOnAnyChange: false,
      notifyOnDrop: true,
      dropPercentage: 10,
    },
    lastChecked: now,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'products'), newProduct);

  // Add initial price history entry
  await addPriceHistoryEntry(docRef.id, productData.price, productData.available);

  return docRef.id;
}

export async function updateProduct(
  productId: string,
  updates: Partial<Pick<Product, 'alertSettings' | 'category'>>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function updateProductPrice(
  productId: string,
  newPrice: number,
  available: boolean
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error('Product not found');
  }

  const data = productSnap.data();
  const now = Timestamp.now();

  await updateDoc(productRef, {
    previousPrice: data.currentPrice,
    currentPrice: newPrice,
    lowestPrice: Math.min(data.lowestPrice, newPrice),
    highestPrice: Math.max(data.highestPrice, newPrice),
    available,
    lastChecked: now,
    updatedAt: now,
  });

  // Add price history entry
  await addPriceHistoryEntry(productId, newPrice, available);
}

export async function deleteProduct(productId: string): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
}

function documentToProduct(id: string, data: DocumentData): Product {
  return {
    id,
    userId: data.userId,
    url: data.url,
    name: data.name,
    imageUrl: data.imageUrl,
    currentPrice: data.currentPrice,
    previousPrice: data.previousPrice,
    lowestPrice: data.lowestPrice,
    highestPrice: data.highestPrice,
    currency: data.currency,
    shopName: data.shopName,
    shopLogo: data.shopLogo,
    category: data.category,
    available: data.available,
    alertSettings: data.alertSettings,
    lastChecked: data.lastChecked.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

// ============================================
// Price History Functions
// ============================================

export async function getPriceHistory(
  productId: string,
  limitCount = 30
): Promise<PriceHistoryEntry[]> {
  const historyRef = collection(db, 'priceHistory');
  const q = query(
    historyRef,
    where('productId', '==', productId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    productId: docSnap.data().productId,
    price: docSnap.data().price,
    available: docSnap.data().available,
    timestamp: docSnap.data().timestamp.toDate(),
  }));
}

async function addPriceHistoryEntry(
  productId: string,
  price: number,
  available: boolean
): Promise<void> {
  await addDoc(collection(db, 'priceHistory'), {
    productId,
    price,
    available,
    timestamp: Timestamp.now(),
  });
}

// ============================================
// Dashboard Functions
// ============================================

export async function getDashboardStats(userId: string) {
  const products = await getProducts(userId);

  let priceDrops = 0;
  let priceIncreases = 0;
  let activeAlerts = 0;

  products.forEach((product) => {
    if (product.previousPrice) {
      if (product.currentPrice < product.previousPrice) {
        priceDrops++;
      } else if (product.currentPrice > product.previousPrice) {
        priceIncreases++;
      }
    }
    if (product.alertSettings.enabled) {
      activeAlerts++;
    }
  });

  return {
    totalProducts: products.length,
    priceDrops,
    priceIncreases,
    activeAlerts,
  };
}

// ============================================
// Batch Operations (for CRON)
// ============================================

export async function getAllProductsForUpdate(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((docSnap) => documentToProduct(docSnap.id, docSnap.data()));
}
