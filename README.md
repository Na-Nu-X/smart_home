# Lumen Habitat – Smart Home & Building Automation Website

White-label full-stack website for a certified smart home integrator (Loxone, KNX, DALI lighting,
automated shading, zoned HVAC, PV/EV energy management, security, multi-room audio).

All code and docs are in English; all user-facing copy, admin labels and seeded content are in Slovak.

```
.
├── backend/    Django 5+/6 · Django REST Framework · django-filter · django-cors-headers · Pillow
└── frontend/   Angular 22 (standalone components, Signals, strict TypeScript) · modular SCSS
```

---

## Quick start

### 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – defaults work for local development
python manage.py migrate
python manage.py seed_data         # idempotent; add --reset to wipe the catalogue first
python manage.py createsuperuser   # for /admin
python manage.py runserver 8000
```

### 2. Frontend (http://localhost:4200)

```bash
cd frontend
npm install
npm start                          # = ng serve
```

The dev build calls the API at `http://localhost:8000/api` (`frontend/src/environments/environment.ts`).
If port 8000 is already taken on your machine, run Django on another port and update `apiUrl` there.

### 3. Admin

Open **http://localhost:8000/admin/** and log in with the superuser. The Slovak admin lets the team manage:

| Section | What |
| --- | --- |
| Oblasti automatizácie | Automation domains (with inline solutions) |
| Funkčné riešenia a technológie | Solutions, benefits, protocols, prices, featured flag |
| Realizácie a referenčné projekty | Reference projects with inline photo gallery |
| Dopyty na smart home riešenie | Homeowner leads – status workflow, floor plan download, bulk actions |
| B2B spolupráca | Architect / designer / developer inquiries |

---

## REST API (`/api/`)

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/domains/` | Domains incl. `solution_count` |
| GET | `/api/solutions/` | Filters: `domain` (slug), `featured`, `protocol`, `search`, `ordering` (`name`, `starting_price_eur`, …) |
| GET | `/api/solutions/<slug>/` | Detail incl. `everyday_benefits`, `supported_protocols`, `related_solutions` |
| GET | `/api/references/` | Filters: `property_type`, `featured`, `city`, `search`, `ordering` |
| GET | `/api/references/<slug>/` | Detail incl. `photos`, `implemented_features` |
| POST | `/api/consultations/` | JSON or `multipart/form-data` (`floorplan_file`: PDF/DWG/DXF/PNG/JPG/WEBP, max 15 MB) |
| POST | `/api/partners/` | B2B inquiry |

Lead endpoints are write-only, validate with Slovak error messages, require `gdpr_consent: true` and are
rate-limited per IP (`LEAD_THROTTLE_RATE`, default `20/hour`). `selected_modules` accepts
`osvetlenie, tienenie, klima, energia, zabezpecenie, audio` (JSON list, repeated multipart keys or CSV).

Example:

```bash
curl -X POST http://localhost:8000/api/consultations/ \
  -F inquiry_goal=cenova_ponuka -F property_type=rodinny_dom -F construction_stage=hruba_stavba \
  -F floor_area_sqm=220 -F selected_modules=osvetlenie -F selected_modules=tienenie \
  -F location_city=Bratislava -F client_name="Ján Novák" -F email=jan@example.com \
  -F phone="+421 900 123 456" -F gdpr_consent=true -F floorplan_file=@podorys.pdf
```

---

## Frontend overview

| Route | Page |
| --- | --- |
| `/` | Home – hero, interactive domain grid, budget estimator, featured references, trust pillars, reviews |
| `/riesenia`, `/riesenia/:slug` | Filterable solutions directory (`?domain=`) and solution dossier |
| `/realizacie`, `/realizacie/:slug` | Filterable references (`?typ=`) and project dossier with lightbox gallery |
| `/showroom-a-proces` | Showroom invitation, 5-step process, FAQ accordion |
| `/pre-architektov` | B2B landing page + partnership form |
| `/kalkulacka` | Standalone Smart Home budget estimator |
| `/konzultacia` | 3-step consultation wizard with floor plan upload |

The wizard is pre-fillable via query params:
`/konzultacia?goal=cenova_ponuka&type=rodinny_dom&area=220&stage=hruba_stavba&modules=osvetlenie,tienenie&budget=20000-26500`
(`goal`: `cenova_ponuka | navsteva_showroomu | konzultacia_projektu`; `type`: `rodinny_dom | byt | komercny`;
`stage`: `projekt | hruba_stavba | rekonstrukcia | hotovy_dom`). The estimator and the solution/reference
detail CTAs use this automatically.

### Rebranding for a new client

1. **`frontend/src/app/core/config/site.config.ts`** – company name, wordmark, tagline, phone, e-mails,
   showroom address & hours, demo-house note, IČO/DIČ, partner badges, trust metrics, social links,
   testimonials, GDPR notice.
2. **`frontend/src/styles/_variables.scss`** – brand palette and fonts (exposed as CSS custom properties in
   `_theme.scss`, so colors can also be overridden at runtime).
3. **`frontend/src/app/core/data/estimator.ts`** – estimator price coefficients.
4. **`frontend/src/app/core/data/content.ts`** – process steps, FAQ, trust pillars, B2B services.
5. Catalogue content (domains, solutions, references) is managed in the Django admin.

### Design system

`src/styles/` contains `_variables.scss`, `_mixins.scss`, `_typography.scss`, `_theme.scss` (CSS custom
properties), `_base.scss` and `_components.scss` (buttons, chips, tags, forms, option cards, range slider).
Components import mixins with `@use 'mixins' as m;` (include path configured in `angular.json`).
No UI framework is used.

---

## Production notes

- Set `DJANGO_DEBUG=False`, a strong `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
  and `CSRF_TRUSTED_ORIGINS` in `backend/.env`.
- PostgreSQL: `pip install "psycopg[binary]"`, then set `DB_ENGINE=postgresql` and `DB_NAME/USER/PASSWORD/HOST/PORT`.
- `python manage.py collectstatic`; serve `staticfiles/` and `media/` (uploaded floor plans) via the web server.
  Restrict public access to `media/consultations/` if floor plans must stay private.
- `ng build` outputs to `frontend/dist/frontend/browser`. The production environment calls the API at
  `/api` on the same origin – proxy `/api` and `/admin` to Django and fall back to `index.html` for SPA routes.

## Verification

```bash
cd backend && python manage.py check
cd frontend && npx ng build
```
