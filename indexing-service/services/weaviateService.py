from weaviate import Client


def contains(list, isInList):
    for x in list:
        if isInList(x):
            return True
    return False


def getOrCreateClass(client: Client, className: str):
    try:
        schema = client.schema.get()
        if contains(schema["classes"], lambda x: x["class"] == className):
            print("Class already exists")
            return
        else:
            class_obj = {"class": className}
            client.schema.create_class(class_obj)
    except Exception as e:
        print(e)
        print("Error in getOrCreateClass")
