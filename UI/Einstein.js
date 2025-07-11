var context = chess.getContext('2d');
context.strokeStyle = '#4f4b4b';

const canvas = document.getElementById('chess');
const demo = document.getElementById('demo');

let clickCount = 0;
let selectedCell = null; // 当前选中的格子 {row, col}

// 初始化棋盘状态：null 表示未填充
const gridState = Array.from({ length: 6 }, () => Array(6).fill(null));

const cellWidth = 450 / 5;
const cellHeight = 450 / 5;

// 绘制 6x6 棋盘并铺满 canvas
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

// 鼠标移动事件：获取格子坐标
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

// 渲染单个格子
function renderCell(row, col, color) {
    const startX = col * cellWidth;
    const startY = row * cellHeight;
    context.fillStyle = color;
    context.fillRect(startX + 1, startY + 1, cellWidth - 2, cellHeight - 2);
}

// 判断是否合法移动
function isValidMove(fromRow, fromCol, toRow, toCol, color) {
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;

    if (color === 'red') {
        return (dRow === 0 && dCol === 1) ||   // 向右
               (dRow === 1 && dCol === 0) ||   // 向下
               (dRow === 1 && dCol === 1);     // 右下
    } else if (color === 'blue') {
        return (dRow === 0 && dCol === -1) ||  // 向左
               (dRow === -1 && dCol === 0) ||  // 向上
               (dRow === -1 && dCol === -1);   // 左上
    }
    return false;
}

// 鼠标点击事件：选择或移动格子
canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col < 0 || col >= 6 || row < 0 || row >= 6) return;

    const cellColor = gridState[row][col];

    // 如果已经有一个格子被选中
    if (selectedCell) {
        const fromRow = selectedCell.row;
        const fromCol = selectedCell.col;
        const fromColor = gridState[fromRow][fromCol];

        if (isValidMove(fromRow, fromCol, row, col, fromColor)) {
            // 允许移动
            if (gridState[row][col] !== null) {
                // 如果目标有颜色就清除
                renderCell(row, col, '#deb27f'); // 恢复背景色
            }

            renderCell(row, col, fromColor); // 填充新位置
            renderCell(fromRow, fromCol, '#deb27f'); // 清除旧位置

            gridState[row][col] = fromColor;
            gridState[fromRow][fromCol] = null;

            selectedCell = null;
        } else {
            alert("不允许的移动方向！");
            selectedCell = null;
        }
    } else if (cellColor !== null) {
        // 第一次点击：选中一个已存在的颜色格子
        selectedCell = { row, col };
    } else if (clickCount < 12) {
        // 新增点击填充格子
        const color = clickCount < 6 ? 'red' : 'blue';
        renderCell(row, col, color);
        gridState[row][col] = color;
        clickCount++;
    }
});

window.onload = function () {
    drawChessBoard(); // 调用绘制棋盘线的函数
};