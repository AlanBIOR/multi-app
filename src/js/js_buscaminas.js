/**
 * BUSCAMINAS - BIOR Web Studio
 */

// Variables de estado privado del módulo
let tableroData = [];
let configActual = {};
let cronometro;
let segundos = 0;
let minasMarcadas = 0;
let juegoTerminado = false;
let celdasReveladas = 0;

export function initBuscaminas() {
    // Verificar si estamos en la página correcta
    const setupScreen = document.querySelector('#setup-screen');
    if (!setupScreen) return;

    actualizarInterfazRecords();

    const gameScreen = document.querySelector('#game-screen');
    const dificultadBtns = document.querySelector('.difficulty-options');
    const customParams = document.querySelector('#custom-params');
    const gridContainer = document.querySelector('#minesweeper-grid');
    const btnBack = document.querySelector('#btn-back');
    const btnStartCustom = document.querySelector('#btn-start-custom');

    if (dificultadBtns) {
        dificultadBtns.addEventListener('click', (e) => {
            const boton = e.target.closest('.btn-level');
            if (!boton) return;
            const nivel = boton.dataset.level;

            if (nivel === 'personalizado') {
                customParams.classList.toggle('hidden');
            } else {
                const ajustes = {
                    facil: { filas: 8, columnas: 8, minas: 10 },
                    medio: { filas: 16, columnas: 16, minas: 40 },
                    dificil: { filas: 16, columnas: 30, minas: 99 }
                };
                empezarJuego(ajustes[nivel], setupScreen, gameScreen, gridContainer);
            }
        });
    }

    btnStartCustom?.addEventListener('click', () => {
        const config = {
            filas: parseInt(document.querySelector('#custom-rows').value) || 10,
            columnas: parseInt(document.querySelector('#custom-cols').value) || 10,
            minas: parseInt(document.querySelector('#custom-mines').value) || 10
        };
        empezarJuego(config, setupScreen, gameScreen, gridContainer);
    });

    btnBack?.addEventListener('click', () => {
        clearInterval(cronometro);
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    });

    document.querySelector('#reset-btn')?.addEventListener('click', () => {
        empezarJuego(configActual, setupScreen, gameScreen, gridContainer);
    });
}

// --- Funciones Internas del Juego ---

function empezarJuego(config, setup, game, grid) {
    configActual = config;
    juegoTerminado = false;
    celdasReveladas = 0;
    setup.classList.add('hidden');
    game.classList.remove('hidden');
    
    segundos = 0;
    minasMarcadas = 0;
    actualizarDisplay('#timer', 0);
    actualizarDisplay('#mine-count', config.minas);
    document.querySelector('#reset-btn').innerText = '😊'; 
    
    clearInterval(cronometro);
    iniciarCronometro();

    grid.style.gridTemplateColumns = `repeat(${config.columnas}, 30px)`;
    grid.innerHTML = '';
    
    const totalCeldas = config.filas * config.columnas;
    tableroData = Array(totalCeldas).fill(0);
    
    let mPuestas = 0;
    while (mPuestas < config.minas) {
        let pos = Math.floor(Math.random() * totalCeldas);
        if (tableroData[pos] !== 'M') {
            tableroData[pos] = 'M';
            mPuestas++;
        }
    }

    for (let i = 0; i < totalCeldas; i++) {
        if (tableroData[i] !== 'M') {
            tableroData[i] = contarMinasVecinas(i, config.filas, config.columnas);
        }
    }

    for (let i = 0; i < totalCeldas; i++) {
        const celda = document.createElement('div');
        celda.classList.add('cell'); // Asegúrate que en CSS no choque con Sudoku
        celda.dataset.id = i;
        celda.addEventListener('click', () => manejarClick(celda, i));
        celda.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            manejarBandera(celda);
        });
        grid.appendChild(celda);
    }
}

function contarMinasVecinas(idx, filas, cols) {
    let minas = 0;
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nr = r + i;
            const nc = c + j;
            if (nr >= 0 && nr < filas && nc >= 0 && nc < cols) {
                if (tableroData[nr * cols + nc] === 'M') minas++;
            }
        }
    }
    return minas;
}

function manejarClick(celda, idx) {
    if (juegoTerminado || celda.classList.contains('cell--revealed') || celda.classList.contains('cell--flag')) return;
    if (tableroData[idx] === 'M') {
        finalizarJuego(false);
    } else {
        revelarCelda(celda, idx);
    }
}

function revelarCelda(celda, idx) {
    if (celda.classList.contains('cell--revealed')) return;
    celda.classList.add('cell--revealed');
    celdasReveladas++; 
    
    const valor = tableroData[idx];
    if (valor > 0) {
        celda.innerText = valor;
        celda.dataset.num = valor;
    } else {
        const r = Math.floor(idx / configActual.columnas);
        const c = idx % configActual.columnas;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i;
                const nc = c + j;
                if (nr >= 0 && nr < configActual.filas && nc >= 0 && nc < configActual.columnas) {
                    const nIdx = nr * configActual.columnas + nc;
                    const vecino = document.querySelector(`[data-id="${nIdx}"]`);
                    if (vecino && !vecino.classList.contains('cell--revealed')) {
                        revelarCelda(vecino, nIdx);
                    }
                }
            }
        }
    }
    verificarVictoria();
}

function verificarVictoria() {
    const totalCeldasSeguras = (configActual.filas * configActual.columnas) - configActual.minas;
    if (celdasReveladas === totalCeldasSeguras) {
        finalizarJuego(true);
    }
}

function manejarBandera(celda) {
    if (juegoTerminado || celda.classList.contains('cell--revealed')) return;
    celda.classList.toggle('cell--flag');
    const tieneBandera = celda.classList.contains('cell--flag');
    celda.innerHTML = tieneBandera ? '🚩' : '';
    minasMarcadas += tieneBandera ? 1 : -1;
    actualizarDisplay('#mine-count', Math.max(0, configActual.minas - minasMarcadas));
}

function iniciarCronometro() {
    cronometro = setInterval(() => {
        segundos++;
        actualizarDisplay('#timer', segundos);
    }, 1000);
}

function actualizarDisplay(selector, valor) {
    const el = document.querySelector(selector);
    if (el) el.innerText = valor.toString().padStart(3, '0');
}

function actualizarInterfazRecords() {
    ["facil", "medio", "dificil"].forEach(nivel => {
        const span = document.querySelector(`#record-${nivel}`);
        const valor = localStorage.getItem(`record_${nivel}`);
        if (span) span.innerText = valor ? valor : "--";
    });
}

function guardarRecord(tiempoActual) {
    let nivel = "";
    if (configActual.minas === 10) nivel = "facil";
    else if (configActual.minas === 40) nivel = "medio";
    else if (configActual.minas === 99) nivel = "dificil";
    else return;

    const recordKey = `record_${nivel}`;
    const mejorTiempoGuardado = localStorage.getItem(recordKey);
    const mejorTiempoNum = mejorTiempoGuardado ? parseInt(mejorTiempoGuardado) : Infinity;

    if (tiempoActual < mejorTiempoNum) {
        localStorage.setItem(recordKey, tiempoActual.toString());
        actualizarInterfazRecords();
    }
}

function finalizarJuego(victoria) {
    juegoTerminado = true;
    clearInterval(cronometro);
    if (victoria) {
        document.querySelector('#reset-btn').innerText = '😎'; 
        guardarRecord(segundos);
    } else {
        document.querySelectorAll('.cell').forEach((c, i) => {
            if (tableroData[i] === 'M') {
                c.classList.add('cell--mine');
                c.innerHTML = '💣';
            }
        });
        document.querySelector('#reset-btn').innerText = '😵';
    }
}