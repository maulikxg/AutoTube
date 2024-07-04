chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    enabled: true,
    whitelist: [],
    qualityControl: true,
  });
});

function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch((error) => {
    console.log(`Failed to send message to tab ${tabId}: ${error}`);
    // If the error is due to the receiving end not existing, the content script might not be injected yet
    if (error.message.includes("Receiving end does not exist")) {
      // Check if the tab is a YouTube tab
      chrome.tabs.get(tabId, function (tab) {
        if (tab && tab.url && tab.url.includes("youtube.com")) {
          // If it's a YouTube tab, try injecting the content script
          chrome.scripting
            .executeScript({
              target: { tabId: tabId },
              files: ["content.js"],
            })
            .then(() => {
              // After injection, try sending the message again
              chrome.tabs.sendMessage(tabId, message).catch((error) => {
                console.log(
                  `Failed to send message after script injection: ${error}`
                );
              });
            })
            .catch((error) => {
              console.log(`Failed to inject content script: ${error}`);
            });
        }
      });
    }
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  sendMessageToTab(activeInfo.tabId, { action: "tabChanged", isActive: true });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    sendMessageToTab(tabId, { action: "tabChanged", isActive: true });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon128.png",
      title: "YouTube AutoPause",
      message: request.message,
    });
  }
});
