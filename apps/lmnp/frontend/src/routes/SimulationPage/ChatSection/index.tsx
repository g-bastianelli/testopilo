import { Card, CardContent, cn } from '@testopilo/ui';
import { ChatHeader } from './ChatHeader';
import { ChatError } from './ChatError';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

type ChatSectionProps = {
  className?: string;
};

function ChatSection({ className }: ChatSectionProps) {
  return (
    <Card className={cn('bg-primary', className)}>
      <CardContent className="p-6">
        <ChatHeader />
        <ChatError />
        <ChatMessageList />
        <ChatInput />
      </CardContent>
    </Card>
  );
}

export { ChatSection };
