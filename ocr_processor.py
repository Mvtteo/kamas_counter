import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import easyocr
from PIL import Image
import re

reader = None

def get_reader():
    global reader
    if reader is None:
        reader = easyocr.Reader(['fr', 'en'], gpu=False)
    return reader

def extract_numbers(text):
    text = text.replace('\n', ' ')
    
    kamas_pattern = r'\((\d{1,3}(?:\s\d{3})*)\s*kamas\)'
    kamas_matches = re.findall(kamas_pattern, text, re.IGNORECASE)
    
    amounts = []
    
    for match in kamas_matches:
        clean = match.replace(' ', '')
        try:
            value = int(clean)
            amounts.append(value)
        except ValueError:
            continue
    
    if not amounts:
        patterns = [
            r'(\d{1,3}(?:\s\d{3})+)',
            r'(\d{1,3}(?:\.\d{3})+)',
            r'(\d+)\s*[kK]',
            r'(\d+)\s*[mM]',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                clean = match.replace(' ', '').replace('.', '').replace(',', '')
                try:
                    value = int(clean)
                    if 'k' in pattern.lower():
                        value *= 1000
                    elif 'm' in pattern.lower():
                        value *= 1000000
                    if value >= 100:
                        amounts.append(value)
                except ValueError:
                    continue
    
    return amounts

def format_kamas(amount):
    return '{:,}'.format(amount).replace(',', ' ')

def extract_kamas_from_image(image_path):
    try:
        results = get_reader().readtext(image_path)
        text = ' '.join([detection[1] for detection in results])
        amounts = extract_numbers(text)
        total = sum(amounts)
        
        return {
            'success': True,
            'raw_text': text,
            'amounts': [format_kamas(a) for a in amounts],
            'amounts_raw': amounts,
            'total': format_kamas(total),
            'total_raw': total
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }