
-- Criar Tipos ENUM (PostgreSQL exige que sejam tipos separados)
CREATE TYPE "tipo_usuario" AS ENUM ('MASTER', 'USUARIO');
CREATE TYPE "status_colaborador" AS ENUM ('ATIVO', 'INATIVO');
CREATE TYPE "regime_trabalho" AS ENUM ('EFETIVO', 'TERCEIRO');
CREATE TYPE "tipo_atestado" AS ENUM ('MEDICO', 'ACIDENTE', 'FAMILIA', 'OUTROS');
CREATE TYPE "cargo_cipa" AS ENUM ('PRESIDENTE', 'VICE_PRESIDENTE', 'SECRETARIO', 'TITULAR', 'SUPLENTE');
CREATE TYPE "origem_cipa" AS ENUM ('EMPREGADOR', 'EMPREGADO');
CREATE TYPE "status_cipa" AS ENUM ('ATIVO', 'FINALIZADO', 'ELEICAO');
CREATE TYPE "tipo_reuniao" AS ENUM ('ORDINARIA', 'EXTRAORDINARIA');
CREATE TYPE "status_plano_acao" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO');

-- Tabela de Usuários
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "funcao" "tipo_usuario" NOT NULL DEFAULT 'USUARIO',
    "nome_cargo" TEXT,
    "permissoes" JSONB NOT NULL,
    "filiais_permitidas" TEXT[], -- Array de texto nativo no Postgres
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- Tabela de Empresas
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cnae" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- Tabela de Filiais
CREATE TABLE "filiais" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cnae" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,

    CONSTRAINT "filiais_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "filiais_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "filiais_cnpj_key" ON "filiais"("cnpj");

-- Tabela de Funções
CREATE TABLE "funcoes" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cbo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "funcoes_pkey" PRIMARY KEY ("id")
);

-- Tabela de Cargos
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cargos_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Colaboradores
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "nome_mae" TEXT NOT NULL,
    "nome_pai" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "naturalidade" TEXT NOT NULL,
    "uf_nascimento" TEXT NOT NULL,
    "nacionalidade" TEXT NOT NULL,
    "escolaridade" TEXT NOT NULL,
    "estado_civil" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo_id" TEXT NOT NULL,
    "funcao_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "filial_id" TEXT NOT NULL,
    "data_admissao" TIMESTAMP(3) NOT NULL,
    "data_demissao" TIMESTAMP(3),
    "status" "status_colaborador" NOT NULL DEFAULT 'ATIVO',
    "desabilitado" BOOLEAN NOT NULL DEFAULT false,
    "tipo_deficiencia" TEXT,
    "regime_trabalho" "regime_trabalho" NOT NULL DEFAULT 'EFETIVO',
    "empresa_terceira" TEXT,
    "codigo_esocial" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "colaboradores_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "colaboradores_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "colaboradores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "colaboradores_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "colaboradores_matricula_key" ON "colaboradores"("matricula");
CREATE UNIQUE INDEX "colaboradores_cpf_key" ON "colaboradores"("cpf");

-- Tabela de Atestados
CREATE TABLE "atestados" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "cid" TEXT,
    "motivo" TEXT NOT NULL,
    "tipo" "tipo_atestado" NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atestados_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "atestados_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Mandatos CIPA
CREATE TABLE "cipa_mandatos" (
    "id" TEXT NOT NULL,
    "ano_vigencia" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "filial_id" TEXT NOT NULL,
    "status" "status_cipa" NOT NULL,

    CONSTRAINT "cipa_mandatos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cipa_mandatos_filial_id_fkey" FOREIGN KEY ("filial_id") REFERENCES "filiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Eleições CIPA
CREATE TABLE "cipa_eleicoes" (
    "id" TEXT NOT NULL,
    "mandato_id" TEXT NOT NULL,
    "fim_mandato_atual" TIMESTAMP(3) NOT NULL,
    "grau_risco" INTEGER NOT NULL,
    "num_empregados" INTEGER NOT NULL,
    "dimensionamento" JSONB NOT NULL,
    "calendario" JSONB NOT NULL,

    CONSTRAINT "cipa_eleicoes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cipa_eleicoes_mandato_id_fkey" FOREIGN KEY ("mandato_id") REFERENCES "cipa_mandatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Membros CIPA
CREATE TABLE "cipa_membros" (
    "id" TEXT NOT NULL,
    "mandato_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "cargo_cipa" "cargo_cipa" NOT NULL,
    "origem" "origem_cipa" NOT NULL,
    "votos" INTEGER,

    CONSTRAINT "cipa_membros_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cipa_membros_mandato_id_fkey" FOREIGN KEY ("mandato_id") REFERENCES "cipa_mandatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cipa_membros_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Reuniões CIPA
CREATE TABLE "cipa_reunioes" (
    "id" TEXT NOT NULL,
    "mandato_id" TEXT NOT NULL,
    "data_reuniao" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "tipo_reuniao" NOT NULL,

    CONSTRAINT "cipa_reunioes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cipa_reunioes_mandato_id_fkey" FOREIGN KEY ("mandato_id") REFERENCES "cipa_mandatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabela de Planos de Ação CIPA
CREATE TABLE "cipa_planos_acao" (
    "id" TEXT NOT NULL,
    "reuniao_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "responsavel_id" TEXT NOT NULL,
    "status" "status_plano_acao" NOT NULL,

    CONSTRAINT "cipa_planos_acao_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cipa_planos_acao_reuniao_id_fkey" FOREIGN KEY ("reuniao_id") REFERENCES "cipa_reunioes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
