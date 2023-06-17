import os
import time
import openai
import json
import pandas as pd
from utils import utils
from flask_cors import CORS
from weaviate import Client
from dotenv import load_dotenv
from services import openai_service, youtube_service, file_service, weaviateService
from flask import Flask, jsonify, request

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

    chat_id = request.form["chat_id"]
    print("got chat_id: ", chat_id)
    weaviateService.getOrCreateClass(client, chat_id)

    # utils.is_audio_type(file)
    print("processing audio...")
    result: list[str] = file_service.process_audio_file(file)

    # put the result into a pandas dataframe
    df = pd.DataFrame(result, columns=["chunk"])

    # now apply the embedding function to the dataframe
    df["embedding"] = df["chunk"].apply(openai_service.get_embedding)

    # iterate the dataframe and add every row to the weaviate class
    for index, row in df.iterrows():
        data_object = {
            "text": row["chunk"],
        }
        client.data_object.create(data_object=data_object, class_name=chat_id,
                                  vector=row["embedding"])

    # embed every text and add it to the weaviate class.

    return jsonify({
        "string": "result"
    })


@app.route("/index-url", methods=["POST"])
def index_url():
    print("received request")
    url = request.get_json()["url"]
    is_youtube_url = utils.is_youtube_video(url)


    if is_youtube_url:
        print("In youtube if for processing it...")

        print(url)

        result = youtube_service.process_youtube_video(url)
        print(result)
    else:
        print("do normal page processing of the information")


    

    chat_id = request.get_json()["chat_id"]
    print("got chat_id: ", chat_id)
    # weaviateService.getOrCreateClass(client, chat_id)

    # # put the result into a pandas dataframe
    # df = pd.DataFrame(result, columns=["chunk"])

    # # now apply the embedding function to the dataframe
    # df["embedding"] = df["chunk"].apply(openai_service.get_embedding)

    # # iterate the dataframe and add every row to the weaviate class
    # for index, row in df.iterrows():
    #     data_object = {
    #         "text": row["chunk"],
    #     }
    #     client.data_object.create(data_object=data_object, class_name=chat_id,
    #                               vector=row["embedding"])

    # embed every text and add it to the weaviate class.

    return jsonify({
        "data": "data_object"
    })


@app.route("/search", methods=["POST"])
def search():
    # we get a search query from the request
    search_query = request.get_json()["search_query"]
    chat_id = request.get_json()["chat_id"]

    # embed the search query
    search_query_embedding = openai_service.get_embedding(search_query)

    response = (
        client.query
        .get(chat_id, ["text"])
        .with_near_vector({
            "vector": search_query_embedding, })
        .with_limit(10)
        .with_additional(["distance"])
        .do()
    )
    data = response["data"]["Get"][f"{chat_id}"]
    
    # filter the data in terms of accuracy
    filtered_data = utils.filter_result(data, 0.25)
 
    return jsonify({
        "data": filtered_data
    })


if __name__ == "__main__":
    app.run(port=5050, debug=True)
