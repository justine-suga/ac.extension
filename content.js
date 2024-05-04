// content.js
console.log("Content script loaded.");

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && (node.matches('form') || node.querySelector('form'))) {
                attachFormListener(node.matches('form') ? node : node.querySelector('form'));
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

function attachFormListener(form) {
    if (!form || form.querySelector('button[data-check="true"]')) return;  // Prevent adding multiple buttons
    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check Credentials';
    checkButton.type = 'button'; // Prevent default form submission
    checkButton.style.marginLeft = '10px';
    checkButton.setAttribute('data-check', 'true');
    form.appendChild(checkButton);

    checkButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form from submitting
        const emailInput = form.querySelector('input[type="email"]');
        const usernameInput = form.querySelector('input[name="username"]');
        const passwordInput = form.querySelector('input[type="password"]');

        const userIdentifier = emailInput ? emailInput.value : (usernameInput ? usernameInput.value : 'No user identifier found');
        if (!passwordInput) {
            console.error("Password input not found in form.");
            return;
        }
        console.log(`Credentials entered: User = ${userIdentifier}, Password = ${passwordInput.value}`);
        chrome.runtime.sendMessage({
            action: "checkCredentials",
            data: { user: userIdentifier, password: passwordInput.value }
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in background:", request);
    if (request.action === "fetchCredentials") {
        const emailInput = document.querySelector('input[type="email"]');
        const usernameInput = document.querySelector('input[name="username"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const userIdentifier = emailInput ? emailInput.value : (usernameInput ? usernameInput.value : 'No user identifier found');

        if (passwordInput) {
            const credentials = {
                user: userIdentifier,
                password: passwordInput.value
            };
            console.log('Credentials from page:', credentials);
            sendResponse(credentials);
        } else {
            console.error("Failed to retrieve credentials: password input not found.");
            sendResponse(null);
        }
    }
});

chrome.runtime.sendMessage({
    type: 'credentialStatus',
    emailCompromised: emailCompromised,
    passwordCompromised: passwordCompromised
});
