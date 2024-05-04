// background.js

// Constants for API endpoints
const haveIBeenPwnedApiUrl = "https://haveibeenpwned.com/api/v3";
const zapProxyApiUrl = "http://localhost:8080";

// Function to check Have I Been Pwned for breaches associated with an email
function checkHaveIBeenPwned(email) {
  // Replace 'YOUR_API_KEY' with your Have I Been Pwned API key
  const headers = new Headers({
    "hibp-api-key": "ec7f5c3904d7401aaf90bd96817686f7",
    "user-agent": "HIBP-Example-App"
  });

  const url = `${haveIBeenPwnedApiUrl}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;

  fetch(url, { headers: headers })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error fetching: Have I Been Pwned data');
      }
      return response.json();
    })
    .then(data => {
      console.log('Breaches for email:', data);
      // Process and use the breaches data
    })
    .catch(error => {
      console.error('Have I Been Pwned Error:', error);
    });
}

// Function to send a message to the ZAP Proxy API
function sendMessageToZapProxy(message) {
  // ZAP API expects a specific format, ensure to adhere to that
  const zapApiMessageUrl = `${zapProxyApiUrl}/JSON/core/action/sendMessage/?zapapiformat=JSON&formMethod=GET&message=${encodeURIComponent(message)}`;

  fetch(zapApiMessageUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error communicating with ZAP Proxy');
      }
      return response.json();
    })
    .then(data => {
      console.log('ZAP Proxy response:', data);
      // Process the response from ZAP
    })
    .catch(error => {
      console.error('ZAP Proxy Error:', error);
    });
}

// Event listener for messages from the content scripts or popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "loginDetected") {
      checkHaveIBeenPwned(request.email);
      sendMessageToZapProxy(`email=${request.email}&password=${request.password}`);
    }
    // Add any additional message handlers as necessary
  }
);

// The code above is a starting point and will not work until you replace 'YOUR_API_KEY' with your actual Have I Been Pwned API key, and expand the functionality according to your requirements.

// You may also need to configure permissions in your manifest.json file to use the fetch API and interact with external URLs.
