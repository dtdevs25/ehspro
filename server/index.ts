
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

// --- EMERGENCY DB FIX ---
(async () => {
  try {
    console.log('[SYSTEM] Checking Database Schema...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "modulos_permitidos" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "usuario_pai_id" TEXT;`);
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "tipo_usuario" ADD VALUE 'GESTOR';`);
    } catch (e) { /* ignore if exists */ }
    console.log('[SYSTEM] Database Schema Verified.');
  } catch (e) {
    console.error('[SYSTEM] DB Fix Error:', e);
  }
})();
// ------------------------
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
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"EHS Pro Security" <no-reply@ehspro.com.br>',
      to: email,
      subject: 'Redefinição de Senha | EHS Pro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .header { background-color: #047857; padding: 30px; text-align: center; }
            .header h1 { color: #ffffff !important; margin: 0; font-size: 24px; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
            .header p { color: #d1fae5 !important; margin: 5px 0 0; font-size: 14px; font-weight: 500; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #059669; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EHS PRO</h1>
              <p>Gestão Inteligente & Segura</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-top: 0;">Olá, ${user.name}</h2>
              <p>Recebemos uma solicitação de segurança para redefinir sua senha de acesso.</p>
              <p>Para garantir a segurança da sua conta, clique no botão abaixo para criar uma nova senha:</p>
              
              <div class="btn-container">
                <a href="${resetLink}" class="btn">Redefinir Minha Senha</a>
              </div>

              <p style="color: #64748b; font-size: 14px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
              <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">${resetLink}</p>
            </div>
            
            <div class="footer">
              &copy; ${new Date().getFullYear()} EHS Pro. Todos os direitos reservados.<br>
              Este é um email automático de segurança. Não responda.
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'E-mail enviado! Verifique sua caixa de entrada.' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

// Auth Routes: Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }

    const decoded = Buffer.from(token, 'base64').toString();
    const [email, timestamp] = decoded.split(':');

    if (!email || !timestamp) {
      return res.status(400).json({ error: 'Token inválido.' });
    }

    const tokenTime = parseInt(timestamp);
    if (Date.now() - tokenTime > 3600000) {
      return res.status(400).json({ error: 'O link expirou. Solicite uma nova redefinição.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

// --- USER MANAGEMENT ENDPOINTS ---

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parentUser: { // Include parent name for display
          select: { name: true, email: true }
        }
      }
    });
    // Remove password hash before sending
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, allowedBranches, allowedModules, permissions, parentUserId, functionName } = req.body;

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
        status: 'ACTIVE',
        allowedBranches: allowedBranches || [],
        allowedModules: allowedModules || [],
        permissions: permissions || [],
        parentUserId: parentUserId || null,
        functionName: functionName || null,
      }
    });

    // Return without password
    const { password: _, ...userWithoutPwd } = newUser;
    res.json(userWithoutPwd);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, allowedBranches, allowedModules, permissions, status, functionName } = req.body;

    const updateData: any = {
      name,
      email,
      role,
      allowedBranches,
      allowedModules,
      permissions,
      status,
      functionName
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...userWithoutPwd } = updatedUser;
    res.json(userWithoutPwd);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deleting MASTER if it's the only one, but for now just simple delete
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
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

// Core Data Routes - CRUD
// --- COMPANIES ---
app.post('/api/companies', async (req, res) => {
  try {
    const { name, cnpj, cnae, address, zipCode, street, number, neighborhood, city, state } = req.body;

    // Transaction to create Company AND default Matriz Branch
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create Company
      const newCompany = await prisma.company.create({
        data: { name, cnpj, cnae, address }
      });

      // 2. Create Default Branch (Matriz)
      await prisma.branch.create({
        data: {
          name: `MATRIZ - ${name.substring(0, 20)}...`.toUpperCase(), // Or just 'MATRIZ'
          companyId: newCompany.id,
          cnpj: cnpj, // Matriz usually shares root CNPJ, but branches have different suffixes. 
          // Ideally user should edit this later if different, but for auto-creation we reuse or leave blank?
          // Uniqueness constraint on Branch CNPJ might conflict if we use SAME string as Company CNPJ?
          // Company CNPJ is unique in Company table. Branch CNPJ is unique in Branch table.
          // So it is fine to use same string in both tables.
          cnae: cnae,
          address: address
        }
      });

      return newCompany;
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating company:", error);
    // Handle unique constraint violation on CNPJ more gracefully if needed
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, cnae, address } = req.body;
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { name, cnpj, cnae, address }
    });
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.company.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
});

// --- BRANCHES ---
app.post('/api/branches', async (req, res) => {
  try {
    const { name, cnpj, cnae, address, companyId } = req.body;
    const newBranch = await prisma.branch.create({
      data: { name, cnpj, cnae, address, companyId }
    });
    res.json(newBranch);
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ error: 'Erro ao criar filial' });
  }
});

app.put('/api/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, cnae, address, companyId } = req.body;
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: { name, cnpj, cnae, address, companyId }
    });
    res.json(updatedBranch);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar filial' });
  }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.branch.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir filial' });
  }
});

// --- FUNCTIONS (Funções) ---
app.get('/api/functions', async (req, res) => {
  try {
    const functions = await prisma.jobFunction.findMany();
    res.json(functions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funções' });
  }
});

app.post('/api/functions', async (req, res) => {
  try {
    const { name, cbo, description, registration } = req.body;
    // Auto-generate registration if not provided
    const nextReg = registration || `F${Date.now()}`;

    const newFunction = await prisma.jobFunction.create({
      data: { name, cbo, description: description || '', registration: nextReg }
    });
    res.json(newFunction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar função' });
  }
});

app.put('/api/functions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cbo, description, registration } = req.body;
    const updatedFunction = await prisma.jobFunction.update({
      where: { id },
      data: { name, cbo, description, registration }
    });
    res.json(updatedFunction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar função' });
  }
});

app.delete('/api/functions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jobFunction.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir função' });
  }
});

// --- ROLES (Cargos) ---
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { jobFunction: true } // Include linked function details
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cargos' });
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const { name, description, functionId, registration } = req.body;
    // Auto-generate registration if not provided
    const nextReg = registration || `C${Date.now()}`;

    const newRole = await prisma.role.create({
      data: { name, description: description || '', functionId, registration: nextReg }
    });
    res.json(newRole);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cargo' });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, functionId, registration } = req.body;
    const updatedRole = await prisma.role.update({
      where: { id },
      data: { name, description, functionId, registration }
    });
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cargo' });
  }
});

app.delete('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir cargo' });
  }
});

// Core Data Routes - GET
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { branches: true }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

app.get('/api/branches', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: { company: true }
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar filiais' });
  }
});

// --- COLLABORATORS ---
app.get('/api/collaborators', async (req, res) => {
  try {
    const collaborators = await prisma.collaborator.findMany({
      include: {
        company: true,
        branch: true,
        role: true,
        jobFunction: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res.status(500).json({ error: 'Erro ao buscar colaboradores' });
  }
});

app.post('/api/collaborators', async (req, res) => {
  try {
    const data = req.body;

    // Ensure unique fields don't clash or handle error gracefully
    const exists = await prisma.collaborator.findFirst({
      where: {
        OR: [
          { cpf: data.cpf },
          { registration: data.registration }
        ]
      }
    });

    if (exists) {
      return res.status(400).json({ error: 'Colaborador já existe (CPF ou Matrícula duplicados).' });
    }

    const { id, ...cleanData } = data; // specific cleanup if needed

    const newCollaborator = await prisma.collaborator.create({
      data: {
        ...cleanData,
        // Ensure dates are Date objects if passed as strings
        birthDate: new Date(data.birthDate),
        admissionDate: new Date(data.admissionDate),
        terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
        // Ensure defaults if missing
        status: data.status || 'ACTIVE',
        isDisabled: data.isDisabled || false,
      }
    });
    res.json(newCollaborator);
  } catch (error) {
    console.error("Error creating collaborator:", error);
    res.status(500).json({ error: 'Erro ao criar colaborador' });
  }
});

app.put('/api/collaborators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // cleanup id and relational objects from body
    // Prisma .update fails if we pass the relation object itself (e.g. company: { ... })
    const {
      id: bodyId,
      company,
      branch,
      role,
      jobFunction,
      medicalCertificates,
      cipeiros,
      createdAt,
      updatedAt,
      ...updateData
    } = data;

    const updated = await prisma.collaborator.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
        admissionDate: updateData.admissionDate ? new Date(updateData.admissionDate) : undefined,
        terminationDate: updateData.terminationDate ? new Date(updateData.terminationDate) : null,
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating collaborator:", error);
    res.status(500).json({ error: 'Erro ao atualizar colaborador' });
  }
});

app.delete('/api/collaborators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.collaborator.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting collaborator:", error);
    res.status(500).json({ error: 'Erro ao excluir colaborador' });
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
