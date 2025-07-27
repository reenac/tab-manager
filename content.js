(() => {
  // Prevent duplicate injections
  if (document.querySelector("#tab-commander-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "tab-commander-overlay";
  
  const shadowRoot = overlay.attachShadow({ mode: "open" });
  
  shadowRoot.innerHTML = `
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #e0e0e0;
      }
      
      .container {
        max-width: 90%;
        margin: 50px auto;
        padding: 20px;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .header h1 {
        margin: 0;
        font-size: 24px;
        color: #fff;
      }
      
      .action-buttons {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .action-btn {
        background: #444;
        border: none;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .action-btn:hover {
        background: #555;
      }
      
      .action-btn svg {
        width: 20px;
        height: 20px;
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
        display: block;
      }
      
      .search-container {
        margin-bottom: 20px;
      }
      
      .search-input {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        background: #2a2a2a;
        border: 1px solid #444;
        color: #fff;
        border-radius: 4px;
        box-sizing: border-box;
      }
      
      .search-input:focus {
        outline: none;
        border-color: #4a9eff;
      }
      
      .tab-container {
        display: grid;
        gap: 20px;
      }
      
      .window {
        background: #1a1a1a;
        border-radius: 8px;
        padding: 15px;
        border: 1px solid #333;
      }
      
      .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
      }
      
      .window-title-container {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }
      
      .window-title {
        font-weight: bold;
        color: #fff;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .window-title:hover {
        background: #333;
      }
      
      .window-name-input {
        background: #2a2a2a;
        border: 1px solid #444;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        max-width: 300px;
        width: auto;
      }
      
      .window-name-input:focus {
        outline: none;
        border-color: #4a9eff;
      }
      
      .close-window-btn {
        background: #d32f2f;
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .close-window-btn:hover {
        background: #f44336;
      }
      
      .tabs-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 10px;
      }
      
      .tab {
        background: #2a2a2a;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .tab:hover {
        background: #333;
        transform: translateY(-2px);
      }
      
      .tab.selected {
        border-color: #4a9eff;
        background: #1e3a5f;
      }
      
      .tab.active-tab {
        background: #a6fbb2;
        color: #000;
      }
      
      .tab.active-tab:hover {
        background: #8fdb9a;
      }
      
      .tab.active-tab .tab-url {
        color: #333;
      }
      
      .tab.duplicate {
        border-color: #ff9800;
      }
      
      .tab.hidden {
        display: none;
      }
      
      .tab-favicon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      
      .tab-content {
        flex: 1;
        min-width: 0;
      }
      
      .tab-title {
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .tab-url {
        font-size: 12px;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .close-tab {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #666;
        border: none;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: background 0.2s;
      }
      
      .close-tab:hover {
        background: #d32f2f;
      }
      
      .settings-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
        min-width: 200px;
        display: none;
        z-index: 1000;
      }
      
      .settings-panel.visible {
        display: block;
      }
      
      .settings-panel h3 {
        margin: 0 0 15px 0;
        color: #fff;
        font-size: 16px;
      }
      
      .theme-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .theme-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .theme-option input[type="radio"] {
        cursor: pointer;
      }
      
      .theme-option label {
        cursor: pointer;
        color: #e0e0e0;
      }
      
      /* Light theme overrides */
      :host(.light-theme) {
        background: rgba(255, 255, 255, 0.95);
        color: #333;
      }
      
      :host(.light-theme) .window {
        background: #f5f5f5;
        border-color: #ddd;
      }
      
      :host(.light-theme) .window-header {
        border-bottom-color: #ddd;
      }
      
      :host(.light-theme) .window-title {
        color: #333;
      }
      
      :host(.light-theme) .window-title:hover {
        background: #e0e0e0;
      }
      
      :host(.light-theme) .window-name-input {
        background: #fff;
        border-color: #ddd;
        color: #333;
      }
      
      :host(.light-theme) .tab {
        background: #fff;
      }
      
      :host(.light-theme) .tab:hover {
        background: #f0f0f0;
      }
      
      :host(.light-theme) .tab.selected {
        background: #e3f2fd;
      }
      
      :host(.light-theme) .tab-title {
        color: #333;
      }
      
      :host(.light-theme) .tab-url {
        color: #666;
      }
      
      :host(.light-theme) .search-input {
        background: #fff;
        border-color: #ddd;
        color: #333;
      }
      
      :host(.light-theme) .settings-panel {
        background: #f5f5f5;
        border-color: #ddd;
      }
      
      :host(.light-theme) .settings-panel h3 {
        color: #333;
      }
      
      :host(.light-theme) .theme-option label {
        color: #333;
      }
      
      :host(.light-theme) .header h1 {
        color: #333;
      }
      
      :host(.light-theme) .action-btn {
        background: #e0e0e0;
        color: #333;
      }
      
      :host(.light-theme) .action-btn:hover {
        background: #d0d0d0;
      }
    </style>
    
    <div class="container">
      <div class="header">
        <h1>Tab Commander</h1>
        <div class="action-buttons">
          <span class="selection-counter" id="selectionCounter">0 selected</span>
