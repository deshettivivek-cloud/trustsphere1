// src/components/PlaceAutocomplete.jsx
// Debounced place search using Nominatim (free, no API key).
// Shows a dropdown of suggestions as the user types.

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'

export default function PlaceAutocomplete({
  value,
  onChange,          // (text) => void — called on every keystroke
  onSelect,          // ({ display_name, lat, lng, city }) => void — called when user selects a suggestion
  placeholder = 'Search a place...',
  className = '',
  countryCode = 'in', // restrict to India by default
}) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced search
  const handleInput = (text) => {
    onChange(text)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!text.trim() || text.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: text.trim(),
          format: 'json',
          addressdetails: '1',
          limit: '6',
        })
        if (countryCode) params.set('countrycodes', countryCode)

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
        const data = await res.json()

        const results = data.map((item) => {
          const addr = item.address || {}
          const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || ''
          return {
            display_name: item.display_name,
            short_name: city || item.display_name?.split(',')[0] || '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            city,
            type: item.type,
          }
        })

        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  const handleSelect = (suggestion) => {
    setShowDropdown(false)
    setSuggestions([])
    if (onSelect) onSelect(suggestion)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
          placeholder={placeholder}
          className={className}
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 animate-spin" />
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={() => { onChange(''); setSuggestions([]); setShowDropdown(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition flex items-start gap-2.5 cursor-pointer border-b border-white/5 last:border-0"
            >
              <MapPin size={13} className="text-green-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{s.short_name || s.display_name?.split(',')[0]}</p>
                <p className="text-slate-500 text-[10px] truncate">{s.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
