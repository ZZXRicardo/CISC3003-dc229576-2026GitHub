document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {
        const consent = form.querySelector('input[name="consent"]');

        if (consent && !consent.checked) {
            event.preventDefault();
            alert('Please confirm the checkbox before submitting the form.');
        }
    });
});
