'use client'

import { FC, SVGProps } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as heroIcons from '@heroicons/react/24/outline'

interface IconRendererProps {
  icon: string | null | undefined
  className?: string
}

export default function IconRenderer({ icon, className = "w-4 h-4" }: IconRendererProps) {
  if (!icon) {
    return null;
  }

  if (icon.startsWith('fa-solid')) {
    const iconName = icon.replace('fa-solid fa-', '');
    const solidIcon = (solidIcons as unknown as { [key: string]: IconDefinition })[iconName];
    if (solidIcon) {
      return <FontAwesomeIcon icon={solidIcon} className={className} />;
    }
  } else if (icon.startsWith('hero-outline')) {
    const iconName = icon.replace('hero-outline-', '');
    const HeroIcon = (heroIcons as unknown as { [key: string]: FC<SVGProps<SVGSVGElement>> })[iconName];
    if (HeroIcon) {
      return <HeroIcon className={className} />;
    }
  }

  return null;
}