class PasswordVisibility {
    static init() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const input = this.closest('.form-group').querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
                this.classList.toggle('active');
            });
        });
    }
}
window.togglePasswordVisibility = PasswordVisibility.togglePasswordVisibility;
