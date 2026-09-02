# Tabú Express

Actúa como un desarrollador Frontend experto y un diseñador UI/UX.

Quiero crear una aplicación web del clásico juego de mesa "Tabú", optimizada tanto para móviles como para escritorio. El objetivo es que la interfaz sea moderna, fluida, colorida y altamente interactiva (estilo aplicación nativa moderna).



1. CONTEXTO GENERAL Y LÓGICA DEL JUEGO



Equipos: El juego debe permitir entre 2 y 5 equipos.



Mecánica: Un jugador de un equipo debe hacer que sus compañeros adivinen la "Palabra Principal" sin mencionar ninguna de las 5 "Palabras Tabú" listadas abajo.



Puntuación:



Acierto (Verde): +1 punto. Pasa a la siguiente carta.



Tabú/Error (Rojo): -1 punto. Pasa a la siguiente carta.



Pasar (Gris/Amarillo): 0 puntos. Pasa a la siguiente carta.



Turnos: Cada equipo tiene un turno de un tiempo determinado (por defecto 60 segundos). Los turnos se alternan secuencialmente entre los equipos creados.



2. FLUJO DE PANTALLAS (UI/UX)



A. Pantalla de Configuración (Inicio)



Un título grande y llamativo con una tipografía divertida que diga "Tabú".



Un selector o input para añadir equipos (mínimo 2, máximo 5). Los usuarios deben poder escribir el nombre de cada equipo (ej: "Equipo Rojo", "Los Imparables").



Un selector de tiempo por turno (opciones: 30s, 45s, 60s, 90s).



Un botón principal grande (Call to Action) que diga "¡Empezar Juego!".



B. Pantalla de Cambio de Turno



Debe mostrar en grande a qué equipo le toca jugar ahora.



Un texto de aviso: "Preparaos. El jugador que da las pistas debe tener la pantalla, el resto del equipo a adivinar".



Muestra la puntuación actual de todos los equipos.



Un botón que diga "¡Comenzar Tiempo!" que inicie el cronómetro y pase a la pantalla de la tarjeta.



C. Pantalla Principal de Juego (La Carta y el Cronómetro)



Header: Muestra el nombre del equipo actual y un cronómetro grande y muy visible. Cuando queden menos de 10 segundos, el cronómetro debe parpadear en rojo o cambiar de color.



La Carta (El componente central):



Diseño de tarjeta física flotante (con sombra y bordes redondeados).



En la parte superior, en grande, negrita y destacada: La Palabra Principal a adivinar.



Debajo, una línea separadora.



Una lista con las 5 Palabras Tabú. Deben verse claramente como palabras prohibidas (quizás con un pequeño icono de prohibido o en color rojo oscuro).



Controles (Botones inferiores de acción rápida):



Botón de "Error / Tabú" (Rojo con icono de 'X').



Botón de "Pasar" (Amarillo/Gris con icono de flecha/skip).



Botón de "Acierto" (Verde con icono de Check).



Nota UX: Estos botones deben ser grandes y fáciles de tocar en un móvil para que el jugador pueda pulsarlos rápidamente sin mirar demasiado.



D. Pantalla de Resumen de Turno



Aparece cuando el cronómetro llega a 0.



Muestra cuántas tarjetas se acertaron, cuántas se pasaron y cuántas fueron tabú en ese turno.



Muestra los puntos obtenidos en ese turno y el total acumulado del equipo.



Un botón para "Siguiente Turno" que lleve de vuelta a la Pantalla de Cambio de Turno para el siguiente equipo.



E. Pantalla de Fin de Juego y Puntuaciones (Leaderboard)



Un botón en la Pantalla de Cambio de Turno que permita "Finalizar Partida" en cualquier momento.



Al pulsarlo, se muestra un podio o lista ordenada con los equipos y sus puntuaciones finales.



Efecto de confeti para el equipo ganador (puedes usar una librería de confeti o animaciones CSS).



Botón para "Volver a jugar" (reinicia todo).



3. DISEÑO Y ESTILOS (Tailwind CSS)



Usa Tailwind CSS para un diseño responsivo, centrado en Mobile First pero que se vea centrado y elegante en pantallas de escritorio.



Colores: Paleta vibrante y moderna. Fondo principal ligeramente gris claro o crema para que las cartas destaquen. Las cartas deben ser blancas con sombras suaves (shadow-lg, rounded-xl).



Tipografía: Limpia y legible (Inter o Roboto).



Iconos: Usa Lucide React para los iconos (checks, cruces, relojes, trofeos).



Animaciones: Transiciones suaves usando Framer Motion (o las transiciones de Tailwind) al pasar de una carta a otra, o al cambiar de pantalla.



4. DATOS INICIALES (MOCK DATA)



Por favor, incluye en el estado de la aplicación un array con al menos 25 cartas de ejemplo en español para poder probar el juego inmediatamente.



Estructura sugerida: { word: "Playa", forbidden: ["Arena", "Mar", "Sol", "Verano", "Toalla"] }.



Asegúrate de que las cartas mostradas en cada partida sean aleatorias y no se repitan hasta que se agote el mazo entero.



Construye esta aplicación como un proyecto completo y funcional en un solo contenedor, priorizando una experiencia de usuario sin fricciones.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fad004cd-de4f-46dd-8f93-fc72f77d2cda).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
