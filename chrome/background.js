/**
 * background.js (for Chrome)
 *
 * Handles extension icon clicks and messages from the content script,
 * including the logic for moving tabs and creating new windows.
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

    // **UPDATED**: Moves a single tab or an array of tabs.
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

    // Creates a new window and moves a group of tabs to it.
    case "MOVE_TABS_TO_NEW_WINDOW":
      if (message.tabIds && message.tabIds.length > 0) {
        const [firstTab, ...remainingTabs] = message.tabIds;
        chrome.windows.create({ tabId: firstTab }, (newWindow) => {
          if (remainingTabs.length > 0 && newWindow) {
            chrome.tabs.move(remainingTabs, { windowId: newWindow.id, index: -1 }, () => {
              sendResponse();
            });
          } else {
            sendResponse();
          }
        });
        return true;
      }
      break;
  }
});

