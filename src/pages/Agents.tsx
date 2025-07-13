import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare } from "lucide-react";

interface Agent {
  name: string;
  description: string;
  id: string;
}

const agents: Agent[] = [
  {
    id: "assistant",
    name: "General Assistant",
    description: "A helpful AI assistant for general questions and tasks. Can help with writing, analysis, and problem-solving."
  },
  {
    id: "coder",
    name: "Code Helper",
    description: "Specialized in programming and software development. Expert in multiple languages and frameworks."
  },
  {
    id: "writer",
    name: "Creative Writer",
    description: "Focused on creative writing, storytelling, and content creation. Perfect for articles, stories, and marketing copy."
  },
  {
    id: "analyst",
    name: "Data Analyst",
    description: "Specialized in data analysis, statistics, and business intelligence. Great for insights and reporting."
  }
];

export default function Agents() {
  const navigate = useNavigate();

  const handleStartConversation = (agentName: string) => {
    navigate(`/${agentName}`);
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
    </div>
  );
}