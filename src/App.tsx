import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EnhancedLoginForm } from "./components/auth/EnhancedLoginForm";
import { BillFlowSidebar } from "./components/billflow-sidebar";
import { BillFlowHeader } from "./components/billflow-header";
import { BillFlowDashboard } from "./components/billflow-dashboard";
import { BillFlowInvoices } from "./components/billflow-invoices";
import { BillFlowBills } from "./components/billflow-bills";
import { BillFlowVendors } from "./components/billflow-vendors";
import { BillFlowCustomers } from "./components/billflow-customers";
import { BillFlowPayments } from "./components/billflow-payments";
import { BillFlowIntegrations } from "./components/billflow-integrations";
import { BillFlowSettings } from "./components/billflow-settings";
import { BillFlowReports } from "./components/billflow-reports";
import { BillFlowApprovals } from "./components/billflow-approvals";
import { BillFlowItemCatalog } from "./components/billflow-item-catalog";
import { BillFlowTemplates } from "./components/billflow-templates";
import { BillFlowRecurring } from "./components/billflow-recurring";
import { BillFlowFAB } from "./components/billflow-fab";
import { BillFlowCommandPalette } from "./components/billflow-command-palette";
import { Toaster } from "./components/ui/sonner";
import { useState } from "react";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster />
      <BillFlowCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={setCurrentPage}
      />
      <BillFlowFAB />
      <BillFlowSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1" style={{ marginLeft: "240px" }}>
        <BillFlowHeader onOpenCommandPalette={() => setCommandOpen(true)} />
        <main className="p-6">
          {currentPage === "dashboard" && <BillFlowDashboard />}
          {currentPage === "invoices" && <BillFlowInvoices />}
          {currentPage === "bills" && <BillFlowBills />}
          {currentPage === "vendors" && <BillFlowVendors />}
          {currentPage === "customers" && <BillFlowCustomers />}
          {currentPage === "payments" && <BillFlowPayments />}
          {currentPage === "approvals" && <BillFlowApprovals />}
          {currentPage === "reports" && <BillFlowReports />}
          {currentPage === "item-catalog" && <BillFlowItemCatalog />}
          {currentPage === "templates" && <BillFlowTemplates />}
          {currentPage === "recurring" && <BillFlowRecurring />}
          {currentPage === "integrations" && <BillFlowIntegrations />}
          {currentPage === "settings" && <BillFlowSettings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
