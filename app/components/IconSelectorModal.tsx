'use client'

import { useState, FC, SVGProps } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as heroIcons from '@heroicons/react/24/outline'

interface IconSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectIcon: (icon: string) => void
}

export default function IconSelectorModal({ isOpen, onClose, onSelectIcon }: IconSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const faIcons = Object.keys(solidIcons).map(iconName => `fa-solid fa-${iconName}`)
  const hIcons = Object.keys(heroIcons).map(iconName => `hero-outline-${iconName}`)

  const icons = [...faIcons, ...hIcons];

  const filteredIcons = icons.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) {
    return null
  }

  const renderIcon = (icon: string) => {
    if (icon.startsWith('fa-solid')) {
      const iconName = icon.replace('fa-solid fa-', '');
      const solidIcon = (solidIcons as unknown as { [key: string]: IconDefinition })[iconName];
      if (solidIcon) {
        return <FontAwesomeIcon icon={solidIcon} className="w-6 h-6 text-white" />;
      }
    } else if (icon.startsWith('hero-outline')) {
      const iconName = icon.replace('hero-outline-', '');
      const HeroIcon = (heroIcons as unknown as { [key: string]: FC<SVGProps<SVGSVGElement>> })[iconName];
      if (HeroIcon) {
        return <HeroIcon className="w-6 h-6 text-white" />;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="p-8 rounded-lg shadow-2xl w-11/12 max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #E8000A' }}>
        <h2 className="text-xl font-bold mb-4 text-white">Select Icon</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#E8000A]"
            style={{ backgroundColor: '#36453F' }}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-60">
          {filteredIcons.map((icon) => (
            <div
              key={icon}
              className="p-4 flex items-center justify-center rounded-lg cursor-pointer hover:bg-[#36453F]"
              onClick={() => onSelectIcon(icon)}
            >
              {renderIcon(icon)}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#36453F', transition: 'background-color 0.3s ease-in-out' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
