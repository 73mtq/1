package aiensitanqi.iu;

import java.util.ArrayList;
import java.util.List;

/**
 * 蒙特卡洛树搜索算法的节点类
 * 每个节点代表游戏中的一个状态
 */
public class Node {
    public Node parent; // 父节点指针
    public int rb = 1; // 节点归属：1-红方扩展的子节点，2-蓝方扩展的子节点
    public int vv = 0; // 节点游戏结果值
    public int visits; // 节点被访问次数（MCTS中的N值）
    public double score; // 节点累计分数（MCTS中的Q值）
    public int[][] mdata = new int[5][5]; // 该节点对应的棋盘状态
    public int[] mlife = new int[13]; // 该节点对应的棋子存活状态
    public List<Node> children = new ArrayList<>(); // 子节点列表

    /**
     * 节点构造函数 - 创建新节点时复制当前游戏状态
     */
    public Node() {
        vv = 0;
        parent = null;
        visits = 0;
        score = 0;
        // 深拷贝当前棋盘状态
        for (int i = 0; i < 5; i++) {
            mdata[i] = GameJFrame.data[i].clone();
        }
        // 深拷贝棋子存活状态
        mlife = GameJFrame.life.clone();
    }
}