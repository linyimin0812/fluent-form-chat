
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Button 
          onClick={handleCreateConversation}
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <div key={conversation.id}>
                  <SidebarMenuItem>
                    <div className="group flex items-center w-full">
                      <SidebarMenuButton
                        asChild
                        isActive={currentConversationId === conversation.id}
                        className="flex-1"
                      >
                        <button
                          onClick={() => switchConversation(conversation.id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            {editingId === conversation.id ? (
                              <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="h-6 text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={handleSaveEdit}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="truncate text-sm font-medium">
                                  {conversation.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(conversation.lastUpdated)}
                                </span>
                              </>
                            )}
                          </div>
                        </button>
                      </SidebarMenuButton>
                      
                      {editingId !== conversation.id && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </SidebarMenuItem>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1 mx-2" />

                </div>
              ))}
            </SidebarMenu>
            
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
