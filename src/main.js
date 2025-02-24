import AuthenticationManager from './managers/authentication-manager.js';
import ChatroomPageManager from './managers/chatroom-page-manager.js';
import WelcomeRoomManager from './managers/welcome-room-manager.js';
import UIManager from './ui/ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'login.html';

    switch (currentPage) {
        case 'register.html':
            AuthenticationManager.initRegistration();
            UIManager.initPasswordToggle();
            break;
        case 'login.html':
            AuthenticationManager.initLogin();
            UIManager.initPasswordToggle();
            break;
        case 'welcome-room.html':
            WelcomeRoomManager.init();
            break;
        case 'chatroom.html':
            ChatroomPageManager.init();
            break;
        default:
            console.log('Unknown page:', currentPage);
    }
});