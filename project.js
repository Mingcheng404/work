document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', sendMessage);
});

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) {
        alert('Please enter a question');
        return;
    }
    
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = 'Waiting for response...';
    
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
        responseDiv.innerHTML = `Error: ${error.message}`;
    });
}