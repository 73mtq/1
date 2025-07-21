/**
 * 游戏状态管理模块
 */

import { GAME_PHASES, COLORS } from './gameConfig.js';

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        // 棋盘数据：6x6二维数组
        this.gridState = Array.from({ length: 6 }, () => Array(6).fill(null));
        
        // 游戏流程控制
        this.gamePhase = GAME_PHASES.LAYOUT;
        this.currentPlayer = COLORS.RED;
        this.playerColor = COLORS.BLUE;
        this.isPlayerTurn = false;
        
        // 布局相关
        this.clickCount = 0;
        this.redNumber = 1;
        this.blueNumber = 1;
        
        // 游戏进行中的状态
        this.selectedCell = null;
        this.diceNumber = null;
        this.isDiceRolled = false;
        
        // 棋子选择相关
        this.availableNumbersForChoice = [];
        this.pendingChoiceColor = null;
        
        // 历史记录
        this.moveHistory = [];
        this.undoneMoves = [];
    }

    // 获取当前玩家是否为人类
    isCurrentPlayerHuman() {
        return this.currentPlayer === this.playerColor;
    }

    // 切换回合
    switchTurn() {
        this.selectedCell = null;
        this.isDiceRolled = false;
        this.diceNumber = null;
        this.currentPlayer = this.currentPlayer === COLORS.RED ? COLORS.BLUE : COLORS.RED;
        this.isPlayerTurn = (this.currentPlayer === this.playerColor);
        this.availableNumbersForChoice = [];
        this.pendingChoiceColor = null;
    }

    // 设置玩家控制的颜色
    setPlayerColor(color) {
        this.playerColor = color;
        this.isPlayerTurn = (this.currentPlayer === this.playerColor);
    }
}

export default GameState;