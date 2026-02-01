
import express from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateProfessionalSummary, generateRoleDescription, getCidDescription, suggestRolesAndFunctions } from './aiController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ehs-pro-secret-key-prod-v1';

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

// Auto-create Master User on Startup (Securely)
const createMasterUser = async () => {
  const masterEmail = 'daniel-ehs@outlook.com';
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: masterEmail } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.user.create({
        data: {
          email: masterEmail,
          name: 'Daniel EHS',
          password: hashedPassword,
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

// Auth Routes: Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'E-mail não encontrado no sistema.' });
    }

    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"EHS Pro Security" <no-reply@ehspro.com.br>',
      to: email,
      subject: 'Redefinição de Senha | EHS Pro',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">EHS PRO</h1>
            <p style="color: #ecfdf5; margin: 5px 0 0; font-size: 14px;">Gestão Inteligente & Segura</p>
          </div>
          
          <div style="padding: 40px 30px; background-color: white;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Olá, ${user.name}</h2>
            <p style="color: #475569; line-height: 1.6;">Recebemos uma solicitação de segurança para redefinir sua senha de acesso.</p>
            <p style="color: #475569; line-height: 1.6;">Para continuar o processo e criar uma nova senha segura, clique no botão abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">Redefinir Minha Senha</a>
            </div>

            <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; text-align: center;">Este link expira em 1 hora. Se você não solicitou, por favor ignore este email ou contate o suporte.</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
            &copy; ${new Date().getFullYear()} EHS Pro. Todos os direitos reservados.
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'E-mail enviado! Verifique sua caixa de entrada.' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

// Auth Routes: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 1. Check if password matches (bcrypt)
    let isMatch = await bcrypt.compare(password, user.password);

    // 2. Lazy Migration: If bcrypt failed, check if it's the old plaintext password
    // This allows existing users to login, but immediately upgrades them to hash
    if (!isMatch && password === user.password) {
      console.log(`[AUTH] Migrating user ${email} to secure hash...`);
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Generate valid Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ success: true, token, user: userWithoutPassword });

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

// Serve static assets
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
