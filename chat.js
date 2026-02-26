const GROQ_API_KEY = "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";
const MODEL_NAME = "llama-3.3-70b-versatile";

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
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: chatHistory,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        loadingMessage.innerHTML = aiResponse;
        chatHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error("Error calling Groq API:", error);
        loadingMessage.innerHTML = "Error connecting to AI. Please check your API key.";
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
