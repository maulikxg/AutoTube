chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    enabled: true,
    whitelist: [],
    qualityControl: true,
  });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, {
    action: "tabChanged",
    isActive: true,
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    chrome.tabs.sendMessage(tabId, { action: "tabChanged", isActive: true });
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
