// ==================== ENHANCED NARRATIVE MANAGER ====================
// Handles all advisor dialogues, typewriter effects, and character reactions
// Features: Multi-advisor reactions, stat warnings, contextual awareness

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
                        "The investors won't be pleased...",
                        "Think of the economy, Mayor! We're not a charity.",
                        "We're hemorrhaging funds here! Plug the leak!",
                        "My spreadsheets are bleeding red ink!",
                        "This is fiscal suicide! Reconsider immediately!",
                        "I cannot endorse this financial recklessness."
                    ],
                    neutral: [
                        "The financial impact is acceptable. Barely.",
                        "Neither gain nor loss. Proceed carefully.",
                        "The numbers are balanced, for now.",
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
                zoneDialogues: {
                    'Commercial District': [
                        "A commercial district forms! Property values are soaring!",
                        "This zone will attract major investors to our city.",
                        "Retail paradise! The money will flow like water."
                    ],
                    'Industrial Zone': [
                        "Industrial might! Exports will skyrocket.",
                        "Manufacturing hub established. GDP is climbing!",
                        "The factories sing the song of prosperity!"
                    ],
                    'Residential Area': [
                        "More residents means more taxpayers. Acceptable.",
                        "Property taxes will fill our coffers nicely.",
                        "A stable tax base is forming. Good."
                    ],
                    'Business Park': [
                        "Corporate synergy! This will attract Fortune 500 companies.",
                        "A business hub of this caliber will put us on the map!",
                        "High-value real estate clustering. Magnificent!"
                    ],
                    'Green Belt': [
                        "Green space doesn't pay dividends, but I suppose it has... charm.",
                        "Property values nearby will increase. That's something.",
                        "Fine, fine. Happy citizens do spend more money."
                    ],
                    'default': [
                        "Excellent clustering! Economic synergy at its finest.",
                        "Look at that density! Maximum revenue per square foot.",
                        "A financial hub in the making. I'm impressed."
                    ]
                },
                achievementDialogues: [
                    "Achievement unlocked! This will look great in the annual report.",
                    "Impressive milestone! The shareholders will be pleased.",
                    "Success breeds success, Mayor. Keep the profits rolling!",
                    "A bonus-worthy performance! If we had bonuses...",
                    "You're making history, and money! Mostly money."
                ],
                statWarnings: {
                    fundsLow: [
                        "Mayor, our funds are critically low! We need revenue NOW!",
                        "The treasury is nearly empty! Cut costs or raise taxes!",
                        "Financial emergency! We're approaching bankruptcy!"
                    ],
                    fundsCritical: [
                        "MAYOR! We're broke! The city will collapse without funds!",
                        "This is a fiscal apocalypse! Do something immediately!"
                    ],
                    fundsHigh: [
                        "Our coffers overflow! Time to invest in growth.",
                        "Excellent reserves! We can afford expansion."
                    ]
                },
                // Reactions to other advisors
                advisorReactions: {
                    ivy: [
                        "Yes, yes, the environment... but what about the budget?",
                        "Ivy makes a fair point, but consider the revenue...",
                        "Trees are nice, but money doesn't grow on them!"
                    ],
                    engineer: [
                        "The Chief's zoning plan looks profitable. I approve.",
                        "Good infrastructure means good business. Proceed.",
                        "If it's efficient, it's profitable. I'm listening."
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. A modest start. We can do better.",
                    milestone50: "50% efficiency! The city is becoming profitable.",
                    milestone75: "75% efficiency! Investors are taking notice!",
                    milestone90: "90%+ efficiency! This is a masterclass in urban economics!"
                }
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
                        "A green choice for a brighter future!",
                        "The community thanks you, Mayor!",
                        "This brings joy to our citizens!",
                        "Harmony with nature is the true path.",
                        "I can feel the city breathing easier already.",
                        "Wonderful! A sustainable choice for generations."
                    ],
                    negative: [
                        "The people deserve better than this!",
                        "Think of the children, Mayor!",
                        "Our green spaces weep today...",
                        "Happiness cannot be sacrificed for profit!",
                        "This is a disaster for the ecosystem!",
                        "The citizens are suffering from this decision!",
                        "Nature will not forgive this transgression."
                    ],
                    neutral: [
                        "The citizens are watching... waiting.",
                        "A cautious step. The people wait.",
                        "Neither celebration nor protest today.",
                        "It's okay, but we could do better.",
                        "Balance is key. Don't tip the scales."
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
                        "Employment is good, but stress is bad."
                    ]
                },
                zoneDialogues: {
                    'Residential Area': [
                        "A thriving neighborhood emerges! Community spirit soars!",
                        "People coming together. This is what cities are about!",
                        "The citizens will love this! It feels like home."
                    ],
                    'Green Belt': [
                        "A green sanctuary! The birds are already singing!",
                        "Nature reclaims its place. This is beautiful!",
                        "Clean air, happy citizens. Perfect harmony!"
                    ],
                    'Commercial District': [
                        "I hope these businesses are eco-friendly...",
                        "Commerce is fine, but where are the trees?",
                        "At least people have places to shop locally."
                    ],
                    'Industrial Zone': [
                        "So many factories... the air quality concerns me.",
                        "I pray the workers have good conditions.",
                        "Progress shouldn't come at nature's expense."
                    ],
                    'Business Park': [
                        "Office workers need green spaces too, Mayor.",
                        "I hope there's good public transit to reduce emissions.",
                        "Corporate... but necessary for employment, I suppose."
                    ],
                    'default': [
                        "A vibrant community! You can feel the energy.",
                        "People are connecting. This brings me joy!",
                        "The neighborhood is coming alive!"
                    ]
                },
                achievementDialogues: [
                    "The people celebrate! You've made them proud, Mayor.",
                    "This achievement shows you care about our community!",
                    "Wonderful progress! The citizens are grateful.",
                    "A victory for the people and the planet!",
                    "Your heart is in the right place, and it shows."
                ],
                statWarnings: {
                    happinessLow: [
                        "Mayor, the citizens are unhappy! We need parks and homes!",
                        "Morale is plummeting! The people need your attention!",
                        "Unhappiness breeds unrest. Please help them!"
                    ],
                    happinessCritical: [
                        "CRISIS! The citizens are miserable! Act NOW!",
                        "The people are on the verge of revolt! Help them!"
                    ],
                    happinessHigh: [
                        "The citizens are joyful! What a wonderful city!",
                        "Happiness abounds! You're a beloved Mayor!"
                    ]
                },
                advisorReactions: {
                    banks: [
                        "Money isn't everything, Mr. Banks!",
                        "There's more to life than profit margins.",
                        "The people matter more than the bottom line!"
                    ],
                    engineer: [
                        "Chief, remember to include green spaces in your plans!",
                        "Efficiency is good, but don't forget the parks!",
                        "I like your zoning, but where will children play?"
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. Let's make it greener!",
                    milestone50: "50%! The city is growing harmoniously.",
                    milestone75: "75%! The citizens are thriving!",
                    milestone90: "90%+! A model sustainable city! I'm so proud!"
                }
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
                        "Structurally sound decision, Mayor!",
                        "The infrastructure will support this!",
                        "Excellent zoning potential here!",
                        "The city grid approves! Efficiency is up.",
                        "Optimized! That's what I like to see.",
                        "According to my calculations, this is perfect.",
                        "A masterpiece of urban engineering!"
                    ],
                    negative: [
                        "The zoning implications concern me...",
                        "This disrupts our urban planning!",
                        "The infrastructure cannot sustain this!",
                        "Special interests are not aligned...",
                        "This violates several building codes!",
                        "Inefficient! We're wasting potential here.",
                        "My blueprints don't account for this!"
                    ],
                    neutral: [
                        "The blueprints are unchanged. Proceeding.",
                        "A standard procedure. Nothing more.",
                        "Engineering sees no immediate impact.",
                        "Within acceptable tolerances.",
                        "Functionally adequate. It works."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "Residential zone expanded. Utilities connected.",
                        "Standard housing unit. Efficient use of space.",
                        "Population density increasing. Infrastructure holds."
                    ],
                    shop: [
                        "Commercial structure in place. Good traffic flow.",
                        "Retail zoning confirmed. Loading zones accessible.",
                        "Service sector expansion. Logistics optimized."
                    ],
                    factory: [
                        "Heavy industry requires solid foundations. Well built!",
                        "Power grid load increasing. We can handle it.",
                        "Industrial zoning optimized. Access roads clear."
                    ],
                    park: [
                        "Green infrastructure improves drainage and air quality.",
                        "Recreational zoning. Good for spacing density.",
                        "Landscaping complete. Soil stability excellent."
                    ],
                    office: [
                        "High-rise potential in this location. Smart.",
                        "Vertical expansion is efficient. Elevators operational.",
                        "Commercial density maximized. Good skyline."
                    ]
                },
                zoneDialogues: {
                    'Industrial Zone': [
                        "Zone synergy detected! Industrial efficiency at 100%!",
                        "Manufacturing cluster formed! Logistics optimized!",
                        "Heavy industry zone established. Power grid stable."
                    ],
                    'Business Park': [
                        "Corporate district synergy! Infrastructure networks aligned!",
                        "Business clustering maximizes shared utilities!",
                        "Office zone efficiency is off the charts!"
                    ],
                    'Residential Area': [
                        "Residential cluster formed. Utility networks shared.",
                        "Neighborhood zoning complete. Good density ratio.",
                        "Housing district established. Schools can be added."
                    ],
                    'Commercial District': [
                        "Commercial zone synergy! Traffic patterns optimized.",
                        "Retail district formed. Delivery logistics streamlined.",
                        "Shopping district complete. Parking adequate."
                    ],
                    'Green Belt': [
                        "Green zone established. Drainage improved citywide.",
                        "Park network formed. Air quality readings up.",
                        "Recreational zone complete. Pedestrian paths connected."
                    ],
                    'default': [
                        "Zone synergy detected! Efficiency rating climbing!",
                        "Urban planning at its finest! Grid optimized.",
                        "Perfect zoning alignment! It's beautiful."
                    ]
                },
                achievementDialogues: [
                    "Engineering milestone achieved! The blueprints don't lie.",
                    "Structural excellence recognized! Well planned.",
                    "Achievement logged! City efficiency improving.",
                    "Calculated success! The numbers don't lie.",
                    "A monumental feat of engineering!"
                ],
                statWarnings: {
                    interestLow: [
                        "Special interests are displeased! We need offices and factories!",
                        "The stakeholders are losing confidence in us!",
                        "Infrastructure support is waning. Build more!"
                    ],
                    interestCritical: [
                        "ALERT! Special interests will pull funding!",
                        "We're losing all stakeholder support! Emergency!"
                    ],
                    interestHigh: [
                        "Stakeholders are fully invested! Excellent support.",
                        "Special interests are aligned. Maximum backing!"
                    ]
                },
                advisorReactions: {
                    banks: [
                        "Mr. Banks, profitable buildings need good foundations!",
                        "Money is good, but the grid must be stable first.",
                        "I can make your investments structurally sound."
                    ],
                    ivy: [
                        "Ivy, green spaces improve overall city efficiency!",
                        "Parks aid drainage. I support your proposal.",
                        "Environmental zones have engineering benefits too."
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. The grid needs optimization.",
                    milestone50: "50%! Infrastructure is stabilizing nicely.",
                    milestone75: "75%! Near-optimal urban planning achieved!",
                    milestone90: "90%+! This is textbook perfect city engineering!"
                },
                // Special building context reactions
                adjacencyWarnings: {
                    factoryNearHouse: "Warning: Factory near residential. Noise complaints expected.",
                    factoryNearPark: "Alert: Industrial pollution will affect the park.",
                    goodPlacement: "Excellent placement! Adjacency bonuses maximized.",
                    zonePotential: "Place one more and you'll form a zone!"
                }
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

        // Track last efficiency milestone to avoid repeats
        this.lastEfficiencyMilestone = 0;

        // Track stat warning cooldowns
        this.warningCooldowns = {
            funds: 0,
            happiness: 0,
            interest: 0
        };

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

    // Typewriter effect for text
    typewriterEffect(element, text, speed = 30, callback = null) {
        this.stopTypewriter();

        this.isTyping = true;
        this.currentText = text;
        this.currentIndex = 0;

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

    // Show advisor in the dedicated panel with typewriter dialogue
    showAdvisorInPanel(advisorId, dialogue, sentiment = 'neutral') {
        const advisor = this.advisors[advisorId];
        if (!advisor) return;

        // Add to queue instead of showing immediately
        this.dialogueQueue.push({ advisorId, dialogue, sentiment });

        // Update queue indicator
        this.updateQueueIndicator();

        // Process queue if not already processing
        if (!this.isProcessingQueue) {
            this.processDialogueQueue();
        }
    }

    // Update queue indicator
    updateQueueIndicator() {
        const indicator = document.getElementById('dialogue-queue-indicator');
        if (indicator) {
            const count = this.dialogueQueue.length;
            if (count > 0) {
                indicator.textContent = count;
                indicator.style.display = 'flex';
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    // Process dialogue queue one at a time
    processDialogueQueue() {
        if (this.dialogueQueue.length === 0) {
            this.isProcessingQueue = false;
            this.updateQueueIndicator();

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

        this.updateQueueIndicator();

        // Get advisor container elements
        const advisorContainer = document.getElementById('advisor-bar');
        const advisorImage = document.getElementById('advisor-bar-image');
        const advisorName = document.getElementById('advisor-bar-name');
        const advisorText = document.getElementById('advisor-bar-text');

        if (!advisorContainer || !advisorImage || !advisorName || !advisorText) {
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

        // Typewriter effect - 40ms per character
        this.typewriterToElement(advisorText, dialogue, 40, () => {
            advisorText.classList.remove('typing');

            // Wait before processing next dialogue
            setTimeout(() => {
                this.processDialogueQueue();
            }, 2500);
        });
    }

    // Clear dialogue queue
    clearDialogueQueue() {
        this.dialogueQueue = [];
        this.isProcessingQueue = false;
        this.stopTypewriter();
        this.updateQueueIndicator();

        const advisorContainer = document.getElementById('advisor-bar');
        if (advisorContainer) {
            advisorContainer.classList.remove('visible');
        }

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

    // ==================== EVENT REACTIONS ====================

    // React to scene based on content analysis
    reactToScene(sceneKey, scene) {
        const storyLower = scene.story ? scene.story.toLowerCase() : '';

        // Score each advisor
        const scores = { banks: 0, ivy: 0, engineer: 0 };

        const keywords = {
            banks: ['factory', 'fund', 'invest', 'money', 'profit', 'business', 'economic', 'tax', 'budget', 'cost', 'revenue', 'income', 'deal', 'contract', 'corporation', 'company'],
            ivy: ['park', 'environment', 'happiness', 'citizen', 'people', 'community', 'green', 'nature', 'pollution', 'health', 'family', 'home', 'house', 'resident', 'neighborhood', 'children', 'welfare'],
            engineer: ['zone', 'build', 'grid', 'construct', 'infrastructure', 'road', 'bridge', 'plan', 'design', 'structure', 'location', 'place', 'adjacent', 'area', 'district', 'layout']
        };

        for (const [advisorId, words] of Object.entries(keywords)) {
            words.forEach(keyword => {
                if (storyLower.includes(keyword)) scores[advisorId] += 2;
            });
        }

        // Find highest scoring advisor
        const maxScore = Math.max(scores.banks, scores.ivy, scores.engineer);
        let advisorId = 'banks';

        if (maxScore === 0) {
            const advisorIds = ['banks', 'ivy', 'engineer'];
            const sceneNum = parseInt(sceneKey.replace(/\D/g, '')) || 0;
            advisorId = advisorIds[sceneNum % 3];
        } else if (scores.ivy === maxScore) {
            advisorId = 'ivy';
        } else if (scores.engineer === maxScore) {
            advisorId = 'engineer';
        }

        const dialogue = this.getRandomPhrase(advisorId, 'neutral');
        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // Get a random phrase
    getRandomPhrase(advisorId, sentiment) {
        const advisor = this.advisors[advisorId];
        if (!advisor) return '';
        const phrases = advisor.catchphrases[sentiment];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    // React to a choice being made - can trigger multiple advisors
    reactToChoice(effects) {
        const reaction = this.getMostRelevantAdvisor(effects);
        this.showAdvisorInPanel(reaction.advisor.id, reaction.phrase, reaction.sentiment);

        // If the effect is significant, a second advisor might comment
        const totalImpact = Math.abs(effects.happiness || 0) + Math.abs(effects.cityFunds || 0) + Math.abs(effects.specialInterest || 0);

        if (totalImpact >= 15 && Math.random() > 0.5) {
            // Get a different advisor to comment
            const otherAdvisors = Object.keys(this.advisors).filter(id => id !== reaction.advisor.id);
            const secondAdvisorId = otherAdvisors[Math.floor(Math.random() * otherAdvisors.length)];
            const secondReaction = this.getAdvisorReaction(this.advisors[secondAdvisorId], effects);

            // Use a shorter follow-up comment
            if (secondReaction.relevance > 3) {
                const followUp = this.advisors[secondAdvisorId].advisorReactions[reaction.advisor.id];
                if (followUp) {
                    const comment = followUp[Math.floor(Math.random() * followUp.length)];
                    this.showAdvisorInPanel(secondAdvisorId, comment, secondReaction.sentiment);
                }
            }
        }
    }

    // React to building placement with context awareness
    reactToBuilding(buildingType, cellIndex = null, gameState = null) {
        // Determine primary advisor based on building type
        let advisorId = 'engineer';

        if (buildingType === 'factory' || buildingType === 'shop' || buildingType === 'office') {
            advisorId = 'banks';
        } else if (buildingType === 'park' || buildingType === 'house') {
            advisorId = 'ivy';
        }

        const advisor = this.advisors[advisorId];
        let dialogues = advisor.buildingDialogues[buildingType];
        let dialogue = Array.isArray(dialogues) ? dialogues[Math.floor(Math.random() * dialogues.length)] : dialogues || "Interesting placement, Mayor.";

        this.showAdvisorInPanel(advisorId, dialogue);

        // Context-aware follow-up from Engineer
        if (gameState && cellIndex !== null && advisorId !== 'engineer') {
            const contextComment = this.getPlacementContext(buildingType, cellIndex, gameState);
            if (contextComment) {
                this.showAdvisorInPanel('engineer', contextComment);
            }
        }
    }

    // Get contextual comment about building placement
    getPlacementContext(buildingType, cellIndex, gameState) {
        if (!gameState || !gameState.cityGrid) return null;

        const gridSize = getGridSize();
        const cols = gridSize.cols;
        const row = Math.floor(cellIndex / cols);
        const col = cellIndex % cols;

        // Check adjacent cells
        const adjacentIndices = [
            cellIndex - cols,     // top
            cellIndex + cols,     // bottom
            cellIndex - 1,        // left
            cellIndex + 1         // right
        ].filter((idx, i) => {
            if (idx < 0 || idx >= gameState.cityGrid.length) return false;
            // Check left/right bounds
            if (i === 2 && col === 0) return false;
            if (i === 3 && col === cols - 1) return false;
            return true;
        });

        let sameTypeCount = 0;
        let hasHouseNearby = false;
        let hasParkNearby = false;
        let hasFactoryNearby = false;

        adjacentIndices.forEach(idx => {
            const adjacent = gameState.cityGrid[idx];
            if (adjacent) {
                if (adjacent.type === buildingType) sameTypeCount++;
                if (adjacent.type === 'house') hasHouseNearby = true;
                if (adjacent.type === 'park') hasParkNearby = true;
                if (adjacent.type === 'factory') hasFactoryNearby = true;
            }
        });

        // Generate contextual comment
        if (buildingType === 'factory' && hasHouseNearby) {
            return this.advisors.engineer.adjacencyWarnings.factoryNearHouse;
        }
        if (buildingType === 'factory' && hasParkNearby) {
            return this.advisors.engineer.adjacencyWarnings.factoryNearPark;
        }
        if (sameTypeCount === 2) {
            return this.advisors.engineer.adjacencyWarnings.zonePotential;
        }
        if (sameTypeCount >= 1 && (hasHouseNearby && buildingType === 'park') || (hasParkNearby && buildingType === 'house')) {
            return this.advisors.engineer.adjacencyWarnings.goodPlacement;
        }

        return null;
    }

    // React to zone formation - multiple advisors comment
    reactToZone(zoneType, zoneSize = 3) {
        // Primary advisor based on zone type
        let primaryAdvisor = 'engineer';
        let secondaryAdvisor = null;

        if (zoneType.includes('Commercial') || zoneType.includes('Industrial') || zoneType.includes('Business')) {
            primaryAdvisor = 'banks';
            secondaryAdvisor = 'engineer';
        } else if (zoneType.includes('Residential') || zoneType.includes('Green')) {
            primaryAdvisor = 'ivy';
            secondaryAdvisor = 'engineer';
        } else {
            primaryAdvisor = 'engineer';
            secondaryAdvisor = zoneType.includes('Office') ? 'banks' : 'ivy';
        }

        // Primary advisor speaks
        const advisor = this.advisors[primaryAdvisor];
        const zoneDialogues = advisor.zoneDialogues[zoneType] || advisor.zoneDialogues['default'];
        const dialogue = zoneDialogues[Math.floor(Math.random() * zoneDialogues.length)];
        this.showAdvisorInPanel(primaryAdvisor, dialogue);

        // For larger zones, secondary advisor comments too
        if (zoneSize >= 4 && secondaryAdvisor) {
            const secondary = this.advisors[secondaryAdvisor];
            const secondaryDialogues = secondary.zoneDialogues[zoneType] || secondary.zoneDialogues['default'];
            const secondaryDialogue = secondaryDialogues[Math.floor(Math.random() * secondaryDialogues.length)];
            this.showAdvisorInPanel(secondaryAdvisor, secondaryDialogue);
        }
    }

    // React to achievement unlock
    reactToAchievement(achievementName) {
        // Rotate through advisors
        const advisorIds = ['banks', 'ivy', 'engineer'];
        const advisorId = advisorIds[Math.floor(Math.random() * advisorIds.length)];

        const advisor = this.advisors[advisorId];
        const dialogue = advisor.achievementDialogues[Math.floor(Math.random() * advisor.achievementDialogues.length)];

        this.showAdvisorInPanel(advisorId, dialogue);
    }

    // Check and warn about stat thresholds
    checkStatThresholds(gameState) {
        const now = Date.now();

        // Check funds
        if (gameState.cityFunds <= 10 && now - this.warningCooldowns.funds > 30000) {
            this.warningCooldowns.funds = now;
            const warnings = gameState.cityFunds <= 5
                ? this.advisors.banks.statWarnings.fundsCritical
                : this.advisors.banks.statWarnings.fundsLow;
            this.showAdvisorInPanel('banks', warnings[Math.floor(Math.random() * warnings.length)]);
        }

        // Check happiness
        if (gameState.happiness <= 20 && now - this.warningCooldowns.happiness > 30000) {
            this.warningCooldowns.happiness = now;
            const warnings = gameState.happiness <= 10
                ? this.advisors.ivy.statWarnings.happinessCritical
                : this.advisors.ivy.statWarnings.happinessLow;
            this.showAdvisorInPanel('ivy', warnings[Math.floor(Math.random() * warnings.length)]);
        }

        // Check special interest
        if (gameState.specialInterest <= 15 && now - this.warningCooldowns.interest > 30000) {
            this.warningCooldowns.interest = now;
            const warnings = gameState.specialInterest <= 8
                ? this.advisors.engineer.statWarnings.interestCritical
                : this.advisors.engineer.statWarnings.interestLow;
            this.showAdvisorInPanel('engineer', warnings[Math.floor(Math.random() * warnings.length)]);
        }
    }

    // React to efficiency milestones
    reactToEfficiency(efficiency) {
        let milestone = 0;
        if (efficiency >= 90) milestone = 90;
        else if (efficiency >= 75) milestone = 75;
        else if (efficiency >= 50) milestone = 50;
        else if (efficiency >= 25) milestone = 25;

        if (milestone > this.lastEfficiencyMilestone) {
            this.lastEfficiencyMilestone = milestone;

            // Rotate which advisor celebrates
            const advisorIds = ['engineer', 'banks', 'ivy'];
            const advisorId = advisorIds[Math.floor(milestone / 25) % 3];

            const milestoneKey = `milestone${milestone}`;
            const dialogue = this.advisors[advisorId].efficiencyDialogues[milestoneKey];

            if (dialogue) {
                this.showAdvisorInPanel(advisorId, dialogue);
            }
        }
    }

    // React to timer warning
    reactToTimerWarning(secondsLeft) {
        if (secondsLeft === 10) {
            this.showAdvisorInPanel('engineer', "10 seconds remaining! Decide quickly, Mayor!");
        } else if (secondsLeft === 5) {
            this.showAdvisorInPanel('ivy', "Hurry! The citizens await your decision!");
        }
    }

    // Show consequence text
    showConsequenceWithAdvisor(consequence, effects) {
        return `<p>${consequence}</p>`;
    }

    // Generate choice card
    generateChoiceCardWithAdvisors(choice, index, sceneKey) {
        return `
            <div class="choice-card" onclick="makeChoice('${sceneKey}', ${index})">
                <span class="choice-icon">${choice.icon}</span>
                <div class="choice-text">${choice.text}</div>
            </div>
        `;
    }

    // Render scene narration with typewriter
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
            this.stopTypewriter();
            textElement.innerHTML = this.currentText;
        }
    }
}

// Create global narrative manager instance
const narrativeManager = new NarrativeManager();
