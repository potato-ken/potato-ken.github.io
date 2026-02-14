const CONFIG = {
  positions: {
    state0: { left: '5vw', top: '5vh' },
    state1: { left: '75vw', top: '45vh' },
    state2: { left: '10vw', top: '80vh' },
    state3: { left: '15vw', top: '45vh' },
    state4: { left: '50vw', top: '50vh' },
  },
  textRevealDelay: 100, // ms delay before text appears
};

let currentState = 0;
const bee = document.getElementById('bee');
const valentineMessage = document.getElementById('valentine-message');

// Initialize bee at state 0
function initializeBee() {
  bee.classList.add('state-0');
}

// Set bee position based on state
function setBeePosition(state) {
  // Remove all state classes
  for (let i = 0; i <= 4; i++) {
    bee.classList.remove(`state-${i}`);
  }
  // Add new state class
  bee.classList.add(`state-${state}`);
}

// Reveal valentine message image
function revealValentineMessage() {
  valentineMessage.classList.add('show');
}

// Handle bee click
function handleBeeClick() {
  if (currentState < 4) {
    currentState++;
    setBeePosition(currentState);

    // Reveal message image on 4th click
    if (currentState === 4) {
      setTimeout(revealValentineMessage, CONFIG.textRevealDelay);
    }
  }
}

// Add click listener to bee
bee.addEventListener('click', handleBeeClick);

// Initialize on page load
window.addEventListener('load', initializeBee);
