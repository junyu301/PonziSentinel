from flask import Blueprint, jsonify
from app.services.detector import get_records

bp = Blueprint("records", __name__, url_prefix="/api")


@bp.route("/records", methods=["GET"])
def records():
    return jsonify(get_records())
