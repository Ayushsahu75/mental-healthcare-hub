window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        window.setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            loader.style.transition = 'opacity 0.35s ease, visibility 0.35s ease';
        }, 400);
    }

    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('mobileOverlay');

    const setMenuOpen = (isOpen) => {
        if (!hamburger || !nav) return;
        hamburger.classList.toggle('active', isOpen);
        nav.classList.toggle('mobile-open', isOpen);
        overlay?.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger?.addEventListener('click', () => {
        setMenuOpen(!nav.classList.contains('mobile-open'));
    });
    overlay?.addEventListener('click', () => setMenuOpen(false));
    nav?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setMenuOpen(false);
    });
});
