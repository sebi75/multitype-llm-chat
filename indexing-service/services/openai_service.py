import openai


def get_embedding(text: str, model="text-embedding-ada-002"):
    return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']


def get_transcription(file, model="whisper-1"):
    return openai.Audio.transcribe(file=file, model=model)
