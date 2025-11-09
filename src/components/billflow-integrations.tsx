import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  CreditCard, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Zap,
  RefreshCw,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function BillFlowIntegrations() {
  const [activeGateway, setActiveGateway] = useState<"authorize" | "cybersource" | null>("authorize");
  const [quickbooksConnected, setQuickbooksConnected] = useState(true);
  const [xeroConnected, setXeroConnected] = useState(false);
  const [authorizeNetKey, setAuthorizeNetKey] = useState("••••••••••••4567");
  const [cybersourceKey, setCybersourceKey] = useState("");

  const handleGatewaySwitch = (gateway: "authorize" | "cybersource") => {
    if (activeGateway === gateway) {
      toast.error(`${gateway === "authorize" ? "Authorize.net" : "CyberSource"} is already active`);
      return;
    }
    setActiveGateway(gateway);
    toast.success(`Switched to ${gateway === "authorize" ? "Authorize.net" : "CyberSource"}`);
  };

  const handleQuickBooksConnect = () => {
    if (quickbooksConnected) {
      setQuickbooksConnected(false);
      toast.success("Disconnected from QuickBooks");
    } else {
      // OAuth flow would happen here
      toast.success("Connecting to QuickBooks...");
      setTimeout(() => {
        setQuickbooksConnected(true);
        toast.success("Connected to QuickBooks successfully!");
      }, 1500);
    }
  };

  const handleXeroConnect = () => {
    if (xeroConnected) {
      setXeroConnected(false);
      toast.success("Disconnected from Xero");
    } else {
      // OAuth flow would happen here
      toast.success("Connecting to Xero...");
      setTimeout(() => {
        setXeroConnected(true);
        toast.success("Connected to Xero successfully!");
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect your payment gateways and accounting software</p>
      </motion.div>

      <Tabs defaultValue="payment-gateways" className="space-y-6">
        <TabsList className="bg-muted/50 border border-gray-800">
          <TabsTrigger value="payment-gateways" className="data-[state=active]:bg-indigo-600">
            Payment Gateways
          </TabsTrigger>
          <TabsTrigger value="accounting" className="data-[state=active]:bg-indigo-600">
            Accounting Software
          </TabsTrigger>
          <TabsTrigger value="sync-settings" className="data-[state=active]:bg-indigo-600">
            Sync Settings
          </TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="payment-gateways" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  Payment Gateway Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Only one payment gateway can be active at a time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Authorize.net */}
                <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          Authorize.net
                          {activeGateway === "authorize" && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                              Active
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Accept credit card payments</p>
                      </div>
                    </div>
                    <Button
                      variant={activeGateway === "authorize" ? "outline" : "default"}
                      onClick={() => handleGatewaySwitch("authorize")}
                      disabled={activeGateway === "authorize"}
                      className={activeGateway === "authorize" ? "border-green-600 text-green-400" : "bg-indigo-600 hover:bg-indigo-700"}
                    >
                      {activeGateway === "authorize" ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Active
                        </>
                      ) : (
                        "Set as Active"
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 pt-4 border-t border-gray-800">
                    <div className="space-y-2">
                      <Label htmlFor="authorize-api-login" className="text-foreground">API Login ID</Label>
                      <Input
                        id="authorize-api-login"
                        value={authorizeNetKey}
                        onChange={(e) => setAuthorizeNetKey(e.target.value)}
                        className="bg-muted/50 border-gray-800 text-white"
                        placeholder="Enter API Login ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorize-transaction-key" className="text-foreground">Transaction Key</Label>
                      <Input
                        id="authorize-transaction-key"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                        placeholder="Enter Transaction Key"
                        defaultValue="••••••••••••••••"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        Credentials verified
                      </div>
                      <Button variant="outline" size="sm" className="border-border text-gray-300 hover:bg-gray-800">
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </div>

                {/* CyberSource */}
                <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/30 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          CyberSource
                          {activeGateway === "cybersource" && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                              Active
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">Enterprise payment processing</p>
                      </div>
                    </div>
                    <Button
                      variant={activeGateway === "cybersource" ? "outline" : "default"}
                      onClick={() => handleGatewaySwitch("cybersource")}
                      disabled={activeGateway === "cybersource"}
                      className={activeGateway === "cybersource" ? "border-green-600 text-green-400" : "bg-indigo-600 hover:bg-indigo-700"}
                    >
                      {activeGateway === "cybersource" ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Active
                        </>
                      ) : (
                        "Set as Active"
                      )}
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 pt-4 border-t border-gray-800">
                    <div className="space-y-2">
                      <Label htmlFor="cybersource-merchant-id" className="text-foreground">Merchant ID</Label>
                      <Input
                        id="cybersource-merchant-id"
                        value={cybersourceKey}
                        onChange={(e) => setCybersourceKey(e.target.value)}
                        className="bg-muted/50 border-gray-800 text-white"
                        placeholder="Enter Merchant ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cybersource-api-key" className="text-foreground">API Key</Label>
                      <Input
                        id="cybersource-api-key"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                        placeholder="Enter API Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cybersource-secret" className="text-foreground">Shared Secret</Label>
                      <Input
                        id="cybersource-secret"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                        placeholder="Enter Shared Secret"
                      />
                    </div>
                    {!cybersourceKey && (
                      <div className="flex items-center gap-2 text-sm text-orange-400">
                        <AlertCircle className="h-4 w-4" />
                        Configuration incomplete
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Accounting Software Tab */}
        <TabsContent value="accounting" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* QuickBooks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border bg-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">QuickBooks</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {quickbooksConnected ? "Connected" : "Not connected"}
                        </CardDescription>
                      </div>
                    </div>
                    {quickbooksConnected && (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sync your invoices, bills, and vendors with QuickBooks Online.
                  </p>
                  {quickbooksConnected && (
                    <div className="p-3 rounded-lg bg-gray-900/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="text-foreground">Acme Corporation</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="text-foreground">2 hours ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickBooksConnect}
                      className={quickbooksConnected 
                        ? "flex-1 bg-gray-800 hover:bg-gray-700 text-white" 
                        : "flex-1 bg-green-600 hover:bg-green-700 text-white"
                      }
                    >
                      {quickbooksConnected ? "Disconnect" : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect with OAuth
                        </>
                      )}
                    </Button>
                    {quickbooksConnected && (
                      <Button variant="outline" className="border-border text-gray-300 hover:bg-gray-800">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Xero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-border bg-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Xero</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {xeroConnected ? "Connected" : "Not connected"}
                        </CardDescription>
                      </div>
                    </div>
                    {xeroConnected && (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Integrate with Xero for seamless accounting synchronization.
                  </p>
                  {xeroConnected && (
                    <div className="p-3 rounded-lg bg-gray-900/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="text-foreground">Acme Ltd</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="text-foreground">30 minutes ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleXeroConnect}
                      className={xeroConnected 
                        ? "flex-1 bg-gray-800 hover:bg-gray-700 text-white" 
                        : "flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      {xeroConnected ? "Disconnect" : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect with OAuth
                        </>
                      )}
                    </Button>
                    {xeroConnected && (
                      <Button variant="outline" className="border-border text-gray-300 hover:bg-gray-800">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Sync Settings Tab */}
        <TabsContent value="sync-settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Synchronization Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure how transactions sync between your payment gateway and accounting software
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Sync */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="space-y-1">
                    <h4 className="text-white font-medium">Automatic Synchronization</h4>
                    <p className="text-sm text-muted-foreground">Sync transactions automatically every hour</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Sync Direction */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Sync Direction</h4>
                  <div className="grid gap-3">
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-800 bg-gray-900/30 cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <input type="radio" name="sync-direction" defaultChecked className="text-indigo-600" />
                      <div>
                        <p className="text-white font-medium">Two-way Sync</p>
                        <p className="text-sm text-muted-foreground">Sync data in both directions</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-800 bg-gray-900/30 cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <input type="radio" name="sync-direction" className="text-indigo-600" />
                      <div>
                        <p className="text-white font-medium">To Accounting Only</p>
                        <p className="text-sm text-muted-foreground">Push data from BillFlow to accounting software</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-800 bg-gray-900/30 cursor-pointer hover:bg-gray-800/50 transition-colors">
                      <input type="radio" name="sync-direction" className="text-indigo-600" />
                      <div>
                        <p className="text-white font-medium">From Accounting Only</p>
                        <p className="text-sm text-muted-foreground">Pull data from accounting software to BillFlow</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Data to Sync */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Data to Synchronize</h4>
                  <div className="space-y-3">
                    {["Invoices", "Bills", "Vendors", "Customers", "Payments"].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                        <span className="text-foreground">{item}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Sync Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
