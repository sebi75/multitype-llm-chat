import os
import time
import pandas as pd
from flask_cors import CORS
from flask import Flask, jsonify, request

app = Flask("indexing-service")
app.config['UPLOAD_FOLDER'] = "upload"

CORS(app)


@app.route("/ping", methods=["GET"])
def ping():
    response = {"message": "pong!"}
    return jsonify(response)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
