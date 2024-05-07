// content.js

console.log("Content script loaded.");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkCredentials") {
        const { user, password } = request.data;
        chrome.runtime.sendMessage({
            action: "checkCredentials",
            data: { user: user, password: password }
        });
    }
});

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
