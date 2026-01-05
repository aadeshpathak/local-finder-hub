import { Timestamp } from 'firebase/firestore';

export interface Review {
  id?: string;
  userId: string;
  serviceId: string;
  rating: number; // 1-5
  reviewText: string;
  timestamp: Timestamp;
  userName?: string; // Optional display name
}