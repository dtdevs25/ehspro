-- 1. Adicionar coluna para Módulos Permitidos (Array de Texto)
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "modulos_permitidos" TEXT[];

-- Garantir que não seja nulo (padrão array vazio)
UPDATE "usuarios" SET "modulos_permitidos" = ARRAY[]::TEXT[] WHERE "modulos_permitidos" IS NULL;

-- 2. Adicionar coluna para Hierarquia (Usuário Pai)
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "usuario_pai_id" TEXT;

-- 3. Adicionar relacionamento (Foreign Key)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_usuario_pai_id_fkey') THEN
        ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_usuario_pai_id_fkey" FOREIGN KEY ("usuario_pai_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Atualizar o Enum de Tipos de Usuário para incluir 'GESTOR'
-- Nota: 'ALTER TYPE ... ADD VALUE' não suporta 'IF NOT EXISTS' nativamente em versões antigas, 
-- então executamos num bloco seguro (embora Postgres 12+ suporte IF NOT EXISTS).
DO $$
BEGIN
    ALTER TYPE "tipo_usuario" ADD VALUE 'GESTOR';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
