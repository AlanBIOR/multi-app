/**
 * SUDOKU SOLVER - BIOR Web Studio
 * Algoritmo: Backtracking recursivo
 */

let ssTimer;
let ssSeconds = 0;
let currentLevel = "";

export function initSudoku() {
    const setup = document.getElementById('ss-setup');
    if (!setup) return;

    actualizarRecordsUI();

    // Eventos de selección de nivel
    document.querySelectorAll('[data-level]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLevel = btn.dataset.level;
            prepararTableroSudoku(currentLevel);
        });
    });

    // Controladores de botones
    document.getElementById('ss-solve-btn')?.addEventListener('click', ejecutarBacktracking);
    document.getElementById('ss-validate-btn')?.addEventListener('click', () => {
        const board = obtenerMatriz();
        if (esTableroValido(board)) {
            mostrarMensaje("✅ El tablero es válido hasta ahora", "success");
        } else {
            mostrarMensaje("❌ Hay números repetidos en filas, columnas o bloques", "error");
        }
    });

    document.getElementById('ss-reset')?.addEventListener('click', () => prepararTableroSudoku(currentLevel));
    document.getElementById('ss-clear-btn')?.addEventListener('click', limpiarCeldasNoBloqueadas);
    document.getElementById('ss-exit-btn')?.addEventListener('click', abandonarPartida);
}

function prepararTableroSudoku(level) {
    document.getElementById('ss-setup').classList.add('ss-hidden');
    document.getElementById('ss-game').classList.remove('ss-hidden');
    document.getElementById('ss-difficulty-display').innerText = level.toUpperCase();
    
    const grid = document.getElementById('ss-grid-container');
    grid.innerHTML = '';
    
    mostrarMensaje("", ""); // Limpiar mensajes previos
    iniciarCronometroSudoku();

    // Crear 81 inputs
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'ss-cell';
        input.dataset.row = Math.floor(i / 9);
        input.dataset.col = i % 9;

        // Validación de entrada (Punto 3)
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length > 1) e.target.value = val.slice(0, 1);
            if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
            mostrarMensaje("", ""); // Limpiar errores al escribir
        });

        grid.appendChild(input);
    }

    if (level !== 'empty') {
        cargarTableroEjemplo(level);
    }
}

// --- ALGORITMO CORE (Punto 2) ---

function ejecutarBacktracking() {
    let board = obtenerMatriz();
    
    // Validar antes de resolver (Punto 3)
    if (!esTableroValido(board)) {
        mostrarMensaje("⚠️ Tablero inicial inválido (hay repetidos)", "error");
        return;
    }

    mostrarMensaje("🤖 Resolviendo...", "success");

    // Ejecutar algoritmo
    if (solve(board)) {
        actualizarGrid(board);
        mostrarMensaje("🎯 ¡Sudoku Resuelto!", "success");
        clearInterval(ssTimer);
        guardarRecordSudoku();
    } else {
        mostrarMensaje("❌ Este Sudoku no tiene solución", "error");
    }
}

function solve(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) { // Encontrar celda vacía
                for (let n = 1; n <= 9; n++) { // Intentar dígitos
                    if (isValid(board, r, c, n)) {
                        board[r][c] = n;
                        if (solve(board)) return true; // Continuar
                        board[r][c] = 0; // Backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, r, c, n) {
    for (let i = 0; i < 9; i++) {
        // Fila y Columna
        if (board[r][i] === n || board[i][c] === n) return false;
        // Cuadrante 3x3
        const blockR = 3 * Math.floor(r / 3) + Math.floor(i / 3);
        const blockC = 3 * Math.floor(c / 3) + (i % 3);
        if (board[blockR][blockC] === n) return false;
    }
    return true;
}

// --- VALIDACIONES DEL TABLERO (Punto 3) ---

function esTableroValido(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const num = board[r][c];
            if (num !== 0) {
                board[r][c] = 0; // Quitar temporalmente para validar
                if (!isValid(board, r, c, num)) {
                    board[r][c] = num; // Restaurar
                    return false;
                }
                board[r][c] = num; // Restaurar
            }
        }
    }
    return true;
}

// --- UTILIDADES Y PERSISTENCIA (Punto 5) ---

function obtenerMatriz() {
    const inputs = document.querySelectorAll('.ss-cell');
    let matrix = Array.from({ length: 9 }, () => Array(9).fill(0));
    inputs.forEach(inp => {
        matrix[inp.dataset.row][inp.dataset.col] = parseInt(inp.value) || 0;
    });
    return matrix;
}

function actualizarGrid(board) {
    const inputs = document.querySelectorAll('.ss-cell');
    inputs.forEach(inp => {
        inp.value = board[inp.dataset.row][inp.dataset.col];
    });
}

function limpiarCeldasNoBloqueadas() {
    document.querySelectorAll('.ss-cell').forEach(inp => {
        if (!inp.disabled) inp.value = '';
    });
}

function iniciarCronometroSudoku() {
    clearInterval(ssTimer);
    ssSeconds = 0;
    ssTimer = setInterval(() => {
        ssSeconds++;
        const m = Math.floor(ssSeconds / 60).toString().padStart(2, '0');
        const s = (ssSeconds % 60).toString().padStart(2, '0');
        document.getElementById('ss-clock').innerText = `${m}:${s}`;
    }, 1000);
}

function mostrarMensaje(txt, tipo) {
    const msg = document.getElementById('ss-message-area');
    if (!msg) return;
    msg.innerText = txt;
    msg.className = `ss-message ${tipo}`;
}

function abandonarPartida() {
    if (confirm("¿Seguro que quieres abandonar? Perderás el progreso.")) {
        clearInterval(ssTimer);
        document.getElementById('ss-game').classList.add('ss-hidden');
        document.getElementById('ss-setup').classList.remove('ss-hidden');
    }
}

function cargarTableroEjemplo(level) {
    const puzzles = {
        easy: [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]],
        medium: [[0,0,0,6,0,0,4,0,0],[7,0,0,0,0,3,6,0,0],[0,0,0,0,9,1,0,8,0],[0,0,0,0,0,0,0,0,0],[0,5,0,1,8,0,0,0,3],[0,0,0,3,0,6,0,4,5],[0,4,0,2,0,0,0,6,0],[9,0,3,0,0,0,0,0,0],[0,2,0,0,0,0,1,0,0]],
        hard: [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,3,0,8,5],[0,0,1,0,2,0,0,0,0],[0,0,0,5,0,7,0,0,0],[0,0,4,0,0,0,1,0,0],[0,9,0,0,0,0,0,0,0],[5,0,0,0,0,0,0,7,3],[0,0,2,0,1,0,0,0,0],[0,0,0,0,4,0,0,0,9]]
    };

    const board = puzzles[level] || puzzles.easy;
    const inputs = document.querySelectorAll('.ss-cell');
    inputs.forEach(inp => {
        const val = board[inp.dataset.row][inp.dataset.col];
        if (val !== 0) {
            inp.value = val;
            inp.disabled = true; // Bloquear celdas iniciales
        }
    });
}

function guardarRecordSudoku() {
    if (currentLevel === 'empty') return;
    const key = `ss_record_${currentLevel}`;
    const currentTime = document.getElementById('ss-clock').innerText;
    const bestTime = localStorage.getItem(key);

    if (!bestTime || currentTime < bestTime) {
        localStorage.setItem(key, currentTime);
        alert(`🚀 ¡Nuevo récord en ${currentLevel}!: ${currentTime}`);
        actualizarRecordsUI();
    }
}

function actualizarRecordsUI() {
    ["easy", "medium", "hard"].forEach(l => {
        const el = document.getElementById(`ss-best-${l}`);
        if (el) el.innerText = localStorage.getItem(`ss_record_${l}`) || "--:--";
    });
}