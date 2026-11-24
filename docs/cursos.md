# Cursos de Primaria y el curso activo

El currículo ya no es único de 3º. `src/data/curriculum.ts` exporta `curricula: Record<Grade, Curriculum>`; 3º tiene contenido y 1º, 2º, 4º, 5º y 6º llevan `subjects: []` (se muestran como «En preparación»). `curriculum` sigue exportándose como el currículo de 3º y se añade `curriculumForGrade(grade)`.

## Curso activo

- `src/store/appStore.ts`: estado `grade: Grade | null` + `setGrade(grade)`. La selección se guarda en `localStorage` (`cuaderno:grade`).
- `src/context/ProfileContext.tsx`: `useActiveGrade()` → selección del menú si existe, si no `profile.grade` (el curso elegido al crear el perfil).
- `src/components/CourseSelector.tsx`: el select «Tu curso» que va en el menú izquierdo (debajo de la marca).
- `src/components/AppShell.tsx`: el riel muestra el curso activo en el encabezado (`brand__sub`) y en el chip del perfil.

## Búsquedas y estadísticas por curso

- `src/data/lookup.ts`: todas las consultas reciben `grade`: `findSubject`, `findUnit`, `findSkill`, `findActivity`, `findUnitOfActivity`, `findUnitOfSkill`, `allActivities`, `unitsOfSubject`, `readyUnits`, `studyableSubjects`. `findSubjectOfUnit` y `findSkillInUnit` no la reciben porque operan sobre el tema/habilidad ya resueltos (`unit.grade`).
- `src/lib/stats.ts`: `allUnits(grade)`; `computeStats(..., now?, grade = 3)`.
- `src/db/hooks.ts`: `useLearningStats(profileId, grade)`.

## Páginas

- **Dashboard**: la misión y la tarjeta de continuación se construyen a partir de la primera unidad lista del curso activo (`readyUnits(grade)[0]`; para 3º es `mathUnit1`, igual que antes). Si el curso activo no tiene contenido: aviso «El contenido de {grade}º todavía se está preparando.» y Materias vacía. El `select` del Dashboard se ha sustituido por el del menú izquierdo.
- **Subjects**: encabezado `{grade}º de Primaria`; nota nueva cuando no hay materias estudiables para el curso; texto de nota dinámico.
- **SubjectPage / UnitPage / SessionPage / Progress / Parent / Rewards**: pasan `useActiveGrade()` a las consultas; `Progress` muestra el curso dinámico en su chip.
- **Settings**: el select «Curso» usa el mismo estado activo (`setGrade` + `updateProfile`, para que quedan sincronizados); el aviso de «en camino» es dinámico.
- **Parent**: `importBackup(profile.id, pendingImport, grade)` — la validación de las sesiones importadas usa `findUnit(id, grade)`.

## Comportamiento con los cursos sin contenido

- Dashboard: aviso «El contenido de {grade}º todavía se está preparando.»; Materias vacía; sin misión.
- Subjects: «Listas para practicar» y «En camino» vacías con aviso.
- SessionPage para una sesión de otro curso: «Esta unidad no existe» (consulta con el curso activo).
- Estadísticas: `computeStats` devuelve cero/vacío para cursos sin contenido (`allUnits(grade)`).
- Al crear el perfil, Onboarding permite elegir curso y explica que «los demás cursos irán llegando a su ritmo»; tanto el sello como las etiquetas «Contenido listo / En camino» salen de los cursos que de verdad tienen materias.

## Fuentes de contenido

`docs/programaciones/` guarda el texto de las programaciones de 2º a 6º
(extraído de los PDFs de `Primaria/`) y un resumen de asignaturas y unidades
por curso: es el punto de partida para escribir el currículo de cada nivel.

## Pruebas

- `src/data/content.test.ts` pasa `3` a las consultas de `lookup` y añade `curriculumForGrade`: `curriculumForGrade(3)` es `curriculum`; 1, 2, 4, 5 y 6 llevan `subjects: []`.
