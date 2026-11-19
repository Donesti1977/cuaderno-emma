# El cuaderno de Emma

Un estudio tranquilo para 3.º de Primaria. Misiones cortas, ejercicios que se corrigen solos y un progreso que sirve para saber qué repasar, no para poner notas.

La app funciona sin conexión, guarda todo en el dispositivo y se puede instalar como una aplicación en el iPad o en el ordenador.

## Estado

Fase 0 terminada y primera rebanada vertical completa:

- **Matemáticas · 3.º · Tema 1: Los números de hasta 5 cifras**
- 6 habilidades y 41 actividades (`m3-u1-a01` … `m3-u1-a41`)
- Sesiones adaptadas al ritmo elegido (5, 10, 15 o 20 minutos)
- Corrección automática, pistas y explicación después de cada fallo
- Repaso espaciado sencillo por cajas
- Racha, minutos, precisión, mapa de habilidades y 8 pegatinas
- Panel de padres con PIN, errores repetidos y copia de seguridad
- Accesibilidad: tamaño de texto, fuente para dislexia, menos movimiento y lectura en voz alta
- PWA instalable y offline

El resto de unidades de 3.º ya están dibujadas en el mapa del curso, pero aparecen como «En preparación» hasta que tengan actividades.

## Arrancarlo en local

Hace falta Node 20.19 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que imprime Vite (por defecto `http://localhost:5173`).

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprueba tipos y genera `dist/` |
| `npm run preview` | Sirve la versión compilada |
| `npm test` | Ejecuta todas las pruebas |
| `npm run validate` | Valida solo el contenido del currículo |

## Cómo está organizado

```text
src/
  data/          currículo, tipos, esquema Zod y búsquedas
  db/            Dexie/IndexedDB, repositorio, hooks y copias de seguridad
  lib/           lógica de sesiones, respuestas, repaso, estadísticas, premios y voz
  pages/         escritorio, materias, unidad, sesión, progreso, premios, padres y ajustes
  features/      motores de actividad (opción múltiple, respuesta escrita, emparejar)
  components/    piezas de interfaz reutilizables
  styles/        sistema visual completo (tokens, base, layout, componentes, páginas, sesión e impresión)
public/
  iconos/        iconos de la PWA
  arte/          capibara
  talleres/      herramientas independientes (tablas de multiplicar)
docs/            criterios de diseño y guía de contenido
```

Las rutas usan `HashRouter` y Vite compila con `base: "./"`, así que la app funciona igual en la raíz de un dominio, en una subcarpeta de GitHub Pages o abierta desde un archivo estático.

## Añadir contenido

Todo el currículo vive en `src/data/curriculum.ts`. Cada unidad declara sus habilidades y sus actividades; el esquema de `src/data/schema.ts` valida la forma y las pruebas de `src/data/content.test.ts` comprueban que no haya identificadores repetidos, opciones duplicadas ni actividades huérfanas.

Los detalles —tipos de actividad, convenciones de respuestas aceptadas y pasos para publicar una unidad— están en [`docs/contenido.md`](docs/contenido.md).

Para que una unidad aparezca como disponible:

1. `status: "ready"` en la unidad.
2. Al menos 3 habilidades y 3 actividades por habilidad.
3. `npm test` en verde.

## Datos y privacidad

- Los perfiles, el progreso, las sesiones y los intentos se guardan en **IndexedDB** (`cuaderno-emma`) dentro del navegador.
- El perfil activo se recuerda en `localStorage` (`cuaderno:profileId`).
- No hay cuentas, servidores, analítica ni envío de datos. Nada sale del dispositivo.
- El PIN de padres (por defecto `1234`) es una cortina para evitar clics accidentales, no seguridad real: los datos siguen estando en el navegador.
- Desde **Para padres → Datos y copia de seguridad** se puede descargar un JSON con todo y restaurarlo en otro dispositivo.

Si se borran los datos del sitio, se pierde el progreso. Conviene descargar una copia de vez en cuando.

## Instalarla

- **iPad/iPhone (Safari):** Compartir → Añadir a pantalla de inicio.
- **Chrome/Edge en escritorio:** icono de instalar en la barra de direcciones.
- **Android:** menú → Instalar aplicación.

La primera visita necesita conexión para guardar los archivos; después funciona offline.

## Publicar en GitHub Pages

La app está pensada para vivir en su propio repositorio, con el contenido de `estudio/` en la raíz del repositorio.

1. Crea el repositorio (por ejemplo `cuaderno-emma`).
2. Sube el contenido de `estudio/` a la raíz.
3. En GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Cada push a `main` ejecutará `.github/workflows/deploy.yml` y publicará `dist/`.

Si se prefiere mantener la app dentro de una carpeta del repositorio, cambia en el workflow `working-directory` y `path` para que apunten a `estudio/`.

## Herramientas y créditos

- **Tablas de multiplicar**: hoja imprimible en A4, enlazada desde Matemáticas y copiada en `public/talleres/tablas-multiplicar/`. El original de `primaria3º/matematicas/tablas_multiplicar` no se toca.
- **Programación de 3.º**: el temario sale de `primaria3º/tercero17_18.pdf`, del CEIP Giner de los Ríos.
- **Tipografías**: Bricolage Grotesque, Nunito y Atkinson Hyperlegible, servidas en local con Fontsource.
- **Capibara**: ilustración propia del proyecto (`public/arte/capibaras-estudiando.svg`).

## Criterios

Las decisiones de tono, color, accesibilidad y pedagogía están resumidas en [`docs/constitucion.md`](docs/constitucion.md). Si algo entra en conflicto con ese documento, gana el documento.

## Lo siguiente

- Generador de fichas imprimibles en A4 por unidad.
- Más unidades de Matemáticas de 3.º y arranque de Lengua.
- Dictado y comprensión oral con la voz del dispositivo.
- Panel de padres con histórico algo más rico, sin convertirlo en un boletín.
