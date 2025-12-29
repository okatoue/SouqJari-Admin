export type AdminRole = 'super_admin' | 'admin' | 'moderator'

export type ModerationStatus = 'active' | 'warned' | 'suspended' | 'banned'

export type ListingModerationStatus = 'pending' | 'approved' | 'rejected' | 'removed'

export type ReportReason =
  | 'scam'
  | 'fraud'
  | 'fake_item'
  | 'offensive'
  | 'spam'
  | 'harassment'
  | 'prohibited_item'
  | 'other'

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'

export type ReportResolution =
  | 'no_action'
  | 'warning_issued'
  | 'listing_removed'
  | 'user_suspended'
  | 'user_banned'

export type FeedbackType =
  | 'bug'
  | 'feature_request'
  | 'complaint'
  | 'praise'
  | 'question'
  | 'other'

export type FeedbackStatus = 'new' | 'read' | 'in_progress' | 'resolved' | 'closed'

export interface AdminUser {
  id: string
  role: AdminRole
  created_at: string
  created_by: string | null
  is_active: boolean
  // Joined from profiles
  profile?: {
    email: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface Profile {
  id: string
  email: string | null
  phone_number: string | null
  display_name: string | null
  avatar_url: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  moderation_status: ModerationStatus
  suspension_until: string | null
  ban_reason: string | null
  warning_count: number
}

export interface Listing {
  id: number
  user_id: string
  title: string
  category_id: number
  subcategory_id: number
  description: string
  price: number
  currency: string
  phone_number: string | null
  images: string[]
  status: 'active' | 'sold' | 'inactive'
  location: string
  location_lat: number | null
  location_lon: number | null
  created_at: string
  updated_at: string
  moderation_status: ListingModerationStatus
  removal_reason: string | null
  removed_by: string | null
  removed_at: string | null
  // Joined
  seller?: Profile
}

export interface Report {
  id: string
  reporter_id: string
  reported_listing_id: number | null
  reported_user_id: string | null
  reason: ReportReason
  description: string | null
  status: ReportStatus
  resolution: ReportResolution | null
  resolved_by: string | null
  resolved_at: string | null
  admin_notes: string | null
  created_at: string
  // Joined
  reporter?: Profile
  reported_listing?: Listing
  reported_user?: Profile
}

export interface UserFeedback {
  id: string
  user_id: string | null
  type: FeedbackType
  subject: string
  message: string
  app_version: string | null
  device_info: Record<string, unknown> | null
  screenshot_urls: string[] | null
  status: FeedbackStatus
  assigned_to: string | null
  admin_response: string | null
  responded_at: string | null
  created_at: string
  // Joined
  user?: Profile
  assignee?: AdminUser
}

export interface AuditLogEntry {
  id: string
  admin_id: string
  action: string
  target_type: 'user' | 'listing' | 'report' | 'feedback'
  target_id: string
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  // Joined
  admin?: AdminUser
}

// Permission types
export type Permission =
  | 'view_reports'
  | 'dismiss_reports'
  | 'warn_users'
  | 'remove_listings'
  | 'suspend_users'
  | 'ban_users'
  | 'manage_admins'
  | 'view_audit_log'
  | 'system_settings'

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'view_reports',
    'dismiss_reports',
    'warn_users',
    'remove_listings',
    'suspend_users',
    'ban_users',
    'manage_admins',
    'view_audit_log',
    'system_settings',
  ],
  admin: [
    'view_reports',
    'dismiss_reports',
    'warn_users',
    'remove_listings',
    'suspend_users',
    'ban_users',
    'view_audit_log',
  ],
  moderator: [
    'view_reports',
    'dismiss_reports',
    'warn_users',
    'remove_listings',
  ],
}
