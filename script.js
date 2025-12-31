document.addEventListener('DOMContentLoaded', () => {
    const languageSelection = document.getElementById('language-selection');
    const chatContainer = document.querySelector('.chat-container');
    const langEnBtn = document.getElementById('lang-en');
    const langHiBtn = document.getElementById('lang-hi');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const chatBox = document.getElementById('chat-box');
    const settingsIcon = document.getElementById('settings-icon');
    const themeSelector = document.querySelector('.theme-selector');
    const themeOptions = document.querySelectorAll('.theme-option');

    const imageBtn = document.getElementById('image-btn');
    const imageInput = document.getElementById('image-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');

    let currentLanguage = 'en';
    let recognition;
    let isRecording = false;
    let imageBase64 = null;

    // Speech Recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    } else {
        micBtn.style.display = 'none';
        console.warn('Speech recognition not supported in this browser.');
    }

    micBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
            recognition.start();
        }
    });

    langEnBtn.addEventListener('click', () => setLanguage('en'));
    langHiBtn.addEventListener('click', () => setLanguage('hi'));

    imageBtn.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                imageBase64 = reader.result;
                imagePreview.src = imageBase64;
                imagePreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        imageBase64 = null;
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        imageInput.value = '';
    });

    function setLanguage(lang) {
        currentLanguage = lang;
        languageSelection.style.display = 'none';
        chatContainer.style.display = 'flex';
        const welcomeMessage = lang === 'en' ? 'Hello! I\'m here to listen. How are you feeling today?' : 'Namaste! Main yahan sunne ke liye hoon. Aap kaisa mehsoos kar rahe hain?';
        appendMessage(welcomeMessage, 'bot');
        speak(welcomeMessage);
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    settingsIcon.addEventListener('click', () => {
        themeSelector.style.display = themeSelector.style.display === 'none' ? 'flex' : 'none';
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            document.body.setAttribute('data-theme', option.dataset.theme);
        });
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '' && !imageBase64) return;

        appendMessage(message, 'user', imageBase64);
        userInput.value = '';

        const payload = {
            message,
            language: currentLanguage
        };

        if (imageBase64) {
            payload.image = imageBase64;
        }

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.response, 'bot');
            speak(data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessage = 'Sorry, something went wrong. Please try again later.';
            appendMessage(errorMessage, 'bot');
            speak(errorMessage);
        });

        if (imageBase64) {
            removeImageBtn.click();
        }
    }

    function appendMessage(message, sender, image = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);

        if (image) {
            const img = document.createElement('img');
            img.src = image;
            img.style.maxWidth = '200px';
            img.style.borderRadius = '10px';
            messageElement.appendChild(img);
        }

        if (message) {
            const p = document.createElement('p');
            p.textContent = message;
            messageElement.appendChild(p);
        }
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        speechSynthesis.speak(utterance);
    }
});
