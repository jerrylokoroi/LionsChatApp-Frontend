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

document.addEventListener('DOMContentLoaded', () => {
    PasswordVisibility.init();
  });