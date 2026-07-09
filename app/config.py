import os

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-this-in-production")
    ETHERSCAN_API_KEY = os.environ.get("ETHERSCAN_API_KEY", "your-etherscan-api-key")

    # SQLite database
    DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "data", "detections.db"))

    # Pre-trained model paths
    TFIDF_MODEL_PATH = os.path.join(BASE_DIR, "models", "tf_idf.pkl")
    WORD2VEC_MODEL_PATH = os.path.join(BASE_DIR, "models", "word2vec_vs128_win5_mc1_sg1_ep50.model")
    XGBOOST_MODEL_PATH = os.path.join(BASE_DIR, "models", "PonziSentinel.joblib")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
