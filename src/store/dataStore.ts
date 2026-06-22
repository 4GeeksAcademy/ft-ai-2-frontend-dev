import { create } from 'zustand'
import type { IDataStore, IUser } from '../types'

const HTTPBIN_URL = 'https://httpbin.io/post'
const TOKEN_TTL_MS = 60 * 60 * 1000

interface AppStore extends IDataStore {
  user: IUser | null
  isLoading: boolean
  error: string | null
  login: (user: IUser) => Promise<boolean>
  logout: () => void
  isAuthenticated: () => boolean
}

export const useDataStore = create<AppStore>((set, get) => ({
  token: null,
  token_expiry: null,
  user: null,
  isLoading: false,
  error: null,

  login: async (user) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(HTTPBIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
          email: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const token = crypto.randomUUID()
      const token_expiry = new Date(Date.now() + TOKEN_TTL_MS)

      set({
        token,
        token_expiry,
        user,
        isLoading: false,
      })

      return true
    } catch {
      set({ isLoading: false, error: 'Login failed. Please try again.' })
      return false
    }
  },

  logout: () => {
    set({ token: null, token_expiry: null, user: null, error: null })
  },

  isAuthenticated: () => {
    const { token, token_expiry } = get()
    if (!token || !token_expiry) return false
    return new Date() < token_expiry
  },
}))
