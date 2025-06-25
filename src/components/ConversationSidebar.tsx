
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
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b">
        <Button 
          onClick={handleCreateConversation}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-2 text-xs font-medium text-muted-foreground">
            Recent Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id} className="group">
                  <div className="relative">
                    <SidebarMenuButton
                      asChild
                      isActive={currentConversationId === conversation.id}
                      className={`
                        w-full h-auto p-3 rounded-lg transition-all duration-200
                        ${currentConversationId === conversation.id 
                          ? 'bg-accent text-accent-foreground shadow-sm' 
                          : 'hover:bg-accent/50'
                        }
                      `}
                    >
                      <button
                        onClick={() => switchConversation(conversation.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            {editingId === conversation.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="h-7 text-sm flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-green-100"
                                    onClick={handleSaveEdit}
                                  >
                                    <Check className="h-3 w-3 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-red-100"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-sm leading-5 truncate">
                                  {conversation.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {conversation.messages.length} messages • {formatDate(conversation.lastUpdated)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </SidebarMenuButton>
                    
                    {editingId !== conversation.id && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-blue-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conversation.id, conversation.name);
                          }}
                        >
                          <Edit2 className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
              
              {conversations.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No conversations yet.
                  <br />
                  Click "New Chat" to start.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
