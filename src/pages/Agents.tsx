// 工具元数据（与 CreateAgentDialog 保持一致）
const availableTools = [
  { name: "web_search", desc: "互联网检索，获取最新公开信息" },
  { name: "file_operations", desc: "文件读写、管理本地或云端文件" },
  { name: "code_execution", desc: "代码运行，支持多语言脚本执行" },
  { name: "image_generation", desc: "AI图片生成，根据描述生成图片" },
  { name: "data_analysis", desc: "数据分析与可视化，支持表格/图表" }
];
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Eye, Edit } from "lucide-react";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Tool {
  name: string;
  requiresHumanIntervention: boolean;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  agentType?: 'single' | 'multiple';
  prompt?: string;
  tools?: Tool[];
}

const agents: Agent[] = [
  {
    id: "share-agent",
    name: "Share Agent",
    description: "分享agent",
    agentType: "single",
    prompt: "请帮我分享内容",
    tools: [
      { name: "web_search", requiresHumanIntervention: false },
      { name: "file_operations", requiresHumanIntervention: true }
    ]
  },
  {
    id: "share-creation-agent",
    name: "Share Creation Agent",
    description: "分享配置创建agent",
    agentType: "single",
    prompt: "请帮我创建配置",
    tools: [
      { name: "code_execution", requiresHumanIntervention: false }
    ]
  },
  {
    id: "share-test-agent",
    name: "Share Test Agent",
    description: "分享配置测试agent",
    agentType: "multiple",
    prompt: "请帮我测试配置",
    tools: [
      { name: "data_analysis", requiresHumanIntervention: false }
    ]
  },
  {
    id: "share-qa-agent",
    name: "Share Q&A Agent",
    description: "分享答疑agent",
    agentType: "single",
    prompt: "请帮我答疑",
    tools: [
      { name: "web_search", requiresHumanIntervention: false },
      { name: "image_generation", requiresHumanIntervention: false }
    ]
  }
];

export default function Agents() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartConversation = (agentName: string) => {
    navigate(`/agents/${agentName}`);
  };

  const handleCreateAgent = (agentData: any) => {
    console.log("Creating agent:", agentData);
    // TODO: Implement agent creation logic
  };

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleSaveAgent = (updatedAgent: Agent) => {
    console.log("Saving agent:", updatedAgent);
    // TODO: Implement agent update logic
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Choose Your Agent</h1>
        </div>
        <p className="text-muted-foreground">
          Select an AI agent specialized for your specific needs
        </p>
      </div>

      <CreateAgentDialog onCreateAgent={handleCreateAgent} />

      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewDetails(agent)}
                className="h-8 w-8 hover:bg-accent"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditAgent(agent)}
                className="h-8 w-8 hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {agent.name}
              </CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleStartConversation(agent.id)}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Conversation
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Agent Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 flex-1 flex flex-col overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-type">Agent Type</Label>
                    <Input
                      id="agent-type"
                      value={selectedAgent.agentType === 'multiple' ? 'Multiple Agents' : 'Single Agent'}
                      disabled
                      tabIndex={-1}
                      className="select-none focus:border-muted focus:ring-1 focus:ring-muted bg-muted/50 cursor-default"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={selectedAgent.name}
                      disabled
                      tabIndex={-1}
                      className="select-none focus:border-muted focus:ring-1 focus:ring-muted bg-muted/50 cursor-default"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea
                      id="agent-description"
                      value={selectedAgent.description}
                      disabled
                      tabIndex={-1}
                      className="select-none focus:border-muted focus:ring-1 focus:ring-muted bg-muted/50 cursor-default"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agent 编排图</Label>
                    <div className="w-full h-48 bg-muted/50 rounded flex items-center justify-center border border-dashed border-muted-foreground/40 select-none overflow-hidden">
                      <img
                        src="https://lark-assets-prod-aliyun.oss-cn-hangzhou.aliyuncs.com/lark/0/2025/svg/264251/1752576809686-25e01f4b-4054-4da8-ac9c-76281dfa55bb.svg?OSSAccessKeyId=LTAI4GGhPJmQ4HWCmhDAn4F5&Expires=1752843746&Signature=vd%2FeRBm8EgnLOFdqdmv%2Bz08GalE%3D&response-content-disposition=inline"
                        alt="Agent 编排图"
                        className="max-h-44 object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-prompt">Prompt</Label>
                    <Textarea
                      id="agent-prompt"
                      value={selectedAgent.prompt || ''}
                      disabled
                      tabIndex={-1}
                      className="select-none focus:border-muted focus:ring-1 focus:ring-muted bg-muted/50 cursor-default"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selected Tools</Label>
                    <div className="space-y-2">
                      {(selectedAgent.tools && selectedAgent.tools.length > 0) ? (
                        selectedAgent.tools.map(tool => {
                          const meta = availableTools.find(t => t.name === tool.name);
                          return (
                            <div
                              key={tool.name}
                              className="flex items-center justify-between bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm select-none"
                            >
                              <div className="flex flex-col items-start">
                                <span>{tool.name.replace('_', ' ').toUpperCase()}</span>
                                {meta?.desc && <span className="text-xs text-muted-foreground mt-0.5">{meta.desc}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs">人工介入</span>
                                <input type="checkbox" checked={tool.requiresHumanIntervention} disabled tabIndex={-1} className="accent-muted/50" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground">无工具</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
