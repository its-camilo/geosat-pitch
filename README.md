# GeoSAT Dibulla — Pitch interactivo

Presentación horizontal tipo “scrollytelling” para el pitch **GeoSAT: Sistema de Alerta Temprana para Dibulla**. El desplazamiento vertical del usuario se traduce en un recorrido horizontal entre diapositivas, usando **Vite**, **JavaScript vanilla** y **GSAP + ScrollTrigger**.

## Requisitos

- [Node.js](https://nodejs.org/) LTS (recomendado v20 o superior)
- npm (incluido con Node)

## Instalación y desarrollo local

En la raíz del proyecto:

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Crear el proyecto desde cero (referencia)

Si iniciaras otro directorio vacío con la plantilla vanilla de Vite e instalaras GSAP:

```bash
npm create vite@latest geosat-pitch -- --template vanilla
cd geosat-pitch
npm install
npm install gsap
npm run dev
```

## Scripts

| Comando        | Descripción                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Servidor de desarrollo con HMR |
| `npm run build` | Compilación para producción   |
| `npm run preview` | Vista previa del build      |

## Despliegue en GitHub Pages (GitHub Actions)

El repositorio incluye [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml): en cada push a `main` o `master` ejecuta `npm ci`, `npm run build` y sube `dist/` a Pages.

### Pasos en GitHub

1. **Sube el workflow**  
   Haz commit y push del archivo `.github/workflows/deploy-pages.yml` (y del resto del proyecto) al remoto.

2. **Activa GitHub Pages con Actions**  
   En el repo: **Settings → Pages** → **Build and deployment** → **Source**: elige **GitHub Actions** (no “Deploy from a branch”).

3. **Primera ejecución**  
   Ve a **Actions**, abre el workflow **Deploy to GitHub Pages** y comprueba que el job termina en verde. Si GitHub pide aprobar el entorno `github-pages`, autorízalo cuando te lo indique.

4. **URL del sitio**  
   En **Settings → Pages** verás **Your site is live at** `https://<usuario>.github.io/<nombre-repo>/` (repositorio estándar). La primera vez puede tardar uno o dos minutos.

5. **Despliegues siguientes**  
   Cada push a `main` o `master` vuelve a desplegar. También puedes lanzar el workflow a mano: **Actions → Deploy to GitHub Pages → Run workflow**.

### Build local (opcional)

```bash
npm run build
```

La salida queda en `dist/`.

### Base URL en Vite (`vite.config.js`)

Con `base: './'` (valor actual) las rutas de assets son relativas y suelen funcionar tanto en subruta (`usuario.github.io/repo/`) como en otros hosts estáticos. Si necesitas URLs absolutas desde la raíz del dominio, usa `base: '/'` o `base: '/nombre-del-repo/'` según el caso.

## Estructura relevante

- `index.html` — Marcado de las secciones `.slide`.
- `src/main.js` — Animación horizontal con ScrollTrigger (el desplazamiento depende del ancho real del `.horizontal-wrapper`, calculado a partir del número de `.slide`).
- `src/style.css` — Paleta, layout y estilos de diapositiva.

## Insertar video, imagen o animación 3D

Cada diapositiva incluye un contenedor vacío:

```html
<div class="media-placeholder" data-media-slot="1"></div>
```

**Video (HTML5):** dentro del `div`, añade por ejemplo:

```html
<video class="pitch-media" src="/videos/diagnostico.webm" controls playsinline></video>
```

**Imagen:**

```html
<img class="pitch-media" src="/img/mapa-dibulla.webp" alt="Descripción" />
```

**Canvas / WebGL:** inserta el `<canvas>` en el mismo `div` y monta tu escena apuntando a ese elemento desde tu módulo JS.

Recomendaciones:

- Coloca archivos pesados en `public/` (p. ej. `public/videos/...`) para servirlos con URL absoluta desde la raíz del sitio.
- Añade reglas CSS para `.pitch-media` (por ejemplo `width: 100%; height: 100%; object-fit: contain; border-radius: inherit`) si quieres que rellenen el hueco sin romper el layout.

## Licencia

Uso interno / presentación; ajusta según tu organización.
