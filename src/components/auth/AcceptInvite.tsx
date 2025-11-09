import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { JSON_POST } from '@/lib/http'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid invitation link')
      navigate('/')
    }
  }, [token, email, navigate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token || !email) {
      return
    }

    setLoading(true)

    try {
      const FN_BASE = `https://${import.meta.env.VITE_SUPABASE_URL!.replace('https://','').split('.')[0]}.functions.supabase.co`
      const result = await JSON_POST(`${FN_BASE}/user-invitation?action=accept-invite`, {
        token,
        email,
        userData: {
          displayName: formData.displayName,
          password: formData.password
        }
      })

      toast.success('Account created successfully! Signing you in...')
      
      // Automatically sign in the user
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password
        })

        if (signInError) throw signInError

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        navigate('/dashboard')
        toast.success('Welcome to Bill Algo!')
      } catch (signInError) {
        console.error('Auto sign-in failed:', signInError)
        toast.success('Account created successfully! Please sign in.')
        navigate('/')
      }

    } catch (error) {
      console.error('Failed to accept invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Alert className="max-w-md" variant="destructive">
          <AlertDescription>
            Invalid invitation link. Please check your email for the correct link.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Accept Invitation</CardTitle>
          <p className="text-muted-foreground">
            Complete your account setup to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your full name"
                className={errors.displayName ? 'border-red-500' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-red-600 mt-1">{errors.displayName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transform transition duration-200 ease-in-out hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className={`w-4 h-4 transform transition duration-200 ${showPassword ? 'rotate-180' : 'rotate-0'}`} />
                  ) : (
                    <Eye className={`w-4 h-4 transform transition duration-200 ${showPassword ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
