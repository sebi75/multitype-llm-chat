import pandas as pd
from services import openai_service, weaviateService


def indexing_save(result, chat_id, client):
    weaviateService.getOrCreateClass(client, chat_id)
    df = pd.DataFrame(result, columns=["chunk"])
    df["embedding"] = df["chunk"].apply(openai_service.get_embedding)

    for index, row in df.iterrows():
        data_object = {
            "text": row["chunk"],
        }
        client.data_object.create(data_object=data_object, class_name=chat_id,
                                  vector=row["embedding"])
