// ==================== NARRATIVE MANAGER ====================
// Handles all advisor dialogues, typewriter effects, and character reactions

class NarrativeManager {
    constructor() {
        // Advisor definitions with their specialties and personalities
        this.advisors = {
            banks: {
                id: 'banks',
                name: 'Mr. Banks',
                title: 'Financial Advisor',
                portrait: 'assets/characters/banks.png',
                specialty: ['cityFunds', 'personalProfit'],
                color: '#ffd700',
                personality: 'capitalist',
                catchphrases: {
                    positive: [
                        "Excellent! The city's coffers will overflow!",
                        "A sound investment, Mayor! My calculator is singing.",
                        "The markets will love this decision! Stocks are up!",
                        "Money well spent indeed! ROI is looking spectacular.",
                        "Fiscal responsibility at its finest. Well done.",
                        "I smell profit! And it smells like victory.",
                        "Cha-ching! That's the sound of success, Mayor."
                    ],
                    negative: [
                        "This will hurt our bottom line... significantly.",
                        "The investors won't be pleased... I can hear them selling already.",
                        "Think of the economy, Mayor! We're not a charity.",
                        "We're hemorrhaging funds here! Plug the leak!",
                        "My spreadsheets are bleeding red ink!",
                        "This is fiscal suicide! Reconsider immediately!",
                        "I cannot endorse this financial recklessness."
                    ],
                    neutral: [
                        "The financial impact is acceptable. Barely.",
                        "Neither gain nor loss. Proceed carefully.",
                        "The numbers are balanced, for now. But I'm watching.",
                        "A break-even proposition. Not exciting, but safe.",
                        "Market stability is maintained. Carry on."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "Residential investment! Property taxes will flow nicely.",
                        "More taxpayers? Excellent strategy, Mayor.",
                        "Housing market is booming. Let's capitalize on it."
                    ],
                    shop: [
                        "A commercial venture! Revenue streams are looking good.",
                        "Sales tax revenue incoming! Music to my ears.",
                        "Small business, big profits. A wise choice."
                    ],
                    factory: [
                        "Industrial power! This will boost our economic output significantly.",
                        "Production means profit. Let the smoke stacks rise!",
                        "Jobs and exports. The backbone of a strong economy."
                    ],
                    park: [
                        "Parks don't generate revenue, but happy citizens spend more...",
                        "Maintenance costs are high, but it might boost property values.",
                        "I suppose a little green makes the gold shine brighter."
                    ],
                    office: [
                        "Corporate real estate! The business district expands.",
                        "White-collar jobs bring high-tier tax revenue. Splendid.",
                        "Sky-high buildings for sky-high profits!"
                    ]
                },
                zoneDialogues: [
                    "A commercial district forms! Property values are soaring!",
                    "This zone will attract major investors to our city.",
                    "Excellent clustering! Economic synergy at its finest.",
                    "Look at that density! Maximum revenue per square foot.",
                    "A financial hub in the making. I'm impressed."
                ],
                achievementDialogues: [
                    "Achievement unlocked! This will look great in the annual report.",
                    "Impressive milestone! The shareholders will be pleased.",
                    "Success breeds success, Mayor. Keep the profits rolling!",
                    "A bonus-worthy performance! If we had bonuses...",
                    "You're making history, and money! Mostly money."
                ]
            },
            ivy: {
                id: 'ivy',
                name: 'Ivy Green',
                title: 'Environmental Activist',
                portrait: 'assets/characters/ivygreen.png',
                specialty: ['happiness', 'environment'],
                color: '#4caf50',
                personality: 'activist',
                catchphrases: {
                    positive: [
                        "The people will thrive! Nature approves!",
                        "A green choice for a brighter future! The birds are singing!",
                        "The community thanks you, Mayor! You have a big heart.",
                        "This brings joy to our citizens! Smiles everywhere!",
                        "Harmony with nature is the true path to success.",
                        "I can feel the city breathing easier already.",
                        "Wonderful! A sustainable choice for generations to come."
                    ],
                    negative: [
                        "The people deserve better than this! It's heartbreaking.",
                        "Think of the children, Mayor! What world are we leaving them?",
                        "Our green spaces weep today... and so do I.",
                        "Happiness cannot be sacrificed for profit! It's just wrong.",
                        "This is a disaster for the local ecosystem!",
                        "The citizens are choking on this decision!",
                        "Nature will not forgive this transgression."
                    ],
                    neutral: [
                        "The citizens are watching... waiting for a sign.",
                        "A cautious step. The people wait.",
                        "Neither celebration nor protest today. Just silence.",
                        "It's okay, but we could do better for the planet.",
                        "Balance is key. Don't tip the scales too far."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "New homes for families! The community grows stronger.",
                        "A place to belong. Every citizen deserves a home.",
                        "Neighborhoods are the heart of our city."
                    ],
                    shop: [
                        "Local businesses bring life to our neighborhoods!",
                        "A place for people to gather and connect.",
                        "Support local! It builds community spirit."
                    ],
                    factory: [
                        "I hope the pollution controls are adequate...",
                        "Industry is necessary, but at what cost to the air?",
                        "Please ensure the workers are treated well."
                    ],
                    park: [
                        "Beautiful! Green spaces heal the soul of our city.",
                        "Trees are the lungs of the city. Thank you, Mayor!",
                        "A sanctuary for nature and people alike. Perfect."
                    ],
                    office: [
                        "More jobs, but let's not forget work-life balance.",
                        "Glass towers... I hope they're bird-safe.",
                        "Employment is good, but stress is bad. Watch out."
                    ]
                },
                zoneDialogues: [
                    "A thriving neighborhood emerges! Community spirit is high!",
                    "People are coming together. This is what cities are about!",
                    "The citizens will love this development! It feels like home.",
                    "A vibrant community! You can feel the energy.",
                    "Green living at its best. Well planned, Mayor!"
                ],
                achievementDialogues: [
                    "The people celebrate! You've made them proud, Mayor.",
                    "This achievement shows you care about our community!",
                    "Wonderful progress! The citizens are grateful.",
                    "A victory for the people and the planet!",
                    "Your heart is in the right place, and it shows."
                ]
            },
            engineer: {
                id: 'engineer',
                name: 'Chief Builder',
                title: 'City Engineer',
                portrait: 'assets/characters/engineer.png',
                specialty: ['specialInterest', 'zoning'],
                color: '#2196f3',
                personality: 'engineer',
                catchphrases: {
                    positive: [
                        "Structurally sound decision, Mayor! Solid as a rock.",
                        "The infrastructure will support this! Good load-bearing.",
                        "Excellent zoning potential here! The grid likes it.",
                        "The city grid approves! Efficiency is up.",
                        "Optimized! That's what I like to see.",
                        "According to my calculations, this is perfect.",
                        "A masterpiece of urban engineering!"
                    ],
                    negative: [
                        "The zoning implications concern me... It's a mess.",
                        "This disrupts our urban planning! The grid is crying.",
                        "The infrastructure cannot sustain this! It will crumble.",
                        "Special interests are not aligned... and neither are these walls.",
                        "This violates several building codes and laws of physics!",
                        "Inefficient! We're wasting potential here.",
                        "My blueprints don't account for this chaos!"
                    ],
                    neutral: [
                        "The blueprints are unchanged. Proceeding.",
                        "A standard procedure. Nothing more. Nothing less.",
                        "Engineering sees no immediate impact. Stable.",
                        "Within acceptable tolerances. Barely.",
                        "Functionally adequate. Not pretty, but it works."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "Residential zone expanded. Utility connections established.",
                        "Standard housing unit. Efficient use of space.",
                        "Population density increasing. Infrastructure holding."
                    ],
                    shop: [
                        "Commercial structure in place. Good traffic flow here.",
                        "Retail zoning confirmed. Loading zones accessible.",
                        "Service sector expansion. Logistics look good."
                    ],
                    factory: [
                        "Heavy industry requires solid foundations. Well built!",
                        "Power grid load increasing. We can handle it.",
                        "Industrial zoning optimized. Access roads clear."
                    ],
                    park: [
                        "Green infrastructure improves drainage and air quality.",
                        "Recreational zoning. Good for spacing out density.",
                        "Landscaping complete. Soil stability is excellent."
                    ],
                    office: [
                        "High-rise potential in this location. Smart placement.",
                        "Vertical expansion is efficient. Elevators operational.",
                        "Commercial density maximized. Good skyline profile."
                    ]
                },
                zoneDialogues: [
                    "Zone synergy detected! Efficiency rating climbing!",
                    "Urban planning at its finest! The grid is optimized.",
                    "Infrastructure networks are strengthening!",
                    "Perfect zoning alignment! It's beautiful.",
                    "This district is operating at peak capacity."
                ],
                achievementDialogues: [
                    "Engineering milestone achieved! The blueprints don't lie.",
                    "Structural excellence recognized! Well planned, Mayor.",
                    "Achievement logged! City efficiency is improving.",
                    "Calculated success! The numbers don't lie.",
                    "A monumental feat of engineering!"
                ]
            }
        };

        // Typewriter state
        this.typewriterTimeout = null;
        this.isTyping = false;
        this.currentText = '';
        this.currentIndex = 0;

        // Dialogue queue system
        this.dialogueQueue = [];
        this.isProcessingQueue = false;

        // Floating text queue
        this.floatingTextQueue = [];
    }

    // Get advisor reaction based on choice effects
    getAdvisorReaction(advisor, effects) {
        let sentiment = 'neutral';
        let relevance = 0;

        // Calculate relevance and sentiment based on advisor specialty
        if (advisor.id === 'banks') {
            const fundsImpact = (effects.cityFunds || 0) + (effects.personalProfit || 0) * 2;
            relevance = Math.abs(fundsImpact);
            if (fundsImpact > 5) sentiment = 'positive';
            else if (fundsImpact < -5) sentiment = 'negative';
        } else if (advisor.id === 'ivy') {
            const happinessImpact = effects.happiness || 0;
            relevance = Math.abs(happinessImpact);
            if (happinessImpact > 5) sentiment = 'positive';
            else if (happinessImpact < -5) sentiment = 'negative';
        } else if (advisor.id === 'engineer') {
            const interestImpact = effects.specialInterest || 0;
            relevance = Math.abs(interestImpact);
            if (interestImpact > 5) sentiment = 'positive';
            else if (interestImpact < -5) sentiment = 'negative';
        }

        // Get random catchphrase
        const phrases = advisor.catchphrases[sentiment];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];

        return {
            advisor: advisor,
            sentiment: sentiment,
            relevance: relevance,
            phrase: phrase
        };
    }

    // Get the most relevant advisor for a choice
    getMostRelevantAdvisor(effects) {
        const reactions = Object.values(this.advisors).map(advisor =>
            this.getAdvisorReaction(advisor, effects)
        );

        // Sort by relevance
        reactions.sort((a, b) => b.relevance - a.relevance);

        return reactions[0];
    }

    // Create advisor portrait HTML
    createAdvisorPortrait(advisor, sentiment = 'neutral', size = 'medium') {
        const sizes = {
            small: 40,
            medium: 60,
            large: 80
        };
        const px = sizes[size] || sizes.medium;

        const sentimentClass = sentiment !== 'neutral' ? `advisor-${sentiment}` : '';

        return `
            <div class="advisor-portrait ${sentimentClass}" style="width: ${px}px; height: ${px}px;">
                <img src="${advisor.portrait}" alt="${advisor.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="advisor-fallback" style="display: none; background: ${advisor.color};">
                    ${advisor.name.charAt(0)}
                </div>
                <div class="advisor-indicator" style="background: ${sentiment === 'positive' ? '#4caf50' :
                sentiment === 'negative' ? '#f44336' :
                    '#9e9e9e'
            };"></div>
            </div>
        `;
    }

    // Create speech bubble with advisor
    createAdvisorSpeech(advisorId, text, sentiment = 'neutral') {
        const advisor = this.advisors[advisorId];
        if (!advisor) return '';

        return `
            <div class="advisor-speech-container">
                ${this.createAdvisorPortrait(advisor, sentiment, 'large')}
                <div class="advisor-speech-bubble">
                    <div class="advisor-name" style="color: ${advisor.color};">${advisor.name}</div>
                    <div class="advisor-title">${advisor.title}</div>
                    <div class="advisor-dialogue" id="advisor-dialogue-${advisorId}">
                        ${text}
                    </div>
                </div>
            </div>
        `;
    }

    // Typewriter effect for text
    typewriterEffect(element, text, speed = 30, callback = null) {
        // Clear any existing typewriter
        this.stopTypewriter();

        this.isTyping = true;
        this.currentText = text;
        this.currentIndex = 0;

        // Strip HTML tags for typing, we'll add them back
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const plainText = tempDiv.textContent || tempDiv.innerText;

        element.innerHTML = '';

        const type = () => {
            if (this.currentIndex < plainText.length) {
                element.textContent += plainText.charAt(this.currentIndex);
                this.currentIndex++;
                this.typewriterTimeout = setTimeout(type, speed);
            } else {
                this.isTyping = false;
                // Restore original HTML after typing
                element.innerHTML = text;
                if (callback) callback();
            }
        };

        type();
    }

    // Stop typewriter effect
    stopTypewriter() {
        if (this.typewriterTimeout) {
            clearTimeout(this.typewriterTimeout);
            this.typewriterTimeout = null;
        }
        this.isTyping = false;
    }

    // Skip to end of typewriter
    skipTypewriter(element, text) {
        this.stopTypewriter();
        element.innerHTML = text;
    }

    // Create floating text effect
    createFloatingText(text, x, y, color = '#ffffff', duration = 2000) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-weight: bold;
            font-size: 1.2em;
            pointer-events: none;
            z-index: 10000;
            animation: floatUp ${duration}ms ease-out forwards;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        `;

        document.body.appendChild(floatingText);

        setTimeout(() => {
            floatingText.remove();
        }, duration);

        return floatingText;
    }

    // Show stat change with floating text
    showStatChange(statName, value, element) {
        if (!element || value === 0) return;

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;

        const color = value > 0 ? '#4caf50' : '#f44336';
        const prefix = value > 0 ? '+' : '';
        const text = `${prefix}${value}`;

        this.createFloatingText(text, x, y, color);
    }

    // Generate choice card (without advisor reactions - they appear in the panel)
    generateChoiceCardWithAdvisors(choice, index, sceneKey) {
        return `
            <div class="choice-card" onclick="makeChoice('${sceneKey}', ${index})">
                <span class="choice-icon">${choice.icon}</span>
                <div class="choice-text">${choice.text}</div>
            </div>
        `;
    }

    // Show advisor in the dedicated panel with typewriter dialogue
    showAdvisorInPanel(advisorId, dialogue, sentiment = 'neutral') {
        const advisor = this.advisors[advisorId];
        if (!advisor) return;

        // Add to queue instead of showing immediately
        this.dialogueQueue.push({ advisorId, dialogue, sentiment });

        // Process queue if not already processing
        if (!this.isProcessingQueue) {
            this.processDialogueQueue();
        }
    }

    // Process dialogue queue one at a time
    processDialogueQueue() {
        if (this.dialogueQueue.length === 0) {
            this.isProcessingQueue = false;
            // Hide the advisor container when queue is empty
            const advisorContainer = document.getElementById('advisor-bar');
            if (advisorContainer) {
                advisorContainer.classList.remove('visible');
            }
            return;
        }

        this.isProcessingQueue = true;
        const { advisorId, dialogue, sentiment } = this.dialogueQueue.shift();
        const advisor = this.advisors[advisorId];

        // Get advisor container elements
        const advisorContainer = document.getElementById('advisor-bar');
        const advisorImage = document.getElementById('advisor-bar-image');
        const advisorName = document.getElementById('advisor-bar-name');
        const advisorText = document.getElementById('advisor-bar-text');

        if (!advisorContainer || !advisorImage || !advisorName || !advisorText) {
            // Skip and process next
            this.processDialogueQueue();
            return;
        }

        // Update advisor container content
        advisorImage.src = advisor.portrait;
        advisorImage.alt = advisor.name;
        advisorName.textContent = advisor.name;
        advisorName.style.color = advisor.color;

        // Clear text and show container
        advisorText.textContent = '';
        advisorText.classList.add('typing');
        advisorContainer.classList.add('visible');

        // Typewriter effect for dialogue - slower speed (40ms per character)
        this.typewriterToElement(advisorText, dialogue, 40, () => {
            advisorText.classList.remove('typing');

            // Wait before processing next dialogue
            setTimeout(() => {
                this.processDialogueQueue();
            }, 2500); // 2.5 second pause between dialogues
        });
    }

    // Clear dialogue queue (use when scene changes)
    clearDialogueQueue() {
        this.dialogueQueue = [];
        this.isProcessingQueue = false;
        this.stopTypewriter();

        // Hide advisor container
        const advisorContainer = document.getElementById('advisor-bar');
        if (advisorContainer) {
            advisorContainer.classList.remove('visible');
        }

        // Clear text
        const advisorText = document.getElementById('advisor-bar-text');
        if (advisorText) {
            advisorText.textContent = '';
            advisorText.classList.remove('typing');
        }
    }

    // Typewriter effect to a specific element
    typewriterToElement(element, text, speed = 40, callback = null) {
        this.stopTypewriter();

        this.isTyping = true;
        this.currentText = text;
        this.currentIndex = 0;

        const type = () => {
            if (this.currentIndex < text.length) {
                element.textContent += text.charAt(this.currentIndex);
                this.currentIndex++;
                this.typewriterTimeout = setTimeout(type, speed);
            } else {
                this.isTyping = false;
                if (callback) callback();
            }
        };

        type();
    }

    // Show advisor reaction based on scene/choice effects
    reactToScene(sceneKey, scene) {
        // Determine which advisor should speak based on the scene content
        let advisorId = 'banks';
        let dialogue = '';

        const storyLower = scene.story ? scene.story.toLowerCase() : '';

        // Score each advisor based on keyword matches
        const scores = {
            banks: 0,
            ivy: 0,
            engineer: 0
        };

        // Banks keywords (money, business, profit)
        const banksKeywords = ['factory', 'fund', 'invest', 'money', 'profit', 'business', 'economic', 'tax', 'budget', 'cost', 'revenue', 'income', 'deal', 'contract'];
        banksKeywords.forEach(keyword => {
            if (storyLower.includes(keyword)) scores.banks += 2;
        });

        // Ivy keywords (environment, people, happiness)
        const ivyKeywords = ['park', 'environment', 'happiness', 'citizen', 'people', 'community', 'green', 'nature', 'pollution', 'health', 'family', 'home', 'house', 'resident', 'neighborhood'];
        ivyKeywords.forEach(keyword => {
            if (storyLower.includes(keyword)) scores.ivy += 2;
        });

        // Engineer keywords (building, infrastructure, zoning)
        const engineerKeywords = ['zone', 'build', 'grid', 'construct', 'infrastructure', 'road', 'bridge', 'plan', 'design', 'structure', 'location', 'place', 'adjacent', 'area'];
        engineerKeywords.forEach(keyword => {
            if (storyLower.includes(keyword)) scores.engineer += 2;
        });

        // Find highest scoring advisor
        const maxScore = Math.max(scores.banks, scores.ivy, scores.engineer);

        if (maxScore === 0) {
            // No keywords matched - rotate based on scene key
            const advisorIds = ['banks', 'ivy', 'engineer'];
            const sceneNum = parseInt(sceneKey.replace(/\D/g, '')) || 0;
            advisorId = advisorIds[sceneNum % 3];
        } else if (scores.banks === maxScore) {
            advisorId = 'banks';
        } else if (scores.ivy === maxScore) {
            advisorId = 'ivy';
        } else {
            advisorId = 'engineer';
        }

        dialogue = this.getRandomPhrase(advisorId, 'neutral');
        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // Get a random phrase from an advisor
    getRandomPhrase(advisorId, sentiment) {
        const advisor = this.advisors[advisorId];
        if (!advisor) return '';
        const phrases = advisor.catchphrases[sentiment];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    // React to a choice being made
    reactToChoice(effects) {
        const reaction = this.getMostRelevantAdvisor(effects);
        this.showAdvisorInPanel(reaction.advisor.id, reaction.phrase, reaction.sentiment);
    }

    // React to a building being placed
    reactToBuilding(buildingType) {
        // Rotate advisor based on building type
        let advisorId = 'engineer'; // Default for buildings

        if (buildingType === 'factory' || buildingType === 'shop' || buildingType === 'office') {
            advisorId = 'banks';
        } else if (buildingType === 'park' || buildingType === 'house') {
            advisorId = 'ivy';
        }

        const advisor = this.advisors[advisorId];
        let dialogue = advisor.buildingDialogues[buildingType] || "Interesting placement, Mayor.";

        // If dialogue is an array, pick a random one
        if (Array.isArray(dialogue)) {
            dialogue = dialogue[Math.floor(Math.random() * dialogue.length)];
        }

        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // React to zone formation
    reactToZone(zoneType) {
        // Pick advisor based on zone type
        let advisorId = 'engineer';

        if (zoneType.includes('Commercial') || zoneType.includes('Industrial')) {
            advisorId = 'banks';
        } else if (zoneType.includes('Residential') || zoneType.includes('Park')) {
            advisorId = 'ivy';
        }

        const advisor = this.advisors[advisorId];
        const dialogues = advisor.zoneDialogues;
        const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // React to achievement unlock
    reactToAchievement(achievementName) {
        // Rotate through advisors for achievements
        const advisorIds = ['banks', 'ivy', 'engineer'];
        const advisorId = advisorIds[Math.floor(Math.random() * advisorIds.length)];

        const advisor = this.advisors[advisorId];
        const dialogues = advisor.achievementDialogues;
        const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // Show consequence text (advisor speaks in the panel separately)
    showConsequenceWithAdvisor(consequence, effects) {
        return `<p>${consequence}</p>`;
    }

    // Render scene narration with typewriter effect
    renderNarration(containerElement, text, callback = null) {
        const narratorBox = document.createElement('div');
        narratorBox.className = 'narrator-box';
        narratorBox.innerHTML = `
            <div class="narrator-text" id="narrator-text"></div>
            <div class="narrator-skip" onclick="narrativeManager.skipCurrentNarration()">
                Click to skip
            </div>
        `;

        containerElement.appendChild(narratorBox);

        const textElement = document.getElementById('narrator-text');
        this.typewriterEffect(textElement, text, 25, callback);
    }

    // Skip current narration
    skipCurrentNarration() {
        const textElement = document.getElementById('narrator-text');
        if (textElement && this.isTyping) {
            this.skipTypewriter(textElement, this.currentText);
        }
    }
}

// Create global narrative manager instance
const narrativeManager = new NarrativeManager();
