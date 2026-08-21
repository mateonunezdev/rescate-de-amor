# 🎮 RESCATE DE AMOR - Videojuego de Aventura Romántica en Pixel-Art

## 📖 Descripción

**RESCATE DE AMOR** es un videojuego de aventura platformer en pixel-art desarrollado con **Phaser 3.90.0**. 

Acompaña a **Paola** en una épica misión de rescate para salvar a **Mateo** de las garras de **Pecho Paloma**, un jefe villano romántico. Recorre tres niveles temáticos llenos de enemigos, colectibles con mensajes emotivos y desafíos cada vez más difíciles.

### 🎯 Características Principales

- **9 Escenas Interactivas**: Menú, Intro cinematográfica, 3 niveles, Jefe Final, Ending y Escena Secreta
- **Sistema de Progresión**: Desbloquea niveles, recoge poder-ups, abre caminos secretos
- **Jefe Final Dinámico**: Pecho Paloma con 3 fases de combate progresivas
- **Generación Procedural de Texturas**: Todos los sprites se generan sin necesidad de archivos PNG externos
- **Audio Fallback (WebAudio)**: Sonidos sintetizados sin archivos MP3/OGG externos
- **Sistema de Guardado**: Guarda progreso en localStorage
- **Narrativa Romántica**: Colectibles con mensajes emotivos que avanzan la historia

---

## 🚀 Instalación & Ejecución

### Requisitos

- **Python 3.x** (para servir archivos locales)
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión sin internet** no es necesaria (CDN cargado, pero requiere conexión inicial)

### Pasos de Instalación

1. **Descargar/Clonar el Proyecto**
   ```bash
   cd /home/adnuneza/Developer/Proyectos/rescate-de-amor
   ```

2. **Iniciar el Servidor Local**
   ```bash
   python3 -m http.server 8000
   ```
   O en Python 2.x:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **Abrir en el Navegador**
   - **URL**: http://127.0.0.1:8000
   - **Resolución**: 1280x720 (escalado automático)

### Archivo de Inicio

- **Archivo Principal**: `index.html`
- **Script Game**: `js/main.js` (Punto de entrada de Phaser)

---

## 🎮 Controles

### Controles en Juego

| Acción | Tecla | Descripción |
|--------|-------|------------|
| **Mover Izquierda** | `A` o `←` | Mueve a Paola a la izquierda |
| **Mover Derecha** | `D` o `→` | Mueve a Paola a la derecha |
| **Saltar** | `SPACE` | Salta en el aire |
| **Correr** | `SHIFT` | Activa modo carrera (velocidad +70%) |
| **Agacharse** | `S` | Agacharse para pasar bajo obstáculos |
| **Atacar** | `X` | Golpea enemigos cercanos o al jefe |
| **Siguiente Escena** | `SPACE` / Click | En menúes y cinemáticas |

### Controles en Menú

| Acción | Método |
|--------|--------|
| **Nueva Partida** | Click en botón o `SPACE` |
| **Continuar** | Click en botón (si hay guardado) |
| **Controles** | Click en botón para ver mapa de teclas |
| **Créditos** | Click en botón para ver autores |

---

## 📁 Estructura del Proyecto

```
rescate-de-amor/
├── index.html                    # Archivo HTML principal
├── js/
│   ├── main.js                   # Punto de entrada de Phaser
│   ├── config.js                 # Configuración del juego
│   ├── scenes/
│   │   ├── BootScene.js          # Splash screen
│   │   ├── MenuScene.js          # Menú principal
│   │   ├── IntroScene.js         # Cinematica de introducción
│   │   ├── Level1Scene.js        # "El Camino de los Recuerdos"
│   │   ├── Level2Scene.js        # "Jardín de Rosas"
│   │   ├── Level3Scene.js        # "Castillo de Pecho Paloma"
│   │   ├── BossScene.js          # Jefe Final - Pecho Paloma
│   │   ├── EndingScene.js        # Escena de victoria
│   │   └── SecretScene.js        # Escena post-juego
│   ├── entities/
│   │   ├── Player.js             # Paola (jugador controlable)
│   │   ├── Enemy.js              # Enemigos (pigeons, slimes, spikes)
│   │   ├── Boss.js               # Clase base para jefe
│   │   └── Collectible.js        # Colectibles (corazones, rosas, etc)
│   ├── systems/
│   │   ├── AudioManager.js       # WebAudio sintetizado (no archivos)
│   │   ├── ParticleManager.js    # Efectos de partículas
│   │   └── SaveManager.js        # localStorage persistencia
│   ├── ui/
│   │   └── UIManager.js          # HUD y mensajes en pantalla
│   ├── utils/
│   │   └── TextureFactory.js     # Generación procedural de texturas
│   └── data/
│       ├── finalLetter.js        # Contenido de la carta final
│       └── story.js              # Datos de narrativa
└── QA_TEST_REPORT.md             # Reporte de pruebas QA (22 tests)
```

---

## 🎨 Estructura de Gameplay

### Menú Principal (MenuScene)
- Título animado con corazones
- Cielo nocturno con luna y estrellas
- Botones interactivos:
  - **NUEVA PARTIDA**: Inicia juego desde el principio
  - **CONTINUAR**: Reanuda desde último checkpoint
  - **CONTROLES**: Muestra mapa de teclas
  - **CRÉDITOS**: Muestra información del proyecto

### Introducción (IntroScene)
- Narrativa cinematográfica
- Establece contexto: Paola y Mateo, ataque de Pecho Paloma
- Presione SPACE o click para continuar

### Nivel 1: "El Camino de los Recuerdos" (Level1Scene)
- **Tema**: Bosque místico con árboles en parallax
- **Distancia**: 2800px horizontales
- **Plataformas**: 5 niveles
- **Enemigos**: 3 (2 palomas, 1 slime)
- **Colectibles**: 5 (mensajes emotivos sobre recuerdos)
- **Checkpoint**: Mitad del nivel
- **Objetivo**: Llegar al portal de salida

### Nivel 2: "Jardín de Rosas" (Level2Scene)
- **Tema**: Jardín romántico con vistas al castillo
- **Distancia**: 3000px horizontales (más ancho)
- **Plataformas**: 6 niveles
- **Enemigos**: 3 (2 palomas, 1 spike con más daño)
- **Colectibles**: 6 (mensajes sobre el jardín y el castillo)
- **Parallax**: Flores, arbustos, torre del castillo de fondo
- **Dificultad**: Aumentada

### Nivel 3: "Castillo de Pecho Paloma" (Level3Scene)
- **Tema**: Castillo oscuro, torre de prisión
- **Distancia**: 3200px horizontales (más largo)
- **Plataformas**: 6 niveles con alturas variadas
- **Enemigos**: 3 (2 spikes, 1 paloma) - DIFICULTAD ALTA
- **Colectibles**: 6 (mensajes urgentes sobre la misión final)
- **Visualización de Mateo**: Celda en torre (sprite animado)
- **Objetivo**: Ascender hasta la cima para enfrentar al jefe

### Jefe Final: Pecho Paloma (BossScene)
- **Arena**: Torre interior, espacio de combate
- **Mecánica**: 3 fases progresivas
  - **Fase 1 (100%-66% HP)**: Ataque de bandada de palomas
  - **Fase 2 (66%-33% HP)**: Proyectiles de corazones en patrón radial
  - **Fase 3 (33%-0% HP)**: Combinación de ataques + intensidad aumentada
- **Sistema de Salud**: 36 HP (12 golpes)
- **Mecánica de Daño**: Presione X cuando está cerca del jefe (< 120px)
- **Recompensa**: Victoria → Escena de Ending

### Escena de Victoria (EndingScene)
- "RESCATE COMPLETADO" mensaje
- Animación de liberación de Mateo
- Carta final romántica
- Botón "CONTINUAR" para acceder a escena secreta

### Escena Secreta (SecretScene)
- "NUESTRA HISTORIA APENAS COMIENZA..."
- Marcos de fotos románticos (Paola & Mateo)
- Efectos decorativos (luces de hada, pétalos de rosa)
- Opción "CONTINUARÁ..." para volver al menú

---

## 💾 Sistema de Guardado

### Datos Guardados en localStorage
```javascript
{
  unlockedLevel: 4,           // Nivel desbloqueado (1-5)
  bossDefeated: true,         // Jefe derrotado?
  roses: 12,                  // Cantidad de rosas recogidas
  hearts: 10,                 // Cantidad de corazones
  letters: 8,                 // Cantidad de cartas
  power: 1,                   // Bonificaciones desbloqueadas
  checkpoints: [{x, y}, ...], // Posiciones de checkpoints
  endingUnlocked: true,       // Ending visto?
  secretUnlocked: true        // Escena secreta vista?
}
```

### Guardado Automático
- Cuando se toca un checkpoint
- Cuando se completa un nivel
- Cuando se derrota un enemigo importante
- Almacenado con clave: `'rescate-de-amor-save'`

---

## 🎵 Sistema de Audio

Debido a restricciones de archivos externos, el juego usa **Web Audio API** para generar sonidos sintetizados:

### Sonidos Implementados
- **Música**: Diferentes tonos para cada escena
- **Salto**: 440Hz (La)
- **Colectible**: 740Hz (F#)
- **Daño**: Tono agudo variable
- **Victoria**: Secuencia melodiosa
- **Ambience**: Tonos de fondo para atmósfera

### Gestión
- Archivo: `js/systems/AudioManager.js`
- No requiere archivos MP3/OGG
- Compatible con todas las plataformas
- Puede silenciarse desde navegador (F12 → Sonido)

---

## 🖼️ Sistema de Texturas

Todos los sprites se generan proceduralmente usando **Phaser Graphics API**:

### Texturas Generadas
- **Player (Paola)**: 24x40px - Personaje con cabello, cabeza, ropa, piernas
- **Enemies**:
  - Pigeon: 20x20px - Paloma
  - Slime: 16x12px - Babosa
  - Spike: 12x16px - Púa
- **Boss (Pecho Paloma)**: 110x140px - Jefe con corona y capa
- **Collectibles**: 12x12px cada uno
  - Heart (❤️)
  - Rose (🌹)
  - Letter (💌)
  - Diamond (💎)
  - Star (⭐️)

### Ventajas
- No requiere herramientas de diseño
- Fácil de ajustar colores/tamaños
- Carga rápida (sin descargas)
- Compatible con cualquier navegador

---

## 🐛 Debugging & Troubleshooting

### Si No Se Abre el Juego

1. **Verificar Servidor**
   ```bash
   curl http://127.0.0.1:8000
   ```
   Debe retornar HTML

2. **Verificar Navegador**
   - Abra http://127.0.0.1:8000 en Chrome/Firefox/Safari
   - Presione F12 para abrir Consola del Desarrollador
   - Busque errores en rojo

3. **Limpiar Cache**
   ```
   Ctrl+Shift+Delete (o Cmd+Shift+Delete en Mac)
   ```

4. **Verificar Puerto**
   Si el puerto 8000 está ocupado:
   ```bash
   python3 -m http.server 9000
   # Luego abra http://127.0.0.1:9000
   ```

### Errores Comunes

| Error | Solución |
|-------|----------|
| Black screen | Recargue (Ctrl+Shift+R) |
| Sonidos no se oyen | Verifique volumen del navegador |
| Juego lento | Cierre otras pestañas |
| Guardado no persiste | Permitir localStorage (F12 → Storage) |

---

## 📊 Rendimiento

- **FPS Objetivo**: 60 FPS (1280x720)
- **Tamaño de HTML**: ~2KB (sin comprimir)
- **Tamaño de JS**: ~80KB total (módulos incluidos)
- **Memoria**: ~40MB en tiempo de ejecución
- **Tiempo de Carga**: <2s

---

## 🏆 Puntuaciones & Logros

No hay sistema de puntuación numérica. El juego se completa cuando:
1. ✅ Se obtiene la Primera Vida (completar Nivel 1)
2. ✅ Se obtiene la Segunda Vida (completar Nivel 2)
3. ✅ Se obtiene la Tercera Vida (completar Nivel 3)
4. ✅ Se derrota a Pecho Paloma
5. ✅ Se ve el Ending y Escena Secreta

---

## 📝 Notas de Desarrollo

### Tecnologías Utilizadas
- **Framework**: Phaser 3.90.0 (CDN)
- **Lenguaje**: JavaScript ES6 Modules
- **Servidor**: Python 3 http.server (desarrollo local)
- **Persistencia**: localStorage Web API
- **Audio**: Web Audio API
- **Gráficos**: Phaser Graphics API (procedural)

### Arquitectura
- **Scene-based**: Cada pantalla es una escena independiente
- **Entity System**: Player, Enemy, Boss, Collectible como clases
- **Manager Pattern**: Sistemas de Audio, Partículas, UI, Guardado
- **Factory Pattern**: TextureFactory para generación de sprites

### Decisiones de Diseño
1. **Sin PNG**: Economizar archivos, eliminar dependencias
2. **WebAudio Fallback**: Garantizar audio sin CDN de audio
3. **localStorage**: Persistencia sin servidor backend
4. **Procedural**: Escalable, fácil de ajustar visualmente

---

## ✅ Verificación de Calidad (QA)

El juego ha pasado **22 pruebas de validación** (100% éxito):
- ✅ Menu Display
- ✅ New Game (sin black screen)
- ✅ Intro narrative
- ✅ Level 1-3 progression
- ✅ Player controls
- ✅ Enemy behavior
- ✅ Collectible system
- ✅ Damage mechanics
- ✅ Checkpoint activation
- ✅ Boss fights
- ✅ Ending/Secret scene
- ✅ Save/Load system
- ✅ Audio playback
- ✅ Texture generation
- ✅ Performance

**Ver detalles completos en: [QA_TEST_REPORT.md](QA_TEST_REPORT.md)**

---

## 📬 Información de Contacto & Créditos

- **Proyecto**: RESCATE DE AMOR
- **Tipo**: Videojuego de aventura narrativa en pixel-art
- **Plataforma**: Web (Navegador)
- **Desarrollo**: Realizado completamente con tecnologías web modernas
- **Fecha**: 2024

### Tecnologías Clave
- Phaser 3.90.0 para renderizado y física
- Web Audio API para síntesis de audio
- localStorage para persistencia
- Phaser Graphics API para assets procedurales

---

## 🎓 Cómo Contribuir

Este es un proyecto completo y auto-contenido. Para modificar:

1. Edite `js/scenes/Level*Scene.js` para cambiar niveles
2. Edite `js/utils/TextureFactory.js` para cambiar sprites
3. Edite `js/systems/AudioManager.js` para cambiar sonidos
4. Edite `js/data/finalLetter.js` para cambiar mensaje final

Los cambios se reflejan automáticamente en http://127.0.0.1:8000 (recargue navegador).

---

## 📄 Licencia

Proyecto de demostración educativo. Libre para uso y modificación.

---

**¡Que disfrutes jugando RESCATE DE AMOR! 💕🎮**

Para iniciar: `python3 -m http.server 8000` y abre http://127.0.0.1:8000
