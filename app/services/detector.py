import sqlite3
from datetime import datetime
from flask import current_app


def _get_db():
    db_path = current_app.config["DATABASE_PATH"]
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the detections table if it doesn't exist."""
    conn = _get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT NOT NULL,
            datetime TEXT NOT NULL,
            type TEXT NOT NULL,
            confidence REAL NOT NULL
        )
    """
    )
    conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_address ON detections(address)"
    )
    conn.commit()
    conn.close()


def predict(feature_vector):
    """Run XGBoost prediction. Returns (predicted_value, confidence)."""
    model = current_app.config["XGBOOST_MODEL"]
    y_pred = model.predict([feature_vector])[0]
    confidence = model.predict_proba([feature_vector])[0][0]
    return y_pred, confidence


def save_detection(address, y_pred, confidence):
    """Save detection result to SQLite, skipping duplicates."""
    result_text = "旁氏合约" if str(y_pred) in ("1", 1) else "正常合约"
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = _get_db()
    existing = conn.execute(
        "SELECT id FROM detections WHERE address = ?", (address,)
    ).fetchone()

    if not existing:
        conn.execute(
            "INSERT INTO detections (address, datetime, type, confidence) VALUES (?, ?, ?, ?)",
            (address, current_time, result_text, float(confidence)),
        )
        conn.commit()
    conn.close()


def get_statistics():
    """Return total unique contracts and Ponzi count."""
    conn = _get_db()
    total = conn.execute("SELECT COUNT(*) FROM detections").fetchone()[0]
    ponzi = conn.execute(
        "SELECT COUNT(*) FROM detections WHERE type = '旁氏合约'"
    ).fetchone()[0]
    conn.close()
    return {"totalUnique": total, "totalPonzi": ponzi}


def get_records():
    """Return all detection records as list of dicts."""
    conn = _get_db()
    rows = conn.execute(
        "SELECT address, datetime, type, confidence FROM detections ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [
        {
            "address": row["address"],
            "datetime": row["datetime"],
            "type": row["type"],
            "confidence": row["confidence"],
        }
        for row in rows
    ]
