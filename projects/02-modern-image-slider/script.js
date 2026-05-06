// Premium Slider - Fully Responsive, AutoPlay, Touch/Swipe, Ken Burns, Progress Bar
(function () {
    // ----- DOM Elements -----
    const slidesWrapper = document.getElementById('slidesWrapper');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dotsContainer');
    const progressFill = document.getElementById('progressFill');
    const sliderContainer = document.getElementById('premiumSlider');

    // ----- Config -----
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayInterval = null;
    let progressAnimationFrame = null;
    let progressStartTime = 0;
    let progressPaused = false;
    let progressPauseRemaining = 0;   // remaining time in ms
    const AUTO_INTERVAL_MS = 4500;    // 4.5 seconds (within 3-5 sec range)

    let isDragging = false;
    let startTouchX = 0;

    // ----- Helper: Lazy load images (load data-src once, prevent flicker)-----
    function lazyLoadImage(imgElement) {
        const src = imgElement.getAttribute('data-src');
        if (src && !imgElement.src) {
            imgElement.src = src;
            imgElement.removeAttribute('data-src');
        }
    }

    // Preload adjacent images for smoothness
    function preloadAdjacent(index) {
        const indices = [(index + 1) % totalSlides, (index - 1 + totalSlides) % totalSlides];
        indices.forEach(i => {
            const slide = slides[i];
            const img = slide.querySelector('.slide-image');
            if (img && img.getAttribute('data-src')) {
                const tempImg = new Image();
                tempImg.src = img.getAttribute('data-src');
            }
        });
    }

    // ----- Update active slide, dots, and manage ken burns restart -----
    function updateActiveSlide(newIndex) {
        // remove active class from all slides
        slides.forEach((slide, idx) => {
            slide.classList.remove('active');
            // trigger reflow for CSS transition? not necessary, but ensures image transform resets:
            const imgEl = slide.querySelector('.slide-image');
            if (imgEl && idx === newIndex) {
                // small trick: when we reactivate, we need to reset transform? CSS handles the class .active to start zoom-out
                // force lazy load if not loaded
                lazyLoadImage(imgEl);
            } else {
                // for non-active: optional lazy load for others
                const imgNon = slide.querySelector('.slide-image');
                if (imgNon && imgNon.getAttribute('data-src')) lazyLoadImage(imgNon);
            }
        });
        slides[newIndex].classList.add('active');

        // update dots active style
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            if (idx === newIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // preload next & prev images
        preloadAdjacent(newIndex);
        currentIndex = newIndex;
    }

    // ----- Progress bar management (smooth linear animation) -----
    function startProgressAnimation(remainingTime = AUTO_INTERVAL_MS) {
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        if (!autoPlayActive()) return;

        const startWidth = parseFloat(progressFill.style.width) || 0;
        const startTime = performance.now();
        const targetWidth = 100; // percent
        const duration = remainingTime;

        function updateProgress(now) {
            const elapsed = now - startTime;
            let percent = Math.min(100, startWidth + (elapsed / duration) * (targetWidth - startWidth));
            if (percent >= 100) percent = 100;
            progressFill.style.width = `${percent}%`;
            if (percent < 100 && autoPlayActive()) {
                progressAnimationFrame = requestAnimationFrame(updateProgress);
            } else if (percent >= 100 && autoPlayActive()) {
                // time to go to next slide automatically
                goToNextSlide();
            }
        }
        if (autoPlayActive()) progressAnimationFrame = requestAnimationFrame(updateProgress);
    }

    function resetProgressBar(resetWidth = true) {
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        if (resetWidth) progressFill.style.width = '0%';
        if (autoPlayActive() && !progressPaused) {
            startProgressAnimation(AUTO_INTERVAL_MS);
        } else if (autoPlayActive() && progressPaused && progressPauseRemaining > 0) {
            // when paused on hover, resume with leftover time
            progressFill.style.width = `${((AUTO_INTERVAL_MS - progressPauseRemaining) / AUTO_INTERVAL_MS) * 100}%`;
            startProgressAnimation(progressPauseRemaining);
        }
    }

    function pauseProgressBar() {
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        if (autoPlayActive()) {
            // get current width to compute remaining time
            const currentWidthPercent = parseFloat(progressFill.style.width) || 0;
            const elapsedRatio = currentWidthPercent / 100;
            const elapsedTime = AUTO_INTERVAL_MS * elapsedRatio;
            progressPauseRemaining = Math.max(0, AUTO_INTERVAL_MS - elapsedTime);
            progressPaused = true;
        }
    }

    function resumeProgressBar() {
        if (autoPlayActive() && progressPaused) {
            progressPaused = false;
            if (progressPauseRemaining > 0) {
                startProgressAnimation(progressPauseRemaining);
            } else {
                resetProgressBar(true);
            }
        } else if (autoPlayActive()) {
            resetProgressBar(true);
        }
    }

    // Helper: check if autoplay is running, unaffected by manual overriding
    function autoPlayActive() {
        return autoPlayInterval !== null;
    }

    // ----- Autoplay control (with pause on hover)-----
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        // use setInterval only as fallback, but progress bar handles time driven sliding.
        // Actually, the progress bar calls goToNextSlide when reaches 100%. However we also need interval
        // as a safety if progress bar fails but we rely on progress.
        // Instead we just rely on progress completion using requestAnimationFrame.
        // But we also need to reset timer when manual next/prev.
        // cancel any previous animation, reset progress bar.
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            // extra safety: if progress isn't moving due to bugs, we advance
            // but this is just a failsafe. The main driver is progress bar's completition.
            // we will NOT double slide.
        }, AUTO_INTERVAL_MS + 200);
        // reset state
        progressPaused = false;
        resetProgressBar(true);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
        progressPaused = false;
    }

    // go to specific index (with slide change)
    function goToSlide(index, resetProgress = true) {
        if (index === currentIndex) return;
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        updateActiveSlide(index);
        if (autoPlayActive()) {
            if (resetProgress) {
                // reset progress bar fully
                if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
                progressFill.style.width = '0%';
                progressPaused = false;
                startProgressAnimation(AUTO_INTERVAL_MS);
            } else {
                resetProgressBar(true);
            }
        }
    }

    function goToNextSlide() {
        let next = (currentIndex + 1) % totalSlides;
        goToSlide(next, true);
    }

    function goToPrevSlide() {
        let prev = (currentIndex - 1 + totalSlides) % totalSlides;
        goToSlide(prev, true);
    }

    // ----- create dots indicator -----
    function buildDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                if (autoPlayActive()) {
                    pauseProgressBar();
                    goToSlide(i, true);
                    resumeProgressBar();
                } else {
                    goToSlide(i, true);
                }
            });
            dotsContainer.appendChild(dot);
        }
    }

    // ----- Touch / Swipe support for mobile -----
    function handleTouchStart(e) {
        if (autoPlayActive()) pauseProgressBar();
        isDragging = true;
        startTouchX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        // optional minimal threshold
    }

    function handleTouchEnd(e) {
        if (!isDragging) {
            if (autoPlayActive()) resumeProgressBar();
            return;
        }
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startTouchX;
        if (Math.abs(diffX) > 50) { // swipe threshold
            if (diffX > 0) {
                goToPrevSlide();
            } else {
                goToNextSlide();
            }
        }
        if (autoPlayActive()) resumeProgressBar();
    }

    // ----- Pause on hover functionality -----
    function setupHoverPause() {
        const container = sliderContainer;
        container.addEventListener('mouseenter', () => {
            if (autoPlayActive()) {
                pauseProgressBar();
            }
        });
        container.addEventListener('mouseleave', () => {
            if (autoPlayActive()) {
                resumeProgressBar();
            }
        });
        // for touch devices: pause when touching interaction? already handled
    }

    // ----- Lazy load all images when visible -----
    function initLazy() {
        slides.forEach(slide => {
            const img = slide.querySelector('.slide-image');
            if (img && img.getAttribute('data-src')) {
                // initial load only active first
                if (slide.classList.contains('active')) {
                    lazyLoadImage(img);
                }
            }
        });
        // additionally load others on idle
        setTimeout(() => {
            slides.forEach(slide => {
                const img = slide.querySelector('.slide-image');
                if (img && img.getAttribute('data-src')) lazyLoadImage(img);
            });
        }, 300);
    }

    // ----- Event listeners for arrows -----
    function bindEvents() {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (autoPlayActive()) {
                pauseProgressBar();
                goToPrevSlide();
                resumeProgressBar();
            } else {
                goToPrevSlide();
            }
        });
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (autoPlayActive()) {
                pauseProgressBar();
                goToNextSlide();
                resumeProgressBar();
            } else {
                goToNextSlide();
            }
        });
    }

    function initTouch() {
        const sliderElem = document.querySelector('.slider');
        sliderElem.addEventListener('touchstart', handleTouchStart, { passive: false });
        sliderElem.addEventListener('touchmove', handleTouchMove);
        sliderElem.addEventListener('touchend', handleTouchEnd);
    }

    // ----- initial setup and autoplay start -----
    function init() {
        buildDots();
        bindEvents();
        initLazy();
        setupHoverPause();
        initTouch();
        updateActiveSlide(0);
        startAutoPlay();
        // ensure progress bar uses smooth starting point
        window.addEventListener('resize', () => {
            // maintain current width ratio based on remaining
            if (autoPlayActive() && !progressPaused) {
                const currentWidth = parseFloat(progressFill.style.width) || 0;
                const elapsedRatio = currentWidth / 100;
                const remainingMs = AUTO_INTERVAL_MS * (1 - elapsedRatio);
                if (remainingMs > 10) {
                    if (progressAnimationFrame) cancelAnimationFrame(progressAnimationFrame);
                    startProgressAnimation(remainingMs);
                } else {
                    resetProgressBar(true);
                }
            }
        });
    }

    init();
})();