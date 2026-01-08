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
                        "Excellent! Mayor Pawsworth, you've got the financial instincts of a Wall Street lion!",
                        "Now THAT'S how you make the economy purr! Well done!",
                        "The investors are roaring with approval, Your Stripedness!",
                        "Money well spent! Even a tiger knows when to pounce on opportunity.",
                        "You've earned your stripes today, Mayor! The treasury thanks you.",
                        "I smell profit! Smells better than a fresh catch, doesn't it?",
                        "Ka-ching! That's the sound of our city prowling toward prosperity!"
                    ],
                    negative: [
                        "Mayor Pawsworth, we're not running a charity zoo here!",
                        "This will have our budget limping like wounded prey...",
                        "Think of the economy! We can't just give away our kill!",
                        "We're bleeding money faster than a gazelle at dinnertime!",
                        "Your Stripedness, my spreadsheets are turning redder than raw meat!",
                        "This is financial suicide! Even apex predators need to eat!",
                        "I cannot endorse this! We'll be the hunted, not the hunters!"
                    ],
                    neutral: [
                        "The numbers are... acceptable. Barely worth a tail twitch.",
                        "Neither feast nor famine, Mayor Pawsworth.",
                        "Balanced like a tiger on a tightrope, I suppose.",
                        "Not exciting, but it won't get us declawed either.",
                        "The market prowls steady. No need to show our claws yet."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "More dens for the pride! Property taxes will flow nicely.",
                        "Every tiger needs a territory, Mayor. Smart thinking!",
                        "Housing market's hot! Strike while the iron's as hot as your stripes!"
                    ],
                    shop: [
                        "Commerce! Where predator meets profit, Your Stripedness!",
                        "Sales tax revenue! Music to my ears - better than a purr!",
                        "Small businesses are the gazelles that feed our economy!"
                    ],
                    factory: [
                        "Industrial might! This'll put some roar in our economic engine!",
                        "Production means profit! Let the machinery purr!",
                        "Jobs and exports - the meat and potatoes of any tiger's economy!"
                    ],
                    park: [
                        "Parks? Well... even tigers need somewhere to stretch and sun themselves.",
                        "Not profitable, but happy citizens do hunt for bargains more...",
                        "Fine, fine. Even Wall Street tigers need their jungle gyms."
                    ],
                    office: [
                        "Corporate territory! The concrete jungle expands!",
                        "White-collar prey... I mean, jobs! Excellent, Mayor Pawsworth!",
                        "Skyscrapers reaching as high as a tiger's ambitions!"
                    ]
                },
                zoneDialogues: {
                    'Commercial District': [
                        "A shopping jungle forms! Mayor Pawsworth, you're a retail predator!",
                        "This zone will attract the biggest financial tigers to our city!",
                        "Commerce paradise! Money flowing like a river full of salmon!"
                    ],
                    'Industrial Zone': [
                        "Industrial strength! Our city roars with productive power!",
                        "Manufacturing might! We're the apex predator of production!",
                        "The factories purr with prosperity, Your Stripedness!"
                    ],
                    'Residential Area': [
                        "More taxpayers joining the pride. Acceptable.",
                        "Property taxes from all these dens will fatten our coffers nicely.",
                        "A stable tax base - every tiger needs a steady food source."
                    ],
                    'Business Park': [
                        "Corporate tigers gathering! This is our financial hunting ground!",
                        "Mayor Pawsworth, you've created a watering hole for wealth!",
                        "High-value territory! Even lone tigers respect this achievement!"
                    ],
                    'Green Belt': [
                        "Green space? Well, even I admit tigers need their jungle...",
                        "Property values will rise. Tigers do prefer scenic hunting grounds.",
                        "Fine, Mayor. Happy citizens are generous citizens."
                    ],
                    'default': [
                        "Excellent territorial expansion, Your Stripedness!",
                        "Maximum profit per paw print! Magnificent!",
                        "A financial jungle in the making. You're the apex mayor!"
                    ]
                },
                achievementDialogues: [
                    "Achievement unlocked! The shareholders are purring with delight!",
                    "Impressive, Mayor Pawsworth! You've earned your economic stripes!",
                    "Success! You hunt profit like a true financial predator!",
                    "Bonus-worthy! If we paid bonuses to tigers, that is...",
                    "You're making history AND money! Mostly money, Your Stripedness!"
                ],
                statWarnings: {
                    fundsLow: [
                        "Mayor Pawsworth! Our treasury is emptier than a tiger's stomach in winter!",
                        "We're down to our last gazelle! Cut costs or hunt for revenue!",
                        "Financial emergency! Even tigers can't survive on pride alone!"
                    ],
                    fundsCritical: [
                        "MAYOR! We're BROKE! The city's about to become prey!",
                        "This is catastrophic! Do something before we're all declawed!"
                    ],
                    fundsHigh: [
                        "Our coffers are full as a tiger after a feast! Time to expand territory!",
                        "Excellent reserves, Your Stripedness! We can afford to prowl boldly!"
                    ]
                },
                advisorReactions: {
                    ivy: [
                        "Yes, yes, Ivy wants to save every blade of grass... but who pays for it?",
                        "Trees are lovely, but money doesn't grow on them, despite what Ivy thinks!",
                        "Ivy's bleeding heart will bleed our budget dry!"
                    ],
                    engineer: [
                        "The Chief's infrastructure looks profitable. I approve!",
                        "Good bones make good business. Build away, Chief!",
                        "Efficiency equals profit. The Chief gets it!"
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. A cub's first hunt. We can do better, Mayor Pawsworth.",
                    milestone50: "50% efficiency! The city's starting to show its stripes!",
                    milestone75: "75% efficiency! Investors are circling like hungry tigers!",
                    milestone90: "90%+ efficiency! Mayor Pawsworth, you're the apex of urban economics!"
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
                        "Mayor Pawsworth, you're proving tigers CAN change their stripes!",
                        "The citizens are purring with joy! Nature approves!",
                        "A green choice! Even a carnivore can care for the ecosystem!",
                        "You're giving our city room to breathe, Your Stripedness!",
                        "Beautiful! Harmony between predator and paradise!",
                        "The urban jungle is healing! Thank you, Mayor Pawsworth!",
                        "Wonderful! Future cubs will thank you for this!"
                    ],
                    negative: [
                        "Mayor Pawsworth, just because you're a predator doesn't mean you should prey on citizens!",
                        "Think of the cubs! What world are we leaving them?",
                        "Our green spaces are disappearing faster than antelope at a tiger convention!",
                        "Happiness isn't something you can hunt and capture!",
                        "This is a catastrophe! And not the fun cat kind!",
                        "The citizens need nurturing, not just surviving!",
                        "Even tigers need trees to shade under, Mayor!"
                    ],
                    neutral: [
                        "The citizens watch with cautious eyes, like deer at a watering hole.",
                        "A careful step, Mayor Pawsworth. The pack is waiting.",
                        "Neither roar of approval nor hiss of displeasure today.",
                        "It's okay, but remember - even tigers need balance in nature.",
                        "The ecosystem remains stable... for now."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "New dens for families! Every creature needs a safe home, Mayor Pawsworth!",
                        "Homes where cubs can grow! The community strengthens!",
                        "Even lone tigers eventually need a pride, Mayor!"
                    ],
                    shop: [
                        "Local businesses! Where the community gathers like a watering hole!",
                        "Supporting local! Better than any corporate predator!",
                        "Small shops have big hearts, Your Stripedness!"
                    ],
                    factory: [
                        "A factory... I hope it won't pollute our hunting grounds, Mayor.",
                        "Industry is necessary, but at what cost to our natural habitat?",
                        "Please ensure the workers aren't treated like prey, Mayor Pawsworth."
                    ],
                    park: [
                        "Beautiful! Every tiger needs their jungle, even in the city!",
                        "Green spaces! Where citizens can be free, not caged!",
                        "Thank you, Mayor Pawsworth! Nature and nurture combined!"
                    ],
                    office: [
                        "More jobs, but remember - even tigers need work-life balance!",
                        "Glass towers... I hope they have bird-safe glass, Your Stripedness.",
                        "Corporate cages... at least make them comfortable ones!"
                    ]
                },
                zoneDialogues: {
                    'Residential Area': [
                        "A thriving pride emerges! Community spirit soars, Mayor Pawsworth!",
                        "Families gathering! This is what makes a city more than just territory!",
                        "The citizens feel at home - not like prey, but like pride!"
                    ],
                    'Green Belt': [
                        "A green sanctuary! Even urban tigers need their jungle!",
                        "Nature reclaims its rightful place! The birds sing for you, Mayor!",
                        "Clean air, happy citizens! This is the habitat we need!"
                    ],
                    'Commercial District': [
                        "Commerce is fine, but where will the butterflies land, Mayor Pawsworth?",
                        "Shopping... but at what cost to our green spaces?",
                        "At least it's local business, not some corporate predator."
                    ],
                    'Industrial Zone': [
                        "So much concrete... are we building a city or a cage, Mayor?",
                        "I hope these factories don't turn our air toxic!",
                        "Progress shouldn't mean turning paradise into wasteland!"
                    ],
                    'Business Park': [
                        "Corporate territory... remember, Mayor, even tigers can't eat money.",
                        "I hope there's green space between all that gray!",
                        "Jobs are good, but not at the cost of our souls!"
                    ],
                    'default': [
                        "The community grows! Like a healthy ecosystem!",
                        "People connecting - that's the real treasure, Mayor Pawsworth!",
                        "Life finds a way, even in the concrete jungle!"
                    ]
                },
                achievementDialogues: [
                    "The people celebrate! Mayor Pawsworth has a heart under those stripes!",
                    "This proves even apex predators can be protectors!",
                    "Wonderful! You're not just a tiger, you're a guardian!",
                    "A victory for both the wild and the mild!",
                    "Your legacy will outlive all nine lives, Mayor!"
                ],
                statWarnings: {
                    happinessLow: [
                        "Mayor Pawsworth, the citizens are miserable! They need more than just survival!",
                        "Morale is lower than a tiger's belly in tall grass! Help them!",
                        "Unhappy citizens make for unstable territory, Your Stripedness!"
                    ],
                    happinessCritical: [
                        "CRISIS! The citizens might flee like startled gazelles!",
                        "Mayor! They're on the verge of revolt! Show them you care!"
                    ],
                    happinessHigh: [
                        "The citizens are joyful! They're purring louder than you, Mayor!",
                        "Happiness abounds! You're not just feared, you're loved!"
                    ]
                },
                advisorReactions: {
                    banks: [
                        "Mr. Banks only sees dollar signs, not living beings!",
                        "There's more to life than being the richest tiger in the jungle!",
                        "Banks would pave paradise for a penny more profit!"
                    ],
                    engineer: [
                        "Chief, your blueprints need more green and less gray!",
                        "Efficiency is good, but don't forget the heart of the city!",
                        "Where will the children play in your perfect grid, Chief?"
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. The ecosystem is finding its balance, Mayor.",
                    milestone50: "50%! The urban jungle is starting to thrive!",
                    milestone75: "75%! Citizens and nature in harmony - well done, Your Stripedness!",
                    milestone90: "90%+! A sustainable paradise! Even for a tiger!"
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
                        "Structurally sound as a tiger's den, Mayor Pawsworth!",
                        "The infrastructure can handle even your mighty paws!",
                        "Excellent zoning! Organized like a perfect hunt pattern!",
                        "The city grid purrs with efficiency, Your Stripedness!",
                        "Optimized! Sharp as your claws, smooth as your stride!",
                        "My calculations show this is purrfect, Mayor!",
                        "Engineering excellence worthy of an apex predator!"
                    ],
                    negative: [
                        "Mayor Pawsworth, this violates the natural order of urban planning!",
                        "The infrastructure will collapse faster than a house of cards in a tiger cage!",
                        "This disrupts the entire ecosystem of our city grid!",
                        "Even a tiger can't ignore the laws of physics, Your Stripedness!",
                        "My blueprints are roaring in protest!",
                        "Inefficient! We're wasting more potential than a tiger going vegetarian!",
                        "This is chaos! Not even controlled chaos - just chaos!"
                    ],
                    neutral: [
                        "Within tolerance. No need to sharpen claws over this.",
                        "Standard procedure. Nothing to roar about, Mayor.",
                        "The blueprints remain stable, like a resting tiger.",
                        "Functionally adequate. It won't win awards, but it works.",
                        "The grid accepts this change without complaint."
                    ]
                },
                buildingDialogues: {
                    house: [
                        "Residential expansion confirmed. Each den properly connected to utilities.",
                        "Housing density optimal. Even tigers need neighbors, Mayor!",
                        "Population capacity increased. The pride grows!"
                    ],
                    shop: [
                        "Commercial node established. Traffic patterns optimized for the hunt... I mean, shopping!",
                        "Retail infrastructure solid. Can handle Black Friday stampedes!",
                        "Service sector positioned perfectly. Efficient as a tiger's hunting route!"
                    ],
                    factory: [
                        "Heavy industry locked in! Foundation strong enough for a tiger's weight!",
                        "Industrial capacity roaring to life! Power grid holding steady!",
                        "Manufacturing base established. Purring like a well-oiled machine!"
                    ],
                    park: [
                        "Green infrastructure improves drainage. Even engineers appreciate nature, Mayor!",
                        "Recreational zoning confirmed. Every tiger needs room to play!",
                        "Natural spacing achieved. The grid breathes easier!"
                    ],
                    office: [
                        "Vertical expansion initiated! Reaching as high as a tiger's leap!",
                        "Commercial density maximized. The skyline has new stripes!",
                        "High-rise approved. Engineering marvels for an engineering marvel of a mayor!"
                    ]
                },
                zoneDialogues: {
                    'Industrial Zone': [
                        "Industrial synergy achieved! The machinery roars in harmony, Mayor Pawsworth!",
                        "Manufacturing cluster operational! Efficient as a tiger's hunt!",
                        "Heavy industry zone purring at maximum capacity!"
                    ],
                    'Business Park': [
                        "Corporate infrastructure aligned! The concrete jungle takes shape!",
                        "Business clustering achieved! Synergy worthy of a tiger's coordination!",
                        "Office efficiency off the charts! Even you'd be impressed, Your Stripedness!"
                    ],
                    'Residential Area': [
                        "Residential grid optimized. Every tiger has their territory now!",
                        "Neighborhood infrastructure complete. The pride is housed!",
                        "Housing efficiency achieved. Dens for all!"
                    ],
                    'Commercial District': [
                        "Commercial zone synchronized! Traffic flows like a river!",
                        "Retail district operational. The shopping hunt can begin!",
                        "Market infrastructure perfected, Mayor Pawsworth!"
                    ],
                    'Green Belt': [
                        "Green zone integrated! Nature and engineering in balance!",
                        "Park network connected. Even I appreciate this, Your Stripedness!",
                        "Recreational grid complete. Room for tigers to roam!"
                    ],
                    'default': [
                        "Zone synergy detected! The grid roars with approval!",
                        "Urban planning perfection! Worthy of a tiger's precision!",
                        "Optimal configuration achieved, Mayor Pawsworth!"
                    ]
                },
                achievementDialogues: [
                    "Engineering milestone reached! Even a tiger can appreciate good design!",
                    "Structural excellence! Built to last longer than nine lives!",
                    "Achievement calculated and confirmed, Your Stripedness!",
                    "The numbers don't lie - you're an apex engineer, Mayor!",
                    "Monumental! This infrastructure could support a thousand tigers!"
                ],
                statWarnings: {
                    interestLow: [
                        "Mayor Pawsworth, the stakeholders are getting skittish as antelope!",
                        "Infrastructure support is wavering! We need to show our strength!",
                        "Special interests are prowling elsewhere! Build to bring them back!"
                    ],
                    interestCritical: [
                        "ALERT! Stakeholders fleeing like prey from a predator!",
                        "Emergency, Your Stripedness! We're losing all support!"
                    ],
                    interestHigh: [
                        "Stakeholders fully invested! They trust the tiger's vision!",
                        "Maximum support achieved! Even lone wolves want in!"
                    ]
                },
                advisorReactions: {
                    banks: [
                        "Mr. Banks, even golden buildings need solid foundations!",
                        "Profit is good, but the infrastructure must support it!",
                        "I'll make your money-making dreams structurally sound!"
                    ],
                    ivy: [
                        "Ivy's right - green spaces improve overall grid efficiency!",
                        "Nature and engineering can coexist. I've calculated it!",
                        "Environmental zones have surprising structural benefits!"
                    ]
                },
                efficiencyDialogues: {
                    milestone25: "25% efficiency. The grid needs sharpening, like claws on a scratching post.",
                    milestone50: "50%! Infrastructure prowling toward optimization!",
                    milestone75: "75%! Near-purrfect urban planning, Mayor Pawsworth!",
                    milestone90: "90%+! Engineering excellence worthy of a tiger's precision!"
                },
                adjacencyWarnings: {
                    factoryNearHouse: "Warning! Factories near dens will disturb the pride's sleep!",
                    factoryNearPark: "Alert! Industrial pollution will spoil the hunting grounds!",
                    goodPlacement: "Excellent positioning! Strategic as a tiger's ambush!",
                    zonePotential: "One more and you'll mark this territory as a zone!"
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
        if (!advisor) {
            console.warn('⚠️ Advisor not found:', advisorId);
            return;
        }

        console.log('📢 Adding dialogue to queue:', { advisorId: advisor.name, dialogue: dialogue.substring(0, 50) + '...' });

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

        console.log('🎤 Processing dialogue from queue:', { advisorId, advisor: advisor?.name });

        this.updateQueueIndicator();

        // Get advisor container elements
        const advisorContainer = document.getElementById('advisor-bar');
        const advisorImage = document.getElementById('advisor-bar-image');
        const advisorName = document.getElementById('advisor-bar-name');
        const advisorText = document.getElementById('advisor-bar-text');

        console.log('🎯 Found elements:', { advisorContainer: !!advisorContainer, advisorImage: !!advisorImage, advisorName: !!advisorName, advisorText: !!advisorText });

        if (!advisorContainer || !advisorImage || !advisorName || !advisorText) {
            console.error('❌ Missing required dialogue elements! Container:', !!advisorContainer, 'Image:', !!advisorImage, 'Name:', !!advisorName, 'Text:', !!advisorText);
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
        console.log('🏢 reactToBuilding called with:', buildingType);

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

        console.log('💬 Building dialogue:', { buildingType, advisorId, dialogue: dialogue.substring(0, 50) + '...' });

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
        console.log('🏘️ reactToZone called with:', zoneType);

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
        console.log('🌆 Zone dialogue:', { zoneType, primaryAdvisor, dialogue: dialogue.substring(0, 50) + '...' });
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
        console.log('🏆 reactToAchievement called with:', achievementName);

        // Rotate through advisors
        const advisorIds = ['banks', 'ivy', 'engineer'];
        const advisorId = advisorIds[Math.floor(Math.random() * advisorIds.length)];

        const advisor = this.advisors[advisorId];
        const dialogue = advisor.achievementDialogues[Math.floor(Math.random() * advisor.achievementDialogues.length)];

        console.log('🎉 Achievement dialogue:', { achievementName, advisorId, dialogue: dialogue.substring(0, 50) + '...' });

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
console.log('✅ Global narrativeManager created successfully', narrativeManager);
