// src/components/MapplsProvider.jsx
// Loads the Mappls (MapmyIndia) SDK once at app level.
// Children use the `useMappls()` hook to check loading state and access the SDK.

import { createContext, useContext, useEffect, useState, useRef } from 'react'

const MapplsContext = createContext({ mapplsObject: null, isLoaded: false })

export const useMappls = () => useContext(MapplsContext)

export default function MapplsProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const mapplsRef = useRef(null)

  useEffect(() => {
    const key = import.meta.env.VITE_MAPPLS_API_KEY
    if (!key || key === 'YOUR_MAPPLS_API_KEY_HERE') {
      console.warn('[MapplsProvider] No API key set in VITE_MAPPLS_API_KEY')
      return
    }

    let cancelled = false

    const initMappls = async () => {
      try {
        const { mappls } = await import('mappls-web-maps')
        if (cancelled) return

        const mapplsClassObject = new mappls()
        mapplsClassObject.initialize(key, { map: true, layer: 'raster', version: '3.0' }, () => {
          if (!cancelled) {
            mapplsRef.current = mapplsClassObject
            setIsLoaded(true)
          }
        })
      } catch (err) {
        console.error('[MapplsProvider] Failed to load Mappls SDK:', err)
      }
    }

    initMappls()

    return () => { cancelled = true }
  }, [])

  return (
    <MapplsContext.Provider value={{ mapplsObject: mapplsRef.current, isLoaded }}>
      {children}
    </MapplsContext.Provider>
  )
}
