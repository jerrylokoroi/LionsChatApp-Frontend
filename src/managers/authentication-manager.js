import AuthenticationApiService from '../api/authentication-api-service.js';
import UIManager from '../ui/ui-manager.js';
import PasswordValidation from '../utils/password-validation.js';

class AuthenticationManager {
    static initRegistration() {
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }
    }

    static initLogin() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    static async handleRegistration(e) {
        e.preventDefault();
        UIManager.clearErrors();
    
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const confirmPassword = form.confirmPassword.value.trim();
    
        let hasErrors = false;
    
        const usernameError = PasswordValidation.validateUsername(username);
        if (usernameError) {
          document.getElementById('usernameError').textContent = usernameError;
          document.getElementById('usernameError').classList.add('error-message');
          hasErrors = true;
        }
    
        const passwordErrors = PasswordValidation.validatePassword(password, confirmPassword);
        if (passwordErrors.length > 0) {
          document.getElementById('passwordError').innerHTML = passwordErrors.map(err => `<li>${err}</li>`).join('');
          document.getElementById('passwordError').classList.add('error-message');
          hasErrors = true;
        }
    
        if (hasErrors) return;
    
        try {
          UIManager.toggleLoading(true, 'register');
          await AuthenticationApiService.registerUser(username, password);
          UIManager.showSuccess('Registration successful! Redirecting...');
          setTimeout(() => window.location.href = 'login.html', 2000);
        } catch (error) {
          UIManager.showError(error.message || 'Registration failed');
        } finally {
          UIManager.toggleLoading(false, 'register');
        }
      }

    static async handleLogin(e) {
        e.preventDefault();
        UIManager.clearErrors();

        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value.trim();

        const usernameError = PasswordValidation.validateUsername(username);
        if (usernameError) {
            document.getElementById('usernameError').textContent = usernameError;
            document.getElementById('usernameError').classList.add('error-message');
            return;
        }

        try {
            UIManager.toggleLoading(true, 'login');
            const { token, username: user, id, isAdmin } = await AuthenticationApiService.loginUser(username, password);
            localStorage.setItem('token', token);
            localStorage.setItem('username', user);
            localStorage.setItem('id', id);
            localStorage.setItem('isAdmin', isAdmin.toString());
            UIManager.showSuccess('Login successful! Redirecting...');
            setTimeout(() => window.location.href = 'welcome-room.html', 2000);
        } catch (error) {
            UIManager.showError(error.message || 'Login failed');
        } finally {
            UIManager.toggleLoading(false, 'login');
        }
    }
}

export default AuthenticationManager;