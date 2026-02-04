
-- Script SQL para popular Empresas e Filiais (IDEMPOTENTE - Pode rodar várias vezes)
-- Execute este script no seu banco de dados PostgreSQL

-- Garante que a extensão de UUIDs esteja habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Bloco transacional
DO $$
DECLARE
    v_empresa1_id text;
    v_empresa2_id text;
    v_empresa3_id text;
    v_func_rh_id text;
    v_func_seg_id text;
    v_func_eng_id text;
    v_func_dev_id text;
BEGIN
    -- --- EMPRESA 1: INDÚSTRIA ---
    -- Tenta pegar ID existente ou insere nova
    SELECT id INTO v_empresa1_id FROM empresas WHERE cnpj = '60.705.532/0001-33';
    
    IF v_empresa1_id IS NULL THEN
        INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
        VALUES (gen_random_uuid()::text, 'Grupo Industrial EHS Corp', '60.705.532/0001-33', '29.49-2-99', 'Av. das Nações Unidas, 14200 - São Paulo, SP')
        RETURNING id INTO v_empresa1_id;
        RAISE NOTICE 'Empresa 1 criada.';
    ELSE
        RAISE NOTICE 'Empresa 1 já existe, usando ID: %', v_empresa1_id;
    END IF;

    -- Filiais da Empresa 1 (Upsert logic simples: INSERT ON CONFLICT DO NOTHING)
    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid()::text, v_empresa1_id, 'Matriz Administrativa - SP', '60.705.532/0001-33', '29.49-2-99', 'Av. das Nações Unidas, 14200 - Torre A'),
    (gen_random_uuid()::text, v_empresa1_id, 'Planta Fabril - Sorocaba', '60.705.532/0002-14', '25.92-6-02', 'Rodovia Raposo Tavares, km 102'),
    (gen_random_uuid()::text, v_empresa1_id, 'CD Logística - Cajamar', '60.705.532/0003-90', '52.11-7-99', 'Rodovia Anhanguera, km 38')
    ON CONFLICT (cnpj) DO NOTHING; -- Se o CNPJ da filial já existir, não faz nada


    -- --- EMPRESA 2: TECNOLOGIA ---
    SELECT id INTO v_empresa2_id FROM empresas WHERE cnpj = '10.222.333/0001-01';

    IF v_empresa2_id IS NULL THEN
        INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
        VALUES (gen_random_uuid()::text, 'TechSolutions Brasil Ltda', '10.222.333/0001-01', '62.01-5-01', 'Av. Dr. Hermas Braga, 500 - Campinas, SP')
        RETURNING id INTO v_empresa2_id;
        RAISE NOTICE 'Empresa 2 criada.';
    ELSE
        RAISE NOTICE 'Empresa 2 já existe, usando ID: %', v_empresa2_id;
    END IF;

    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid()::text, v_empresa2_id, 'Sede Tecnológica - Campinas', '10.222.333/0001-01', '62.01-5-01', 'Av. Dr. Hermas Braga, 500 - Nova Campinas'),
    (gen_random_uuid()::text, v_empresa2_id, 'Hub Inovação - Recife', '10.222.333/0002-84', '62.02-3-00', 'Rua do Apolo, 100 - Porto Digital - Recife, PE')
    ON CONFLICT (cnpj) DO NOTHING;


    -- --- EMPRESA 3: CONSTRUÇÃO ---
    SELECT id INTO v_empresa3_id FROM empresas WHERE cnpj = '33.444.555/0001-99';

    IF v_empresa3_id IS NULL THEN
        INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
        VALUES (gen_random_uuid()::text, 'Construtora Horizonte S.A.', '33.444.555/0001-99', '41.20-4-00', 'Av. Afonso Pena, 1500 - Belo Horizonte, MG')
        RETURNING id INTO v_empresa3_id;
        RAISE NOTICE 'Empresa 3 criada.';
    ELSE
        RAISE NOTICE 'Empresa 3 já existe, usando ID: %', v_empresa3_id;
    END IF;

    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid()::text, v_empresa3_id, 'Escritório Central - MG', '33.444.555/0001-99', '41.20-4-00', 'Av. Afonso Pena, 1500 - Savassi'),
    (gen_random_uuid()::text, v_empresa3_id, 'Canteiro de Obras - Obra Delta', '33.444.555/0002-70', '41.20-4-00', 'Rua da Bahia, 500 - Centro - BH')
    ON CONFLICT (cnpj) DO NOTHING;

    -- --- FUNÇÕES E CARGOS ---
    
    -- 1. Analista de RH
    SELECT id INTO v_func_rh_id FROM funcoes WHERE nome = 'Analista de RH' LIMIT 1;
    IF v_func_rh_id IS NULL THEN
        INSERT INTO funcoes (id, matricula, nome, cbo, descricao)
        VALUES (gen_random_uuid()::text, 'F001', 'Analista de RH', '2524-05', 'Responsável por processos de RH.')
        RETURNING id INTO v_func_rh_id;
    END IF;

    -- 2. Técnico de Segurança
    SELECT id INTO v_func_seg_id FROM funcoes WHERE nome = 'Técnico de Segurança' LIMIT 1;
    IF v_func_seg_id IS NULL THEN
        INSERT INTO funcoes (id, matricula, nome, cbo, descricao)
        VALUES (gen_random_uuid()::text, 'F002', 'Técnico de Segurança', '3516-05', 'Responsável pela segurança do trabalho.')
        RETURNING id INTO v_func_seg_id;
    END IF;

    -- 3. Engenheiro Civil
    SELECT id INTO v_func_eng_id FROM funcoes WHERE nome = 'Engenheiro Civil' LIMIT 1;
    IF v_func_eng_id IS NULL THEN
        INSERT INTO funcoes (id, matricula, nome, cbo, descricao)
        VALUES (gen_random_uuid()::text, 'F003', 'Engenheiro Civil', '2142-05', 'Responsável por obras e projetos.')
        RETURNING id INTO v_func_eng_id;
    END IF;

    -- 4. Desenvolvedor Full Stack
    SELECT id INTO v_func_dev_id FROM funcoes WHERE nome = 'Desenvolvedor Full Stack' LIMIT 1;
    IF v_func_dev_id IS NULL THEN
        INSERT INTO funcoes (id, matricula, nome, cbo, descricao)
        VALUES (gen_random_uuid()::text, 'F004', 'Desenvolvedor Full Stack', '3171-10', 'Desenvolvimento de software.')
        RETURNING id INTO v_func_dev_id;
    END IF;

    -- CARGOS (Vinculados às funções)
    
    -- Analista de RH Sênior
    IF NOT EXISTS (SELECT 1 FROM cargos WHERE nome = 'Analista de RH Sênior') THEN
        INSERT INTO cargos (id, matricula, nome, funcao_id, descricao)
        VALUES (gen_random_uuid()::text, 'C001', 'Analista de RH Sênior', v_func_rh_id, 'Analista com experiência.');
    END IF;

    -- Técnico de Segurança Pleno
    IF NOT EXISTS (SELECT 1 FROM cargos WHERE nome = 'Técnico de Segurança Pleno') THEN
        INSERT INTO cargos (id, matricula, nome, funcao_id, descricao)
        VALUES (gen_random_uuid()::text, 'C002', 'Técnico de Segurança Pleno', v_func_seg_id, 'Técnico de campo.');
    END IF;

    -- Engenheiro Coordenador
    IF NOT EXISTS (SELECT 1 FROM cargos WHERE nome = 'Engenheiro Coordenador') THEN
        INSERT INTO cargos (id, matricula, nome, funcao_id, descricao)
        VALUES (gen_random_uuid()::text, 'C003', 'Engenheiro Coordenador', v_func_eng_id, 'Coordena equipe de engenharia.');
    END IF;

     -- Dev Lead
    IF NOT EXISTS (SELECT 1 FROM cargos WHERE nome = 'Dev Lead') THEN
        INSERT INTO cargos (id, matricula, nome, funcao_id, descricao)
        VALUES (gen_random_uuid()::text, 'C004', 'Dev Lead', v_func_dev_id, 'Lidera equipe de dev.');
    END IF;


    RAISE NOTICE 'Processo concluído com sucesso!';

END $$;
