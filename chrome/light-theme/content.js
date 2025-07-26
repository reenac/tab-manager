/**
 * content.js (for Chrome)
 *
 * Merges Shadow DOM functionality, drag-and-drop (including cross-window),
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

  // SVG icon for Chrome to use as a placeholder.
  const chromeIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
      <path d="M12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"></path>
    </svg>
  `;

  shadowRoot.innerHTML = `
    <style>
      :host {
        --gunmetal: #022b3aff;
        --teal: #1f7a8cff;
        --columbia-blue: #bfdbf7ff;
        --lavender-web: #e1e5f2ff;
        --white: #ffffffff;
      }
      * { box-sizing: border-box; font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; }
      #tab-overlay-dim { position: fixed; inset: 0; background-color: rgba(2, 43, 58, 0.4); backdrop-filter: blur(5px); z-index: 2147483645; }
      #tab-overlay-container { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2147483646; }
      #tab-overlay-box { font-size: 14px; width: 95vw; height: 90vh; max-width: 1200px; background: var(--white); color: var(--gunmetal); border-radius: 24px; border: 1px solid var(--columbia-blue); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column; gap: 16px; padding: 20px; overflow: hidden; }
      #search { flex-shrink: 0; width: 100%; font-size: 16px; padding: 14px 20px; background-color: var(--lavender-web); color: var(--gunmetal); border: 1px solid var(--columbia-blue); border-radius: 16px; outline: none; transition: box-shadow 0.2s, border-color 0.2s; }
      #search::placeholder { color: var(--teal); opacity: 0.8; }
      #search:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(31, 122, 140, 0.3); }
      #tab-scroll { overflow-y: auto; flex-grow: 1; padding-right: 8px; }
      #tab-scroll::-webkit-scrollbar { width: 8px; }
      #tab-scroll::-webkit-scrollbar-track { background: transparent; }
      #tab-scroll::-webkit-scrollbar-thumb { background-color: var(--columbia-blue); border-radius: 4px; }
      .window { background-color: var(--white); border: 1px solid var(--columbia-blue); border-radius: 18px; margin-bottom: 24px; display: block; transition: box-shadow 0.2s; }
      .window-header { font-size: 12px; font-weight: 600; color: var(--gunmetal); padding: 12px 18px; border-bottom: 1px solid var(--columbia-blue); margin: 0; text-transform: uppercase; letter-spacing: 0.8px; background-color: var(--lavender-web); border-radius: 18px 18px 0 0; }
      /* **FIXED**: Ensures 3 equal columns that don't overflow. */
      .tabs-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding: 8px; }
      .tab { display: flex; align-items: center; padding: 12px 10px; border-radius: 12px; cursor: pointer; transition: background-color 0.15s, border-top 0.15s; border: 1px solid transparent; border-top: 2px solid transparent; }
      .tab:hover { background-color: var(--lavender-web); }
      .tab.duplicate { border-left: 3px solid var(--teal); }
      .tab.dragging { opacity: 0.5; }
      .tab.drag-over-tab { border-top: 2px solid var(--teal); }
      .window.drag-over-window { box-shadow: 0 0 0 3px var(--teal); }
      .favicon-container { width: 16px; height: 16px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .favicon-container img, .favicon-container svg { width: 100%; height: 100%; }
      .tab span { flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--gunmetal); }
      .tab button { background: none; border: none; font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: 300; color: var(--teal); cursor: pointer; padding: 0 8px; border-radius: 8px; opacity: 0; transition: opacity 0.15s, background-color 0.15s, color 0.15s; }
      .tab:hover button { opacity: 1; }
      .tab button:hover { background-color: var(--columbia-blue); color: var(--gunmetal); }
    </style>
    <div id="tab-overlay-dim"></div>
    <div id="tab-overlay-container">
      <div id="tab-overlay-box">
        <input type="text" id="search" placeholder="Search tabs by title or URL..." />
        <div id="tab-scroll">
          <div id="tab-container"></div>
        </div>
      </div>
    </div>
  `;

  const tabContainer = shadowRoot.getElementById("tab-container");
  const searchInput = shadowRoot.getElementById("search");
  shadowRoot.getElementById('tab-overlay-dim').addEventListener('click', closeOverlay);

  function renderTabs(windows) {
    const allTabs = windows.flatMap(w => w.tabs.map(t => ({ ...t, windowId: w.id })));
    tabContainer.innerHTML = "";
    windows.forEach((win, windowIndex) => {
      const winDiv = document.createElement("div");
      winDiv.className = "window";
      winDiv.setAttribute('data-window-id', win.id);

      const winHeader = document.createElement("div");
      winHeader.className = "window-header";
      winHeader.textContent = `Window ${windowIndex + 1} (${win.tabs.length} tabs)`;
      winDiv.appendChild(winHeader);

      const tabsList = document.createElement("div");
      tabsList.className = "tabs-list";

      win.tabs.forEach(tab => {
        const tabDiv = document.createElement("div");
        tabDiv.className = "tab";
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
          e.dataTransfer.setData("application/json", JSON.stringify({ tabId: tab.id }));
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
          e.stopPropagation(); // **FIX**: Prevents the window's drop handler from firing.
          e.currentTarget.classList.remove("drag-over-tab");
          const data = JSON.parse(e.dataTransfer.getData("application/json"));
          if (data.tabId !== tab.id) {
            chrome.runtime.sendMessage({ type: "MOVE_TAB", tabId: data.tabId, windowId: win.id, index: tab.index }, () => fetchTabs());
          }
        });

        tabDiv.addEventListener("click", () => {
          chrome.runtime.sendMessage({ type: "ACTIVATE_TAB", id: tab.id, windowId: tab.windowId });
          closeOverlay();
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
        chrome.runtime.sendMessage({ type: "MOVE_TAB", tabId: data.tabId, windowId: win.id, index: -1 }, () => fetchTabs());
      });
    });
  }

  searchInput.addEventListener("input", () => {
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
  });

  function fetchTabs() {
    chrome.runtime.sendMessage({ type: "GET_TABS" }, (windows) => {
      if (chrome.runtime.lastError) {
        console.error("Failed to fetch tabs:", chrome.runtime.lastError);
        return;
      }
      renderTabs(windows);
    });
  }

  fetchTabs();
})();

