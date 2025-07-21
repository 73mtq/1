package aiensitanqi.iu;

import javax.swing.*;
import java.awt.event.*;
import java.util.Random;

/**
 * 游戏主窗口类 - 爱因斯坦棋游戏
 */
public class GameJFrame extends JFrame implements KeyListener, ActionListener {
    // 游戏核心数据结构
    public static int[][] data = new int[5][5];
    public static int uuu = 0;
    public static int[][] data4 = new int[5][5];
    public static int[][] data3 = new int[5][5];
    public static int aipattern = 1;
    public static int[] life = new int[13];
    public static int[] life1 = new int[13];
    public static int[] appear = new int[13];
    public static int[][] data1 = new int[5][5];
    public static int shaizi = 0;
    public static int x, y, xx, yy, t = 1;
    public static int state = 0;
    public static int start = 1;
    public static int v = 0;
    public static int p = 0;
    public static int jiou = 1;
    public static int jiou1;
    public static int b = 0;
    public static int m = 0, n = 0;
    public static int jushu = 1;
    public static int redai = 0, blueai = 0;
    private long lastClickTime = 0;
    private static final long DEBOUNCE_DELAY = 200;
    private final BoardPanel boardPanel;

    // 辅助类实例
    private GameLogic gameLogic;
    private PieceSelector pieceSelector;
    private UIRenderer uiRenderer;

    // 菜单组件定义
    JMenuItem replay1 = new JMenuItem("重新开始本局");
    JMenuItem replay2 = new JMenuItem("开始下一局");
    JMenuItem close = new JMenuItem("关闭游戏");
    JMenuItem restore = new JMenuItem("悔棋");
    JMenuItem rule1 = new JMenuItem("布棋规则");
    JMenuItem rule2 = new JMenuItem("走棋规则");
    JMenuItem rule3 = new JMenuItem("判胜规则");
    JMenuItem pattern1 = new JMenuItem("人人对战");
    JMenuItem pattern2 = new JMenuItem("电脑对战");
    JMenuItem pattern3 = new JMenuItem("红方人机");
    JMenuItem pattern4 = new JMenuItem("蓝方人机");
    JMenuItem customDice = new JMenuItem("自定义点数");

    public GameJFrame() {
        gameLogic = new GameLogic();
        pieceSelector = new PieceSelector(this);
        uiRenderer = new UIRenderer(this);
        boardPanel = new BoardPanel(this);

        initJFrame();
        initJMenubar();
        initdata1();
        inittupian();
        this.setVisible(true);
    }

    // 提供 boardPanel 的 getter 方法
    public BoardPanel getBoardPanel() {
        return boardPanel;
    }

    private void initdata3() {
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                data1[i][j] = 0;
            }
        }
    }

    private void initdata2() {
        for (int i = 1; i < 13; i++) {
            appear[i] = 0;
        }
    }

    private void initdata1() {
        int[] tempArr = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
        for (int i = 0; i < tempArr.length; i++) {
            data[i / 5][i % 5] = tempArr[i];
        }
        for (int i = 1; i < 13; i++) {
            life[i] = 1;
        }
    }

    public void inittupian() {
        SwingUtilities.invokeLater(() -> {
            uiRenderer.renderGame();
            boardPanel.repaint();
        });
    }

    private void initJMenubar() {
        JMenuBar jMenuBar = new JMenuBar();
        JMenu function1 = new JMenu("功能");
        JMenu function2 = new JMenu("规则");
        JMenu function3 = new JMenu("模式");

        function1.add(replay1);
        function1.add(customDice);
        function1.add(replay2);
        function1.add(restore);
        function1.add(close);
        function2.add(rule1);
        function2.add(rule2);
        function2.add(rule3);
        function3.add(pattern1);
        function3.add(pattern2);
        function3.add(pattern3);
        function3.add(pattern4);

        replay1.addActionListener(this);
        customDice.addActionListener(this);
        replay2.addActionListener(this);
        restore.addActionListener(this);
        close.addActionListener(this);
        rule1.addActionListener(this);
        rule2.addActionListener(this);
        rule3.addActionListener(this);
        pattern1.addActionListener(this);
        pattern2.addActionListener(this);
        pattern3.addActionListener(this);
        pattern4.addActionListener(this);

        jMenuBar.add(function1);
        jMenuBar.add(function2);
        jMenuBar.add(function3);
        this.setJMenuBar(jMenuBar);
    }

    private void initJFrame() {
        this.setSize(1250, 565);
        this.setTitle("对局阶段");
        this.setAlwaysOnTop(true);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        this.setLayout(null);
        this.addKeyListener(this);
        this.add(boardPanel);

        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                long currentTime = System.currentTimeMillis();
                if (currentTime - lastClickTime < DEBOUNCE_DELAY) {
                    return;
                }
                lastClickTime = currentTime;

                // 输出点击坐标以调试
                System.out.println("Clicked at: (" + e.getX() + ", " + e.getY() + ")");

                if (v == 1 || v == 2 || p == 1) return;

                // 扩展 y 范围以覆盖偏移
                if (e.getX() >= 550 && e.getX() < 659 && e.getY() >= 70 && e.getY() < 220 && state == 3) {
                    rollDice();
                }
            }
        });
    }

    private void rollDice() {
        Random r = new Random();
        int i = r.nextInt(6) + 1;
        shaizi = i;
        if (jiou % 2 == 1) {
            state = 1;
            jiou++;
        } else if (jiou % 2 == 0) {
            state = 2;
            jiou++;
        }
        uuu = 1;
        t = 1;

        for (int j = 0; j < 5; j++) {
            data4[j] = data[j].clone();
        }
        life1 = life.clone();
        jiou1 = jiou - 1;

        inittupian();
    }

    @Override
    public void keyTyped(KeyEvent e) {}

    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        if (code >= 97 && code <= 102 && state == 3) {
            int diceValue = code - 96;
            setDiceValue(diceValue);
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {
        if (v == 1 || v == 2 || p == 1) return;
        int code = e.getKeyCode();
        if (code >= 97 && code <= 102) {
            inittupian();
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object obj = e.getSource();
        if (obj == replay1) {
            resetCurrentGame();
        } else if (obj == replay2) {
            startNextGame();
        } else if (obj == restore) {
            undoMove();
        } else if (obj == close) {
            System.exit(0);
        } else if (obj == rule1) {
            showRuleDialog("tupian/rule/1.png");
        } else if (obj == rule2) {
            showRuleDialog("tupian/rule/2.png");
        } else if (obj == rule3) {
            showRuleDialog("tupian/rule/3.png");
        } else if (obj == pattern1) {
            setGameMode(0, 0, 1);
        } else if (obj == pattern2) {
            setGameMode(1, 1, 2);
        } else if (obj == pattern3) {
            setGameMode(1, 0, 3);
        } else if (obj == pattern4) {
            setGameMode(0, 1, 4);
        } else if (obj == customDice) {
            showCustomDiceDialog();
        }
    }

    private void showCustomDiceDialog() {
        if (state != 3) {
            JOptionPane.showMessageDialog(this, "只能在准备阶段设置自定义点数", "提示", JOptionPane.WARNING_MESSAGE);
            return;
        }

        String[] options = {"1", "2", "3", "4", "5", "6"};
        String selectedValue = (String) JOptionPane.showInputDialog(
                this,
                "请选择骰子点数:",
                "自定义点数",
                JOptionPane.PLAIN_MESSAGE,
                null,
                options,
                options[0]
        );

        if (selectedValue != null) {
            int diceValue = Integer.parseInt(selectedValue);
            setDiceValue(diceValue);
        }
    }

    private void setDiceValue(int diceValue) {
        shaizi = diceValue;

        if (jiou % 2 == 1) {
            state = 1;
            jiou++;
        } else if (jiou % 2 == 0) {
            state = 2;
            jiou++;
        }

        uuu = 1;
        t = 1;

        for (int j = 0; j < 5; j++) {
            data4[j] = data[j].clone();
        }
        life1 = life.clone();
        jiou1 = jiou - 1;

        inittupian();
    }

    private void resetCurrentGame() {
        shaizi = 0;
        state = 0;
        start = 1;
        v = 0;
        b = 0;
        m = 0;
        n = 0;
        t = 1;
        if (jushu == 2 || jushu == 3 || jushu == 6 || jushu == 7) {
            jiou = 2;
        } else {
            jiou = 1;
        }
        p = 0;
        initdata1();
        inittupian();
    }

    private void startNextGame() {
        jushu++;
        resetCurrentGame();
    }

    private void undoMove() {
        state = 3;
        for (int i = 0; i < 5; i++) {
            data[i] = data4[i].clone();
        }
        life = life1.clone();
        jiou = jiou1;
        shaizi = 0;
        inittupian();
    }

    private void showRuleDialog(String imagePath) {
        JDialog jDialog = new JDialog();
        JLabel jLabel = new JLabel(new ImageIcon(imagePath));
        jLabel.setBounds(0, 0, 500, 300);
        jDialog.getContentPane().add(jLabel);
        jDialog.setSize(550, 350);
        jDialog.setAlwaysOnTop(true);
        jDialog.setLocationRelativeTo(null);
        jDialog.setModal(true);
        jDialog.setVisible(true);
    }

    private void setGameMode(int redAI, int blueAI, int pattern) {
        redai = redAI;
        blueai = blueAI;
        aipattern = pattern;
        inittupian();
    }
}