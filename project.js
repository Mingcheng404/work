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

// Sample user data
const users = [
    { email: 'user@example.com', password: 'password123', name: 'John Doe', avatar: 'JD' },
    { email: 'doctor@example.com', password: 'securepass', name: 'Dr. Smith', avatar: 'DS' }
];

// Current user
let currentUser = null;

// Login function
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        showApp();
        return true;
    }
    return false;
}

// Google login simulation
function googleLogin() {
    currentUser = {
        name: 'Google User',
        avatar: 'GU',
        email: 'googleuser@example.com'
    };
    showApp();
}

// Show main application
function showApp() {
    loginPage.style.display = 'none';
    appContainer.style.display = 'block';
    userAvatar.textContent = currentUser.avatar;
}

// Logout function
function logout() {
    currentUser = null;
    appContainer.style.display = 'none';
    loginPage.style.display = 'flex';
    // Clear input fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    // Clear response
    response.style.display = 'none';
    responseContent.innerHTML = '';
}

// Simulate AI response
function generateAIResponse(question) {
    // This is a mock response - in a real app, this would come from an API
    const responses = {
        "headache": {
            title: "Headache Relief Recommendations",
            content: `<p>For headache relief, consider the following over-the-counter options:</p>
            <h3>Common Medications:</h3>
            <ul>
                <li><strong>Acetaminophen (Tylenol)</strong>: 500-1000mg every 4-6 hours as needed</li>
                <li><strong>Ibuprofen (Advil, Motrin)</strong>: 200-400mg every 4-6 hours as needed</li>
                <li><strong>Aspirin</strong>: 325-650mg every 4 hours as needed</li>
                <li><strong>Naproxen (Aleve)</strong>: 220mg every 8-12 hours as needed</li>
            </ul>
            <h3>Recommendations:</h3>
            <ul>
                <li>Stay hydrated and rest in a quiet, dark room</li>
                <li>Apply a cold compress to your forehead</li>
                <li>Consider caffeine in moderation, which can sometimes help with headaches</li>
            </ul>
            <p><strong>Important:</strong> Consult a doctor if headaches are severe, persistent, or accompanied by other symptoms.</p>`
        },
        "allergy": {
            title: "Allergy Relief Recommendations",
            content: `<p>For allergy symptoms, consider these options:</p>
            <h3>Common Medications:</h3>
            <ul>
                <li><strong>Loratadine (Claritin)</strong>: 10mg once daily</li>
                <li><strong>Cetirizine (Zyrtec)</strong>: 5-10mg once daily</li>
                <li><strong>Fexofenadine (Allegra)</strong>: 180mg once daily</li>
                <li><strong>Diphenhydramine (Benadryl)</strong>: 25-50mg every 4-6 hours (may cause drowsiness)</li>
            </ul>
            <h3>Recommendations:</h3>
            <ul>
                <li>Use saline nasal sprays to relieve congestion</li>
                <li>Keep windows closed during high pollen seasons</li>
                <li>Shower after being outdoors to remove pollen</li>
            </ul>
            <p><strong>Note:</strong> Consult with a healthcare provider for persistent allergy symptoms.</p>`
        },
        "cold": {
            title: "Cold Symptom Relief",
            content: `<p>For cold symptoms, consider these approaches:</p>
            <h3>Symptom Relief Options:</h3>
            <ul>
                <li><strong>Decongestants (Pseudoephedrine)</strong>: For nasal congestion (use with caution if you have high blood pressure)</li>
                <li><strong>Guaifenesin (Mucinex)</strong>: 200-400mg every 4 hours for chest congestion</li>
                <li><strong>Dextromethorphan (Robitussin DM)</strong>: For cough suppression</li>
                <li><strong>Pain relievers</strong>: Acetaminophen or ibuprofen for body aches and fever</li>
            </ul>
            <h3>Self-care Recommendations:</h3>
            <ul>
                <li>Get plenty of rest and stay hydrated</li>
                <li>Use a humidifier to ease congestion</li>
                <li>Gargle with warm salt water for sore throat</li>
            </ul>
            <p><strong>Important:</strong> See a doctor if symptoms last more than 10 days or if you have difficulty breathing.</p>`
        },
        "default": {
            title: "Medication Information",
            content: `<p>Based on your query, here are some general recommendations:</p>
            <h3>Important Considerations:</h3>
            <ul>
                <li>Always consult with a healthcare professional before starting any new medication</li>
                <li>Disclose all current medications to avoid interactions</li>
                <li>Follow dosage instructions carefully</li>
                <li>Be aware of potential side effects</li>
            </ul>
            <h3>Common Medication Categories:</h3>
            <ul>
                <li><strong>Pain Relief:</strong> Acetaminophen, NSAIDs (ibuprofen, naproxen)</li>
                <li><strong>Allergy:</strong> Antihistamines (loratadine, cetirizine)</li>
                <li><strong>Digestive Issues:</strong> Antacids, H2 blockers, proton pump inhibitors</li>
                <li><strong>Skin Conditions:</strong> Topical corticosteroids, antifungals</li>
            </ul>
            <p>For more specific recommendations, please describe your symptoms in more detail.</p>`
        }
    };
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("headache") || lowerQuestion.includes("migraine")) {
        return responses.headache;
    } else if (lowerQuestion.includes("allerg") || lowerQuestion.includes("hay fever")) {
        return responses.allergy;
    } else if (lowerQuestion.includes("cold") || lowerQuestion.includes("flu")) {
        return responses.cold;
    } else {
        return responses.default;
    }
}

// Handle medication suggestion request
function getMedicationSuggestion() {
    const question = userInput.value.trim();
    if (!question) {
        alert('Please enter your question or symptoms');
        return;
    }
    
    // Show loader
    loader.style.display = 'block';
    response.style.display = 'none';
    
    // Simulate API delay
    setTimeout(() => {
        const aiResponse = generateAIResponse(question);
        
        // Update response content
        document.querySelector('.response-header h3').textContent = aiResponse.title;
        responseContent.innerHTML = aiResponse.content;
        
        // Hide loader, show response
        loader.style.display = 'none';
        response.style.display = 'block';
        
        // Clear input
        userInput.value = '';
    }, 2000);
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
    alert('Sign up functionality would be implemented here. For this demo, use:\nEmail: user@example.com\nPassword: password123');
});

logoutBtn.addEventListener('click', logout);

submitBtn.addEventListener('click', getMedicationSuggestion);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getMedicationSuggestion();
    }
});

// Initialize the page to show login
window.addEventListener('DOMContentLoaded', () => {
    loginPage.style.display = 'flex';
    appContainer.style.display = 'none';
});
