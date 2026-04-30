// Capacitor platform detection & API URL helper
import { Capacitor } from '@capacitor/core'

/**
 * Returns true when running inside a native Capacitor shell (Android / iOS).
 */
export const isNative = () => Capacitor.isNativePlatform()

/**
 * Returns the correct API base URL depending on the runtime environment.
 *
 * - In the browser (dev):  http://localhost:3001
 * - In Android emulator:   http://10.0.2.2:3001  (Android's alias for host loopback)
 * - On a real device:      Uses VITE_API_URL env var (set this to your LAN IP or deployed URL)
 */
export const getApiUrl = () => {
  // If the env var is set, always prefer it (works for deployed servers too)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  if (isNative()) {
    const platform = Capacitor.getPlatform()
    if (platform === 'android') {
      // Android emulator can reach host machine via 10.0.2.2
      return 'http://10.0.2.2:3001'
    }
    // iOS simulator uses localhost just fine
    return 'http://localhost:3001'
  }

  // Browser fallback
  return 'http://localhost:3001'
}

export const API_BASE_URL = getApiUrl()
