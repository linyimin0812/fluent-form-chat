import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Eye, Edit } from "lucide-react";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { ViewEditAgentDialog } from "@/components/ViewEditAgentDialog";
import { useState } from "react";

interface Agent {
  name: string;
  description: string;
  id: string;
}

const agents: Agent[] = [
  {
    id: "share-agent",
    name: "Share Agent",
    description: "分享agent"
  },
  {
    id: "share-creation-agent",
    name: "Share Creation Agent",
    description: "分享配置创建agent"
  },
  {
    id: "share-test-agent",
    name: "Share Test Agent",
    description: "分享配置测试agent"
  },
  {
    id: "share-qa-agent",
    name: "Share Q&A Agent",
    description: "分享答疑agent"
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
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {agent.name}
              </CardTitle>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => handleStartConversation(agent.id)}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Conversation
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleViewDetails(agent)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEditAgent(agent)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ViewEditAgentDialog
        agent={selectedAgent}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        mode={dialogMode}
        onSave={handleSaveAgent}
      />
    </div>
  );
}
