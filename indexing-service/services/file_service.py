import os
import uuid
import io
from io import BytesIO
from services.openai_service import get_transcription
from utils.utils import chunk_split
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.converter import TextConverter
from io import StringIO


class NamedBytesIO(BytesIO):
    def __init__(self, initial_bytes=None, name=None):
        super().__init__(initial_bytes)
        self.name = name


def convert_audio_format(file):
    # Convert the file to a supported format (e.g., WAV)
    audio = AudioSegment.from_file(file, format=file.mimetype.split("/")[-1])
    converted_file = NamedBytesIO(
        audio.export().read(), name=file.filename + ".wav")

    return converted_file


def split_text(text):
    # Initializing K
    chunk_size = 512

    res = []
    num_chunks = (len(text) + chunk_size - 1) // chunk_size
    for i in range(num_chunks):
        chunk = ""
        for j in range(chunk_size):
            index = i * chunk_size + j
            if index < len(text):
                chunk += text[index]
        res.append(chunk)

    print("The K chunked list: " + str(res))

    return res


def process_audio_file(file):

    # get the file type that we got from youtube;
    mime_type = file.mimetype

    # Get the size of the file
    file.seek(0, io.SEEK_END)
    size = file.tell()
    file.seek(0)

    # generate a random id for the audio file;
    random_id = uuid.uuid4()

    audio_info = {
        'mime_type': mime_type,
        'size': size,
        'id': str(random_id)
    }

    if not is_valid_audio(audio_info['mime_type']):
        raise Exception("Internal server error")
    else:
        # Now we can process the audio file
        # Create a BytesIO object to handle the in-memory file
        audio_stream = NamedBytesIO(file.read(), name=file.filename)

        # Make a request to OpenAI to get the transcription of the audio file
        transcription = get_transcription(audio_stream)

        chunks = chunk_split(transcription["text"], 512)

        return chunks


def extract_text_by_page(file):
    for page in PDFPage.get_pages(file, caching=True, check_extractable=True):
        resource_manager = PDFResourceManager()
        fake_file_handle = StringIO()
        converter = TextConverter(resource_manager, fake_file_handle)
        page_interpreter = PDFPageInterpreter(
            resource_manager, converter)
        page_interpreter.process_page(page)
        text = fake_file_handle.getvalue()
        yield text
        # close open handles
        converter.close()
        fake_file_handle.close()


def process_text_file(file) -> list[str]:
    # use pdf miner to extract the text and get the pages
    # then iterate them and split them into chunks
    final_chunks = []
    for (page_index, page) in enumerate(extract_text_by_page(file)):
        page_chunks = split_text(page)
        final_chunks.extend(page_chunks)

    return final_chunks


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

    return mime_type in valid_audio_mime_types
