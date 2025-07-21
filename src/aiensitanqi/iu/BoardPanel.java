package aiensitanqi.iu;

import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;

/**
 * 独立的棋盘面板类，负责棋盘的渲染和点击事件处理
 */
public class BoardPanel extends JPanel {
    private GameJFrame gameFrame;
    private static final int GRID_SIZE = 100; // 每个格子的大小（像素）
    private static final int BOARD_SIZE = 5; // 5x5棋盘
    private static final int BORDER_WIDTH = 2; // 棋子边界宽度

    public BoardPanel(GameJFrame gameFrame) {
        this.gameFrame = gameFrame;
        setBounds(0, 0, 500, 500);
        setOpaque(true); // 启用背景绘制
        setBackground(Color.WHITE); // 白色背景
        addMouseListener(new BoardMouseListener());
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 绘制 5x5 棋盘网格
        g2d.setColor(Color.BLACK);
        for (int i = 0; i <= BOARD_SIZE; i++) {
            g2d.drawLine(0, i * GRID_SIZE, 500, i * GRID_SIZE); // 横线
            g2d.drawLine(i * GRID_SIZE, 0, i * GRID_SIZE, 500); // 竖线
        }

        // 绘制棋子
        for (int i = 0; i < BOARD_SIZE; i++) {
            for (int j = 0; j < BOARD_SIZE; j++) {
                int pieceId = GameJFrame.data[i][j];
                if (pieceId > 0 && pieceId < 14) {
                    ImageIcon icon = new ImageIcon("tupian/qizi/" + pieceId + ".png");
                    Image img = icon.getImage();
                    // 缩放棋子到 100x100 像素，留出边界
                    Image scaledImg = img.getScaledInstance(GRID_SIZE - 2 * BORDER_WIDTH, GRID_SIZE - 2 * BORDER_WIDTH, Image.SCALE_SMOOTH);
                    icon = new ImageIcon(scaledImg);
                    int x = j * GRID_SIZE + BORDER_WIDTH;
                    int y = i * GRID_SIZE + BORDER_WIDTH;
                    // 绘制棋子边界
                    g2d.setColor(Color.BLACK);
                    g2d.drawRect(j * GRID_SIZE + BORDER_WIDTH / 2, i * GRID_SIZE + BORDER_WIDTH / 2, GRID_SIZE - BORDER_WIDTH, GRID_SIZE - BORDER_WIDTH);
                    // 绘制棋子图片
                    icon.paintIcon(this, g2d, x, y);
                }
            }
        }
    }

    private class BoardMouseListener extends MouseAdapter {
        @Override
        public void mouseClicked(MouseEvent e) {
            if (GameJFrame.v == 1 || GameJFrame.v == 2 || GameJFrame.p == 1) {
                return; // 游戏结束或摆棋错误时忽略点击
            }

            // 精确计算网格坐标
            int x = (int) Math.floor((double) e.getX() / GRID_SIZE);
            int y = (int) Math.floor((double) e.getY() / GRID_SIZE);

            // 边界检查
            if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
                return;
            }

            handleBoardClick(x, y);
            repaint(); // 强制重新绘制，确保棋子显示
            gameFrame.inittupian();
        }

        private void handleBoardClick(int x, int y) {
            if (GameJFrame.t == 1) {
                GameJFrame.x = x;
                GameJFrame.y = y;
                GameJFrame.xx = x;
                GameJFrame.yy = y;
                GameJFrame.uuu = 0;
                GameJFrame.t = 2;
            } else if (GameJFrame.t == 2) {
                GameJFrame.xx = x;
                GameJFrame.yy = y;
                if (GameJFrame.xx == GameJFrame.x && GameJFrame.yy == GameJFrame.y) {
                    GameJFrame.t = 2;
                } else {
                    GameJFrame.t = 1;
                }
            }

            if (GameJFrame.start < 13 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == 0) {
                GameJFrame.data[GameJFrame.y][GameJFrame.x] = GameJFrame.start;
                if (GameJFrame.start == 12) GameJFrame.state = 3;
                GameJFrame.start++;
                GameJFrame.t = 1;
            }

            // 处理红方移动
            if (GameJFrame.xx == GameJFrame.x && GameJFrame.yy == GameJFrame.y + 1 &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 0 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 7 &&
                    GameJFrame.state == 1 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y + 1, GameJFrame.x, GameJFrame.y, GameJFrame.x);
            } else if (GameJFrame.xx == GameJFrame.x + 1 && GameJFrame.yy == GameJFrame.y + 1 &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 0 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 7 &&
                    GameJFrame.state == 1 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y + 1, GameJFrame.x + 1, GameJFrame.y, GameJFrame.x);
            } else if (GameJFrame.xx == GameJFrame.x + 1 && GameJFrame.yy == GameJFrame.y &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 0 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 7 &&
                    GameJFrame.state == 1 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y, GameJFrame.x + 1, GameJFrame.y, GameJFrame.x);
            }
            // 处理蓝方移动
            else if (GameJFrame.xx == GameJFrame.x - 1 && GameJFrame.yy == GameJFrame.y &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 6 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 13 &&
                    GameJFrame.state == 2 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y, GameJFrame.x - 1, GameJFrame.y, GameJFrame.x);
            } else if (GameJFrame.xx == GameJFrame.x - 1 && GameJFrame.yy == GameJFrame.y - 1 &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 6 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 13 &&
                    GameJFrame.state == 2 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y - 1, GameJFrame.x - 1, GameJFrame.y, GameJFrame.x);
            } else if (GameJFrame.xx == GameJFrame.x && GameJFrame.yy == GameJFrame.y - 1 &&
                    GameJFrame.data[GameJFrame.y][GameJFrame.x] > 6 && GameJFrame.data[GameJFrame.y][GameJFrame.x] < 13 &&
                    GameJFrame.state == 2 && GameJFrame.data[GameJFrame.y][GameJFrame.x] == GameJFrame.data1[GameJFrame.y][GameJFrame.x]) {
                executeMove(GameJFrame.y - 1, GameJFrame.x, GameJFrame.y, GameJFrame.x);
            }
        }

        private void executeMove(int newY, int newX, int oldY, int oldX) {
            if (GameJFrame.data[newY][newX] > 0 && GameJFrame.data[newY][newX] < 13) {
                GameJFrame.life[GameJFrame.data[newY][newX]] = 0;
            }
            GameJFrame.data[newY][newX] = GameJFrame.data[oldY][oldX];
            GameJFrame.data[oldY][oldX] = 0;
            GameJFrame.state = 3;
            GameJFrame.shaizi = 0;
        }
    }
}