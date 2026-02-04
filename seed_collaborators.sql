
-- Script SQL para popular Colaboradores Fictícios
-- Idempotente (roda apenas se não existir)

DO $$
DECLARE
    -- Variáveis para armazenar IDs
    v_empresa1_id text;
    v_filial_matriz_id text;
    v_filial_planta_id text;
    
    v_func_rh_id text;
    v_func_seg_id text;
    v_func_eng_id text;
    v_func_dev_id text;
    
    v_cargo_rh_id text;
    v_cargo_seg_id text;
    v_cargo_eng_id text;
    v_cargo_dev_id text;

BEGIN
    -- 1. RECUPERAR IDS DE EMPRESA E FILIAIS
    SELECT id INTO v_empresa1_id FROM empresas WHERE cnpj = '60.705.532/0001-33';
    SELECT id INTO v_filial_matriz_id FROM filiais WHERE cnpj = '60.705.532/0001-33';
    SELECT id INTO v_filial_planta_id FROM filiais WHERE cnpj = '60.705.532/0002-14';

    -- Se não encontrar, aborta para evitar erros (poderia criar, mas o seed anterior já cria)
    IF v_empresa1_id IS NULL THEN 
       RAISE NOTICE 'Empresa principal não encontrada. Rode o seed anterior primeiro.';
       RETURN;
    END IF;

    -- 2. RECUPERAR IDS DE FUNÇÕES
    SELECT id INTO v_func_rh_id FROM funcoes WHERE nome = 'Analista de RH' LIMIT 1;
    SELECT id INTO v_func_seg_id FROM funcoes WHERE nome = 'Técnico de Segurança' LIMIT 1;
    SELECT id INTO v_func_eng_id FROM funcoes WHERE nome = 'Engenheiro Civil' LIMIT 1;
    SELECT id INTO v_func_dev_id FROM funcoes WHERE nome = 'Desenvolvedor Full Stack' LIMIT 1;

    -- 3. RECUPERAR IDS DE CARGOS
    SELECT id INTO v_cargo_rh_id FROM cargos WHERE nome = 'Analista de RH Sênior' LIMIT 1;
    SELECT id INTO v_cargo_seg_id FROM cargos WHERE nome = 'Técnico de Segurança Pleno' LIMIT 1;
    SELECT id INTO v_cargo_eng_id FROM cargos WHERE nome = 'Engenheiro Coordenador' LIMIT 1;
    SELECT id INTO v_cargo_dev_id FROM cargos WHERE nome = 'Dev Lead' LIMIT 1;

    -- 4. INSERIR COLABORADORES (10 users)
    
    -- Colaborador 1: RH (Matriz)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1001', 'Ana Silva', '111.222.333-01', '12.345.678-0', 'Maria Silva', 'João Silva', '1990-05-15', 'São Paulo', 'SP', 'Brasileira', 'Superior Completo', 'Solteiro(a)', 'Feminino', 'Branca', 'Rua das Flores, 100', '11999991111', 'ana.silva@ehscorp.com', v_cargo_rh_id, v_func_rh_id, v_empresa1_id, v_filial_matriz_id, '2022-01-10', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 2: RH (Matriz)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1002', 'Beatriz Costa', '222.333.444-02', '23.456.789-0', 'Julia Costa', 'Pedro Costa', '1992-08-22', 'Campinas', 'SP', 'Brasileira', 'Pós-Graduação', 'Casado(a)', 'Feminino', 'Parda', 'Av. Brasil, 200', '11999992222', 'beatriz.costa@ehscorp.com', v_cargo_rh_id, v_func_rh_id, v_empresa1_id, v_filial_matriz_id, '2022-03-15', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 3: Tech Security (Planta)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1003', 'Carlos Oliveira', '333.444.555-03', '34.567.890-1', 'Sonia Oliveira', 'Marcos Oliveira', '1985-11-30', 'Sorocaba', 'SP', 'Brasileira', 'Técnico', 'Casado(a)', 'Masculino', 'Branca', 'Rua do Porto, 30', '15999993333', 'carlos.oliveira@ehscorp.com', v_cargo_seg_id, v_func_seg_id, v_empresa1_id, v_filial_planta_id, '2021-05-20', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 4: Tech Security (Planta)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1004', 'Daniel Souza', '444.555.666-04', '45.678.901-2', 'Carla Souza', 'Renato Souza', '1988-02-14', 'Itu', 'SP', 'Brasileira', 'Técnico', 'Solteiro(a)', 'Masculino', 'Preta', 'Av. Industrial, 400', '15999994444', 'daniel.souza@ehscorp.com', v_cargo_seg_id, v_func_seg_id, v_empresa1_id, v_filial_planta_id, '2023-01-05', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 5: Engenheiro (Planta)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1005', 'Eduardo Lima', '555.666.777-05', '56.789.012-3', 'Patricia Lima', 'Roberto Lima', '1980-07-20', 'Belo Horizonte', 'MG', 'Brasileira', 'Superior Completo', 'Divorciado(a)', 'Masculino', 'Branca', 'Rua das Minas, 500', '15999995555', 'eduardo.lima@ehscorp.com', v_cargo_eng_id, v_func_eng_id, v_empresa1_id, v_filial_planta_id, '2020-02-10', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 6: Dev (Matriz - TI)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1006', 'Fernanda Santos', '666.777.888-06', '67.890.123-4', 'Vera Santos', 'Luiz Santos', '1995-09-10', 'São Paulo', 'SP', 'Brasileira', 'Superior Completo', 'Solteiro(a)', 'Feminino', 'Parda', 'Rua Augusta, 1000', '11999996666', 'fernanda.santos@ehscorp.com', v_cargo_dev_id, v_func_dev_id, v_empresa1_id, v_filial_matriz_id, '2023-06-01', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 7: Dev (Matriz - TI)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1007', 'Gabriel Pereira', '777.888.999-07', '78.901.234-5', 'Leticia Pereira', 'Antonio Pereira', '1993-04-25', 'Curitiba', 'PR', 'Brasileira', 'Superior Completo', 'Solteiro(a)', 'Masculino', 'Branca', 'Av. Paulista, 2000', '11999997777', 'gabriel.pereira@ehscorp.com', v_cargo_dev_id, v_func_dev_id, v_empresa1_id, v_filial_matriz_id, '2023-04-12', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 8: Engenheiro (Planta)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1008', 'Helena Martins', '888.999.000-08', '89.012.345-6', 'Claudia Martins', 'Ricardo Martins', '1987-12-05', 'Rio de Janeiro', 'RJ', 'Brasileira', 'Pós-Graduação', 'Casado(a)', 'Feminino', 'Branca', 'Rua da Praia, 50', '15999998888', 'helena.martins@ehscorp.com', v_cargo_eng_id, v_func_eng_id, v_empresa1_id, v_filial_planta_id, '2019-11-20', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 9: Tech Security (Matriz)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1009', 'Igor Alves', '999.000.111-09', '90.123.456-7', 'Monica Alves', 'Fernando Alves', '1991-06-18', 'Salvador', 'BA', 'Brasileira', 'Técnico', 'Solteiro(a)', 'Masculino', 'Parda', 'Rua do Pelourinho, 10', '11999999999', 'igor.alves@ehscorp.com', v_cargo_seg_id, v_func_seg_id, v_empresa1_id, v_filial_matriz_id, '2022-09-01', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    -- Colaborador 10: RH (Planta)
    INSERT INTO colaboradores (id, matricula, nome, cpf, rg, nome_mae, nome_pai, data_nascimento, naturalidade, uf_nascimento, nacionalidade, escolaridade, estado_civil, genero, raca, endereco, telefone, email, cargo_id, funcao_id, empresa_id, filial_id, data_admissao, status, regime_trabalho)
    VALUES (gen_random_uuid()::text, '1010', 'Julia Rocha', '000.111.222-10', '01.234.567-8', 'Rosana Rocha', 'Paulo Rocha', '1994-01-30', 'Florianópolis', 'SC', 'Brasileira', 'Superior Completo', 'Solteiro(a)', 'Feminino', 'Branca', 'Av. Beira Mar, 100', '15999990000', 'julia.rocha@ehscorp.com', v_cargo_rh_id, v_func_rh_id, v_empresa1_id, v_filial_planta_id, '2023-07-15', 'ATIVO', 'EFETIVO')
    ON CONFLICT (cpf) DO NOTHING;

    RAISE NOTICE '10 Colaboradores fictícios inseridos com sucesso!';

END $$;
