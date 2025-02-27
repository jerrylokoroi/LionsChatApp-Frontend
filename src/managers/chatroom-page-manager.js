import ChatroomApiService from '../api/chatroom-api-service.js';
import UIManager from '../ui/ui-manager.js';

class ChatroomPageManager {
    static connection = null;

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

        await this.loadChatroom(roomId, roomName, token);
        this.setupSignalRConnection(roomId, token);
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

        const sendMessageButton = document.getElementById('sendMessageButton');
        const messageInput = document.getElementById('messageInput');
        sendMessageButton.addEventListener('click', () => this.handleSendMessage(roomId, messageInput, token));
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessageButton.click();
        });

        this.setupSignalRConnection(roomId, token);
    }

    static async handleSendMessage(roomId, messageInput, token) {
        if (this.connection && this.connection.state !== signalR.HubConnectionState.Connected) {
            UIManager.showError('Cannot send message: Not connected to chat');
            return;
        }
    
        const message = messageInput.value.trim();
        
        if (message) {
            try {
                await ChatroomApiService.sendMessage(roomId, message, token);
                messageInput.value = '';
            } catch (error) {
                UIManager.showError(error.message);
            }
        }
    }

    static async setupSignalRConnection(roomId, token) {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7218/chatHub`, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

            this.connection.on('ReceiveMessage', (messageResponse) => {
                console.log("Message received from SignalR:", messageResponse);
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    const div = document.createElement('div');
                    div.classList.add('message');
                    div.textContent = `${messageResponse.userName}: ${messageResponse.text}`;
                    chatMessages.appendChild(div);
                } else {
                    console.error("chatMessages element not found when receiving message");
                }
            });

        this.connection.on('LoadMessages', (messages) => {
            console.log("Loaded messages from SignalR:", messages);
            UIManager.renderMessages(messages);
        });

        this.connection.start()
            .then(() => {
                console.log("SignalR connection established successfully");
                console.log(`Attempting to join chatroom ${roomId}`);
                return this.connection.invoke('JoinChatroom', roomId.toLowerCase());
            })
            .then(() => console.log(`Joined chatroom ${roomId}`))
            .catch(err => console.error('SignalR connection error:', err));
    }
}

export default ChatroomPageManager;