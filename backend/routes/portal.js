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

/**
 * GET /api/portal/wallets
 * Fetches an investor's saved wallets
 */
router.get('/wallets', verifyAuthToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = admin.firestore();
    
    const walletsSnap = await db.collection('wallets')
      .where('userId', '==', uid)
      .get();
      
    const wallets = walletsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(wallets);
  } catch (error) {
    console.error("Portal Fetch Wallets Error:", error);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
});

/**
 * POST /api/portal/create-order
 * Bridges the portal frontend to the main application's Stripe order creator
 */
router.post('/create-order', verifyAuthToken, async (req, res) => {
  try {
    const { amount, tokenId, quantity, pricePerToken, walletAddress, tokenName } = req.body;
    const buyerId = req.user.uid;

    const MAIN_BACKEND = process.env.MAIN_BACKEND_URL || 'http://127.0.0.1:5000/api';
    
    const response = await fetch(`${MAIN_BACKEND}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        tokenId,
        quantity,
        pricePerToken,
        buyerId,
        walletAddress,
        tokenName
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Stripe Gateway failed');

    res.json(data);
  } catch (error) {
    console.error("Portal Stripe Order Bridge Error:", error);
    res.status(500).json({ error: "Failed to initiate payment gateway", details: error.message });
  }
});

/**
 * POST /api/portal/verify-payment
 * Bridges verification to the main backend
 */
router.post('/verify-payment', verifyAuthToken, async (req, res) => {
    try {
      const MAIN_BACKEND = process.env.MAIN_BACKEND_URL || 'http://127.0.0.1:5000/api';
      const response = await fetch(`${MAIN_BACKEND}/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body) 
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: "Verification bridge failure" });
    }
});

/**
 * GET /api/portal/orders/:id
 * Fetches order details from the shared collection
 */
router.get('/orders/:id', verifyAuthToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const orderSnap = await db.collection('orders').doc(req.params.id).get();
    
    if (!orderSnap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = orderSnap.data();
    // Security: Only allow the buyer to see their own order
    if (orderData.buyerId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized access to order" });
    }

    res.json(orderData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order status" });
  }
});

module.exports = router;
