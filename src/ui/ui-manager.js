import ChatroomApiService from '../api/chatroom-api-service.js';

class UIManager {
    static clearErrors() {
        const errorElements = [
            document.getElementById('usernameError'),
            document.getElementById('passwordError'),
            document.getElementById('confirmPasswordError'),
            document.getElementById('message')
        ];
        errorElements.forEach(el => {
            if (el) {
                el.textContent = '';
                el.className = '';
            }
        });
    }

    static showError(message) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.classList.add('error-message');
        }
    }

    static showSuccess(message) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.classList.add('success-message');
        }
    }

    static toggleLoading(isLoading, formType) {
        const button = formType === "register" ? document.getElementById('submitButton') : document.getElementById('loginButton');
        const buttonText = document.getElementById('buttonText');
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (button && buttonText && loadingSpinner) {
            button.disabled = isLoading;
            buttonText.textContent = isLoading
                ? (formType === "register" ? "Registering..." : "Logging in...")
                : (formType === "register" ? "Register" : "Login");
            loadingSpinner.style.display = isLoading ? "inline-block" : "none";
        }
    }

    static renderWelcomeMessage(username) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${username} to Lions Chat App!`;
    }

    static renderAdminStatus(isAdmin) {
        const adminStatus = document.getElementById('adminStatus');
        if (adminStatus) adminStatus.textContent = isAdmin ? 'You are an admin.' : 'You are not an admin.';
    }

    static renderChatrooms(chatrooms, isAdmin) {
        const chatRoomList = document.getElementById('chatRoomList');
        if (!chatRoomList) return;
        chatRoomList.innerHTML = '';

        if (chatrooms.length === 0) {
            const noChatroomsMessage = document.createElement('li');
            noChatroomsMessage.textContent = 'No chatrooms available';
            chatRoomList.appendChild(noChatroomsMessage);
        } else {
            chatrooms.forEach(room => {
                const li = document.createElement('li');
                const nameSpan = document.createElement('span');
                nameSpan.textContent = room.name;
                li.appendChild(nameSpan);
                li.dataset.id = room.id;

                if (isAdmin) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.classList.add('delete-btn');
                    li.appendChild(deleteButton);
                }

                chatRoomList.appendChild(li);
            });
        }

        if (isAdmin) {
            const addButton = document.createElement('button');
            addButton.textContent = 'Add Chatroom';
            addButton.classList.add('add-btn');
            addButton.addEventListener('click', async () => {
                const name = prompt('Enter new chatroom name:');
                if (name) {
                    const token = localStorage.getItem('token');
                    const createdBy = localStorage.getItem('id');
                    await ChatroomApiService.addChatroom(name, createdBy, token);
                    const updatedChatrooms = await ChatroomApiService.fetchChatrooms(token);
                    UIManager.renderChatrooms(updatedChatrooms, isAdmin);
                }
            });
            chatRoomList.appendChild(addButton);
        }

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Logout';
        logoutButton.classList.add('logout-btn');
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
        chatRoomList.appendChild(logoutButton);

        chatRoomList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const roomId = li.dataset.id;
                const roomName = li.querySelector('span').textContent;
                window.location.href = `chatroom.html?roomId=${roomId}&roomName=${encodeURIComponent(roomName)}`;
            });

            if (isAdmin) {
                const deleteButton = li.querySelector('.delete-btn');
                if (deleteButton) {
                    deleteButton.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const confirmed = confirm('Are you sure you want to delete this chatroom?');
                        if (confirmed) {
                            const token = localStorage.getItem('token');
                            await ChatroomApiService.deleteChatroom(li.dataset.id, token);
                            const updatedChatrooms = await ChatroomApiService.fetchChatrooms(token);
                            UIManager.renderChatrooms(updatedChatrooms, isAdmin);
                        }
                    });
                }
            }
        });
    }

    static async loadChatroom(roomId, roomName) {
        const chatSection = document.getElementById("chatSection");
        chatSection.innerHTML = `
            <h2>${roomName}</h2>
            <div id="chatMessages" class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Type a message..." autocomplete="off" autocorrect="off" spellcheck="false">
                <button id="sendMessageButton"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        await this.fetchMessages(roomId);

        const sendMessageButton = document.getElementById("sendMessageButton");
        const messageInput = document.getElementById("messageInput");

        sendMessageButton.addEventListener("click", () => {
            const message = messageInput.value.trim();
            if (message) {
                this.sendMessage(roomId, message);
                messageInput.value = "";
            }
        });

        messageInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                sendMessageButton.click();
            }
        });
    }

    static renderChatroomName(roomName) {
        const chatRoomName = document.getElementById('chatRoomName') || document.querySelector('.chat-section h2');
        if (chatRoomName) chatRoomName.textContent = roomName;
    }

    static renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
    
        const currentUserId = localStorage.getItem('id');
        let lastDate = null;
        chatMessages.innerHTML = '';
    
        messages.forEach(msg => {
            const messageDate = new Date(msg.createdAt).toLocaleDateString();
    
            if (messageDate !== lastDate) {
                const dateHeader = document.createElement('div');
                dateHeader.classList.add('date-header');
                dateHeader.textContent = messageDate;
                chatMessages.appendChild(dateHeader);
                lastDate = messageDate;
            }
    
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            const isSent = msg.userId === currentUserId;
            if (isSent) {
                messageDiv.classList.add('sent');
            } else {
                messageDiv.classList.add('received');
                const usernameSpan = document.createElement('span');
                usernameSpan.classList.add('username');
                usernameSpan.textContent = msg.userName;
                messageDiv.appendChild(usernameSpan);
            }
    
            const textSpan = document.createElement('span');
            textSpan.classList.add('text');
            textSpan.textContent = msg.text;
            messageDiv.appendChild(textSpan);
    
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('time');
            timeSpan.textContent = new Date(msg.createdAt).toLocaleTimeString();
            messageDiv.appendChild(timeSpan);
    
            chatMessages.appendChild(messageDiv);
        });
    }

    static initPasswordToggle() {
        const toggles = document.querySelectorAll('.password-toggle');
        if (toggles.length === 0) return;

        toggles.forEach(toggle => {
            toggle.addEventListener('click', function () {
                const input = this.closest('.form-group').querySelector('input');
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    this.classList.toggle('active');
                }
            });
        });
    }
}

export default UIManager;