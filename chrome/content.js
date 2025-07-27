(() => {
  // Prevent duplicate injections
  if (document.getElementById("tab-commander-host")) return;

  // Event Handlers
  const escKeyHandler = (e) => {
    if (e.key === "Escape") {
      closeOverlay();
    }
  };
  window.addEventListener("keydown", escKeyHandler);

  const host = document.createElement("div");
  host.id = "tab-commander-host";

  function closeOverlay() {
    host.remove();
    window.removeEventListener("keydown", escKeyHandler);
    chrome.runtime.sendMessage({ type: "OVERLAY_CLOSED" });
  }

  // Shadow DOM UI Creation
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });

  // Chrome icon SVG
  const chromeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#888" width="16" height="16">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>`;

  // Fixed settings gear icon
  const settingsIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>`;

  // CSS styles function with Refinement 1 implemented
  function getStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 40px 20px;
        overflow-y: auto;
        z-index: 9999999;
      }

      :host(.light-theme) {
        background-color: rgba(255, 255, 255, 0.95);
      }

      .container {
        width: 100%;
        max-width: 1200px;
        background-color: #1e1e1e;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      }

      :host(.light-theme) .container {
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .header h1 {
        font-size: 24px;
        color: #fff;
      }

      :host(.light-theme) .header h1 {
        color: #333;
      }

      .action-buttons {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .action-btn {
        padding: 8px 16px;
        background-color: #333;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .action-btn:hover {
        background-color: #555;
      }

      :host(.light-theme) .action-btn {
        background-color: #e0e0e0;
        color: #333;
      }

      :host(.light-theme) .action-btn:hover {
        background-color: #d0d0d0;
      }

      .selection-counter {
        background: #2196F3;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 14px;
        display: none;
      }

      .selection-counter.visible {
        display: inline-block;
      }

      .search-box {
        margin-bottom: 20px;
      }

      .search-box input {
        width: 100%;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #333;
        border-radius: 4px;
        background-color: #2a2a2a;
        color: #fff;
      }

      :host(.light-theme) .search-box input {
        background-color: #f5f5f5;
        color: #333;
        border-color: #ddd;
      }

      .windows-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .window {
        border: 1px solid #333;
        border-radius: 4px;
        padding: 15px;
        background-color: #252525;
      }

      :host(.light-theme) .window {
        background-color: #f9f9f9;
        border-color: #ddd;
      }

      .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
      }

      :host(.light-theme) .window-header {
        border-bottom-color: #ddd;
      }

      .window-title-container {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

      .window-title {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .window-title:hover {
        background-color: #333;
      }

      :host(.light-theme) .window-title {
        color: #333;
      }

      :host(.light-theme) .window-title:hover {
        background-color: #e0e0e0;
      }

      .window-name-input {
        font-size: 18px;
        font-weight: bold;
        background-color: #2a2a2a;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 4px 8px;
        width: auto;
        max-width: 300px;
      }

      :host(.light-theme) .window-name-input {
        background-color: #fff;
        color: #333;
        border-color: #ccc;
      }

      .close-window {
        padding: 5px 10px;
        background-color: #d32f2f;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .close-window:hover {
        background-color: #b71c1c;
      }

      .tabs-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 10px;
      }

      .tab {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: #2a2a2a;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
      }

      :host(.light-theme) .tab {
        background-color: #fff;
        border-color: #e0e0e0;
      }

      .tab:hover {
        background-color: #333;
        transform: translateY(-2px);
      }

      :host(.light-theme) .tab:hover {
        background-color: #f5f5f5;
      }

      /* Refinement 1: Universal highlight colors */
      .tab.duplicate {
        background-color: #fde7ea;
        border-color: #ff9800;
      }

      .tab.duplicate:hover {
        background-color: #fdd8de;
        transform: translateY(-2px);
      }

      .tab.selected {
        background-color: #1976d2;
        border-color: #2196f3;
      }

      /* Refinement 1: Active tab always mint green regardless of theme */
      .tab.active-tab {
        background-color: #a6fbb2;
        color: #000;
      }

      .tab.active-tab:hover {
        background-color: #8fdb9a;
      }

      :host(.light-theme) .tab.selected {
        background-color: #bbdefb;
        border-color: #2196f3;
      }

      .tab.hidden {
        display: none;
      }

      .favicon-container {
        width: 16px;
        height: 16px;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .favicon-container img {
        width: 100%;
        height: 100%;
      }

      .tab-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #fff;
      }

      :host(.light-theme) .tab-title {
        color: #333;
      }

      .tab.active-tab .tab-title {
        color: #000;
      }

      .close-tab {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #555;
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
      }

      .close-tab:hover {
        background-color: #d32f2f;
      }

      :host(.light-theme) .close-tab {
        background-color: #ccc;
        color: #333;
      }

      :host(.light-theme) .close-tab:hover {
        background-color: #d32f2f;
        color: #fff;
      }

      .settings-panel {
        position: absolute;
        top: 70px;
        right: 30px;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 4px;
        padding: 15px;
        display: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }

      :host(.light-theme) .settings-panel {
        background-color: #fff;
        border-color: #ddd;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .settings-panel.visible {
        display: block;
      }

      .settings-panel h3 {
        margin-bottom: 10px;
        color: #fff;
      }

      :host(.light-theme) .settings-panel h3 {
        color: #333;
      }

      .theme-option {
        margin: 5px 0;
      }

      .theme-option label {
        color: #fff;
        cursor: pointer;
      }

      :host(.light-theme) .theme-option label {
        color: #333;
      }

      #moveToNewWindowBtn {
        display: none;
      }
    `;
  }

  // CSS injection
  const styleElement = document.createElement('style');
  styleElement.textContent = getStyles();
  shadowRoot.appendChild(styleElement);

  // HTML structure
  shadowRoot.innerHTML += `
    <div class="container">
      <div class="header">
        <h1>Tab Commander</h1>
        <div class="action-buttons">
          <span class="selection-counter" id="selectionCounter">0 selected</span>
          <button class="action-btn" id="moveToNewWindowBtn">Move to New Window</button>
          <button class="action-btn" id="settingsBtn">${settingsIconSvg}</button>
        </div>
      </div>

      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search tabs..." />
      </div>

      <div class="windows-container" id="windowsContainer"></div>

      <div class="settings-panel" id="settingsPanel">
        <h3>Theme</h3>
        <div class="theme-option">
          <label>
            <input type="radio" name="theme" value="dark" checked />
            Dark Theme
          </label>
        </div>
        <div class="theme-option">
          <label>
            <input type="radio" name="theme" value="light" />
            Light Theme
          </label>
        </div>
        <div class="theme-option">
          <label>
            <input type="radio" name="theme" value="system" />
            System Theme
          </label>
        </div>
      </div>
    </div>
  `;

  // Get elements
  const searchInput = shadowRoot.getElementById("searchInput");
  const windowsContainer = shadowRoot.getElementById("windowsContainer");
  const settingsBtn = shadowRoot.getElementById("settingsBtn");
  const settingsPanel = shadowRoot.getElementById("settingsPanel");
  const moveToNewWindowBtn = shadowRoot.getElementById("moveToNewWindowBtn");
  const selectionCounter = shadowRoot.getElementById("selectionCounter");

  let selectedTabIds = new Set();
  let draggedTabIds = [];

  // Storage for window names
  const getWindowName = async (windowId) => {
    const key = `windowName_${windowId}`;
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  };

  const setWindowName = async (windowId, name) => {
    const key = `windowName_${windowId}`;
    await chrome.storage.local.set({ [key]: name });
  };

  // Refinement 2: Listen for refresh messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "REFRESH_OVERLAY") {
      fetchTabs();
    }
  });

  // Theme functions
  function applyTheme(theme) {
    shadowRoot.host.classList.remove('dark-theme', 'light-theme');
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      shadowRoot.host.classList.add(isDark ? 'dark-theme' : 'light-theme');
    } else {
      shadowRoot.host.classList.add(`${theme}-theme`);
    }
  }

  function saveAndApplyTheme(themeName) {
    chrome.storage.sync.set({ theme: themeName });
    applyTheme(themeName);
  }

  // Load saved theme
  chrome.storage.sync.get('theme', (data) => {
    const savedTheme = data.theme || 'dark';
    applyTheme(savedTheme);
    shadowRoot.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
  });

  // Theme radio button listeners
  shadowRoot.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      saveAndApplyTheme(e.target.value);
    });
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const currentThemeSetting = shadowRoot.querySelector('input[name="theme"]:checked').value;
    if (currentThemeSetting === 'system') {
      applyTheme('system');
    }
  });

  // Update selection counter
  function updateSelectionCounter() {
    const count = selectedTabIds.size;
    if (count > 0) {
      selectionCounter.textContent = `${count} selected`;
      selectionCounter.classList.add('visible');
      moveToNewWindowBtn.style.display = 'inline-flex';
    } else {
      selectionCounter.classList.remove('visible');
      moveToNewWindowBtn.style.display = 'none';
    }
  }

  // Move selected tabs to new window
  moveToNewWindowBtn.addEventListener('click', () => {
    if (selectedTabIds.size > 0) {
      chrome.runtime.sendMessage({
        type: "MOVE_TABS_TO_NEW_WINDOW",
        tabIds: Array.from(selectedTabIds)
      }, () => {
        selectedTabIds.clear();
        updateSelectionCounter();
        fetchTabs();
      });
    }
  });

  // Settings panel toggle
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible');
  });

  // Close settings panel when clicking outside
  shadowRoot.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) {
      settingsPanel.classList.remove('visible');
    }
  });

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const tabs = shadowRoot.querySelectorAll(".tab");
    
    tabs.forEach(tab => {
      const title = tab.querySelector(".tab-title").textContent.toLowerCase();
      const url = tab.getAttribute("data-url").toLowerCase();
      
      if (title.includes(query) || url.includes(query)) {
        tab.classList.remove("hidden");
      } else {
        tab.classList.add("hidden");
      }
    });
  });

  // Fetch and render tabs
  async function fetchTabs() {
    chrome.runtime.sendMessage({ type: "GET_TABS" }, async (windows) => {
      windowsContainer.innerHTML = "";
      
      // Find duplicate URLs
      const urlCounts = {};
      windows.forEach(win => {
        win.tabs.forEach(tab => {
          const url = new URL(tab.url || 'about:blank').href;
          urlCounts[url] = (urlCounts[url] || 0) + 1;
        });
      });

      // Render windows
      for (const win of windows) {
        const winDiv = document.createElement("div");
        winDiv.className = "window";
        winDiv.setAttribute("data-window-id", win.id);

        const winHeader = document.createElement("div");
        winHeader.className = "window-header";

        // Window title container
        const titleContainer = document.createElement("div");
        titleContainer.className = "window-title-container";

        const winTitle = document.createElement("div");
        winTitle.className = "window-title";
        const savedName = await getWindowName(win.id);
        winTitle.textContent = savedName || `Window ${windows.indexOf(win) + 1} (${win.tabs.length} tabs)`;

        // Make window title editable
        winTitle.addEventListener("click", async () => {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "window-name-input";
          input.value = winTitle.textContent;
          input.maxLength = 50;

          const saveInput = async () => {
            const newName = input.value.trim();
            if (newName) {
              await setWindowName(win.id, newName);
              winTitle.textContent = newName;
            } else {
              winTitle.textContent = `Window ${windows.indexOf(win) + 1} (${win.tabs.length} tabs)`;
            }
            titleContainer.replaceChild(winTitle, input);
          };

          input.addEventListener("blur", saveInput);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveInput();
            } else if (e.key === "Escape") {
              titleContainer.replaceChild(winTitle, input);
            }
          });

          titleContainer.replaceChild(input, winTitle);
          input.select();
          input.focus();
        });

        titleContainer.appendChild(winTitle);
        winHeader.appendChild(titleContainer);

        const closeWindowBtn = document.createElement("button");
        closeWindowBtn.className = "close-window";
        closeWindowBtn.textContent = "Close Window";
        closeWindowBtn.onclick = () => {
          chrome.runtime.sendMessage({ 
            type: "CLOSE_WINDOW", 
            windowId: win.id 
          }, () => {
            fetchTabs();
          });
        };

        winHeader.appendChild(closeWindowBtn);
        winDiv.appendChild(winHeader);

        const tabsList = document.createElement("div");
        tabsList.className = "tabs-list";

        // Render tabs
        win.tabs.forEach(tab => {
          const tabDiv = document.createElement("div");
          tabDiv.className = "tab";
          
          // Highlight active tab
          if (tab.active) {
            tabDiv.classList.add("active-tab");
          }
          
          const url = new URL(tab.url || 'about:blank').href;
          if (urlCounts[url] > 1) {
            tabDiv.classList.add("duplicate");
          }
          
          tabDiv.setAttribute("data-tab-id", tab.id);
          tabDiv.setAttribute("data-url", tab.url || '');
          tabDiv.setAttribute("draggable", "true");

          // Tab selection
          tabDiv.addEventListener("click", (e) => {
            if (e.target.classList.contains("close-tab")) return;
            
            if (e.ctrlKey || e.metaKey) {
              if (selectedTabIds.has(tab.id)) {
                selectedTabIds.delete(tab.id);
                tabDiv.classList.remove("selected");
              } else {
                selectedTabIds.add(tab.id);
                tabDiv.classList.add("selected");
              }
              updateSelectionCounter();
            } else {
              chrome.runtime.sendMessage({
                type: "ACTIVATE_TAB",
                id: tab.id,
                windowId: win.id
              });
              closeOverlay();
            }
          });

          // Drag and drop
          tabDiv.addEventListener("dragstart", (e) => {
            if (selectedTabIds.has(tab.id) && selectedTabIds.size > 1) {
              draggedTabIds = Array.from(selectedTabIds);
            } else {
              draggedTabIds = [tab.id];
            }
            e.dataTransfer.effectAllowed = "move";
          });

          tabDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          });

          tabDiv.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggedTabIds.length > 0 && !draggedTabIds.includes(tab.id)) {
              chrome.runtime.sendMessage({
                type: "MOVE_TAB",
                tabIds: draggedTabIds,
                windowId: win.id,
                index: tab.index
              }, () => {
                selectedTabIds.clear();
                updateSelectionCounter();
                fetchTabs();
              });
            }
          });

          // Favicon
          const faviconContainer = document.createElement("div");
          faviconContainer.className = "favicon-container";
          
          if (tab.favIconUrl) {
            const favicon = document.createElement("img");
            favicon.src = tab.favIconUrl;
            favicon.onerror = () => {
              faviconContainer.innerHTML = chromeIconSvg;
            };
            faviconContainer.appendChild(favicon);
          } else {
            faviconContainer.innerHTML = chromeIconSvg;
          }

          // Tab title
          const tabTitle = document.createElement("div");
          tabTitle.className = "tab-title";
          tabTitle.textContent = tab.title || tab.url || "New Tab";

          // Close button
          const closeBtn = document.createElement("button");
          closeBtn.className = "close-tab";
          closeBtn.innerHTML = "×";
          closeBtn.onclick = (e) => {
            e.stopPropagation();
            chrome.runtime.sendMessage({ 
              type: "CLOSE_TAB", 
              id: tab.id 
            }, () => {
              fetchTabs();
            });
          };

          tabDiv.appendChild(faviconContainer);
          tabDiv.appendChild(tabTitle);
          tabDiv.appendChild(closeBtn);
          tabsList.appendChild(tabDiv);
        });

        winDiv.appendChild(tabsList);
        windowsContainer.appendChild(winDiv);

        // Window-level drop zone
        winDiv.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });

        winDiv.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (draggedTabIds.length > 0) {
            const targetWindowId = parseInt(winDiv.getAttribute("data-window-id"));
            chrome.runtime.sendMessage({
              type: "MOVE_TAB",
              tabIds: draggedTabIds,
              windowId: targetWindowId,
              index: -1
            }, () => {
              selectedTabIds.clear();
              updateSelectionCounter();
              fetchTabs();
            });
          }
        });
      }

      // Reapply search filter after fetching
      const currentQuery = searchInput.value.toLowerCase();
      if (currentQuery) {
        const tabs = shadowRoot.querySelectorAll(".tab");
        tabs.forEach(tab => {
          const title = tab.querySelector(".tab-title").textContent.toLowerCase();
          const url = tab.getAttribute("data-url").toLowerCase();
          
          if (title.includes(currentQuery) || url.includes(currentQuery)) {
            tab.classList.remove("hidden");
          } else {
            tab.classList.add("hidden");
          }
        });
      }

      // Reapply selections
      selectedTabIds.forEach(tabId => {
        const tabElement = shadowRoot.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
          tabElement.classList.add("selected");
        }
      });
    });
  }

  // Initial render
  fetchTabs();
})();
