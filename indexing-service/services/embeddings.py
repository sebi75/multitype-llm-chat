import openai


def get_embedding(text: str, model="text-embedding-ada-002"):
    """Get embedding from text using text-embedding-ada-002 model."""
    return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']
