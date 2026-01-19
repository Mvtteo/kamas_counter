import ssl
ssl._create_default_https_context = ssl._create_unverified_context

from flask import Flask, render_template, request, jsonify
import base64
import tempfile
import os
from ocr_processor import extract_kamas_from_image

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    try:
        data = request.json
        image_data = data['image']
        
        header, encoded = image_data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        result = extract_kamas_from_image(tmp_path)
        os.unlink(tmp_path)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)