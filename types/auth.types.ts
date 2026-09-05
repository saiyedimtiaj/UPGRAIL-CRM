

export interface TRole {
  id: number
  /** Roles are admin-created now, so this is any stable identifier, not a
   *  fixed union. Code should check permissions, never a role name. */
  name: string
  label: string
}

export interface TUser {
  id: number
  name: string
  email: string
  contact: string | null
  avatar: string | null
  tag: string | null
  canViewProfit: boolean
  role: TRole
  /** Permission keys this user's role holds. Empty for an owner. */
  permissions: string[]
  /** Owners hold every permission implicitly, including future ones. */
  isOwner: boolean
}

export interface AuthResponse {
  message: string
  access_token: string
  expiresInSeconds: number
  user: TUser
}
