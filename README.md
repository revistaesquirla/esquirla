# ESQUIRLA

Sistema de revista digital para un colegio. No es una página estática: es un CMS pequeño.
El administrador entra a `/admin`, crea una edición, sube su portada y su PDF, le da publicar,
y la edición aparece sola en la web. Nadie toca código.

- **Web pública** — inicio, ediciones, lector de PDF integrado, posts, sobre, participa.
- **Panel** — login, dashboard, ediciones, posts con editor de texto, fragmentos, configuración.

---

## 1. Arquitectura

| Capa | Qué se usa | Por qué |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript | Un solo proyecto para web pública y panel. |
| Backend | Server Actions y Route Handlers de Next.js | No hace falta un servidor aparte. |
| Base de datos | Supabase (PostgreSQL) | Gratis para este tamaño, con RLS incluida. |
| Autenticación | Supabase Auth | Nunca guardamos contraseñas nosotros. |
| Archivos | Supabase Storage | PDFs y fotos fuera del repositorio de GitHub. |
| Estilos | Tailwind CSS 3 | Se usa la versión 3 (no la 4) por estabilidad y documentación. |
| Lector de PDF | react-pdf sobre PDF.js | Lector propio dentro de la página, no el visor del navegador. |
| Editor | TipTap | Escribir artículos con negritas, citas e imágenes, sin HTML. |

Se mantuvo el stack que pediste. La única decisión que se tomó por cuenta propia fue quedarse en
Tailwind 3 en lugar de la 4, porque la 4 cambió su forma de configurarse hace poco y para un
proyecto escolar conviene la versión con más tutoriales y respuestas en internet.

### Cómo se protege el contenido

Tres barreras, no una:

1. **Middleware** (`middleware.ts`) — bloquea `/admin` para quien no haya iniciado sesión.
2. **Layout del panel** — vuelve a comprobar la sesión y además que el perfil tenga `role = 'admin'`.
3. **Row Level Security en Postgres** — aunque alguien llame directo a la API de Supabase desde la
   consola del navegador, la base de datos solo le deja leer lo publicado.

La clave `anon` es pública por diseño; puede ir en el navegador. Lo que protege los datos es RLS.
Por eso este proyecto **no usa ni necesita la `service_role key`**.

### Cómo funciona la subida de archivos

No es una simulación. El flujo real es:

```
Navegador                Server Action              Supabase Storage
    │                         │                            │
    │── tipo, tamaño, nombre ─►│                            │
    │                         │─ comprueba que seas admin   │
    │                         │─ valida tipo y tamaño       │
    │                         │── pide URL firmada ────────►│
    │◄─── URL firmada ────────│                            │
    │                                                       │
    │══ PUT del archivo con barra de progreso (XHR) ════════►│
    │                                                       │
    │── guarda la ruta y la URL en la tabla ────────────────►│
```

El PDF no pasa por el servidor de Next.js, así que no hay límite de 4,5 MB de Vercel.
Y aunque alguien manipulara el formulario, el bucket de Supabase rechaza cualquier archivo que no
sea un PDF de menos de 50 MB o una imagen de menos de 8 MB.

---

## 2. Estructura de archivos

```
esquirla/
├── app/
│   ├── layout.tsx                  Fuentes, metadatos globales
│   ├── globals.css                 Sistema de diseño
│   ├── error.tsx  not-found.tsx    Estados de error
│   ├── robots.ts  sitemap.ts       SEO técnico
│   ├── (public)/                   ── WEB PÚBLICA ──
│   │   ├── layout.tsx              Header + footer
│   │   ├── page.tsx                Inicio (hero, fragmentos, últimos posts)
│   │   ├── ediciones/page.tsx      Todas las ediciones
│   │   ├── ediciones/[id]/page.tsx Ficha de una edición
│   │   ├── posts/page.tsx          Posts con filtro por categoría
│   │   ├── posts/[slug]/page.tsx   Artículo
│   │   ├── sobre/page.tsx
│   │   └── participa/page.tsx
│   ├── leer/[id]/page.tsx          Lector de PDF
│   ├── admin/
│   │   ├── login/page.tsx          Inicio de sesión
│   │   └── (panel)/                ── PANEL (protegido) ──
│   │       ├── layout.tsx          Guarda de sesión y rol
│   │       ├── page.tsx            Dashboard
│   │       ├── ediciones/          Listado · nueva · [id]
│   │       ├── posts/              Listado · nuevo · [id]
│   │       ├── fragmentos/page.tsx
│   │       └── configuracion/page.tsx
│   └── auth/signout/route.ts       Cerrar sesión
│
├── actions/                        Server Actions (escritura)
│   ├── auth.ts  storage.ts
│   ├── editions.ts  posts.ts
│   ├── categories.ts  fragments.ts  settings.ts
│
├── components/
│   ├── public/                     Header, footer, tarjetas, marquesina
│   ├── admin/                      Shell, formularios, subidas, confirmaciones
│   ├── editor/rich-text-editor.tsx Editor TipTap
│   └── reader/                     Lector de PDF (+ carga sin SSR)
│
├── lib/
│   ├── supabase/                   client · server · middleware · guards
│   ├── queries.ts                  Todas las lecturas de datos
│   ├── validators.ts               Esquemas Zod
│   ├── upload.ts  image.ts         Subida con progreso · optimización
│   └── constants.ts  utils.ts
│
├── types/database.ts               Tipos de las tablas
├── supabase/                       ── SQL, en orden ──
│   ├── 01_schema.sql               Tablas y triggers
│   ├── 02_policies.sql             Row Level Security
│   ├── 03_storage.sql              Buckets y permisos de archivos
│   ├── 04_seed.sql                 Categorías + contenido DEMO
│   └── 05_crear_admin.sql          Convertir tu usuario en admin
│
├── scripts/copy-pdf-worker.mjs     Copia el worker de PDF.js a /public
├── middleware.ts                   Refresco de sesión + candado de /admin
├── .env.example                    Plantilla de variables
└── next.config.mjs  tailwind.config.ts  tsconfig.json
```

### Base de datos

```
editions     id · issue_number · year · title · subtitle · description
             cover_path/url · pdf_path/url · pdf_size · page_count
             status · featured · published_at · created_at · updated_at

posts        id · title · slug · subtitle · excerpt · content (JSON) · content_html
             cover_path/url · author · category_id · edition_id
             status · featured · published_at · created_at · updated_at

categories   id · name · slug · description · created_at
fragments    id · kind · body · attribution · image_path/url · post_id · status · position
profiles     id · full_name · role ('admin' | 'reader') · created_at
settings     fila única: nombre, frase, textos de Sobre y Participa, contacto
```

`status` es `draft` (borrador), `published` (publicada) u `hidden` (oculta).

---

## 3. Instalación paso a paso

Necesitas **Node.js 18.18 o superior** y una cuenta de GitHub. Todo lo demás es gratis.

### Paso 1 — Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta.
2. **New project**. Nómbralo `esquirla`.
3. Elige una contraseña para la base de datos y **guárdala** (no la vas a necesitar en esta app,
   pero perderla es un dolor de cabeza).
4. Región: la más cercana. Para Colombia, `East US (North Virginia)` funciona bien.
5. Espera un par de minutos a que termine de crearse.

### Paso 2 y 3 — Crear las tablas

1. En el menú lateral: **SQL Editor** → **New query**.
2. Abre `supabase/01_schema.sql`, copia todo, pégalo y presiona **Run**.
3. Debe decir *Success*. Si dice error, léelo: normalmente es que pegaste el archivo a medias.

### Paso 4 — Seguridad (RLS)

Repite lo mismo con `supabase/02_policies.sql`.

Sin este paso la web se ve vacía: RLS está activa y sin políticas nadie puede leer nada.

### Paso 5 — Crear los buckets de archivos

Ejecuta `supabase/03_storage.sql`.

Esto crea dos buckets y sus permisos:

- `media` — imágenes, con las carpetas `covers/`, `posts/` y `gallery/`. Máximo 8 MB por imagen.
- `pdfs` — las revistas. Máximo 50 MB por archivo.

Puedes comprobarlo en **Storage**: deben aparecer los dos, marcados como públicos.

### Paso 6 — Contenido inicial

Ejecuta `supabase/04_seed.sql`.

Crea las siete categorías (ESCENA, RUIDO, RETRATO, PASILLO, CRÓNICA, CAOS, OPINIÓN) y una
edición y un post **marcados como DEMO**, para que veas el sitio funcionando desde el primer día.
Bórralos desde el panel cuando tengas contenido real.

### Paso 7 — Crear tu usuario administrador

Son dos partes y el orden importa.

**7a. Crear el usuario**

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Escribe tu correo y una contraseña.
3. Marca **Auto Confirm User**. Si no lo marcas, Supabase espera que confirmes por correo.

**7b. Darle el rol de admin**

1. Vuelve al **SQL Editor**.
2. Abre `supabase/05_crear_admin.sql`, cambia `CAMBIA_ESTO@tucolegio.edu.co` por tu correo real.
3. **Run**. Al final debe mostrarte una fila con `role = admin`.

Si te saltas 7b, el login funciona pero el panel te rechaza con
*"Esta cuenta existe pero no tiene permisos de administrador"*. Es el comportamiento correcto.

### Paso 8 — Variables de entorno

1. En Supabase: **Project Settings** → **Data API** → copia el **Project URL**.
2. **Project Settings** → **API Keys** → copia la clave **anon / public**.
3. En la carpeta del proyecto, copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

4. Rellénalo:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` está en `.gitignore`: no se sube a GitHub. La clave `anon` es pública de todos
modos, pero mantener la costumbre de no subir archivos de entorno es buena higiene.

### Paso 9 — Instalar dependencias

```bash
npm install
```

Esto también copia el worker de PDF.js a `public/pdf.worker.min.mjs`. Si alguna vez el lector
dice que no puede cargar, vuelve a correr `npm install`.

### Paso 10 — Ejecutar en tu computador

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Deberías ver la edición DEMO en el hero.

El panel está en [http://localhost:3000/admin](http://localhost:3000/admin). Entra con el correo
y la contraseña del paso 7.

### Paso 11 — Probar la subida de un PDF

1. `/admin/ediciones/nueva`.
2. Número `2`, año actual, título de prueba.
3. Arrastra un PDF al recuadro. Verás la barra de progreso real.
4. Sube una portada en el recuadro de la derecha (se reduce automáticamente antes de subirse).
5. **Crear edición**.

Comprueba en Supabase → **Storage** → `pdfs` → `ediciones/` que el archivo esté ahí.

Si el PDF es demasiado grande verás *"El archivo PDF supera el tamaño permitido (50 MB)"*.
Comprímelo o súbelo por partes.

### Paso 12 — Probar la publicación

1. En la edición que creaste, cambia el estado a **Publicada** y guarda.
2. Abre `/ediciones` en otra pestaña. Ya está ahí, sin tocar una línea de código.
3. Márcala como **Edición destacada** y recarga la portada: el hero cambia.

### Paso 13 — Probar el lector

Entra a `/leer/[id]` desde el botón **Leer edición**. Prueba:

- flechas `←` y `→` del teclado, y los botones Anterior / Siguiente;
- el campo "Página" para saltar a una página concreta;
- los botones `−` y `+` de zoom;
- **Pantalla completa** y **Descargar**;
- en el celular: deslizar con el dedo para pasar página, y pellizcar para acercar.

En pantallas de 1024 px o más el lector muestra dos páginas a la vez, como una revista abierta.
En móvil muestra una sola.

### Paso 14 — Publicar la aplicación

**GitHub**

```bash
git init
git add .
git commit -m "ESQUIRLA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/esquirla.git
git push -u origin main
```

**Vercel**

1. [vercel.com](https://vercel.com) → entra con GitHub → **Add New** → **Project**.
2. Importa el repositorio `esquirla`. Vercel detecta Next.js solo.
3. En **Environment Variables**, agrega las tres:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → aquí va la URL de Vercel, por ejemplo
     `https://esquirla.vercel.app` (sin barra al final)
4. **Deploy**.

La primera vez no conoces la URL final hasta que despliega. Pon cualquier valor, despliega, copia
la URL real, corrígela en **Settings → Environment Variables** y vuelve a desplegar. Solo pasa una vez.

**Supabase, último ajuste**

**Authentication** → **URL Configuration** → **Site URL**: pon la URL de Vercel.

---

## 4. Uso diario

**Publicar una edición**

```
/admin  →  Nueva edición  →  número, año, título, descripción
        →  subir portada y PDF  →  estado: Publicada  →  Crear edición
```

**Escribir un post**

```
/admin  →  Nuevo post  →  título (la URL se genera sola)
        →  imagen, categoría, autor  →  escribir en el editor
        →  Crear post  →  Vista previa  →  cambiar a Publicado
```

**Vista previa antes de publicar.** Un borrador no es visible para nadie más, pero tú sí puedes
verlo con tu sesión iniciada. El botón **Vista previa** abre la página pública real.

---

## 5. Límites del plan gratuito

**Supabase (Free)**

| Recurso | Límite |
|---|---|
| Base de datos | 500 MB |
| Storage | 1 GB |
| Transferencia | 5 GB al mes |
| Usuarios activos | 50 000 al mes |
| Proyectos activos | 2 |

Una revista escolar en PDF pesa entre 5 y 30 MB. Con 1 GB caben cómodamente unas 30–50 ediciones
con sus portadas. Cuando te acerques, comprime los PDFs antes de subirlos.

**Aviso importante:** un proyecto Free de Supabase se **pausa tras 7 días sin actividad**. La web
deja de cargar datos. Se reactiva con un clic desde el panel de Supabase, y no se pierde nada,
pero si la revista va a estar meses sin moverse, entra de vez en cuando.

**Vercel (Hobby)**

| Recurso | Límite |
|---|---|
| Transferencia | 100 GB al mes |
| Uso comercial | No permitido |

El plan Hobby es para proyectos personales y educativos. Una revista escolar sin publicidad ni
venta encaja; si algún día se monetiza, hay que pasar a un plan de pago.

**Ninguno de los dos servicios cobra automáticamente al superar el límite del plan gratuito**:
bloquean o piden que subas de plan. No vas a recibir una factura sorpresa.

---

## 6. Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La web carga pero está vacía | Falta ejecutar `02_policies.sql`. Sin políticas, RLS bloquea todo. |
| "No tienes permiso para realizar esta acción" | Tu perfil no es admin. Ejecuta `05_crear_admin.sql`. |
| El login dice que no hay permisos | Correcto: el usuario existe pero su rol es `reader`. Mismo arreglo. |
| El lector no carga el PDF | Falta el worker. Ejecuta `npm install` otra vez. |
| Las portadas salen rotas | `NEXT_PUBLIC_SUPABASE_URL` mal escrita. Next.js solo permite imágenes de ese dominio. |
| "El servidor rechazó el archivo" | Formato o tamaño fuera de lo permitido por el bucket. |
| El sitio en Vercel no muestra contenido nuevo | Las variables de entorno no se aplicaron. Cámbialas y vuelve a desplegar. |

---

## 7. Contenido de prueba

`04_seed.sql` incluye una edición y un post **marcados como DEMO**. Están ahí solo para que el
sitio no se vea vacío mientras lo configuras. Bórralos desde el panel.

El post DEMO menciona un único dato real, sin agregar nada inventado alrededor: durante el Día del
Idioma de 2025, la promoción 2025 realizó una presentación de baile/remix con una representación
inspirada en Shrek, en la que participó toda la promoción. No se han inventado nombres de
estudiantes, profesores, citas ni acontecimientos.

---

## 8. Comandos

```bash
npm run dev        # servidor local
npm run build      # compilar para producción
npm run start      # servir lo compilado
npm run typecheck  # revisar tipos de TypeScript
npm run lint       # revisar estilo de código
```
