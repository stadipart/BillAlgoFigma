import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface PageGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

const ROLE_HIERARCHY = {
  admin: 4,
  manager: 3,
  accountant: 2,
  employee: 1
}


export default function PageGuard({ 
  children, 
  requiredRole, 
  requiredPermissions = [],
  fallback 
}: PageGuardProps) {
  const { user, isLoading, hasPermission } = useAuth()

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Checking permissions..." />
      </div>
    )
  }

  if (!user) {
    return (
      <Alert className="m-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to access this page.
        </AlertDescription>
      </Alert>
    )
  }

  // Check if user is active
  const isActiveVal = (user as any)?.isActive;
  if (isActiveVal !== undefined && Number(isActiveVal) === 0) {
    return (
      <Alert className="m-6" variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your account is not activated. Please contact an administrator.
        </AlertDescription>
      </Alert>
    )
  }

  const userRole = user.role || 'employee'

  // Admin bypass - admins can access everything
  if (userRole === 'admin') {
    console.log('[PageGuard] Admin user detected - granting access')
    return <>{children}</>
  }

  // Check role requirement
  if (requiredRole) {
    const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0
    
    console.log('[PageGuard] Role check', { userRole, userRoleLevel, requiredRole, requiredRoleLevel })
    
    if (userRoleLevel < requiredRoleLevel) {
      return fallback || (
        <Alert className="m-6" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      )
    }
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    console.log('[PageGuard] Permission check', { requiredPermissions, userRole })
    
    const hasAll = requiredPermissions.every((permission) => {
      const [module, action] = permission.split('.')
      const result = hasPermission(module, action)
      console.log('[PageGuard] Checking permission', { permission, module, action, result })
      return result
    })

    if (!hasAll) {
      console.warn('[PageGuard] Permission denied', { requiredPermissions })
      return fallback || (
        <Alert className="m-6" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required permissions: {requiredPermissions.join(', ')}
          </AlertDescription>
        </Alert>
      )
    }
  }

  console.log('[PageGuard] Access granted')
  return <>{children}</>
}