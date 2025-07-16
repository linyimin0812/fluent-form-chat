import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, Bot, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tools: string[];
}

interface CreateAgentDialogProps {
  onCreateAgent: (agentData: any) => void;
}

const availableTools = [
  "web_search",
  "file_operations", 
  "code_execution",
  "image_generation",
  "data_analysis"
];

export function CreateAgentDialog({ onCreateAgent }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [agentType, setAgentType] = useState<"single" | "multiple">("single");
  
  // Single agent state
  const [singleAgent, setSingleAgent] = useState({
    name: "",
    description: "",
    prompt: "",
    tools: [] as string[]
  });

  // Multiple agents state
  const [multipleAgents, setMultipleAgents] = useState({
    mainAgentName: "",
    functionalPrompt: "",
    subAgents: [{
      id: "1",
      name: "",
      description: "",
      prompt: "",
      tools: [] as string[]
    }] as SubAgent[]
  });

  const handleToolToggle = (tool: string, agentId?: string) => {
    if (agentType === "single") {
      setSingleAgent(prev => ({
        ...prev,
        tools: prev.tools.includes(tool) 
          ? prev.tools.filter(t => t !== tool)
          : [...prev.tools, tool]
      }));
    } else {
      if (agentId) {
        setMultipleAgents(prev => ({
          ...prev,
          subAgents: prev.subAgents.map(agent => 
            agent.id === agentId
              ? {
                  ...agent,
                  tools: agent.tools.includes(tool)
                    ? agent.tools.filter(t => t !== tool)
                    : [...agent.tools, tool]
                }
              : agent
          )
        }));
      }
    }
  };

  const addSubAgent = () => {
    const newId = (multipleAgents.subAgents.length + 1).toString();
    setMultipleAgents(prev => ({
      ...prev,
      subAgents: [...prev.subAgents, {
        id: newId,
        name: "",
        description: "",
        prompt: "",
        tools: []
      }]
    }));
  };

  const removeSubAgent = (id: string) => {
    if (multipleAgents.subAgents.length > 1) {
      setMultipleAgents(prev => ({
        ...prev,
        subAgents: prev.subAgents.filter(agent => agent.id !== id)
      }));
    }
  };

  const updateSubAgent = (id: string, field: keyof SubAgent, value: string) => {
    setMultipleAgents(prev => ({
      ...prev,
      subAgents: prev.subAgents.map(agent =>
        agent.id === id ? { ...agent, [field]: value } : agent
      )
    }));
  };

  const handleSubmit = () => {
    const agentData = agentType === "single" ? singleAgent : multipleAgents;
    onCreateAgent({ type: agentType, ...agentData });
    setOpen(false);
    // Reset form
    setSingleAgent({ name: "", description: "", prompt: "", tools: [] });
    setMultipleAgents({
      mainAgentName: "",
      functionalPrompt: "",
      subAgents: [{ id: "1", name: "", description: "", prompt: "", tools: [] }]
    });
    setAgentType("single");
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const ToolSelector = ({ tools, onToolToggle, idPrefix = "" }: { 
    tools: string[], 
    onToolToggle: (tool: string) => void,
    idPrefix?: string 
  }) => {
    return (
      <div className="space-y-2">
        <Label>Tool Selection</Label>
        <Select onValueChange={onToolToggle}>
          <SelectTrigger>
            <SelectValue placeholder="Select a tool" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-popover">
            {availableTools.map((tool) => (
              <SelectItem key={tool} value={tool}>
                {tool.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tools.map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
              >
                {tool.replace('_', ' ').toUpperCase()}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => onToolToggle(tool)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6">
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Type Selector */}
          <div className="space-y-2">
            <Label>Agent Type</Label>
            <Select value={agentType} onValueChange={(value: "single" | "multiple") => setAgentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="single">Single Agent</SelectItem>
                <SelectItem value="multiple">Multiple Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agentType === "single" ? (
            /* Single Agent Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={singleAgent.name}
                  onChange={(e) => setSingleAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea
                  id="agent-description"
                  value={singleAgent.description}
                  onChange={(e) => setSingleAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter agent description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-prompt">Prompt</Label>
                <Textarea
                  id="agent-prompt"
                  value={singleAgent.prompt}
                  onChange={(e) => setSingleAgent(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter agent prompt"
                  rows={4}
                />
              </div>

              <ToolSelector 
                tools={singleAgent.tools}
                onToolToggle={(tool) => handleToolToggle(tool)}
                idPrefix="single-"
              />
            </div>
          ) : (
            /* Multiple Agents Form */
            <div className="space-y-6">
              {/* Main Agent */}
              <Card>
                <CardHeader>
                  <CardTitle>Main Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="main-agent-name">Main Agent Name</Label>
                    <Input
                      id="main-agent-name"
                      value={multipleAgents.mainAgentName}
                      onChange={(e) => setMultipleAgents(prev => ({ ...prev, mainAgentName: e.target.value }))}
                      placeholder="Enter main agent name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="functional-prompt">Functional Prompt</Label>
                    <Textarea
                      id="functional-prompt"
                      value={multipleAgents.functionalPrompt}
                      onChange={(e) => setMultipleAgents(prev => ({ ...prev, functionalPrompt: e.target.value }))}
                      placeholder="Enter functional prompt"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sub Agents */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Sub Agents</Label>
                  <Button onClick={addSubAgent} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sub Agent
                  </Button>
                </div>

                {multipleAgents.subAgents.map((subAgent, index) => (
                  <Card key={subAgent.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Sub Agent {index + 1}</CardTitle>
                        {multipleAgents.subAgents.length > 1 && (
                          <Button
                            onClick={() => removeSubAgent(subAgent.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Agent Name</Label>
                        <Input
                          value={subAgent.name}
                          onChange={(e) => updateSubAgent(subAgent.id, "name", e.target.value)}
                          placeholder="Enter sub agent name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={subAgent.description}
                          onChange={(e) => updateSubAgent(subAgent.id, "description", e.target.value)}
                          placeholder="Enter sub agent description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Textarea
                          value={subAgent.prompt}
                          onChange={(e) => updateSubAgent(subAgent.id, "prompt", e.target.value)}
                          placeholder="Enter sub agent prompt"
                          rows={3}
                        />
                      </div>

                      <ToolSelector 
                        tools={subAgent.tools}
                        onToolToggle={(tool) => handleToolToggle(tool, subAgent.id)}
                        idPrefix={`sub-${subAgent.id}-`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Agent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}