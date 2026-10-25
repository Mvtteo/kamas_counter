const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const processBtn = document.getElementById('processBtn');
const results = document.getElementById('results');
const loader = document.getElementById('loader');
const uploadContent = document.querySelector('.upload-content');

let currentImageData = null;

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Merci de selectionner une image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        preview.src = currentImageData;
        preview.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        processBtn.classList.remove('hidden');
        results.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

processBtn.addEventListener('click', async () => {
    if (!currentImageData) return;
    
    processBtn.classList.add('hidden');
    results.classList.add('hidden');
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: currentImageData })
        });
        const result = await response.json();
        displayResults(result);
    } catch (error) {
        alert('Erreur: ' + error);
    }
    
    loader.classList.add('hidden');
    processBtn.classList.remove('hidden');
});

function displayResults(result) {
    if (!result.success) {
        alert('Erreur: ' + result.error);
        return;
    }
    
    document.getElementById('totalValue').textContent = result.total;
    document.getElementById('rawText').textContent = result.raw_text;
    
    const list = document.getElementById('amountsList');
    list.innerHTML = '';
    
    result.amounts.forEach((amount, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>#${i + 1}</span><span class="kamas">${amount} K</span>`;
        list.appendChild(li);
    });
    
    if (result.amounts.length === 0) {
        list.innerHTML = '<li style="color:#666">Aucun montant detecte</li>';
    }
    
    results.classList.remove('hidden');
}