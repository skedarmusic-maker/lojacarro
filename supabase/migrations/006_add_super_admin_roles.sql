-- Adiciona a coluna is_super_admin na tabela perfis_lojas
ALTER TABLE perfis_lojas
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;

-- Atualizar o RLS para permitir que o super admin veja todas as lojas e edite
CREATE POLICY "Super admins podem ver todas as lojas"
ON perfis_lojas FOR SELECT
USING (auth.uid() = user_id OR (SELECT is_super_admin FROM perfis_lojas WHERE user_id = auth.uid() LIMIT 1) = true);

CREATE POLICY "Super admins podem editar todas as lojas"
ON perfis_lojas FOR UPDATE
USING (auth.uid() = user_id OR (SELECT is_super_admin FROM perfis_lojas WHERE user_id = auth.uid() LIMIT 1) = true);
