'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  PlusCircle,
  MessageSquare,
  Settings,
  User,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppSidebarProps {
  conversations?: Conversation[];
  currentConversationId?: string;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export function AppSidebar({
  conversations = [],
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group conversations by date
  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r w-64">
      {/* Header */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva conversación
        </Button>
      </div>

      <Separator />

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        {Object.entries(groupedConversations).map(([group, convos]) => (
          <div key={group} className="py-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground mb-2">
              {group}
            </h3>
            <div className="space-y-1">
              {convos.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation?.(conversation.id)}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    'flex items-center gap-2 group',
                    currentConversationId === conversation.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{conversation.title}</span>

                  {hoveredId === conversation.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation?.(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay conversaciones aún
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <User className="h-4 w-4" />
          Mi cuenta
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Configuración
        </Button>
      </div>
    </div>
  );
}

// Helper function to group conversations
function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const groups: Record<string, Conversation[]> = {
    Hoy: [],
    Ayer: [],
    'Últimos 7 días': [],
    'Últimos 30 días': [],
    Anteriores: [],
  };

  conversations.forEach((conv) => {
    const diff = now.getTime() - conv.updatedAt.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      groups.Hoy.push(conv);
    } else if (daysDiff === 1) {
      groups.Ayer.push(conv);
    } else if (daysDiff <= 7) {
      groups['Últimos 7 días'].push(conv);
    } else if (daysDiff <= 30) {
      groups['Últimos 30 días'].push(conv);
    } else {
      groups.Anteriores.push(conv);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, convos]) => convos.length > 0)
  );
}