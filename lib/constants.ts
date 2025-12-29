export const REPORT_REASONS = {
  scam: { label: 'Scam/Fraud', description: 'Attempting to deceive or defraud' },
  fraud: { label: 'Fraud', description: 'Fraudulent activity' },
  fake_item: { label: 'Fake/Misrepresented Item', description: 'Item not as described' },
  offensive: { label: 'Offensive Content', description: 'Inappropriate or offensive' },
  spam: { label: 'Spam', description: 'Unsolicited or repetitive content' },
  harassment: { label: 'Harassment', description: 'Harassing or threatening behavior' },
  prohibited_item: { label: 'Prohibited Item', description: 'Item not allowed on platform' },
  other: { label: 'Other', description: 'Other violation' },
} as const

export const FEEDBACK_TYPES = {
  bug: { label: 'Bug Report', icon: 'Bug' },
  feature_request: { label: 'Feature Request', icon: 'Lightbulb' },
  complaint: { label: 'Complaint', icon: 'AlertCircle' },
  praise: { label: 'Praise', icon: 'ThumbsUp' },
  question: { label: 'Question', icon: 'HelpCircle' },
  other: { label: 'Other', icon: 'MoreHorizontal' },
} as const

export const CATEGORIES = [
  { id: 1, name: 'Buy & Sell', icon: '🛍️' },
  { id: 2, name: 'Cars', icon: '🚗' },
  { id: 3, name: 'Real Estate', icon: '🏠' },
  { id: 4, name: 'Jobs', icon: '💼' },
  { id: 5, name: 'Services', icon: '🛠️' },
  { id: 6, name: 'Pets', icon: '🐾' },
] as const

// Full subcategories list from categories.json
export const SUBCATEGORIES: Record<number, { id: number; name: string }[]> = {
  1: [ // Buy & Sell
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Furniture' },
    { id: 3, name: 'Clothing' },
    { id: 4, name: 'Books' },
    { id: 5, name: 'Phones' },
    { id: 6, name: 'Computers' },
    { id: 7, name: 'Home Appliances' },
    { id: 8, name: 'Toys & Games' },
    { id: 9, name: 'Sports Equipment' },
    { id: 10, name: 'Other' },
  ],
  2: [ // Cars
    { id: 11, name: 'Cars & Trucks' },
    { id: 12, name: 'Motorcycles' },
    { id: 13, name: 'Vehicle Parts' },
    { id: 14, name: 'Other' },
  ],
  3: [ // Real Estate
    { id: 15, name: 'For Rent' },
    { id: 16, name: 'For Sale' },
  ],
  4: [ // Jobs
    { id: 17, name: 'Accounting' },
    { id: 18, name: 'Customer Service' },
    { id: 19, name: 'Healthcare' },
    { id: 20, name: 'Sales' },
    { id: 21, name: 'IT & Programming' },
    { id: 22, name: 'Other' },
  ],
  5: [ // Services
    { id: 23, name: 'Home Maintenance' },
    { id: 24, name: 'Tutoring' },
    { id: 25, name: 'Cleaning' },
    { id: 26, name: 'Moving' },
    { id: 27, name: 'Other' },
  ],
  6: [ // Pets
    { id: 28, name: 'Cats' },
    { id: 29, name: 'Dogs' },
    { id: 30, name: 'Birds' },
    { id: 31, name: 'Other' },
  ],
} as const

export const MODERATION_STATUS_LABELS = {
  active: { label: 'Active', color: 'green' },
  warned: { label: 'Warned', color: 'yellow' },
  suspended: { label: 'Suspended', color: 'orange' },
  banned: { label: 'Banned', color: 'red' },
} as const

export const LISTING_STATUS_LABELS = {
  pending: { label: 'Pending Review', color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  removed: { label: 'Removed', color: 'gray' },
} as const

export const REPORT_STATUS_LABELS = {
  pending: { label: 'Pending', color: 'yellow' },
  under_review: { label: 'Under Review', color: 'blue' },
  resolved: { label: 'Resolved', color: 'green' },
  dismissed: { label: 'Dismissed', color: 'gray' },
} as const

export const FEEDBACK_STATUS_LABELS = {
  new: { label: 'New', color: 'blue' },
  read: { label: 'Read', color: 'gray' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  resolved: { label: 'Resolved', color: 'green' },
  closed: { label: 'Closed', color: 'gray' },
} as const

export const ADMIN_ROLE_LABELS = {
  super_admin: { label: 'Super Admin', color: 'purple' },
  admin: { label: 'Admin', color: 'blue' },
  moderator: { label: 'Moderator', color: 'green' },
} as const
