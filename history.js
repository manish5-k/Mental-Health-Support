const historyTab = document.getElementById("history-tab");
const chatTab = document.getElementById("chat-tab");
const historyContainer = document.getElementById("history-container");
const chatBox = document.getElementById('chat-box');


historyTab.addEventListener("click", () => {
    chatBox.style.display = "none";
    historyContainer.style.display = "block";
    historyTab.classList.add("active");
    chatTab.classList.remove("active");
    loadChatHistory();
});

chatTab.addEventListener("click", () => {
    chatBox.style.display = "block";
    historyContainer.style.display = "none";
    chatTab.classList.add("active");
    historyTab.classList.remove("active");
});

async function loadChatHistory() {
    try {
        const response = await fetch('/history');
        const history = await response.json();

        if (history.length === 0) {
            historyContainer.innerHTML = "<p>No chat history found.</p>";
            return;
        }

        let historyHTML = "<ul>";
        history.forEach(item => {
            historyHTML += `<li><strong>You:</strong> ${item.user_message}</li>`;
            historyHTML += `<li><strong>Bot:</strong> ${item.bot_response}</li>`;
        });
        historyHTML += "</ul>";
        historyContainer.innerHTML = historyHTML;

    } catch (error) {
        console.error("Error loading chat history:", error);
        historyContainer.innerHTML = "<p>Error loading chat history.</p>";
    }
}
