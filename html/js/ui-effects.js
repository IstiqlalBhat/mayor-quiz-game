// ==================== UI EFFECTS ====================
// Visual feedback: particles, tooltips, toasts, celebrations, weather

// Haptic feedback (if supported)
function triggerHaptic(type = 'light') {
    if (navigator.vibrate) {
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [50, 100, 50]
        };
        navigator.vibrate(patterns[type] || patterns.light);
    }
}

// ==================== PARTICLE BACKGROUND ====================
function createParticles() {
    const container = document.getElementById('particles');
    // Reduce particles on mobile for performance
    const particleCount = isMobileDevice() ? 15 : 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ==================== TOOLTIP FUNCTIONALITY ====================
function initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.textContent = e.target.getAttribute('data-tooltip');
            tooltip.style.opacity = '1';
        });

        element.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.left = e.pageX + 15 + 'px';
            tooltip.style.top = e.pageY + 15 + 'px';
        });

        element.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.opacity = '0';
        });
    });
}

// Toast notification tracking
let activeToasts = [];

// Show toast notification with stacking
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Add to active toasts array
    activeToasts.push(toast);

    // Position all toasts vertically
    repositionToasts();

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
            // Remove from active toasts array
            activeToasts = activeToasts.filter(t => t !== toast);
            // Reposition remaining toasts
            repositionToasts();
        }, 300);
    }, 3000);
}

// Reposition all active toasts to stack vertically
function repositionToasts() {
    const isMobile = window.innerWidth <= 768;
    const baseTop = isMobile ? 80 : 100;
    const spacing = 10; // Gap between toasts

    let currentTop = baseTop;

    activeToasts.forEach(toast => {
        toast.style.top = currentTop + 'px';
        // Get height including padding and border
        const toastHeight = toast.offsetHeight || 60; // Fallback to estimated height
        currentTop += toastHeight + spacing;
    });
}

// Show celebration effect on building placement
function showCelebration(cell, building, isMobile = false) {
    // Reduce particles on mobile for performance
    const particleCount = isMobile ? 4 : 8;

    // Create sparkle particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.textContent = '✨';

        const rect = cell.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.setProperty('--angle', (i * (360 / particleCount)) + 'deg');

        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }

    // Show success toast
    showToast(`✅ ${building.name} placed! -$${building.cost}M`, 'success');
}

// ==================== JUICE EFFECTS ====================

// Show confetti explosion at position (for zones/achievements)
function showConfetti(x, y, count = 30) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f'];

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random color
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random shape (square or rectangle)
        const isSquare = Math.random() > 0.5;
        confetti.style.width = isSquare ? '10px' : '8px';
        confetti.style.height = isSquare ? '10px' : '15px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

        // Start position with spread
        const startX = x + (Math.random() - 0.5) * 100;
        const startY = y - 50;
        confetti.style.left = startX + 'px';
        confetti.style.top = startY + 'px';

        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 200;
        confetti.style.setProperty('--drift', drift + 'px');

        // Random animation delay for stagger effect
        confetti.style.animationDelay = (Math.random() * 0.3) + 's';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        }, 3500);
    }

    console.log('🎊 Confetti explosion at', x, y);
}

// Show floating number at position (for money changes)
function showFloatingNumber(amount, x, y) {
    if (amount === 0) return;

    const floater = document.createElement('div');
    floater.className = 'floating-number ' + (amount > 0 ? 'positive' : 'negative');
    floater.textContent = (amount > 0 ? '+' : '') + '$' + amount + 'M';

    // Position at cursor/event location
    floater.style.left = x + 'px';
    floater.style.top = y + 'px';

    document.body.appendChild(floater);

    // Remove after animation (3s to match CSS)
    setTimeout(() => {
        if (document.body.contains(floater)) {
            document.body.removeChild(floater);
        }
    }, 3500);

    console.log('💵 Floating number:', amount > 0 ? '+' : '', '$', amount, 'M');
}

// Track last click/touch position for floating numbers
let lastInteractionPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Update on any click/touch
document.addEventListener('click', (e) => {
    lastInteractionPosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
        lastInteractionPosition = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
});

// Update weather overlay based on happiness
function updateWeather() {
    let overlay = document.getElementById('weather-overlay');

    // Create overlay if it doesn't exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'weather-overlay';
        overlay.className = 'weather-overlay';
        document.body.appendChild(overlay);
    }

    // Clear existing weather effects
    overlay.innerHTML = '';
    overlay.className = 'weather-overlay';

    const happiness = gameState.happiness;

    if (happiness < 30) {
        // Rain effect for low happiness
        overlay.classList.add('weather-rain');

        // Create rain drops
        const dropCount = Math.min(50, Math.floor((30 - happiness) * 2));
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 0.8 + 's';
            drop.style.animationDuration = (0.5 + Math.random() * 0.3) + 's';
            overlay.appendChild(drop);
        }

        console.log('🌧️ Weather: Rain (happiness:', happiness, ')');
    } else if (happiness > 70) {
        // Sunshine effect for high happiness
        overlay.classList.add('weather-sunshine');
        console.log('☀️ Weather: Sunshine (happiness:', happiness, ')');
    } else {
        // Neutral - clear weather
        console.log('⛅ Weather: Clear (happiness:', happiness, ')');
    }
}

console.log('📦 ui-effects.js loaded');
