import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Bot } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tool {
  name: string;
  requiresHumanIntervention: boolean;
}

interface SubAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tools: Tool[];
}

interface CreateAgentDialogProps {
  onCreateAgent: (agentData: any) => void;
}

const availableTools = [
  { name: "web_search", requiresHumanIntervention: false, desc: "互联网检索，获取最新公开信息" },
  { name: "file_operations", requiresHumanIntervention: false, desc: "文件读写、管理本地或云端文件" },
  { name: "code_execution", requiresHumanIntervention: false, desc: "代码运行，支持多语言脚本执行" },
  { name: "image_generation", requiresHumanIntervention: false, desc: "AI图片生成，根据描述生成图片" },
  { name: "data_analysis", requiresHumanIntervention: false, desc: "数据分析与可视化，支持表格/图表" }
] as Array<Tool & { desc: string }>;

export function CreateAgentDialog({ onCreateAgent }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [agentType, setAgentType] = useState<"single" | "multiple">("single");
  
  // Single agent state
  const [singleAgent, setSingleAgent] = useState({
    name: "",
    description: "",
    prompt: "",
    tools: [] as Tool[]
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
      tools: [] as Tool[]
    }] as SubAgent[]
  });

  // 工具添加/切换 requiresHumanIntervention
  const handleToolToggle = (toolName: string, requiresIntervention: boolean, agentId?: string) => {
    if (agentType === "single") {
      setSingleAgent(prev => {
        const exists = prev.tools.find(t => t.name === toolName);
        if (exists) {
          // 切换 requiresHumanIntervention
          return {
            ...prev,
            tools: prev.tools.map(t =>
              t.name === toolName ? { ...t, requiresHumanIntervention: requiresIntervention } : t
            )
          };
        } else {
          return {
            ...prev,
            tools: [...prev.tools, { name: toolName, requiresHumanIntervention: requiresIntervention }]
          };
        }
      });
    } else if (agentId) {
      setMultipleAgents(prev => ({
        ...prev,
        subAgents: prev.subAgents.map(agent =>
          agent.id === agentId
            ? {
                ...agent,
                tools: agent.tools.find(t => t.name === toolName)
                  ? agent.tools.map(t =>
                      t.name === toolName ? { ...t, requiresHumanIntervention: requiresIntervention } : t
                    )
                  : [...agent.tools, { name: toolName, requiresHumanIntervention: requiresIntervention }]
              }
            : agent
        )
      }));
    }
  };

  // 工具移除
  const handleToolRemove = (toolName: string, agentId?: string) => {
    if (agentType === "single") {
      setSingleAgent(prev => ({
        ...prev,
        tools: prev.tools.filter(t => t.name !== toolName)
      }));
    } else if (agentId) {
      setMultipleAgents(prev => ({
        ...prev,
        subAgents: prev.subAgents.map(agent =>
          agent.id === agentId
            ? { ...agent, tools: agent.tools.filter(t => t.name !== toolName) }
            : agent
        )
      }));
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

  // ToolSelector 组件，支持 Tool 类型
  const ToolSelector = ({ tools, onToolToggle, onToolRemove }: {
    tools: Tool[],
    onToolToggle: (toolName: string, requiresIntervention: boolean) => void,
    onToolRemove: (toolName: string) => void,
  }) => {
    const [search, setSearch] = useState("");
    const filteredTools = availableTools.filter(
      t => !tools.some(sel => sel.name === t.name) && t.name.includes(search)
    );
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownUp, setDropdownUp] = useState(false);
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number|undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    // 监听下拉显示时自动判断方向和最大高度
    const handleShowDropdown = () => {
      setShowDropdown(true);
      setTimeout(() => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const spaceAbove = rect.top;
        const spaceBelow = windowHeight - rect.bottom;
        // 计算下拉最大高度，确保不产生滚动
        if (spaceBelow >= spaceAbove) {
          setDropdownUp(false);
          setDropdownMaxHeight(spaceBelow - 8); // 8px margin
        } else {
          setDropdownUp(true);
          setDropdownMaxHeight(spaceAbove - 8);
        }
      }, 0);
    };

    return (
      <div className="space-y-2 relative">
        <Label>Tool Selection</Label>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="搜索或选择工具..."
            value={search}
            onFocus={handleShowDropdown}
            onChange={e => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="pr-8"
          />
          {showDropdown && (
            <div
              className="absolute left-0 right-0 z-10 bg-popover border rounded shadow overflow-hidden"
              style={{
                ...(dropdownUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }),
                maxHeight: dropdownMaxHeight,
                overflowY: 'visible',
              }}
            >
              {filteredTools.length === 0 ? (
                <div className="text-xs text-muted-foreground px-2 py-4">无匹配工具</div>
              ) : (
                filteredTools.map(tool => (
                  <button
                    key={tool.name}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent"
                    onMouseDown={e => {
                      e.preventDefault();
                      onToolToggle(tool.name, false);
                      setSearch("");
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span>{tool.name.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{tool.desc}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {tools.length > 0 && (
          <div className="space-y-2 mt-2 flex flex-col">
            {tools.map((tool) => {
              const meta = availableTools.find(t => t.name === tool.name);
              return (
                <div
                  key={tool.name}
                  className="flex items-center justify-between bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  <div className="flex flex-col items-start">
                    <span>{tool.name.replace('_', ' ').toUpperCase()}</span>
                    {meta?.desc && <span className="text-xs text-muted-foreground mt-0.5">{meta.desc}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs" htmlFor={`chk-${tool.name}`}>是否需要人工介入</Label>
                    <Checkbox
                      id={`chk-${tool.name}`}
                      checked={tool.requiresHumanIntervention}
                      onCheckedChange={checked => onToolToggle(tool.name, !!checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => onToolRemove(tool.name)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              );
            })}
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
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col overflow-y-auto">
          {/* Agent Type Selector */}
          <div className="space-y-2">
            <Label>Agent Type</Label>
            <Select value={agentType} onValueChange={v => setAgentType(v as "single" | "multiple") }>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
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
                  className="focus:border-muted focus:ring-1 focus:ring-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Textarea
                  id="agent-description"
                  value={singleAgent.description}
                  onChange={(e) => setSingleAgent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter agent description"
                  className="focus:border-muted focus:ring-1 focus:ring-muted"
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
                  className="focus:border-muted focus:ring-1 focus:ring-muted"
                />
              </div>

              <ToolSelector 
                tools={singleAgent.tools}
                onToolToggle={(toolName, requiresIntervention) => handleToolToggle(toolName, requiresIntervention)}
                onToolRemove={(toolName) => handleToolRemove(toolName)}
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
                          className="focus:border-muted focus:ring-1 focus:ring-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={subAgent.description}
                          onChange={(e) => updateSubAgent(subAgent.id, "description", e.target.value)}
                          placeholder="Enter sub agent description"
                          className="focus:border-muted focus:ring-1 focus:ring-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prompt</Label>
                        <Textarea
                          value={subAgent.prompt}
                          onChange={(e) => updateSubAgent(subAgent.id, "prompt", e.target.value)}
                          placeholder="Enter sub agent prompt"
                          rows={3}
                          className="focus:border-muted focus:ring-1 focus:ring-muted"
                        />
                      </div>

                      <ToolSelector 
                        tools={subAgent.tools}
                        onToolToggle={(toolName, requiresIntervention) => handleToolToggle(toolName, requiresIntervention, subAgent.id)}
                        onToolRemove={(toolName) => handleToolRemove(toolName, subAgent.id)}
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
