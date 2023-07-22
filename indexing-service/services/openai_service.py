import openai
import os
from dotenv import load_dotenv

def get_embedding(text: str, model="text-embedding-ada-002"):
    """Get embedding from text using text-embedding-ada-002 model."""
    return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']


def get_transcription(file, model="whisper-1"):
    print("Getting transcription from openai...")

    load_dotenv()

    openai.api_key = os.getenv('OPENAI_API_KEY')

    # use openai whisper api to get transcription of the audio file
    return openai.Audio.transcribe(file=file, model=model)
