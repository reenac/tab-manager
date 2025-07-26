/**
 * background.js (for Firefox)
 *
 * Handles extension icon clicks and messages from the content script.
 */

// Listener for when the user clicks the extension's action button.
browser.action.onClicked.addListener(async (tab) => {
  // Prevent the script from running on special Firefox pages.
  if (!tab || !tab.id || tab.url.startsWith("about:") || tab.url.startsWith("moz-extension://")) {
    console.warn("This extension cannot run on internal Firefox pages.");
    return;
  }

  // Inject the content script into the active tab.
  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Failed to inject content script:", err);
  }
});

// Single listener for all messages from the content script.
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    // Gets all open tabs and windows.
    case "GET_TABS":
      browser.windows.getAll({ populate: true }).then(sendResponse, (error) => {
        console.error("Error getting windows:", error);
      });
      // Return true to indicate that the response will be sent asynchronously.
      return true;

    // Closes a specific tab.
    case "CLOSE_TAB":
      if (message.id) {
        browser.tabs.remove(message.id);
      }
      break;

    // Activates a specific tab and focuses its window.
    case "ACTIVATE_TAB":
      if (message.id && message.windowId) {
        browser.tabs.update(message.id, { active: true });
        browser.windows.update(message.windowId, { focused: true });
      }
      break;
  }
});


