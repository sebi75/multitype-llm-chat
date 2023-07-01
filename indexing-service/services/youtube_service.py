import os
import uuid
from pytube import YouTube
from services.openai_service import get_transcription
from utils.utils import chunk_split


def process_youtube_video(url: str):
    youtube_video = YouTube(url)
    audio_stream = youtube_video.streams.filter(only_audio=True).first()
    download_path = audio_stream.download()
    mime_type = audio_stream.mime_type
    size = os.path.getsize(download_path)
    random_id = uuid.uuid4()

    audio_info = {
        'mime_type': mime_type,
        'size': size,
        'id': str(random_id)
    }

    if not is_valid_audio(audio_info['mime_type']):
        raise Exception("Internal server error")
    else:
        with open(download_path, "rb") as file_handle:
            transcription = get_transcription(file_handle)

            # remove the downloaded file
            os.remove(download_path)

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
