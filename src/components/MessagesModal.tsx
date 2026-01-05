import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/message';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInterface } from './ChatInterface';

interface Conversation {
  providerId: string;
  serviceId: string;
  latestMessage: Message;
}

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!user || !open) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const q2 = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const conversationsMap = new Map<string, Conversation>();

    const processMessages = (messages: Message[]) => {
      messages.forEach((msg) => {
        const key = `${msg.providerId}-${msg.serviceId}`;
        if (!conversationsMap.has(key) || conversationsMap.get(key)!.latestMessage.timestamp < msg.timestamp) {
          conversationsMap.set(key, {
            providerId: msg.providerId,
            serviceId: msg.serviceId,
            latestMessage: msg,
          });
        }
      });
      setConversations(Array.from(conversationsMap.values()));
    };

    const unsubscribe1 = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      processMessages(msgs);
    });

    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      processMessages(msgs);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user, open]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedConversation(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Messages</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-80 sm:h-96">
            {conversations.length === 0 ? (
              <p className="text-center text-muted-foreground">No messages yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={`${conv.providerId}-${conv.serviceId}`}
                  className="p-4 border-b cursor-pointer hover:bg-muted"
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="font-semibold">Provider: {conv.providerId}</div>
                  <div className="text-sm text-muted-foreground">Service: {conv.serviceId}</div>
                  <div className="text-sm truncate">{conv.latestMessage.message}</div>
                </div>
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {selectedConversation && (
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-full sm:max-w-2xl h-[500px] sm:h-[600px]">
            <DialogHeader>
              <DialogTitle>Chat with Provider {selectedConversation.providerId}</DialogTitle>
            </DialogHeader>
            <ChatInterface
              providerId={selectedConversation.providerId}
              serviceId={selectedConversation.serviceId}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={handleCloseChat}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};