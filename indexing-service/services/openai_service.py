import openai


def get_embedding(text: str, model="text-embedding-ada-002"):
    """Get embedding from text using text-embedding-ada-002 model."""
    return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']


def get_transcription(file, model="whisper-1"):
    print("Getting transcription from openai...")

    openai.api_key = "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"

    print(openai.api_key)

    # use openai whisper api to get transcription of the audio file
    return openai.Audio.transcribe(file=file, model=model)
