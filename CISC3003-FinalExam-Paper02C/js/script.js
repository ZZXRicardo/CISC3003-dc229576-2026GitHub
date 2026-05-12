document.addEventListener('DOMContentLoaded', function () {
    const signup = document.querySelector('#signup-form');

    if (signup) {
        const email = signup.querySelector('#email');
        const emailHint = document.querySelector('#email-hint');

        email.addEventListener('blur', async function () {
            if (!email.validity.valid) {
                return;
            }

            const response = await fetch('php/check_email.php?email=' + encodeURIComponent(email.value));
            const result = await response.json();
            emailHint.textContent = result.available ? 'Email is available.' : 'Email is already registered.';
            emailHint.style.color = result.available ? '#1f7a4d' : '#b42318';
        });

        signup.addEventListener('submit', function (event) {
            const password = signup.querySelector('#password').value;
            const confirm = signup.querySelector('#password_confirm').value;

            if (password.length < 8) {
                event.preventDefault();
                alert('Password must contain at least 8 characters.');
                return;
            }

            if (password !== confirm) {
                event.preventDefault();
                alert('Passwords do not match.');
            }
        });
    }
});
