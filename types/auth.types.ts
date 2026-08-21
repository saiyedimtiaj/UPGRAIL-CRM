

export interface TRole {
  id: number
  name: "OWNER" | "PARTNER" | "STAFF"
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
}

export interface AuthResponse {
  message: string
  access_token: string
  expiresInSeconds: number
  user: TUser
}
