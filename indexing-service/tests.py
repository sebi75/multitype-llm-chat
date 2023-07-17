from utils import utils
from services import youtube_service

def test_youtube_transcirbe():
    url = "https://www.youtube.com/watch?v=5ftHdsmf2C0&ab_channel=CreatedTech"
    is_youtube_url = utils.is_youtube_video(url)

    if is_youtube_url:
        print("In youtube if for processing it...")

        print(url)

        result = youtube_service.transcribe_youtube(url, "../assets/saved_files/yt_videos")
        print(result.text)

    else:
        print("do normal page processing of the information")

    print("done transcribing")

test_youtube_transcirbe()