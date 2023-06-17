import re


def is_youtube_video(url):
    youtube_regex = (
        r'(https?://)?(www\.)?'
        '(youtube|youtu|youtube-nocookie)\.(com|be)/'
        '(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
    )

    youtube_regex_match = re.match(youtube_regex, url)
    if youtube_regex_match:
        return True
    else:
        return False


def is_3d_related_text(text):
    keywords = ["3d", "three-dimensional", "stereoscopic", "3-d", "autocad",
                "3ds max", "blender", "cinema 4d", "maya", "zbrush",
                "3d printing", "3d scanner", "3d modeling", "3d rendering",
                "VR", "AR", "virtual reality", "augmented reality"]

    text_lower = text.lower()

    for keyword in keywords:
        if keyword in text_lower:
            return True

    return False


def is_image_type(mime_type):
    valid_image_mime_types = [
        "image/bmp",
        "image/cis-cod",
        "image/gif",
        "image/ief",
        "image/jpeg",
        "image/pipeg",
        "image/svg+xml",
        "image/tiff",
        "image/x-cmu-raster",
        "image/x-cmx",
        "image/x-icon",
        "image/x-portable-anymap",
        "image/x-portable-bitmap",
        "image/x-portable-graymap",
        "image/x-portable-pixmap",
        "image/x-rgb",
        "image/x-xbitmap",
        "image/x-xpixmap",
        "image/x-xwindowdump",
        "image/png",
        "image/webp",
    ]

    return mime_type in valid_image_mime_types


def categorize_file(mimetype: str) -> str:
    # given the mime type
    # use the defined utils to find if the
    # file is an image, video or something else.
    is_image = is_image_type(mimetype)
    is_3d_related = is_3d_related_text(mimetype)
    is_youtube_video = is_youtube_video(mimetype)

    if is_image:
        return "image"
    elif is_3d_related:
        return "3d"
    elif is_youtube_video:
        return "youtube"