-- Migração: Criação do Bucket de Storage para Imagens de Veículos

-- 1. Cria os Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('veiculos', 'veiculos', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Segurança do Storage (Logos)
CREATE POLICY "Logos publicos" 
ON storage.objects FOR SELECT 
TO public USING (bucket_id = 'logos');

CREATE POLICY "Apenas Lojistas fazem upload de logo" 
ON storage.objects FOR INSERT 
TO authenticated WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Lojistas atualizam seus logos" 
ON storage.objects FOR UPDATE 
TO authenticated USING (bucket_id = 'logos');

CREATE POLICY "Lojistas deletam seus logos" 
ON storage.objects FOR DELETE 
TO authenticated USING (bucket_id = 'logos');

-- 3. Políticas de Segurança do Storage (Veículos)
CREATE POLICY "Fotos de veiculos publicas" 
ON storage.objects FOR SELECT 
TO public USING (bucket_id = 'veiculos');

CREATE POLICY "Lojistas upload fotos veiculos" 
ON storage.objects FOR INSERT 
TO authenticated WITH CHECK (bucket_id = 'veiculos');

CREATE POLICY "Lojistas update fotos veiculos" 
ON storage.objects FOR UPDATE 
TO authenticated USING (bucket_id = 'veiculos');

CREATE POLICY "Lojistas delete fotos veiculos" 
ON storage.objects FOR DELETE 
TO authenticated USING (bucket_id = 'veiculos');
