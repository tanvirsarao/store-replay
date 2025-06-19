require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { initDatabase } = require('./lib/db');
const sessionRoutes = require('./routes/sessions');
const analysisRoutes = require('./routes/analysis');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

initDatabase();

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analyze', analysisRoutes);

app.listen(PORT, () => {
  console.log(`🟢 StoreReplay API listening on port ${PORT}`);
});
