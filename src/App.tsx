
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Agents from "./pages/Agents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConversationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/agents" replace />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/*" element={
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <ConversationSidebar />
                  <SidebarInset className="flex-1">
                    <Routes>
                      <Route path="*" element={<Index />} />
                    </Routes>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConversationProvider>
  </QueryClientProvider>
);

export default App;
