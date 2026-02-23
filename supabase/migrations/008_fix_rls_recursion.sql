-- 1. Remove as policies problemáticas
DROP POLICY IF EXISTS "Super admins podem ver todas as lojas" ON perfis_lojas;
DROP POLICY IF EXISTS "Super admins podem editar todas as lojas" ON perfis_lojas;

-- 2. Cria uma função Security Definer para checar se o usuário é admin sem causar recursão
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM perfis_lojas 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recria as policies usando a função
CREATE POLICY "Lojistas e SuperAdmins Ver Todas"
ON perfis_lojas FOR SELECT
USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Lojistas e SuperAdmins Editar"
ON perfis_lojas FOR UPDATE
USING (auth.uid() = user_id OR is_super_admin());
