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
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        await SidebarManager.renderSidebar(token, isAdmin, (id, name) => {
            window.location.href = `chatroom.html?roomId=${id}&roomName=${encodeURIComponent(name)}`;
        });
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
                <input type="text" id="messageInput" placeholder="Type a message..." autocomplete="off" autocorrect="off" spellcheck="false">
                <button id="sendMessageButton"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        const sendMessageButton = document.getElementById('sendMessageButton');
        const messageInput = document.getElementById('messageInput');
        sendMessageButton.addEventListener('click', () => this.handleSendMessage(roomId, messageInput, token));
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessageButton.click();
        });

        await this.setupSignalRConnection(roomId, token);
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
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                let lastDate = null;
                const lastChild = chatMessages.lastElementChild;
                if (lastChild && lastChild.classList.contains('date-header')) {
                    lastDate = lastChild.textContent;
                } else if (lastChild && lastChild.classList.contains('message')) {
                    const timeSpan = lastChild.querySelector('.time');
                    if (timeSpan) {
                        lastDate = new Date(timeSpan.dataset.timestamp).toLocaleDateString();
                    }
                }

                const currentDate = new Date(messageResponse.createdAt).toLocaleDateString();

                const existingDateHeader = Array.from(chatMessages.getElementsByClassName('date-header'))
                    .find(header => header.textContent === currentDate);

                if (!existingDateHeader && currentDate !== lastDate) {
                    const dateHeader = document.createElement('div');
                    dateHeader.classList.add('date-header');
                    dateHeader.textContent = currentDate;
                    chatMessages.appendChild(dateHeader);
                }

                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message');
                const isSent = messageResponse.userName === localStorage.getItem('username');
                if (isSent) {
                    messageDiv.classList.add('sent');
                } else {
                    messageDiv.classList.add('received');
                    const usernameSpan = document.createElement('span');
                    usernameSpan.classList.add('username');
                    usernameSpan.textContent = messageResponse.userName;
                    messageDiv.appendChild(usernameSpan);
                }

                const textSpan = document.createElement('span');
                textSpan.classList.add('text');
                textSpan.textContent = messageResponse.text;
                messageDiv.appendChild(textSpan);

                const timeSpan = document.createElement('span');
                timeSpan.classList.add('time');
                timeSpan.textContent = new Date(messageResponse.createdAt).toLocaleTimeString();
                timeSpan.dataset.timestamp = messageResponse.createdAt;
                messageDiv.appendChild(timeSpan);

                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });

        this.connection.on('LoadMessages', (messages) => {
            console.log("Loaded messages from SignalR:", messages);
            UIManager.renderMessages(messages);
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });

        this.connection.on('UserJoined', (userName) => {
            console.log(`UserJoined event received: ${userName}`);
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const div = document.createElement('div');
                div.classList.add('message', 'system');
                div.textContent = `${userName} has joined the chatroom.`;
                chatMessages.appendChild(div);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                console.error('chatMessages element not found');
            }
        });

        this.connection.on('UserLeft', (userName) => {
            console.log("UserJoined left received:", userName);
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const div = document.createElement('div');
                div.classList.add('message', 'system');
                div.textContent = `${userName} has left the chatroom.`;
                chatMessages.appendChild(div);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                console.error("chatMessages element not found when receiving user left message");
            }
        });

        this.connection.start()
            .then(() => {
                console.log("SignalR connection established successfully");
                console.log(`Attempting to join chatroom ${roomId}`);
                return this.connection.invoke('JoinChatroom', roomId.toLowerCase());
            })
            .then(() => {
                console.log(`Joined chatroom ${roomId}`);
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            })
            .catch(err => console.error('SignalR connection error:', err));
    }
}

export default ChatroomPageManager;