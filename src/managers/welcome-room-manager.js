import SidebarManager from '../managers/sidebar-manager.js';
import UIManager from '../ui/ui-manager.js';
import ChatroomPageManager from '../managers/chatroom-page-manager.js';

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

        await SidebarManager.renderSidebar(token, isAdmin, (roomId, roomName) => {
            WelcomeRoomManager.navigateToChatroom(roomId, roomName, token);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('roomId');
        const roomName = decodeURIComponent(urlParams.get('roomName') || '');

        if (roomId && roomName) {
            WelcomeRoomManager.navigateToChatroom(roomId, roomName, token);
        } else {
            UIManager.showError('No chatroom selected');
        }
    }

    static navigateToChatroom(roomId, roomName, token) {
        ChatroomPageManager.loadChatroom(roomId, roomName, token);
        SidebarManager.renderSidebar(token, localStorage.getItem('isAdmin') === 'true', (newRoomId, newRoomName) => {
            WelcomeRoomManager.navigateToChatroom(newRoomId, newRoomName, token);
        });
    }
}

export default WelcomeRoomManager;