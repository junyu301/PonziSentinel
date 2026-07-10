# PonziSentinel — 以太坊智能合约庞氏骗局检测系统

基于机器学习的以太坊智能合约庞氏骗局自动检测系统，通过分析合约字节码和操作码特征，识别潜在的庞氏合约。

## 功能特性

- **智能合约检测** — 输入以太坊合约地址，自动获取合约字节码并分析
- **ML 多模型融合** — 结合 TF-IDF、Word2Vec 和 XGBoost 进行特征提取与分类
- **检测记录管理** — 所有检测结果自动保存，支持历史查询与统计
- **知识科普** — 内置庞氏骗局相关科普内容

## 技术栈

| 层级 | 技术 |
|------|------|
| Web 框架 | Flask + Gunicorn |
| 机器学习 | XGBoost, Word2Vec (Gensim), TF-IDF (scikit-learn) |
| 区块链数据 | Etherscan API + pyevmasm 反汇编 |
| 数据库 | SQLite |
| 容器化 | Docker + Docker Compose |

## 项目结构

```
.
├── app/
│   ├── routes/           # Flask 路由
│   │   ├── analyze.py    # 合约检测 API
│   │   ├── pages.py      # 页面路由
│   │   ├── records.py    # 检测记录 API
│   │   └── statistics.py # 统计数据 API
│   ├── services/         # 核心服务
│   │   ├── detector.py   # ML 预测与数据库操作
│   │   ├── etherscan.py  # Etherscan API 调用
│   │   └── preprocessor.py # 操作码预处理
│   ├── static/           # 静态资源 (CSS/JS/图片)
│   └── templates/        # Jinja2 模板
├── models/               # 预训练模型
│   ├── PonziSentinel.joblib    # XGBoost 分类器
│   ├── word2vec_vs128_win5_mc1_sg1_ep50.model  # Word2Vec 模型
│   └── tf_idf.pkl              # TF-IDF 向量化器
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## 本地部署

### 环境要求

- Python 3.11+
- 或 Docker + Docker Compose

### 方式一：直接运行

```bash
# 1. 克隆项目
git clone https://github.com/junyu301/PonziSentinel.git
cd PonziSentinel

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 Etherscan API Key

# 5. 启动服务
flask --app "app:create_app()" run --debug --port 8000

# 访问 http://localhost:8000
```

### 方式二：Docker 部署

```bash
# 1. 克隆项目
git clone https://github.com/junyu301/PonziSentinel.git
cd PonziSentinel

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 SECRET_KEY 和 ETHERSCAN_API_KEY
nano .env

# 3. 启动容器
docker compose up -d

# 访问 http://localhost:8000
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SECRET_KEY` | Flask 密钥 | `change-this-in-production` |
| `ETHERSCAN_API_KEY` | Etherscan API 密钥 | 需要替换 |
| `DATABASE_PATH` | SQLite 数据库路径 | `data/detections.db` |

> 注册 Etherscan API Key：[https://etherscan.io/register](https://etherscan.io/register)

## 使用说明

1. 打开首页，在输入框中粘贴以太坊合约地址
2. 点击「开始检测」，系统将自动获取合约字节码并进行检测
3. 检测结果会显示合约是否为庞氏合约，并给出置信度
4. 在「检测记录」页面查看历史检测结果和统计

## License

MIT
