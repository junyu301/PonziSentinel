import requests
import time
from pyevmasm import disassemble_all
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from gensim.models import Word2Vec
import numpy as np
import pandas as pd



# 自定义的if_idf tokenizer，TfidfVectorizer需要用到
def opcode_tokenizer(x: str) -> list[str]:  # 自定义的opcode_tokenizer，给TfidfVectorizer用
    return x.strip().split()

# 请求源代码
def get_source_code(contract_address):
    """

    :param contract_address:
    :return: source_code
    """

    url_creation = "https://api.etherscan.io/v2/api"
    api_key = "5E295MEC7JVFZJ69W3CN5AC55IXKNU7CWW"
    params_creation = {
        "chainid": 1,
        "module": "contract",
        "action": "getsourcecode",
        "address": contract_address,
        "apikey": api_key
    }

    while True:
        try:
            response = requests.get(url_creation, params=params_creation, timeout=10)
            response.raise_for_status()
            break  # 成功则跳出循环
        except Exception as e:
            print(f"获取合约创建信息失败，重试中... 错误信息: {e}")
            time.sleep(3)  # 等3秒再试
    status = response.json()["status"]
    if status == "0":
        result = response.json()["result"]
    else:
        result = response.json()["result"][0]["SourceCode"]
        if result == "":  # 检测是否是空合约
            status = "0"
            result = "Invalid Address"
    return status, result

# 处理得到一个creation_opcode，str类型。去掉操作数，表示的操作码str
def get_creation_opcode_without_operand(contract_address):
    """

    :param contract_address:
    :return: creation_opcode
    """
    # 1.首先获取合约creation bytecode
    api_key = "5E295MEC7JVFZJ69W3CN5AC55IXKNU7CWW"
    url_creation = "https://api.etherscan.io/v2/api"
    params_creation = {
        "chainid": 1,
        "module": "contract",
        "action": "getcontractcreation",
        "contractaddresses": contract_address,
        "apikey": api_key
    }

    while True:
        try:
            response = requests.get(url_creation, params=params_creation, timeout=10)
            response.raise_for_status()
            break  # 成功则跳出循环
        except Exception as e:
            print(f"获取合约创建信息失败，重试中... 错误信息: {e}")
            time.sleep(3)  # 等3秒再试
    print(response.json())


    creation_bytecode = response.json()["result"][0]["creationBytecode"]

    # 2.然后将creation bytecode转换为readable instructions without operand
    instructions = list(disassemble_all(bytes.fromhex(creation_bytecode[2:])))
    readable_creation_opcode_without_operand = " ".join(instr.name for instr in instructions)

    print()
    print("readable_creation_opcode_without_operand")
    print(type(readable_creation_opcode_without_operand))
    print(readable_creation_opcode_without_operand)

    return readable_creation_opcode_without_operand

# 处理得到if_idf数据，word2vec_max_pooling数据，合并，最终return一个list，每个元素对应特征
def data_processing(opcode_without_operand):
    """

    :param opcode_without_operand:
    :return: vectorized data
    """
    # 3.处理得到df_if_idf_vector
    vec: TfidfVectorizer = joblib.load("tf_idf.pkl")  # 预加载模型 & 数据
    sequences = (
        pd.Series([opcode_without_operand]).astype(str)
    )
    dense = vec.transform(sequences).toarray()  # 稀疏计数矩阵 → dense ndarray
    list_if_idf_vector = dense[0].tolist()
    """
    print()
    print("list_if_idf_vector")
    print(type(list_if_idf_vector))
    print(len(list_if_idf_vector))
    print(list_if_idf_vector)
    """

    # 4.处理得到word2vec_max_pooling_vector
    # 加载Word2Vec模型
    model = Word2Vec.load("word2vec_vs128_win5_mc1_sg1_ep50.model")
    vector_size = model.vector_size
    opcode_seq = (
        pd.Series([opcode_without_operand]).astype(str)
    )
    word_list = str(opcode_seq).strip().split()
    vectors = []

    for opcode in word_list:
        if opcode in model.wv:
            vectors.append(model.wv[opcode])
    # max pooling
    if len(vectors) == 0:
        # 如果一个opcode都找不到，用全零向量
        max_pooling = np.zeros(vector_size)
    else:
        vectors = np.array(vectors)
        max_pooling = np.max(vectors, axis=0)  # max pooling

    list_max_pooling_vector = max_pooling.tolist()
    """
    print()
    print("list_max_pooling_vector")
    print(type(list_max_pooling_vector))
    print(len(list_max_pooling_vector))
    print(list_max_pooling_vector)
    """


    # 5.合并
    sample_PonziSentinel = list_if_idf_vector + list_max_pooling_vector
    """
    print()
    print("sample_PonziSentinel")
    print(type(sample_PonziSentinel))
    print(len(sample_PonziSentinel))
    print(sample_PonziSentinel)
    """

    return sample_PonziSentinel

# xgboost检测，返回字典
def detecting_with_PonziSentinel(sample_PonziSentinel):
    """

    :param sample_PonziSentinel:
    :return: y_predicted, confidence
    """
    model = joblib.load("PonziSentinel.joblib")

    # 3) 做预测
    y_pred = model.predict([sample_PonziSentinel])[0]  # 分类标签
    confidence = model.predict_proba([sample_PonziSentinel])[0][0]  # 各类别概率（可选）

    print()
    print("y_pred")
    print(y_pred)
    print("confidence")
    print(confidence)

    return {"value_predicted":y_pred, "confidence": confidence}


