/**
 * AI玩家逻辑模块
 */

import GameRules from './gameRules.js';
import { MOVE_DIRECTIONS } from './gameConfig.js';

class AIPlayer {
    /**
     * AI移动决策
     * @param {number} diceNum - 掷骰子结果
     * @param {string} aiColor - AI颜色
     * @param {Array} gridState - 棋盘状态
     * @returns {Object} 移动决策结果
     */
    static makeMove(diceNum, aiColor, gridState) {
        // 收集AI所有棋子
        const aiPieces = [];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = gridState[row][col];
                if (cell && cell.color === aiColor) {
                    aiPieces.push({ row, col, number: cell.number });
                }
            }
        }

        if (aiPieces.length === 0) {
            return { success: false, message: "AI无棋可走！" };
        }

        // 使用游戏规则找到要移动的棋子
        const pieceResult = GameRules.findAvailablePiece(diceNum, aiColor, gridState);
        
        if (pieceResult.chosenNumber === null) {
            if (pieceResult.needChoice && pieceResult.availableChoices) {
                // AI随机选择一个
                const randomChoice = pieceResult.availableChoices[
                    Math.floor(Math.random() * pieceResult.availableChoices.length)
                ];
                const targetPiece = aiPieces.find(piece => piece.number === randomChoice);
                return this.executeMoveLogic(targetPiece, aiColor, gridState, diceNum, randomChoice);
            } else {
                return { success: false, message: "AI无棋可走！" };
            }
        }

        const targetPiece = aiPieces.find(piece => piece.number === pieceResult.chosenNumber);
        if (!targetPiece) {
            return { success: false, message: "AI无法找到对应棋子！" };
        }

        return this.executeMoveLogic(targetPiece, aiColor, gridState, diceNum, pieceResult.chosenNumber);
    }

    /**
     * 执行具体的移动逻辑
     */
    static executeMoveLogic(targetPiece, aiColor, gridState, diceNum, chosenNumber) {
        const possibleMoves = this.findPossibleMoves(targetPiece, aiColor, gridState);
        
        if (possibleMoves.length === 0) {
            return { 
                success: false, 
                message: `AI的棋子${targetPiece.number}无法移动！` 
            };
        }

        const selectedMove = this.selectBestMove(possibleMoves, gridState, aiColor);
        
        return {
            success: true,
            from: { row: targetPiece.row, col: targetPiece.col },
            to: { row: selectedMove.row, col: selectedMove.col },
            message: `AI移动：棋子${targetPiece.number} 从(${targetPiece.row}, ${targetPiece.col})移动到(${selectedMove.row}, ${selectedMove.col})`,
            chosenNumber,
            diceNum
        };
    }

    /**
     * 找到所有可能的移动位置
     */
    static findPossibleMoves(targetPiece, aiColor, gridState) {
        const possibleMoves = [];
        const directions = MOVE_DIRECTIONS[aiColor.toUpperCase()];
        
        for (let [dr, dc] of directions) {
            const newRow = targetPiece.row + dr;
            const newCol = targetPiece.col + dc;
            
            if (GameRules.isValidMove(targetPiece.row, targetPiece.col, newRow, newCol, aiColor)) {
                possibleMoves.push({ row: newRow, col: newCol });
            }
        }
        
        return possibleMoves;
    }

    /**
     * AI移动策略：选择最佳移动
     */
    static selectBestMove(possibleMoves, gridState, aiColor) {
        // 1. 优先吃掉敌方棋子
        const enemyCaptureMoves = possibleMoves.filter(move => {
            const cell = gridState[move.row][move.col];
            return cell && cell.color !== aiColor;
        });
        
        if (enemyCaptureMoves.length > 0) {
            return enemyCaptureMoves[Math.floor(Math.random() * enemyCaptureMoves.length)];
        }

        // 2. 其次移动到空位置
        const emptyMoves = possibleMoves.filter(move => {
            const cell = gridState[move.row][move.col];
            return !cell;
        });
        
        if (emptyMoves.length > 0) {
            return emptyMoves[Math.floor(Math.random() * emptyMoves.length)];
        }

        // 3. 最后吃掉自己的棋子
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
}

export default AIPlayer;