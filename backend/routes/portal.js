const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const verifyAuthToken = require('../middleware/authMiddleware');

/**
 * POST /api/portal/signup
 * Initializes an investor profile
 */
router.post('/signup', verifyAuthToken, async (req, res) => {
  try {
    const { name } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;
    const db = admin.firestore();

    const userRef = db.collection('tenant_users').doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return res.status(200).json(userSnap.data());
    }

    const newProfile = {
      id: uid,
      name: name || req.user.name || 'Investor',
      email: email || '',
      role: 'investor',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(newProfile);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Portal Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/portal/signin
 * Returns profile if user exists
 */
router.get('/signin', verifyAuthToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const userSnap = await db.collection('tenant_users').doc(req.user.uid).get();
    
    if (!userSnap.exists) {
      return res.status(404).json({ error: "Investor profile not found." });
    }
    
    res.status(200).json(userSnap.data());
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/portal/offerings
 * Lists all deployed tokens from the management platform
 */
router.get('/offerings', async (req, res) => {
  try {
    const db = admin.firestore();
    const tokensSnap = await db.collection('tokens')
      .where('status', '==', 'deployed')
      .get();
    
    const offerings = tokensSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(offerings);
  } catch (error) {
    console.error("Portal Offerings Error:", error);
    res.status(500).json({ error: "Failed to fetch offerings" });
  }
});

/**
 * POST /api/portal/wallets
 * Saves an investor's connected wallet address
 */
router.post('/wallets', verifyAuthToken, async (req, res) => {
  try {
    const { address } = req.body;
    const uid = req.user.uid;
    const db = admin.firestore();

    if (!address) return res.status(400).json({ error: "Wallet address required" });

    const walletData = {
      userId: uid,
      address: address.toLowerCase(),
      type: 'investor_meta_mask',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to shared wallets collection
    await db.collection('wallets').doc(`${uid}_${address.toLowerCase()}`).set(walletData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save wallet" });
  }
});

module.exports = router;
