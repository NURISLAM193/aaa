


// app.js

let grid = [];
let width = 9, height = 9, mines = 10;
let revealed = 0;
let gameOver = false;
let startTime = null;

const records = {
    easy: localStorage.getItem('record_easy') || null,
    medium: localStorage.getItem('record_medium') || null,
    hard: localStorage.getItem('record_hard') || null
};

const difficultySettings = {
    easy: { w: 9, h: 9, m: 10, name: 'Лёгкий' },
    medium: { w: 16, h: 16, m: 40, name: 'Средний' },
    hard: { w: 30, h: 16, m: 99, name: 'Сложный' }
};

function setDifficulty(level) {
    const settings = difficultySettings[level];
    document.getElementById('width').value = settings.w;
    document.getElementById('height').value = settings.h;
    document.getElementById('mines').value = settings.m;
    updateRecordDisplay(records[level]);
}

function startGame() {
    width = parseInt(document.getElementById('width').value);
    height = parseInt(document.getElementById('height').value);
    mines = parseInt(document.getElementById('mines').value);

    if (mines >= width * height) {
        alert("❌ Слишком много мин! Должно быть меньше, чем клеток.");
        return;
    }

    let recordKey = null;
    if (width === 9 && height === 9 && mines === 10) recordKey = 'easy';
    else if (width === 16 && height === 16 && mines === 40) recordKey = 'medium';
    else if (width === 30 && height === 16 && mines === 99) recordKey = 'hard';

    updateRecordDisplay(recordKey ? records[recordKey] : null);

    grid = [];
    revealed = 0;
    gameOver = false;
    startTime = null;

    const container = document.getElementById('game-container');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${width}, 32px)`;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener('click', () => handleCellClick(x, y));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(x, y);
            });

            container.appendChild(cell);
            row.push({
                element: cell,
                isMine: false,
                revealed: false,
                flagged: false,
                neighbors: 0
            });
        }
        grid.push(row);
    }

    placeMines();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);

        if (!grid[y][x].isMine) {
            grid[y][x].isMine = true;
            minesPlaced++;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        grid[ny][nx].neighbors++;
                    }
                }
            }
        }
    }
}

function handleCellClick(x, y) {
    if (gameOver || grid[y][x].revealed || grid[y][x].flagged) return;

    if (!startTime) startTime = Date.now();

    const cell = grid[y][x];
    if (cell.isMine) {
        gameOver = true;
        revealAll();
        setTimeout(() => alert("💥 Вы проиграли!"), 100);
        return;
    }

    revealCell(x, y);
    checkWin();
}

function revealCell(x, y) {
    const cell = grid[y][x];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    revealed++;
    cell.element.classList.add('revealed');
    if (cell.neighbors > 0) {
        cell.element.textContent = cell.neighbors;
        cell.element.dataset.num = cell.neighbors;
    }

    if (cell.neighbors === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    revealCell(nx, ny);
                }
            }
        }
    }
}

function toggleFlag(x, y) {
    if (gameOver || grid[y][x].revealed) return;

    const cell = grid[y][x];
    cell.flagged = !cell.flagged;
    cell.element.classList.toggle('flagged');
    cell.element.textContent = cell.flagged ? '🚩' : '';
}

function revealAll() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = grid[y][x];
            if (cell.isMine) {
                cell.element.textContent = '💣';
                cell.element.style.color = 'var(--mine)';
            }
            cell.revealed = true;
            cell.element.classList.add('revealed');
        }
    }
}

function checkWin() {
    const totalSafe = width * height - mines;
    if (revealed === totalSafe) {
        gameOver = true;
        const endTime = Date.now();
        const timeElapsed = endTime - startTime;
        const formattedTime = formatTime(timeElapsed);
        alert(`🎉 Победа! Время: ${formattedTime}`);

        let recordKey = null;
        if (width === 9 && height === 9 && mines === 10) recordKey = 'easy';
        else if (width === 16 && height === 16 && mines === 40) recordKey = 'medium';
        else if (width === 30 && height === 16 && mines === 99) recordKey = 'hard';

        if (recordKey) {
            const oldRecord = records[recordKey];
            if (!oldRecord || timeElapsed < oldRecord) {
                records[recordKey] = timeElapsed;
                localStorage.setItem(`record_${recordKey}`, timeElapsed);
                updateRecordDisplay(timeElapsed);
                setTimeout(() => alert("🎯 Новый рекорд!"), 100);
            } else {
                updateRecordDisplay(oldRecord);
            }
        }
    }
}

function formatTime(ms) {
    const secs = Math.floor(ms / 1000);
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateRecordDisplay(recordTime) {
    const recordSpan = document.getElementById('record');
    recordSpan.textContent = recordTime ? formatTime(parseInt(recordTime)) : '—';
}

// Инициализация
setDifficulty('easy');

