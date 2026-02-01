
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

import nodemailer from 'nodemailer';

app.use(cors());
app.use(express.json());

// Email Transporter Config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Auto-create Master User on Startup
const createMasterUser = async () => {
  const masterEmail = 'daniel-ehs@outlook.com';
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: masterEmail } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: masterEmail,
          name: 'Daniel EHS',
          password: '123456', // TODO: Hash this in production
          role: 'MASTER',
          status: 'ACTIVE',
          createdAt: new Date(),
        }
      });
      console.log(`[SYSTEM] Master user ${masterEmail} created successfully.`);
    } else {
      console.log(`[SYSTEM] Master user ${masterEmail} already exists.`);
    }
  } catch (error) {
    console.error('[SYSTEM] Failed to check/create master user:', error);
  }
};
createMasterUser();

// Auth Routes
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Security: Always return success even if user not found to prevent enumeration
      // But for this project we can be honest if requested, but let's stick to standard practice mostly.
      // Or lets return 404 if the user wants strict validation as requested "se for um email valido".
      return res.status(404).json({ error: 'E-mail não encontrado no sistema.' });
    }

    // Generate token (simulated for now, would be a JWT or DB token)
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"EHS Pro System" <no-reply@ehspro.com.br>',
      to: email,
      subject: 'Recuperação de Senha - EHS Pro',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá, ${user.name}</h2>
          <p>Recebemos uma solicitação para redefinir sua senha no sistema <strong>EHS Pro</strong>.</p>
          <p>Clique no botão abaixo para prosseguir:</p>
          <a href="${resetLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Minha Senha</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'E-mail de recuperação enviado com sucesso!' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail. Tente novamente mais tarde.' });
  }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Try to find user in DB
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // In a real app, verify password hash here. For now, we trust.
      // Or check if password === '123456' for safety while developing
      if (password === '123456') {
        return res.json({ success: true, user });
      }
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // 2. Fallback: If no users exist in DB, check for MASTER credentials to bootstrap
    if (email === 'admin@ehspro.com' && password === '123456') {
      // Create the Master User in DB if table is empty ?!
      // Or just return success so he can login and register others.
      return res.json({ success: true, user: { name: 'Administrador', email, role: 'MASTER' } });
    }

    res.status(401).json({ error: 'Usuário não encontrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

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
