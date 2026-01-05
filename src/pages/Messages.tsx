import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessagesModal } from '@/components/MessagesModal';
import { ArrowLeft } from 'lucide-react';

export default function Messages() {
  const navigate = useNavigate();
  const [messagesModalOpen, setMessagesModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Messages</h1>

          <MessagesModal open={messagesModalOpen} onOpenChange={setMessagesModalOpen} />
        </div>
      </div>
    </div>
  );
}