import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { useChatMessages } from '../../../../services/api';

function ChatMessageList() {
  const { data: messages = [] } = useChatMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="bg-background rounded-lg p-4 min-h-[200px] mb-4 max-h-[400px] overflow-y-auto scroll-smooth">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export { ChatMessageList };
