
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

import { fileURLToPath } from 'url';
import { generateProfessionalSummary, generateRoleDescription, getCidDescription, suggestRolesAndFunctions } from './aiController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI Routes
app.post('/api/ai/summary', async (req, res) => {
  const result = await generateProfessionalSummary(req.body);
  res.json({ text: result });
});

app.post('/api/ai/role-description', async (req, res) => {
  const { roleName, cbo } = req.body;
  const result = await generateRoleDescription(roleName, cbo);
  res.json({ text: result });
});

app.post('/api/ai/cid', async (req, res) => {
  const { cid } = req.body;
  const result = await getCidDescription(cid);
  res.json({ text: result });
});

app.post('/api/ai/suggest', async (req, res) => {
  const { industry } = req.body;
  const result = await suggestRolesAndFunctions(industry);
  res.json(result);
});

// Example: Get all collaborators
app.get('/api/collaborators', async (req, res) => {
  try {
    const collaborators = await prisma.collaborator.findMany();
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Serve static files from the React app (after build)
// In production (Docker), we serve files from 'dist'
const distPath = path.join(__dirname, '..', '..', 'dist'); // Go up to /app/dist
// If running via ts-node in root, it might be different, but for Docker it will be:
// /app/dist (frontend) and /app/server (backend)

// Serve static assets
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
