# 🚀 RESCATE DE AMOR - QUICK START GUIDE

## Iniciar el Juego en 30 Segundos

### 1. Abra Terminal
```bash
cd /home/adnuneza/Developer/Proyectos/rescate-de-amor
```

### 2. Inicie Servidor
```bash
python3 -m http.server 8000
```

**Resultado esperado:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### 3. Abra en Navegador
- **URL**: http://127.0.0.1:8000
- **Recomendado**: Chrome, Firefox, o Safari
- **Resolución**: Cualquiera (se escala automáticamente a 1280x720)

### 4. ¡Juega!
- Presiona `NUEVA PARTIDA` en el menú
- Sigue las instrucciones en pantalla

---

## Controles Rápidos

| Acción | Tecla |
|--------|-------|
| Mover Izq | `A` o `←` |
| Mover Der | `D` o `→` |
| Saltar | `SPACE` |
| Atacar | `X` |
| Correr | `SHIFT` |
| Continuar | `SPACE` o Click |

---

## Estructura de Juego

```
MENÚ → INTRO → NIVEL 1 → NIVEL 2 → NIVEL 3 → JEFE FINAL → ENDING → SECRETO
```

**Duración aproximada**: 20-30 minutos en primer playthrough

---

## Troubleshooting

### Puerto 8000 ocupado?
```bash
python3 -m http.server 9000
# Luego abre http://127.0.0.1:9000
```

### Pantalla negra?
- Presiona `Ctrl+Shift+R` (recarga hard)
- Verifica consola: `F12 → Console`

### Sin sonidos?
- Verifica volumen del navegador
- No es un error - sonidos se generan con Web Audio

### Juego lento?
- Cierra otras pestañas/programas
- Ejecuta en navegador actualizado

---

## Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Punto de entrada |
| `js/main.js` | Inicialización de Phaser |
| `js/scenes/` | 9 escenas del juego |
| `js/entities/` | Clases: Player, Enemy, Boss, Collectible |
| `js/utils/TextureFactory.js` | Generación procedural de sprites |
| `README.md` | Guía completa |
| `QA_TEST_REPORT.md` | Resultados de pruebas (22/22 PASS) |

---

## Funcionalidades Desbloqueadas Automáticamente

A medida que juegas, se desbloquean:
1. **Nivel 1**: Al completar intro
2. **Nivel 2**: Al salir de Nivel 1
3. **Nivel 3**: Al salir de Nivel 2
4. **Jefe Final**: Al salir de Nivel 3
5. **Ending**: Al derrotar al Jefe
6. **Secreto**: Al completar Ending

---

## Estado Guardado

El juego guarda automáticamente en `localStorage` bajo la clave:
```
rescate-de-amor-save
```

Datos guardados:
- Último nivel desbloqueado
- Colectibles recogidos
- Checkpoints
- Progreso del jefe

**Para borrar progreso**: Abra DevTools (F12) → Application → Local Storage → Delete

---

## Descripción Rápida de Niveles

### Nivel 1: "El Camino de los Recuerdos"
- 🌲 Bosque místico
- ⏱️ 5-8 minutos
- 🎯 Llega al portal de salida

### Nivel 2: "Jardín de Rosas"  
- 🌹 Jardín romántico con vista al castillo
- ⏱️ 6-10 minutos
- 🎯 Sube hacia la torre

### Nivel 3: "Castillo de Pecho Paloma"
- 🏰 Castillo oscuro y desafiante
- ⏱️ 5-10 minutos
- 🎯 Encuentra a Mateo en la torre

### Jefe Final: Pecho Paloma
- 👊 Combate de 3 fases
- ⏱️ 2-5 minutos (depende de habilidad)
- 🎯 Derrota al jefe, salva a Mateo

---

## Tips para Jugar

1. **Recolecta todo**: Los colectibles dan poder-ups y avanzan la historia
2. **Toca checkpoints**: Guardan tu progreso en cada nivel
3. **Practica el salto**: Coyote time (120ms) permite saltos extra
4. **Ataca el jefe**: Presiona X cuando está cerca (< 120px)
5. **Esquiva proyectiles**: El jefe ataca en todas las fases - ¡esquiva!

---

## ¿Encontraste Errores?

Todas las escenas tienen monitoreo de errores. Si algo falla:

1. Presiona `F12` para abrir DevTools
2. Ve a `Console`
3. Los errores se mostrarán en rojo
4. También hay panel rojo en esquina superior izquierda (si hay error)

---

## Información del Proyecto

- **Versión**: 1.0 Completa
- **Estado**: ✅ Producción
- **Pruebas QA**: 22/22 PASS (100%)
- **Plataforma**: Web (Navegador)
- **Tamaño**: ~80KB código (sin contar Phaser CDN)
- **Requiere**: Python 3.x + Navegador web

---

## Preguntas Frecuentes

### ¿Puedo jugar sin internet?
Sí, después de la primera carga. El servidor local es suficiente.

### ¿Puedo modificar el juego?
Claro, edita cualquier archivo en `js/` y recarga el navegador.

### ¿Hay multijugador?
No, es un juego de historia para un jugador.

### ¿Puedo subir a un servidor real?
Sí, sube todos los archivos a cualquier hosting web.

### ¿Dónde está la música?
Se genera con Web Audio API (síntesis de sonido en tiempo real).

### ¿Puedo agregar imágenes reales?
Sí, edita `TextureFactory.js` para cargar imágenes en lugar de generar sprites.

---

## Próximos Pasos

1. **Juega el juego**: Explora todos los niveles
2. **Lee la documentación**: [README.md](README.md)
3. **Revisa los tests**: [QA_TEST_REPORT.md](QA_TEST_REPORT.md)
4. **Personaliza**: Edita `TextureFactory.js` y niveles para tus cambios

---

## Contacto & Soporte

Este es un proyecto educativo y de demostración. El código está totalmente documentado y listo para modificar.

Si tienes preguntas, revisa:
- Los comentarios en el código fuente
- Los archivos .md en la raíz del proyecto
- Los nombres descriptivos de funciones y variables

---

**¡Que disfrutes el juego! 💕🎮**

*Proyecto: RESCATE DE AMOR*  
*Estado: Completo y Producción*  
*Playtime: 20-30 minutos*
