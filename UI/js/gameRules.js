/**
 * 游戏规则和移动验证模块
 */

import { COLORS, MOVE_DIRECTIONS, WIN_POSITIONS } from './gameConfig.js';

class GameRules {
    /**
     * 验证棋子移动是否合法
     * @param {number} fromRow - 起始行
     * @param {number} fromCol - 起始列
     * @param {number} toRow - 目标行
     * @param {number} toCol - 目标列
     * @param {string} color - 棋子颜色
     * @returns {boolean} 是否为合法移动
     */
    static isValidMove(fromRow, fromCol, toRow, toCol, color) {
        // 检查边界
        if (toRow < 0 || toRow >= 6 || toCol < 0 || toCol >= 6) {
            return false;
        }

        // 不能移动到原位置
        if (fromRow === toRow && fromCol === toCol) {
            return false;
        }

        const dRow = toRow - fromRow;
        const dCol = toCol - fromCol;

        // 检查移动方向
        const validDirections = MOVE_DIRECTIONS[color.toUpperCase()];
        return validDirections.some(([dr, dc]) => dr === dRow && dc === dCol);
    }

    /**
     * 根据掷骰子结果找到可移动的棋子
     * @param {number} targetNum - 目标编号
     * @param {string} color - 棋子颜色
     * @param {Array} gridState - 棋盘状态
     * @returns {Object} 返回结果对象
     */
    static findAvailablePiece(targetNum, color, gridState) {
        const availableNumbers = [];

        // 收集所有该颜色的棋子编号
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = gridState[row][col];
                if (cell && cell.color === color && cell.number) {
                    availableNumbers.push(cell.number);
                }
            }
        }

        if (availableNumbers.includes(targetNum)) {
            return { chosenNumber: targetNum, needChoice: false };
        }

        if (availableNumbers.length === 0) {
            return { chosenNumber: null, needChoice: false };
        }

        // 找距离最近的编号
        const candidates = [...availableNumbers].sort((a, b) => 
            Math.abs(a - targetNum) - Math.abs(b - targetNum)
        );

        const minDiff = Math.abs(candidates[0] - targetNum);
        const closestNumbers = candidates.filter(num => 
            Math.abs(num - targetNum) === minDiff
        );

        if (closestNumbers.length > 1) {
            return { 
                chosenNumber: null, 
                needChoice: true, 
                availableChoices: closestNumbers 
            };
        } else {
            return { chosenNumber: closestNumbers[0], needChoice: false };
        }
    }

    /**
     * 检查游戏胜负条件
     * @param {Array} gridState - 棋盘状态
     * @returns {Object} 胜负结果
     */
    static checkWinCondition(gridState) {
        let hasRed = false;
        let hasBlue = false;

        // 统计棋子
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = gridState[row][col];
                if (cell) {
                    if (cell.color === COLORS.RED) hasRed = true;
                    if (cell.color === COLORS.BLUE) hasBlue = true;
                }
            }
        }

        // 检查棋子被吃光
        if (!hasRed) {
            return { isGameOver: true, winner: COLORS.BLUE, reason: '红方所有棋子已被吃光！' };
        }
        if (!hasBlue) {
            return { isGameOver: true, winner: COLORS.RED, reason: '蓝方所有棋子已被吃光！' };
        }

        // 检查到达目标位置
        const redAtGoal = gridState[WIN_POSITIONS.RED_GOAL.row][WIN_POSITIONS.RED_GOAL.col]?.color === COLORS.RED;
        const blueAtGoal = gridState[WIN_POSITIONS.BLUE_GOAL.row][WIN_POSITIONS.BLUE_GOAL.col]?.color === COLORS.BLUE;

        if (redAtGoal) {
            return { isGameOver: true, winner: COLORS.RED, reason: '已到达右下角！' };
        }
        if (blueAtGoal) {
            return { isGameOver: true, winner: COLORS.BLUE, reason: '已到达左上角！' };
        }

        return { isGameOver: false };
    }
}

export default GameRules;