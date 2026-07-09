import __main__
import joblib
from flask import Flask
from gensim.models import Word2Vec
from sklearn.feature_extraction.text import TfidfVectorizer

from app.config import Config
from app.extensions import cors
from app.services.preprocessor import opcode_tokenizer

# 让 pickle 能在 __main__ 中找到 opcode_tokenizer
# 因为 tf_idf.pkl 训练时将 opcode_tokenizer 注册在 __main__ 模块中
__main__.opcode_tokenizer = opcode_tokenizer


def load_models(app):
    """Load ML models on startup and store in app.config."""
    app.logger.info("Loading TF-IDF vectorizer...")
    app.config["TFIDF_VECTORIZER"] = joblib.load(app.config["TFIDF_MODEL_PATH"])

    app.logger.info("Loading Word2Vec model...")
    app.config["WORD2VEC_MODEL"] = Word2Vec.load(app.config["WORD2VEC_MODEL_PATH"])

    app.logger.info("Loading XGBoost model...")
    app.config["XGBOOST_MODEL"] = joblib.load(app.config["XGBOOST_MODEL_PATH"])

    app.logger.info("All models loaded successfully.")


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    cors.init_app(app)

    # Initialize database (needs app context for current_app.config)
    from app.services.detector import init_db
    with app.app_context():
        init_db()

    # Load ML models
    load_models(app)

    # Register blueprints
    from app.routes.pages import bp as pages_bp
    from app.routes.analyze import bp as analyze_bp
    from app.routes.statistics import bp as statistics_bp
    from app.routes.records import bp as records_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(statistics_bp)
    app.register_blueprint(records_bp)

    return app
