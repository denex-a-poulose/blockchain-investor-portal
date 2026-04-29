require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = require('./serviceAccount.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Portal Backend Status: Firebase Admin Initialized Successfully");
} catch (error) {
  console.error("Portal Backend Status: Failed to initialize Firebase Admin.", error);
}

const app = express();
const allowedOrigins = [
  'https://portal-bc.web.app',
  'https://portal-bc.firebaseapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost port for development
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const portalRoutes = require('./routes/portal');
app.use('/api/portal', portalRoutes);

app.get('/api/health', (req, res) => res.status(200).send('ok'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Investor Portal Backend running on http://localhost:${PORT}`);
});
