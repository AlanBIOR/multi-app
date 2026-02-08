// import './sass/style.scss'; // Tu Sass
import { initBuscaminas } from './js/js_buscaminas.js';
import { initSudoku } from './js/js_sudoku.js';

document.addEventListener('DOMContentLoaded', () => {
    // Si existe el ID de setup del Buscaminas, lo iniciamos
    if (document.getElementById('setup-screen')) {
        initBuscaminas();
    }

    // Si existe el ID de setup del Sudoku, lo iniciamos
    if (document.getElementById('ss-setup')) {
        initSudoku();
    }
});