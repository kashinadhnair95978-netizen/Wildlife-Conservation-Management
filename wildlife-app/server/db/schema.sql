-- ===========================================================================
-- Wildlife Conservation Management System - PostgreSQL schema
-- ---------------------------------------------------------------------------
-- Idempotent and non-destructive:
--   * CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS only.
--   * This file NEVER drops or truncates existing data.
--
-- Apply with:  npm run migrate
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- species  (registry of monitored species)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS species (
  seq                 bigserial PRIMARY KEY,
  id                  text NOT NULL UNIQUE,
  common_name         text NOT NULL,
  scientific_name     text NOT NULL,
  category            text NOT NULL CHECK (category IN ('Mammal','Bird','Reptile','Amphibian','Fish','Insect')),
  status              text NOT NULL CHECK (status IN ('Critically Endangered','Endangered','Vulnerable','Near Threatened','Least Concern','Threatened')),
  population_estimate text NOT NULL DEFAULT '',
  habitat             text NOT NULL DEFAULT '',
  image               text NOT NULL DEFAULT '',
  description         text NOT NULL DEFAULT '',
  body_length         text NOT NULL DEFAULT '',
  weight              text NOT NULL DEFAULT '',
  diet                text NOT NULL DEFAULT '',
  regions             text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- animals  (individual tracked animals -> species)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animals (
  seq              bigserial PRIMARY KEY,
  id               text NOT NULL UNIQUE,
  species_id       text REFERENCES species(id) ON DELETE SET NULL,
  name             text NOT NULL,
  gender           text NOT NULL CHECK (gender IN ('Male','Female','Unknown')),
  age_years        integer NOT NULL DEFAULT 0 CHECK (age_years >= 0),
  date_of_birth    date,
  habitat          text NOT NULL DEFAULT '',
  health_status    text NOT NULL CHECK (health_status IN ('Healthy','Under Observation','Injured','Recovering','Critical')),
  current_location text NOT NULL DEFAULT '',
  tracking_status  text NOT NULL CHECK (tracking_status IN ('Tracked','Untracked')),
  image            text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_animals_species_id ON animals(species_id);

-- ---------------------------------------------------------------------------
-- habitats
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitats (
  seq             bigserial PRIMARY KEY,
  id              text NOT NULL UNIQUE,
  name            text NOT NULL,
  location        text NOT NULL DEFAULT '',
  area            text NOT NULL DEFAULT '',
  type            text NOT NULL CHECK (type IN ('Tropical Forest','Grassland','Wetland','Mountain','Coastal','River Ecosystem')),
  condition       text NOT NULL CHECK (condition IN ('Excellent','Good','Fair','Degraded')),
  species_count   integer NOT NULL DEFAULT 0 CHECK (species_count >= 0),
  last_inspection date,
  image           text NOT NULL DEFAULT '',
  description     text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- protected_areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS protected_areas (
  seq           bigserial PRIMARY KEY,
  id            text NOT NULL UNIQUE,
  name          text NOT NULL,
  location      text NOT NULL DEFAULT '',
  area_size     text NOT NULL DEFAULT '',
  type          text NOT NULL CHECK (type IN ('National Park','Wildlife Sanctuary','Tiger Reserve','Biosphere Reserve')),
  ranger_count  integer NOT NULL DEFAULT 0 CHECK (ranger_count >= 0),
  species_count integer NOT NULL DEFAULT 0 CHECK (species_count >= 0),
  status        text NOT NULL CHECK (status IN ('Active','Under Review','Restricted')),
  established   text NOT NULL DEFAULT '',
  image         text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- sightings  (-> species, -> protected_areas)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sightings (
  seq               bigserial PRIMARY KEY,
  id                text NOT NULL UNIQUE,
  species_id        text REFERENCES species(id) ON DELETE SET NULL,
  location          text NOT NULL DEFAULT '',
  protected_area_id text REFERENCES protected_areas(id) ON DELETE SET NULL,
  habitat           text NOT NULL DEFAULT '',
  date              date NOT NULL,
  time              text NOT NULL DEFAULT '',
  ranger            text NOT NULL DEFAULT '',
  count             integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  behavior          text NOT NULL DEFAULT '',
  status            text NOT NULL CHECK (status IN ('Verified','Pending','Under Review')),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sightings_species_id ON sightings(species_id);
CREATE INDEX IF NOT EXISTS idx_sightings_protected_area_id ON sightings(protected_area_id);
CREATE INDEX IF NOT EXISTS idx_sightings_date ON sightings(date);

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
  seq         bigserial PRIMARY KEY,
  id          text NOT NULL UNIQUE,
  type        text NOT NULL CHECK (type IN ('Poaching','Forest Fire','Injured Animal','Habitat Destruction','Human-Wildlife Conflict','Illegal Activity','Other')),
  location    text NOT NULL DEFAULT '',
  date        date NOT NULL,
  time        text NOT NULL DEFAULT '',
  reported_by text NOT NULL DEFAULT '',
  severity    text NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
  status      text NOT NULL CHECK (status IN ('Open','Investigating','Resolved')),
  description text NOT NULL DEFAULT '',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(date);

-- ---------------------------------------------------------------------------
-- threats
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threats (
  seq              bigserial PRIMARY KEY,
  id               text NOT NULL UNIQUE,
  type             text NOT NULL CHECK (type IN ('Poaching','Habitat Loss','Human Encroachment','Invasive Species','Climate Impact','Water Scarcity','Disease Outbreak','Pollution','Illegal Logging')),
  species_affected text NOT NULL DEFAULT '',
  location         text NOT NULL DEFAULT '',
  severity         text NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
  date_identified  date NOT NULL,
  status           text NOT NULL CHECK (status IN ('Active','Mitigating','Monitored','Contained')),
  trend            text NOT NULL CHECK (trend IN ('Rising','Stable','Declining')),
  description      text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- rangers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rangers (
  seq                bigserial PRIMARY KEY,
  id                 text NOT NULL UNIQUE,
  name               text NOT NULL,
  assigned_area      text NOT NULL DEFAULT '',
  contact            text NOT NULL DEFAULT '',
  status             text NOT NULL CHECK (status IN ('On Field Duty','On Patrol','On Leave','Reserve')),
  active_assignments integer NOT NULL DEFAULT 0 CHECK (active_assignments >= 0),
  join_year          integer NOT NULL DEFAULT 0,
  specialization     text NOT NULL DEFAULT '',
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- conservation_activities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conservation_activities (
  seq         bigserial PRIMARY KEY,
  id          text NOT NULL UNIQUE,
  name        text NOT NULL,
  type        text NOT NULL CHECK (type IN ('Habitat Restoration','Anti-Poaching Patrol','Species Monitoring','Tree Plantation','Community Awareness','Wildlife Rescue','Breeding Program')),
  area        text NOT NULL DEFAULT '',
  responsible text NOT NULL DEFAULT '',
  start_date  date,
  end_date    date,
  progress    integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status      text NOT NULL CHECK (status IN ('Active','Completed','Planned','On Hold')),
  budget      text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- rescue_operations  (-> animals; animal_name/species kept denormalized)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rescue_operations (
  seq         bigserial PRIMARY KEY,
  id          text NOT NULL UNIQUE,
  animal_id   text REFERENCES animals(id) ON DELETE SET NULL,
  animal_name text NOT NULL DEFAULT '',
  species     text NOT NULL DEFAULT '',
  location    text NOT NULL DEFAULT '',
  rescue_date date NOT NULL,
  team        text[] NOT NULL DEFAULT '{}',
  condition   text NOT NULL CHECK (condition IN ('Stable','Critical','Fair','Good')),
  outcome     text NOT NULL CHECK (outcome IN ('Released','Under Treatment','Under Observation','Transferred','Deceased')),
  status      text NOT NULL CHECK (status IN ('Ongoing','Completed')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rescue_operations_animal_id ON rescue_operations(animal_id);

-- ---------------------------------------------------------------------------
-- animal_health  (-> animals; species kept denormalized)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animal_health (
  seq              bigserial PRIMARY KEY,
  id               text NOT NULL UNIQUE,
  animal_id        text REFERENCES animals(id) ON DELETE SET NULL,
  species          text NOT NULL DEFAULT '',
  examination_date date NOT NULL,
  veterinarian     text NOT NULL DEFAULT '',
  condition        text NOT NULL CHECK (condition IN ('Healthy','Under Treatment','Recovering','Critical','Under Observation')),
  treatment        text NOT NULL DEFAULT '',
  medication       text NOT NULL DEFAULT '',
  follow_up_date   date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_animal_health_animal_id ON animal_health(animal_id);

-- ---------------------------------------------------------------------------
-- researchers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS researchers (
  seq             bigserial PRIMARY KEY,
  id              text NOT NULL UNIQUE,
  name            text NOT NULL,
  organization    text NOT NULL DEFAULT '',
  specialization  text NOT NULL DEFAULT '',
  active_projects integer NOT NULL DEFAULT 0 CHECK (active_projects >= 0),
  contact         text NOT NULL DEFAULT '',
  status          text NOT NULL CHECK (status IN ('Active','Inactive')),
  focus_areas     text[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- reports  (read-only catalog surfaced by the Reports page)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  seq            bigserial PRIMARY KEY,
  id             text NOT NULL UNIQUE,
  title          text NOT NULL,
  description    text NOT NULL DEFAULT '',
  last_generated date,
  icon           text NOT NULL DEFAULT 'activity',
  created_at     timestamptz NOT NULL DEFAULT now()
);
