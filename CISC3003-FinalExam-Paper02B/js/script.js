document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
        }
    });
});
