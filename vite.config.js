import { defineConfig } from 'vite'

// Para GitHub Pages en la raíz del dominio `usuario.github.io`, usa `base: '/'`.
// Para un proyecto en subruta (`usuario.github.io/repo/`), usa `base: '/nombre-del-repo/'`.
export default defineConfig({
  base: './',
})
