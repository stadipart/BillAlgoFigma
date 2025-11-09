import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type ViewMode = 'login' | 'signup';

export function EnhancedLoginForm() {
  const [mode, setMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp } = useAuth();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Too short', color: 'text-red-500' };
    let score = 0;
    score += Math.min(40, pwd.length * 4);
    let variations = 0;
    if (/[a-z]/.test(pwd)) variations += 1;
    if (/[A-Z]/.test(pwd)) variations += 1;
    if (/\d/.test(pwd)) variations += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) variations += 1;
    score += variations * 15;
    score = Math.min(100, score);
    const label = score < 40 ? 'Weak' : score < 70 ? 'Medium' : 'Strong';
    const color = score < 40 ? 'text-red-500' : score < 70 ? 'text-amber-500' : 'text-green-600';
    return { score, label, color };
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup' && !validateSignup()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          setErrors({ form: error.message });
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
          setErrors({ form: error.message });
        } else {
          toast.success('Account created successfully! Please sign in.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-2xl font-bold text-primary-foreground">BF</span>
          </div>
          <h1 className="text-3xl font-bold">BillFlow</h1>
          <p className="text-muted-foreground mt-2">Business Finance Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Get started with BillFlow today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.form}</AlertDescription>
                </Alert>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your full name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      clearError('displayName');
                    }}
                    className={errors.displayName ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-destructive">{errors.displayName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                  required
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a strong password' : '••••••••'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    required
                    disabled={loading}
                    minLength={mode === 'signup' ? 8 : 6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}

                {mode === 'signup' && password && (
                  <div className="space-y-2 pt-2">
                    {(() => {
                      const strength = getPasswordStrength(password);
                      return (
                        <>
                          <Progress value={strength.score} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-medium ${strength.color}`}>{strength.label}</span>
                            <span className="text-muted-foreground">{strength.score}%</span>
                          </div>
                        </>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground">
                      Must contain uppercase, lowercase, and number
                    </p>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError('confirmPassword');
                      }}
                      className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrors({});
                    }}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrors({});
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
}
