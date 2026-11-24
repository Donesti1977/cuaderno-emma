# Programaciones de Primaria

Texto extraído de las programaciones de cada curso. Sirve como fuente para
escribir el currículo del cuaderno en los cursos que aún no tienen contenido.

## De dónde sale

| Curso | PDF original | Texto | Páginas |
| --- | --- | --- | --- |
| 2.º | `Primaria/primaria2º/Programacion 2º Primaria 2020-2021.pdf` | `2-primaria.txt` | 51 |
| 3.º | `Primaria/primaria3º/tercero17_18.pdf` | `3-primaria.txt` | 112 |
| 4.º | `Primaria/primaria4º/4º EP 2018-19.pdf` | `4-primaria.txt` | 119 |
| 5.º | `Primaria/primaria5º/Programacion 5 primaria 2025_26.pdf` | `5-primaria.txt` | 47 |
| 6.º | `Primaria/primaria6º/Programación 6º  primaria 2024-25.pdf` | `6-primaria.txt` | 55 |
| — | `Primaria/guia_primaria.pdf` | `guia-normativa-primaria.txt` | 34 |

La guía es la normativa de Primaria de ANPE-Madrid (2026-2027): no trae
contenidos por curso, solo organización, evaluación y calendario.

## Cómo se extrajo

Los PDFs no se pueden leer directamente en el modelo, así que se convierten a
texto con PDFKit de macOS. El programa está en `extractor.swift`:

```sh
swiftc -O extractor.swift -o extractor
./extractor "/ruta/al/archivo.pdf" > archivo.txt
```

Cada archivo conserva la marca `===== PAGINA n =====` para poder citar la
página original.

## Qué hay en cada curso

### 2.º (2020-2021, LOMCE)

- **Lengua castellana y literatura**: 12 unidades. Letra, sílaba, palabra y
  oración; abecedario; punto y mayúscula; la sílaba; sinónimos y onomatopeyas;
  adjetivos calificativos; fábula, anécdota, carta, receta, refranes; el blog y
  los medios de comunicación.
- **Matemáticas**: 12 unidades. Números hasta el 99, 199, 599, 799 y 999; suma
  y resta con llevadas; propiedades de la suma; tablas del 3, 5, 6, 9 y 10;
  metro, centímetro y kilómetro; kilo, medio kilo y cuarto de kilo; calendario;
  rectas y líneas; simetría; gráficos de barras; problemas.
- **Ciencias Sociales**: 6 unidades. El barrio, el municipio y el ayuntamiento;
  servicios públicos y educación vial; paisajes de interior y de costa; oficios
  y materias primas; el agua y su ciclo; rocas y minerales; puntos cardinales;
  mapas y planos; la Tierra y el sistema solar.
- **Ciencias Naturales**: 6 unidades. El cuerpo humano y sus etapas; las plantas;
  seres vivos y seres inertes; los animales; la materia, sus estados y la
  energía; salud, alimentos y máquinas.
- **Educación Plástica y Visual**: 8 unidades.

### 3.º (2017-2018, LOMCE)

- **Lengua, Matemáticas, Naturales, Sociales y Plástica**: 15 temas por
  asignatura, repartidos en tres trimestres.
- Es la fuente del contenido que ya tiene el cuaderno: Matemáticas temas 1-5 y
  11-12, Lengua temas 1-2, Naturales temas 1-2 y Sociales temas 1-2.
- **Inglés** no aparece en esta programación; el contenido de `i3-*` es propio
  del cuaderno.

### 4.º (2018-2019, LOMCE)

- **Lengua castellana y lengua portuguesa**: 15 temas. Diccionario, mayúsculas,
  lenguas de España, sinónimos y antónimos, sílaba tónica, agudas/llanas/
  esdrújulas, coherencia, narración, descripción, teatro y poesía.
- **Matemáticas**: 15 temas. Valor de las cifras, números de seis y siete
  cifras, aproximaciones, suma y resta, paréntesis, propiedades de la
  multiplicación, multiplicar por varias cifras, división, fracciones,
  decimales, medidas, geometría y estadística.
- **Ciencias Naturales**: bloques de actividad científica, ser humano y salud,
  y seres vivos.
- **Ciencias Sociales**: bloques de contenidos comunes, vivir en sociedad y las
  huellas del tiempo.
- **Educación Artística**: Plástica y Música (6 unidades de Música).
- **Lengua Inglesa** y **Educación Física**: programaciones completas.

### 5.º (2025-2026, LOMLOE)

- **Lengua castellana y literatura**: 12 unidades con situación de aprendizaje y
  ODS: *Escucho al árbol*, *Vivo la cultura*, *¡Quiero ayudar!*, *Me gusta
  aprender*, *Por el agua, nos mojamos*, *Caminamos por la igualdad*,
  *Comunidades con futuro*, *Actúo por el planeta*, *Cuido mi salud*, *Apoyo la
  ciencia*, *Visita al punto limpio*, *Construimos la paz*.
- **Matemáticas**: 12 unidades: *¿Pueblo o ciudad?*, *Multiplica la vida*,
  *Repartir y compartir*, *Vida minúscula*, *Ahorra décimas de energía*,
  *Kilos de salud*, *Bajo el mar*, *Más rápido, más alto, más fuerte*,
  *Historias de geometría*, *Geometría de la paz*, *Innovar para mejorar*.
- **Conocimiento del Medio, Social y Cultural**: 12 unidades: *¡Somos
  científicos!*, *Clasificamos y protegemos a los seres vivos*, *¿Cómo es
  nuestro cuerpo?*, *Informamos a la comunidad*, *Mi laboratorio*, *Hacemos
  proyectos*, *¡Qué calor!*, *¡Houston, tenemos un problema!*, *Terrícolas*,
  *¿De dónde soy?*, *Edad Media*, *Somos "modernos"*.
- **Educación Artística (Plástica y Visual)**: 3 unidades.

### 6.º (2024-2025, LOMLOE)

- **Lengua castellana y literatura**: 12 unidades: *Todas las miradas, todas las
  voces*, *¿Hacemos las maletas?*, *¡Que suene la música!*, *Y tú, ¿qué quieres
  ser?*, *Hagamos magia*, *Me siento bien*, *Acción por el clima*, *Construimos
  un equipo*, *Cuidemos la vida*, *Me comprometo*, *Descubrimos el gran azul*,
  *Final de etapa*.
- **Matemáticas**: 12 unidades con el contenido entre paréntesis: *Súmate al
  cuidado de la vida*, *Abraza la paz* (múltiplos), *Conectados* (potencias),
  *Únete al consumo responsable*, *Mejor juntos* (fracciones), *¿Quieres ser
  científico/a?* (sistema métrico), *Planea tu tiempo libre* (porcentajes),
  *Dibuja para cuidar* (ángulos), *Diferencias que suman* (polígonos), *Innovo,
  innovas, innovamos*, *Premios al cuidado del mar*, *Predecir el futuro*
  (azar y probabilidad).
- **Conocimiento del Medio, Social y Cultural**: 12 unidades: *Aprendemos de qué
  estamos hechos*, *Nos nutrimos de forma sana*, *La salud de la relación*,
  *Descubrimos que la Tierra cambia*, *Conocemos la materia*, *Utilizamos la
  energía*, *¿Progreso o recursos naturales?*, *La escasez de agua*, *¡Ven a
  visitarnos!*, *España en el s. XIX*, *España en los s. XX y XXI*, *Economía,
  sociedad y cultura*.
- **Educación Artística**: 3 unidades.
- **Educación en Valores Cívicos y Éticos**: 11 unidades.

## Estado en el cuaderno

Solo 3.º tiene actividades y teoría (`curricula` en `src/data/curriculum.ts`).
1.º, 2.º, 4.º, 5.º y 6.º están dados de alta con `subjects: []`.

Para añadir un curso hace falta, por asignatura: unidades, habilidades y
actividades (con su `theory`). La maquinaria ya es multinivel: `curriculumForGrade`,
`useActiveGrade`, `theoryOf` y el selector de curso.
