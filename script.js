// ==============================
// CONFIGURACIÓN Y VARIABLES
// ==============================
const apiKey = "9b18c6889c334779804abb181c00e847";
const contenedor = document.getElementById("juegos-container");
const inputBusqueda = document.getElementById("searchInput");

// ==============================
// FUNCIÓN: MOSTRAR JUEGOS
// ==============================
async function mostrarJuegos(lista) {
  contenedor.innerHTML = ""; // limpiar el contenedor

  for (const juego of lista) {
    try {
      // Buscar datos del juego en RAWG
      const res = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(juego.nombre)}`
      );
      const data = await res.json();
      const info = data.results?.[0];

      // Crear tarjeta de juego
      const card = document.createElement("div");
      card.classList.add("juego-card");

      const imagen = info?.background_image || "imagenes/no-image.jpg";
      const nombre = info?.name || juego.nombre;

      card.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <div class="juego-info">
          <h3>${nombre}</h3>
          <p>${juego.comentario}</p>
          <p class="nota">⭐ ${juego.nota}</p>
          <a href="juego.html?id=${juego.id}" class="ver-mas">Ver ficha →</a>
        </div>
      `;

      contenedor.appendChild(card);
    } catch (error) {
      console.error("Error al cargar el juego:", juego.nombre, error);
    }
  }
}

// ==============================
// FUNCIÓN: CARGAR JSON CON IDS AUTOMÁTICOS
// ==============================
async function cargarJuegos() {
  try {
    const res = await fetch("juegos.json");
    const misJuegos = await res.json();

    // Asignar IDs automáticos si no existen
    misJuegos.forEach((juego, index) => {
      if (juego.id === undefined) {
        juego.id = index + 1;
      }
    });

    // Mostrar todos los juegos al inicio
    mostrarJuegos(misJuegos);

    // Filtrado dinámico
    inputBusqueda.addEventListener("input", (e) => {
      const valor = e.target.value.toLowerCase();
      const filtrados = misJuegos.filter((j) =>
        j.nombre.toLowerCase().includes(valor)
      );
      mostrarJuegos(filtrados);
    });
  } catch (error) {
    console.error("Error cargando el JSON:", error);
  }
}

// ==============================
// INICIALIZAR
// ==============================
cargarJuegos();
