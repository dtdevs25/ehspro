
-- Tabela de Usuários (usuarios)
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `funcao` ENUM('MASTER', 'USUARIO') NOT NULL DEFAULT 'USUARIO',
    `nome_cargo` VARCHAR(191),
    `permissoes` JSON NOT NULL,
    `filiais_permitidas` JSON,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Empresas (empresas)
CREATE TABLE `empresas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `cnae` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `empresas_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Filiais (filiais)
CREATE TABLE `filiais` (
    `id` VARCHAR(191) NOT NULL,
    `empresa_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `cnae` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `filiais_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`),
    CONSTRAINT `filiais_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Funções (funcoes)
CREATE TABLE `funcoes` (
    `id` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cbo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Cargos (cargos)
CREATE TABLE `cargos` (
    `id` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `funcao_id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `cargos_funcao_id_fkey` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Colaboradores (colaboradores)
CREATE TABLE `colaboradores` (
    `id` VARCHAR(191) NOT NULL,
    `matricula` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NOT NULL,
    `nome_mae` VARCHAR(191) NOT NULL,
    `nome_pai` VARCHAR(191) NOT NULL,
    `data_nascimento` DATETIME(3) NOT NULL,
    `naturalidade` VARCHAR(191) NOT NULL,
    `uf_nascimento` VARCHAR(191) NOT NULL,
    `nacionalidade` VARCHAR(191) NOT NULL,
    `escolaridade` VARCHAR(191) NOT NULL,
    `estado_civil` VARCHAR(191) NOT NULL,
    `genero` VARCHAR(191) NOT NULL,
    `raca` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cargo_id` VARCHAR(191) NOT NULL,
    `funcao_id` VARCHAR(191) NOT NULL,
    `empresa_id` VARCHAR(191) NOT NULL,
    `filial_id` VARCHAR(191) NOT NULL,
    `data_admissao` DATETIME(3) NOT NULL,
    `data_demissao` DATETIME(3),
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `desabilitado` BOOLEAN NOT NULL DEFAULT false,
    `tipo_deficiencia` VARCHAR(191),
    `regime_trabalho` ENUM('EFETIVO', 'TERCEIRO') NOT NULL DEFAULT 'EFETIVO',
    `empresa_terceira` VARCHAR(191),
    `codigo_esocial` VARCHAR(191),
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `colaboradores_matricula_key`(`matricula`),
    UNIQUE INDEX `colaboradores_cpf_key`(`cpf`),
    PRIMARY KEY (`id`),
    CONSTRAINT `colaboradores_cargo_id_fkey` FOREIGN KEY (`cargo_id`) REFERENCES `cargos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `colaboradores_funcao_id_fkey` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `colaboradores_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `colaboradores_filial_id_fkey` FOREIGN KEY (`filial_id`) REFERENCES `filiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Atestados (atestados)
CREATE TABLE `atestados` (
    `id` VARCHAR(191) NOT NULL,
    `colaborador_id` VARCHAR(191) NOT NULL,
    `data_inicio` DATETIME(3) NOT NULL,
    `data_fim` DATETIME(3) NOT NULL,
    `dias` INTEGER NOT NULL,
    `cid` VARCHAR(191),
    `motivo` VARCHAR(191) NOT NULL,
    `tipo` ENUM('MEDICO', 'ACIDENTE', 'FAMILIA', 'OUTROS') NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `atestados_colaborador_id_fkey` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Mandatos CIPA (cipa_mandatos)
CREATE TABLE `cipa_mandatos` (
    `id` VARCHAR(191) NOT NULL,
    `ano_vigencia` VARCHAR(191) NOT NULL,
    `data_inicio` DATETIME(3) NOT NULL,
    `data_fim` DATETIME(3) NOT NULL,
    `filial_id` VARCHAR(191) NOT NULL,
    `status` ENUM('ATIVO', 'FINALIZADO', 'ELEICAO') NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `cipa_mandatos_filial_id_fkey` FOREIGN KEY (`filial_id`) REFERENCES `filiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Eleições CIPA (cipa_eleicoes)
CREATE TABLE `cipa_eleicoes` (
    `id` VARCHAR(191) NOT NULL,
    `mandato_id` VARCHAR(191) NOT NULL,
    `fim_mandato_atual` DATETIME(3) NOT NULL,
    `grau_risco` INTEGER NOT NULL,
    `num_empregados` INTEGER NOT NULL,
    `dimensionamento` JSON NOT NULL,
    `calendario` JSON NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `cipa_eleicoes_mandato_id_fkey` FOREIGN KEY (`mandato_id`) REFERENCES `cipa_mandatos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Membros CIPA (cipa_membros)
CREATE TABLE `cipa_membros` (
    `id` VARCHAR(191) NOT NULL,
    `mandato_id` VARCHAR(191) NOT NULL,
    `colaborador_id` VARCHAR(191) NOT NULL,
    `cargo_cipa` ENUM('PRESIDENTE', 'VICE_PRESIDENTE', 'SECRETARIO', 'TITULAR', 'SUPLENTE') NOT NULL,
    `origem` ENUM('EMPREGADOR', 'EMPREGADO') NOT NULL,
    `votos` INTEGER,

    PRIMARY KEY (`id`),
    CONSTRAINT `cipa_membros_mandato_id_fkey` FOREIGN KEY (`mandato_id`) REFERENCES `cipa_mandatos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `cipa_membros_colaborador_id_fkey` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Reuniões CIPA (cipa_reunioes)
CREATE TABLE `cipa_reunioes` (
    `id` VARCHAR(191) NOT NULL,
    `mandato_id` VARCHAR(191) NOT NULL,
    `data_reuniao` DATETIME(3) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ORDINARIA', 'EXTRAORDINARIA') NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `cipa_reunioes_mandato_id_fkey` FOREIGN KEY (`mandato_id`) REFERENCES `cipa_mandatos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela de Planos de Ação CIPA (cipa_planos_acao)
CREATE TABLE `cipa_planos_acao` (
    `id` VARCHAR(191) NOT NULL,
    `reuniao_id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `prazo` DATETIME(3) NOT NULL,
    `responsavel_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO') NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `cipa_planos_acao_reuniao_id_fkey` FOREIGN KEY (`reuniao_id`) REFERENCES `cipa_reunioes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
