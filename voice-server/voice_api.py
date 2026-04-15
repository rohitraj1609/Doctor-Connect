"""
Local Whisper voice transcription API.
Records audio from browser, transcribes with OpenAI Whisper (local, no cloud).
Supports Hindi -> English translation.
"""
import os
import tempfile
from pathlib import Path

import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max upload
CORS(app)

MODEL_NAME = os.getenv("WHISPER_MODEL", "small")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")

ALLOWED_TYPES = {'audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'}

print(f"Loading Whisper '{MODEL_NAME}' on {DEVICE}...")
model = whisper.load_model(MODEL_NAME, device=DEVICE)
print("Whisper model loaded.")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"success": False, "message": "No audio file"}), 400

    audio_file = request.files["audio"]

    # Validate content type
    if audio_file.content_type and audio_file.content_type not in ALLOWED_TYPES:
        # Allow through anyway — browser might send different MIME
        pass

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name

        result = model.transcribe(
            tmp_path,
            task="translate",
            no_speech_threshold=0.3,
            condition_on_previous_text=False,
            temperature=0.0,
        )
        text = result.get("text", "").strip()
        lang = result.get("language", "unknown")

        return jsonify({
            "success": True,
            "text": text,
            "language": lang,
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "message": "File too large. Max 10MB."}), 413


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "model": MODEL_NAME, "device": DEVICE})


if __name__ == "__main__":
    app.run(port=5001, debug=False)
