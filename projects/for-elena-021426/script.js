const CONFIG = {
  positions: {
    state0: { left: '20vw', top: '25vh', flip: false, rotate: 0 },
    state1: { left: '75vw', top: '35vh', flip: true, rotate: 40 },
    state2: { left: '18vw', top: '70vh', flip: false, rotate: 340 },
    state3: { left: '70vw', top: '63vh', flip: true, rotate: 20 },
    state4: { left: '65vw', top: '50vh', flip: true, rotate: 50 },
    state5: { left: '38vw', top: '45vh', flip: false, rotate: 320 },
  },
  textRevealDelay: 100, // ms delay before message appears
};

let currentState = 0;
const bee = document.getElementById('bee');
const valentineMessage = document.getElementById('valentine-message');
const clickHint = document.getElementById('click-me-hint');

// Initialize bee at state 0
function initializeBee() {
  setBeePosition(0);
  positionClickHint();
}

// Position the "Click me" hint next to the bee
function positionClickHint() {
  const pos = CONFIG.positions.state0;
  // Parse the vw/vh values and position hint to the right of bee
  const leftValue = parseInt(pos.left);
  const topValue = parseInt(pos.top);
  clickHint.style.left = `${leftValue + 10}vw`;
  clickHint.style.top = `${topValue - 3}vh`;
  clickHint.style.transform = 'translate(0, -50%)';
}

// Set bee position based on state
function setBeePosition(state) {
  const pos = CONFIG.positions[`state${state}`];
  bee.style.left = pos.left;
  bee.style.top = pos.top;

  // Build transform string
  const scaleX = pos.flip ? -1 : 1;
  const rotate = pos.rotate || 0;
  bee.style.transform = `translate(-50%, -50%) scaleX(${scaleX}) rotate(${rotate}deg)`;
}

// Reveal valentine message image
function revealValentineMessage() {
  valentineMessage.classList.add('show');
}

// Handle bee click
function handleBeeClick() {
  if (currentState < 5) {
    // Hide the click hint after first click
    if (currentState === 0) {
      clickHint.classList.add('hidden');
    }

    currentState++;
    setBeePosition(currentState);

    // Reveal message image on 5th click
    if (currentState === 5) {
      setTimeout(revealValentineMessage, CONFIG.textRevealDelay);
    }
  }
}

// Add click listener to bee
bee.addEventListener('click', handleBeeClick);

// Initialize on page load
window.addEventListener('load', initializeBee);
