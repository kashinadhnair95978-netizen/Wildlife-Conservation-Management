import { Routes, Route, Link } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import SpeciesPage from './pages/SpeciesPage'
import AnimalsPage from './pages/AnimalsPage'
import HabitatsPage from './pages/HabitatsPage'
import ProtectedAreasPage from './pages/ProtectedAreasPage'
import SightingsPage from './pages/SightingsPage'
import IncidentsPage from './pages/IncidentsPage'
import ThreatsPage from './pages/ThreatsPage'
import RangersPage from './pages/RangersPage'
import ConservationActivitiesPage from './pages/ConservationActivitiesPage'
import RescueOperationsPage from './pages/RescueOperationsPage'
import AnimalHealthPage from './pages/AnimalHealthPage'
import ResearchersPage from './pages/ResearchersPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/species" element={<SpeciesPage />} />
        <Route path="/animals" element={<AnimalsPage />} />
        <Route path="/habitats" element={<HabitatsPage />} />
        <Route path="/protected-areas" element={<ProtectedAreasPage />} />
        <Route path="/sightings" element={<SightingsPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/threats" element={<ThreatsPage />} />
        <Route path="/rangers" element={<RangersPage />} />
        <Route path="/conservation-activities" element={<ConservationActivitiesPage />} />
        <Route path="/rescue-operations" element={<RescueOperationsPage />} />
        <Route path="/animal-health" element={<AnimalHealthPage />} />
        <Route path="/researchers" element={<ResearchersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink-400">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-950">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">The page you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  )
}