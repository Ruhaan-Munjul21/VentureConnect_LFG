import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Team from "@/pages/team";
import GetMatched from "@/pages/get-matched";
import AdminDashboard from "@/pages/admin";
import AdminClientManagement from "@/pages/admin-client-management";
import AirtableTest from "@/pages/airtable-test";
import ClientTest from "@/pages/client-test";
import ClientLogin from "@/pages/client-login";
import ClientDashboard from "@/pages/client-dashboard";
import VCTimeline from "@/pages/vc-timeline";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/team" component={Team} />
      <Route path="/get-matched" component={GetMatched} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/clients" component={AdminClientManagement} />
      <Route path="/airtable-test" component={AirtableTest} />
      <Route path="/client-test" component={ClientTest} />
      <Route path="/client/login" component={ClientLogin} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client-portal" component={() => { window.location.href = '/client/dashboard'; return null; }} />
      <Route path="/vc-timeline" component={VCTimeline} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
