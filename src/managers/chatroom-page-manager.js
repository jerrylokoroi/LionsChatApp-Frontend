import ChatroomApiService from '../api/chatroom-api-service.js';
import UIManager from '../ui/ui-manager.js';
import WelcomeRoomManager from '../managers/welcome-room-manager.js';

class ChatroomPageManager {
    static async init() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('roomId');
        const roomName = decodeURIComponent(urlParams.get('roomName') || '');

        if (!roomId) {
            UIManager.showError('No chatroom selected');
            return;
        }

        WelcomeRoomManager.navigateToChatroom(roomId, roomName, token);
    }

    static async loadChatroom(roomId, roomName, token) {
        const chatSection = document.getElementById('chatSection');
        if (!chatSection) {
            console.error('chatSection element not found');
            UIManager.showError('Error: Chat section not found on the page.');
            return;
        }

        chatSection.innerHTML = `
            <h2>${roomName}</h2>
            <div id="chatMessages" class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Type a message...">
                <button id="sendMessageButton">Send</button>
            </div>
        `;

        try {
            const messages = await ChatroomApiService.fetchMessages(roomId, token);
            UIManager.renderMessages(messages);

            const sendMessageButton = document.getElementById('sendMessageButton');
            const messageInput = document.getElementById('messageInput');
            sendMessageButton.addEventListener('click', () => this.handleSendMessage(roomId, messageInput, token));
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessageButton.click();
            });
        } catch (error) {
            UIManager.showError(error.message);
        }
    }

    static async handleSendMessage(roomId, messageInput, token) {
        const message = messageInput.value.trim();
        if (message) {
            try {
                await ChatroomApiService.sendMessage(roomId, message, token);
                messageInput.value = '';
                const messages = await ChatroomApiService.fetchMessages(roomId, token);
                UIManager.renderMessages(messages);
            } catch (error) {
                UIManager.showError(error.message);
            }
        }
    }
}

export default ChatroomPageManager; 