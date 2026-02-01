
-- Script SQL para popular Empresas e Filiais (Versão Estendida)
-- Execute este script no seu banco de dados PostgreSQL

-- Garante que a extensão de UUIDs esteja habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Bloco transacional
DO $$
DECLARE
    v_empresa1_id uuid;
    v_empresa2_id uuid;
    v_empresa3_id uuid;
BEGIN
    -- --- EMPRESA 1: INDÚSTRIA ---
    INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
    VALUES (gen_random_uuid(), 'Grupo Industrial EHS Corp', '60.705.532/0001-33', '29.49-2-99', 'Av. das Nações Unidas, 14200 - São Paulo, SP')
    RETURNING id INTO v_empresa1_id;

    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid(), v_empresa1_id, 'Matriz Administrativa - SP', '60.705.532/0001-33', '29.49-2-99', 'Av. das Nações Unidas, 14200 - Torre A'),
    (gen_random_uuid(), v_empresa1_id, 'Planta Fabril - Sorocaba', '60.705.532/0002-14', '25.92-6-02', 'Rodovia Raposo Tavares, km 102'),
    (gen_random_uuid(), v_empresa1_id, 'CD Logística - Cajamar', '60.705.532/0003-90', '52.11-7-99', 'Rodovia Anhanguera, km 38');

    RAISE NOTICE 'Empresa 1 criada: Grupo Industrial EHS Corp';

    -- --- EMPRESA 2: TECNOLOGIA ---
    INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
    VALUES (gen_random_uuid(), 'TechSolutions Brasil Ltda', '10.222.333/0001-01', '62.01-5-01', 'Av. Dr. Hermas Braga, 500 - Campinas, SP')
    RETURNING id INTO v_empresa2_id;

    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid(), v_empresa2_id, 'Sede Tecnológica - Campinas', '10.222.333/0001-01', '62.01-5-01', 'Av. Dr. Hermas Braga, 500 - Nova Campinas'),
    (gen_random_uuid(), v_empresa2_id, 'Hub Inovação - Recife', '10.222.333/0002-84', '62.02-3-00', 'Rua do Apolo, 100 - Porto Digital - Recife, PE');

    RAISE NOTICE 'Empresa 2 criada: TechSolutions Brasil';

    -- --- EMPRESA 3: CONSTRUÇÃO ---
    INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
    VALUES (gen_random_uuid(), 'Construtora Horizonte S.A.', '33.444.555/0001-99', '41.20-4-00', 'Av. Afonso Pena, 1500 - Belo Horizonte, MG')
    RETURNING id INTO v_empresa3_id;

    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES 
    (gen_random_uuid(), v_empresa3_id, 'Escritório Central - MG', '33.444.555/0001-99', '41.20-4-00', 'Av. Afonso Pena, 1500 - Savassi'),
    (gen_random_uuid(), v_empresa3_id, 'Canteiro de Obras - Obra Delta', '33.444.555/0002-70', '41.20-4-00', 'Rua da Bahia, 500 - Centro - BH');

    RAISE NOTICE 'Empresa 3 criada: Construtora Horizonte';

END $$;
