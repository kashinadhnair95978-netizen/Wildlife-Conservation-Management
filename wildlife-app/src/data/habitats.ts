import type { Habitat } from '../types'
import { IMAGES } from '../config/images'

export const habitatsData: Habitat[] = [
  {
    id: 'HB-01',
    name: 'Periyar Evergreen Forest',
    location: 'Idukki, Kerala',
    area: '342 km²',
    type: 'Tropical Forest',
    condition: 'Excellent',
    speciesCount: 44,
    lastInspection: '2025-11-18',
    image: IMAGES.habitat.forest,
    description:
      'Dense evergreen and semi-evergreen forest surrounding Periyar Lake, hosting tigers, elephants and over 260 bird species.',
  },
  {
    id: 'HB-02',
    name: 'High Range Shola Grassland',
    location: 'Eravikulam, Kerala',
    area: '97 km²',
    type: 'Mountain',
    condition: 'Good',
    speciesCount: 21,
    lastInspection: '2025-10-04',
    image: IMAGES.habitat.mountain,
    description:
      'High-altitude grassland interspersed with shola forest patches, the primary range of the endangered Nilgiri tahr.',
  },
  {
    id: 'HB-03',
    name: 'Periyar Lake Wetland',
    location: 'Thekkady, Kerala',
    area: '26 km²',
    type: 'Wetland',
    condition: 'Good',
    speciesCount: 37,
    lastInspection: '2025-11-02',
    image: IMAGES.habitat.wetland,
    description:
      'A seasonal wetland formed by the Periyar reservoir, a critical water source for large ungulates and elephants.',
  },
  {
    id: 'HB-04',
    name: 'Nagarhole Grasslands',
    location: 'Kodagu, Karnataka',
    area: '214 km²',
    type: 'Grassland',
    condition: 'Excellent',
    speciesCount: 39,
    lastInspection: '2025-09-21',
    image: IMAGES.habitat.grassland,
    description:
      'Open woodlands and meadows along the Kabini backwaters, a prime grazing ground for gaur, sambar and chital.',
  },
  {
    id: 'HB-05',
    name: 'Silent Valley Riparian Belt',
    location: 'Palakkad, Kerala',
    area: '58 km²',
    type: 'River Ecosystem',
    condition: 'Fair',
    speciesCount: 52,
    lastInspection: '2025-08-30',
    image: IMAGES.habitat.river,
    description:
      'The pristine riverine ecosystem of the Kunthipuzha, home to the lion-tailed macaque and hornbills.',
  },
  {
    id: 'HB-06',
    name: 'Mangalavanam Coastal Marsh',
    location: 'Kochi, Kerala',
    area: '3.7 km²',
    type: 'Coastal',
    condition: 'Fair',
    speciesCount: 18,
    lastInspection: '2025-10-15',
    image: IMAGES.habitat.coastal,
    description:
      'A coastal backwater marsh and mangrove grove that serves as a stopover for migratory waterbirds.',
  },
]