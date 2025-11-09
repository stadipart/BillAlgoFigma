import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Mail, Shield, Lock, Smartphone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { useMFA } from '@/hooks/use-mfa'
import { APP_VERSION, BUILD_STAMP } from '@/build-info'
import { MFAVerificationForm } from './MFAVerificationForm'; // New import

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot-password'
  redirectTo?: string
}

export function AuthPage({ initialMode = 'signin', redirectTo }: AuthPageProps) {
  const navigate = useNavigate()
  const { user, signUp, signIn, mfaRequired, setMfaRequired, signInWithMfa, pendingMfaChallenge } = useAuth()
  const { isTotpEnabled, enrollTotp, verifyTotp, refreshMfaFactors } = useMFA()

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'mfa-setup' | 'mfa-verify'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [mfaMethod, setMfaMethod] = useState<'totp'>('totp') // Default to totp, simplified
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    if (user && !mfaRequired && !pendingMfaChallenge) {
      navigate(redirectTo || '/dashboard')
    }
  }, [user, navigate, redirectTo, mfaRequired, pendingMfaChallenge])

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    setPasswordStrength(strength)
  }, [password])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { user: signedInUser, mfaRequired: isMfaRequired } = await signIn({ email, password });
      if (isMfaRequired) {
        setMode('mfa-verify');
        setSuccess('MFA required. Please enter your verification code.');
      } else if (signedInUser) {
        setSuccess('Successfully signed in! Redirecting...');
        navigate(redirectTo || '/dashboard');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.')
      setLoading(false)
      return
    }

    try {
      const newUser = await signUp({
        email,
        password,
        displayName: displayName || `${firstName} ${lastName}`,
        merchantInfo: {
          companyName,
          firstName,
          lastName
        }
      })
      
      if (!newUser) {
        throw new Error('Account creation failed - no user returned')
      }
      
      setSuccess('Account created successfully! Please check your email to confirm your account before signing in.')
      setLoading(false)
      setMode('signin') // Redirect to signin mode after successful signup
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Password reset instructions have been sent to your email.')
    } catch (err: any) {
      setError('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleMFASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mfaMethod === 'totp') {
        const { qrCode: newQrCode, secret: newSecret, requiresReauth } = await enrollTotp();
        if (requiresReauth) {
          setError('Please complete MFA on sign-in before enabling a new authenticator. Sign out and back in to continue.');
          return;
        }
        if (newQrCode && newSecret) {
          setQrCode(newQrCode);
          setTotpSecret(newSecret);
          setSuccess('Scan the QR code with your authenticator app and enter the code to verify.');
          // No need to change mode here, MFAVerificationForm will handle it
        } else {
          throw new Error('Failed to get QR code or secret for TOTP setup.');
        }
      } else {
        setError('Only TOTP MFA setup is supported at the moment.');
      }
    } catch (err: any) {
      setError(err.message || `Failed to set up ${mfaMethod} MFA.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerified = async () => {
    console.info('[AuthPage] handleMfaVerified triggered');
    const success = await signInWithMfa();
    console.info('[AuthPage] signInWithMfa result', { success });
    if (success) {
      setSuccess('MFA verified successfully! Redirecting...');
      setMfaRequired(false); // Clear MFA required state
      navigate(redirectTo || '/dashboard');
      return true;
    } else {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          console.warn('[AuthPage] signInWithMfa fallback succeeded via session inspection');
          setSuccess('MFA verified successfully! Redirecting...');
          setMfaRequired(false);
          navigate(redirectTo || '/dashboard');
          return true;
        }
      } catch (fallbackError) {
        console.error('[AuthPage] Unable to inspect session after signInWithMfa failure', fallbackError);
      }
      setError('Failed to complete login after MFA verification. Please try signing in again.');
      return false;
    }
  };

  const handleMfaCancel = () => {
    supabase.auth.signOut().catch(err => console.error('MFA cancel sign-out error:', err));
    setMfaRequired(false); // Clear MFA required state
    setMode('signin'); // Go back to sign-in form
    setError('MFA verification cancelled.');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 2) return 'bg-orange-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    if (passwordStrength <= 4) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="min-h-screen w-full bg-[#05080f] text-white font-inter flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#05080f]">
        <img 
          src="/images/Loginimage.png"
          alt="Secure Financial Management"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-black/60 to-transparent" />
        <div className="absolute top-10 left-12 flex items-center gap-3 z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-lg font-semibold">BA</div>
          <div className="text-2xl font-semibold text-white">BillAlgo</div>
        </div>
        <div className="relative z-10 flex flex-col justify-end p-16 space-y-6">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Secure Financial Management
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Streamline your business finances with our powerful invoicing and payment platform.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white text-[#0B0F1A] flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0D49FB]/10 text-[#0D49FB] flex items-center justify-center mx-auto text-xl font-semibold">
              BA
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#1b2233]">BillAlgo</h1>
              <p className="text-sm text-[#6B7280]">Secure Financial Management</p>
              <p className="text-xs text-[#9CA3AF] mt-2">Build {APP_VERSION} • {BUILD_STAMP}</p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="text-[#0B0F1A] justify-start hover:bg-[#eef0f6]" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

        <div className="space-y-6">
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (mode === 'signin') {
                    void handleSignIn(new Event('submit') as any)
                  } else if (mode === 'signup') {
                    void handleSignUp(new Event('submit') as any)
                  }
                }}
                disabled={loading}
              >
                Try again
              </Button>
            </div>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Auth Card */}
        <Card className="bg-white border border-[#E7E9EE] shadow-[0_20px_60px_rgba(15,23,42,0.12)] rounded-[30px] text-[#0B0F1A]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#0B0F1A]">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot-password' && 'Reset Password'}
              {mode === 'mfa-setup' && 'Setup Multi-Factor Authentication'}
              {mfaRequired && 'Verify Your Identity'}
            </CardTitle>
            <CardDescription className="text-[#6B7280] text-sm">
              {mode === 'signin' && 'Welcome back! Please sign in to your account.'}
              {mode === 'signup' && 'Create your BillAlgo account to get started.'}
              {mode === 'forgot-password' && 'Enter your email to receive reset instructions.'}
              {mode === 'mfa-setup' && 'Add an extra layer of security to your account.'}
              {mfaRequired && 'Enter the verification code we sent you.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={() => setMode('forgot-password')}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Separator />

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Don't have an account? </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={() => setMode('signup')}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password strength:</span>
                        <Badge variant={passwordStrength >= 3 ? 'default' : 'destructive'}>
                          {getPasswordStrengthText()}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <Separator />

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Already have an account? </span>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={() => setMode('signin')}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>

                <Separator />

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm"
                    onClick={() => setMode('signin')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )}

            {/* MFA Setup Form */}
            {mode === 'mfa-setup' && (
              <form onSubmit={handleMFASetup} className="space-y-4">
                <div className="text-center mb-4">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Set up your authenticator app for an extra layer of security.
                  </p>
                </div>

                <Tabs value={mfaMethod} onValueChange={(value) => setMfaMethod(value as 'totp')}>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="totp" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Authenticator App
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="totp">
                    <div className="text-center py-4">
                      {qrCode ? (
                        <div className="space-y-4">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}`} alt="QR Code" className="mx-auto w-48 h-48" />
                          <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
                          </p>
                          {totpSecret && (
                            <div className="space-y-2">
                              <Label htmlFor="totpSecret">Or enter code manually:</Label>
                              <Input
                                id="totpSecret"
                                type="text"
                                value={totpSecret}
                                readOnly
                                className="text-center font-mono"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Click "Setup Authenticator App" to generate QR code.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button type="submit" className="w-full" disabled={loading || qrCode === null}>
                  {loading ? 'Setting up...' : 'Setup Authenticator App'}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Skip for now
                  </Button>
                </div>
              </form>
            )}

            {/* MFA Verification Form */}
            {mfaRequired && (
              <MFAVerificationForm onVerified={handleMfaVerified} onCancel={handleMfaCancel} />
            )}
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
