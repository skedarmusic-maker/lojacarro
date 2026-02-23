-- Adiciona a coluna preco_promocional na tabela veiculos
ALTER TABLE veiculos
ADD COLUMN preco_promocional INTEGER DEFAULT NULL;

-- Garante que se atualizarmos a policy, o logista ainda possa editar o preco_promocional
-- (A policy atual permite UPDATE em qualquer coluna para a loja correta, entáo isso é suficiente).
