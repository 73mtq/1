package aiensitanqi.iu;

import javax.swing.*;
import javax.swing.border.BevelBorder;
import java.util.HashMap;
import java.util.Map;

/**
 * UI渲染类
 * 负责游戏界面的绘制和更新（除棋盘外）
 */
public class UIRenderer {
    private GameJFrame gameFrame;
    private GameLogic gameLogic;
    private PieceSelector pieceSelector;
    private Map<String, JLabel> componentCache;

    public UIRenderer(GameJFrame gameFrame) {
        this.gameFrame = gameFrame;
        this.gameLogic = new GameLogic();
        this.pieceSelector = new PieceSelector(gameFrame);
        this.componentCache = new HashMap<>();
    }

    public void renderGame() {
        JPanel contentPane = (JPanel) gameFrame.getContentPane();
        contentPane.removeAll();
        componentCache.clear();

        if (GameJFrame.start == 13) {
            GameJFrame.p = gameLogic.judge();
            if (GameJFrame.p == 1) {
                addErrorMessage();
            }
        }

        initMoveableMarks();

        if (GameJFrame.state == 1) {
            handleRedTurn();
        } else if (GameJFrame.state == 2) {
            handleBlueTurn();
        }

        if (GameJFrame.start == 14) {
            GameJFrame.v = gameLogic.victory();
            if (GameJFrame.v == 1) {
                addVictoryMessage(1);
            } else if (GameJFrame.v == 2) {
                addVictoryMessage(2);
            }
        }

        renderUIElements();
        renderBackground();
        contentPane.add(gameFrame.getBoardPanel());
        contentPane.revalidate();
        contentPane.repaint();
    }

    private void initMoveableMarks() {
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                GameJFrame.data1[i][j] = 0;
            }
        }
    }

    private void handleRedTurn() {
        pieceSelector.selectionL(GameJFrame.shaizi);
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] == GameJFrame.b) {
                    GameJFrame.data1[i][j] = GameJFrame.b;
                }
            }
        }
        pieceSelector.selectionR(GameJFrame.shaizi);

        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] == GameJFrame.b) {
                    GameJFrame.data1[i][j] = GameJFrame.b;
                }
            }
        }

        if (GameJFrame.uuu == 1 && GameJFrame.redai == 1) {
            handleRedAI();
        }

        resetAppearanceFlags();
    }

    private void handleBlueTurn() {
        pieceSelector.selectionL(GameJFrame.shaizi + 6);
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] == GameJFrame.b) {
                    GameJFrame.data1[i][j] = GameJFrame.b;
                }
            }
        }
        pieceSelector.selectionR(GameJFrame.shaizi + 6);

        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] == GameJFrame.b) {
                    GameJFrame.data1[i][j] = GameJFrame.b;
                }
            }
        }

        if (GameJFrame.uuu == 1 && GameJFrame.blueai == 1) {
            handleBlueAI();
        }

        resetAppearanceFlags();
    }

    private void handleRedAI() {
        UCT ucts = new UCT();
        ucts.search1(500000, 1);

        int diff = 1;
        int r = -1, l = -1;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] != GameJFrame.data3[i][j] && diff == 1) {
                    addAIPieceSelection(GameJFrame.data[i][j], 950, 230);
                    diff++;
                    r = i;
                    l = j;
                    GameJFrame.data[i][j] = 0;
                    GameJFrame.data1[i][j] = 0;
                } else if (GameJFrame.data[i][j] != GameJFrame.data3[i][j] && diff == 2) {
                    if (i == r + 1 && j == l + 1) {
                        addMoveDirection(1, 950, 350);
                    } else if (i == r + 1) {
                        addMoveDirection(2, 950, 350);
                    } else if (j == l + 1) {
                        addMoveDirection(3, 950, 350);
                    }

                    GameJFrame.life[GameJFrame.data[i][j]] = 0;
                    GameJFrame.data[i][j] = GameJFrame.data3[i][j];
                    GameJFrame.data1[i][j] = GameJFrame.data3[i][j];
                    GameJFrame.state = 3;
                }
            }
        }
    }

    private void handleBlueAI() {
        UCT ucts = new UCT();
        ucts.search1(500000, 2);

        int diff = 1;
        int r = -1, l = -1;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (GameJFrame.data[i][j] != GameJFrame.data3[i][j] && diff == 1) {
                    diff++;
                    r = i;
                    l = j;
                    GameJFrame.life[GameJFrame.data[i][j]] = 0;
                    GameJFrame.data[i][j] = GameJFrame.data3[i][j];
                    GameJFrame.data1[i][j] = GameJFrame.data3[i][j];
                } else if (GameJFrame.data[i][j] != GameJFrame.data3[i][j] && diff == 2) {
                    addAIPieceSelection(GameJFrame.data[i][j], 1100, 230);

                    if (i == r + 1 && j == l + 1) {
                        addBlueAIMoveDirection(6, 1100, 350);
                    } else if (i == r + 1) {
                        addBlueAIMoveDirection(7, 1100, 350);
                    } else if (j == l + 1) {
                        addBlueAIMoveDirection(5, 1100, 350);
                    }

                    GameJFrame.data[i][j] = 0;
                    GameJFrame.data1[i][j] = 0;
                    GameJFrame.state = 3;
                }
            }
        }
    }

    private void renderUIElements() {
        addUIElement("tupian/aistrategy/red-aistrategy/4.png", 950, 70, "ai_red_strategy");
        addUIElement("tupian/aistrategy/blue-aistrategy/8.png", 1100, 70, "ai_blue_strategy");
        addUIElement("tupian/tishi/4.png", 750, 20, "tishi_4");

        String jushuKey = "jushu_" + GameJFrame.jushu;
        JLabel jushuLabel = componentCache.get(jushuKey);
        if (jushuLabel == null) {
            jushuLabel = new JLabel(new ImageIcon("tupian/jushu/" + GameJFrame.jushu + ".png"));
            jushuLabel.setBounds(550, 10, 100, 50);
            jushuLabel.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(jushuKey, jushuLabel);
        } else {
            jushuLabel.setIcon(new ImageIcon("tupian/jushu/" + GameJFrame.jushu + ".png"));
        }
        gameFrame.getContentPane().add(jushuLabel);

        String patternKey = "pattern_" + GameJFrame.aipattern;
        JLabel patternLabel = componentCache.get(patternKey);
        if (patternLabel == null) {
            patternLabel = new JLabel(new ImageIcon("tupian/pattern/" + GameJFrame.aipattern + ".png"));
            patternLabel.setBounds(1020, 10, 100, 50);
            patternLabel.setBorder(new BevelBorder(BevelBorder.LOWERED));
            componentCache.put(patternKey, patternLabel);
        } else {
            patternLabel.setIcon(new ImageIcon("tupian/pattern/" + GameJFrame.aipattern + ".png"));
        }
        gameFrame.getContentPane().add(patternLabel);

        addUIElement("tupian/tishi/" + GameJFrame.state + ".png", 550, 350, "tishi_state_" + GameJFrame.state);
        addUIElement("tupian/qizi/" + GameJFrame.data[GameJFrame.y][GameJFrame.x] + ".png", 550, 230, "selected_piece");
        addUIElement("tupian/shaizi/" + GameJFrame.shaizi + ".png", 550, 70, 109, 109, "shaizi_" + GameJFrame.shaizi);

        String extraPieceKey = "extra_piece_14";
        JLabel extraPieceLabel = componentCache.get(extraPieceKey);
        if (extraPieceLabel == null) {
            extraPieceLabel = new JLabel(new ImageIcon("tupian/qizi/14.png"));
            extraPieceLabel.setBounds(550, 160, 100, 90); // 调整为 180 避开骰子区域
            extraPieceLabel.setBorder(new BevelBorder(BevelBorder.LOWERED));
            componentCache.put(extraPieceKey, extraPieceLabel);
        }
        gameFrame.getContentPane().add(extraPieceLabel);
    }

    private void renderBackground() {
        // 移除棋盘背景图片依赖，棋盘由 BoardPanel 绘制
    }

    private void addUIElement(String imagePath, int x, int y, String cacheKey) {
        JLabel label = componentCache.get(cacheKey);
        if (label == null) {
            label = new JLabel(new ImageIcon(imagePath));
            label.setBounds(x, y, 100, 100);
            label.setBorder(new BevelBorder(BevelBorder.RAISED));
            label.setOpaque(true); // 确保可点击区域完整
            componentCache.put(cacheKey, label);
        } else {
            label.setIcon(new ImageIcon(imagePath));
        }
        gameFrame.getContentPane().add(label);
    }

    private void addUIElement(String imagePath, int x, int y, int width, int height, String cacheKey) {
        JLabel label = componentCache.get(cacheKey);
        if (label == null) {
            label = new JLabel(new ImageIcon(imagePath));
            label.setBounds(x, y, width, height);
            label.setBorder(new BevelBorder(BevelBorder.RAISED));
            label.setOpaque(true); // 确保可点击区域完整
            componentCache.put(cacheKey, label);
        } else {
            label.setIcon(new ImageIcon(imagePath));
        }
        gameFrame.getContentPane().add(label);
    }

    private void addErrorMessage() {
        String key = "error_message";
        JLabel pp = componentCache.get(key);
        if (pp == null) {
            pp = new JLabel(new ImageIcon("tupian/output/3.png"));
            pp.setBounds(150, 150, 400, 200);
            pp.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(key, pp);
        }
        gameFrame.getContentPane().add(pp);
    }

    private void addVictoryMessage(int winner) {
        String key = "victory_message_" + winner;
        JLabel win = componentCache.get(key);
        if (win == null) {
            String imagePath = winner == 1 ? "tupian/output/1.png" : "tupian/output/2.png";
            win = new JLabel(new ImageIcon(imagePath));
            win.setBounds(150, 150, 400, 200);
            win.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(key, win);
        }
        gameFrame.getContentPane().add(win);
    }

    private void addAIPieceSelection(int pieceId, int x, int y) {
        String key = "ai_piece_" + pieceId + "_" + x + "_" + y;
        JLabel jLabel = componentCache.get(key);
        if (jLabel == null) {
            jLabel = new JLabel(new ImageIcon("tupian/qizi/" + pieceId + ".png"));
            jLabel.setBounds(x, y, 100, 100);
            jLabel.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(key, jLabel);
        }
        gameFrame.getContentPane().add(jLabel);
    }

    private void addMoveDirection(int direction, int x, int y) {
        String key = "red_move_" + direction + "_" + x + "_" + y;
        JLabel jLabel = componentCache.get(key);
        if (jLabel == null) {
            jLabel = new JLabel(new ImageIcon("tupian/aistrategy/red-aistrategy/" + direction + ".png"));
            jLabel.setBounds(x, y, 100, 100);
            jLabel.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(key, jLabel);
        }
        gameFrame.getContentPane().add(jLabel);
    }

    private void addBlueAIMoveDirection(int direction, int x, int y) {
        String key = "blue_move_" + direction + "_" + x + "_" + y;
        JLabel jLabel = componentCache.get(key);
        if (jLabel == null) {
            jLabel = new JLabel(new ImageIcon("tupian/aistrategy/blue-aistrategy/" + direction + ".png"));
            jLabel.setBounds(x, y, 100, 100);
            jLabel.setBorder(new BevelBorder(BevelBorder.RAISED));
            componentCache.put(key, jLabel);
        }
        gameFrame.getContentPane().add(jLabel);
    }

    private void resetAppearanceFlags() {
        for (int i = 1; i < 13; i++) {
            GameJFrame.appear[i] = 0;
        }
    }
}