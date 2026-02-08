import './sass/style.scss'; // Tu Sass
import { initBuscaminas } from './js/js_buscaminas.js';

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initBuscaminas();
});