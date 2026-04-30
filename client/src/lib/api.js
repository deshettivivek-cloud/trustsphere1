import axios from 'axios'
import { supabase } from './supabase'
import { API_BASE_URL } from './capacitor'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export default api