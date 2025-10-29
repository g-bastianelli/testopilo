import { Button } from '@testopilo/ui';
import { RotateCcw } from 'lucide-react';
import { useResetChat } from '../../../services/api';

function ChatHeader() {
  const resetChat = useResetChat();

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-primary-foreground">
        Assistant LMNP
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={resetChat}
        className="text-primary-foreground hover:bg-primary/90"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
    </div>
  );
}

export { ChatHeader };
