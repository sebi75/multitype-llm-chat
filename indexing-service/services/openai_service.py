import openai


class OpenAIService:
    def __init__(self):
        self.client = openai

    def get_embedding(self, text: str, model="text-embedding-ada-002"):
        return self.client.Embedding.create(input=[text], model=model)['data'][0]['embedding']

    def get_transcription(self, file, model="whisper-1"):
        return self.client.Audio.transcribe(file=file, model=model)
