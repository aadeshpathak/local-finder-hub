import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface ChatInterfaceProps {
  providerId: string;
  serviceId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ providerId, serviceId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'messages'),
      where('serviceId', '==', serviceId),
      where('providerId', '==', providerId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return unsubscribe;
  }, [user, providerId, serviceId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    await addDoc(collection(db, 'messages'), {
      senderId: user.uid,
      receiverId: providerId,
      message: newMessage.trim(),
      timestamp: serverTimestamp(),
      providerId,
      serviceId,
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!user) return <div>Please log in to chat.</div>;

  return (
    <Card className="flex flex-col h-96">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${msg.senderId === user.uid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.message}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t flex">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 mr-2"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </Card>
  );
};