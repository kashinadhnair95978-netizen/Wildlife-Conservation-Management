import 'dotenv/config'

export interface PgConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

interface AppConfig {
  port: number
  corsOrigin: string
  databaseUrl?: string
  pg: PgConfig
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  pg: {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    database: process.env.PGDATABASE ?? 'wildlife',
  },
}
