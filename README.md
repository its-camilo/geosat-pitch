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

## Despliegue en GitHub Pages

1. Genera el sitio estático:

   ```bash
   npm run build
   ```

   La salida queda en la carpeta `dist/`.

2. En el repositorio de GitHub: **Settings → Pages**.

3. **Source**: “Deploy from a branch” no aplica bien al `dist` generado en CI; lo habitual es usar **GitHub Actions** o subir el contenido de `dist/` a la rama `gh-pages`. Opción simple con [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages): en el workflow, tras `npm ci` y `npm run build`, publica la carpeta `dist`.

4. **Base URL en Vite** (`vite.config.js`):

   - Sitio en la raíz del dominio `https://usuario.github.io/`: suele usarse `base: '/'`.
   - Proyecto en subruta `https://usuario.github.io/nombre-repo/`: usa `base: '/nombre-repo/'` y vuelve a ejecutar `npm run build`.

Con `base: './'` (valor actual) muchos despliegues estáticos sirven bien los assets con rutas relativas; ajusta según tu URL real.

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
