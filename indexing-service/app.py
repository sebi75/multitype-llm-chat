import os
import time
import openai
import pandas as pd
from utils import utils
from flask_cors import CORS
from dotenv import load_dotenv
from services import openai_service, youtube_service
from flask import Flask, jsonify, request

load_dotenv()

app = Flask("indexing-service")
app.config['UPLOAD_FOLDER'] = "upload"

CORS(app)


@app.route("/ping", methods=["GET"])
def ping():
    response = {"message": "pong!"}
    return jsonify(response)


# this route takes whole files
@app.route("/index-file", methods=["POST"])
def index_file():
    # take the file from the request and
    # put the mime type into a variable
    file = request.files["file"]
    mime_type = file.mimetype
    print(mime_type)


@app.route("/index-url", methods=["POST"])
def index_url():
    print("received request")
    url = request.get_json()["url"]
    is_youtube_url = utils.is_youtube_video(url)

    if is_youtube_url:
        print("In youtube if for processing it...")
        result = youtube_service.process_youtube_video(url)
        print(result)
    else:
        print("do normal page processing of the information")

    return jsonify({"message": "ok"})


if __name__ == "__main__":
    app.run(port=5050, debug=True)
