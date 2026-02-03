-- Adiciona a coluna de permissões granulares (JSON) se ela não existir
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "permissoes" JSONB DEFAULT '[]'::jsonb;

-- Garante que a coluna modulos_permitidos também exista (caso ainda não tenha rodado)
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "modulos_permitidos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Garante que a coluna usuario_pai_id exista para hierarquia
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "usuario_pai_id" TEXT;

-- Atualiza o tipo de usuário para incluir GESTOR se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_usuario') THEN
        CREATE TYPE "tipo_usuario" AS ENUM ('MASTER', 'GESTOR', 'USUARIO');
    ELSE
        ALTER TYPE "tipo_usuario" ADD VALUE IF NOT EXISTS 'GESTOR';
    END IF;
END$$;
