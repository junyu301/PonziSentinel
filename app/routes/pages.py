from flask import Blueprint, render_template

bp = Blueprint("pages", __name__)


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/records")
def records():
    return render_template("records.html")


@bp.route("/knowledges")
def knowledges():
    return render_template("knowledges.html")
