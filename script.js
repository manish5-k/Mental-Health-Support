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

    let currentLanguage = 'en';
    let recognition;
    let isRecording = false;

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
        if (message === '') return;

        appendMessage(message, 'user');
        userInput.value = '';

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, language: currentLanguage })
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
    }

    function appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        const p = document.createElement('p');
        p.textContent = message;
        messageElement.appendChild(p);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        speechSynthesis.speak(utterance);
    }
});