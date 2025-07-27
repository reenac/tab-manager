/**
 * background.js (for Chrome)
 *
 * Handles extension icon clicks and messages from the content script,
 * including the logic for moving tabs and creating new windows.
 * Also handles comprehensive tab/window change events for overlay refresh.
 */

// Track the tab where the overlay is currently open
let overlayTabId = null;

// Listener for when the user clicks the extension's action button.
chrome.action.onClicked.addListener(async (tab) => {
  // Prevent the script from running on special Chrome pages.
  if (!tab || !tab.id || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
    console.warn("This extension cannot run on internal Chrome pages.");
    return;
  }

  // Store the tab ID where overlay is being opened
  overlayTabId = tab.id;

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

// Helper function to send refresh message to overlay
function sendRefreshMessage() {
  if (overlayTabId) {
    chrome.tabs.sendMessage(overlayTabId, { type: "REFRESH_OVERLAY" }, (response) => {
      if (chrome.runtime.lastError) {
        // Overlay might have been closed
        overlayTabId = null;
      }
    });
  }
}

// Refinement 2: Comprehensive listeners for all tab/window changes

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  sendRefreshMessage();
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  sendRefreshMessage();
});

// Listen for tab movement
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  sendRefreshMessage();
});

// Listen for tab updates (specifically URL and title changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only refresh if URL or title changed, not for every minor update
  if (changeInfo.url || changeInfo.title) {
    sendRefreshMessage();
  }
});

// Listen for new window creation
chrome.windows.onCreated.addListener((window) => {
  sendRefreshMessage();
});

// Listen for window removal
chrome.windows.onRemoved.addListener((windowId) => {
  sendRefreshMessage();
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

    // Moves a single tab or an array of tabs.
    case "MOVE_TAB":
      if (message.tabIds && message.tabIds.length > 0 && message.windowId) {
        chrome.tabs.move(message.tabIds, {
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

    // Creates a new window with a specific URL.
    case "CREATE_NEW_WINDOW":
      chrome.windows.create({ url: "https://www.google.com" }, () => sendResponse());
      return true;

    // Moves tabs to a new window
    case "MOVE_TABS_TO_NEW_WINDOW":
      if (message.tabIds && message.tabIds.length > 0) {
        chrome.windows.create({}, (newWindow) => {
          chrome.tabs.move(message.tabIds, {
            windowId: newWindow.id,
            index: -1
          }, () => sendResponse());
        });
        return true;
      }
      break;

    // Clear overlay tab ID when overlay is closed
    case "OVERLAY_CLOSED":
      if (sender.tab && sender.tab.id === overlayTabId) {
        overlayTabId = null;
      }
      break;
  }
});
