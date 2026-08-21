import { api } from "@/lib/axios"
import type { AuthResponse, TUser } from "@/types/auth.types"
import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  SignInFormValues,
} from "@/schema/auth.schema"

export async function signIn(payload: SignInFormValues): Promise<AuthResponse> {
  const { data } = await api.post("/auth/sign-in", payload)
  return data
}

export async function getMe(): Promise<TUser> {
  const { data } = await api.get("/auth/me")
  return data
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await api.post("/auth/logout")
  return data
}

export async function changePassword(
  payload: ChangePasswordFormValues,
): Promise<{ message: string }> {
  const { data } = await api.patch("/auth/change-password", payload)
  return data
}

export async function forgotPassword(
  payload: ForgotPasswordFormValues,
): Promise<{ message: string }> {
  const { data } = await api.post("/auth/forgot-password", payload)
  return data
}

export async function resetPassword(payload: {
  token: string
  password: string
}): Promise<{ message: string }> {
  const { data } = await api.post("/auth/reset-password", payload)
  return data
}
