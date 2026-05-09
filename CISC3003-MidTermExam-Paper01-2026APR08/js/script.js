// DOM Elements for form switching
const container = document.getElementById('container');
const signUpBtn = document.getElementById('signUp');
const signInBtn = document.getElementById('signIn');

// Password toggle elements
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Form submission elements
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');

// Form Switching Functionality - Vector M Tutorial implementation
signUpBtn.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInBtn.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// Password Visibility Toggle
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const icon = this;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Form Validation and Submission - Sign In
signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value.trim();
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate successful sign in
    console.log('Sign In Attempt:', { email, password });
    alert('Sign In successful! (Demo)');
    
    // In a real application, you would send data to server here
    // this.submit();
});

// Form Validation and Submission - Sign Up
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm').value.trim();
    const termsChecked = document.querySelector('#signup-form input[type="checkbox"]').checked;
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (!termsChecked) {
        alert('You must agree to the Terms & Conditions.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Password strength (basic)
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    // Simulate successful sign up
    console.log('Sign Up Attempt:', { name, email, password });
    alert('Account created successfully! (Demo)');
    
    // Switch to sign in form after successful registration
    container.classList.remove('right-panel-active');
    
    // Clear form (optional)
    // this.reset();
});

// Input field focus effects
const inputGroups = document.querySelectorAll('.input-group');
inputGroups.forEach(group => {
    const input = group.querySelector('input');
    
    input.addEventListener('focus', () => {
        group.style.borderColor = '#6a11cb';
        group.style.boxShadow = '0 0 0 3px rgba(106, 17, 203, 0.1)';
    });
    
    input.addEventListener('blur', () => {
        group.style.borderColor = '#e6e9ff';
        group.style.boxShadow = 'none';
    });
});

// Add animation to form container on load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.form-container').style.opacity = '0';
    document.querySelector('.form-container').style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        document.querySelector('.form-container').style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        document.querySelector('.form-container').style.opacity = '1';
        document.querySelector('.form-container').style.transform = 'translateY(0)';
    }, 300);
});

// Responsive height adjustment
function adjustFormHeight() {
    const formContainer = document.querySelector('.form-container');
    
    if (window.innerWidth <= 768) {
        formContainer.style.height = 'auto';
    } else {
        formContainer.style.height = '800px';
    }
}

// Call on resize and initial load
window.addEventListener('resize', adjustFormHeight);
adjustFormHeight();