/**
 * 主游戏控制器 - 整合所有模块
 */

import GameState from './gameState.js';
import BoardRenderer from './boardRenderer.js';
import GameRules from './gameRules.js';
import AIPlayer from './aiPlayer.js';
import EventHandlers from './eventHandlers.js';
import UIManager from './uiManager.js';
import { GAME_PHASES, COLORS } from './gameConfig.js';

class EinsteinGame {
    constructor() {
        this.gameState = new GameState();
        
        const canvas = document.getElementById('chess');
        this.boardRenderer = new BoardRenderer(canvas);
        this.uiManager = new UIManager();
        this.eventHandlers = new EventHandlers(this.gameState, this.boardRenderer, this.uiManager);
        
        this.init();
    }

    /**
     * 初始化游戏
     */
    init() {
        this.boardRenderer.drawChessBoard();
        this.uiManager.updateStatusBar(this.gameState);
        
        // 设置事件监听器
        this.eventHandlers.setupEventListeners(document.getElementById('chess'));
        
        // 绑定事件处理方法
        this.bindEventMethods();
    }

    /**
     * 绑定事件处理方法
     */
    bindEventMethods() {
        this.eventHandlers.onMoveExecuted = this.executeMove.bind(this);
        this.eventHandlers.onDiceClicked = this.handleDiceClick.bind(this);
        this.eventHandlers.onRestartClicked = this.resetGame.bind(this);
        this.eventHandlers.onPlayerFirstClicked = this.handlePlayerFirst.bind(this);
        this.eventHandlers.onComputerFirstClicked = this.handleComputerFirst.bind(this);
        this.eventHandlers.onGobackClicked = this.handleGoback.bind(this);
        this.eventHandlers.onReturnClicked = this.handleReturn.bind(this);
    }

    /**
     * 执行棋子移动
     */
    executeMove(fromRow, fromCol, toRow, toCol) {
        const fromData = this.gameState.gridState[fromRow][fromCol];
        const toData = this.gameState.gridState[toRow][toCol];
        
        // 保存移动历史
        this.gameState.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            prevState: JSON.parse(JSON.stringify(this.gameState.gridState)),
            newState: null,
            currentPlayer: this.gameState.currentPlayer,
            diceNumber: this.gameState.diceNumber,
            isDiceRolled: this.gameState.isDiceRolled
        });
        
        // 处理吃子
        if (toData) {
            const eatMessage = toData.color === fromData.color ? 
                `${fromData.color === COLORS.RED ? '红方' : '蓝方'}吃掉了自己的棋子${toData.number}！` :
                `${fromData.color === COLORS.RED ? '红方' : '蓝方'}吃掉了${toData.color === COLORS.RED ? '红方' : '蓝方'}的棋子${toData.number}！`;
            alert(eatMessage);
        }
        
        // 更新棋盘
        this.boardRenderer.renderCell(toRow, toCol, fromData.color, fromData.number);
        this.boardRenderer.renderCell(fromRow, fromCol, COLORS.EMPTY);
        
        this.gameState.gridState[toRow][toCol] = fromData;
        this.gameState.gridState[fromRow][fromCol] = null;
        
        // 保存移动后状态
        this.gameState.moveHistory[this.gameState.moveHistory.length - 1].newState = 
            JSON.parse(JSON.stringify(this.gameState.gridState));
        
        // 检查胜负
        const winResult = GameRules.checkWinCondition(this.gameState.gridState);
        if (winResult.isGameOver) {
            this.endGame(`${winResult.winner === COLORS.RED ? '红方' : '蓝方'}获胜！${winResult.reason}`);
            return;
        }
        
        this.gameState.switchTurn();
        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 处理掷骰子
     */
    handleDiceClick() {
        if (this.gameState.gamePhase !== GAME_PHASES.PLAYING) {
            // alert("请先完成棋子布局并选择颜色");
            return;
        }
        
        if (this.gameState.isDiceRolled) {
            // alert("请先完成本轮移动再重新掷骰子");
            return;
        }

        const isRandom = this.uiManager.askDiceMethod();
        let num;
        
        if (isRandom) {
            num = Math.floor(Math.random() * 6) + 1;
            this.uiManager.showDiceResult(num, false);
        } else {
            num = this.uiManager.getCustomDiceNumber();
            if (num === null) return; // 用户取消
            this.uiManager.showDiceResult(num, true);
        }
        
        this.gameState.diceNumber = num;
        this.gameState.isDiceRolled = true;
        
        // 如果是电脑回合，自动执行AI移动
        if (!this.gameState.isCurrentPlayerHuman()) {
            setTimeout(() => {
                this.executeAIMove(num);
            }, 1000);
        }
        
        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 执行AI移动
     */
    executeAIMove(diceNum) {
        const moveResult = AIPlayer.makeMove(
            diceNum, 
            this.gameState.currentPlayer, 
            this.gameState.gridState
        );
        
        if (!moveResult.success) {
            alert(moveResult.message);
            this.gameState.switchTurn();
            this.uiManager.updateStatusBar(this.gameState);
            return;
        }
        
        if (moveResult.chosenNumber !== moveResult.diceNum) {
            // alert(`编号 ${moveResult.diceNum} 不存在，AI选择编号 ${moveResult.chosenNumber}`);
        }
        
        this.executeMove(moveResult.from.row, moveResult.from.col, moveResult.to.row, moveResult.to.col);
        alert(moveResult.message);
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.gameState.reset();
        this.boardRenderer.clearBoard();
        this.uiManager.enableBoardInteraction();
        this.uiManager.updateStatusBar(this.gameState);
        // alert("游戏已重置，请重新布局棋子");
    }

    /**
     * 玩家先手
     */
    handlePlayerFirst() {
        if (this.gameState.gamePhase !== GAME_PHASES.WAITING_FOR_CHOICE) {
            // alert("请先完成棋子布局！");
            return;
        }
        
        this.gameState.gamePhase = GAME_PHASES.PLAYING;
        this.gameState.setPlayerColor(COLORS.RED);
        // alert("你控制红方，红方先手，请掷骰子开始游戏！");
        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 电脑先手
     */
    handleComputerFirst() {
        if (this.gameState.gamePhase !== GAME_PHASES.WAITING_FOR_CHOICE) {
            // alert("请先完成棋子布局！");
            return;
        }
        
        this.gameState.gamePhase = GAME_PHASES.PLAYING;
        this.gameState.setPlayerColor(COLORS.BLUE);
        // alert("电脑控制红方先手，请掷骰子，电脑会根据点数自动走棋！");
        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 悔棋
     */
    handleGoback() {
        if (this.gameState.moveHistory.length === 0 || this.gameState.gamePhase !== GAME_PHASES.PLAYING) {
            // alert("没有可悔的棋");
            return;
        }

        const lastMove = this.gameState.moveHistory.pop();
        this.gameState.undoneMoves.push(lastMove);

        // 恢复棋盘状态
        this.boardRenderer.renderBoard(lastMove.prevState);
        this.gameState.gridState = JSON.parse(JSON.stringify(lastMove.prevState));

        // 恢复游戏状态
        this.gameState.selectedCell = null;
        this.gameState.isDiceRolled = false;
        this.gameState.diceNumber = null;
        this.gameState.currentPlayer = lastMove.currentPlayer;
        this.gameState.isPlayerTurn = (this.gameState.currentPlayer === this.gameState.playerColor);
        this.gameState.availableNumbersForChoice = [];
        this.gameState.pendingChoiceColor = null;

        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 撤销悔棋
     */
    handleReturn() {
        if (this.gameState.undoneMoves.length === 0) {
            // alert("没有可撤销的悔棋");
            return;
        }

        const redoMove = this.gameState.undoneMoves.pop();
        this.gameState.moveHistory.push(redoMove);

        // 恢复棋盘状态
        this.boardRenderer.renderBoard(redoMove.newState);
        this.gameState.gridState = JSON.parse(JSON.stringify(redoMove.newState));

        // 恢复游戏状态
        this.gameState.selectedCell = null;
        this.gameState.isDiceRolled = false;
        this.gameState.diceNumber = null;
        this.gameState.currentPlayer = redoMove.currentPlayer === COLORS.RED ? COLORS.BLUE : COLORS.RED;
        this.gameState.isPlayerTurn = (this.gameState.currentPlayer === this.gameState.playerColor);
        this.gameState.availableNumbersForChoice = [];
        this.gameState.pendingChoiceColor = null;

        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 结束游戏
     */
    endGame(message) {
        this.uiManager.showGameEnd(message);
        this.gameState.gamePhase = GAME_PHASES.ENDED;
    }
}

// 页面加载完成后初始化游戏
window.onload = function () {
    new EinsteinGame();
};