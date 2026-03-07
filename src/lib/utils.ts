import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'R$ 0';

  // Se for string, remove pontos de milhar e troca vírgula por ponto
  const raw = typeof value === 'string'
    ? value.replace(/\./g, '').replace(',', '.')
    : value;

  const num = Math.floor(parseFloat(String(raw)));
  if (isNaN(num)) return 'R$ 0';

  // Usa Intl.NumberFormat para garantir a formatação brasileira de moeda sem centavos
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
