class OperationResult:
    def __init__(self, success, message=None, return_data=None):
        self.success = success
        self.message = message
        self.return_data = return_data

class UnsupportedAudioFormatError(Exception):
    pass