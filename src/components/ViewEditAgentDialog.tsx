import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  id: string;
}

interface ViewEditAgentDialogProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  onSave?: (agent: Agent) => void;
}

const availableTools = [
  "web_search",
  "file_upload", 
  "image_generation",
  "code_execution",
  "data_analysis"
];

const agentTypes = [
  "General Assistant",
  "Specialized Expert", 
  "Creative Helper",
  "Technical Support"
];

export function ViewEditAgentDialog({ agent, isOpen, onClose, mode, onSave }: ViewEditAgentDialogProps) {
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [agentType, setAgentType] = useState("");

  // Initialize form when agent changes
  useEffect(() => {
    if (agent) {
      setEditedAgent({ ...agent });
      // Initialize with some default tools for demo
      setSelectedTools(["web_search", "file_upload"]);
      setAgentType("General Assistant");
    }
  }, [agent]);

  const handleSave = () => {
    if (editedAgent && onSave) {
      onSave(editedAgent);
    }
    onClose();
  };

  const handleToolToggle = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    setSelectedTools(selectedTools.filter(t => t !== tool));
  };

  if (!agent) return null;

  const isEditable = mode === "edit";
  const currentAgent = editedAgent || agent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditable ? "Edit Agent" : "View Agent Details"}
          </DialogTitle>
          <DialogDescription>
            {isEditable ? "Modify agent configuration" : "Agent information and settings"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="agent-name">Agent Name</Label>
            {isEditable ? (
              <Input
                id="agent-name"
                value={currentAgent.name}
                onChange={(e) => setEditedAgent(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            ) : (
              <div className="text-sm font-medium">{currentAgent.name}</div>
            )}
          </div>

          <div>
            <Label htmlFor="agent-description">Description</Label>
            {isEditable ? (
              <Textarea
                id="agent-description"
                value={currentAgent.description}
                onChange={(e) => setEditedAgent(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
              />
            ) : (
              <div className="text-sm">{currentAgent.description}</div>
            )}
          </div>

          <div>
            <Label>Agent Type</Label>
            {isEditable ? (
              <Select value={agentType} onValueChange={setAgentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm">{agentType}</div>
            )}
          </div>

          <div>
            <Label>Tools</Label>
            {isEditable ? (
              <div className="space-y-2">
                <Select onValueChange={handleToolToggle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTools
                      .filter(tool => !selectedTools.includes(tool))
                      .map((tool) => (
                        <SelectItem key={tool} value={tool}>
                          {tool.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedTools.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                        {tool.replace('_', ' ').toUpperCase()}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeTool(tool)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTools.map((tool) => (
                  <Badge key={tool} variant="secondary">
                    {tool.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isEditable && (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}