// ==============================
// CONFIGURACIÓN
// ==============================
const apiKey = "9b18c6889c334779804abb181c00e847";
const params = new URLSearchParams(window.location.search);
const juegoId = Number(params.get("id"));

const titulo = document.getElementById("titulo-juego");
const imagenesCont = document.getElementById("imagenes-juego");
const comentario = document.getElementById("comentario-juego");
const nota = document.getElementById("nota-juego");
const plataforma = document.getElementById("plataforma-juego");
const rejugado = document.getElementById("rejugado-juego");
const lightbox = document.getElementById("lightbox");

// ==============================
// CARGAR JUEGO
// ==============================
async function cargarJuego() {
  try {
    const res = await fetch("juegos.json"); // JSON local
    const juegos = await res.json();

    // IDs automáticas si no existen
    juegos.forEach((j, i) => { if (j.id === undefined) j.id = i + 1; });

    const juego = juegos.find(j => j.id === juegoId);

    if (!juego) {
      titulo.textContent = "Juego no encontrado";
      return;
    }

    // Mostrar datos básicos
    titulo.textContent = juego.nombre;
    comentario.textContent = juego.comentario;
    nota.textContent = juego.nota;
    plataforma.textContent = juego.plataforma || "Desconocida";
    rejugado.textContent = juego.rejugado || "0 veces";

    // ==============================
    // TRAER IMÁGENES DESDE RAWG
    // ==============================
    let imagenes = [ "imagenes/no-image.jpg" ]; // fallback

    try {
      const resRawg = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(juego.nombre)}`
      );
      const dataRawg = await resRawg.json();
      const info = dataRawg.results?.[0];

      if (info) {
        if (info.short_screenshots && info.short_screenshots.length > 0) {
          imagenes = info.short_screenshots.map(s => s.image);
        } else if (info.background_image) {
          imagenes = [info.background_image];
        }
      }
    } catch (e) {
      console.warn("No se pudieron cargar imágenes de RAWG, se usarán locales.");
    }

    // ==============================
    // CREAR MINIATURAS Y LIGHTBOX
    // ==============================
    imagenesCont.innerHTML = ""; // limpiar contenedor
    imagenes.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = juego.nombre;

      img.addEventListener("click", () => {
        const imgGrande = document.createElement("img");
        imgGrande.src = url;
        lightbox.innerHTML = "";
        lightbox.appendChild(imgGrande);
        lightbox.classList.add("active");
      });

      imagenesCont.appendChild(img);
    });

    lightbox.addEventListener("click", e => {
      if (e.target !== e.currentTarget) return;
      lightbox.classList.remove("active");
      lightbox.innerHTML = "";
    });

  } catch (error) {
    console.error("Error cargando el juego:", error);
    titulo.textContent = "Error al cargar el juego";
  }
}

// ==============================
// INICIALIZAR
// ==============================
cargarJuego();
