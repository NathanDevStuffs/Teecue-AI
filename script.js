// main.js
import ollama from './browser.js';

const inputField = document.getElementById('chatinput');
const button = document.getElementById('send');

// Function to show alert
async function showAlert() {
  try {
    const inputValue = inputField.value; // Get the value of the input field

    inputField.disabled = true; // Disable the input field
    button.disabled = true;

    inputField.value = ''; 

    const mainDiv = document.querySelector('.main');

    const chatMessageDiv = document.createElement('div');
    chatMessageDiv.classList.add('chat');

    const headerDiv = document.createElement('div'); 
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';

    const roleIconSpan = document.createElement('span');
    roleIconSpan.classList.add('material-symbols-outlined');
    roleIconSpan.textContent = 'person';

    const roleTextSpan = document.createElement('span');
    roleTextSpan.style.fontSize = '17px';
    roleTextSpan.style.fontWeight = '600';
    roleTextSpan.style.marginLeft = '5px';
    roleTextSpan.textContent = 'You';

    headerDiv.appendChild(roleIconSpan);
    headerDiv.appendChild(roleTextSpan);

    const ptext = '<p style="font-size: 15px;background-color: #E6EAEC;min-height: 5px;border-radius: 50px;text-align: center;height: fit-content;padding: 10px;word-wrap: break-word;">';
    const newtext = ptext.concat(inputValue);
    const evennewertext = newtext.concat('</p>');
    const chatTextDiv = document.createElement('div');
    chatTextDiv.classList.add('chattext');
    chatTextDiv.innerHTML = evennewertext;

    chatMessageDiv.appendChild(headerDiv);
    chatMessageDiv.appendChild(chatTextDiv);

    mainDiv.appendChild(chatMessageDiv);

    // Create a new chat message structure for the AI response
    const chatMessageDivAI = document.createElement('div');
    chatMessageDivAI.classList.add('chat');
    
    // Create header for the AI response
    const headerDivAI = document.createElement('div');
    headerDivAI.style.display = 'flex';
    headerDivAI.style.alignItems = 'center';
    
    // Create icon span for the AI response
    const roleIconSpanAI = document.createElement('span');
    roleIconSpanAI.classList.add('material-symbols-outlined');
    roleIconSpanAI.textContent = 'robot_2';
    
    // Create text span for the AI response
    const roleTextSpanAI = document.createElement('span');
    roleTextSpanAI.style.fontSize = '17px';
    roleTextSpanAI.style.fontWeight = '600';
    roleTextSpanAI.style.marginLeft = '5px';
    roleTextSpanAI.textContent = 'Teecue AI';
    
    // Append icon and text spans to the header for AI response
    headerDivAI.appendChild(roleIconSpanAI);
    headerDivAI.appendChild(roleTextSpanAI);
    
    // Create the loading indicator (dot-typing) div
    const dotTypingDiv = document.createElement('div');
    dotTypingDiv.classList.add('dot-typing');
    dotTypingDiv.style.marginLeft = '40px';
    dotTypingDiv.style.marginTop = '25px';
    
    // Create the chat text div for the AI response (initially empty)
    const chatTextDivAI = document.createElement('div');
    chatTextDivAI.classList.add('chattext');
    
    // Append header and loading indicator to the chat message for AI response
    chatMessageDivAI.appendChild(headerDivAI);
    chatMessageDivAI.appendChild(dotTypingDiv);
    chatMessageDivAI.appendChild(chatTextDivAI); // Append the empty chat text div
    
    // Append the chat message for AI response to the main div
    mainDiv.appendChild(chatMessageDivAI);

    const response = await ollama.chat({
      model: 'nathanstuffs/teecue',
      messages: [{ role: 'user', content: inputValue }],
    });
    
    
    
    // Update the loading indicator appearance while waiting for the AI response
    // (You may need to implement this part based on your loading indicator implementation)
    
    // Check if response.message exists before accessing its content property
    if (response.message && response.message.content) {
      // Update the chat text div with the AI response content
      chatTextDivAI.innerHTML = `<p style="font-size: 15px;">${response.message.content}</p>`;
      
      // Remove the loading indicator once the AI response is received
      dotTypingDiv.remove();
    
      // Enable the input field and button
      inputField.disabled = false;
      button.disabled = false;
    } else {
      console.error('Error: Invalid response from ollama.chat');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Event listener for button click
button.addEventListener('click', () => {
  showAlert();
});

// Event listener for pressing Enter key when the input field is focused
inputField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    showAlert();
  }
});
