import os
import time
import openai
import json
# import pandas as pd
from utils import utils
from flask_cors import CORS
from weaviate import Client
from dotenv import load_dotenv
from services import openai_service, youtube_service, file_service, weaviateService
from flask import Flask, jsonify, request

from services import indexing_service

load_dotenv()

app = Flask("indexing-service")
app.config['UPLOAD_FOLDER'] = "upload"

CORS(app)


client = Client("http://localhost:8085")


@app.route("/ping", methods=["GET"])
def ping():
    response = {"message": "pong!"}
    return jsonify(response)


# this route takes whole files
@app.route("/index-file", methods=["POST"])
def index_file():
    # take the file from the request and
    # put the mime type into a variable
    # take the chat id from the request to create the new weaiate class
    file = request.files["file"]

    # get the mime type of the file
    mime_type = file.content_type

    chat_id = request.form["chat_id"]
    print("got chat_id: ", chat_id)
    # check the file if it is audio
    # or if it is somethig else ( will assume text for now )
    result: list[str] = []
    if utils.is_audio_type(mime_type):
        print("processing audio...")
        result: list[str] = file_service.process_audio_file(file)
    else:
        print("processing text...")
        result: list[str] = file_service.process_text_file(file)

    try:
        # embed every text and add it to the weaviate class with the chatId.
        indexing_service.indexing_save(result, chat_id, client)
    except Exception as e:
        print(e)
        return jsonify({
            "response": "error"
        })

    return jsonify({
        "response": "ok"
    })


@app.route("/index-url", methods=["POST"])
def index_url():
    url = request.get_json()["url"]
    is_youtube_url = utils.is_youtube_video(url)

    if is_youtube_url:
        print("In youtube if for processing it...")

        print(url)

        result = youtube_service.process_youtube_video(url)
    else:
        print("do normal page processing of the information")

    chat_id = request.get_json()["chat_id"]
    print("got chat_id: ", chat_id)

    indexing_service.indexing_save(result, chat_id, client)

    # embed every text and add it to the weaviate class.

    return jsonify({
        "data": result
    })


@app.route("/search", methods=["POST"])
def search():
    print("got in request")
    # we get a search query from the request
    search_query = request.get_json()["search_query"]
    chat_id: str = request.get_json()["chat_id"]

    # embed the search query
    search_query_embedding = openai_service.get_embedding(search_query)

    response = (
        client.query
        .get(chat_id, ["text"])
        .with_near_vector({
            "vector": search_query_embedding, })
        .with_limit(5)
        .with_additional(["distance"])
        .do()
    )
    capitalized_chat_id = chat_id.capitalize()
    data = response["data"]["Get"][f"{capitalized_chat_id}"]

    # filter the data in terms of accuracy
    filtered_data = utils.filter_result(data, 0.25)

    return jsonify({
        "data": filtered_data
    })


@app.route("/check-schema", methods=["GET"])
def check_schema():
    # check if the schema is already created
    # if not create it
    # if yes, do nothing
    schema = client.schema.get()
    if schema == {}:
        print("schema is empty")
        # create the schema
        schema = weaviateService.create_schema(client)
        print("schema created")
    else:
        print("schema is not empty")
        print(schema)

    return jsonify({
        "schema": schema
    })


def test_youtube_transcirbe():
    url = "https://www.youtube.com/watch?v=5ftHdsmf2C0&ab_channel=CreatedTech"
    is_youtube_url = utils.is_youtube_video(url)

    if is_youtube_url:
        print("In youtube if for processing it...")

        print(url)

        result = youtube_service.transcribe_youtube(url, "../assets/saved_files/yt_videos")
    else:
        print("do normal page processing of the information")

    print("done transcribing")


if __name__ == "__main__":
    app.run(port=5050, debug=True)

    # chat_id = request.get_json()["chat_id"]
    # print("got chat_id: ", chat_id)

    # indexing_service.indexing_save(result, chat_id, client)

