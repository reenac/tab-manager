/**
 * background.js (for Chrome)
 *
 * Handles extension icon clicks and messages from the content script,
 * including the logic for creating new windows.
 */

// Listener for when the user clicks the extension's action button.
chrome.action.onClicked.addListener(async (tab) => {
  // Prevent the script from running on special Chrome pages.
  if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    console.warn("This extension cannot run on internal Chrome pages.");
    return;
  }

  // Inject the content script into the active tab.
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Failed to inject content script:", err);
  }
});

// Single listener for all messages from the content script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    // Gets all open tabs and windows.
    case "GET_TABS":
      chrome.windows.getAll({ populate: true }, (windows) => {
        sendResponse(windows);
      });
      return true;

    // Closes a specific tab.
    case "CLOSE_TAB":
      if (message.id) {
        chrome.tabs.remove(message.id, () => sendResponse());
        return true;
      }
      break;

    // Activates a specific tab and focuses its window.
    case "ACTIVATE_TAB":
      if (message.id && message.windowId) {
        chrome.tabs.update(message.id, { active: true });
        chrome.windows.update(message.windowId, { focused: true });
      }
      break;

    // Moves a tab to a new position, potentially in a new window.
    case "MOVE_TAB":
      if (message.tabId && message.windowId) {
        chrome.tabs.move(message.tabId, {
          windowId: message.windowId,
          index: message.index
        }, () => sendResponse());
        return true;
      }
      break;

    // Closes an entire window.
    case "CLOSE_WINDOW":
      if (message.windowId) {
        chrome.windows.remove(message.windowId, () => sendResponse());
        return true;
      }
      break;

    // **NEW**: Creates a new window with a specific URL.
    case "CREATE_NEW_WINDOW":
      chrome.windows.create({ url: "https://www.google.com" }, () => sendResponse());
      return true;
  }
});

