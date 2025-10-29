import { Button, Input } from '@testopilo/ui';
import { Loader2, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  QUERY_KEYS,
  useChatMessages,
  useSendChatMessage,
  useSimulationData,
} from '../../../services/api';
import type { ChatMessage } from '@lmnp/shared';
import { useState } from 'react';

function ChatInput() {
  const [message, setMessage] = useState('');

  const { data: messages = [] } = useChatMessages();
  const { data: simulationData } = useSimulationData();

  const queryClient = useQueryClient();
  const { mutate: sendMessage, isPending } = useSendChatMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isPending) return;

    const userMessage: ChatMessage = { role: 'user', content: message };

    // Optimistically update messages
    queryClient.setQueryData(QUERY_KEYS.messages, [...messages, userMessage]);
    setMessage('');

    sendMessage(
      {
        messages: [...messages, userMessage],
        currentData: simulationData,
      },
      {
        onError: (err) => {
          console.error('Chat error:', err);
          // Rollback on error
          queryClient.setQueryData(QUERY_KEYS.messages, messages);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Tapez votre message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-background"
      />
      <Button
        type="submit"
        disabled={isPending}
        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}

export { ChatInput };
