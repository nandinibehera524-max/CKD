let chatHistory = [
    {
        role: "system",
        content: `You are a specialized Kidney Health AI assistant for the CKD Risk Assessment tool. 
        Your goal is to explain CKD concepts, interpret clinical markers like creatinine and albumin, and provide health advice. 
        Keep responses concise, professional, and always include a medical disclaimer.`
    }
];

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        document.getElementById('chat-input').focus();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';
    chatHistory.push({ role: "user", content: message });

    const loadingMessage = appendMessage('ai', 'Thinking...');

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: chatHistory
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        loadingMessage.innerHTML = aiResponse;
        chatHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error("Error calling chat API:", error);
        loadingMessage.innerHTML = "Error connecting to AI. Please try again later.";
    }
}

function appendMessage(role, text) {
    const messageContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = text;
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    return messageDiv;
}

function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}
