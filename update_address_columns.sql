-- Comandos para adicionar as colunas de endereço normalizado nas tabelas existentes

-- Tabela EMPRESAS
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "logradouro" TEXT;
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "numero" TEXT;
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "bairro" TEXT;
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "cidade" TEXT;
ALTER TABLE "empresas" ADD COLUMN IF NOT EXISTS "estado" TEXT;

-- Tabela FILIAIS
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "logradouro" TEXT;
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "numero" TEXT;
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "bairro" TEXT;
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "cidade" TEXT;
ALTER TABLE "filiais" ADD COLUMN IF NOT EXISTS "estado" TEXT;
