from flask import Blueprint, request, jsonify, current_app

from app.services.etherscan import get_source_code, get_creation_opcode_without_operand
from app.services.preprocessor import extract_features
from app.services.detector import predict, save_detection

bp = Blueprint("analyze", __name__, url_prefix="/api")


@bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    contract = data["contract"].strip()

    status, resource_code = get_source_code(contract)

    detecting_result = {"value_predicted": None, "confidence": None}

    if status != "0":
        try:
            opcode_str = get_creation_opcode_without_operand(contract)
            features = extract_features(opcode_str)
            y_pred, confidence = predict(features)
            detecting_result = {"value_predicted": y_pred, "confidence": confidence}
            save_detection(contract, y_pred, confidence)
        except Exception as e:
            current_app.logger.error(f"Detection failed for {contract}: {e}")
            detecting_result = {"value_predicted": "error", "confidence": 0}

    return jsonify(
        {
            "status": status,
            "resource_code": resource_code,
            "value_predicted": str(detecting_result["value_predicted"]),
            "confidence": str(detecting_result["confidence"]),
        }
    )
