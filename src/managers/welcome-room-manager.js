import ChatroomApiService from '../api/chatroom-api-service.js';
import UIManager from '../ui/ui-manager.js';

class WelcomeRoomManager {
    static async init() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const username = localStorage.getItem('username');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        UIManager.renderWelcomeMessage(username);
        UIManager.renderAdminStatus(isAdmin);

        try {
            const chatrooms = await ChatroomApiService.fetchChatrooms(token);
            UIManager.renderChatrooms(chatrooms, isAdmin);

            const chatRoomList = document.getElementById('chatRoomList');
            chatRoomList.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', () => {
                    window.location.href = `chatroom.html?roomId=${li.dataset.id}&roomName=${encodeURIComponent(li.textContent)}`;
                });
                if (isAdmin) {
                    const deleteButton = li.querySelector('.delete-btn');
                    if (deleteButton) {
                        deleteButton.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            await ChatroomApiService.deleteChatroom(li.dataset.id, token);
                            this.init();
                        });
                    }
                }
            });

            if (isAdmin) {
                chatRoomList.querySelector('.add-btn').addEventListener('click', async () => {
                    const name = prompt('Enter new chatroom name:');
                    if (name) {
                        await ChatroomApiService.addChatroom(name, localStorage.getItem('id'), token);
                        this.init();
                    }
                });
            }

            document.getElementById('logoutButton').addEventListener('click', () => {
                localStorage.clear();
                window.location.href = 'login.html';
            });
        } catch (error) {
            UIManager.showError(error.message);
        }
    }
}

export default WelcomeRoomManager;