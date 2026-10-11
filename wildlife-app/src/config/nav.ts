import {
  LayoutDashboard,
  Sprout,
  PawPrint,
  Trees,
  MapPinned,
  Binoculars,
  Siren,
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  LifeBuoy,
  Stethoscope,
  Microscope,
  FileText,
  Settings,
  CircleHelp,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const mainNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Species', path: '/species', icon: Sprout },
  { label: 'Animals', path: '/animals', icon: PawPrint },
  { label: 'Habitats', path: '/habitats', icon: Trees },
  { label: 'Protected Areas', path: '/protected-areas', icon: MapPinned },
  { label: 'Sightings', path: '/sightings', icon: Binoculars },
  { label: 'Incidents', path: '/incidents', icon: Siren },
  { label: 'Threats', path: '/threats', icon: AlertTriangle },
  { label: 'Rangers', path: '/rangers', icon: ShieldCheck },
  { label: 'Conservation Activities', path: '/conservation-activities', icon: HeartHandshake },
  { label: 'Rescue Operations', path: '/rescue-operations', icon: LifeBuoy },
  { label: 'Animal Health', path: '/animal-health', icon: Stethoscope },
  { label: 'Researchers', path: '/researchers', icon: Microscope },
  { label: 'Reports', path: '/reports', icon: FileText },
]

export const bottomNav: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: '/help', icon: CircleHelp },
  { label: 'User Profile', path: '/profile', icon: UserRound },
]

export const navItemTitles: Record<string, string> = Object.fromEntries(
  [...mainNav, ...bottomNav].map((item) => [item.path, item.label]),
)