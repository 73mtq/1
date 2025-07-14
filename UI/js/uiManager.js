/**
 * UI管理模块
 */

import { GAME_PHASES, COLORS } from './gameConfig.js';

class UIManager {
    /**
     * 更新状态栏显示
     * @param {GameState} gameState - 游戏状态对象
     */
    updateStatusBar(gameState) {
        const playerSpan = document.getElementById('currentPlayer');
        const diceSpan = document.getElementById('diceNumber');
        const statusSpan = document.getElementById('canMoveStatus');

        if (gameState.gamePhase === GAME_PHASES.LAYOUT) {
            playerSpan.textContent = gameState.clickCount < 6 ? '红方布局' : '蓝方布局';
            diceSpan.textContent = '未开始';
            statusSpan.textContent = '请完成棋子布局';
        } else if (gameState.gamePhase === GAME_PHASES.WAITING_FOR_CHOICE) {
            playerSpan.textContent = '等待选择';
            diceSpan.textContent = '未开始';
            statusSpan.textContent = '请选择你要控制的颜色';
        } else if (gameState.gamePhase === GAME_PHASES.PLAYING) {
            const currentPlayerName = gameState.currentPlayer === COLORS.RED ? '红方' : '蓝方';
            const isCurrentPlayerHuman = gameState.isCurrentPlayerHuman();
            
            playerSpan.textContent = `${currentPlayerName}${isCurrentPlayerHuman ? '(你)' : '(电脑)'}`;
            diceSpan.textContent = gameState.diceNumber !== null ? gameState.diceNumber : '未掷';
            
            if (gameState.availableNumbersForChoice.length > 0) {
                statusSpan.textContent = `请选择编号：${gameState.availableNumbersForChoice.join(' 或 ')}`;
            } else if (!isCurrentPlayerHuman) {
                statusSpan.textContent = '电脑思考中...';
            } else if (!gameState.isDiceRolled) {
                statusSpan.textContent = '请掷骰子';
            } else if (gameState.selectedCell) {
                statusSpan.textContent = '请选择目标位置';
            } else {
                statusSpan.textContent = '请选中棋子';
            }
        }
    }

    /**
     * 显示游戏结束信息
     * @param {string} message - 结束信息
     */
    showGameEnd(message) {
        // alert(message);
        document.getElementById('canMoveStatus').textContent = message;
        
        // 禁用棋盘交互
        const canvas = document.getElementById('chess');
        canvas.style.pointerEvents = 'none';
    }

    /**
     * 启用棋盘交互
     */
    enableBoardInteraction() {
        const canvas = document.getElementById('chess');
        canvas.style.pointerEvents = 'auto';
    }

    /**
     * 显示掷骰子结果
     * @param {number} number - 骰子点数
     * @param {boolean} isCustom - 是否为自定义点数
     */
    showDiceResult(number, isCustom = false) {
        const icon = isCustom ? '🎯' : '🎲';
        const text = isCustom ? '自定义点数' : '掷得点数';
        // alert(`${icon} ${text}：${number}`);
    }

    /**
     * 获取自定义骰子点数
     * @returns {number|null} 返回点数或null（取消）
     */
    getCustomDiceNumber() {
        let num = null;
        do {
            const input = prompt("请输入1-6的点数:");
            if (input === null) return null; // 用户取消
            
            num = parseInt(input);
            if (isNaN(num) || num < 1 || num > 6) {
                alert("请输入1-6之间的有效数字！");
                num = null;
            }
        } while (num === null);
        
        return num;
    }

    /**
     * 询问掷骰子方式
     * @returns {boolean} true为随机，false为自定义
     */
    askDiceMethod() {
        return confirm("点击确定随机掷骰子，点击取消自定义点数");
    }
}

export default UIManager;