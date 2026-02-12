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
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
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
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// Authentication Functions
// ============================================

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Create user document in Firestore
  await createUserDocument(userCredential.user);
  return userCredential;
}

export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // Create user document if it doesn't exist
  await createUserDocument(userCredential.user);
  return userCredential;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// User Functions
// ============================================

async function createUserDocument(firebaseUser: FirebaseUser): Promise<void> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      preferences: {
        emailNotifications: true,
        pushNotifications: false,
        checkFrequency: 'daily',
        theme: 'system',
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(userRef, userData);
  }
}

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
