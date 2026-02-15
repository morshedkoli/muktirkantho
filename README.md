# Muktir Kantho

Production-ready regional newspaper web app built with Next.js App Router + TypeScript, optimized for free-tier MongoDB Atlas and Vercel.

## Stack

- Next.js 16 (App Router, fully compatible with 14+ requirements)
- TypeScript + Tailwind CSS
- Prisma with MongoDB connector
- Cloudinary image hosting
- JWT admin auth
- SEO with Metadata API + JSON-LD + sitemap + robots

## Key Features

- Public pages: home, article, category, district, upazila, tag, search
- Admin pages: login, dashboard, post CRUD, category/district/upazila management
- Cloudinary uploads with `f_auto`, `q_auto`, max width 1200
- ISR (`revalidate = 60`) for public content
- Slug URLs via `slugify`
- Security hardening: input validation, route protection, upload file checks

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env.local
```

3. Generate Prisma client and push schema:

```bash
npm run prisma:generate
npm run prisma:push
```

4. (Optional) Seed starter taxonomies:

```bash
npm run db:seed
```

5. Start development server:

```bash
npm run dev
```

## Deployment (Vercel Free)

- Add all `.env.example` variables in Vercel project settings.
- Ensure MongoDB Atlas IP access allows Vercel serverless functions.
- Build command: `npm run build`
- Output: Next.js default

## Free-Tier Optimization Notes

- No binary images in MongoDB; only Cloudinary URLs and public IDs
- Indexed filter fields (slug/category/district/tags/publishedAt)
- Paginated list pages and lightweight query patterns
- Direct Cloudinary URLs (no expensive server image optimization)

## Project Structure

- `app/(public)` public news pages
- `app/(admin)` protected admin panel
- `app/api` route handlers for auth, posts, upload, taxonomies
- `lib` shared services (`prisma`, `cloudinary`, `auth`, utilities)
- `prisma/schema.prisma` database schema
