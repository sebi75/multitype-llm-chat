import os
import uuid
from pytube import YouTube
from services.openai_service import get_transcription
from weaviate import Client
from utils.utils import chunk_split


def process_youtube_video(url: str):
    youtube_video = YouTube(url)
    audio_stream = youtube_video.streams.filter(only_audio=True).first()
    download_path = audio_stream.download()

    # get the file type that we got from youtube;
    mime_type = audio_stream.mime_type

    # get the size of the file;
    size = os.path.getsize(download_path)

    # generate a random id for the audio file;
    random_id = uuid.uuid4()

    audio_info = {
        'mime_type': mime_type,
        'size': size,
        'id': str(random_id)
    }

    if not is_valid_audio(audio_info['mime_type']):
        # this should be shown as an internal server error
        # it would mean that we got audio from youtube
        # but youtube returned to us an audio file that we do not support
        raise Exception("Internal server error")
    else:
        # now we can process the audio file:
        with open(download_path, "rb") as file_handle:
            # make request to openai to get the transcritpion of the audio file
            transcription = get_transcription(file_handle)
            print(transcription)

            return chunk_split(transcription["text"], 512)


def is_valid_audio(mime_type):
    valid_audio_mime_types = [
        "audio/mpeg",
        "audio/x-wav",
        "audio/ogg",
        "audio/vorbis",
        "audio/vnd.wav",
        "audio/webm",
        "audio/3gpp",
        "audio/3gpp2",
        "audio/aac",
        "audio/mp4",
        "audio/x-m4a",
    ]

    if mime_type not in valid_audio_mime_types:
        return False
    return True
