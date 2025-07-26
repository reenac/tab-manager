/**
 * content.js (for Firefox)
 *
 * Merges Shadow DOM functionality, drag-and-drop, and the Catppuccin dark theme.
 * Injects the UI, fetches tab data, and handles user interactions.
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

  shadowRoot.innerHTML = `
    <style>
      /* Catppuccin Mocha Theme */
      :host {
        --base: #1E1E2E;
        --mantle: #181825;
        --crust: #11111B;
        --surface0: #313244;
        --surface1: #45475A;
        --text: #CDD6F4;
        --subtext1: #BAC2DE;
        --subtext0: #A6ADC8;
        --overlay2: #9399B2;
        --blue: #89B4FA;
        --peach: #FAB387;
        --mauve: #CBA6F7;
        --red: #F38BA8;
        --teal: #94E2D5; /* Using Catppuccin's teal for consistency */
      }

      * {
        box-sizing: border-box;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }

      #tab-overlay-dim {
        position: fixed;
        inset: 0;
        background-color: rgba(24, 24, 37, 0.5);
        backdrop-filter: blur(8px);
        z-index: 2147483645;
      }
      #tab-overlay-container {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
      }
      #tab-overlay-box {
        font-size: 14px;
        width: 95vw;
        height: 90vh;
        max-width: 1200px;
        background: var(--base);
        color: var(--text);
        border-radius: 24px;
        border: 1px solid var(--surface0);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
        overflow: hidden;
      }
      #search {
        flex-shrink: 0;
        width: 100%;
        font-size: 16px;
        padding: 14px 20px;
        background-color: var(--surface0);
        color: var(--text);
        border: 1px solid var(--surface1);
        border-radius: 16px;
        outline: none;
        transition: box-shadow 0.2s, border-color 0.2s;
      }
      #search::placeholder {
        color: var(--subtext0);
      }
      #search:focus {
        border-color: var(--blue);
        box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.3);
      }
      #tab-scroll {
        overflow-y: auto;
        flex-grow: 1;
        padding-right: 8px;
      }
      #tab-scroll::-webkit-scrollbar { width: 8px; }
      #tab-scroll::-webkit-scrollbar-track { background: transparent; }
      #tab-scroll::-webkit-scrollbar-thumb { background-color: var(--surface1); border-radius: 4px; }
      
      .window {
        background-color: var(--crust);
        border: 1px solid var(--surface0);
        border-radius: 18px;
        margin-bottom: 24px;
        display: block;
      }
      .window-header {
        font-size: 12px;
        font-weight: 600;
        color: var(--mauve);
        padding: 12px 18px;
        border-bottom: 1px solid var(--surface0);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      /* **FIXED**: Re-applied the 3-column grid layout */
      .tabs-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 8px;
      }
      .tab {
        display: flex;
        align-items: center;
        padding: 12px 10px;
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.15s, border-top 0.15s;
        border: 1px solid transparent;
        border-top: 2px solid transparent; /* For drop indicator */
      }
      .tab:hover {
        background-color: var(--surface0);
      }
      .tab.duplicate {
        border-left: 3px solid var(--peach);
      }
      .tab.dragging {
        opacity: 0.5;
      }
      .tab.drag-over {
        border-top: 2px solid var(--teal);
      }
      .tab img {
        width: 16px;
        height: 16px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .tab span {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--subtext1);
      }
      .tab:hover span {
        color: var(--text);
      }
      .tab button {
        background: none;
        border: none;
        font-family: 'Times New Roman', Times, serif;
        font-size: 24px;
        font-weight: 300;
        color: var(--overlay2);
        cursor: pointer;
        padding: 0 8px;
        border-radius: 8px;
        opacity: 0;
        transition: opacity 0.15s, background-color 0.15s, color 0.15s;
      }
      .tab:hover button {
        opacity: 1;
      }
      .tab button:hover {
          background-color: var(--surface1);
          color: var(--red);
      }
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
    windows.forEach((win, index) => {
      if (win.tabs.length === 0) return;
      const winDiv = document.createElement("div");
      winDiv.className = "window";
      const winHeader = document.createElement("div");
      winHeader.className = "window-header";
      winHeader.textContent = `Window ${index + 1} (${win.tabs.length} tabs)`;
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
        const titleWrapper = document.createElement("span");
        const favicon = document.createElement("img");
        favicon.src = tab.favIconUrl || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        favicon.onerror = () => { favicon.style.display = 'none'; };
        
        let title = tab.title || 'Untitled Tab';
        if (title.length > 50) {
          title = title.substring(0, 50) + '...';
        }
        const titleText = document.createTextNode(title);

        titleWrapper.appendChild(favicon);
        titleWrapper.appendChild(titleText);
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          browser.runtime.sendMessage({ type: "CLOSE_TAB", id: tab.id }).then(fetchTabs);
        };
        tabDiv.appendChild(titleWrapper);
        tabDiv.appendChild(closeBtn);

        tabDiv.setAttribute("draggable", "true");

        tabDiv.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("application/json", JSON.stringify({ tabId: tab.id, windowId: tab.windowId }));
          e.dataTransfer.effectAllowed = "move";
          e.currentTarget.classList.add("dragging");
        });

        tabDiv.addEventListener("dragend", (e) => {
          e.currentTarget.classList.remove("dragging");
        });

        tabDiv.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.currentTarget.classList.add("drag-over");
        });

        tabDiv.addEventListener("dragleave", (e) => {
          e.currentTarget.classList.remove("drag-over");
        });

        tabDiv.addEventListener("drop", (e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("drag-over");
          const data = JSON.parse(e.dataTransfer.getData("application/json"));
          
          if (data.tabId !== tab.id && data.windowId === tab.windowId) {
            browser.runtime.sendMessage({
              type: "MOVE_TAB",
              tabId: data.tabId,
              windowId: tab.windowId,
              index: tab.index
            }).then(fetchTabs);
          }
        });

        tabDiv.addEventListener("click", () => {
          browser.runtime.sendMessage({ type: "ACTIVATE_TAB", id: tab.id, windowId: tab.windowId });
          closeOverlay();
        });

        tabsList.appendChild(tabDiv);
      });
      winDiv.appendChild(tabsList);
      tabContainer.appendChild(winDiv);
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
    browser.runtime.sendMessage({ type: "GET_TABS" }).then(renderTabs, (error) => {
        console.error("Failed to fetch tabs:", error);
    });
  }

  fetchTabs();
})();

