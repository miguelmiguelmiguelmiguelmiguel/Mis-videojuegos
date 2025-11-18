const apiKey = "5f293e60061a4ddda10338c50c1d61e6";
const contenedorJuegos = document.getElementById("juegos-container");
const inputBusqueda = document.getElementById("searchInput");
const selectOrden = document.getElementById("orden-juegos");
const selectFiltroNota = document.getElementById("filtro-nota");
const btnAleatorio = document.getElementById("juego-aleatorio");
const paginacionDiv = document.getElementById("paginacion");

const TAMANO_PAGINA = 48;
let paginaActual = 1;
let todosLosJuegos = []; // Lista original completa
let juegosFiltradosYOrdenados = []; // Lista con filtros y orden aplicados

/**
 * Genera el HTML de la tarjeta de un juego.
 * @param {object} juego - Objeto del juego.
 * @returns {string} HTML de la tarjeta.
 */
function crearCardJuego(juego) {
    // Usar el operador de coalescencia nula (??) es más moderno que el OR (||)
    const imagen = juego.imagen ?? "imagenes/no-image.jpg";
    const nota = juego.nota ?? "?";
    
    return `
        <img src="${imagen}" alt="${juego.nombre}">
        <div class="juego-info">
            <h3>${juego.nombre}</h3>
            <p>${juego.comentario ?? ""}</p>
            <p class="nota">⭐ ${nota}</p>
            <a href="juego.html?id=${juego.id}" target="_blank" class="ver-mas">Ver ficha →</a>
        </div>
    `;
}

/**
 * Muestra los juegos en la UI y actualiza la paginación.
 * @param {Array<object>} lista - Lista de juegos a mostrar.
 */
function mostrarJuegos(lista) {
    contenedorJuegos.innerHTML = "";

    const inicio = (paginaActual - 1) * TAMANO_PAGINA;
    const fin = paginaActual * TAMANO_PAGINA;
    const juegosParaPagina = lista.slice(inicio, fin);

    juegosParaPagina.forEach(juego => {
        const card = document.createElement("div");
        card.classList.add("juego-card");
        card.innerHTML = crearCardJuego(juego);
        contenedorJuegos.appendChild(card);
    });

    actualizarPaginacion(lista.length);
}

/**
 * Configura los botones de paginación.
 * @param {number} totalJuegos - Cantidad total de juegos en la lista filtrada.
 */
function actualizarPaginacion(totalJuegos) {
    paginacionDiv.innerHTML = "";
    const totalPaginas = Math.ceil(totalJuegos / TAMANO_PAGINA);

    // Función que maneja el cambio de página
    const cambiarPagina = (nuevaPagina) => {
        paginaActual = nuevaPagina;
        mostrarJuegos(juegosFiltradosYOrdenados);
        window.scrollTo(0, 0); // Opcional: subir al principio de la página
    };

    if (paginaActual > 1) {
        const btnPrev = document.createElement("button");
        btnPrev.textContent = "← Anterior";
        btnPrev.onclick = () => cambiarPagina(paginaActual - 1);
        paginacionDiv.appendChild(btnPrev);
    }

    const infoPagina = document.createElement("span");
    infoPagina.textContent = ` Página ${paginaActual} de ${totalPaginas} `;
    paginacionDiv.appendChild(infoPagina);

    if (paginaActual < totalPaginas) {
        const btnNext = document.createElement("button");
        btnNext.textContent = "Siguiente →";
        btnNext.onclick = () => cambiarPagina(paginaActual + 1);
        paginacionDiv.appendChild(btnNext);
    }
}

/**
 * Aplica los filtros (búsqueda y nota) y el orden a la lista de juegos.
 */
function aplicarFiltrosYOrden() {
    let lista = [...todosLosJuegos];
    const valorBusqueda = inputBusqueda.value.toLowerCase().trim();
    const notaSeleccionada = selectFiltroNota.value;
    const valorOrden = selectOrden.value;

    // 1. FILTRO por BÚSQUEDA
    if (valorBusqueda) {
        lista = lista.filter(j => j.nombre.toLowerCase().includes(valorBusqueda));
    }

    // 2. FILTRO por NOTA
    if (notaSeleccionada) {
        // Usar Number() para asegurar la comparación numérica
        lista = lista.filter(j => Number(j.nota) === Number(notaSeleccionada));
    }

    // 3. ORDEN
    switch(valorOrden) {
        case "nota-asc":
            // Ordenar por nota, asumiendo nota 0 si es nula
            lista.sort((a, b) => (a.nota ?? 0) - (b.nota ?? 0));
            break;
        case "nota-desc":
            lista.sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0));
            break;
        case "nombre-asc":
            lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case "nombre-desc":
            lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
            break;
    }

    // Actualizar la lista global y mostrar
    juegosFiltradosYOrdenados = lista;
    paginaActual = 1;
    mostrarJuegos(juegosFiltradosYOrdenados);
}

/**
 * Intenta obtener la imagen de fondo de un juego desde la API de RAWG.
 * @param {object} juego - Objeto del juego.
 */
async function obtenerImagenJuego(juego) {
    try {
        const resApi = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(juego.nombre)}`);
        const data = await resApi.json();
        const info = data.results?.[0];

        if (info?.background_image) {
            juego.imagen = info.background_image;
            // Refrescar UI si el juego está en la página actual
            if (juegosFiltradosYOrdenados.includes(juego)) {
                mostrarJuegos(juegosFiltradosYOrdenados);
            }
        }
    } catch (error) {
        console.warn(`No se pudo obtener la imagen para ${juego.nombre}.`);
    }
}

/**
 * Carga el archivo JSON de juegos, configura la lista y los listeners.
 */
async function cargarJuegos() {
    try {
        // Cargar JSON local
        const res = await fetch("juegos.json");
        const misJuegos = await res.json();

        // Limpieza de datos inicial
        misJuegos.forEach((juego, index) => {
            juego.id = juego.id ?? (index + 1);
            juego.imagen = "imagenes/no-image.jpg"; 
        });

        todosLosJuegos = misJuegos;
        juegosFiltradosYOrdenados = [...todosLosJuegos];

        // 1. Mostrar juegos iniciales
        mostrarJuegos(juegosFiltradosYOrdenados);

        // 2. Cargar imágenes asíncronamente (sin bloquear la UI)
        todosLosJuegos.forEach(obtenerImagenJuego);

        // 3. Configurar Listeners
        selectOrden.addEventListener("change", aplicarFiltrosYOrden);
        selectFiltroNota.addEventListener("change", aplicarFiltrosYOrden);
        inputBusqueda.addEventListener("input", aplicarFiltrosYOrden);

        // Listener para el botón aleatorio
        btnAleatorio.addEventListener("click", () => {
            if (juegosFiltradosYOrdenados.length === 0) return;
            const aleatorio = juegosFiltradosYOrdenados[Math.floor(Math.random() * juegosFiltradosYOrdenados.length)];
            window.open(`juego.html?id=${aleatorio.id}`, "_blank");
        });

    } catch (error) {
        console.error("Error al cargar los datos de los juegos:", error);
        contenedorJuegos.innerHTML = "<p>Error al cargar la bitácora de juegos.</p>";
    }
}

// Iniciar la aplicación
cargarJuegos();