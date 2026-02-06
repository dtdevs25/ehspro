
-- Update Company Table
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;

-- Update Collaborator Table
ALTER TABLE "colaboradores" ADD COLUMN IF NOT EXISTS "foto_url" TEXT;
