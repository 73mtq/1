package aiensitanqi.iu;

/**
 * 游戏逻辑处理类
 * 负责游戏规则的判断，如胜负判断、摆棋检查等
 */
public class GameLogic {

    /**
     * 判断游戏胜负的主方法
     * @return 0-游戏继续，1-红方胜，2-蓝方胜
     */
    public int victory() {
        int pp = 0, n = 0, m = 0;

        // 检查终点占领情况
        if (GameJFrame.data[0][0] > 6) { // 蓝方棋子到达红方起点(0,0)
            return 2;
        } else if (GameJFrame.data[4][4] > 0 && GameJFrame.data[4][4] < 7) { // 红方棋子到达蓝方起点(4,4)
            return 1;
        } else {
            // 检查棋子消灭情况
            for (int i = 1; i < 7; i++) { // 统计红方被消灭棋子
                if (GameJFrame.life[i] == 0) n++;
                if (n == 6) pp = 2; // 红方全军覆没，蓝方胜
            }
            for (int i = 7; i < 13; i++) { // 统计蓝方被消灭棋子
                if (GameJFrame.life[i] == 0) m++;
                if (m == 6) pp = 1; // 蓝方全军覆没，红方胜
            }
        }
        return pp;
    }

    /**
     * 判断摆棋是否正确
     * 检查红方棋子是否都在左上三角区域，蓝方棋子是否都在右下三角区域
     * @return 0-摆棋正确，1-摆棋错误
     */
    public int judge() {
        // 检查左上三角区域（红方区域）
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3 - i; j++) {
                if (GameJFrame.data[i][j] == 0 || GameJFrame.data[i][j] > 6) { // 空位或蓝方棋子
                    GameJFrame.p = 1; // 摆棋错误
                }
            }
        }

        // 检查右下三角区域（蓝方区域）
        int k = 0;
        for (int i = 2; i < 5; i++) {
            for (int j = 4 - k; j < 5; j++) {
                if (GameJFrame.data[i][j] == 0 || GameJFrame.data[i][j] < 7) { // 空位或红方棋子
                    GameJFrame.p = 1; // 摆棋错误
                }
            }
            k++;
        }
        GameJFrame.start++; // 进入下一阶段
        return GameJFrame.p;
    }

    /**
     * 检查是否可以移动指定棋子
     * @param pieceId 棋子编号
     * @param fromX 起始X坐标
     * @param fromY 起始Y坐标
     * @param toX 目标X坐标
     * @param toY 目标Y坐标
     * @return true-可以移动，false-不可移动
     */
    public boolean canMove(int pieceId, int fromX, int fromY, int toX, int toY) {
        // 检查边界
        if (toX < 0 || toX >= 5 || toY < 0 || toY >= 5) {
            return false;
        }

        // 检查移动方向是否正确
        if (pieceId < 7) { // 红方棋子只能向右下方移动
            if (toX < fromX || toY < fromY) {
                return false;
            }
        } else { // 蓝方棋子只能向左上方移动
            if (toX > fromX || toY > fromY) {
                return false;
            }
        }

        // 检查移动距离是否为1
        int dx = Math.abs(toX - fromX);
        int dy = Math.abs(toY - fromY);
        return (dx <= 1 && dy <= 1 && (dx + dy > 0));
    }

    /**
     * 检查指定位置是否为红方区域
     * @param x X坐标
     * @param y Y坐标
     * @return true-是红方区域，false-不是红方区域
     */
    public boolean isRedArea(int x, int y) {
        return x + y <= 2;
    }

    /**
     * 检查指定位置是否为蓝方区域
     * @param x X坐标
     * @param y Y坐标
     * @return true-是蓝方区域，false-不是蓝方区域
     */
    public boolean isBlueArea(int x, int y) {
        return x + y >= 6;
    }

    /**
     * 计算两点之间的曼哈顿距离
     * @param x1 起点X坐标
     * @param y1 起点Y坐标
     * @param x2 终点X坐标
     * @param y2 终点Y坐标
     * @return 曼哈顿距离
     */
    public int manhattanDistance(int x1, int y1, int x2, int y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
}