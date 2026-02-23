# Plano de Projeto: Showroom de Carros SaaS (White-label)

## Visão Geral
Construção de uma plataforma SaaS multi-tenant focada em lojas de veículos. Diferente de um marketplace comum, cada loja terá sua própria vitrine exclusiva que poderá ser acessada via **domínio próprio (ex: www.lojadoze.com.br)**. O sistema utiliza Next.js Middleware para resolver os domínios em tempo real, garantindo SEO independente para cada lojista. O lojista terá um painel administrativo simples para gerir o estoque e personalizar a identidade visual do seu site.

## Tipo de Projeto
**WEB** (Plataforma SaaS White-label)

## Critérios de Sucesso
- Suporte a múltiplos domínios e subdomínios apontando para a mesma aplicação.
- Cada loja possui SEO e metadados (OpenGraph) exclusivos.
- Painel administrativo mobile-first para gestão rápida de estoque.
- Processamento automático de imagens (crop) para futura integração com Instagram.
- Isolamento total de dados entre lojistas (Row Level Security).

## Tech Stack
- **Framework:** Next.js (App Router) + Middleware (Domain Routing)
- **Database/Auth:** Supabase (PostgreSQL + RLS + Auth)
- **UI:** Tailwind CSS v4 + React
- **Storage:** Supabase Storage (com Edge Functions para manipulação de imagem)

## Estrutura de Arquivos (Destaque)
```text
├── src/
│   ├── middleware.ts        # Coração do roteamento de domínios customizados
│   ├── app/
│   │   ├── [tenantId]/      # Rota dinâmica interna que serve o conteúdo da loja
│   │   ├── admin/           # Dashboard global e de lojistas
```

## Divisão de Tarefas

### Fase 1: Fundação & Roteamento (P0)
- **Tarefa 1.1:** Setup Next.js + Tailwind v4
- **Tarefa 1.2:** Modelagem Supabase (Tabela `lojas` com campo `dominio_customizado` e `slug`)
- **Tarefa 1.3:** Implementação do Middleware de Domínios (Mapear Hostname -> tenantId)
- **Tarefa 1.4:** Configuração de RLS (Segurança de isolamento)

### Fase 2: Gestão de Inventário (P1)
- **Tarefa 2.1:** Login do Lojista & Cadastro de Veículo
- **Tarefa 2.2:** Upload de fotos com Recorte Automático (Instagram format)
- **Tarefa 2.3:** CRUD de Veículos (Marca, Modelo, Ano, Preço, etc.)

### Fase 3: Vitrine Customizada (P2)
- **Tarefa 3.1:** Personalização de Cores/Logo dinâmicos via Banco de Dados
- **Tarefa 3.2:** Vitrine de Carros com Filtros rápidos (Marca, Preço)
- **Tarefa 3.3:** SEO Dinâmico (Sitemaps e Meta tags por domínio)

## ✅ Phase X: Verification
- [ ] Teste de Roteamento: `curl -H "Host: cliente.com" localhost:3000` deve mostrar a loja do cliente.
- [ ] Segurança: Lojista A não pode ver/editar carros do Lojista B.
- [ ] Imagem: Upload de foto vertical deve resultar em versão recortada no Storage.
