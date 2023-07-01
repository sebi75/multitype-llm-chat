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


@app.route("/index-file", methods=["POST"])
def index_file():
    file = request.files["file"]
    mime_type = file.content_type

    chat_id = request.form["chat_id"]
    result: list[str] = []
    if utils.is_audio_type(mime_type):
        result: list[str] = file_service.process_audio_file(file)
    else:
        result: list[str] = file_service.process_text_file(file)

    try:
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
        result = youtube_service.process_youtube_video(url)
    else:
        return jsonify({
            "response": "unexpected url"
        })

    chat_id = request.get_json()["chat_id"]

    indexing_service.indexing_save(result, chat_id, client)

    return jsonify({
        "data": result
    })


@app.route("/search", methods=["POST"])
def search():
    search_query = request.get_json()["search_query"]
    chat_id: str = request.get_json()["chat_id"]
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

    filtered_data = utils.filter_result(data, 0.25)

    return jsonify({
        "data": filtered_data
    })


@app.route("/check-schema", methods=["GET"])
def check_schema():
    schema = client.schema.get()
    if schema == {}:
        schema = weaviateService.create_schema(client)
    else:
        print("schema is not empty...")

    return jsonify({
        "schema": schema
    })


if __name__ == "__main__":
    app.run(port=5050, debug=True)
