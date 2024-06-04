chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.set({ sessionList: {} }, function() {
    console.log("Session list cleared on startup");
  });
});

// background.js
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'storeUserId') {
      chrome.storage.local.set({userId: request.userId}, function() {
      });
      sendResponse({status: 'User ID stored'});
    }
    return true;
  }
);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fetchCertificateChain') {
    fetchCertificateChain(request.webDomain)
      .then(certificateChain => {
        sendResponse({ certificateChain: certificateChain });
      })
      .catch(error => {
        console.error('Error fetching certificate chain:', error);
        sendResponse({ error: error.message });
      });
    return true; // Required to use sendResponse asynchronously
  } else if (request.action === 'logUserData') {
    logUserData(request.user_id, request.timestamp, request.event, request.comment);
  }
  else if (request.action === 'fetchTestWebsites') {
    fetchTestWebsites()
    .then(websites => {
        sendResponse({ websites: websites });
    })
    .catch(error => {
        console.error('Error fetching websites:', error);
        sendResponse({ error: error.message });
    });
    return true; // Required to use sendResponse asynchronously
}
});

function fetchCertificateChain(webDomain) {
  return fetch(`http://pkie.engr.uconn.edu/certificate_chain/${webDomain}`)
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        return data.output;
      } else {
        throw new Error('Failed to fetch certificate chain');
      }
    });
}

function fetchTestWebsites() {
  return fetch(`http://localhost:8080/websites`)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      throw new Error('Failed to fetch websites');
    });
}

function logUserData(user_id, timestamp, event, comment) {
  fetch(`http://pkie.engr.uconn.edu/user_data/${user_id}/${timestamp}/${event}/${comment}`);
}