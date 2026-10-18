import { create } from 'zustand'

type User = { id: string; email: string; name: string; role: string }
type AuthState = {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  init: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('invictus_token', token)
    localStorage.setItem('invictus_user', JSON.stringify(user))
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('invictus_token')
    localStorage.removeItem('invictus_user')
    set({ user: null, token: null })
  },
  init: () => {
    const t = localStorage.getItem('invictus_token')
    const u = localStorage.getItem('invictus_user')
    if (t && u) set({ token: t, user: JSON.parse(u) })
  }
}))
