// popup.js

let checked = false;
let words = [];

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const password = urlParams.get('password');

    // Load words
    fetchWords();

    if (user && password && !checked) {
        checkCredentials(user, password);
        checked = true;
    }
});

function fetchWords() {
    fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words')
        .then(response => response.text())
        .then(data => {
            words = data.split('\n');
            console.log("Words loaded.");
        }).catch(error => {
            console.error("Failed to fetch words.", error);
        });
}

function generateNewPassword() {
  if (words.length < 2) {
      console.error("Not enough words loaded to generate a password.");
      return "Refresh the page!";
  }

  const randomWord1 = words[Math.floor(Math.random() * words.length)];
  const randomWord2 = words[Math.floor(Math.random() * words.length)];
  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
  const specialChar1 = specialChars[Math.floor(Math.random() * specialChars.length)];
  const specialChar2 = specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Generate two random numbers once
  const randomNumber1 = Math.floor(Math.random() * 10);
  const randomNumber2 = Math.floor(Math.random() * 10);
  
  // Repeat each number once to form a sequence like 6262
  return `${randomWord1}${specialChar1}${randomWord2.toUpperCase()}${specialChar2}${randomNumber1}${randomNumber2}${randomNumber1}${randomNumber2}`;
}


function checkCredentials(user, password) {
    chrome.runtime.sendMessage({
        action: "checkCredentials",
        data: { user: user, password: password }
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'credentialStatus') {
        const { emailCompromised, passwordCompromised } = message;
        const statusElement = document.getElementById('status');

        // Clear any previous status content
        statusElement.innerHTML = '';

        // Display the email status message
        if (emailCompromised) {
            const emailStatus = document.createElement('p');
            emailStatus.textContent = "Your email has been found in a breach! Consider changing any passwords identified with it.";
            emailStatus.style.color = 'red';
            statusElement.appendChild(emailStatus);
        } else {
            const emailStatus = document.createElement('p');
            emailStatus.textContent = "Your email has not been found in a breach, congrats!";
            emailStatus.style.color = 'green';
            statusElement.appendChild(emailStatus);
        }

        // Display the password status message and suggest new password if compromised
        if (passwordCompromised) {
            const passwordStatus = document.createElement('p');
            passwordStatus.textContent = "Your password has been found in a breach!";
            passwordStatus.style.color = 'red';
            statusElement.appendChild(passwordStatus);

            const newPassword = generateNewPassword();
            const newPasswordStatus = document.createElement('p');
            newPasswordStatus.textContent = `Suggested new password: ${newPassword}`;
            newPasswordStatus.style.color = 'blue';
            statusElement.appendChild(newPasswordStatus);
        } else {
            const passwordStatus = document.createElement('p');
            passwordStatus.textContent = "Your password has not been found in a breach, congrats!";
            passwordStatus.style.color = 'green';
            statusElement.appendChild(passwordStatus);
        }
    }
});
