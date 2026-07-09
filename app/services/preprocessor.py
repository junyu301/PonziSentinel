import numpy as np
import pandas as pd
from flask import current_app


def opcode_tokenizer(x: str) -> list[str]:
    return x.strip().split()


def extract_features(opcode_without_operand):
    """TF-IDF + Word2Vec max-pooling → concatenated feature vector."""
    tfidf_vec = current_app.config["TFIDF_VECTORIZER"]
    w2v_model = current_app.config["WORD2VEC_MODEL"]

    # TF-IDF
    sequences = pd.Series([opcode_without_operand]).astype(str)
    dense = tfidf_vec.transform(sequences).toarray()
    list_tfidf = dense[0].tolist()

    # Word2Vec max-pooling
    vector_size = w2v_model.vector_size
    word_list = str(opcode_without_operand).strip().split()
    vectors = [w2v_model.wv[op] for op in word_list if op in w2v_model.wv]

    if len(vectors) == 0:
        max_pooling = np.zeros(vector_size)
    else:
        max_pooling = np.max(np.array(vectors), axis=0)

    list_w2v = max_pooling.tolist()
    return list_tfidf + list_w2v
