"use client"

import { useMemo } from 'react'
import type { AdminRole, Permission } from '@/types'
import { ROLE_PERMISSIONS } from '@/types'

export function usePermissions(role: AdminRole | null) {
  const permissions = useMemo(() => {
    if (!role) return []
    return ROLE_PERMISSIONS[role] || []
  }, [role])

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      return permissions.includes(permission)
    }
  }, [permissions])

  const hasAnyPermission = useMemo(() => {
    return (...perms: Permission[]): boolean => {
      return perms.some(p => permissions.includes(p))
    }
  }, [permissions])

  const hasAllPermissions = useMemo(() => {
    return (...perms: Permission[]): boolean => {
      return perms.every(p => permissions.includes(p))
    }
  }, [permissions])

  // Specific permission checks
  const canViewReports = permissions.includes('view_reports')
  const canDismissReports = permissions.includes('dismiss_reports')
  const canWarnUsers = permissions.includes('warn_users')
  const canRemoveListings = permissions.includes('remove_listings')
  const canSuspendUsers = permissions.includes('suspend_users')
  const canBanUsers = permissions.includes('ban_users')
  const canManageAdmins = permissions.includes('manage_admins')
  const canViewAuditLog = permissions.includes('view_audit_log')
  const canAccessSystemSettings = permissions.includes('system_settings')

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Specific checks
    canViewReports,
    canDismissReports,
    canWarnUsers,
    canRemoveListings,
    canSuspendUsers,
    canBanUsers,
    canManageAdmins,
    canViewAuditLog,
    canAccessSystemSettings,
  }
}
