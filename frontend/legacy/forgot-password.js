// forgot-password.js - Password Reset Page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Forgot Password page loaded successfully');

    // Check for global 'auth' object
    if (typeof auth === 'undefined') {
        showAlert('Firebase Auth not initialized. Please check firebase-init.js', 'error');
        return;
    }

    const resetForm = document.getElementById('resetForm');
    const resetEmailInput = document.getElementById('resetEmail');

    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = resetEmailInput.value.trim();
            
            if (!isValidEmail(email)) {
                showAlert('Please enter a valid email address.', 'error');
                return;
            }
            
            showLoading(true);

            // Directly call sendPasswordResetEmail. 
            // Firebase securely handles the lookup and prevents enumeration on its own.
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    // Success: This message is shown if the email format is valid, 
                    // regardless of whether the user exists (Standard security practice).
                    showLoading(false);
                    resetEmailInput.value = ''; 
                    showAlert('Password reset request successful! If this email is registered, you will receive a link shortly. Check your spam folder!', 'success');
                })
                .catch((error) => {
                    showLoading(false);
                    const errorCode = error.code || 'unknown';
                    console.error('Firebase Password Reset Error:', errorCode, error.message);

                    let userFriendlyMessage = 'Failed to send reset email. ';
                    
                    if (errorCode === 'auth/invalid-email') {
                        userFriendlyMessage += 'Invalid email address format.';
                    } else if (errorCode === 'auth/network-request-failed') {
                        userFriendlyMessage += 'Network error. Please check your connection.';
                    } else if (errorCode === 'auth/too-many-requests') {
                         userFriendlyMessage += 'Too many requests. Please wait a moment and try again.';
                    } else {
                        userFriendlyMessage += 'An unexpected error occurred.';
                    }
                    
                    showAlert(userFriendlyMessage, 'error');
                });
        });
    }

    /* ----------------------
       Essential Helper Functions
       ---------------------- */
    
    function isValidEmail(email) {
        // Basic regex for email validation
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showLoading(isLoading) {
        const submitBtn = document.querySelector('.btn-primary.btn-full');
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending Link...';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Reset Link';
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