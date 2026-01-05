import { Timestamp } from 'firebase/firestore';

export interface Message {
  id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Timestamp;
  providerId: string;
  serviceId: string;
}