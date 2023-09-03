from typing import List
from utils import utils
from flask_cors import CORS
from weaviate import Client
from dotenv import load_dotenv
from services import youtube_service, file_service
from services.weaviateService import WeviateService
from services.openai_service import OpenAIService
from flask import Flask, jsonify, request

load_dotenv()

app = Flask("indexing-service")
app.config['UPLOAD_FOLDER'] = "upload"

CORS(app)


client = Client("http://localhost:8085")
openai_service = OpenAIService()
weaviate_service = WeviateService(client, openai_service)


@app.route("/ping", methods=["GET"])
def ping():
    response = {"message": "pong!"}
    return jsonify(response)


@app.route("/index-file", methods=["POST"])
def index_file():
    file = request.files["file"]
    mime_type = file.content_type

    chat_id = request.form["chat_id"]
    object_id = request.form["object_id"]
    result: list[str] = []
    if utils.is_audio_type(mime_type):
        result: list[str] = file_service.process_audio_file(file)
    else:
        result: list[str] = file_service.process_text_file(file)

    try:
        weaviate_service.indexing_save(result, chat_id, object_id, client)
    except Exception as e:
        print(e)
        return jsonify({
            "response": "error"
        }), 500

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
        }), 400

    chat_id = request.get_json()["chat_id"]

    try:
        weaviate_service.indexing_save(result, chat_id, client)
    except Exception as e:
        print(e)
        return jsonify({
            "response": "Error in indexing_save"
        }), 500

    return jsonify({
        "data": result
    })


@app.route("/delete-object", methods=["POST"])
def delete_object():
    chat_id = request.get_json()["chat_id"]
    object_id = request.get_json()["object_id"]
    composite_id = f"{chat_id}-{object_id}"

    try:
        weaviate_service.detele_object(composite_id)
    except Exception as e:
        print(e)
        return jsonify({
            "response": "Error in deleting data object"
        }), 500

    return jsonify({
        "response": "ok"
    }), 200


@app.route("/search", methods=["POST"])
def search():
    search_query = request.get_json()["search_query"]
    chat_id: str = request.get_json()["chat_id"]
    object_ids: List[str] = request.get_json()["object_ids"]
    composite_ids = [f"{chat_id}-{object_id}" for object_id in object_ids]

    # get all object_id's in order to create all the composite ids
    # to retrieve all the data that is stored for a specific chat_id
    try:
        context_data = []
        for composite_id in composite_ids:
            context_search = weaviate_service.search(
                search_query, composite_id, openai_service)
            context_data.append(context_search)
    except Exception as e:
        print(e)
        return jsonify({
            "response": "Error in search"
        }), 500

    filtered_data = utils.filter_result(context_data, 0.25)

    return jsonify({
        "data": filtered_data
    }), 200


@app.route("/check-schema", methods=["GET"])
def check_schema():
    schema = client.schema.get()
    if schema == {}:
        schema = weaviate_service.create_schema(client)
    else:
        print("schema is not empty...")

    return jsonify({
        "schema": schema
    })


if __name__ == "__main__":
    app.run(port=5050, debug=True)
