// ==============================
// CONFIGURACIÓN & DOM
// ==============================
const apiKey = "86b39a7f5a2a4bdea8db0ecd038562bc";
const juegoId = Number(new URLSearchParams(window.location.search).get("id"));

// Mapa de elementos DOM para fácil acceso
const $ = (id) => document.getElementById(id); 

const DOM = {
    titulo: $("titulo-juego"),
    imagenesCont: $("imagenes-juego"),
    comentario: $("comentario-juego"),
    nota: $("nota-juego"),
    plataforma: $("plataforma-juego"),
    rejugado: $("rejugado-juego"),
    lightbox: $("lightbox")
};

// ==============================
// FUNCIONES SECUNDARIAS
// ==============================

/**
 * Muestra los datos del juego en la UI.
 * @param {object} juego - El objeto del juego.
 */
function mostrarDatosJuego(juego) {
    DOM.titulo.textContent = juego.nombre;
    DOM.comentario.textContent = juego.comentario || "Sin reseña.";
    DOM.nota.textContent = juego.nota ?? "-";
    DOM.plataforma.textContent = juego.plataforma || "Desconocida";
    DOM.rejugado.textContent = juego.rejugado || "0 veces";
}

/**
 * Crea las miniaturas y configura el Lightbox.
 * @param {Array<string>} urls - URLs de las imágenes.
 * @param {string} nombreJuego - Nombre del juego para el alt.
 */
function configurarGaleria(urls, nombreJuego) {
    DOM.imagenesCont.innerHTML = "";
    
    urls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = nombreJuego;

        img.addEventListener("click", () => {
            const imgGrande = document.createElement("img");
            imgGrande.src = url;
            
            DOM.lightbox.innerHTML = "";
            DOM.lightbox.appendChild(imgGrande);
            DOM.lightbox.classList.add("active");
        });

        DOM.imagenesCont.appendChild(img);
    });

    // Configurar el cierre del Lightbox al hacer clic fuera de la imagen
    DOM.lightbox.addEventListener("click", (e) => {
        if (e.target === DOM.lightbox) { // Asegura que solo se cierra si se hace clic en el fondo
            DOM.lightbox.classList.remove("active");
        }
    });
}

/**
 * Carga las URLs de las imágenes desde la API de RAWG.
 * @param {string} nombreJuego - Nombre del juego a buscar.
 * @returns {Promise<Array<string>>} Lista de URLs de imágenes.
 */
async function cargarImagenesRawg(nombreJuego) {
    const fallback = [ "imagenes/no-image.jpg" ];
    try {
        const resRawg = await fetch(
            `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(nombreJuego)}`
        );
        const dataRawg = await resRawg.json();
        const info = dataRawg.results?.[0];

        if (info) {
            const screenshots = info.short_screenshots?.map(s => s.image) || [];
            if (screenshots.length > 0) return screenshots;
            if (info.background_image) return [info.background_image];
        }
    } catch (e) {
        console.warn("Error al cargar imágenes de RAWG, se usará la imagen local.");
    }
    return fallback;
}

// ==============================
// LÓGICA PRINCIPAL
// ==============================

async function cargarJuego() {
    if (!juegoId) {
        DOM.titulo.textContent = "Error: ID de juego no especificada.";
        return;
    }

    try {
        // 1. Cargar JSON local
        const res = await fetch("juegos.json");
        const juegos = await res.json();

        // Limpieza de datos (Asignar IDs si no existen, aunque se asume que sí)
        const juego = juegos.find((j, i) => (j.id ?? (i + 1)) === juegoId);

        if (!juego) {
            DOM.titulo.textContent = "Juego no encontrado.";
            return;
        }

        // 2. Mostrar datos básicos
        mostrarDatosJuego(juego);

        // 3. Cargar imágenes de la API
        const imagenes = await cargarImagenesRawg(juego.nombre);

        // 4. Configurar galería y lightbox
        configurarGaleria(imagenes, juego.nombre);

    } catch (error) {
        console.error("Error fatal al cargar el juego:", error);
        DOM.titulo.textContent = "Error al cargar la ficha del juego.";
    }
}

// ==============================
// INICIALIZAR
// ==============================
cargarJuego();