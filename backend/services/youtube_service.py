import re
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from pytube import YouTube

def _extract_video_id(youtube_url: str) -> str:
    """Extracts the 11-character video ID from a YouTube URL."""
    # Match various formats like watch?v=, youtu.be/, shorts/, etc.
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", youtube_url)
    if not match:
        raise ValueError("Invalid YouTube URL format")
    return match.group(1)

def extract_transcript(youtube_url: str) -> str:
    """Fetches the full transcript for a given YouTube URL."""
    video_id = _extract_video_id(youtube_url)
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        # Combine all parts into a single string
        full_text = " ".join([segment['text'] for segment in transcript_list])
        return full_text
    except TranscriptsDisabled:
        raise ValueError("Transcripts are disabled for this video")
    except NoTranscriptFound:
        raise ValueError("No transcript found for this video")
    except Exception as e:
        raise ValueError(f"Error fetching transcript: {str(e)}")

def get_video_title(youtube_url: str) -> str:
    """Fetches the title of the video using pytube."""
    try:
        yt = YouTube(youtube_url)
        return yt.title
    except Exception as e:
        raise ValueError(f"Error fetching video title: {str(e)}")
