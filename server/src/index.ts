import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import kategoriRoutes from './routes/kategori.routes'
import satuanRoutes from './routes/satuan.routes'
import barangRoutes from './routes/barang.routes'
import uploadRoutes from './routes/upload.routes'

const app = new Hono()

app.use(cors())

// Serve uploaded files
app.use('/uploads/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Inventory Management API',
    version: '2.0.0',
    endpoints: {
      kategori: '/api/kategori',
      satuan: '/api/satuan',
      barang: '/api/barang',
    }
  })
})

// API Routes
app.route('/api/kategori', kategoriRoutes)
app.route('/api/satuan', satuanRoutes)
app.route('/api/barang', barangRoutes)
app.route('/api/upload', uploadRoutes)

export default app
