// 获取canvas元素的2D绘图上下文
var context = chess.getContext('2d');
// 设置绘图线条颜色为深灰色
context.strokeStyle = '#4f4b4b';

// 获取DOM元素引用
const canvas = document.getElementById('chess'); // 棋盘画布
const demo = document.getElementById('demo'); // 坐标显示区域

// 游戏状态变量初始化
let clickCount = 0; // 棋子布局计数器
let selectedCell = null; // 当前选中的棋子位置
let gamePhase = 'layout'; // 游戏阶段：layout(布局), waiting_for_choice(等待选择), playing(游戏中), ended(结束)
let playerColor = 'blue'; // 玩家控制的棋子颜色
let isPlayerTurn = false; // 是否轮到玩家操作

// 游戏棋盘数据结构：6x6的二维数组，存储棋子信息
const gridState = Array.from({ length: 6 }, () => Array(6).fill(null));
// 计算每个网格的宽度和高度
const cellWidth = 450 / 5; // 棋盘450px除以5个间隔
const cellHeight = 450 / 5;

/**
 * 绘制棋盘网格线函数
 */
var drawChessBoard = function () {
    const cols = 6; // 棋盘列数
    const rows = 6; // 棋盘行数
    const spacingX = 450 / (cols - 1); // 水平方向网格间距
    const spacingY = 450 / (rows - 1); // 垂直方向网格间距

    // 绘制垂直线条
    for (let i = 0; i < cols; i++) {
        context.moveTo(i * spacingX, 0); // 移动到起点
        context.lineTo(i * spacingX, 450); // 画线到终点
        context.stroke(); // 执行绘制
    }

    // 绘制水平线条
    for (let i = 0; i < rows; i++) {
        context.moveTo(0, i * spacingY); // 移动到起点
        context.lineTo(450, i * spacingY); // 画线到终点
        context.stroke(); // 执行绘制
    }
};

/**
 * 鼠标移动事件监听器 - 显示当前鼠标位置对应的棋盘坐标
 */
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect(); // 获取canvas相对于视口的位置
    const x = e.clientX - rect.left; // 计算鼠标在canvas内的x坐标
    const y = e.clientY - rect.top; // 计算鼠标在canvas内的y坐标

    // 将像素坐标转换为网格坐标
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    // 更新坐标显示
    if (col >= 0 && col < 6 && row >= 0 && row < 6) {
        demo.textContent = `坐标：(${row}, ${col})`;
    } else {
        demo.textContent = '坐标：超出棋盘范围';
    }
});

// 棋子编号计数器
let redNumber = 1; // 红方棋子编号
let blueNumber = 1; // 蓝方棋子编号

/**
 * 渲染单个棋盘格子
 * @param {number} row - 行坐标
 * @param {number} col - 列坐标
 * @param {string} color - 颜色
 * @param {number} number - 棋子编号（可选）
 */
function renderCell(row, col, color, number = null) {
    const startX = col * cellWidth; // 计算格子左上角x坐标
    const startY = row * cellHeight; // 计算格子左上角y坐标

    // 填充格子背景色
    context.fillStyle = color;
    context.fillRect(startX + 1, startY + 1, cellWidth - 2, cellHeight - 2);

    // 如果有编号，绘制编号文字
    if (number !== null) {
        context.fillStyle = '#fff'; // 文字颜色为白色
        context.font = 'bold 16px Arial'; // 字体样式
        context.textAlign = 'center'; // 文字水平居中
        context.textBaseline = 'middle'; // 文字垂直居中
        // 在格子中心绘制编号
        context.fillText(number, startX + cellWidth / 2, startY + cellHeight / 2);
    }
}

/**
 * 验证棋子移动是否合法
 * @param {number} fromRow - 起始行
 * @param {number} fromCol - 起始列
 * @param {number} toRow - 目标行
 * @param {number} toCol - 目标列
 * @param {string} color - 棋子颜色
 * @returns {boolean} 是否为合法移动
 */
function isValidMove(fromRow, fromCol, toRow, toCol, color) {
    const dRow = toRow - fromRow; // 行方向移动距离
    const dCol = toCol - fromCol; // 列方向移动距离

    // 检查目标位置是否在棋盘范围内
    if (toRow < 0 || toRow >= 6 || toCol < 0 || toCol >= 6) {
        return false;
    }

    // 不能移动到原位置
    if (fromRow === toRow && fromCol === toCol) {
        return false;
    }

    // 检查移动方向是否符合规则
    if (color === 'red') {
        // 红方只能向右、向下、向右下移动
        return (dRow === 0 && dCol === 1) || (dRow === 1 && dCol === 0) || (dRow === 1 && dCol === 1);
    } else if (color === 'blue') {
        // 蓝方只能向左、向上、向左上移动
        return (dRow === 0 && dCol === -1) || (dRow === -1 && dCol === 0) || (dRow === -1 && dCol === -1);
    }
    return false;
}

// 棋子选择相关变量
let availableNumbersForChoice = []; // 可选择的棋子编号数组
let pendingChoiceColor = null; // 等待选择的棋子颜色

/**
 * 根据掷骰子结果找到可移动的棋子
 * @param {number} targetNum - 掷骰子得到的目标编号
 * @param {string} color - 棋子颜色
 * @returns {number|null} 返回可移动的棋子编号，null表示需要用户选择
 */
function findAvailablePiece(targetNum, color) {
    const availableNumbers = []; // 当前棋盘上该颜色的所有棋子编号

    // 遍历棋盘，收集指定颜色的所有棋子编号
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = gridState[row][col];
            if (cell && cell.color === color && cell.number) {
                availableNumbers.push(cell.number);
            }
        }
    }

    // 如果目标编号存在，直接返回
    if (availableNumbers.includes(targetNum)) {
        return targetNum;
    } else {
        // 找距离目标编号最近的棋子
        const candidates = [...availableNumbers].sort((a, b) => Math.abs(a - targetNum) - Math.abs(b - targetNum));

        if (candidates.length === 0) {
            return null; // 没有棋子了
        }

        // 筛选出距离相同的最近编号
        const minDiff = Math.abs(candidates[0] - targetNum);
        const closestNumbers = candidates.filter(num => Math.abs(num - targetNum) === minDiff);

        // 如果有多个距离相同的编号，需要用户选择
        if (closestNumbers.length > 1) {
            availableNumbersForChoice = closestNumbers;
            pendingChoiceColor = color;
            return null; // 需要等待用户选择
        } else {
            return closestNumbers[0]; // 返回唯一的最近编号
        }
    }
}

// 游戏流程控制变量
let currentPlayer = 'red'; // 当前回合的玩家颜色，红方总是先手
let diceNumber = null; // 当前掷骰子的结果
let isDiceRolled = false; // 是否已经掷过骰子

/**
 * 更新状态栏显示信息
 */
function updateStatusBar() {
    // 获取状态栏元素
    const playerSpan = document.getElementById('currentPlayer');
    const diceSpan = document.getElementById('diceNumber');
    const statusSpan = document.getElementById('canMoveStatus');

    if (gamePhase === 'layout') {
        // 布局阶段的状态显示
        playerSpan.textContent = clickCount < 6 ? '红方布局' : '蓝方布局';
        diceSpan.textContent = '未开始';
        statusSpan.textContent = '请完成棋子布局';
    } else if (gamePhase === 'waiting_for_choice') {
        // 等待选择阶段的状态显示
        playerSpan.textContent = '等待选择';
        diceSpan.textContent = '未开始';
        statusSpan.textContent = '请选择你要控制的颜色';
    } else {
        // 游戏进行阶段的状态显示
        const currentPlayerName = currentPlayer === 'red' ? '红方' : '蓝方';
        const isCurrentPlayerHuman = (currentPlayer === playerColor);
        
        playerSpan.textContent = `${currentPlayerName}${isCurrentPlayerHuman ? '(你)' : '(电脑)'}`;
        diceSpan.textContent = diceNumber !== null ? diceNumber : '未掷';
        
        if (availableNumbersForChoice.length > 0) {
            statusSpan.textContent = `请选择编号：${availableNumbersForChoice.join(' 或 ')}`;
        } else if (!isCurrentPlayerHuman) {
            statusSpan.textContent = '电脑思考中...';
        } else if (!isDiceRolled) {
            statusSpan.textContent = '请掷骰子';
        } else if (selectedCell) {
            statusSpan.textContent = '请选择目标位置';
        } else {
            statusSpan.textContent = '请选中棋子';
        }
    }
}

// 游戏历史记录
let moveHistory = []; // 移动历史记录数组
let undoneMoves = []; // 被悔棋的移动记录数组

// 获取悔棋和撤销按钮元素
const gobackBtn = document.getElementById('goback');
const returnBtn = document.getElementById('return');

/**
 * 悔棋功能 - 撤销上一步移动
 */
gobackBtn.addEventListener('click', () => {
    if (moveHistory.length === 0 || gamePhase !== 'playing') {
        alert("没有可悔的棋");
        return;
    }

    // 从历史记录中取出最后一步
    const lastMove = moveHistory.pop();
    undoneMoves.push(lastMove);

    // 恢复棋盘到上一步状态
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

    // 重置相关状态
    selectedCell = null;
    isDiceRolled = false;
    diceNumber = null;
    currentPlayer = lastMove.currentPlayer;
    isPlayerTurn = (currentPlayer === playerColor);
    availableNumbersForChoice = [];
    pendingChoiceColor = null;

    updateStatusBar();
});

/**
 * 撤销悔棋功能 - 重做被悔棋的移动
 */
returnBtn.addEventListener('click', () => {
    if (undoneMoves.length === 0) {
        alert("没有可撤销的悔棋");
        return;
    }

    // 从撤销记录中取出移动
    const redoMove = undoneMoves.pop();
    moveHistory.push(redoMove);

    // 恢复到悔棋前的状态
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = redoMove.newState[row][col];
            if (cell) {
                renderCell(row, col, cell.color, cell.number);
            } else {
                renderCell(row, col, '#fefdfc');
            }
            gridState[row][col] = cell;
        }
    }

    // 重置相关状态
    selectedCell = null;
    isDiceRolled = false;
    diceNumber = null;
    currentPlayer = redoMove.currentPlayer === 'red' ? 'blue' : 'red';
    isPlayerTurn = (currentPlayer === playerColor);
    availableNumbersForChoice = [];
    pendingChoiceColor = null;

    updateStatusBar();
});

// 获取掷骰子按钮元素
const diceBtn = document.getElementById('dice');

/**
 * 掷骰子功能 - 支持随机和自定义点数
 */
diceBtn.addEventListener('click', () => {
    if (gamePhase !== 'playing') {
        alert("请先完成棋子布局并选择颜色");
        return;
    }

    if (!isDiceRolled) {
        // 询问用户选择掷骰子方式
        const choice = confirm("点击确定随机掷骰子，点击取消自定义点数");
        
        let num;
        if (choice) {
            // 随机掷骰子
            num = Math.floor(Math.random() * 6) + 1;
            alert(`🎲 掷得点数：${num}`);
        } else {
            // 自定义点数模式
            let customInput;
            do {
                customInput = prompt("请输入1-6的点数:");
                if (customInput === null) {
                    return; // 用户取消操作
                }
                num = parseInt(customInput);
                if (isNaN(num) || num < 1 || num > 6) {
                    alert("请输入1-6之间的有效数字！");
                    num = null;
                }
            } while (num === null);
            
            alert(`🎯 自定义点数：${num}`);
        }
        
        diceNumber = num;
        isDiceRolled = true;
        
        // 如果是电脑回合，自动执行AI移动
        if (currentPlayer !== playerColor) {
            setTimeout(() => {
                aiMove(num);
            }, 1000);
        }
    } else {
        alert("请先完成本轮移动再重新掷骰子");
    }
    updateStatusBar();
});

/**
 * AI移动逻辑
 * @param {number} diceNum - 掷骰子得到的点数
 */
function aiMove(diceNum) {
    const aiColor = currentPlayer; // AI控制的颜色
    const aiPieces = []; // AI的所有棋子

    // 收集AI所有棋子的位置和编号
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = gridState[row][col];
            if (cell && cell.color === aiColor) {
                aiPieces.push({ row, col, number: cell.number });
            }
        }
    }

    if (aiPieces.length === 0) {
        alert("AI无棋可走！");
        switchTurn();
        return;
    }

    // 使用相同的棋子选择逻辑
    const chosenNumber = findAvailablePiece(diceNum, aiColor);
    
    if (chosenNumber === null) {
        // 如果有多个选择，AI随机选择一个
        if (availableNumbersForChoice.length > 0) {
            const randomChoice = availableNumbersForChoice[Math.floor(Math.random() * availableNumbersForChoice.length)];
            availableNumbersForChoice = [];
            pendingChoiceColor = null;
            
            const targetPiece = aiPieces.find(piece => piece.number === randomChoice);
            alert(`编号 ${diceNum} 不存在，AI选择编号 ${randomChoice}`);
            aiExecuteMove(targetPiece);
        } else {
            alert("AI无棋可走！");
            switchTurn();
        }
        return;
    }

    // 找到对应编号的棋子
    const targetPiece = aiPieces.find(piece => piece.number === chosenNumber);
    
    if (!targetPiece) {
        alert("AI无法找到对应棋子！");
        switchTurn();
        return;
    }

    if (chosenNumber !== diceNum) {
        alert(`编号 ${diceNum} 不存在，AI选择编号 ${chosenNumber}`);
    }

    aiExecuteMove(targetPiece);
}

/**
 * AI执行移动
 * @param {Object} targetPiece - 要移动的棋子对象
 */
function aiExecuteMove(targetPiece) {
    const possibleMoves = []; // 可能的移动位置
    // 根据颜色确定移动方向
    const directions = currentPlayer === 'red' ? 
        [[0, 1], [1, 0], [1, 1]] : // 红方移动方向：右、下、右下
        [[0, -1], [-1, 0], [-1, -1]]; // 蓝方移动方向：左、上、左上
    
    // 检查所有可能的移动位置
    for (let [dr, dc] of directions) {
        const newRow = targetPiece.row + dr;
        const newCol = targetPiece.col + dc;
        
        if (isValidMove(targetPiece.row, targetPiece.col, newRow, newCol, currentPlayer)) {
            possibleMoves.push({ row: newRow, col: newCol });
        }
    }

    if (possibleMoves.length > 0) {
        // AI移动策略：优先级排序
        // 1. 优先吃掉敌方棋子
        const enemyCaptureMoves = possibleMoves.filter(move => {
            const cell = gridState[move.row][move.col];
            return cell && cell.color !== currentPlayer;
        });
        
        // 2. 其次移动到空位置
        const emptyMoves = possibleMoves.filter(move => {
            const cell = gridState[move.row][move.col];
            return !cell;
        });
        
        // 3. 最后选择吃掉自己的棋子
        const selfCaptureMoves = possibleMoves.filter(move => {
            const cell = gridState[move.row][move.col];
            return cell && cell.color === currentPlayer;
        });
        
        // 按优先级选择移动
        let selectedMove;
        if (enemyCaptureMoves.length > 0) {
            selectedMove = enemyCaptureMoves[Math.floor(Math.random() * enemyCaptureMoves.length)];
        } else if (emptyMoves.length > 0) {
            selectedMove = emptyMoves[Math.floor(Math.random() * emptyMoves.length)];
        } else {
            selectedMove = selfCaptureMoves[Math.floor(Math.random() * selfCaptureMoves.length)];
        }

        // 执行移动
        executeMove(targetPiece.row, targetPiece.col, selectedMove.row, selectedMove.col);
        
        alert(`AI移动：棋子${targetPiece.number} 从(${targetPiece.row}, ${targetPiece.col})移动到(${selectedMove.row}, ${selectedMove.col})`);
    } else {
        alert(`AI的棋子${targetPiece.number}无法移动！`);
    }
    
    switchTurn();
}

/**
 * 执行棋子移动
 * @param {number} fromRow - 起始行
 * @param {number} fromCol - 起始列
 * @param {number} toRow - 目标行
 * @param {number} toCol - 目标列
 */
function executeMove(fromRow, fromCol, toRow, toCol) {
    const fromData = gridState[fromRow][fromCol]; // 移动的棋子
    const toData = gridState[toRow][toCol]; // 目标位置的棋子（如果有）
    
    // 保存移动历史，用于悔棋功能
    moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        prevState: JSON.parse(JSON.stringify(gridState)), // 深拷贝当前状态
        newState: null,
        currentPlayer,
        diceNumber,
        isDiceRolled
    });
    
    // 处理吃子逻辑
    if (toData) {
        if (toData.color === fromData.color) {
            alert(`${fromData.color === 'red' ? '红方' : '蓝方'}吃掉了自己的棋子${toData.number}！`);
        } else {
            alert(`${fromData.color === 'red' ? '红方' : '蓝方'}吃掉了${toData.color === 'red' ? '红方' : '蓝方'}的棋子${toData.number}！`);
        }
    }
    
    // 更新棋盘显示和数据
    renderCell(toRow, toCol, fromData.color, fromData.number); // 在目标位置绘制棋子
    renderCell(fromRow, fromCol, '#fefdfc'); // 清空原位置
    
    gridState[toRow][toCol] = fromData; // 更新数据结构
    gridState[fromRow][fromCol] = null;
    
    // 保存移动后的状态
    moveHistory[moveHistory.length - 1].newState = JSON.parse(JSON.stringify(gridState));
    
    // 检查游戏是否结束
    checkWinCondition();
}

/**
 * 切换回合
 */
function switchTurn() {
    selectedCell = null; // 清空选中的棋子
    isDiceRolled = false; // 重置掷骰子状态
    diceNumber = null; // 清空骰子点数
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red'; // 切换玩家
    isPlayerTurn = (currentPlayer === playerColor); // 更新是否为玩家回合
    availableNumbersForChoice = []; // 清空选择列表
    pendingChoiceColor = null; // 清空待选择颜色
    updateStatusBar(); // 更新状态显示
}

/**
 * 鼠标点击事件处理器 - 处理棋子布局、选择和移动
 */
canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 将像素坐标转换为网格坐标
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col < 0 || col >= 6 || row < 0 || row >= 6) return; // 超出边界

    if (gamePhase === 'layout') {
        // 棋子布局阶段
        if (gridState[row][col] !== null) {
            alert("此位置已有棋子！");
            return;
        }

        let color, number;
        if (clickCount < 6) {
            // 前6个棋子为红方
            color = 'red';
            number = redNumber++;
        } else {
            // 后6个棋子为蓝方
            color = 'blue';
            number = blueNumber++;
        }

        renderCell(row, col, color, number);
        gridState[row][col] = { color, number };
        clickCount++;

        if (clickCount === 12) {
            // 布局完成，进入选择阶段
            alert("棋子布局完成！请选择你要控制的颜色（红方先手）");
            gamePhase = 'waiting_for_choice';
            updateStatusBar();
        } else {
            updateStatusBar();
        }
        return;
    }

    if (gamePhase !== 'playing') return; // 不在游戏阶段

    const cellData = gridState[row][col];

    // 处理多选择情况
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

    // 处理棋子移动
    if (selectedCell) {
        const fromRow = selectedCell.row;
        const fromCol = selectedCell.col;
        const fromData = gridState[fromRow][fromCol];

        if (row === fromRow && col === fromCol) {
            // 点击同一个格子，取消选择
            selectedCell = null;
            updateStatusBar();
            return;
        }

        if (isValidMove(fromRow, fromCol, row, col, fromData.color)) {
            executeMove(fromRow, fromCol, row, col);
            switchTurn();
        } else {
            alert("不允许的移动方向！");
            selectedCell = null;
            updateStatusBar();
        }
        return;
    }

    // 处理棋子选择
    if (cellData && cellData.color === currentPlayer && currentPlayer === playerColor) {
        if (!isDiceRolled) {
            alert("请先掷骰子！");
            return;
        }

        // 使用棋子查找逻辑
        const chosenNumber = findAvailablePiece(diceNumber, currentPlayer);
        
        if (chosenNumber === null) {
            // 需要等待用户选择
            if (availableNumbersForChoice.length > 0) {
                alert(`编号 ${diceNumber} 不存在，请从以下编号中选择一个：${availableNumbersForChoice.join(', ')}`);
                updateStatusBar();
            }
            return;
        }

        if (cellData.number === chosenNumber) {
            selectedCell = { row, col };
            if (chosenNumber !== diceNumber) {
                alert(`编号 ${diceNumber} 不存在，使用编号 ${chosenNumber}`);
            }
            updateStatusBar();
        } else {
            alert(`请选择编号为 ${chosenNumber} 的棋子`);
        }
    } else if (cellData && cellData.color !== currentPlayer) {
        alert("不能选择对方的棋子！");
    } else if (currentPlayer !== playerColor) {
        alert("当前是电脑回合！");
    }
});

/**
 * 检查游戏胜负条件
 * @returns {boolean} 游戏是否结束
 */
function checkWinCondition() {
    let hasRed = false; // 是否还有红方棋子
    let hasBlue = false; // 是否还有蓝方棋子

    // 遍历棋盘统计棋子
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = gridState[row][col];
            if (cell) {
                if (cell.color === 'red') hasRed = true;
                if (cell.color === 'blue') hasBlue = true;
            }
        }
    }

    // 检查是否有一方棋子全部被吃
    if (!hasRed) {
        endGame('蓝方获胜！红方所有棋子已被吃光！');
        return true;
    }
    if (!hasBlue) {
        endGame('红方获胜！蓝方所有棋子已被吃光！');
        return true;
    }

    // 检查是否有棋子到达目标位置
    const redAtGoal = gridState[4][4] && gridState[4][4].color === 'red'; // 红方目标：右下角(4,4)
    const blueAtGoal = gridState[0][0] && gridState[0][0].color === 'blue'; // 蓝方目标：左上角(0,0)

    if (redAtGoal) {
        endGame('红方获胜！已到达右下角！');
        return true;
    }
    if (blueAtGoal) {
        endGame('蓝方获胜！已到达左上角！');
        return true;
    }

    return false;
}

/**
 * 重置游戏到初始状态
 */
function resetGame() {
    // 清空棋盘
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            gridState[row][col] = null;
            renderCell(row, col, '#fefdfc');
        }
    }

    // 重置所有游戏变量
    clickCount = 0;
    selectedCell = null;
    currentPlayer = 'red';
    diceNumber = null;
    isDiceRolled = false;
    moveHistory = [];
    undoneMoves = [];
    redNumber = 1;
    blueNumber = 1;
    gamePhase = 'layout';
    isPlayerTurn = false;
    playerColor = 'blue';
    availableNumbersForChoice = [];
    pendingChoiceColor = null;

    // 重新启用界面交互
    canvas.style.pointerEvents = 'auto';

    updateStatusBar();
    alert("游戏已重置，请重新布局棋子");
}

/**
 * 结束游戏
 * @param {string} message - 游戏结束信息
 */
function endGame(message) {
    alert(message);
    document.getElementById('canMoveStatus').textContent = message;
    canvas.style.pointerEvents = 'none'; // 禁用棋盘交互
    gamePhase = 'ended';
}

// 按钮事件监听器设置

/**
 * 重新开始按钮
 */
document.getElementById('restart').addEventListener('click', () => {
    resetGame();
});

/**
 * 玩家先手按钮 - 玩家控制红方
 */
document.getElementById('playerFirst').addEventListener('click', () => {
    if (gamePhase !== 'waiting_for_choice') {
        alert("请先完成棋子布局！");
        return;
    }

    gamePhase = 'playing';
    playerColor = 'red'; // 玩家控制红方
    currentPlayer = 'red'; // 红方先手
    isPlayerTurn = true;
    alert("你控制红方，红方先手，请掷骰子开始游戏！");
    updateStatusBar();
});

/**
 * 电脑先手按钮 - 电脑控制红方，玩家控制蓝方
 */
document.getElementById('computerFirst').addEventListener('click', () => {
    if (gamePhase !== 'waiting_for_choice') {
        alert("请先完成棋子布局！");
        return;
    }

    gamePhase = 'playing';
    playerColor = 'blue'; // 玩家控制蓝方
    currentPlayer = 'red'; // 红方先手，由电脑控制
    isPlayerTurn = false;
    alert("电脑控制红方先手，请掷骰子，电脑会根据点数自动走棋！");
    updateStatusBar();
});

/**
 * 页面加载完成后的初始化
 */
window.onload = function () {
    drawChessBoard(); // 绘制棋盘
    updateStatusBar(); // 更新状态栏
};