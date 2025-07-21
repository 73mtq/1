package aiensitanqi.iu;

import javax.swing.*;
import javax.swing.border.BevelBorder;

/**
 * 棋子选择逻辑处理类
 * 负责根据骰子点数选择可移动的棋子
 */
public class PieceSelector {
    private GameJFrame gameFrame;

    public PieceSelector(GameJFrame gameFrame) {
        this.gameFrame = gameFrame;
    }

    /**
     * 向右查找可移动的棋子
     * @param a 起始棋子编号
     */
    public void selectionR(int a) {
        if (a > 0 && a < 7 && GameJFrame.state == 1) { // 红方回合
            if (GameJFrame.life[a] != 0) { // 棋子存活
                if (GameJFrame.appear[a] == 0) { // 未显示过
                    displayPieceSelection(a, 750, 270);
                    GameJFrame.appear[a] = 1;
                    GameJFrame.b = a; // 设置当前选中棋子
                }
                return;
            }
            selectionR(++a); // 递归查找下一个
        } else if (a > 6 && a < 13 && GameJFrame.state == 2) { // 蓝方回合
            if (GameJFrame.life[a] != 0) {
                if (GameJFrame.appear[a] == 0) {
                    displayPieceSelection(a, 750, 270);
                    GameJFrame.appear[a] = 1;
                    GameJFrame.b = a;
                }
                return;
            }
            selectionR(++a);
        }
    }

    /**
     * 向左查找可移动的棋子
     * @param a 起始棋子编号
     */
    public void selectionL(int a) {
        if (a > 0 && a < 7 && GameJFrame.state == 1) { // 红方回合
            if (GameJFrame.life[a] != 0) {
                if (GameJFrame.appear[a] == 0) {
                    displayPieceSelection(a, 750, 150);
                    GameJFrame.appear[a] = 1;
                    GameJFrame.b = a;
                }
                return;
            }
            selectionL(--a); // 递归查找前一个
        } else if (a > 6 && a < 13 && GameJFrame.state == 2) { // 蓝方回合
            if (GameJFrame.life[a] != 0) {
                if (GameJFrame.appear[a] == 0) {
                    displayPieceSelection(a, 750, 150);
                    GameJFrame.appear[a] = 1;
                    GameJFrame.b = a;
                }
                return;
            }
            selectionL(--a);
        }
    }

    /**
     * 显示棋子选择
     * @param pieceId 棋子编号
     * @param x X坐标
     * @param y Y坐标
     */
    private void displayPieceSelection(int pieceId, int x, int y) {
        JLabel jLabel = new JLabel(new ImageIcon("tupian/qizi/" + pieceId + ".png"));
        jLabel.setBounds(x, y, 100, 100);
        jLabel.setBorder(new BevelBorder(0));
        gameFrame.getContentPane().add(jLabel);
    }

    /**
     * 获取指定编号的棋子在棋盘上的位置
     * @param pieceId 棋子编号
     * @return 位置坐标（十位数是x，个位数是y），如果未找到返回-1
     */
    public int getPiecePosition(int pieceId) {
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] == pieceId) {
                    return i * 10 + j;
                }
            }
        }
        return -1;
    }

    /**
     * 检查指定棋子是否可以移动
     * @param pieceId 棋子编号
     * @return true-可以移动，false-不可移动
     */
    public boolean canPieceMove(int pieceId) {
        if (GameJFrame.life[pieceId] == 0) {
            return false; // 棋子已被吃掉
        }

        int pos = getPiecePosition(pieceId);
        if (pos == -1) {
            return false; // 未找到棋子
        }

        int x = pos / 10;
        int y = pos % 10;

        // 检查是否有合法的移动位置
        if (pieceId < 7) { // 红方棋子
            // 检查向右、向下、向右下三个方向
            return canMoveToPosition(x, y + 1) || // 向右
                    canMoveToPosition(x + 1, y) || // 向下
                    canMoveToPosition(x + 1, y + 1); // 向右下
        } else { // 蓝方棋子
            // 检查向左、向上、向左上三个方向
            return canMoveToPosition(x, y - 1) || // 向左
                    canMoveToPosition(x - 1, y) || // 向上
                    canMoveToPosition(x - 1, y - 1); // 向左上
        }
    }

    /**
     * 检查是否可以移动到指定位置
     * @param x 目标X坐标
     * @param y 目标Y坐标
     * @return true-可以移动，false-不可移动
     */
    private boolean canMoveToPosition(int x, int y) {
        // 检查边界
        if (x < 0 || x >= 5 || y < 0 || y >= 5) {
            return false;
        }

        // 目标位置为空或有对方棋子都可以移动
        return true;
    }

    /**
     * 根据骰子点数获取可移动的棋子列表
     * @param diceValue 骰子点数
     * @param isRedTurn 是否为红方回合
     * @return 可移动的棋子编号数组
     */
    public int[] getMovablePieces(int diceValue, boolean isRedTurn) {
        int baseValue = isRedTurn ? 0 : 6;
        int targetPiece = baseValue + diceValue;

        // 首先检查骰子对应的棋子是否可以移动
        if (canPieceMove(targetPiece)) {
            return new int[]{targetPiece};
        }

        // 如果对应棋子不能移动，向两边查找
        int[] candidates = new int[6];
        int count = 0;

        // 向左查找
        for (int i = targetPiece - 1; i > baseValue; i--) {
            if (canPieceMove(i)) {
                candidates[count++] = i;
                break;
            }
        }

        // 向右查找
        for (int i = targetPiece + 1; i <= baseValue + 6; i++) {
            if (canPieceMove(i)) {
                candidates[count++] = i;
                break;
            }
        }

        // 返回找到的可移动棋子
        int[] result = new int[count];
        System.arraycopy(candidates, 0, result, 0, count);
        return result;
    }
}