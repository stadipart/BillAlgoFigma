import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { AlertCircle, Building, Users, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../../hooks/use-auth';

const merchantRegistrationSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  accountSlug: z.string()
    .min(3, 'Account slug must be at least 3 characters')
    .max(30, 'Account slug must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Account slug can only contain lowercase letters, numbers, and hyphens'),
  
  // Admin User Information
  adminName: z.string().min(2, 'Name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  
  // Business Details
  businessType: z.string().min(1, 'Please select a business type'),
  currency: z.string().default('USD'),
  timezone: z.string().default('UTC'),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type MerchantRegistrationForm = z.infer<typeof merchantRegistrationSchema>;

interface MerchantRegistrationFlowProps {
  onSuccess?: (merchantId: string) => void;
}

export default function MerchantRegistrationFlow({ onSuccess }: MerchantRegistrationFlowProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  
  const form = useForm<any>({
    resolver: zodResolver(merchantRegistrationSchema),
    defaultValues: {
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      businessType: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Create user account with merchant info
      const result = await signUp({
        email: data.adminEmail,
        password: data.adminPassword,
        displayName: data.adminName,
        merchantInfo: {
          companyName: data.companyName,
          firstName: data.adminName.split(' ')[0] || data.adminName,
          lastName: data.adminName.split(' ').slice(1).join(' ') || ''
        }
      });

      if (!result || !result.user) {
        throw new Error('Failed to create user account');
      }

      // The signUp function now handles all merchant account creation
      // Just need to update with additional info like accountSlug
      const { data: merchantAccounts } = await supabase
        .from('merchant_accounts')
        .select('*')
        .eq('owner_user_id', result.user.id)
        .maybeSingle();

      if (merchantAccounts) {
        // Update merchant account with custom slug if different
        await supabase
          .from('merchant_accounts')
          .update({
            account_slug: data.accountSlug,
            default_currency: data.currency,
            timezone: data.timezone
          })
          .eq('id', merchantAccounts.id);

        onSuccess?.(merchantAccounts.id);
      } else {
        onSuccess?.(result.merchantAccount?.id);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (slug.length < 3) return;
    
    try {
      const { data: existing } = await supabase
        .from('merchant_accounts')
        .select('id')
        .eq('account_slug', slug)
        .limit(1);
      
      if (existing && existing.length > 0) {
        form.setError('accountSlug', { message: 'This account slug is already taken' });
      } else {
        form.clearErrors('accountSlug');
      }
    } catch (err) {
      console.error('Slug check error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Create Your Merchant Account
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Set up your business account to start managing invoices and payments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <Building className="h-5 w-5" />
                Company Information
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...form.register('companyName')}
                    placeholder="Acme Corporation"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="accountSlug">Account URL *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      https://
                    </span>
                    <Input
                      id="accountSlug"
                      {...form.register('accountSlug')}
                      placeholder="acme-corp"
                      className="rounded-l-none"
                      onBlur={(e) => checkSlugAvailability(e.target.value)}
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                      .billpay.com
                    </span>
                  </div>
                  {form.formState.errors.accountSlug && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.accountSlug.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <select
                    id="businessType"
                    {...form.register('businessType')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="nonprofit">Non-Profit</option>
                    <option value="other">Other</option>
                  </select>
                  {form.formState.errors.businessType && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.businessType.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    {...form.register('currency')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Admin User Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <Shield className="h-5 w-5" />
                Administrator Account
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminName">Your Full Name *</Label>
                  <Input
                    id="adminName"
                    {...form.register('adminName')}
                    placeholder="John Doe"
                  />
                  {form.formState.errors.adminName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.adminName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="adminEmail">Email Address *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    {...form.register('adminEmail')}
                    placeholder="john@acme-corp.com"
                  />
                  {form.formState.errors.adminEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.adminEmail.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminPassword">Password *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    {...form.register('adminPassword')}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.adminPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.adminPassword.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register('confirmPassword')}
                    placeholder="••••••••"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Merchant Account'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { type MerchantRegistrationForm };