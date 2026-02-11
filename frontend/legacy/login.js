// login.js - FINAL FIXED VERSION (NO NULL REDIRECT BUG)

document.addEventListener('DOMContentLoaded', function () {
    console.log('Login page loaded');

    // Firebase auth must exist
    if (typeof auth === 'undefined') {
        showAlert('Firebase Auth not initialized. Check firebase-init.js', 'error');
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');

    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;

        if (!email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }

        showLoading(true);

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('Firebase login success:', user.uid);

                // Remember user
                if (remember) {
                    localStorage.setItem('rememberUser', 'true');
                    localStorage.setItem('userEmail', user.email);
                } else {
                    localStorage.removeItem('rememberUser');
                    localStorage.removeItem('userEmail');
                }

                // ---- AUTH GUARD HANDLING (SAFE) ----
                let redirectTarget = null;
                const guard = window.AuthGuard;

                if (guard && typeof guard.markLoggedIn === 'function') {
                    guard.markLoggedIn(user);
                }

                if (guard && typeof guard.consumeRedirect === 'function') {
                    redirectTarget = guard.consumeRedirect();
                }

                // HARD FALLBACK (NO NULL, NO UNDEFINED)
                if (!redirectTarget) {
                    redirectTarget = '/frontend/legacy/dashboard.html';
                }

                showLoading(false);
                showAlert('Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = redirectTarget;
                }, 1200);
            })
            .catch((error) => {
                showLoading(false);
                console.error('Firebase login error:', error.code, error.message);

                let msg = 'Login failed. ';
                if (
                    error.code === 'auth/user-not-found' ||
                    error.code === 'auth/wrong-password' ||
                    error.code === 'auth/invalid-credential'
                ) {
                    msg += 'Incorrect email or password.';
                } else if (error.code === 'auth/invalid-email') {
                    msg += 'Invalid email format.';
                } else {
                    msg += 'Please try again.';
                }

                showAlert(msg, 'error');
            });
    });

    /* ---------------- HELPERS ---------------- */

    function isValidEmail(email) {
        const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function showLoading(isLoading) {
        const btn = document.querySelector('.btn-primary.btn-full');
        if (!btn) return;

        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Signing In...' : 'Sign In';
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 14px 18px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});
