-- Adiciona a coluna ativo na tabela perfis_lojas para controlar se a vitrine está no ar
ALTER TABLE perfis_lojas
ADD COLUMN ativo BOOLEAN DEFAULT TRUE;
