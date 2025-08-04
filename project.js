// DOM Elements
const loginPage = document.getElementById('loginPage');
const appContainer = document.getElementById('appContainer');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const signupLink = document.getElementById('signupLink');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const submitBtn = document.getElementById('submitBtn');
const userInput = document.getElementById('userInput');
const response = document.getElementById('response');
const responseContent = document.getElementById('responseContent');
const loader = document.getElementById('loader');
const translateBtn = document.getElementById('translateBtn');

// User accounts (in a real app, this would be stored on a server)
let users = JSON.parse(localStorage.getItem('medai_users')) || [
    { 
        id: 1, 
        email: 'user@example.com', 
        password: 'password123', 
        name: 'John Doe', 
        avatar: 'JD',
        history: [] 
    },
    { 
        id: 2, 
        email: 'doctor@example.com', 
        password: 'securepass', 
        name: 'Dr. Smith', 
        avatar: 'DS',
        history: [] 
    }
];

// Current user
let currentUser = null;

// Initialize local storage
function initLocalStorage() {
    if (!localStorage.getItem('medai_users')) {
        localStorage.setItem('medai_users', JSON.stringify(users));
    }
}

// Login function
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('medai_lastUser', user.email);
        showApp();
        return true;
    }
    return false;
}

// Google login simulation
function googleLogin() {
    const googleUser = {
        id: Date.now(),
        name: 'Google User',
        avatar: 'GU',
        email: 'googleuser@example.com',
        history: []
    };
    
    // Add to users if not exists
    const existingUser = users.find(u => u.email === googleUser.email);
    if (!existingUser) {
        users.push(googleUser);
        localStorage.setItem('medai_users', JSON.stringify(users));
    }
    
    currentUser = googleUser;
    localStorage.setItem('medai_lastUser', googleUser.email);
    showApp();
}

// Show main application
function showApp() {
    userAvatar.textContent = currentUser.avatar;
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('medai_lastUser');
    appContainer.style.display = 'none';
    loginPage.style.display = 'flex';
    // Clear input fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    // Clear response
    response.style.display = 'none';
    responseContent.innerHTML = '';
}

// Real AI integration
function getMedicationSuggestion() {
    const question = userInput.value.trim();
    if (!question) {
        alert('Please enter your question or symptoms');
        return;
    }
    
    // Add to user history
    currentUser.history.push({
        question,
        timestamp: new Date().toISOString()
    });
    
    // Update users in localStorage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('medai_users', JSON.stringify(users));
    }
    
    // Use real AI API
    sendMessage(question);
}

// Real AI API call
function sendMessage(question) {
    const apiUrl = "https://api.just2chat.cn/v1/chat/completions";
    const apiKey = "sk-AjyTBfmjHsUi5CprmHv4qRdRU6PC0UmsmG7z4HHWEHUkmP0n";
    
    const requestData = {
        model: "deepseek-v3",
        messages: [{
            role: "system",
            content: "You are a helpful medical assistant specialized in providing medication recommendations. Provide detailed, accurate, and safe medication suggestions based on the user's symptoms. Always include important safety information and remind users to consult with healthcare professionals. Format your response in markdown."
        }, {
            role: "user",
            content: question
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
                    // Hide loader and show response
                    loader.style.display = 'none';
                    
                    // Add to user history
                    currentUser.history[currentUser.history.length - 1].response = fullResponse;
                    
                    // Update users in localStorage
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    if (userIndex !== -1) {
                        users[userIndex] = currentUser;
                        localStorage.setItem('medai_users', JSON.stringify(users));
                    }
                    
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
                                    responseContent.innerHTML = marked.parse(fullResponse);
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
        loader.style.display = 'none';
        response.style.display = 'block';
        responseContent.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    });
}

// Translate content to Chinese
function translateContent() {
    const content = responseContent.innerText;
    if (!content) return;
    
    // Show loading indicator on button
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
    translateBtn.disabled = true;
    
    // Simple translation service (in a real app, use a proper translation API)
    const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(content)}&langpair=en|zh-CN`;
    
    fetch(translationUrl)
    .then(response => response.json())
    .then(data => {
        if (data.responseData && data.responseData.translatedText) {
            responseContent.innerHTML = marked.parse(data.responseData.translatedText);
            translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate to English';
            translateBtn.onclick = translateToEnglish;
        } else {
            alert('Translation failed. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again later.');
    })
    .finally(() => {
        translateBtn.disabled = false;
    });
}

// Translate content back to English
function translateToEnglish() {
    const content = responseContent.innerText;
    if (!content) return;
    
    // Show loading indicator on button
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
    translateBtn.disabled = true;
    
    // Simple translation service
    const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(content)}&langpair=zh-CN|en`;
    
    fetch(translationUrl)
    .then(response => response.json())
    .then(data => {
        if (data.responseData && data.responseData.translatedText) {
            responseContent.innerHTML = marked.parse(data.responseData.translatedText);
            translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate to Chinese';
            translateBtn.onclick = translateContent;
        } else {
            alert('Translation failed. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again later.');
    })
    .finally(() => {
        translateBtn.disabled = false;
    });
}

// Event Listeners
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    if (login(email, password)) {
        showApp();
    } else {
        alert('Invalid email or password');
    }
});

googleLoginBtn.addEventListener('click', googleLogin);
signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Enter your email:');
    if (!email) return;
    
    const password = prompt('Create a password:');
    if (!password) return;
    
    const name = prompt('Enter your name:');
    if (!name) return;
    
    const newUser = {
        id: Date.now(),
        email,
        password,
        name,
        avatar: name.split(' ').map(n => n[0]).join(''),
        history: []
    };
    
    users.push(newUser);
    localStorage.setItem('medai_users', JSON.stringify(users));
    
    alert('Account created successfully! Please sign in with your new credentials.');
});

logoutBtn.addEventListener('click', logout);

submitBtn.addEventListener('click', getMedicationSuggestion);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getMedicationSuggestion();
    }
});

translateBtn.addEventListener('click', translateContent);

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    initLocalStorage();
    loginPage.style.display = 'flex';
    appContainer.style.display = 'none';
    
    // Check if user is already logged in (simulate session)
    const lastUserEmail = localStorage.getItem('medai_lastUser');
    if (lastUserEmail) {
        const user = users.find(u => u.email === lastUserEmail);
        if (user) {
            currentUser = user;
            showApp();
        }
    }
});




