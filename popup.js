// popup.js
chrome.storage.local.get('credentialStatus', function(data) {
  if (data.credentialStatus) {
      const {emailCompromised, passwordCompromised} = data.credentialStatus;
      const statusElement = document.getElementById('status');
      let resultText = 'Your credentials are safe.';
      if (emailCompromised || passwordCompromised) {
          resultText = `Your ${emailCompromised ? 'email' : ''}${passwordCompromised ? (emailCompromised ? ' and password' : 'password') : ''} has been compromised!`;
          statusElement.style.color = 'red';
      } else {
          statusElement.style.color = 'green';
      }
      statusElement.textContent = resultText;
      // Optionally clear the storage after displaying the message
      chrome.storage.local.remove('credentialStatus');
  }
});