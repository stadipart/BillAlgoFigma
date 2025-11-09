import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Search,
  Plus,
  Package,
  Building2,
  Clock,
  Loader2,
} from "lucide-react";
import { itemService } from "../services/items";
import { vendorService } from "../services/vendors";
import { customerService } from "../services/customers";
import { invoiceService } from "../services/invoices";
import { billService } from "../services/bills";
import { Badge } from "./ui/badge";

interface BillFlowCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string) => void;
}

interface SearchResult {
  id: string;
  type: 'invoice' | 'bill' | 'vendor' | 'customer' | 'item';
  title: string;
  subtitle?: string;
  amount?: string;
  status?: string;
  icon: React.ReactNode;
}

// Simple fuzzy match - checks if all characters of search appear in order in the target
function fuzzyMatch(search: string, target: string): boolean {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact substring match
  if (targetLower.includes(searchLower)) {
    return true;
  }

  // Fuzzy match - all characters must appear in order
  let searchIndex = 0;
  for (let i = 0; i < targetLower.length && searchIndex < searchLower.length; i++) {
    if (targetLower[i] === searchLower[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === searchLower.length;
}

export function BillFlowCommandPalette({ open, onOpenChange, onNavigate }: BillFlowCommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('billflow-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches', e);
      }
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('billflow-recent-searches', JSON.stringify(updated));
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setError("");
      return;
    }

    console.log('═══════════════════════════════════════');
    console.log('🔍 SEARCH STARTED');
    console.log('Query:', query);
    console.log('Query length:', query.length);
    console.log('Time:', new Date().toLocaleTimeString());
    console.log('═══════════════════════════════════════');

    setIsSearching(true);
    setError("");
    const results: SearchResult[] = [];

    try {
      const searchLower = query.toLowerCase();

      // Search Items
      console.log('📦 Searching items...');
      try {
        const items = await itemService.getAll();
        console.log('📦 Total items in database:', items.length);

        if (items.length > 0) {
          console.log('📦 First 3 item names:', items.slice(0, 3).map(i => i.name));
        }

        const matchingItems = items
          .filter(item => {
            const nameMatch = fuzzyMatch(searchLower, item.name);
            const skuMatch = item.sku ? fuzzyMatch(searchLower, item.sku) : false;
            const categoryMatch = item.category ? fuzzyMatch(searchLower, item.category) : false;
            const matches = nameMatch || skuMatch || categoryMatch;

            if (matches) {
              console.log('   ✓ Match found:', item.name, '(name:', nameMatch, 'sku:', skuMatch, 'category:', categoryMatch, ')');
            }

            return matches;
          })
          .slice(0, 5)
          .map(item => ({
            id: item.id,
            type: 'item' as const,
            title: item.name,
            subtitle: item.sku || item.category || undefined,
            amount: `$${Number(item.unit_price).toFixed(2)}`,
            status: item.status,
            icon: <Package className="h-4 w-4 text-blue-500" />,
          }));

        console.log('✅ Matching items:', matchingItems.length);
        if (matchingItems.length > 0) {
          console.log('✅ Matched item names:', matchingItems.map(i => i.title));
        }
        results.push(...matchingItems);
      } catch (err) {
        console.error('❌ Error searching items:', err);
        console.error('❌ Error details:', JSON.stringify(err, null, 2));
      }

      // Search Vendors
      console.log('🏢 Searching vendors...');
      try {
        const vendors = await vendorService.getAll();
        console.log('🏢 Found vendors:', vendors.length);

        const matchingVendors = vendors
          .filter(vendor => {
            const nameMatch = fuzzyMatch(searchLower, vendor.name);
            const emailMatch = vendor.email ? fuzzyMatch(searchLower, vendor.email) : false;
            const contactMatch = vendor.contact_person ? fuzzyMatch(searchLower, vendor.contact_person) : false;
            return nameMatch || emailMatch || contactMatch;
          })
          .slice(0, 5)
          .map(vendor => ({
            id: vendor.id,
            type: 'vendor' as const,
            title: vendor.name,
            subtitle: vendor.email || vendor.contact_person || undefined,
            status: vendor.status,
            icon: <Building2 className="h-4 w-4 text-purple-500" />,
          }));

        console.log('✅ Matching vendors:', matchingVendors.length);
        results.push(...matchingVendors);
      } catch (err) {
        console.error('❌ Error searching vendors:', err);
      }

      // Search Customers
      console.log('👥 Searching customers...');
      try {
        const customers = await customerService.getAll();
        console.log('👥 Found customers:', customers.length);

        const matchingCustomers = customers
          .filter(customer => {
            const nameMatch = fuzzyMatch(searchLower, customer.name);
            const emailMatch = customer.email ? fuzzyMatch(searchLower, customer.email) : false;
            const contactMatch = customer.contact_person ? fuzzyMatch(searchLower, customer.contact_person) : false;
            return nameMatch || emailMatch || contactMatch;
          })
          .slice(0, 5)
          .map(customer => ({
            id: customer.id,
            type: 'customer' as const,
            title: customer.name,
            subtitle: customer.email || customer.contact_person || undefined,
            status: customer.status,
            icon: <Users className="h-4 w-4 text-green-500" />,
          }));

        console.log('✅ Matching customers:', matchingCustomers.length);
        results.push(...matchingCustomers);
      } catch (err) {
        console.error('❌ Error searching customers:', err);
      }

      // Search Invoices
      console.log('📄 Searching invoices...');
      try {
        const invoices = await invoiceService.getAll();
        console.log('📄 Found invoices:', invoices.length);

        const matchingInvoices = invoices
          .filter(invoice =>
            invoice.invoice_number && fuzzyMatch(searchLower, invoice.invoice_number)
          )
          .slice(0, 5)
          .map(invoice => ({
            id: invoice.id,
            type: 'invoice' as const,
            title: `Invoice ${invoice.invoice_number}`,
            subtitle: invoice.due_date ? `Due ${new Date(invoice.due_date).toLocaleDateString()}` : undefined,
            amount: `$${Number(invoice.total_amount).toFixed(2)}`,
            status: invoice.status,
            icon: <FileText className="h-4 w-4 text-orange-500" />,
          }));

        console.log('✅ Matching invoices:', matchingInvoices.length);
        results.push(...matchingInvoices);
      } catch (err) {
        console.error('❌ Error searching invoices:', err);
      }

      // Search Bills
      console.log('🧾 Searching bills...');
      try {
        const bills = await billService.getAll();
        console.log('🧾 Found bills:', bills.length);

        const matchingBills = bills
          .filter(bill =>
            bill.bill_number && fuzzyMatch(searchLower, bill.bill_number)
          )
          .slice(0, 5)
          .map(bill => ({
            id: bill.id,
            type: 'bill' as const,
            title: `Bill ${bill.bill_number}`,
            subtitle: bill.due_date ? `Due ${new Date(bill.due_date).toLocaleDateString()}` : undefined,
            amount: `$${Number(bill.total_amount).toFixed(2)}`,
            status: bill.status,
            icon: <Receipt className="h-4 w-4 text-red-500" />,
          }));

        console.log('✅ Matching bills:', matchingBills.length);
        results.push(...matchingBills);
      } catch (err) {
        console.error('❌ Error searching bills:', err);
      }

      console.log('═══════════════════════════════════════');
      console.log('🎯 SEARCH COMPLETE');
      console.log('Total results:', results.length);
      console.log('Result types:', results.map(r => r.type));
      console.log('═══════════════════════════════════════');

      setSearchResults(results);

      if (results.length === 0) {
        setError(`No results found for "${query}". Try checking your spelling or use fewer characters.`);
        console.log('⚠️ No results - showing error message to user');
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      // Reset when closing
      setSearchQuery("");
      setSearchResults([]);
      setError("");
      return;
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(result.title);

    // Navigate to appropriate page based on type
    switch (result.type) {
      case 'invoice':
        onNavigate('invoices');
        break;
      case 'bill':
        onNavigate('bills');
        break;
      case 'vendor':
        onNavigate('vendors');
        break;
      case 'customer':
        onNavigate('customers');
        break;
      case 'item':
        onNavigate('items');
        break;
    }

    onOpenChange(false);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      paid: 'default',
      pending: 'outline',
      overdue: 'destructive' as any,
      draft: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="ml-auto text-xs capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search everything... (try 'iphone', 'inv', or 'acme')"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Searching...</p>
          </div>
        ) : (
          <>
            {searchQuery.length < 2 ? (
              <>
                <CommandEmpty>Start typing to search across all records...</CommandEmpty>

                <CommandGroup heading="Quick Actions">
                  <CommandItem
                    onSelect={() => {
                      onNavigate("invoices");
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Create New Invoice</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("bills");
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Create New Bill</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("vendors");
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 text-green-500" />
                    <span>Add New Vendor</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("items");
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 text-orange-500" />
                    <span>Add New Item</span>
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                  <CommandItem
                    onSelect={() => {
                      onNavigate("dashboard");
                      onOpenChange(false);
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("invoices");
                      onOpenChange(false);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Invoices</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("bills");
                      onOpenChange(false);
                    }}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Bills</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("vendors");
                      onOpenChange(false);
                    }}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Vendors</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("customers");
                      onOpenChange(false);
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Customers</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("items");
                      onOpenChange(false);
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>Item Catalog</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("payments");
                      onOpenChange(false);
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payments</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("reports");
                      onOpenChange(false);
                    }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Reports</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      onNavigate("settings");
                      onOpenChange(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                </CommandGroup>

                {recentSearches.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => setSearchQuery(search)}
                        >
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            ) : (
              <>
                {error ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{error}</p>
                    <p className="text-xs text-muted-foreground">
                      Tip: The search supports fuzzy matching for typos!
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <CommandEmpty>
                    <div className="py-4">
                      <p className="mb-2">No results found for "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground">
                        Try using fewer characters or check the browser console for details
                      </p>
                    </div>
                  </CommandEmpty>
                ) : (
                  <>
                    {searchResults.filter(r => r.type === 'item').length > 0 && (
                      <CommandGroup heading={`Items (${searchResults.filter(r => r.type === 'item').length})`}>
                        {searchResults
                          .filter(r => r.type === 'item')
                          .map(result => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {result.icon}
                                <div className="ml-2 flex-1 min-w-0">
                                  <div className="font-medium truncate">{result.title}</div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                {result.amount && (
                                  <span className="text-sm font-medium">{result.amount}</span>
                                )}
                                {getStatusBadge(result.status)}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}

                    {searchResults.filter(r => r.type === 'vendor').length > 0 && (
                      <CommandGroup heading={`Vendors (${searchResults.filter(r => r.type === 'vendor').length})`}>
                        {searchResults
                          .filter(r => r.type === 'vendor')
                          .map(result => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {result.icon}
                                <div className="ml-2 flex-1 min-w-0">
                                  <div className="font-medium truncate">{result.title}</div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                  )}
                                </div>
                              </div>
                              {getStatusBadge(result.status)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}

                    {searchResults.filter(r => r.type === 'customer').length > 0 && (
                      <CommandGroup heading={`Customers (${searchResults.filter(r => r.type === 'customer').length})`}>
                        {searchResults
                          .filter(r => r.type === 'customer')
                          .map(result => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {result.icon}
                                <div className="ml-2 flex-1 min-w-0">
                                  <div className="font-medium truncate">{result.title}</div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                  )}
                                </div>
                              </div>
                              {getStatusBadge(result.status)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}

                    {searchResults.filter(r => r.type === 'invoice').length > 0 && (
                      <CommandGroup heading={`Invoices (${searchResults.filter(r => r.type === 'invoice').length})`}>
                        {searchResults
                          .filter(r => r.type === 'invoice')
                          .map(result => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {result.icon}
                                <div className="ml-2 flex-1 min-w-0">
                                  <div className="font-medium truncate">{result.title}</div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                {result.amount && (
                                  <span className="text-sm font-medium">{result.amount}</span>
                                )}
                                {getStatusBadge(result.status)}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}

                    {searchResults.filter(r => r.type === 'bill').length > 0 && (
                      <CommandGroup heading={`Bills (${searchResults.filter(r => r.type === 'bill').length})`}>
                        {searchResults
                          .filter(r => r.type === 'bill')
                          .map(result => (
                            <CommandItem
                              key={result.id}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                {result.icon}
                                <div className="ml-2 flex-1 min-w-0">
                                  <div className="font-medium truncate">{result.title}</div>
                                  {result.subtitle && (
                                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                {result.amount && (
                                  <span className="text-sm font-medium">{result.amount}</span>
                                )}
                                {getStatusBadge(result.status)}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
