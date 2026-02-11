(function () {
    const AUTH_STATE_KEY = 'mw-auth-user';
    const REDIRECT_KEY = 'mw-post-login-redirect';
    const PUBLIC_PAGES = new Set([
        '',
        'index.html',
        'login.html',
        'register.html',
        'forgot-password.html',
        'simple_web_chatbot.html'
    ]);

    const AuthGuard = {
        isLoggedIn,
        markLoggedIn,
        clearLoginState,
        queueRedirect,
        consumeRedirect
    };

    function isLoggedIn() {
        try {
            return Boolean(localStorage.getItem(AUTH_STATE_KEY));
        } catch (error) {
            console.warn('AuthGuard: unable to read auth state', error);
            return false;
        }
    }

    function markLoggedIn(user = {}) {
        try {
            const payload = {
                email: user.email || null,
                loginAt: Date.now()
            };
            localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.warn('AuthGuard: unable to persist login state', error);
        }
    }

    function clearLoginState() {
        try {
            localStorage.removeItem(AUTH_STATE_KEY);
        } catch (error) {
            console.warn('AuthGuard: unable to clear auth state', error);
        }
    }

    function consumeRedirect() {
        try {
            const target = localStorage.getItem(REDIRECT_KEY);
            if (target) {
                localStorage.removeItem(REDIRECT_KEY);
                return target;
            }
        } catch (error) {
            console.warn('AuthGuard: unable to read redirect target', error);
        }
        return null;
    }

    function queueRedirect(targetPath) {
        const normalized = normalizeTarget(targetPath) || 'dashboard.html';
        try {
            localStorage.setItem(REDIRECT_KEY, normalized);
        } catch (error) {
            console.warn('AuthGuard: unable to queue redirect', error);
        }
    }

    function normalizeTarget(target) {
        if (!target || typeof target !== 'string') return null;
        const trimmed = target.trim();
        if (
            trimmed === '' ||
            trimmed === '#' ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('mailto:') ||
            trimmed.startsWith('tel:') ||
            trimmed.startsWith('javascript:')
        ) {
            return null;
        }

        let resolved = trimmed;
        try {
            if (/^https?:/i.test(trimmed)) {
                const url = new URL(trimmed);
                if (url.origin !== window.location.origin) {
                    return null;
                }
                resolved = url.pathname;
            }
        } catch {
            // ignore malformed urls
        }

        resolved = resolved.split('#')[0].split('?')[0];
        resolved = resolved.replace(/^\.?\//, '');

        if (resolved === '' || resolved === 'index' || resolved === 'index.htm') {
            return 'index.html';
        }

        if (!resolved.endsWith('.html')) {
            resolved = `${resolved}.html`;
        }
        return resolved;
    }

    function getCurrentPage() {
        const segments = window.location.pathname.split('/');
        const current = segments.pop() || segments.pop() || '';
        return current || 'index.html';
    }

    function enforceProtection(currentPage) {
        if (PUBLIC_PAGES.has(currentPage)) {
            return;
        }

        if (!isLoggedIn()) {
            queueRedirect(currentPage);
            window.location.href = 'login.html';
        }
    }

    function interceptProtectedNavigation() {
        document.addEventListener(
            'click',
            (event) => {
                const anchor = event.target.closest('a[href]');
                if (!anchor || anchor.hasAttribute('data-skip-auth')) return;

                const normalized = normalizeTarget(anchor.getAttribute('href'));
                if (!normalized || PUBLIC_PAGES.has(normalized) || isLoggedIn()) {
                    return;
                }

                event.preventDefault();
                queueRedirect(normalized);
                showLoginReminder();
                window.location.href = 'login.html';
            },
            true
        );
    }

    function showLoginReminder() {
        let toast = document.querySelector('.login-required-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'login-required-toast';
            toast.textContent = 'Please log in to continue 🚪';
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '96px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(79, 70, 229, 0.95)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: '600',
                zIndex: '999',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
                transition: 'opacity 0.6s ease'
            });
            document.body.appendChild(toast);
        }

        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    function highlightActiveNav(currentPage) {
        document.querySelectorAll('.bottom-nav a.nav-item').forEach((link) => {
            const normalized = normalizeTarget(link.getAttribute('href'));
            if (normalized === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function init() {
        const currentPage = getCurrentPage();
        highlightActiveNav(currentPage);
        enforceProtection(currentPage);
        interceptProtectedNavigation();
    }

    document.addEventListener('DOMContentLoaded', init);
    window.AuthGuard = AuthGuard;
})();


