import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'

// Initialize native plugins when running in a Capacitor shell
const initCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Status Bar — blend with the app's dark theme
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setBackgroundColor({ color: '#0b1120' })
      await StatusBar.setStyle({ style: Style.Dark })

      // Splash Screen — hide after the app is rendered
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide()

      // Back‑button handler — navigate back or exit
      const { App: CapApp } = await import('@capacitor/app')
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        } else {
          CapApp.exitApp()
        }
      })
    } catch (err) {
      console.warn('[Capacitor] Plugin init error:', err)
    }
  }
}

// Boot the React app, then initialize native plugins
createRoot(document.getElementById('root')).render(<App />)
initCapacitor()