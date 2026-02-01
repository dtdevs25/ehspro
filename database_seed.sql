
-- Script SQL para popular Empresas e Filiais iniciais
-- Execute este script no seu banco de dados PostgreSQL (via PgAdmin, Beekeeper Studio ou terminal)

-- Garante que a extensão de UUIDs esteja habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Bloco transacional para garantir integridade
DO $$
DECLARE
    v_empresa_id uuid;
BEGIN
    -- 1. Cria a Empresa Principal
    -- Usamos gen_random_uuid() para gerar o ID automaticamente
    INSERT INTO empresas (id, nome, cnpj, cnae, endereco) 
    VALUES (gen_random_uuid(), 'Grupo Industrial EHS Corp', '60.705.532/0001-33', '29.49-2-99', 'Av. das Nações Unidas, 14200 - São Paulo, SP')
    RETURNING id INTO v_empresa_id; -- Salva o ID gerado na variável

    RAISE NOTICE 'Empresa Criada com ID: %', v_empresa_id;

    -- 2. Cria a Filial Matriz (Vinculada à empresa acima)
    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES (
        gen_random_uuid(), 
        v_empresa_id, -- Usa o ID da empresa recém criada
        'Matriz Administrativa - SP', 
        '60.705.532/0001-33', 
        '29.49-2-99', 
        'Av. das Nações Unidas, 14200 - Torre A - São Paulo, SP'
    );

    -- 3. Cria uma Filial Operacional (Fábrica)
    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES (
        gen_random_uuid(), 
        v_empresa_id, 
        'Planta Fabril - Sorocaba', 
        '60.705.532/0002-14', 
        '25.92-6-02', 
        'Rodovia Raposo Tavares, km 102 - Sorocaba, SP'
    );
	
	-- 4. Cria uma Filial Logística
    INSERT INTO filiais (id, empresa_id, nome, cnpj, cnae, endereco)
    VALUES (
        gen_random_uuid(), 
        v_empresa_id, 
        'Centro de Distribuição - Cajamar', 
        '60.705.532/0003-90', 
        '52.11-7-99', 
        'Rodovia Anhanguera, km 38 - Cajamar, SP'
    );

    RAISE NOTICE 'Filiais criadas com sucesso!';
END $$;
