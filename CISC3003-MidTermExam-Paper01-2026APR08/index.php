<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>dc229576 - ZhangZhexuan | SignUp/Login Form</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container" id="container">
        <div class="header">
            <h1>CISC3003 Web Programming</h1>
            <p>Mid-Term Exam Paper 01 - Part 04</p>
        </div>
        
        <div class="form-container">
            <!-- Sign Up Form -->
            <div class="form-container__sign-up">
                <form id="signup-form" class="form">
                    <h2>Create Account</h2>
                    <p>Sign up to get started</p>
                    
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="text" id="signup-name" placeholder="Full Name" required>
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="signup-email" placeholder="Email" required>
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="signup-password" placeholder="Create Password" required>
                        <i class="fas fa-eye toggle-password" data-target="signup-password"></i>
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="signup-confirm" placeholder="Confirm Password" required>
                    </div>
                    
                    <div class="terms">
                        <label>
                            <input type="checkbox" required>
                            I agree to the <a href="#">Terms & Conditions</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="submit-btn">Sign Up</button>
                </form>
            </div>
            
            <!-- Sign In Form -->
            <div class="form-container__sign-in">
                <form id="signin-form" class="form">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account</p>
                    
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="signin-email" placeholder="Email" required>
                    </div>
                    
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="signin-password" placeholder="Password" required>
                        <i class="fas fa-eye toggle-password" data-target="signin-password"></i>
                    </div>
                    
                    <div class="options">
                        <label>
                            <input type="checkbox"> Remember me
                        </label>
                        <a href="#" class="forgot-link">Forgot Password?</a>
                    </div>
                    
                    <button type="submit" class="submit-btn">Sign In</button>
                </form>
            </div>
            
            <!-- Overlay Container -->
            <div class="overlay-container">
                <div class="overlay">
                    <div class="overlay__panel overlay__left">
                        <h2>Welcome Back!</h2>
                        <p>To keep connected with us please login with your personal info</p>
                        <button class="ghost-btn" id="signIn">Sign In</button>
                    </div>
                    <div class="overlay__panel overlay__right">
                        <h2>Hello, Friend!</h2>
                        <p>Enter your personal details and start journey with us</p>
                        <button class="ghost-btn" id="signUp">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-footer">
            <p>By continuing, you agree to our <a href="#">User Agreement</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
        
        <footer>
            <p>CISC3003 Web Programming: dc229576 ZhangZhexuan 2026</p>
        </footer>
    </div>
    
    <script src="js/script.js"></script>
</body>
</html>