e uploaded file to a temporary directory
    # upload_dir = 'uploads'
    # os.makedirs(upload_dir, exist_ok=True)
    # upload_path = os.path.join(upload_dir, file.filename)
    # file.save(upload_path)

    # # Get the MIME type of the uploaded file
    # mime_type = file.mimetype

    # # Get the size of the file
    # size = os.path.getsize(upload_path)

    # # Generate a random ID for the audio file
    # random_id = uuid.uuid4()

    # audio_info = {
    #     'mime_type': mime_type,
    #     'size': size,
    #     'id': str(random_id)
    # }

    # if not is_valid_audio(audio_info['mime_type']):
    #     # This should be shown as an internal server error
    #     # It would mean that the uploaded file is not a supported audio format
    #     raise Exception("Internal server error")
    # else:
    #     # Now we can process the audio file
    #     with open(upload_path, "rb") as file_handle:
    #         # Make a request to OpenAI to get the transcription of the audio file
    #         transcription = get_transcription(file_handle)
    #         print(transcription)

    # # Clean up the temporary file
    # os.remove(upload_pa