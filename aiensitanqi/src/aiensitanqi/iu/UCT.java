package aiensitanqi.iu;

/**
 * UCT (Upper Confidence Bound for Trees) 算法实现类
 * 这是蒙特卡洛树搜索的核心算法，用于AI决策
 */
public class UCT {
    Node root; // 搜索树的根节点
    int N = 0; // 总访问次数
    double[] distance = new double[13]; // 每个棋子到目标的距离
    double[] value = new double[13]; // 每个棋子的价值评估

    /**
     * UCT算法构造函数
     */
    public UCT() {
        root = new Node(); // 创建根节点（当前游戏状态）
    }

    /**
     * 扩展节点 - 为红方第一次移动生成所有可能的子节点
     */
    public void expand1(Node node) {
        int x1, y1;
        // 遍历所有红方棋子（1-6）
        for (int i = 1; i < 7; i++) {
            if (GameJFrame.appear[i] == 1) { // 如果棋子可移动
                x1 = getxy(node, i) / 10; // 获取棋子X坐标
                y1 = getxy(node, i) % 10; // 获取棋子Y坐标

                // 尝试三个可能的移动方向
                for (int j = 1; j < 4; j++) {
                    switch (j) {
                        case 1: // 向下移动
                            if (x1 < 4) {
                                createChildNode(node, x1, y1, x1 + 1, y1, 2);
                            }
                            break;
                        case 2: // 对角线移动
                            if (x1 < 4 && y1 < 4) {
                                createChildNode(node, x1, y1, x1 + 1, y1 + 1, 2);
                            }
                            break;
                        case 3: // 向右移动
                            if (y1 < 4) {
                                createChildNode(node, x1, y1, x1, y1 + 1, 2);
                            }
                            break;
                    }
                }
            }
        }
    }

    /**
     * 扩展节点 - 为蓝方第一次移动生成所有可能的子节点
     */
    public void expand2(Node node) {
        int x1, y1;
        // 遍历所有蓝方棋子（7-12）
        for (int i = 1; i < 7; i++) {
            if (GameJFrame.appear[i + 6] == 1) {
                x1 = getxy(node, i + 6) / 10;
                y1 = getxy(node, i + 6) % 10;

                // 蓝方的三个移动方向（与红方相反）
                for (int j = 1; j < 4; j++) {
                    switch (j) {
                        case 1: // 向上移动
                            if (x1 > 0) {
                                createChildNode(node, x1, y1, x1 - 1, y1, 1);
                            }
                            break;
                        case 2: // 对角线移动
                            if (x1 > 0 && y1 > 0) {
                                createChildNode(node, x1, y1, x1 - 1, y1 - 1, 1);
                            }
                            break;
                        case 3: // 向左移动
                            if (y1 > 0) {
                                createChildNode(node, x1, y1, x1, y1 - 1, 1);
                            }
                            break;
                    }
                }
            }
        }
    }

    /**
     * 通用节点扩展方法 - 根据当前轮次生成所有可能移动
     */
    public void expand3(Node node) {
        int x1, y1;

        if (node.rb == 1) { // 红方回合
            for (int i = 1; i < 7; i++) {
                if (node.mlife[i] == 1) { // 棋子存活
                    x1 = getxy(node, i) / 10;
                    y1 = getxy(node, i) % 10;
                    generateRedMoves(node, i, x1, y1);
                }
            }
        } else if (node.rb == 2) { // 蓝方回合
            for (int i = 7; i < 13; i++) {
                if (node.mlife[i] == 1) {
                    x1 = getxy(node, i) / 10;
                    y1 = getxy(node, i) % 10;
                    generateBlueMoves(node, i, x1, y1);
                }
            }
        }
    }

    private void generateRedMoves(Node node, int pieceId, int x1, int y1) {
        for (int j = 1; j < 4; j++) {
            switch (j) {
                case 1:
                    if (x1 != 4) {
                        createChildNode(node, x1, y1, x1 + 1, y1, 2);
                    }
                    break;
                case 2:
                    if (x1 != 4 && y1 != 4) {
                        createChildNode(node, x1, y1, x1 + 1, y1 + 1, 2);
                    }
                    break;
                case 3:
                    if (y1 != 4) {
                        createChildNode(node, x1, y1, x1, y1 + 1, 2);
                    }
                    break;
            }
        }
    }

    private void generateBlueMoves(Node node, int pieceId, int x1, int y1) {
        for (int j = 1; j < 4; j++) {
            switch (j) {
                case 1:
                    if (y1 != 0) {
                        createChildNode(node, x1, y1, x1, y1 - 1, 1);
                    }
                    break;
                case 2:
                    if (x1 != 0 && y1 != 0) {
                        createChildNode(node, x1, y1, x1 - 1, y1 - 1, 1);
                    }
                    break;
                case 3:
                    if (x1 != 0) {
                        createChildNode(node, x1, y1, x1 - 1, y1, 1);
                    }
                    break;
            }
        }
    }

    /**
     * 创建子节点的辅助方法
     */
    private void createChildNode(Node parent, int fromX, int fromY, int toX, int toY, int nextPlayer) {
        Node child = new Node();
        child.parent = parent;
        child.rb = nextPlayer;
        child.vv = parent.vv;

        // 复制父节点状态
        for (int o = 0; o < 5; o++) {
            child.mdata[o] = parent.mdata[o].clone();
        }
        child.mlife = parent.mlife.clone();

        // 执行移动
        if (child.mdata[toX][toY] != 0) {
            child.mlife[child.mdata[toX][toY]] = 0; // 吃掉目标位置的棋子
        }
        child.mdata[toX][toY] = child.mdata[fromX][fromY];
        child.mdata[fromX][fromY] = 0;

        parent.children.add(child);
    }

    /**
     * 反向传播 - 将模拟结果传播到根节点
     */
    public void backpropagate(Node node, double result) {
        while (node != null) {
            node.visits++; // 增加访问次数
            node.score += result; // 累加分数
            if (node.parent == null) {
                N = node.visits; // 更新总访问次数
            }
            node = node.parent; // 向上传播
        }
    }

    /**
     * 选择最佳子节点 - UCB1公式实现
     */
    public Node bestChild(Node node, int i) {
        Node bestChild = null;
        double bestScore = -1000000;

        for (Node child : node.children) {
            // UCB1公式：Q/N + c*sqrt(ln(N_parent)/N_child)
            double score = (child.score / child.visits) +
                    2 * (Math.sqrt(Math.log(N) / child.visits));

            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }
        return bestChild;
    }

    /**
     * 选择阶段 - 从根节点向下选择到叶子节点
     */
    public Node select(Node node, int i) {
        while (!node.children.isEmpty()) {
            // 检查是否有未访问的子节点
            for (Node child : node.children) {
                if (child.score == 0)
                    return node; // 返回有未访问子节点的节点
            }
            node = bestChild(node, i); // 选择最佳子节点继续
        }
        return node;
    }

    /**
     * 主搜索方法 - 执行指定次数的MCTS迭代
     */
    public void search1(int iterations, int h) {
        for (int i = 0; i < iterations; i++) {
            Node node = select(root, h); // 选择阶段

            // 扩展阶段
            if (node.children.isEmpty() && i == 0 && h == 1) {
                expand1(node); // 红方首次扩展
            } else if (node.children.isEmpty() && i == 0 && h == 2) {
                expand2(node); // 蓝方首次扩展
            } else if (node.children.isEmpty() && node.vv == 0) {
                expand3(node); // 通用扩展
            }

            // 模拟阶段
            for (Node child : node.children) {
                if (child.score == 0) {
                    double result = simulate(child, h); // 模拟游戏结果
                    System.out.println(i + " " + result);
                    backpropagate(child, result); // 反向传播
                    break;
                }
            }
        }

        // 选择最佳移动
        double bestscore = -100000;
        for (Node child : root.children) {
            if (child.score > bestscore) bestscore = child.score;
        }
        for (Node child : root.children) {
            if (child.score == bestscore) {
                for (int j = 0; j < 5; j++) {
                    GameJFrame.data3[j] = child.mdata[j].clone(); // 保存最佳移动
                }
            }
        }
    }

    /**
     * 模拟函数 - 评估局面价值的核心算法
     */
    public double simulate(Node node, int l) {
        double[] p = new double[13]; // 每个棋子的概率权重
        int x1, y1;
        double RCount; // 红方有效棋子数
        double BCount; // 蓝方有效棋子数
        double count;
        double exp1 = 0; // 红方期望价值（进攻值）
        double exp2 = 0; // 蓝方期望价值（进攻值）
        double thread = 0; // 威胁值

        RCount = mRCount(node);
        BCount = mBCount(node);

        // 检查游戏是否结束
        if (l == 1) { // 红方视角
            if (victory1(node) == 1) {
                node.vv = 1;
                return 1000; // 红方胜利，返回高分
            } else if (victory1(node) == 2) {
                node.vv = 2;
                return -1000; // 蓝方胜利，返回低分
            }
        } else if (l == 2) { // 蓝方视角
            if (victory1(node) == 1) {
                node.vv = 1;
                return -1000; // 红方胜利，返回低分
            } else if (victory1(node) == 2) {
                node.vv = 2;
                return 1000; // 蓝方胜利，返回高分
            }
        }

        // 计算每个棋子的价值和概率
        for (int i = 1; i < 13; i++) {
            if (node.mlife[i] == 1) { // 棋子存活
                distance[i] = Distance(node, i); // 计算到目标的距离
                value[i] = Value(node, i); // 计算棋子价值

                if (i < 7) { // 红方棋子
                    count = mcount(node, i); // 计算棋子的移动优势
                    p[i] = (1 / RCount) * (count + 1); // 计算权重
                    exp1 += (p[i] * value[i]); // 累加红方期望价值
                } else { // 蓝方棋子
                    count = mcount(node, i);
                    p[i] = (1 / BCount) * (count + 1);
                    exp2 += (p[i] * value[i]); // 累加蓝方期望价值
                }
            }
        }

        // 计算威胁值
        if (l == 1) { // 红方视角：计算蓝方棋子对红方的威胁
            for (int i = 7; i < 13; i++) {
                if (node.mlife[i] == 1) {
                    x1 = getxy(node, i) / 10;
                    y1 = getxy(node, i) % 10;
                    thread += p[i] * Maxvalue(node, x1, y1, 1);
                }
            }
        } else if (l == 2) { // 蓝方视角：计算红方棋子对蓝方的威胁
            for (int i = 1; i < 7; i++) {
                if (node.mlife[i] == 1) {
                    x1 = getxy(node, i) / 10;
                    y1 = getxy(node, i) % 10;
                    thread += p[i] * Maxvalue(node, x1, y1, 2);
                }
            }
        }

        // 清理临时数据
        for (int i = 1; i < 13; i++) {
            value[i] = 0;
            distance[i] = 0;
        }

        // 返回综合评估分数
        if (l == 1) {
            return 10 * exp1 - 5 * exp2 - 1 * thread;
        } else if (l == 2) {
            return 15 * exp2 - 10 * exp1 - 5 * thread;
        }
        return -1;
    }

    /**
     * 检查游戏胜负状态
     */
    public int victory1(Node node) {
        int pp = 0, n = 0, m = 0;

        // 检查是否有棋子到达对方终点
        if (node.mdata[0][0] > 6) { // 蓝方棋子到达红方起点
            return 2;
        } else if (node.mdata[4][4] > 0 && node.mdata[4][4] < 7) { // 红方棋子到达蓝方起点
            return 1;
        } else {
            // 检查是否有一方棋子全部被吃
            for (int i = 1; i < 7; i++) { // 统计红方被吃棋子数
                if (node.mlife[i] == 0) n++;
                if (n == 6) pp = 2; // 红方全灭，蓝方胜
            }
            for (int i = 7; i < 13; i++) { // 统计蓝方被吃棋子数
                if (node.mlife[i] == 0) m++;
                if (m == 6) pp = 1; // 蓝方全灭，红方胜
            }
        }
        return pp;
    }

    /**
     * 计算红方有效棋子数量（考虑边界效应）
     */
    public double mRCount(Node node) {
        double m = 6;
        int n1 = 1, n2 = 6; // 边界棋子编号

        // 从前向后检查边界棋子
        for (int i = 1; i <= 3; i++) {
            if (node.mlife[i] == 0 && n1 == i) {
                n1 = i + 1;
            } else if (node.mlife[i] == 0 && n1 < i) {
                m++; // 非边界棋子被吃，增加有效数量
            }
        }
        // 从后向前检查边界棋子
        for (int i = 6; i > 3; i--) {
            if (node.mlife[i] == 0 && n2 == i) {
                n2 = i - 1;
            } else if (node.mlife[i] == 0 && n2 > i) {
                m++;
            }
        }
        return m;
    }

    /**
     * 计算蓝方有效棋子数量（考虑边界效应）
     */
    public double mBCount(Node node) {
        double m = 6;
        int n1 = 7, n2 = 12;

        for (int i = 7; i <= 9; i++) {
            if (node.mlife[i] == 0 && n1 == i) {
                n1 = i + 1;
            } else if (node.mlife[i] == 0 && n1 < i) {
                m++;
            }
        }
        for (int i = 12; i > 9; i--) {
            if (node.mlife[i] == 0 && n2 == i) {
                n2 = i - 1;
            } else if (node.mlife[i] == 0 && n2 > i) {
                m++;
            }
        }
        return m;
    }

    /**
     * 计算棋子的移动优势（相邻被吃棋子数）
     */
    public double mcount(Node node, int k) {
        double m = 0;
        if (k < 7) { // 红方棋子
            for (int i = k - 1; i > 0; i--) {
                if (node.mlife[i] == 0) {
                    m++;
                } else if (node.mlife[i] == 1) {
                    break;
                }
            }
            for (int i = k + 1; i < 7; i++) {
                if (node.mlife[i] == 0) {
                    m++;
                } else if (node.mlife[i] == 1) {
                    break;
                }
            }
        } else if (k > 6) { // 蓝方棋子
            for (int i = k - 1; i > 6; i--) {
                if (node.mlife[i] == 0) {
                    m++;
                } else if (node.mlife[i] == 1) {
                    break;
                }
            }
            for (int i = k + 1; i < 13; i++) {
                if (node.mlife[i] == 0) {
                    m++;
                } else if (node.mlife[i] == 1) {
                    break;
                }
            }
        }
        return m;
    }

    /**
     * 获取指定棋子在棋盘上的坐标
     */
    public int getxy(Node node, int k) {
        int m = 0;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (node.mdata[i][j] == k) {
                    m = i * 10 + j;
                    return m;
                }
            }
        }
        return m;
    }

    /**
     * 计算位置周围最大威胁值
     */
    public double Maxvalue(Node node, int x2, int y2, int l) {
        double m = 0;
        if (x2 > 0 && y2 > 0 && l == 1) { // 红方视角检查左上方向
            double a = value[node.mdata[x2 - 1][y2 - 1]];
            double b = value[node.mdata[x2 - 1][y2]];
            double c = value[node.mdata[x2][y2 - 1]];
            // 忽略蓝方棋子的价值
            if (node.mdata[x2 - 1][y2 - 1] > 7) a = 0;
            if (node.mdata[x2 - 1][y2] > 7) b = 0;
            if (node.mdata[x2][y2 - 1] > 7) c = 0;
            m = Math.max(Math.max(a, b), c);
            return m;
        } else if (x2 < 4 && y2 < 4 && l == 2) { // 蓝方视角检查右下方向
            double a = value[node.mdata[x2 + 1][y2 + 1]];
            double b = value[node.mdata[x2 + 1][y2]];
            double c = value[node.mdata[x2][y2 + 1]];
            if (node.mdata[x2 + 1][y2 + 1] > 7) a = 0;
            if (node.mdata[x2 + 1][y2] > 7) b = 0;
            if (node.mdata[x2][y2 + 1] > 7) c = 0;
            m = Math.max(Math.max(a, b), c);
            return m;
        }
        return m;
    }

    /**
     * 计算棋子到目标的距离
     */
    public double Distance(Node node, int k) {
        double m = -1;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (k <= 6) { // 红方棋子：目标是右下角
                    if (node.mdata[i][j] == k) {
                        m = 4 - Math.min(i, j); // 到(4,4)的曼哈顿距离
                        return m;
                    }
                } else { // 蓝方棋子：目标是左上角
                    if (node.mdata[i][j] == k) {
                        m = Math.max(i, j); // 到(0,0)的曼哈顿距离
                        return m;
                    }
                }
            }
        }
        return m;
    }

    /**
     * 计算棋子的位置价值
     */
    public double Value(Node node, int k) {
        double m = -1;
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (node.mdata[i][j] == k) {
                    if (i == 0 && j == 0 && k <= 6) { // 红方在起点
                        m = 0;
                        return m;
                    } else if (i == 4 && j == 4 && k > 6) { // 蓝方在起点
                        m = 0;
                        return m;
                    } else if ((i == 0 && j != 0) || (i != 0 && j == 0) || (i == 4 && j != 4) || (i != 4 && j == 4)) {
                        // 边界位置
                        m = 5 * Math.pow(2, 2 - distance[k]);
                        return m;
                    } else { // 普通位置
                        m = Math.pow(2, 4 - distance[k]);
                        return m;
                    }
                }
            }
        }
        return m;
    }
}