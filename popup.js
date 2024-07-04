document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(
    ["enabled", "whitelist", "qualityControl"],
    function (result) {
      document.getElementById("enabled").checked = result.enabled;
      document.getElementById("qualityControl").checked = result.qualityControl;
      document.getElementById("whitelist").value = result.whitelist.join("\n");
    }
  );

  document.getElementById("save").addEventListener("click", function () {
    const enabled = document.getElementById("enabled").checked;
    const qualityControl = document.getElementById("qualityControl").checked;
    const whitelist = document
      .getElementById("whitelist")
      .value.split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    chrome.storage.sync.set(
      { enabled, whitelist, qualityControl },
      function () {
        alert("Settings saved!");
      }
    );
  });
});
