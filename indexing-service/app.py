import os
import time
import openai
import pandas as pd
from flask_cors import CORS
from flask import Flask, jsonify, request

app = Flask("indexing-service")
app.config['UPLOAD_FOLDER'] = "upload"

CORS(app)

def get_embedding(text: str, model="text-embedding-ada-002"):
    """Get embedding from text using text-embedding-ada-002 model."""


@app.route("/ping", methods=["GET"])
def ping():
    response = {"message": "pong!"}
    return jsonify(response)


@app.route("/index", methods=["POST"])
def index():
    # we want to detect what type of data we get here
    # so we will go with different steps for each type
    # for indexing

    # 1. get the data
    pass



if __name__ == "__main__":
    app.run(port=5000, debug=True)
