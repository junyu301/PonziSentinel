from flask import Blueprint, jsonify
from app.services.detector import get_statistics

bp = Blueprint("statistics", __name__, url_prefix="/api")


@bp.route("/statistics", methods=["GET"])
def statistics():
    return jsonify(get_statistics())
