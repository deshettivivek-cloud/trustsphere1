// src/components/MapplsMap.jsx
// Reusable Mappls map component with optional marker.
// Supports click-to-move marker for location adjustment.

import { useEffect, useRef, useMemo } from 'react'
import { useMappls } from './MapplsProvider'
import { Loader2 } from 'lucide-react'

let mapIdCounter = 0

export default function MapplsMap({
  center,             // { lat, lng }
  zoom = 14,
  markerPosition,     // { lat, lng } — if provided, shows a marker
  draggable = false,  // if true, user can click map to move marker
  onMarkerDragEnd,    // callback({ lat, lng }) when marker moves
  style,              // container style
  interactive = true, // false = static preview (no pan/zoom)
}) {
  const { mapplsObject, isLoaded } = useMappls()
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const mapId = useMemo(() => `mappls-map-${++mapIdCounter}`, [])

  useEffect(() => {
    if (!isLoaded || !mapplsObject || !center) return

    // Small delay to ensure the DOM div is painted
    const timer = setTimeout(() => {
      try {
        const mapEl = document.getElementById(mapId)
        if (!mapEl) return

        const map = mapplsObject.Map({
          id: mapId,
          properties: {
            center: [center.lat, center.lng],
            zoom,
            scroll_wheel_zoom_enable: interactive,
            traffic: false,
          },
        })

        mapRef.current = map

        map.addListener('load', () => {
          // Add marker
          if (markerPosition) {
            try {
              const marker = mapplsObject.marker({
                map,
                position: { lat: markerPosition.lat, lng: markerPosition.lng },
                draggable: !!draggable,
              })
              markerRef.current = marker

              // If draggable, listen for dragend
              if (draggable && onMarkerDragEnd) {
                marker.addListener('dragend', (e) => {
                  try {
                    const pos = e.target.getPosition()
                    onMarkerDragEnd({ lat: pos.lat, lng: pos.lng })
                  } catch {
                    // Fallback: try lngLat
                    if (e.lngLat) {
                      onMarkerDragEnd({ lat: e.lngLat.lat, lng: e.lngLat.lng })
                    }
                  }
                })
              }
            } catch (err) {
              console.error('MapplsMap marker error:', err)
            }
          }

          // Also allow click-to-move if draggable
          if (draggable && onMarkerDragEnd) {
            map.addListener('click', (e) => {
              if (e.lngLat) {
                const lat = e.lngLat.lat
                const lng = e.lngLat.lng

                // Move existing marker or create new
                if (markerRef.current?.setPosition) {
                  markerRef.current.setPosition({ lat, lng })
                } else {
                  try {
                    const marker = mapplsObject.marker({
                      map,
                      position: { lat, lng },
                      draggable: true,
                    })
                    markerRef.current = marker
                  } catch { /* ignore */ }
                }

                onMarkerDragEnd({ lat, lng })
              }
            })
          }
        })
      } catch (err) {
        console.error('MapplsMap init error:', err)
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      try {
        if (markerRef.current?.remove) markerRef.current.remove()
      } catch { /* ignore */ }
      try {
        if (mapRef.current?.remove) mapRef.current.remove()
      } catch { /* ignore */ }
      markerRef.current = null
      mapRef.current = null
    }
  }, [isLoaded, mapplsObject, center?.lat, center?.lng, markerPosition?.lat, markerPosition?.lng])

  const containerStyle = style || { width: '100%', height: '160px', borderRadius: '12px' }

  if (!isLoaded) {
    return (
      <div
        style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', borderRadius: '12px' }}
      >
        <Loader2 size={20} className="text-slate-500 animate-spin" />
      </div>
    )
  }

  return <div id={mapId} style={containerStyle} />
}
