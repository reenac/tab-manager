(() => {
  if (document.getElementById("tab-overlay-shadow-host")) return;

  // ESC to close overlay
  const escHandler = (e) => {
    if (e.key === "Escape") {
      document.getElementById("tab-overlay-shadow-host")?.remove();
      window.removeEventListener("keydown", escHandler);
    }
  };
  window.addEventListener("keydown", escHandler);

  // Create shadow host and shadow root
  const host = document.createElement("div");
  host.id = "tab-overlay-shadow-host";
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });

  // HTML template
  const html = document.createElement("div");
  html.innerHTML = `
    <style>
      :host {
        --cerulean: #227c9dff;
        --light-sea-green: #17c3b2ff;
        --sunset: #ffcb77ff;
        --floral-white: #fef9efff;
        --light-red: #fe6d73ff;
      }

#scroll-clip {
  border-radius: 0 0 16px 16px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 16px;
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
#scroll-area {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 6px;
}

      * {
        box-sizing: border-box;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        color: black;
        line-height: 1.4;
      }
      #tab-overlay-dim {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 2147483647;
      }
      #tab-overlay-container {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
      }
      #tab-overlay-box {
  padding-top: 16px;
        width: 95vw;
        max-width: 1200px;
        min-width: 800px;
        height: 90vh;
        background: white;
        border-radius: 16px;
        padding: 20px;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }
      #search {
  margin: 0;
  border-radius: 8px;
  width: 100%;
  background: white;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  position: sticky;
  top: 0;
  z-index: 1000;
        position: sticky;
        top: 0;
        background: white;
        z-index: 10000;
        margin-bottom: 10px;
        padding: 8px;
        border: 1px solid #ccc;
      }
      #tab-container {
        flex-grow: 1;
      }
      .window {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 32px;
        border-top: 1px solid #ccc;
        padding-top: 16px;
      }
      
      .tab {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 6px;
        margin: 2px 0;
        border-radius: 4px;
        background-color: transparent;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        color: var(--cerulean);
        position: relative;
      }
      .tab:hover {
        background-color: #bee1e6 !important;
        color: black !important;
      }
      .tab.duplicate {
        background-color: var(--light-red);
        color: white;
      }
      .tab.dragging {
        opacity: 0.5;
        outline: 1px dashed var(--cerulean);
      }
      .tab button {
        visibility: hidden;
        position: absolute;
        top: 50%;
        right: 6px;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 18px;
        font-weight: normal;
        color: #333;
        cursor: pointer;
        padding: 0;
        margin: 0;
      }
      .tab:hover button {
        visibility: visible;
      }
      .tab button:hover {
        font-weight: bold;
      }
      .tab button:focus,
      .tab button:active {
        outline: none !important;
        box-shadow: none !important;
      }
    
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 6px;
        margin: 2px 0;
        border-radius: 4px;
        background-color: transparent;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .tab:hover {
        background-color: #eee;
      }
      .tab.duplicate {
        background-color: #ffe4e4;
      }
      .tab.dragging {
        opacity: 0.5;
        outline: 1px dashed #aaa;
      }
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        cursor: pointer;
      }
      .tab.duplicate {
        background-color: #ffe4e4;
      }
      .tab img {
        width: 16px;
        height: 16px;
        margin-right: 6px;
        flex-shrink: 0;
      }
      .tab span {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .tab.dragging {
        opacity: 0.5;
        outline: 2px dashed #888;
      }
    .tab button {
        margin-left: 6px;
      }
    </style>
    <div id="tab-overlay-dim"></div>
    <div id="tab-overlay-container">
      <div id="tab-overlay-box"><div id="scroll-clip"><div id="scroll-area">
        <input type="text" id="search" placeholder="Search tabs..." />
        <div id="tab-container"></div></div></div>
      </div>
    </div>
  `;

  shadowRoot.appendChild(html);

  const tabContainer = html.querySelector("#tab-container");
  const searchInput = html.querySelector("#search");

  function renderTabs(windows) {
    const allTabs = windows.flatMap(w => w.tabs.map(t => ({ ...t, windowId: w.id })));
    const titleCount = allTabs.reduce((acc, tab) => {
      acc[tab.title] = (acc[tab.title] || 0) + 1;
      return acc;
    }, {});

    tabContainer.innerHTML = "";

    windows.forEach(win => {
      const winDiv = document.createElement("div");
      winDiv.className = "window";

      win.tabs.forEach(tab => {
        const tabDiv = document.createElement("div");
        tabDiv.className = "tab";
        if (titleCount[tab.title] > 1) tabDiv.classList.add("duplicate");

        const titleWrapper = document.createElement("span");
        const favicon = document.createElement("img");
        favicon.src = tab.favIconUrl || "https://www.google.com/chrome/static/images/favicons/favicon-96x96.png";
        favicon.onerror = () => {
          favicon.src = "https://www.google.com/chrome/static/images/favicons/favicon-96x96.png";
        };
        const safeTitle = tab.title ? tab.title.slice(0, 50) : "Untitled";
        tabDiv.setAttribute('data-full-title', tab.title || '');
        tabDiv.setAttribute('data-url', tab.url || '');
        const titleText = document.createTextNode(safeTitle);
        titleWrapper.appendChild(favicon);
        titleWrapper.appendChild(titleText);

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.onclick = async (e) => {
          e.stopPropagation();
          await chrome.runtime.sendMessage({ type: "CLOSE_TAB", id: tab.id });
          fetchTabs();
        };

        tabDiv.appendChild(titleWrapper);
        
        tabDiv.appendChild(closeBtn);
        tabDiv.setAttribute("draggable", "true");
        tabDiv.addEventListener("dragstart", (e) => {
          tabDiv.classList.add("dragging");
        });
        tabDiv.addEventListener("dragend", () => {
          tabDiv.classList.remove("dragging");
        });
        tabDiv.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify({
            tabId: tab.id,
            windowId: tab.windowId,
            index: tab.index
          }));
          e.dataTransfer.effectAllowed = "move";
        });

        tabDiv.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        tabDiv.addEventListener("drop", (e) => {
          e.preventDefault();
          const data = JSON.parse(e.dataTransfer.getData("text/plain"));
          if (data.tabId !== tab.id && data.windowId === tab.windowId) {
            chrome.runtime.sendMessage({
              type: "MOVE_TAB",
              tabId: data.tabId,
              windowId: data.windowId,
              index: tab.index
            }, () => {
              fetchTabs();
            });
          }
        });
    
        tabDiv.addEventListener("click", () => {
          chrome.runtime.sendMessage({ type: "ACTIVATE_TAB", id: tab.id, windowId: tab.windowId });
        });

        winDiv.appendChild(tabDiv);
      });

      tabContainer.appendChild(winDiv);
    });
  }

  searchInput.addEventListener("input", () => {
    const windows = html.querySelectorAll(".window");
    windows.forEach(windowDiv => {
      const tabs = windowDiv.querySelectorAll(".tab");
      let anyVisible = false;
      tabs.forEach(tab => {
        const title = tab.getAttribute('data-full-title').toLowerCase();
      const url = tab.getAttribute('data-url').toLowerCase();
        const match = title.includes(searchInput.value.toLowerCase()) || url.includes(searchInput.value.toLowerCase());
        tab.style.display = match ? "" : "none";
        if (match) anyVisible = true;
      });
      windowDiv.style.display = anyVisible ? "grid" : "none";
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