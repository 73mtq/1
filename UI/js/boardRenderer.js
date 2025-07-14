/**
 * 棋盘渲染模块
 */

import { BOARD_CONFIG, COLORS } from './gameConfig.js';

class BoardRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.strokeStyle = '#4f4b4b';
    }

    /**
     * 绘制棋盘网格线
     */
    drawChessBoard() {
        const { GRID_COUNT, SIZE } = BOARD_CONFIG;
        const spacingX = SIZE / (GRID_COUNT - 1);
        const spacingY = SIZE / (GRID_COUNT - 1);

        // 绘制垂直线
        for (let i = 0; i < GRID_COUNT; i++) {
            this.context.moveTo(i * spacingX, 0);
            this.context.lineTo(i * spacingX, SIZE);
            this.context.stroke();
        }

        // 绘制水平线
        for (let i = 0; i < GRID_COUNT; i++) {
            this.context.moveTo(0, i * spacingY);
            this.context.lineTo(SIZE, i * spacingY);
            this.context.stroke();
        }
    }

    /**
     * 渲染单个棋盘格子
     * @param {number} row - 行坐标
     * @param {number} col - 列坐标
     * @param {string} color - 颜色
     * @param {number} number - 棋子编号（可选）
     */
    renderCell(row, col, color, number = null) {
        const { CELL_WIDTH, CELL_HEIGHT } = BOARD_CONFIG;
        const startX = col * CELL_WIDTH;
        const startY = row * CELL_HEIGHT;

        // 填充背景色
        this.context.fillStyle = color;
        this.context.fillRect(startX + 1, startY + 1, CELL_WIDTH - 2, CELL_HEIGHT - 2);

        // 绘制棋子编号
        if (number !== null) {
            this.context.fillStyle = '#fff';
            this.context.font = 'bold 16px Arial';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(number, startX + CELL_WIDTH / 2, startY + CELL_HEIGHT / 2);
        }
    }

    /**
     * 清空整个棋盘
     */
    clearBoard() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.renderCell(row, col, COLORS.EMPTY);
            }
        }
    }

    /**
     * 根据游戏状态渲染整个棋盘
     * @param {Array} gridState - 棋盘状态数组
     */
    renderBoard(gridState) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = gridState[row][col];
                if (cell) {
                    this.renderCell(row, col, cell.color, cell.number);
                } else {
                    this.renderCell(row, col, COLORS.EMPTY);
                }
            }
        }
    }
}

export default BoardRenderer;