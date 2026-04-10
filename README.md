# 🍽️ LauSai — Captura el teu moment i fes-lo etern

App web PWA per capturar i recordar moments gastronòmics.

---

## 🚀 Instal·lació i execució local

### Prerequisits
- Node.js 18 o superior
- npm 9 o superior

### Passos

```bash
# 1. Descomprimeix el projecte i entra-hi
cd lausai

# 2. Instal·la les dependències
npm install

# 3. Arrenca el servidor de desenvolupament
npm run dev
```

L'app estarà disponible a `http://localhost:5173`

> ⚠️ La càmera i la geolocalització **requereixen HTTPS**. En local funcionen amb `localhost`.

---

## 📦 Desplegar a Vercel

### Opció A — Via GitHub (recomanada)

```bash
# 1. Inicialitza Git al projecte
git init
git add .
git commit -m "feat: LauSai MVP inicial"

# 2. Crea repositori a github.com/shsolucions/lausai
git remote add origin https://github.com/shsolucions/lausai.git
git push -u origin main

# 3. Ves a vercel.com → Add New Project → Import GitHub repo
# Configuració a Vercel:
#   Framework Preset: Vite
#   Build Command: npm run build
#   Output Directory: dist
#   Node version: 20
```

### Opció B — Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🏗️ Estructura del projecte

```
lausai/
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/              # Icones app
├── src/
│   ├── components/
│   │   ├── SunsetBackground.tsx  # Posta de sol algorítmica
│   │   ├── BottomNav.tsx         # Navegació inferior
│   │   ├── ShareModal.tsx        # Modal de compartir
│   │   ├── AIAssistant.tsx       # Assistent IA (Sai)
│   │   └── Toast.tsx             # Notificacions
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Pantalla d'inici
│   │   ├── CaptureScreen.tsx     # Captura de foto
│   │   ├── RatingScreen.tsx      # Valoració i dades
│   │   ├── DiaryScreen.tsx       # Diari de moments
│   │   ├── MapScreen.tsx         # Mapa Leaflet
│   │   ├── DetailScreen.tsx      # Detall d'un moment
│   │   └── OnboardingScreen.tsx  # Primera vegada
│   ├── lib/
│   │   ├── db.ts           # Dexie.js (IndexedDB)
│   │   └── sunset.ts       # Algoritme posta de sol
│   ├── types.ts            # TypeScript interfaces
│   ├── App.tsx             # Arrel de l'app
│   └── main.tsx            # Entry point
└── package.json
```

---

## 🎨 Funcionalitats MVP

- [x] **Posta de sol diària** algorítmica (canvia cada dia)
- [x] **Captura foto** via càmera web o galeria
- [x] **Valoració** en 5 categories (qualitat, ambient, atenció, sabor, preu)
- [x] **Diari** de moments amb filtre per tipus
- [x] **Mapa** Leaflet + OpenStreetMap (gratuït, GDPR)
- [x] **Geolocalització** opcional amb text explicatiu
- [x] **Compartir** via Web Share API / descàrrega / WhatsApp
- [x] **Assistent IA** (Sai) a la cantonada inferior dreta
- [x] **PWA** installable, offline-first
- [x] **Onboarding** primera vegada
- [x] **Toast** notificacions
- [x] **Confirmació** per eliminar moments

---

## 🛠️ Stack tecnològic

| Tecnologia | Versió | Ús |
|-----------|--------|-----|
| React | 18 | UI |
| TypeScript | 5 | Tipus |
| Vite | 5 | Build |
| Tailwind CSS | 3 | Estils |
| Dexie.js | 3 | IndexedDB local |
| Leaflet | 1.9 | Mapes |
| vite-plugin-pwa | 0.20 | PWA/SW |

---

## 📝 Notes importants

### Permisos
- La **càmera** es demana just quan l'usuari toca "Obrir càmera"
- La **geolocalització** es demana un cop desat el moment, mai abans
- Ambdós permisos es poden denegar i l'app segueix funcionant

### Privacitat
- Totes les dades es guarden **localment** al dispositiu (IndexedDB)
- Les coordenades es guarden arrodonides a 3 decimals (~100m)
- No hi ha servidor ni base de dades externa al MVP

### Assistent IA
L'assistent utilitza l'API d'Anthropic. Funciona automàticament quan
l'app s'executa dins de l'entorn de Claude.ai. Per desplegar
de forma independent, caldrà gestionar l'autenticació de l'API.

---

© 2025 SH Solucions — Saïd Haddouchi
