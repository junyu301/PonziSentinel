# PonziSentinel
PonziSentinel, a Ponzi scheme detection system on Ethereum blockchain. It work by using vectorized data to represente smart contract, and using classfier of XGBoost to decide the detecting conclusion. In data representation, the use the concatenated feature of Maxpooling of  Word2vec vector and Tfidf  vecter is proved effective.


# PonziSentinel 

> 基于 EVM 操作码 + XGBoost 的以太坊庞氏骗局智能合约检测系统

PonziSentinel 是一个**无需源代码**的旁氏骗局检测工具。它直接从合约的创建字节码出发，反汇编成操作码序列，通过 **Word2Vec 语义特征 + TF‑IDF 统计特征** 的融合向量，利用 **XGBoost** 分类器快速判别一个合约是否为庞氏骗局。

---

##  特点

-  **无需源码**：仅依赖链上字节码，支持未开源合约  
-  **轻量快速**：XGBoost 模型单 CPU 预测时间 < 10ms  
-  **语义+统计双通道**：捕捉操作码的上下文模式与稀有特征  
-  **抗混淆**：最大池化与 TF‑IDF 对插入垃圾指令、局部重排有一定鲁棒性  
-  **类别不平衡友好**：内置少数类权重机制，适合真实链上稀疏的正样本  

---

##  系统架构

```text
[合约地址] 
    ↓
Etherscan API → 获取 creationBytecode
    ↓
反汇编 → 去掉操作数 → 纯操作码序列
    ↓
┌─────────────────────┬─────────────────────┐
│  Word2Vec + 最大池化  │      TF‑IDF         │
│   (语义向量, 128维)   │   (统计向量, ~300维)  │
└─────────────────────┴─────────────────────┘
    ↓
特征拼接 → 融合向量 (428维)
    ↓
XGBoost 分类器 → (类别, 置信度)
```

## Python解释器

````code
Python 3.12.0
````

## 安装项目依赖

```code
pip install requirements.txt
```

## 检测合约
以 FoMo3D（著名旁氏骗局例子） 为例子
````code
from PonziSentinel import get_creation_opcode_without_operand, data_processing, detecting_with_PonziSentinel, opcode_tokenizer

# 输入以太坊合约地址，FoMo3D，著名旁氏骗局例子
contract_address = "0xa62142888aba8370742be823c1782d17a0389da1"

# 步骤1：获取操作码序列
opcode_seq = get_creation_opcode_without_operand(contract_address)

# 步骤2：特征融合
features = data_processing(opcode_seq)   # 返回 list of float

# 步骤3：预测
result = detecting_with_PonziSentinel(features)
print(f"Prediction: {'Ponzi' if result['value_predicted'] == 1 else 'Normal'}")
print(f"Confidence: {result['confidence']:.4f}")
````
得到结果
````code
y_pred
1
confidence
0.35578698
Prediction: Ponzi
Confidence: 0.3558
````
