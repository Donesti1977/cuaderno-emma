# Constitución del cuaderno

Este documento fija las decisiones que no deberían cambiar sin una razón muy buena. No describe la app entera: describe **qué se siente al usarla** y qué se sacrifica a cambio.

## 1. El propósito

Que Emma pueda abrir el cuaderno, saber qué hacer durante diez minutos y cerrarlo sintiendo que ha avanzado.

No es un aula virtual. No es un boletín. No es un sistema de gestión del aprendizaje. Es un cuaderno bonito que, además, corrige.

## 2. Principios de aprendizaje

1. **Sesiones cortas.** La unidad se practica en tandas de 5 a 20 minutos, no de una sentada.
2. **Mezcla, no monotonía.** Cada sesión toca varias habilidades y recupera algo antiguo. Si algo falla, se explica y se vuelve a ver.
3. **El error informa.** Un fallo resta dominio y adelanta el repaso, pero nunca bloquea ni castiga. No hay pantallas rojas, ni «has perdido», ni vidas.
4. **Dominio, no porcentaje de vídeos vistos.** El progreso mide lo que se recuerda cuando vuelve a aparecer, con un repaso espaciado de seis cajas.
5. **Sin comparaciones.** No hay ranking, ni percentiles, ni «otros niños han hecho…». El único término de comparación es su yo de la semana pasada.
6. **La racha se puede romper sin drama.** Perder un día no borra nada. Volver cuenta.

## 3. Voz y tono

- Español de España, cercano y directo. Se tutea.
- Frases cortas. Nada de «¡Genial, campeón!» ni de «Has fallado».
- El contenido de Inglés se escribe en inglés; las instrucciones de la app, en español.
- No se habla de notas, niveles, test ni evaluación. Se habla de practicar, repasar, mirar y volver.
- La capibara comenta, no da órdenes. Es una compañera tranquila, no una mascota que exige atención.
- Los textos de padres son sobrios: datos y una frase de contexto, sin juicios sobre el menor.

## 4. Sistema visual

La referencia no es «app educativa genérica», sino un cuaderno de clase con la tapa verde y las pegatinas por dentro.

- **Papel cálido** (`#faf4e6`) con retícula de puntos, no blanco clínico ni crema de plantilla.
- **Verde de cuaderno** (`#22382d`) para el lomo y los bloques oscuros.
- **Coral** (`#c9553d`) para la acción principal y los acentos; **marigold** (`#e8b23f`) para logros y avisos; **verde hoja** para acierto; **azul cielo** para información; **ciruela** para memoria.
- **Sombras duras desplazadas** (sin difuminado) y bordes de 2 px. Todo parece impreso, no flotante.
- **Bricolage Grotesque** para titulares y cifras; **Nunito** para la interfaz; **Atkinson Hyperlegible** cuando se activa la fuente para dislexia.
- Nada de degradados suaves, cristal, sombras difusas ni ilustraciones 3D. Si una pieza parece sacada de una plantilla de IA, se rehace.
- La capibara aparece en los momentos de bienvenida, cierre y premios. No decora cada pantalla.

## 5. Interacción

- **Una decisión por pantalla.** En una actividad hay un enunciado, una forma de responder y un botón de comprobar.
- **La acción principal siempre está clara.** Coral, a la derecha o al final, con texto que dice qué pasa («Comprobar», «Siguiente», «Empezar la misión»).
- **La sesión es un modo aparte.** Ocupa la pantalla completa, sin lomo ni navegación, con salida protegida por diálogo.
- **El móvil no es una versión reducida.** La navegación pasa abajo, las tarjetas se apilan y los objetivos táctiles miden al menos 44 px.
- **Nada de scroll infinito dentro de una actividad.** El botón de continuar queda a la vista.
- **Los estados vacíos enseñan.** Dicen qué hacer a continuación, no solo que no hay datos.

## 6. Accesibilidad

- Contraste mínimo AA en texto y controles; `--ink-faint` se oscureció precisamente para eso.
- Foco visible con contorno azul de 3 px y desplazamiento.
- Tamaño de texto ajustable (normal, grande, muy grande) sin romper la maquetación.
- Fuente para dislexia opcional.
- Respeto a `prefers-reduced-motion` y un ajuste manual para reducir animaciones.
- Voz: lectura del enunciado bajo demanda, nunca automática sin permiso.
- Los botones tienen nombre accesible; las listas y los gráficos llevan etiquetas y roles.
- Enlace «Saltar al contenido» y estructura de encabezados coherente.

## 7. Datos

- **Local primero.** IndexedDB para todo; `localStorage` solo para recordar el perfil activo.
- **Sin servidor.** No hay login, ni sincronización, ni telemetría. Si algún día se añade sincronización, será opcional y explícita.
- **Exportable.** Todo se puede descargar en JSON y restaurar.
- **El PIN no es seguridad.** Es una cortina para que un clic curioso no abra el panel de padres. Se dice tal cual en la interfaz.
- **Borrar es borrar.** Las acciones destructivas piden confirmación y explican qué desaparece.

## 8. Contenido

- Alineado con la programación real de 3.º del CEIP Giner de los Ríos.
- Cada actividad pertenece a una habilidad concreta y tiene una explicación escrita para el fallo.
- Las respuestas aceptan variantes razonables (puntos de millar, espacios, mayúsculas, tildes y puntuación).
- El contenido se valida con Zod y con pruebas; una unidad no se publica con identificadores repetidos, opciones duplicadas o habilidades sin actividades.
- Las unidades incompletas se muestran como «En preparación», nunca con contenido de relleno.

## 9. Límites conscientes

- No hay cuentas ni profesorado.
- No hay exámenes cronometrados.
- No hay notificaciones push ni correos.
- No hay publicidad, compras ni monedas.
- No se promete «aprender jugando». Se promete practicar con calma y ver el avance.
- El panel de padres no es un informe psicopedagógico ni sustituye la valoración de un docente.

## 10. Cómo decidir una duda

Ante dos opciones, elegir la que:

1. Se pueda usar en diez minutos sin explicación previa.
2. No haga sentir mal a nadie por fallar.
3. Siga funcionando sin conexión y sin cuenta.
4. Se parezca más a un cuaderno impreso que a un panel de datos.
5. Se pueda deshacer o exportar.

Si una idea exige romper tres de estas cinco, no entra.
