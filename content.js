let enabled = true;
let whitelist = [];
let qualityControl = true;
let currentChannel = "";

function getChannelName() {
  const channelElement = document.querySelector(
    "#owner-name a, #channel-name #text"
  );
  return channelElement ? channelElement.textContent.trim() : "";
}

function isChannelWhitelisted() {
  return whitelist.some((item) =>
    currentChannel.toLowerCase().includes(item.toLowerCase())
  );
}

function setVideoQuality(isActive) {
  const video = document.querySelector("video");
  if (video) {
    const targetQuality = isActive ? "hd720" : "tiny";
    if (video.getVideoPlaybackQuality().quality !== targetQuality) {
      video.querySelector("button.ytp-settings-button").click();
      setTimeout(() => {
        const qualityMenu = document.querySelector(".ytp-panel-menu");
        if (qualityMenu) {
          const qualities = qualityMenu.querySelectorAll(".ytp-menuitem");
          const targetQualityItem = Array.from(qualities).find((q) =>
            q.textContent.includes(isActive ? "720p" : "144p")
          );
          if (targetQualityItem) targetQualityItem.click();
        }
        video.querySelector("button.ytp-settings-button").click();
      }, 100);
    }
  }
}

function handleVisibilityChange(isActive) {
  if (!enabled) return;

  currentChannel = getChannelName();
  const video = document.querySelector("video");

  if (video) {
    if (isChannelWhitelisted()) {
      console.log("Channel is whitelisted, not pausing");
      return;
    }

    if (!isActive) {
      video.pause();
      chrome.runtime.sendMessage({ action: "notify", message: "Video paused" });
      if (qualityControl) setVideoQuality(false);
    } else {
      video.play();
      chrome.runtime.sendMessage({
        action: "notify",
        message: "Video resumed",
      });
      if (qualityControl) setVideoQuality(true);
    }
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "tabChanged") {
    handleVisibilityChange(request.isActive);
  }
});

document.addEventListener("visibilitychange", function () {
  handleVisibilityChange(!document.hidden);
});

chrome.storage.sync.get(
  ["enabled", "whitelist", "qualityControl"],
  function (result) {
    enabled = result.enabled;
    whitelist = result.whitelist;
    qualityControl = result.qualityControl;
  }
);

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    if (key === "enabled") enabled = changes[key].newValue;
    if (key === "whitelist") whitelist = changes[key].newValue;
    if (key === "qualityControl") qualityControl = changes[key].newValue;
  }
});
