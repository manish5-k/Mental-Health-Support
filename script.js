document.addEventListener('DOMContentLoaded', () => {
    const languageSelection = document.getElementById('language-selection');
    const chatContainer = document.querySelector('.chat-container');
    const langEnBtn = document.getElementById('lang-en');
    const langHiBtn = document.getElementById('lang-hi');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatBox = document.getElementById('chat-box');
    const settingsIcon = document.getElementById('settings-icon');
    const themeSelector = document.querySelector('.theme-selector');
    const themeOptions = document.querySelectorAll('.theme-option');

    let currentLanguage = 'en';

    langEnBtn.addEventListener('click', () => setLanguage('en'));
    langHiBtn.addEventListener('click', () => setLanguage('hi'));

    function setLanguage(lang) {
        currentLanguage = lang;
        languageSelection.style.display = 'none';
        chatContainer.style.display = 'flex';
        const welcomeMessage = lang === 'en' ? 'Hello! I\'m here to listen. How are you feeling today?' : 'Namaste! Main yahan sunne ke liye hoon. Aap kaisa mehsoos kar rahe hain?';
        appendMessage(welcomeMessage, 'bot');
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
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('Sorry, something went wrong. Please try again later.', 'bot');
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
});