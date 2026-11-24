# Guía de contenido

Cómo se escriben las unidades, las habilidades y las actividades, y cómo se comprueba que una unidad está lista para publicarse.

Todo el contenido está en un único archivo: `src/data/curriculum.ts`. Los tipos viven en `src/data/types.ts` y la validación en `src/data/schema.ts`.

## 1. Estructura

```text
Curriculum
└── Subject (matematicas, lengua, ingles…)
    ├── Unit
    │   ├── Skill
    │   └── Activity → pertenece a una Skill
    └── Tool (opcional)
```

Una materia puede estar `ready` o `soon`. Una unidad también. Todo lo que esté `soon` se muestra en el mapa con el aviso «En preparación» y no se puede practicar.

### Materias disponibles

`matematicas`, `lengua`, `ingles`, `naturales`, `sociales`, `artistica`, `ef`.

### Identificadores

Se escriben en minúsculas, sin tildes ni espacios. Convención actual:

| Pieza | Patrón | Ejemplo |
| --- | --- | --- |
| Unidad | `mat-3-u1-numeros` | Matemáticas, 3.º, unidad 1 |
| Habilidad | `m3-u1-leer` | Matemáticas 3.º, unidad 1, leer |
| Actividad | `m3-u1-a01` | La actividad 1 de esa unidad |
| Pareja | `p1`, `p2`… | Solo dentro de una actividad `match` |

Los identificadores no se reutilizan entre unidades. Si se renombra una habilidad, se conserva su identificador para no perder el progreso guardado.

## 2. Una unidad

```ts
{
  id: "mat-3-u1-numeros",
  grade: 3,
  subjectId: "matematicas",
  order: 1,
  term: "Primer trimestre",
  title: "Los números de hasta 5 cifras",
  subtitle: "Tema 1 · Numeración",
  description: "Leer, escribir, comparar, ordenar y aproximar…",
  status: "ready",
  studyable: true,
  skills: [ /* … */ ],
  activities: [ /* … */ ],
}
```

- `studyable` es `false` para materias que no se estudian en el cuaderno (Artística): no aparecen en Dashboard ni en Materias, y se filtran en `src/data/lookup.ts` via `studyableSubjects()`.
- `order` ordena las unidades dentro de la materia.
- `term` es texto libre: «Primer trimestre», «Segundo trimestre»…
- `subtitle` aparece pequeño, encima del título.
- `description` se usa en la tarjeta de la unidad y en la cabecera.

## 3. Habilidades

```ts
{
  id: "m3-u1-leer",
  name: "Leer y escribir números",
  short: "Leer y escribir",
  description: "Pasar del nombre al número y del número al nombre…",
}
```

- `name` es el título completo.
- `short` se usa en listas estrechas, chips y resúmenes de sesión. Debe caber en una línea.
- `description` explica qué se practica, en una frase, sin tecnicismos.

Cada unidad necesita **al menos 3 habilidades** y **3 actividades por habilidad** para considerarse lista (lo comprueban las pruebas).

## 4. Actividades

Todas comparten estos campos:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | Único en todo el currículo |
| `type` | `choice` \| `input` \| `match` | Motor que la muestra |
| `skillId` | string | Debe existir en la misma unidad |
| `difficulty` | 1 \| 2 \| 3 | Calentamiento, practica o reto |
| `prompt` | string | El enunciado; admite texto y símbolos |
| `explanation` | string | Se muestra al corregir |
| `hint` | string opcional | Pista que se puede abrir antes de responder |

### Opción múltiple (`choice`)

```ts
{
  id: "m3-u1-a01",
  type: "choice",
  skillId: "m3-u1-leer",
  difficulty: 1,
  prompt: "¿Cómo se escribe «treinta y cinco mil doscientos siete»?",
  options: ["35.207", "3.527", "352.007", "35.027"],
  correct: 0, // índice dentro de options
  explanation: "Treinta y cinco mil → 35.000; doscientos siete → 207.",
}
```

- Entre 2 y 6 opciones.
- Sin opciones repetidas.
- `correct` empieza en 0.
- Las opciones incorrectas deben ser plausibles, no de relleno.

### Respuesta escrita (`input`)

```ts
{
  id: "m3-u1-a41",
  type: "input",
  skillId: "m3-u1-problemas",
  difficulty: 3,
  prompt: "Una biblioteca tiene 23.400 libros. Presta 1.250. ¿Cuántos quedan?",
  answers: ["22150", "22.150"],
  placeholder: "Escribe el número",
  suffix: "libros",
  explanation: "23.400 − 1.250 = 22.150. Quedan 22.150 libros.",
}
```

- `answers` contiene todas las formas aceptables. La primera se usa como respuesta correcta visible.
- `placeholder` y `suffix` son opcionales; el sufijo aparece dentro del campo, a la derecha.
- Para texto, se aceptan mayúsculas, minúsculas, tildes y puntuación distinta.
- Para números, se ignoran puntos de millar, espacios y se admite coma decimal.

Cómo se comparan las respuestas (`src/lib/answers.ts`):

1. Se recorta, se pasa a minúsculas, se quitan tildes y puntuación.
2. Si ambas partes parecen numéricas, se quitan puntos y espacios y se cambia la coma por punto.
3. Basta con que coincida una de las respuestas declaradas.

Esto significa que `35.207`, `35207`, `35 207` y `35207 ` se consideran iguales. No se admite `35.207,0` frente a `35207`: si se quiere aceptar, hay que añadirlo explícitamente a `answers`.

### Emparejar (`match`)

```ts
{
  id: "m3-u1-a12",
  type: "match",
  skillId: "m3-u1-ordinales",
  difficulty: 1,
  prompt: "Une cada ordinal con su nombre.",
  pairs: [
    { id: "p1", left: "1.º", right: "primero" },
    { id: "p2", left: "5.º", right: "quinto" },
    { id: "p3", left: "12.º", right: "duodécimo" },
  ],
  explanation: "Los ordinales indican orden…",
}
```

- Entre 3 y 6 parejas.
- `left` y `right` no se repiten dentro de la actividad.
- La actividad cuenta como correcta cuando se han unido todas las parejas. Los intentos fallidos dan pista inmediata, pero no convierten la actividad en incorrecta.

## 5. Dificultad y progreso

La dificultad no cambia la interfaz: cambia cuánto mueve el dominio.

| Dificultad | Etiqueta | Acierto | Fallo |
| --- | --- | --- | --- |
| 1 | Calentamiento | +6 | −7 |
| 2 | Practica | +9 | −7 |
| 3 | Reto | +12 | −7 |

El dominio se limita entre 0 y 100. Cada habilidad tiene una «caja» de repaso (0–5) con intervalos de 0, 1, 2, 4, 8 y 16 días. Un fallo baja una caja y programa el repaso para mañana.

## 6. Cómo se elige una sesión

`createSession` (en `src/lib/session.ts`):

1. Ordena las habilidades por urgencia: repaso pendiente, dominio bajo, dominio medio, dominio alto.
2. Elige **una actividad de cada habilidad** antes de repetir.
3. Completa el resto con las actividades mejor puntuadas, sin repetir ninguna.
4. Baraja el resultado.

El tamaño depende del ritmo elegido: 5 → 5 preguntas, 10 → 8, 15 → 12, 20 → 16.

## 7. Añadir una unidad paso a paso

1. Localiza el tema en `primaria3º/tercero17_18.pdf`.
2. Escribe 3–6 habilidades concretas, no «numeración» en general.
3. Redacta entre 30 y 45 actividades repartidas entre ellas, con dificultad creciente.
4. Incluye al menos una actividad de cada tipo (`choice`, `input`, `match`) si el contenido lo permite.
5. Añade una explicación distinta a cada actividad. No vale «porque sí».
6. Añade pistas solo donde aporten (un paso intermedio, no la respuesta).
7. Marca la unidad como `status: "ready"` cuando esté completa.
8. Ejecuta `npm test` y `npm run build`.

Checklist antes de publicar:

- [ ] Cada habilidad tiene al menos 3 actividades.
- [ ] Los identificadores son únicos y siguen la convención.
- [ ] No hay opciones ni parejas repetidas.
- [ ] Las respuestas escritas incluyen las variantes razonables.
- [ ] Las explicaciones se entienden sin mirar el enunciado.
- [ ] El tono es tranquilo y no culpabiliza.
- [ ] `npm test` y `npm run build` pasan.

## 8. Pruebas de contenido

`src/data/content.test.ts` valida:

- Que el currículo cumple el esquema Zod.
- Que no se repiten identificadores de materia, unidad, habilidad ni actividad.
- Que cada actividad pertenece a una habilidad de su unidad.
- Que las opciones, parejas y respuestas son coherentes.
- Que las unidades `ready` tienen contenido suficiente.
- Que el Tema 1 de Matemáticas de 3.º mantiene sus 6 habilidades y 41 actividades.

`src/lib/logic.test.ts` y `src/lib/stats.test.ts` cubren respuestas, fechas, repaso, sesiones, estadísticas y premios.

Para validar solo el contenido:

```bash
npm run validate
```

## 9. Estilo de redacción

- Enunciados en una o dos frases. Si hay que releerlo, sobra algo.
- Nada de «calcula», «resuelve» o «halla» si se puede decir «¿cuántos…?».
- Cifras con punto de millar en el enunciado (`23.400`), aunque la respuesta acepte ambas formas.
- En Inglés, el contenido va en inglés; las instrucciones de la interfaz, en español.
- Las explicaciones empiezan por la respuesta o por el paso que se falló, no por «Muy bien».
- No se usan emojis en el contenido. La capibara ya pone el cariño.

## 10. Herramientas externas

Las herramientas imprimibles viven en `public/talleres/` y se enlazan desde la materia con `tools`.

```ts
tools: [
  {
    id: "tablas-multiplicar",
    name: "Tablas de multiplicar",
    description: "La hoja A4 de siempre: una tabla por página, lista para imprimir.",
    href: "talleres/tablas-multiplicar/index.html",
    badge: "Imprimible",
  },
],
```

La ruta es relativa a `public/`, sin barra inicial, para que funcione también en GitHub Pages. El original de `primaria3º/matematicas/tablas_multiplicar` no se modifica.
