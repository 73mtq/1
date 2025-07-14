/**
 * 事件处理模块
 */

import { BOARD_CONFIG, GAME_PHASES, COLORS } from './gameConfig.js';
import GameRules from './gameRules.js';

class EventHandlers {
    constructor(gameState, boardRenderer, uiManager) {
        this.gameState = gameState;
        this.boardRenderer = boardRenderer;
        this.uiManager = uiManager;
    }

    /**
     * 设置所有事件监听器
     */
    setupEventListeners(canvas) {
        this.setupCanvasEvents(canvas);
        this.setupButtonEvents();
        this.setupMouseMoveEvent(canvas);
    }

    /**
     * 设置Canvas点击事件
     */
    setupCanvasEvents(canvas) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / BOARD_CONFIG.CELL_WIDTH);
            const row = Math.floor(y / BOARD_CONFIG.CELL_HEIGHT);

            if (col < 0 || col >= 6 || row < 0 || row >= 6) return;

            this.handleCanvasClick(row, col);
        });
    }

    /**
     * 处理Canvas点击逻辑
     */
    handleCanvasClick(row, col) {
        if (this.gameState.gamePhase === GAME_PHASES.LAYOUT) {
            this.handleLayoutClick(row, col);
        } else if (this.gameState.gamePhase === GAME_PHASES.PLAYING) {
            this.handleGameplayClick(row, col);
        }
    }

    /**
     * 处理布局阶段的点击
     */
    handleLayoutClick(row, col) {
        if (this.gameState.gridState[row][col] !== null) {
            // alert("此位置已有棋子！");
            return;
        }

        let color, number;
        if (this.gameState.clickCount < 6) {
            color = COLORS.RED;
            number = this.gameState.redNumber++;
        } else {
            color = COLORS.BLUE;
            number = this.gameState.blueNumber++;
        }

        this.boardRenderer.renderCell(row, col, color, number);
        this.gameState.gridState[row][col] = { color, number };
        this.gameState.clickCount++;

        if (this.gameState.clickCount === 12) {
            // alert("棋子布局完成！请选择你要控制的颜色（红方先手）");
            this.gameState.gamePhase = GAME_PHASES.WAITING_FOR_CHOICE;
        }
        
        this.uiManager.updateStatusBar(this.gameState);
    }

    /**
     * 处理游戏进行中的点击
     */
    handleGameplayClick(row, col) {
        const cellData = this.gameState.gridState[row][col];

        // 处理多选择情况
        if (this.gameState.availableNumbersForChoice.length > 0) {
            this.handleMultipleChoice(row, col, cellData);
            return;
        }

        // 处理移动
        if (this.gameState.selectedCell) {
            this.handleMove(row, col);
            return;
        }

        // 处理棋子选择
        this.handlePieceSelection(row, col, cellData);
    }

    /**
     * 处理多选择情况
     */
    handleMultipleChoice(row, col, cellData) {
        if (cellData && cellData.color === this.gameState.pendingChoiceColor) {
            const selectedNumber = cellData.number;
            if (this.gameState.availableNumbersForChoice.includes(selectedNumber)) {
                // alert(`你选择了编号：${selectedNumber}`);
                this.gameState.availableNumbersForChoice = [];
                this.gameState.pendingChoiceColor = null;
                this.gameState.selectedCell = { row, col };
                this.uiManager.updateStatusBar(this.gameState);
            } else {
                // alert(`请选择编号为 ${this.gameState.availableNumbersForChoice.join(' 或 ')} 的棋子`);
            }
        }
    }

    /**
     * 处理棋子移动
     */
    handleMove(row, col) {
        const fromRow = this.gameState.selectedCell.row;
        const fromCol = this.gameState.selectedCell.col;
        const fromData = this.gameState.gridState[fromRow][fromCol];

        if (row === fromRow && col === fromCol) {
            // 取消选择
            this.gameState.selectedCell = null;
            this.uiManager.updateStatusBar(this.gameState);
            return;
        }

        if (GameRules.isValidMove(fromRow, fromCol, row, col, fromData.color)) {
            // 执行移动（这里需要调用主游戏类的方法）
            this.onMoveExecuted(fromRow, fromCol, row, col);
        } else {
            // alert("不允许的移动方向！");
            this.gameState.selectedCell = null;
            this.uiManager.updateStatusBar(this.gameState);
        }
    }

    /**
     * 处理棋子选择
     */
    handlePieceSelection(row, col, cellData) {
        if (!cellData || cellData.color !== this.gameState.currentPlayer || 
            this.gameState.currentPlayer !== this.gameState.playerColor) {
            if (cellData && cellData.color !== this.gameState.currentPlayer) {
                // alert("不能选择对方的棋子！");
            } else if (this.gameState.currentPlayer !== this.gameState.playerColor) {
                // alert("当前是电脑回合！");
            }
            return;
        }

        if (!this.gameState.isDiceRolled) {
            // alert("请先掷骰子！");
            return;
        }

        const pieceResult = GameRules.findAvailablePiece(
            this.gameState.diceNumber, 
            this.gameState.currentPlayer, 
            this.gameState.gridState
        );

        if (pieceResult.needChoice) {
            this.gameState.availableNumbersForChoice = pieceResult.availableChoices;
            this.gameState.pendingChoiceColor = this.gameState.currentPlayer;
            // alert(`编号 ${this.gameState.diceNumber} 不存在，请从以下编号中选择一个：${pieceResult.availableChoices.join(', ')}`);
            this.uiManager.updateStatusBar(this.gameState);
            return;
        }

        if (cellData.number === pieceResult.chosenNumber) {
            this.gameState.selectedCell = { row, col };
            if (pieceResult.chosenNumber !== this.gameState.diceNumber) {
                // alert(`编号 ${this.gameState.diceNumber} 不存在，使用编号 ${pieceResult.chosenNumber}`);
            }
            this.uiManager.updateStatusBar(this.gameState);
        } else {
            // alert(`请选择编号为 ${pieceResult.chosenNumber} 的棋子`);
        }
    }

    /**
     * 设置按钮事件
     */
    setupButtonEvents() {
        // 掷骰子按钮
        document.getElementById('dice').addEventListener('click', () => {
            this.onDiceClicked();
        });

        // 重新开始按钮
        document.getElementById('restart').addEventListener('click', () => {
            this.onRestartClicked();
        });

        // 玩家先手按钮
        document.getElementById('playerFirst').addEventListener('click', () => {
            this.onPlayerFirstClicked();
        });

        // 电脑先手按钮
        document.getElementById('computerFirst').addEventListener('click', () => {
            this.onComputerFirstClicked();
        });

        // 悔棋按钮
        document.getElementById('goback').addEventListener('click', () => {
            this.onGobackClicked();
        });

        // 撤销悔棋按钮
        document.getElementById('return').addEventListener('click', () => {
            this.onReturnClicked();
        });
    }

    /**
     * 设置鼠标移动事件
     */
    setupMouseMoveEvent(canvas) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / BOARD_CONFIG.CELL_WIDTH);
            const row = Math.floor(y / BOARD_CONFIG.CELL_HEIGHT);

            const demo = document.getElementById('demo');
            if (col >= 0 && col < 5 && row >= 0 && row < 5) {
                demo.textContent = `坐标：(${row}, ${col})`;
            } else {
                demo.textContent = '坐标：超出棋盘范围';
            }
        });
    }

    // 以下方法需要在主游戏类中实现具体逻辑
    onMoveExecuted(fromRow, fromCol, toRow, toCol) {
        // 由主游戏类实现
    }

    onDiceClicked() {
        // 由主游戏类实现
    }

    onRestartClicked() {
        // 由主游戏类实现
    }

    onPlayerFirstClicked() {
        // 由主游戏类实现
    }

    onComputerFirstClicked() {
        // 由主游戏类实现
    }

    onGobackClicked() {
        // 由主游戏类实现
    }

    onReturnClicked() {
        // 由主游戏类实现
    }
}

export default EventHandlers;