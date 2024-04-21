const url = new URL(window.location.href);
const webDomain = url.hostname;

console.log(webDomain);

chrome.storage.local.get({ autoSearchEnabled: true }, function(settings) {
    if (settings.autoSearchEnabled) {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        if (passwordFields.length > 0) {
            alert('THIS HAS A PASSWORD FIELD');
        }
    }
});

// Check if the site is sensitive or unsafe
chrome.storage.local.get({ websiteList: {}, sessionList: {} }, function (items) {
    if (items.websiteList[webDomain]) {
        if (items.websiteList[webDomain].isSensitive) {
            console.log("sensitive site");
            // Check if the site is in session list
            if (items.sessionList[webDomain]) {
                console.log("in session list");
                // If in session list, remove blocker if it exists
                removeBlocker();
            } else {
                console.log("not in session list");
                // If not in session list, add blocker
                addBlocker();
            }
        } else {
            console.log("unsafe site");
            // Add blocker
            addBlocker();
        }
    }
});

function addBlocker() {
    if (!document.getElementById('myBlockerDiv')) {
        var blockerDiv = document.createElement('div');
        blockerDiv.id = 'myBlockerDiv';
        blockerDiv.style.position = 'fixed';
        blockerDiv.style.left = '0';
        blockerDiv.style.top = '0';
        blockerDiv.style.width = '100%';
        blockerDiv.style.height = '100%';
        blockerDiv.style.zIndex = '10000';
        blockerDiv.style.backgroundColor = 'rgba(0,0,0,0.2)';
        document.body.appendChild(blockerDiv);

        var blockerMessage = document.createElement('h1');
        blockerMessage.style.color = 'white';
        blockerMessage.style.textAlign = 'center';
        blockerMessage.style.marginTop = '20%';
        blockerMessage.innerHTML = 'This site is blocked by the extension. Click on the extension to continue.';
        blockerMessage.style.display = 'none'; // Initially hide the message

        blockerDiv.appendChild(blockerMessage);

        // Add click event listener to show the message
        blockerDiv.addEventListener('click', function () {
            blockerMessage.style.display = 'block'; // Show the message on click
        });
    }
}

function removeBlocker() {
    var blockerDiv = document.getElementById('myBlockerDiv');
    if (blockerDiv) {
        blockerDiv.remove();
    }
}

// Listener for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "removeBlocker") {
        removeBlocker();
    }
});
