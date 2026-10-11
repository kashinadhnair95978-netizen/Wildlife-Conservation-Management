import { useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '../components'
import { PageHeader } from '../components/PageHeader'
import { Field, SelectInput, TextInput } from '../components/Field'

function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false)
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink-800">{label}</p>
        <p className="mt-0.5 text-xs text-ink-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${on ? 'border-ink-900 bg-ink-900' : 'border-ink-300 bg-ink-100'}`}
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all ${on ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="font-display text-[15px] font-semibold text-ink-900">{title}</h3>
      <p className="mt-0.5 text-xs text-ink-500">{description}</p>
      <div className="mt-4 divide-y divide-ink-100">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const toast = useToast()
  const [profileName, setProfileName] = useState('Kashinadh Nair')
  const [locale, setLocale] = useState('en-IN')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const save = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure application preferences for your account."
        actions={
          <button type="button" className="btn-primary" onClick={save}>
            Save Changes
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Profile" description="Personal details shown across the system.">
          <div className="py-3">
            <Field label="Display Name">
              <TextInput value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </Field>
          </div>
          <div className="py-3">
            <Field label="Locale">
              <SelectInput value={locale} onChange={(e) => setLocale(e.target.value)}>
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
              </SelectInput>
            </Field>
          </div>
          <div className="py-3">
            <Field label="Timezone">
              <SelectInput value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Kathmandu">Asia/Kathmandu</option>
              </SelectInput>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" description="Choose which alerts you receive.">
          <ToggleRow label="Sighting alerts" description="Notify when a new sighting is recorded in your area." defaultOn />
          <ToggleRow label="Incident alerts" description="Notify for critical or high-severity incidents." defaultOn />
          <ToggleRow label="Rescue updates" description="Notify when a rescue operation changes status." defaultOn />
          <ToggleRow label="Weekly digest" description="A summary of conservation activity every Monday." />
          <ToggleRow label="Weather warnings" description="Alerts for fire-weather and flood risk conditions." />
        </SectionCard>

        <SectionCard title="Appearance" description="The interface follows a strict black-and-white conservation theme.">
          <ToggleRow label="Compact tables" description="Show more rows with tighter table density." defaultOn />
          <ToggleRow label="Inset charts" description="Render charts inside bordered cards." defaultOn />
          <ToggleRow label="Reduced motion" description="Minimize transitions and hover animations." />
        </SectionCard>

        <SectionCard title="Data &amp; Local Storage" description="Frontend-only settings until the backend is connected.">
          <div className="py-3">
            <p className="text-sm text-ink-700">Mock data currently powers this interface.</p>
            <p className="mt-1 text-xs text-ink-500">
              Later you can point the service layer at your API and database without changing the UI.
            </p>
          </div>
          <div className="py-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => toast.info('Mock data catalog is loaded from src/data/')}
            >
              View data catalog
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}