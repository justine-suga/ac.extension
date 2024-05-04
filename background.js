// background.js

// Constants for API endpoints

console.log("Background script loaded and active.");

chrome.webNavigation.onCompleted.addListener(({ tabId, frameId }) => {
    if (frameId !== 0) return;
    chrome.scripting.executeScript({
        target: { tabId },
        function: newPageLoad,
    });
});

function newPageLoad() {
    const inputs = document.getElementsByTagName("input");
    let passwordInput = null;
    let userIdentifierInput = null;

    for (let input of inputs) {
        if (!passwordInput && input.type === "password") {
            passwordInput = input;
            console.log("Password field detected on this page.");
        }
        if (!userIdentifierInput && (input.type === "email" || input.name.match(/user|login|email/i))) {
            userIdentifierInput = input;
            console.log("User identifier field detected on this page.");
        }
        if (passwordInput && userIdentifierInput) {
            console.log("Detected a complete form for sending credentials.");
            attachFormListener(passwordInput.form);
            break;
        }
    }
    if (!passwordInput || !userIdentifierInput) {
        console.log("Incomplete or no credentials form detected on this page.");
    }
}


//hipb bs
const haveIBeenPwnedApiUrl = "https://haveibeenpwned.com/api/v3";
const pwnedPasswordApiUrl = "https://api.pwnedpasswords.com/range";
const apiKey = "ec7f5c3904d7401aaf90bd96817686f7";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkCredentials") {
      const { user, password } = message.data;
      Promise.all([
          checkEmail(user),
          checkPassword(password)
      ]).then(results => {
          const [emailCompromised, passwordCompromised] = results;
          chrome.tabs.sendMessage(sender.tab.id, {
              type: 'credentialStatus',
              emailCompromised: emailCompromised,
              passwordCompromised: passwordCompromised
          });
      });
      chrome.storage.local.set({credentialStatus: {emailCompromised, passwordCompromised}});
      return true; // Indicate that the response is asynchronous
  }
});


function checkEmail(user) {
  return fetch(`${haveIBeenPwnedApiUrl}/breachedaccount/${encodeURIComponent(user)}?truncateResponse=false`, {
      headers: {
          'hibp-api-key': apiKey
      }
  }).then(response => {
      if (response.ok) return response.json();
      if (response.status === 404) return false; // No breach found
      throw new Error('Failed to fetch API');
  }).then(data => {
      return data.length > 0;
  }).catch(error => {
      console.error('Error checking email:', error);
      return false;
  });
}

function checkPassword(password) {
  return sha1(password).then(hash => {
      const prefix = hash.substr(0, 5);
      const suffix = hash.substr(5).toUpperCase();

      return fetch(`${pwnedPasswordApiUrl}/${prefix}`)
          .then(response => response.text())
          .then(text => {
              const lines = text.split('\n');
              const found = lines.some(line => {
                  const [compSuffix, count] = line.split(':');
                  return compSuffix === suffix;
              });
              return found;
          }).catch(error => {
              console.error('Error checking password:', error);
              return false;
          });
  });
}

function sha1(input) {
  const buffer = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-1', buffer).then(hash => {
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  });
}
