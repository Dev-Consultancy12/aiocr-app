const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const { extractPolicyData } = require('../services/ocrService');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'image/png', 
      'image/jpeg', 
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, PNG, JPEG, and Excel files are allowed."));
    }
  }
});

const dataFilePath = path.join(__dirname, '../data/policies.json');

// Ensure data file exists
const initDataFile = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
  }
};
initDataFile();

// POST /api/ocr/upload
router.post('/ocr/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const data = await extractPolicyData(req.file.buffer, req.file.mimetype);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/policies
router.post('/policies', (req, res) => {
  try {
    const newPolicy = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    let policies = [];
    try {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      policies = fileContent ? JSON.parse(fileContent) : [];
    } catch (err) {
      console.warn("Could not read policies file, initializing empty array.");
    }
    
    policies.push(newPolicy);
    fs.writeFileSync(dataFilePath, JSON.stringify(policies, null, 2));

    res.json({ success: true, message: "Policy saved" });
  } catch (error) {
    console.error("Save Policy Error:", error);
    res.status(500).json({ success: false, error: "Failed to save policy" });
  }
});

// GET /api/policies
router.get('/policies', (req, res) => {
  try {
    const policies = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    res.json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch policies" });
  }
});

// GET /api/policies/export
router.get('/policies/export', (req, res) => {
  try {
    const policies = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    
    if (policies.length === 0) {
      return res.status(404).json({ success: false, error: "No policies to export" });
    }

    const formattedPolicies = policies.map(p => ({
      ...p,
      expiryDate: p.expiryDate ? `="${p.expiryDate}"` : '',
      createdAt: p.createdAt ? `="${p.createdAt}"` : ''
    }));

    const fields = ['id', 'policyNumber', 'insuredName', 'insurerName', 'premiumAmount', 'expiryDate', 'createdAt'];
    const csv = parse(formattedPolicies, { fields });

    res.header('Content-Type', 'text/csv');
    res.attachment('policies.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to export policies" });
  }
});

module.exports = router;
