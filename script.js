// ==============================
// CONFIGURACIÓN Y VARIABLES
// ==============================
const apiKey = "5f293e60061a4ddda10338c50c1d61e6";
const contenedor = document.getElementById("juegos-container");
const inputBusqueda = document.getElementById("searchInput");
const paginacion = document.getElementById("paginacion"); // div para los botones
const tamañoPagina = 48;
let paginaActual = 1;
let juegosTotales = [];

// ==============================
// FUNCIÓN: MOSTRAR JUEGOS
// ==============================
async function mostrarJuegos(lista) {
  contenedor.innerHTML = ""; // limpiar el contenedor

  // calcular slice de paginación
  const inicio = (paginaActual - 1) * tamañoPagina;
  const fin = paginaActual * tamañoPagina;
  const juegosMostrados = lista.slice(inicio, fin);

  for (const juego of juegosMostrados) {
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(juego.nombre)}`
      );
      const data = await res.json();
      const info = data.results?.[0];

      const card = document.createElement("div");
      card.classList.add("juego-card");

      const imagen = info?.background_image || "imagenes/no-image.jpg";
      const nombre = info?.name || juego.nombre;

      card.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <div class="juego-info">
          <h2>${nombre}</h2>
          <p>${juego.comentario || ""}</p>
          <p class="nota">⭐ ${juego.nota ?? "?"}</p>
          <a href="juego.html?id=${juego.id}" target="_blank" class="ver-mas">Ver ficha →</a>
        </div>
      `;

      contenedor.appendChild(card);
    } catch (error) {
      console.error("Error al cargar el juego:", juego.nombre, error);
    }
  }

  actualizarPaginacion(lista.length);
}

// ==============================
// FUNCIÓN: ACTUALIZAR PAGINACIÓN
// ==============================
function actualizarPaginacion(totalJuegos) {
  paginacion.innerHTML = "";

  const totalPaginas = Math.ceil(totalJuegos / tamañoPagina);

  if (paginaActual > 1) {
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "← Anterior";
    btnPrev.onclick = () => {
      paginaActual--;
      mostrarJuegos(juegosTotales);
    };
    paginacion.appendChild(btnPrev);
  }

  if (paginaActual < totalPaginas) {
    const btnNext = document.createElement("button");
    btnNext.textContent = "Siguiente →";
    btnNext.onclick = () => {
      paginaActual++;
      mostrarJuegos(juegosTotales);
    };
    paginacion.appendChild(btnNext);
  }

  const infoPagina = document.createElement("span");
  infoPagina.textContent = ` Página ${paginaActual} de ${totalPaginas} `;
  paginacion.appendChild(infoPagina);
}

// ==============================
// FUNCIÓN: CARGAR JSON
// ==============================
async function cargarJuegos() {
  try {
    const res = await fetch("juegos.json");
    const misJuegos = await res.json();

    misJuegos.forEach((juego, index) => {
      if (juego.id === undefined) juego.id = index + 1;
    });

    juegosTotales = misJuegos; // guardamos todos los juegos
    mostrarJuegos(juegosTotales);

    inputBusqueda.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      const filtrados = juegosTotales.filter((j) =>
        j.nombre.toLowerCase().includes(valor)
      );
      paginaActual = 1; // resetear página al filtrar
      mostrarJuegos(filtrados);
    });
  } catch (error) {
    console.error("Error cargando el JSON:", error);
  }
}

cargarJuegos();
