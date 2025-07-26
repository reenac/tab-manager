chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    alert("This extension doesn't work on internal Chrome pages.");
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
    console.log("Script injected into tab:", tab.id);
  } catch (err) {
    console.error("Injection error:", err);
    alert("Injection failed: " + err.message);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_TABS") {
    chrome.windows.getAll({ populate: true }, (windows) => {
      sendResponse(windows);
    });
    return true;
  }

  if (msg.type === "CLOSE_TAB") {
    chrome.tabs.remove(msg.id);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ACTIVATE_TAB") {
    chrome.tabs.update(msg.id, { active: true });
    chrome.windows.update(msg.windowId, { focused: true });
  }
});