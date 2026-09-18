# Valores Tarot — Sistema (SQLite + VPS)

Replica da planilha **Lives R$** (11 abas) em sistema com login.

## Stack para VPS (leve)
- Next.js 16 (App Router, Turbopack)
- Tailwind 4
- Prisma 6 + **SQLite** (`file:./dev.db` local, `file:/app/data/prod.db` em Docker)
- NextAuth v5 (credentials, bcryptjs)
- Cálculos: `SUM` por semana, `SUM` total mês, `SUMPRODUCT` pessoas atendidas (pesos 15*1,20*1,25*2,35*3,50*1,55*4,105*1,250*1)

## Rodar local
```bash
npm install
cp .env.example .env  # edite NEXTAUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev
npm run dev  # http://localhost:3000 -> /register -> /dashboard
```

## Importar planilha existente
1. Crie conta em `/register` com seu email
2. Baixe `full.xlsx` da planilha (já está em `/tmp/full.xlsx` neste workspace)
3. Rode:
```bash
npx tsx scripts/import-xlsx.ts --email seu@email.com --xlsx /tmp/full.xlsx
```
Cria 11 meses (Página1..Página11 como 2024/01..2024/11) com todos os valores/feiticos.

## Deploy na VPS com Docker
```bash
# na VPS
git clone <repo> && cd valores-tarot
cp .env.example .env
# edite .env: NEXTAUTH_SECRET forte, NEXTAUTH_URL=https://seu-dominio.com
docker compose up -d --build
# migrações rodam automaticamente no entrypoint; logs:
docker compose logs -f app
```
- SQLite fica no volume `sqlite_data:/app/data/prod.db` — persiste entre deploys
- Para backup: `docker cp $(docker ps -qf name=app):/app/data/prod.db ./backup.db`
- Nginx reverse proxy -> `localhost:3000` (HTTPS via certbot)

## Deploy sem Docker (PM2)
```bash
npm ci
npx prisma migrate deploy
npm run build
DATABASE_URL="file:./prisma/prod.db" pm2 start npm --name tarot -- start
pm2 save && pm2 startup
```

## Variáveis .env VPS
```
DATABASE_URL="file:/app/data/prod.db"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://seu-dominio.com"
```

## Testado
- `npm run build` OK
- Prisma migrate OK (SQLite 52KB inicial)
- Dashboard com CRUD por semana + exclusão
- Import script mapeia abas -> entries com `type=feitico` quando coluna ao lado contém FEITIÇO
