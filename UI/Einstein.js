var context = chess.getContext('2d');
context.strokeStyle = '#4f4b4b';

const canvas = document.getElementById('chess');
const demo = document.getElementById('demo');

let clickCount = 0;
let selectedCell = null;

const gridState = Array.from({ length: 6 }, () => Array(6).fill(null));
const cellWidth = 450 / 5;
const cellHeight = 450 / 5;

var drawChessBoard = function () {
    const cols = 6;
    const rows = 6;
    const spacingX = 450 / (cols - 1);
    const spacingY = 450 / (rows - 1);

    for (let i = 0; i < cols; i++) {
        context.moveTo(i * spacingX, 0);
        context.lineTo(i * spacingX, 450);
        context.stroke();
    }

    for (let i = 0; i < rows; i++) {
        context.moveTo(0, i * spacingY);
        context.lineTo(450, i * spacingY);
        context.stroke();
    }
};

canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col >= 0 && col < 6 && row >= 0 && row < 6) {
        demo.textContent = `坐标：(${row}, ${col})`;
    } else {
        demo.textContent = '坐标：超出棋盘范围';
    }
});

let redNumber = 1;
let blueNumber = 1;

function renderCell(row, col, color, number = null) {
    const startX = col * cellWidth;
    const startY = row * cellHeight;

    context.fillStyle = color;
    context.fillRect(startX + 1, startY + 1, cellWidth - 2, cellHeight - 2);

    if (number !== null) {
        context.fillStyle = '#fff';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number, startX + cellWidth / 2, startY + cellHeight / 2);
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol, color) {
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;

    if (color === 'red') {
        return (dRow === 0 && dCol === 1) || (dRow === 1 && dCol === 0) || (dRow === 1 && dCol === 1);
    } else if (color === 'blue') {
        return (dRow === 0 && dCol === -1) || (dRow === -1 && dCol === 0) || (dRow === -1 && dCol === -1);
    }
    return false;
}

// 存储当前可选编号和颜色，用于后续点击确认
let availableNumbersForChoice = [];
let pendingChoiceColor = null;

function findAvailablePiece(targetNum, color) {
    const availableNumbers = [];

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = gridState[row][col];
            if (cell && cell.color === color && cell.number) {
                availableNumbers.push(cell.number);
            }
        }
    }

    if (availableNumbers.includes(targetNum)) {
        return targetNum;
    } else {
        // 找到所有存在的编号中比目标近的编号
        const candidates = [...availableNumbers].sort((a, b) => Math.abs(a - targetNum) - Math.abs(b - targetNum));

        // 筛选出距离相同的最近编号
        const minDiff = Math.abs(candidates[0] - targetNum);
        const closestNumbers = candidates.filter(num => Math.abs(num - targetNum) === minDiff);

        // 如果有多个候选，弹出选项让用户选择
        if (closestNumbers.length > 1) {
            alert(`编号 ${targetNum} 已被吃掉，请从以下编号中选择一个：${closestNumbers.join(', ')}`);
            availableNumbersForChoice = closestNumbers;
            pendingChoiceColor = color;
            return null; // 表示需要等待用户选择
        } else {
            const chosen = closestNumbers[0];
            alert(`编号 ${targetNum} 已被吃掉，使用编号：${chosen}`);
            return chosen;
        }
    }
}

let currentPlayer = 'red';
let diceNumber = null;
let isDiceRolled = false;

function updateStatusBar() {
    const playerSpan = document.getElementById('currentPlayer');
    const diceSpan = document.getElementById('diceNumber');
    const statusSpan = document.getElementById('canMoveStatus');

    playerSpan.textContent = currentPlayer === 'red' ? '红方' : '蓝方';
    diceSpan.textContent = diceNumber !== null ? diceNumber : '未掷';

    if (clickCount < 12) {
        statusSpan.textContent = '请完成布局';
    } else if (!isDiceRolled) {
        statusSpan.textContent = '请掷骰子';
    } else if (selectedCell) {
        statusSpan.textContent = '请选择目标位置';
    } else {
        statusSpan.textContent = '请选中棋子';
    }
}

let moveHistory = [];
let undoneMoves = [];

const gobackBtn = document.getElementById('goback');
const returnBtn = document.getElementById('return');

gobackBtn.addEventListener('click', () => {
    if (moveHistory.length === 0) {
        alert("没有可悔的棋");
        return;
    }

    const lastMove = moveHistory.pop();
    undoneMoves.push(lastMove);

    // 恢复上一步状态
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = lastMove.prevState[row][col];
            if (cell) {
                renderCell(row, col, cell.color, cell.number);
            } else {
                renderCell(row, col, '#fefdfc');
            }
            gridState[row][col] = cell;
        }
    }

    selectedCell = null;

    // 悔棋后允许重新掷骰子
    isDiceRolled = false;
    diceNumber = null;

    currentPlayer = lastMove.currentPlayer;

    updateStatusBar();
});

returnBtn.addEventListener('click', () => {
    if (undoneMoves.length === 0) {
        alert("没有可撤销的悔棋");
        return;
    }

    const redoMove = undoneMoves.pop();
    moveHistory.push(redoMove);

    // 恢复到悔棋前的状态
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = redoMove.prevState[row][col];
            if (cell) {
                renderCell(row, col, cell.color, cell.number);
            } else {
                renderCell(row, col, '#fefdfc');
            }
            gridState[row][col] = cell;
        }
    }

    selectedCell = null;

    // 撤销悔棋后允许重新掷骰子
    isDiceRolled = false;
    diceNumber = null;

    currentPlayer = redoMove.currentPlayer;

    updateStatusBar();
});

const diceBtn = document.getElementById('dice');

diceBtn.addEventListener('click', () => {
    if (!isDiceRolled) {
        const num = Math.floor(Math.random() * 6) + 1;
        alert(`🎲 掷得点数：${num}`);
        diceNumber = num;
        isDiceRolled = true;
    } else {
        alert("请先完成本轮移动再重新掷骰子");
    }
    updateStatusBar();
});

canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col < 0 || col >= 6 || row < 0 || row >= 6) return;

    const cellData = gridState[row][col];

    // 如果正在等待用户选择编号
    if (availableNumbersForChoice.length > 0 && cellData !== null && cellData.color === pendingChoiceColor) {
        const selectedNumber = cellData.number;
        if (availableNumbersForChoice.includes(selectedNumber)) {
            alert(`你选择了编号：${selectedNumber}`);
            availableNumbersForChoice = [];
            pendingChoiceColor = null;

            selectedCell = { row, col };
            updateStatusBar();
        } else {
            alert(`请选择编号为 ${availableNumbersForChoice.join(' 或 ')} 的棋子`);
        }
        return;
    }

    // 如果已经有一个格子被选中
    if (selectedCell) {
        const fromRow = selectedCell.row;
        const fromCol = selectedCell.col;
        const fromData = gridState[fromRow][fromCol];

        if (isValidMove(fromRow, fromCol, row, col, fromData.color)) {
            moveHistory.push({
                from: { row: fromRow, col: fromCol },
                to: { row, col },
                prevState: JSON.parse(JSON.stringify(gridState.map(row => [...row]))),
                currentPlayer,
                diceNumber,
                isDiceRolled
            });
            undoneMoves = [];

            renderCell(row, col, fromData.color, fromData.number);
            renderCell(fromRow, fromCol, '#fefdfc');

            gridState[row][col] = fromData;
            gridState[fromRow][fromCol] = null;

            selectedCell = null;
            isDiceRolled = false;
            currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
            updateStatusBar();
        } else {
            alert("不允许的移动方向！");
            selectedCell = null;
        }
    } else if (cellData !== null && cellData.color) {
    if (clickCount >= 12) {
        if (!isDiceRolled) {
            alert("请先掷骰子！");
            return;
        }

        // 判断是否是当前玩家的棋子
        if (cellData.color !== currentPlayer) {
            alert("不能选择对方阵营的棋子");
            return;
        }

        const targetNumber = diceNumber;

        const chosenNumber = findAvailablePiece(targetNumber, currentPlayer);

        if (chosenNumber === null) {
            // 等待用户选择编号
            return;
        }

        if (cellData.number === chosenNumber) {
            selectedCell = { row, col };
            updateStatusBar();
        } else {
            alert(`请选择编号为 ${chosenNumber} 的棋子`);
        }
    }
} else if (clickCount < 12) {
        let color, number;

        if (clickCount < 6) {
            color = 'red';
            number = redNumber++;
        } else {
            color = 'blue';
            number = blueNumber++;
        }

        renderCell(row, col, color, number);
        gridState[row][col] = { color, number };
        clickCount++;

        if (clickCount === 12) {
            alert("棋子布局完成，请开始游戏！");
            currentPlayer = 'red';
            updateStatusBar();
        }
    }
});

window.onload = function () {
    drawChessBoard();
    gobackBtn.classList.remove('unable');
    returnBtn.classList.remove('unable');
    updateStatusBar();
};