
import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel, 
} from '@/components/ui/sidebar';
import { useConversation } from '@/contexts/ConversationContext';

export const ConversationSidebar = () => {
  const { 
    conversations, 
    currentConversationId, 
    createConversation, 
    switchConversation, 
    deleteConversation,
    renameConversation 
  } = useConversation();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateConversation = () => {
    createConversation();
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      renameConversation(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } else if (diffInHours < 24 * 7) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="p-3 border-b">
        <Button 
          onClick={handleCreateConversation}
          className="w-full justify-start gap-2 h-9"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id} className="group relative">
                  <SidebarMenuButton
                    asChild
                    isActive={currentConversationId === conversation.id}
                    className={`
                      w-full h-auto p-0 rounded-md transition-all duration-200
                      ${currentConversationId === conversation.id 
                        ? 'bg-accent/80 text-accent-foreground' 
                        : 'hover:bg-accent/40'
                      }
                    `}
                  >
                    <button
                      onClick={() => switchConversation(conversation.id)}
                      className="w-full text-left p-2.5 rounded-md"
                    >
                      <div className="flex items-start gap-2.5">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                        <div className="flex-1 min-w-0 pr-6">
                          {editingId === conversation.id ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-6 text-xs px-2 flex-1 border-0 bg-background shadow-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                              />
                              <div className="flex gap-0.5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
                                  onClick={handleSaveEdit}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-sm leading-tight truncate mb-1">
                                {conversation.name}
                              </div>
                              <div className="text-xs text-muted-foreground/80 flex items-center gap-1">
                                <span>{conversation.messages.length} msgs</span>
                                <span>•</span>
                                <span>{formatDate(conversation.lastUpdated)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  </SidebarMenuButton>
                  
                  {/* Hover-only action buttons */}
                  {editingId !== conversation.id && (
                    <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(conversation.id, conversation.name);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
              
              {conversations.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="font-medium mb-1">No conversations yet</div>
                  <div className="text-xs opacity-80">Click "New Chat" to start</div>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
