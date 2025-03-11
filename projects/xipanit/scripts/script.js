import { grabText } from './grab-text.js';
import { generateHints } from './generate-hints.js';
import { formatHints } from './format-hints.js';
import { gradeTranslation } from './grade-translation.js';

document.addEventListener('DOMContentLoaded', function() {
    // Create an immediately invoked async function, this helps us use await
    (async function() {  
        const langConfirmButton = document.getElementById('langConfirmButton');
        let textData = null;
        let hintData = null;
        let sourceLang = null;
        let targetLang = null;
        
        const hintToggle = document.createElement('button');
        hintToggle.textContent = 'Hints';
        hintToggle.id = 'hintToggle';
        let hintToggleState = false; // Initialise hint toggle state as off by default

        let activeModal = null; // Initialise hint word modal

        let hintPointDeduction = 0; // Initialise hint deduction

        // Handle language confirm button click
        if (langConfirmButton) {
            langConfirmButton.addEventListener('click', async () => {
                console.log("Language confirm click");

                addToChatQueue("Sure!", 'user', [], 'userConfirm', false);

                const sourceLangSelect = document.getElementById('sourceLang');
                const targetLangSelect = document.getElementById('targetLang');
                sourceLang = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
                targetLang = targetLangSelect.options[targetLangSelect.selectedIndex].text;
                
                await addMessageWithLoading(async () => {
                    textData = await grabText("false");
                    hintData = await generateHints(sourceLang, targetLang, textData.text);
                    const formattedText = formatHints(textData, hintData);
                    return formattedText;
                }, 'system', [], 'sourceSeg', true);

                const sourceSeg = document.getElementById('sourceSeg');
                sourceSeg.appendChild(hintToggle); // Append hint toggle into div

                // Handle hint word click
                let revealedHintWords = new Set();
                sourceSeg.addEventListener('click', (e) => {
                    if (!hintToggleState) return; // Do nothing if hint toggle is off
                    const word = e.target;
                    console.log("Clicked on word ", word);
                    if (!word.classList.contains('hint-word')) return; // Do nothing if the clicked word is not a hint word

                    // Deduct points only if the word has not been clicked before
                    if (!revealedHintWords.has(word.textContent)) {
                        const deductionLevels = [3, 2, 1]
                        hintPointDeduction = hintPointDeduction + deductionLevels[word.dataset.difficulty - 1];
                        console.log("Total points deducted:", hintPointDeduction);
                    }

                    revealedHintWords.add(word.textContent); // Store words that have already been clicked

                    // Remove existing modal
                    if (activeModal) activeModal.remove();

                    // Create hint word modal
                    const modal = document.createElement('div');
                    modal.className = 'translation-modal';
                    modal.textContent = word.dataset.translation;

                    // Position modal
                    const rect = word.getBoundingClientRect();
                    modal.style.left = `${rect.left}px`;
                    modal.style.top = `${rect.bottom + 5}px`;

                    document.body.appendChild(modal);
                    activeModal = modal;
                    console.log("Modal appended:", modal);

                    // Close modal on click outside or on the same word
                    const clickHandler = (e) => {
                        if (!modal.contains(e.target)) {
                            console.log("Click detected to close modal");
                            modal.remove();
                            document.removeEventListener('click', clickHandler);
                            activeModal = null;
                        }
                    };
                    setTimeout(() => {
                        document.addEventListener('click', clickHandler);
                    }, 0);
                });

            });
        }

        // Handle hint toggle button click
        hintToggle.addEventListener('click', async () => {
            hintToggleState = !hintToggleState; // Flip toggle state
            console.log("Hint toggled to", hintToggleState);

            // Toggle highlight of hint words according to hintToggleState
            document.querySelectorAll('.hint-word').forEach(word => {
                word.classList.toggle('highlight', hintToggleState);
            });
        });

        // Submit button for user input (calls gradeTranslation)
        // Respond back with output for gradeTranslation

        // Handle submit button click
        const sendButton = document.getElementById('sendButton');
        sendButton.addEventListener('click', async () => {
            console.log("Send button clicked");

            // Add user input to chat
            // Start loading animation for response
            //  Submit user input to API Gateway, grade-translation endpoint
            //  Display response in chat

            const targetSeg = document.getElementById('targetSeg').value;
            addToChatQueue(targetSeg, 'user', [], 'userInput', false);
            document.getElementById('targetSeg').value = '';

            let gradeData = null;
            await addMessageWithLoading(async () => {
                gradeData = await gradeTranslation(sourceLang, targetLang, targetSeg, textData.text);

                let hintDeductionMessage = '';
                if (hintPointDeduction > 0) {
                    hintDeductionMessage = `Your original score is ${gradeData.score}. Deducting ${hintPointDeduction} point(s) because you used hints. `;
                }
                
                return `${hintDeductionMessage}Your final score is ${gradeData.score - hintPointDeduction}.`;
            }, 'system', [], 'resultScore', true);

            await addMessageWithLoading(async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return gradeData.feedback;
            }, 'system', [], 'resultFeedback', true);

            await addMessageWithLoading(async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return gradeData.correct_translation;
            }, 'system', [], 'resultCorrectTranslation', true);

        });

        // Handle user input textbox height as user types
        document.getElementById('targetSeg').addEventListener('input', function() {
            this.style.height = 'auto'; // Reset height to auto to calculate the new height
            this.style.height = (this.scrollHeight) + 'px'; // Set the height to the scroll height
        }, false);



        // Scoring system that subtracts points for every hint used

    })();
});

async function displayMessage(content, source, additionalClasses, id, htmlContentFlag) {
    const chatMessageContainer = document.querySelector('.chat-message-container');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    
    // Add class to indicate whether the message is from the user or the system
    messageElement.classList.add(source === 'user' ? 'from-user' : 'from-system');
    
    // Set the text content of the new div element to the value of the content argument
    if (htmlContentFlag) {
        messageElement.innerHTML = content;
    }
    else {
        messageElement.textContent = content;
    }

    // Add class, as needed
    additionalClasses.forEach(className => messageElement.classList.add(className));

    // Set the ID if provided
    if (id) {
        messageElement.id = id;
    }
    
    // Append the new div element to the chat-message-container
    chatMessageContainer.appendChild(messageElement);
    
    return messageElement;
}


const messageQueue = [];
let processingQueue = false;

async function processMessageQueue() {
  if (processingQueue) return; // Already processing
  
  processingQueue = true;
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    await displayMessage(message.content, message.source, message.additionalClasses, message.id, message.htmlContentFlag);
  }
  processingQueue = false;
}

function addToChatQueue(content, source, additionalClasses, id, htmlContentFlag) {
    messageQueue.push({ content, source, additionalClasses, id, htmlContentFlag });
    processMessageQueue(); // Start processing if not already running
}

// Helper function to add a message with loading animation
async function addMessageWithLoading(fetchContent, source, additionalClasses = [], id = null, htmlContentFlag = false) {
    // Add a loading message to the queue
    const loadingMessageId = id || 'loadingMessage';
    addToChatQueue('Loading...', source, [...additionalClasses, 'loading'], loadingMessageId, htmlContentFlag);

    // Fetch the actual content
    const content = await fetchContent();

    // Once actual content is available, replace the loading message with the actual content
    const loadingMessageElement = document.getElementById(loadingMessageId);
    if (loadingMessageElement) {
        if (htmlContentFlag) {
            loadingMessageElement.innerHTML = content;
        }
        else {
            loadingMessageElement.textContent = content;
        }
        loadingMessageElement.classList.remove('loading');
    }
}

