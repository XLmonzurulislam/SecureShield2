import { useWebSocket } from '@/hooks/use-websocket';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function WebSocketStatus() {
  const { isConnected, reconnect } = useWebSocket();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={reconnect}
            className={cn(
              "transition-colors",
              isConnected ? "text-green-500 hover:text-green-600" : "text-red-500 hover:text-red-600"
            )}
          >
            {isConnected ? (
              <Wifi className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="flex items-center gap-2">
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
            {!isConnected && (
              <RefreshCw className="h-3 w-3 animate-spin" />
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}