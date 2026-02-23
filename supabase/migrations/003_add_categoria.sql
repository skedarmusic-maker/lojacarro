-- Adiciona a coluna categoria na tabela de veículos
ALTER TABLE public.veiculos
ADD COLUMN categoria TEXT DEFAULT 'Outros' CHECK (categoria IN ('Carros elétricos', 'Hatches', 'Picapes', 'Sedans', 'SUVs', 'Outros'));

-- Atualizar veículos existentes para terem uma categoria padrão se necessário (opcional)
-- UPDATE public.veiculos SET categoria = 'Outros' WHERE categoria IS NULL;
