import ChatroomApiService from '../api/chatroom-api-service.js';
import UIManager from '../ui/ui-manager.js';

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

        UIManager.renderChatroomName(roomName);

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