import pandas as pd
from services import openai_service, youtube_service, file_service, weaviateService
from weaviate import Client


def indexing_save(result, chat_id, client):

    weaviateService.getOrCreateClass(client, chat_id)

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