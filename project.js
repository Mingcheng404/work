document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    submitBtn.addEventListener('click', sendMessage);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImageUpload);
});

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
    }
    
    const preview = document.getElementById('imagePreview');
    const ocrResult = document.getElementById('ocrResult');
    const responseDiv = document.getElementById('response');
    
    // Clear previous results
    responseDiv.innerHTML = '';
    ocrResult.innerHTML = '<h4>Scanning Image...</h4><div class="progress-bar"><div class="progress" id="ocrProgress"></div></div>';
    
    // Show preview
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    
    try {
        const result = await Tesseract.recognize(
            file,
            'eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = document.getElementById('ocrProgress');
                        progress.style.width = `${m.progress * 100}%`;
                    }
                }
            }
        );
        
        const extractedText = result.data.text.trim();
        
        // Validate OCR result
        if (!isMeaningfulText(extractedText)) {
            ocrResult.innerHTML = `
                <h4>Scan Complete</h4>
                <p class="text-danger">No readable text found in image.</p>
                <p>Please try a clearer image with visible text</p>
            `;
            return;
        }
        
        // Display OCR results
        ocrResult.innerHTML = `
            <h4>Extracted Text:</h4>
            <div class="card bg-light p-3 mb-2">
                <p>${extractedText}</p>
            </div>
            <button class="btn btn-sm btn-info" id="useOcrText">Use this text</button>
        `;
        
        document.getElementById('useOcrText').addEventListener('click', () => {
            document.getElementById('userInput').value = extractedText;
            ocrResult.innerHTML += '<p class="text-success mt-2">✓ Text copied to input field</p>';
        });
        
    } catch (error) {
        ocrResult.innerHTML = `
            <p class="text-danger">Error scanning image: ${error.message}</p>
            <p>Please try a different image</p>
        `;
    }
}

function isMeaningfulText(text) {
    if (!text || text.length < 10) return false;
    
    // Count words with at least 3 letters
    const words = text.split(/\s+/).filter(word => word.length >= 3);
    
    // Check ratio of letters to symbols
    const letterRatio = text.replace(/[^a-zA-Z]/g, '').length / text.length;
    
    return words.length >= 2 && letterRatio > 0.3;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) {
        alert('Please enter some text or upload an image with text');
        return;
    }
    
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border text-primary mr-2"></div>
            <span>Processing your request...</span>
        </div>
    `;
    
    try {
        // IMPORTANT: In production, replace this with your backend endpoint
        const response = await fetch('sk-AjyTBfmjHsUi5CprmHv4qRdRU6PC0UmsmG7z4HHWEHUkmP0n', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        responseDiv.innerHTML = marked.parse(data.response);
        
    } catch (error) {
        console.error("Error:", error);
        responseDiv.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> ${error.message}
                <p>Please try again later</p>
            </div>
        `;
    }
}
