import { useState, useRef, useEffect } from 'react'
import { Mail, MessageSquare, Phone, MessageCircle, Instagram, Facebook, ChevronDown } from 'lucide-react'

interface PlatformSelectProps {
  value: string
  onChange: (value: string) => void
}

const platforms = [
  { value: 'all', label: 'All Platforms', icon: null },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'live-chat', label: 'Live Chat', icon: MessageSquare },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
]

export default function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPlatform = platforms.find(p => p.value === value) || platforms[0]
  const Icon = selectedPlatform.icon

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span>{selectedPlatform.label}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {platforms.map((platform) => {
            const PlatformIcon = platform.icon
            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => {
                  onChange(platform.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  platform.value === value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                {PlatformIcon && <PlatformIcon className="w-4 h-4" />}
                <span>{platform.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

