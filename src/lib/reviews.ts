import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Review } from '@/types/review';
import type { Service } from '@/data/services';

export const addReview = async (review: Omit<Review, 'id' | 'timestamp'>): Promise<string> => {
  const reviewData = {
    ...review,
    timestamp: Timestamp.now(),
    userName: review.userName || 'Anonymous', // Ensure userName is set
  };
  const docRef = await addDoc(collection(db, 'reviews'), reviewData);
  return docRef.id;
};

export const getReviewsForService = async (serviceId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const reviews = querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Review))
    .filter(review => review.serviceId === serviceId);
  return reviews;
};

export const updateReview = async (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'reviewText'>>): Promise<void> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  await updateDoc(reviewRef, {
    ...updates,
    timestamp: Timestamp.now(),
  });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, 'reviews', reviewId);
  await deleteDoc(reviewRef);
};

export const updateServiceRating = async (serviceId: string): Promise<void> => {
  const { average, count } = await getAverageRatingForService(serviceId);
  const serviceRef = doc(db, 'services', serviceId);
  await updateDoc(serviceRef, {
    rating: average,
    reviewCount: count,
  });
};

export const getAverageRatingForService = async (serviceId: string): Promise<{ average: number; count: number }> => {
  const reviews = await getReviewsForService(serviceId);
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10, // Round to 1 decimal
    count: reviews.length,
  };
};