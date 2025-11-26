# arruma-ruyter

Monorepo com o bot Probot (`/bot`) e a aplicação Next.js (`/web-app`).

## Pré-requisitos
- Node 18+
- GitHub App configurado para o bot (APP_ID, PRIVATE_KEY, WEBHOOK_SECRET). Use `bot/.env.example` como base.

## Setup rápido (passo a passo)
1) Na raiz, instale o tooling para os scripts compartilhados:
```
npm install
```
2) Instale as dependências de cada app:
```
npm install --prefix bot
npm install --prefix web-app
```
3) Configure o `.env` do bot (porta 3001 já está no script):
```
cd bot
copy .env.example .env   # ou cp .env.example .env (Linux/Mac)
# Preencha APP_ID, PRIVATE_KEY (PEM) e WEBHOOK_SECRET
cd ..
```

## Rodar em desenvolvimento
- Bot (porta 3001): `npm run dev:bot`
- Web (porta 3000): `npm run dev:web`
- Ambos em paralelo: `npm run dev:all`

## Notas rápidas
- O Probot fica em modo setup sem APP_ID/PRIVATE_KEY/WEBHOOK_SECRET; acesse http://localhost:3001 para instruções.
- O aviso do Next sobre lockfiles múltiplos é informativo; ajuste `turbopack.root` em `web-app/next.config.ts` ou ignore.
