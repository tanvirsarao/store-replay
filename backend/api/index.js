require('dotenv').config()
const express     = require('express')
const bodyParser  = require('body-parser')
const cors        = require('cors')
const path        = require('path')

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.text({ type: 'text/plain' }))

app.use(express.static(path.join(__dirname, '..', 'public')))

const { initDatabase } = require("./lib/db");
initDatabase().then(() => {
  console.log("🚀 Server ready to accept requests");
});

const sessionRoutes   = require('./routes/sessions')
const analysisRoutes  = require('./routes/analysis')
const dashboardRoutes = require('./routes/dashboard')
const testRoute       = require('./routes/test')
const replayRoutes    = require('./routes/replay')

app.use("/api/test", testRoute);
app.use('/api/sessions', sessionRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/session', replayRoutes)

app.use((req, res, next) => {
  console.log(`📡 Incoming request: ${req.method} ${req.url}`);
  next();
});

app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`)
})
