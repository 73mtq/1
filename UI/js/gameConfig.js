/**
 * 游戏配置和常量定义
 */

// 棋盘基本配置
export const BOARD_CONFIG = {
    SIZE: 450,           // 棋盘大小
    GRID_COUNT: 6,       // 网格数量
    CELL_WIDTH: 450 / 5, // 单元格宽度
    CELL_HEIGHT: 450 / 5 // 单元格高度
};

// 游戏阶段枚举
export const GAME_PHASES = {
    LAYOUT: 'layout',
    WAITING_FOR_CHOICE: 'waiting_for_choice',
    PLAYING: 'playing',
    ENDED: 'ended'
};

// 玩家颜色
export const COLORS = {
    RED: 'red',
    BLUE: 'blue',
    EMPTY: '#fefdfc'
};

// 移动方向定义
export const MOVE_DIRECTIONS = {
    RED: [[0, 1], [1, 0], [1, 1]],        // 红方：右、下、右下
    BLUE: [[0, -1], [-1, 0], [-1, -1]]    // 蓝方：左、上、左上
};

// 胜利位置
export const WIN_POSITIONS = {
    RED_GOAL: { row: 4, col: 4 },  // 红方目标位置
    BLUE_GOAL: { row: 0, col: 0 }  // 蓝方目标位置
};