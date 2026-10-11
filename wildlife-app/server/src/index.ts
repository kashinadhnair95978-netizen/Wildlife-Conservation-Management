import cors from 'cors'
import express from 'express'
import { config } from './config'
import { errorHandler } from './http'
import { crudRouter } from './routes/crud'
import { dashboardRouter } from './routes/dashboard'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: '4mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'wildlife-api', database: 'lazy (not connected at startup)' })
})

// Specific aggregate routes must be registered before the generic CRUD router.
app.use('/api/dashboard', dashboardRouter)
app.use('/api', crudRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Wildlife API listening on http://localhost:${config.port}`)
  console.log('PostgreSQL connections open lazily on the first request.')
})
