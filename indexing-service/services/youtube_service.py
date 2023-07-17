import os
import uuid
import io
import time

from pytube import YouTube
from pytube.exceptions import PytubeError

from exceptions_results import OperationResult, UnsupportedAudioFormatError

from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

from utils.utils import delete_file
from services.openai_service import get_transcription

from weaviate import Client
from utils.utils import chunk_split


# download youtube video
def download_youtube_video(url, output_path, id: str):
    try:
        # setup youtube object
        youtube = YouTube(url)

        # get the audio stream
        audio_stream = youtube.streams.filter(only_audio=True).first()

        # If download is successful, check if the audio format is supported
        mime_type = audio_stream.mime_type
        if not is_valid_audio(mime_type):
            # If the audio format is not supported, raise an UnsupportedAudioFormatError
            raise UnsupportedAudioFormatError("Internal server error: Unsupported audio format from YouTube.")

        # If the audio format is supported, return the audio file path
        audio_file_path = audio_stream.download(output_path=output_path, filename=f"youtube_audio_{id}.mp3")
        return OperationResult(success=True, message="Successfully downloaded the audio file.", return_data=audio_file_path)
    except PytubeError as e:
        # Handle PytubeError and return an OperationResult object with success=False, the error message, and no return_data
        return OperationResult(success=False, message=f"Error during fetching the video stream: {e}")
    except UnsupportedAudioFormatError as e:
        # Handle the custom UnsupportedAudioFormatError and return an OperationResult object with success=False, the error message, and no return_data
        return OperationResult(success=False, message=str(e))
    except Exception as e:
        # Handle any other unexpected exceptions during download and return an OperationResult object with success=False, the error message, and no return_data
        return OperationResult(success=False, message=f"Error during download: {e}")

# download youtube video
def download_youtube_video(url, output_path, id: str):
    audio_file_path = None
    try:
        # setup youtube object
        youtube = YouTube(url)

        # get the audio stream
        audio_stream = youtube.streams.filter(only_audio=True).first()

        # download the audio file
        audio_file_path = audio_stream.download(output_path=output_path, filename=f"youtube_audio_{id}.mp3")

        success=True
        message="Successfully downloaded the audio file."
    except PytubeError as e:

        # Handle any PytubeError that might occur during fetching the video stream
        success=False
        message=f"Error during fetching the video stream: {e}"
    except Exception as e:

        # Handle any other unexpected exceptions during download
        success=False
        message=f"Error during download: {e}"

    return_data = {
        'path': audio_file_path,
        'stream': audio_stream
    }
    
    return OperationResult(success=success, message=message, return_data=return_data)
    


# youtube transcript setup
def extract_video_id(url):
    reutrn_data = None
    try:
        # Parse the URL
        query = urlparse(url)

        # Extract the video ID from the query parameters
        video_id = parse_qs(query.query).get('v')

        if video_id:
            # If the video ID is found, return it in an OperationResult object

            success=True
            message="Successfully extracted the video ID from the URL."
            reutrn_data=video_id[0]
        else:
            # If the video ID is not found, return an OperationResult object with success=False and the error message
            
            success=False
            message = "Video ID not found in the URL."
    except Exception as e:
        # Handle any unexpected exceptions during parsing and return an OperationResult object with success=False and the error message
        
        success=False
        message = f"Error occurred while parsing the URL: {e}"

    return OperationResult(success=success, message=message, return_data=reutrn_data)
    
    

# transcribe youtube with whisper
def transcribe_youtube(url, path):

    # Extract video ID and handle any errors during extraction
    extract_result = extract_video_id(url)
    if not extract_result.success:
        print(f"Video ID extraction failed. Reason: {extract_result.message}")
        return
    
    video_id = extract_result.return_data

    
    # Download the YouTube video and handle any errors during download
    download_result = download_youtube_video(url, path, video_id)
    if not download_result.success:
        print(f"Download failed. Reason: {download_result.message}")
        return

    # get the path, type, size of the file
    audio_file_path = download_result.return_data['path']
    mime_type = download_result.return_data['stream'].mime_type
    size = os.path.getsize(audio_file_path)

    class AudioInfo:
        def __init__(self, id, mime_type, size, text=None):
            self.id = id
            self.mime_type = mime_type
            self.size = size
            self.text = text

    audio = AudioInfo(video_id, mime_type, size)

    # Transcribe the audio using Whisper and handle any errors during transcription
    try:
        with open(audio_file_path, "rb") as file_handle:
            # Make request to openai to get the transcription of the audio file
            transcription = get_transcription(file_handle)

            audio.text = chunk_split(transcription["text"], 512)
            
            return audio
    except Exception as e:
        # Handle any unexpected exceptions during transcription and return an error message
        print(f"Transcription failed. Reason: {e}")
    finally:
        # Delete the audio file and handle any errors during deletion
        delete_result = delete_file(audio_file_path)
        if not delete_result.success:
            print(f"Deletion failed. Reason: {delete_result.message}")


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
