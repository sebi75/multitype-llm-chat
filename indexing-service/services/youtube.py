from pytube import YouTube
import os


def process_youtube_video(url: str):
    youtube_video = YouTube(url)
    audio = youtube_video.streams.filter(only_audio=True).first()
    print("got audio: ", audio["mime_type"])
