# 🔓 Building Unlock System Guide

## ✅ Phase 4.1 Complete: Story-Building Integration

Your game now has a **progressive unlock system** where story decisions determine which buildings become available!

---

## 🎮 How It Works

### **Unlock Flow:**

```
1. Start Game → All buildings LOCKED 🔒
              ↓
2. Make Story Choice → Buildings UNLOCK 🔓
              ↓
3. See "NEW BUILDING UNLOCKED!" notification
              ↓
4. Building card animates (spin + pop)
              ↓
5. Building becomes draggable in palette
              ↓
6. If choice includes mandatory building:
   - Overlay appears: "Place your building!"
   - Must drag & drop to continue
   - Story pauses until placement
              ↓
7. Place building → Story continues
```

---

## 🏗️ Building Unlock Path

### **Starting State:**
```
All buildings LOCKED:
🔒 House
🔒 Shop
🔒 Factory
🔒 Park
🔒 Office
```

### **After First Decision (choice1):**

#### **Option A: Accept Factory**
```
Unlocks:
✅ Factory 🏭 (industrial development)
✅ House 🏠 (worker housing)

Mandatory Placement:
Must place Factory on grid before continuing!
```

#### **Option B: Reject Factory**
```
Unlocks:
✅ Park 🌳 (environmental focus)
✅ House 🏠 (residential development)

No mandatory placement - continue story
```

### **After Second Decision:**

#### **If accepted factory → choice2A:**

**Build near river:**
```
Unlocks: ✅ Park (environmental cleanup)
```

**Build near suburban:**
```
Unlocks: ✅ Shop (commercial development)
Mandatory: Must place House
```

#### **If rejected factory → choice2B:**

**Raise taxes:**
```
Unlocks: ✅ Shop (economic support)
```

**Infrastructure projects:**
```
Unlocks: ✅ Office (government buildings)
Mandatory: Must place Office
```

---

## 🎯 Complete Unlock Tree

```
                    START (all locked)
                         |
        ┌────────────────┴────────────────┐
        |                                 |
    Accept Factory                  Reject Factory
    🏭 Factory                      🌳 Park
    🏠 House                        🏠 House
    (Must place Factory!)
        |                                 |
    ┌───┴───┐                        ┌───┴───┐
River       Suburban             Taxes    Infrastructure
🌳 Park     🏪 Shop              🏪 Shop  🏢 Office
            (Must place House!)           (Must place Office!)
```

---

## 🎨 Visual States

### **Locked Building Card:**
```
┌─────────────────────┐
│ 🔒 (grayscale)      │
│ House (faded)       │
│ 🔒 Locked (gray)    │
│ Unlock through      │
│ story choices       │
└─────────────────────┘

Appearance:
- Gray gradient background
- Dashed border
- Grayed out icon
- "Locked" badge
- Cannot drag
- 60% opacity
```

### **Unlocking Animation:**
```
Frame 1: Small + rotated left + blurred
Frame 2: Large + rotated right
Frame 3: Normal size + straight

Duration: 0.8 seconds
Effect: Spin-in with scale
```

### **Unlocked Building Card:**
```
┌─────────────────────┐
│ 🏠 (full color)     │
│ House               │
│ 💰 $10M (green)     │
│ 📊 Happiness +5     │
└─────────────────────┘

Appearance:
- White background
- Full color icon
- Green cost badge (or red if unaffordable)
- Effect description
- Draggable
```

---

## 🏗️ Mandatory Placement System

### **When Triggered:**

Certain story choices include a `building` property:
```javascript
{
    text: "Accept the factory deal",
    building: 'factory',  // ← Triggers mandatory placement
    unlocks: ['factory', 'house']
}
```

### **Placement Overlay:**
```
┌──────────────────────────────────┐
│  (Purple tinted background)      │
│                                  │
│   ┌──────────────────────┐       │
│   │   🏭 (pulsing icon)  │       │
│   │ Place Your Building! │       │
│   │ Drag Factory to grid │       │
│   │   to continue...     │       │
│   └──────────────────────┘       │
│                                  │
└──────────────────────────────────┘
```

**Features:**
- Semi-transparent purple overlay
- Centered message box
- Pulsing building icon
- Cannot dismiss manually
- Story pauses until placed
- Grid still accepts drops

---

## 🎮 Gameplay Flow Example

### **Scenario: Player chooses "Accept Factory"**

**Step 1: Make Decision**
```
Timer: 30s → Player decides at 22s
Time Bonus: +44 points
Choice: Accept Factory
```

**Step 2: Consequences Show**
```
⚡ Consequences:
- Happiness +10
- City Funds +20M
- Special Interest +15
- ⚡ Time Bonus: +44 points
- ⏰ Next Timer: +10s
```

**Step 3: Unlocks Happen**
```
🔓 NEW BUILDING UNLOCKED: 🏭 Factory!
   (Card spins and pops in palette)
   
🔓 NEW BUILDING UNLOCKED: 🏠 House!
   (Card spins and pops in palette)
```

**Step 4: Mandatory Placement**
```
Overlay appears:
"🏭 Place Your Building!"
"Drag Factory to the grid to continue!"

Player MUST:
1. Drag Factory from palette
2. Drop on grid cell
3. Pay $20M cost
4. Apply all effects
```

**Step 5: Placement Complete**
```
✨ Celebration sparkles
📊 Stats update
✅ "Mandatory building placed! Story continues..."
   
Overlay fades out
Next scene loads
```

---

## 📊 Unlock Strategy Guide

### **Early Game Unlocks:**

**Accept Factory Path:**
- ✅ Quick access to high-income building (Factory)
- ✅ House for residential development
- ⚠️ Must commit funds immediately ($20M)
- 💡 Strategy: Place factory isolated to avoid penalties

**Reject Factory Path:**
- ✅ Environmental focus (Park)
- ✅ House for residential
- ✅ No forced placement
- 💡 Strategy: Build happy residential area

### **Mid-Game Unlocks:**

**Commercial Focus (Shops):**
- Unlocked through: Suburban development or Economic policies
- Best with: Houses and Offices nearby
- Generates: Steady funds income

**Government Focus (Offices):**
- Unlocked through: Infrastructure projects
- Best with: Shops and Parks nearby
- Boosts: Special Interest support

---

## 🎯 Strategic Implications

### **Unlock Order Matters:**

**Factory-First Strategy:**
```
Turn 1: Accept Factory → Unlock Factory + House
        Must place Factory → -$20M + $10M effect = -$10M net
        
Turn 2: Funds = $60M (50 + 20 choice - 20 placement + 10 effect)
        Can afford: All buildings!
        
Result: High funds, many options
```

**Park-First Strategy:**
```
Turn 1: Reject Factory → Unlock Park + House
        No mandatory placement
        
Turn 2: Funds = $40M (50 - 10 from choice)
        Limited options but good happiness
        
Result: High happiness, limited funds
```

---

## 🔓 Unlock Notifications

### **Toast Messages:**
```
🔓 NEW BUILDING UNLOCKED: 🏠 House!
🔓 NEW BUILDING UNLOCKED: 🏪 Shop!
🔓 NEW BUILDING UNLOCKED: 🏭 Factory!
🔓 NEW BUILDING UNLOCKED: 🌳 Park!
🔓 NEW BUILDING UNLOCKED: 🏢 Office!
```

**Appearance:**
- Green toast (success style)
- Slides in from right
- Shows for 3 seconds
- Stacks if multiple unlocks

---

## ✨ Unlock Animation Details

### **Sequence:**
```css
0.0s: Card appears small (0.8×), rotated -10°, blurred
0.4s: Card grows large (1.15×), rotates +5°, sharp
0.8s: Card settles to normal (1.0×), 0°, complete

Total: 0.8 seconds
Easing: ease-out
Effect: Dramatic reveal
```

**Visual Impact:**
- Catches player's attention
- Clear feedback that something unlocked
- Professional polish

---

## 🏗️ Mandatory Placement Details

### **Trigger Conditions:**
```javascript
// In gameData choice object:
{
    building: 'factory',  // This makes it mandatory
    unlocks: ['factory']  // This unlocks it
}
```

### **Overlay Behavior:**
- **Appears**: 2.5s after choice (after consequence display)
- **Blocks**: Story progression only (not building UI)
- **Timer**: Story timer pauses, but building can be placed anytime
- **Dismisses**: Automatically when correct building placed
- **Cannot**: Close manually or skip

### **Player Must:**
1. Have the building unlocked (automatic from choice)
2. Have sufficient funds to place it
3. Find an empty grid cell
4. Drag and drop the specific building type
5. Wait for celebration and auto-continue

---

## 🎯 Design Rationale

### **Why Lock Buildings?**
1. **Tutorial Effect**: Gradual introduction of mechanics
2. **Story Integration**: Decisions have tangible effects
3. **Progression**: Sense of advancement
4. **Strategy**: Limited options force creative thinking

### **Why Mandatory Placement?**
1. **Consequences**: Decisions have immediate impact
2. **Engagement**: Active participation required
3. **Learning**: Forces players to use building system
4. **Narrative**: "You approved it, now build it!"

---

## 💡 Tips for Players

### **Planning Ahead:**

**Before Making Choice:**
- Read which buildings it unlocks
- Consider if you want those buildings
- Think about mandatory placements
- Check if you have grid space

**During Mandatory Placement:**
- Take time to find best spot (no rush!)
- Consider adjacency bonuses
- Plan for future placements
- Use strategic positioning

### **Unlock Priority:**

**Early Game:** Unlock Houses and Parks (happiness foundation)
**Mid Game:** Unlock Shops and Offices (balanced growth)
**Late Game:** Unlock Factory if funds needed

---

## 🧪 Testing the Unlock System

### **Test 1: Basic Unlock**
```
1. Start game
2. Click "Let's Begin!"
3. Choose "Accept Factory"
4. Watch for toast: "🔓 NEW BUILDING UNLOCKED: Factory!"
5. See Factory card animate in palette
6. See House card unlock too
7. Check console logs
```

### **Test 2: Mandatory Placement**
```
1. After choosing "Accept Factory"
2. Wait for consequences to show
3. Overlay appears with pulsing factory icon
4. Try to continue - can't (story blocked)
5. Drag Factory from palette
6. Drop on grid
7. Watch placement celebration
8. See "Story continues..." toast
9. Overlay fades, next scene loads
```

### **Test 3: Unlock Progression**
```
1. Make different choices
2. Track which buildings unlock
3. See unlock tree progress
4. Verify locked buildings can't be dragged
5. Verify unlocked buildings can be dragged (if affordable)
```

---

## 📊 Unlock Statistics

### **Total Unlockable Buildings:**
- 5 building types
- All start locked
- Progressive unlocking through story
- Multiple paths to unlock same building

### **Unlock Sources:**
```
House:   choice1 (both paths)
Factory: choice1 (accept path) 
Park:    choice1 (reject path), choice2A (river)
Shop:    choice2A (suburban), choice2B (taxes)
Office:  choice2B (infrastructure)
```

### **Mandatory Placements:**
```
Factory: choice1 (accept factory)
House:   choice2A (suburban area)
Office:  choice2B (infrastructure)
```

---

## 🎯 Acceptance Criteria Status

- ✅ **Buildings unlock based on choices** - Working!
- ✅ **Placement phase works correctly** - Overlay + detection
- ✅ **Timer management is smooth** - Pauses story, continues building
- ✅ **Unlock animations play** - Spin + scale + blur effect

---

## 🚀 How to Experience It

### **Full Playthrough:**

1. **Start Game** - Notice all buildings are locked 🔒
2. **Make First Choice** - Watch unlock notifications appear
3. **See Unlocked Buildings** - Cards animate in palette
4. **Mandatory Placement** (if applicable):
   - Overlay appears with building icon
   - Drag the specific building to grid
   - Story automatically continues
5. **Continue Playing** - More choices unlock more buildings
6. **Strategic Planning** - Use unlocked buildings wisely

---

## 💻 Technical Implementation

### **State Management:**
```javascript
gameState.unlockedBuildings = ['factory', 'house'];
gameState.pendingBuildingPlacement = {
    building: { id: 'factory', name: 'Factory', ... },
    nextScene: 'choice2A'
};
gameState.awaitingPlacement = true;
```

### **Unlock Check:**
```javascript
// In renderBuildingPalette():
const isUnlocked = gameState.unlockedBuildings.includes(building.id);

if (!isUnlocked) {
    // Show locked state
    card.className = 'building-card locked';
    card.draggable = false;
}
```

### **Mandatory Placement Detection:**
```javascript
// In handleGridDrop() after successful placement:
if (gameState.awaitingPlacement && 
    building.id === gameState.pendingBuildingPlacement.building.id) {
    
    completeMandatoryPlacement(); // Auto-continue story
}
```

---

## 🎨 Visual Feedback

### **Locked Card:**
- Grayscale filter on icon (🔒)
- Gray gradient background
- Dashed border
- "Unlock through story choices" text
- Cannot hover or drag

### **Unlock Animation:**
- Card rotates and scales
- Blur effect clears
- Color returns
- Pops into place
- Duration: 0.8s

### **Mandatory Overlay:**
- Purple tinted background
- Centered message box
- Pulsing building icon
- Clear instruction text
- Non-dismissable

---

## 🏆 Achievement Integration

The unlock system doesn't affect achievements directly, but unlocking buildings enables:

- **Master Planner**: Need variety of buildings
- **Green City**: Need parks unlocked
- **Industrial Tycoon**: Need factories unlocked
- **Balanced Growth**: Need all types unlocked

**Strategy**: Make diverse choices to unlock all building types!

---

## 📈 Progression Example

### **Optimal Unlock Path for All Buildings:**

**Turn 1: Accept Factory**
- Unlocks: Factory, House ✅
- Must place: Factory

**Turn 2: Build near suburban**
- Unlocks: Shop ✅
- Must place: House

**Turn 3: (Continue making choices)**
- Unlocks: Office ✅
- Unlocks: Park ✅ (if not already)

**Result**: All 5 buildings unlocked by mid-game!

---

## 🎮 Player Experience

### **Early Game:**
```
"I can only build houses... limited options"
→ Makes choices carefully to unlock variety
```

### **Mid Game:**
```
"I've unlocked shops and parks! More strategic options now"
→ Can build balanced city
```

### **Late Game:**
```
"All buildings unlocked! I can optimize my city plan"
→ Full strategic freedom
```

---

## 🔧 Customization Guide

### **To Add New Unlocks:**

1. **In gameData**, add `unlocks` array to choice:
```javascript
{
    text: "Your choice",
    effects: { ... },
    unlocks: ['park', 'shop'], // ← Buildings to unlock
    next: 'nextScene'
}
```

2. **For Mandatory Placement**, add `building`:
```javascript
{
    text: "Build something",
    building: 'factory', // ← Must be placed
    unlocks: ['factory'], // ← Must include in unlocks too
    next: 'nextScene'
}
```

### **To Change Unlock Logic:**

**Start with some unlocked:**
```javascript
// In gameState initialization:
unlockedBuildings: ['house', 'park']  // Start with these
```

**Unlock all at once:**
```javascript
// In a choice:
unlocks: ['house', 'shop', 'factory', 'park', 'office']
```

**No unlocks (free play):**
```javascript
// In initialization:
unlockedBuildings: buildingPalette.map(b => b.id)  // All unlocked
```

---

## 🐛 Edge Cases Handled

### **Player tries to drag locked building:**
- ✅ Card is not draggable
- ✅ Cursor shows "not-allowed"
- ✅ No drag events fire

### **Mandatory building but no funds:**
- ⚠️ Overlay still shows
- ⚠️ Player must earn funds somehow
- 💡 Solution: Sell other buildings to get funds

### **Player drags wrong building during mandatory:**
- ✅ Can place it normally
- ✅ Overlay stays visible
- ✅ Must still place correct building

### **Building already unlocked:**
- ✅ Skips unlock notification
- ✅ No duplicate in unlockedBuildings array
- ✅ No animation replays

---

## 📊 Unlock Statistics

### **Implementation Stats:**
- New state variables: 3
- New CSS classes: 3
- New animations: 1
- New functions: 3
- Lines added: ~150

### **Player Impact:**
- Unlocks per choice: 1-2 buildings
- Mandatory placements: ~3 per game
- Total unlockable: 5 buildings
- Unlock paths: Multiple (story dependent)

---

## 🎯 Benefits of This System

### **For Players:**
1. **Progressive Learning**: Buildings introduced gradually
2. **Meaningful Choices**: Decisions affect available options
3. **Engagement**: Active participation required
4. **Strategy**: Planning unlock paths matters

### **For Gameplay:**
1. **Pacing**: Controlled feature introduction
2. **Tutorial**: Natural learning curve
3. **Replayability**: Different unlock paths
4. **Integration**: Story and building system connected

---

## 🔊 Console Output

When unlocks happen, you'll see:
```
🔓 Unlocked building: Factory
🔓 Unlocked building: House
🏗️ Mandatory placement required: Factory
✅ Placing building: Factory at cell 25
✅ Mandatory placement complete, continuing to choice2A
```

---

## ✅ Complete Integration Checklist

- ✅ Buildings start locked
- ✅ Story choices unlock buildings
- ✅ Unlock notifications show
- ✅ Unlock animations play
- ✅ Palette updates in real-time
- ✅ Locked buildings can't be dragged
- ✅ Mandatory placement overlay works
- ✅ Placement blocks story progression
- ✅ Auto-continues when placed
- ✅ Multiple unlocks handled
- ✅ No duplicate unlocks

---

## 🎉 Success!

Your game now has a **fully integrated story-building system** where:

✅ Story decisions unlock buildings progressively  
✅ Certain choices require immediate construction  
✅ Players see clear unlock feedback  
✅ Story and building mechanics work together seamlessly  
✅ Strategic planning starts from first decision  

**The unlock system creates a cohesive narrative-driven city builder!** 🏙️✨

---

## 🚀 Try It Now!

1. **Refresh your browser**
2. **Start game** - See all buildings locked
3. **Make first choice** - Watch unlocks happen!
4. **Place mandatory building** (if required)
5. **Continue building** your city with unlocked buildings

**Your decisions shape what you can build!** 🎮

---

**Phase 4.1 Status:** ✅ COMPLETE  
**Next Phases Available:** 4.2 (Difficulty Modes), 4.3 (Achievement System), or 5+ (Polish)

