
// Initialize Seha Inquiry Interface
document.addEventListener('DOMContentLoaded', function () {
    const inputSerial = document.getElementById('sl-serial');
    const inputId = document.getElementById('sl-id');
    const alertTop = document.getElementById('sl-alert-top');
    const btnInquire = document.getElementById('btn-inquire');
    const btnBack = document.getElementById('btn-back');
    const btnNewInquire = document.getElementById('btn-new-inquire');
    const resultsSection = document.getElementById('sl-results');
    const topButton = document.getElementById('top-button');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const responsiveNav = document.getElementById('responsive-navbar-nav');

    // Modals
    const loginModal = document.getElementById('login-modal');
    const accessModal = document.getElementById('access-modal');

    // 1. Input restrictions & auto-clear alerts on type
    if (inputId) {
        inputId.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);

            if (alertTop && alertTop.style.display !== 'none') {
                alertTop.style.display = 'none';
            }
        });

        inputId.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInquirySubmit();
            }
        });
    }

    if (inputSerial) {
        inputSerial.addEventListener('input', function () {
            this.value = this.value.toUpperCase();

            if (alertTop && alertTop.style.display !== 'none') {
                alertTop.style.display = 'none';
            }
        });

        inputSerial.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInquirySubmit();
            }
        });
    }

    // 2. Buttons click wiring
    if (btnInquire) {
        btnInquire.addEventListener('click', function (e) {
            e.preventDefault();
            handleInquirySubmit();
        });
    }

    if (btnNewInquire) {
        btnNewInquire.addEventListener('click', function (e) {
            e.preventDefault();
            resetFormState();
        });
    }

    if (btnBack) {
        btnBack.addEventListener('click', function (e) {
            e.preventDefault();
            resetFormState();
        });
    }

    // 3. Scroll to Top
    if (topButton) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 200) {
                topButton.style.display = 'flex';
            } else {
                topButton.style.display = 'none';
            }
        });

        topButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 4. Mobile Menu Toggle with Backdrop & Scroll Lock
    const mobileBackdrop = document.getElementById('mobile-backdrop');

    function closeMobileMenu() {
        if (responsiveNav) {
            responsiveNav.classList.remove('show');
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }

        if (mobileBackdrop) {
            mobileBackdrop.classList.remove('show');
        }

        document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
        if (!responsiveNav || !mobileMenuBtn) {
            return;
        }

        const isOpen = responsiveNav.classList.toggle('show');

        mobileMenuBtn.classList.toggle('active', isOpen);

        if (mobileBackdrop) {
            mobileBackdrop.classList.toggle('show', isOpen);
        }

        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu on resize to desktop
    window.addEventListener('resize', function () {
        if (
            window.innerWidth >= 992 &&
            responsiveNav &&
            responsiveNav.classList.contains('show')
        ) {
            closeMobileMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMobileMenu();

            if (loginModal) {
                loginModal.style.display = 'none';
            }

            if (accessModal) {
                accessModal.style.display = 'none';
            }
        }
    });

    // 5. Generic Modal Helper
    function wireModal(triggerSelector, modalEl, closeBtnId, cancelBtnId) {
        if (!modalEl) {
            return;
        }

        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);

        document.querySelectorAll(triggerSelector).forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                modalEl.style.display = 'flex';
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                modalEl.style.display = 'none';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                modalEl.style.display = 'none';
            });
        }

        modalEl.addEventListener('click', function (e) {
            if (e.target === modalEl) {
                modalEl.style.display = 'none';
            }
        });
    }

    wireModal(
        '.login',
        loginModal,
        'btn-close-login',
        'btn-cancel-login'
    );

    wireModal(
        '.footer-access__btn',
        accessModal,
        'btn-close-access',
        'btn-cancel-access'
    );

    // Nafath Login Mock Button
    const btnNafath = document.getElementById('btn-modal-nafath');

    if (btnNafath && loginModal) {
        btnNafath.addEventListener('click', function () {
            this.textContent = 'جاري التحويل لنفاذ الوطني...';

            setTimeout(() => {
                loginModal.style.display = 'none';
                this.textContent = 'الدخول بواسطة تطبيق نفاذ';
            }, 800);
        });
    }

    // Accessibility Controls
    let currentFontSize = 16;

    const btnFontInc = document.getElementById('btn-font-increase');
    const btnFontReset = document.getElementById('btn-font-reset');
    const btnContrast = document.getElementById('btn-contrast-toggle');

    if (btnFontInc) {
        btnFontInc.addEventListener('click', function () {
            currentFontSize += 1;
            document.body.style.fontSize = currentFontSize + 'px';
        });
    }

    if (btnFontReset) {
        btnFontReset.addEventListener('click', function () {
            currentFontSize = 16;
            document.body.style.fontSize = '16px';
            document.body.style.filter = 'none';
        });
    }

    if (btnContrast) {
        btnContrast.addEventListener('click', function () {
            if (document.body.style.filter === 'invert(1)') {
                document.body.style.filter = 'none';
            } else {
                document.body.style.filter = 'invert(1)';
            }
        });
    }

    // Navigation links handling
    document.querySelectorAll(
        '.navbar-nav .link, .navbar-nav .register, .footer .nav-link, .footer-legal-links a'
    ).forEach(function (link) {
        link.addEventListener('click', function (e) {
            closeMobileMenu();

            const href = this.getAttribute('href');

            if (!href || href === '#' || href.startsWith('#/')) {
                e.preventDefault();

                const text = this.textContent.trim();

                if (
                    text === 'الاستعلامات' ||
                    text.includes('الإجازات')
                ) {
                    if (typeof resetFormState === 'function') {
                        resetFormState();
                    }

                    window.scrollTo({
                        top: 300,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Footer navigation buttons
    document.querySelectorAll('.footer button.nav-link').forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
});
