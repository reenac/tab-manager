/**
 * content.js (for Chrome)
 *
 * Merges Shadow DOM functionality, drag-and-drop, theme settings,
 * and the light theme with layout fixes.
 */
(() => {
  // If the overlay already exists, don't create another one.
  if (document.getElementById("tab-commander-host")) return;

  // --- Event Handlers ---
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
  }

  // --- Shadow DOM UI Creation ---
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: "open" });

  const chromeIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
      <path d="M12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path>
    </svg>
  `;

  const settingsIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61-.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
  `;

  const newWindowIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
        <path d="M19 19V5H5v14h14zM3 3h18v18H3V3zm10 4h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/>
    </svg>
  `;

  shadowRoot.innerHTML = `
    <style>
      /* --- THEME DEFINITIONS --- */
      .light-theme {
        --bg: #ffffffff;
        --text: #022b3aff;
        --accent: #1f7a8cff;
        --highlight-soft: #e1e5f2ff;
        --highlight-medium: #bfdbf7ff;
        --duplicate-bg: #fde7ea;
        --duplicate-bg-hover: #fdd8de;
        --font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      }
      .dark-theme {
        --bg: #1E1E2E;
        --text: #CDD6F4;
        --accent: #94E2D5;
        --highlight-soft: #313244;
        --highlight-medium: #45475A;
        --duplicate-bg: #412533;
        --duplicate-bg-hover: #533042;
        --font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }

      /* --- GENERAL STYLES --- */
      * { box-sizing: border-box; font-family: var(--font-family); }
      #tab-overlay-dim { position: fixed; inset: 0; background-color: rgba(2, 43, 58, 0.4); backdrop-filter: blur(5px); z-index: 2147483645; }
      #tab-overlay-container { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2147483646; }
      #tab-overlay-box { font-size: 14px; width: 95vw; height: 90vh; max-width: 1200px; background: var(--bg); color: var(--text); border-radius: 24px; border: 1px solid var(--highlight-medium); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; gap: 16px; padding: 20px; overflow: hidden; }
      
      #top-bar { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
      #search { flex-grow: 1; font-size: 16px; padding: 14px 20px; background-color: var(--highlight-soft); color: var(--text); border: 1px solid var(--highlight-medium); border-radius: 16px; outline: none; transition: box-shadow 0.2s, border-color 0.2s; }
      #search::placeholder { color: var(--accent); opacity: 0.8; }
      #search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); }
      
      #tab-scroll { overflow-y: auto; flex-grow: 1; padding-right: 8px; }
      #tab-scroll::-webkit-scrollbar { width: 8px; }
      #tab-scroll::-webkit-scrollbar-track { background: transparent; }
      #tab-scroll::-webkit-scrollbar-thumb { background-color: var(--highlight-medium); border-radius: 4px; }
      .window { background-color: var(--bg); border: 1px solid var(--highlight-medium); border-radius: 18px; margin-bottom: 24px; display: block; transition: box-shadow 0.2s; }
      .window-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600; color: var(--text); padding: 12px 18px; border-bottom: 1px solid var(--highlight-medium); margin: 0; text-transform: uppercase; letter-spacing: 0.8px; background-color: var(--highlight-soft); border-radius: 18px 18px 0 0; }
      .tabs-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding: 8px; }
      .tab { display: flex; align-items: center; padding: 12px 10px; border-radius: 12px; cursor: pointer; transition: background-color 0.15s, border 0.15s; border: 1px solid transparent; border-top: 2px solid transparent; }
      .tab:hover { background-color: var(--highlight-soft); }
      .tab.duplicate { background-color: var(--duplicate-bg); }
      .tab.duplicate:hover { background-color: var(--duplicate-bg-hover); }
      .tab.dragging { opacity: 0.5; }
      .tab.drag-over-tab { border-top: 2px solid var(--accent); }
      .window.drag-over-window { box-shadow: 0 0 0 3px var(--accent); }
      .favicon-container { width: 16px; height: 16px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--text); }
      .favicon-container img, .favicon-container svg { width: 100%; height: 100%; }
      .tab span { flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
      .tab button { background: none; border: none; font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: 300; color: var(--accent); cursor: pointer; padding: 0 8px; border-radius: 8px; opacity: 0; transition: opacity 0.15s, background-color 0.15s, color 0.15s; }
      .tab:hover button { opacity: 1; }
      .tab button:hover { background-color: var(--highlight-medium); color: var(--text); }
      .window-close-btn { background: none; border: none; font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: 300; color: var(--accent); cursor: pointer; padding: 0 8px; border-radius: 8px; line-height: 1; transition: background-color 0.15s, color 0.15s; }
      .window-close-btn:hover { background-color: var(--highlight-medium); color: var(--text); }
      
      /* --- ACTION BUTTON & SELECTION STYLES --- */
      .action-btn { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--accent); padding: 8px; border-radius: 50%; transition: all 0.2s; flex-shrink: 0; }
      .action-btn:hover { background-color: var(--highlight-soft); }
      .tab.selected { background-color: var(--highlight-medium); border-color: var(--accent); }
      .tab.selected:hover { background-color: color-mix(in srgb, var(--highlight-medium) 90%, var(--accent)); }
      #selection-counter { display: none; background-color: var(--accent); color: var(--bg); border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; align-items: center; justify-content: center; flex-shrink: 0; }
      #selection-counter.visible { display: flex; }

      #settings-container { position: relative; flex-shrink: 0; }
      #settings-panel { display: none; position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--bg); border: 1px solid var(--highlight-medium); border-radius: 12px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10; }
      #settings-panel.visible { display: block; }
      #settings-panel h3 { font-size: 14px; margin: 0 0 12px 0; color: var(--text); }
      #settings-panel .theme-option { display: flex; align-items: center; margin-bottom: 8px; }
      #settings-panel input[type="radio"] { margin-right: 8px; }
      #settings-panel label { color: var(--text); }
    </style>
    <div id="tab-overlay-dim"></div>
    <div id="tab-overlay-container">
      <div id="tab-overlay-box">
        <div id="top-bar">
          <input type="text" id="search" placeholder="Search tabs by title or URL..." />
          <div id="selection-counter"></div>
          <button id="new-window-btn" class="action-btn" title="Create New Window">${newWindowIconSvg}</button>
          <div id="settings-container">
            <button id="settings-btn" class="action-btn" title="Settings">${settingsIconSvg}</button>
            <div id="settings-panel">
              <h3>Theme</h3>
              <div class="theme-option">
                <input type="radio" id="light-theme" name="theme" value="light-theme">
                <label for="light-theme">Light</label>
              </div>
              <div class="theme-option">
                <input type="radio" id="dark-theme" name="theme" value="dark-theme">
                <label for="dark-theme">Dark</label>
              </div>
              <div class="theme-option">
                <input type="radio" id="system-theme" name="theme" value="system-theme">
                <label for="system-theme">System</label>
              </div>
            </div>
          </div>
        </div>
        <div id="tab-scroll">
          <div id="tab-container"></div>
        </div>
      </div>
    </div>
  `;

  const mainBox = shadowRoot.getElementById("tab-overlay-box");
  const tabContainer = shadowRoot.getElementById("tab-container");
  const searchInput = shadowRoot.getElementById("search");
  const settingsBtn = shadowRoot.getElementById("settings-btn");
  const settingsPanel = shadowRoot.getElementById("settings-panel");
  const newWindowBtn = shadowRoot.getElementById("new-window-btn");
  const selectionCounter = shadowRoot.getElementById("selection-counter");
  shadowRoot.getElementById('tab-overlay-dim').addEventListener('click', closeOverlay);

  // --- THEME LOGIC ---
  function applyTheme(themeName) {
    if (themeName === 'system-theme') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        mainBox.className = 'dark-theme';
      } else {
        mainBox.className = 'light-theme';
      }
    } else {
      mainBox.className = themeName;
    }
  }

  function saveAndApplyTheme(themeName) {
    chrome.storage.sync.set({ theme: themeName });
    applyTheme(themeName);
  }

  chrome.storage.sync.get('theme', (data) => {
    const savedTheme = data.theme || 'system-theme';
    applyTheme(savedTheme);
    shadowRoot.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
  });
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const currentThemeSetting = shadowRoot.querySelector('input[name="theme"]:checked').value;
    if (currentThemeSetting === 'system-theme') {
      applyTheme('system-theme');
    }
  });
  
  // --- SETTINGS & NEW WINDOW LOGIC ---
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible');
  });

  newWindowBtn.addEventListener('click', () => {
    const selectedTabs = shadowRoot.querySelectorAll('.tab.selected');
    
    if (selectedTabs.length > 0) {
      const tabIds = Array.from(selectedTabs).map(tabEl => parseInt(tabEl.getAttribute('data-tab-id')));
      chrome.runtime.sendMessage({ type: 'MOVE_TABS_TO_NEW_WINDOW', tabIds }, () => {
        shadowRoot.querySelectorAll('.tab.selected').forEach(t => t.classList.remove('selected'));
        updateSelectionState();
        fetchTabs();
      });
    } else {
      chrome.runtime.sendMessage({ type: 'CREATE_NEW_WINDOW' }, () => {
        fetchTabs();
      });
    }
  });

  shadowRoot.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      saveAndApplyTheme(e.target.value);
    });
  });

  // **UPDATED**: Function to update the selection counter
  function updateSelectionState() {
    const selectedTabs = shadowRoot.querySelectorAll('.tab.selected');
    if (selectedTabs.length > 0) {
      selectionCounter.textContent = selectedTabs.length;
      selectionCounter.classList.add('visible');
      newWindowBtn.title = 'Move selected tabs to a new window';
    } else {
      selectionCounter.classList.remove('visible');
      newWindowBtn.title = 'Create New Window';
    }
  }


  function renderTabs(windows) {
    const allTabs = windows.flatMap(w => w.tabs.map(t => ({ ...t, windowId: w.id })));
    tabContainer.innerHTML = "";
    windows.forEach((win, windowIndex) => {
      const winDiv = document.createElement("div");
      winDiv.className = "window";
      winDiv.setAttribute('data-window-id', win.id);

      const winHeader = document.createElement("div");
      winHeader.className = "window-header";
      
      const headerText = document.createElement("span");
      headerText.textContent = `Window ${windowIndex + 1} (${win.tabs.length} tabs)`;

      const closeWindowBtn = document.createElement("button");
      closeWindowBtn.className = "window-close-btn";
      closeWindowBtn.innerHTML = "&times;";
      closeWindowBtn.title = "Close this window";
      closeWindowBtn.onclick = (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({ type: "CLOSE_WINDOW", windowId: win.id }, () => {
              chrome.windows.getAll({}, (remainingWindows) => {
                  if (remainingWindows.length === 0) {
                      closeOverlay();
                  } else {
                      fetchTabs();
                  }
              });
          });
      };
      
      winHeader.appendChild(headerText);
      winHeader.appendChild(closeWindowBtn);
      winDiv.appendChild(winHeader);

      const tabsList = document.createElement("div");
      tabsList.className = "tabs-list";

      win.tabs.forEach(tab => {
        const tabDiv = document.createElement("div");
        tabDiv.className = "tab";
        tabDiv.setAttribute('data-tab-id', tab.id);
        tabDiv.setAttribute('data-full-title', tab.title || '');
        tabDiv.setAttribute('data-url', tab.url || '');

        if (allTabs.filter(t => t.url === tab.url).length > 1) {
            tabDiv.classList.add("duplicate");
        }
        
        const faviconContainer = document.createElement("div");
        faviconContainer.className = "favicon-container";
        const favicon = document.createElement("img");
        favicon.src = tab.favIconUrl || '';
        favicon.onerror = () => {
            faviconContainer.innerHTML = chromeIconSvg;
        };
        faviconContainer.appendChild(favicon);

        const titleWrapper = document.createElement("span");
        let title = tab.title || 'Untitled Tab';
        if (title.length > 50) {
          title = title.substring(0, 50) + '...';
        }
        const titleText = document.createTextNode(title);
        titleWrapper.appendChild(titleText);

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({ type: "CLOSE_TAB", id: tab.id }, () => fetchTabs());
        };

        tabDiv.appendChild(faviconContainer);
        tabDiv.appendChild(titleWrapper);
        tabDiv.appendChild(closeBtn);

        tabDiv.setAttribute("draggable", "true");

        tabDiv.addEventListener("dragstart", (e) => {
          const selectedTabs = shadowRoot.querySelectorAll('.tab.selected');
          let tabIdsToMove;

          if (selectedTabs.length > 0 && e.currentTarget.classList.contains('selected')) {
            tabIdsToMove = Array.from(selectedTabs).map(t => parseInt(t.getAttribute('data-tab-id')));
          } else {
            shadowRoot.querySelectorAll('.tab.selected').forEach(t => t.classList.remove('selected'));
            updateSelectionState();
            tabIdsToMove = [tab.id];
          }
          
          e.dataTransfer.setData("application/json", JSON.stringify({ tabIds: tabIdsToMove }));
          e.dataTransfer.effectAllowed = "move";
          e.currentTarget.classList.add("dragging");
        });

        tabDiv.addEventListener("dragend", (e) => {
          e.currentTarget.classList.remove("dragging");
        });

        tabDiv.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.currentTarget.classList.add("drag-over-tab");
        });

        tabDiv.addEventListener("dragleave", (e) => {
          e.currentTarget.classList.remove("drag-over-tab");
        });

        tabDiv.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.remove("drag-over-tab");
          const data = JSON.parse(e.dataTransfer.getData("application/json"));
          
          if (!data.tabIds.includes(tab.id)) {
            chrome.runtime.sendMessage({ type: "MOVE_TAB", tabIds: data.tabIds, windowId: win.id, index: tab.index }, () => fetchTabs());
          }
        });

        tabDiv.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            tabDiv.classList.toggle('selected');
            updateSelectionState();
          } else {
            chrome.runtime.sendMessage({ type: "ACTIVATE_TAB", id: tab.id, windowId: tab.windowId });
            closeOverlay();
          }
        });

        tabsList.appendChild(tabDiv);
      });

      winDiv.appendChild(tabsList);
      tabContainer.appendChild(winDiv);

      winDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.currentTarget.classList.add("drag-over-window");
      });
      winDiv.addEventListener("dragleave", (e) => {
        e.currentTarget.classList.remove("drag-over-window");
      });
      
      winDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("drag-over-window");
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        chrome.runtime.sendMessage({ type: "MOVE_TAB", tabIds: data.tabIds, windowId: win.id, index: -1 }, () => fetchTabs());
      });
    });
  }

  function applySearchFilter() {
    const filter = searchInput.value.toLowerCase();
    const tabs = shadowRoot.querySelectorAll('.tab');
    tabs.forEach(tab => {
        const title = tab.getAttribute('data-full-title').toLowerCase();
        const url = tab.getAttribute('data-url').toLowerCase();
        const isMatch = title.includes(filter) || url.includes(filter);
        tab.style.display = isMatch ? "flex" : "none";
    });

    shadowRoot.querySelectorAll('.window').forEach(windowDiv => {
        const visibleTabs = windowDiv.querySelectorAll('.tab[style*="display: flex"]');
        windowDiv.style.display = visibleTabs.length > 0 ? "block" : "none";
    });
  }

  searchInput.addEventListener("input", applySearchFilter);

  function fetchTabs() {
    chrome.runtime.sendMessage({ type: "GET_TABS" }, (windows) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to fetch tabs:", chrome.runtime.lastError);
        return;
      }
      renderTabs(windows);
      applySearchFilter();
    });
  }

  fetchTabs();
})();

