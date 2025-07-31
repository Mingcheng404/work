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
    
    const preview = document.getElementById('imagePreview');
    const ocrResult = document.getElementById('ocrResult');
    const responseDiv = document.getElementById('response');
    
    // Clear previous results
    responseDiv.innerHTML = '';
    ocrResult.innerHTML = '<h3>Scanning Image...</h3><div class="progress-bar"><div class="progress" id="ocrProgress"></div></div>';
    
    // Show preview
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    
    try {
        // Use Tesseract.js for OCR
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
        
        // Display OCR results
        ocrResult.innerHTML = `
            <h3>Text from Image:</h3>
            <p>${result.data.text}</p>
            <button class="btn btn-sm btn-info" id="useOcrText">Use this text for AI</button>
        `;
        
        // Add event listener to use OCR text
        document.getElementById('useOcrText').addEventListener('click', () => {
            document.getElementById('userInput').value = result.data.text;
            ocrResult.innerHTML += '<p class="text-success mt-2">Text copied to input field. Click "Submit Text" to send to AI.</p>';
        });
        
    } catch (error) {
        ocrResult.innerHTML = `<p class="text-danger">Error scanning image: ${error.message}</p>`;
    }
}

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) {
        alert('Please enter a question or upload an image');
        return;
    }
    
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = 'Waiting for AI response...';
    
    // Note: API keys should NEVER be exposed in client-side code
    // This is just for demonstration - in production, use a backend service
    const apiUrl = "https://api.just2chat.cn/v1/chat/completions";
    const apiKey = "sk-AjyTBfmjHsUi5CprmHv4qRdRU6PC0UmsmG7z4HHWEHUkmP0n";
    
    const requestData = {
        model: "deepseek-v3",
        messages: [{
            role: "user",
            content: userInput
        }],
        stream: true
    };
    
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullResponse = '';
        
        function readStream() {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    return;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                try {
                    // Process each line (streaming responses often come as multiple chunks)
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') return;
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices && parsed.choices[0].delta.content) {
                                    fullResponse += parsed.choices[0].delta.content;
                                    responseDiv.innerHTML = marked.parse(fullResponse);
                                }
                            } catch (e) {
                                console.error('Error parsing JSON:', e);
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error processing chunk:', e);
                }
                
                return readStream();
            });
        }
        
        return readStream();
    })
    .catch(error => {
        console.error("Request error:", error);
        responseDiv.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    });
}
