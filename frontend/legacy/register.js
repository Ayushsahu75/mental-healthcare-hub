// register.js - Registration page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded successfully');
    
    // Check for global 'auth' object created in firebase-init.js
    if (typeof auth === 'undefined') {
        showAlert('Firebase Auth not initialized. Please check firebase-init.js', 'error');
        return;
    }

    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const studentIdInput = document.getElementById('studentId');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const collegeSelect = document.getElementById('college');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    
    // Form validation and submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                studentId: studentIdInput.value.trim(),
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                college: collegeSelect.value,
                agreeTerms: agreeTermsCheckbox.checked
            };
            
            // Validate form
            if (!validateForm(formData)) {
                // validateForm will call showAlert on error
                return;
            }
            
            showLoading(true, 'primary');
            
            // 1. Use Firebase for Registration
// Inside website healthcare5/frontend/legacy/register.js:
// ...

// 1. Use Firebase for Registration
auth.createUserWithEmailAndPassword(formData.email, formData.password)
    .then((userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        console.log('User registered with Firebase:', user.uid);

        // Optional: Update user display name in Firebase
        user.updateProfile({ displayName: formData.fullName });

        // --- START NEW: SAVE USER PROFILE TO FIRESTORE ---
        if (typeof db !== 'undefined') {
            return db.collection("users").doc(user.uid).set({
                fullName: formData.fullName,
                email: formData.email,
                studentId: formData.studentId,
                college: formData.college,
                agreedTerms: formData.agreeTerms,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        // --- END NEW BLOCK ---
    })
    .then(() => { // This .then handles both the Auth update and the Firestore .set() call
        showLoading(false, 'primary');
        showAlert('Account created successfully! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    })
    .catch((error) => {
// ... the rest of your catch block ...
                    showLoading(false, 'primary');
                    const errorCode = error.code;
                    console.error('Firebase Registration Error:', errorCode, error.message);
                    
                    let userFriendlyMessage = 'Registration failed. ';
                    if (errorCode === 'auth/email-already-in-use') {
                        userFriendlyMessage += 'This email is already in use.';
                    } else if (errorCode === 'auth/invalid-email') {
                        userFriendlyMessage += 'Invalid email address.';
                    } else if (errorCode === 'auth/weak-password') {
                        userFriendlyMessage += 'Password is too weak.';
                    } else {
                        userFriendlyMessage += 'Please check your details and try again.';
                    }
                    
                    showAlert(userFriendlyMessage, 'error');
                });
        });
    }
    
    /* ----------------------
       Google Sign-In Implementation
       ---------------------- */
    window.signInWithGoogle = function() {
        if (typeof auth === 'undefined') {
            showAlert('Firebase Auth not initialized. Please check firebase-init.js', 'error');
            return;
        }
        
        // Ensure Firebase Auth is loaded before proceeding
        if (typeof firebase.auth.GoogleAuthProvider === 'undefined') {
            showAlert('Google Auth Provider not loaded. Check script tags in HTML.', 'error');
            return;
        }

        showLoading(true, 'google');

        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log('User signed in with Google:', user.uid);
                
                showLoading(false, 'google');
                showAlert('Signed up successfully with Google! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            })
            .catch((error) => {
                showLoading(false, 'google');
                const errorCode = error.code;
                console.error('Google Sign-in Error:', errorCode, error.message);

                let userFriendlyMessage = 'Google sign-in failed. ';
                if (errorCode === 'auth/popup-closed-by-user') {
                    userFriendlyMessage = 'Sign-in window closed. Please try again.';
                } else if (errorCode === 'auth/cancelled-popup-request') {
                    userFriendlyMessage = 'Sign-in cancelled. Please ensure pop-ups are allowed.';
                } else if (errorCode === 'auth/account-exists-with-different-credential') {
                    userFriendlyMessage += 'An account already exists with the same email using a different method (e.g., email/password).';
                } else {
                    userFriendlyMessage += 'Please check your details and try again.';
                }

                showAlert(userFriendlyMessage, 'error');
            });
    };
    
    /* ----------------------
       Essential Helper Functions
       ---------------------- */

    function isValidEmail(email) {
        // Basic regex for email validation
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validateForm(formData) {
        if (formData.fullName.length < 3) {
            showAlert('Full Name must be at least 3 characters long.', 'error');
            return false;
        }
        if (!isValidEmail(formData.email)) {
            showAlert('Please enter a valid email address.', 'error');
            return false;
        }
        if (formData.password.length < 6) {
            showAlert('Password must be at least 6 characters long.', 'error');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            return false;
        }
        if (formData.college === '') {
            showAlert('Please select your College/University.', 'error');
            return false;
        }
        if (!formData.agreeTerms) {
            showAlert('You must agree to the Terms of Service and Privacy Policy.', 'error');
            return false;
        }
        return true;
    }

    function showLoading(isLoading, source) {
        const primaryBtn = document.querySelector('.btn-primary.btn-full');
        const googleBtn = document.querySelector('.google-btn');
        const microsoftBtn = document.querySelector('.microsoft-btn');

        if (isLoading) {
            // Disable all buttons and show loading state
            if (primaryBtn) {
                primaryBtn.disabled = true;
                primaryBtn.textContent = 'Processing...';
            }
            if (googleBtn) {
                googleBtn.disabled = true;
                googleBtn.style.opacity = 0.5;
                if (source === 'google') {
                     googleBtn.textContent = 'Processing...';
                }
            }
            if (microsoftBtn) {
                microsoftBtn.disabled = true;
                microsoftBtn.style.opacity = 0.5;
            }
        } else {
            // Enable all buttons and restore original state
            if (primaryBtn) {
                primaryBtn.disabled = false;
                primaryBtn.textContent = 'Create Account';
            }
            if (googleBtn) {
                googleBtn.disabled = false;
                googleBtn.style.opacity = 1;
                googleBtn.innerHTML = '<img src="https://via.placeholder.com/20x20/FFFFFF/000000?text=G" alt="Google"> Continue with Google';
            }
            if (microsoftBtn) {
                microsoftBtn.disabled = false;
                microsoftBtn.style.opacity = 1;
            }
        }
    }
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            alert.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#ef4444';
        } else if (type === 'info') {
            alert.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(alert);
        
        // Add minimal animation for the alert 
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
    }
});