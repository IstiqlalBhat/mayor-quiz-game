// ==================== TUTORIAL SYSTEM ====================
// Tutorial steps, onboarding flow

const tutorialSteps = [
    {
        title: "⏰ Decision Timer",
        text: "This is your timer - make decisions before it runs out! The timer changes color as time decreases. Green is safe, yellow is warning, red means hurry!",
        highlightElement: 'timer-container',
        position: 'bottom'
    },
    {
        title: "📊 Your Stats",
        text: "These are your stats - keep them balanced! Track Population Happiness, City Funds, Special Interest Support, and Your Profit. Every decision affects these metrics.",
        highlightElement: 'stats-panel',
        position: 'top'
    },
    {
        title: "🏗️ Building Palette",
        text: "Drag buildings from here to build your city! Each building costs money and provides different benefits. Buildings unlock as you make story choices.",
        highlightElement: 'building-palette',
        position: 'left'
    },
    {
        title: "🏙️ City Grid",
        text: "Drop buildings on the grid - watch for bonuses! Green highlights show beneficial adjacency, red shows penalties. Place buildings strategically for maximum efficiency!",
        highlightElement: 'city-grid',
        position: 'top'
    },
    {
        title: "🎮 Ready to Play!",
        text: "Now you're ready! Make your first decision. You'll get bonus time (+30s) for your first choice. Remember: Think fast, build smart, and balance your city!",
        highlightElement: null,
        position: 'center'
    }
];

let currentTutorialStep = 0;

function checkFirstTime() {
    const hasPlayed = localStorage.getItem('manestreet_played');
    if (!hasPlayed) {
        // First time player - show tutorial prompt after intro
        return true;
    }
    return false;
}

function startTutorial() {
    currentTutorialStep = 0;

    // Stop the timer during tutorial, but keep it visible
    stopTimer();

    // Keep timer visible during tutorial by adding 'active' class back
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
        timerContainer.classList.add('active');
        console.log('⏸️ Timer paused for tutorial (but kept visible)');
    }

    // Hide the question overlay during tutorial
    const gameContentOverlay = document.getElementById('game-content-overlay');
    if (gameContentOverlay) {
        gameContentOverlay.style.display = 'none';
    }

    showTutorialStep(0);
    localStorage.setItem('manestreet_tutorial', 'started');
}

function showTutorialStep(stepIndex) {
    const step = tutorialSteps[stepIndex];
    const overlay = document.getElementById('tutorial-overlay');
    const highlight = document.getElementById('tutorial-highlight');
    const title = document.getElementById('tutorial-title');
    const text = document.getElementById('tutorial-text');
    const progress = document.getElementById('tutorial-progress');
    const nextBtn = document.querySelector('.tutorial-next');

    overlay.style.display = 'block';
    title.textContent = step.title;
    text.textContent = step.text;
    progress.textContent = `Step ${stepIndex + 1} of ${tutorialSteps.length}`;

    if (stepIndex === tutorialSteps.length - 1) {
        nextBtn.textContent = 'Start Game! →';
    } else {
        nextBtn.textContent = 'Next →';
    }

    // Highlight element if specified - with delay to ensure rendering
    if (step.highlightElement) {
        // Small delay to ensure DOM has rendered and CSS has applied
        setTimeout(() => {
            const element = document.getElementById(step.highlightElement) ||
                document.querySelector(`.${step.highlightElement}`);

            if (element) {
                // Force a reflow to ensure accurate measurements
                element.offsetHeight;

                const rect = element.getBoundingClientRect();

                // Debug logging
                console.log(`🎯 Highlighting element: ${step.highlightElement}`);
                console.log(`  Position: top=${rect.top}, left=${rect.left}`);
                console.log(`  Size: width=${rect.width}, height=${rect.height}`);

                // Check if element has valid dimensions
                if (rect.width > 0 && rect.height > 0) {
                    highlight.style.top = rect.top - 10 + 'px';
                    highlight.style.left = rect.left - 10 + 'px';
                    highlight.style.width = rect.width + 20 + 'px';
                    highlight.style.height = rect.height + 20 + 'px';
                    highlight.style.display = 'block';
                    console.log('✅ Highlight applied successfully');
                } else {
                    console.warn('⚠️ Element has zero dimensions, skipping highlight');
                    highlight.style.display = 'none';
                }
            } else {
                console.warn(`⚠️ Element not found: ${step.highlightElement}`);
                highlight.style.display = 'none';
            }
        }, 100); // 100ms delay to ensure rendering
    } else {
        highlight.style.display = 'none';
    }

    console.log(`📚 Tutorial step ${stepIndex + 1}/${tutorialSteps.length}: ${step.title}`);
}

function nextTutorialStep() {
    currentTutorialStep++;

    if (currentTutorialStep >= tutorialSteps.length) {
        completeTutorial();
    } else {
        showTutorialStep(currentTutorialStep);
    }
}

function skipTutorial() {
    localStorage.setItem('manestreet_tutorial', 'skipped');
    completeTutorial();
}

function completeTutorial() {
    const overlay = document.getElementById('tutorial-overlay');
    const highlight = document.getElementById('tutorial-highlight');

    // Ensure both overlay and highlight are completely hidden
    overlay.style.display = 'none';
    if (highlight) {
        highlight.style.display = 'none';
    }

    // Show the question overlay again after tutorial
    const gameContentOverlay = document.getElementById('game-content-overlay');
    if (gameContentOverlay) {
        gameContentOverlay.style.display = 'block';
    }

    localStorage.setItem('manestreet_played', 'true');
    localStorage.setItem('manestreet_tutorial', 'completed');

    // Add time bonus for first choice
    gameState.timeBankSeconds += 30;

    console.log('📚 Tutorial completed! +30s bonus for first decision');
    console.log('🎯 Tutorial overlay and highlight hidden');

    // Resume the timer after tutorial
    startTimer();
    console.log('▶️ Timer resumed after tutorial');
}

console.log('📦 tutorial-system.js loaded');
