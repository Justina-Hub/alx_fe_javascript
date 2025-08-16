/* =========================================================
   Dynamic Quote Generator
   - Advanced DOM manipulation
   - Web Storage (localStorage + sessionStorage)
   - JSON Import/Export
   - Category filtering with persistence
   - Server sync simulation + conflict resolution
   ========================================================= */

(() => {
  // ---------- Storage Keys ----------
  const LS_QUOTES_KEY = "dqg_quotes";
  const LS_LAST_FILTER = "dqg_lastFilter";
  const SS_LAST_VIEWED = "dqg_lastViewedQuote";

  // ---------- State ----------
  /** @typedef {{id:string,text:string,category:string,updatedAt:number,source:'local'|'server'}} Quote */
  /** @type {Quote[]} */
  let quotes = [];
  let currentQuoteId = null;

  // ---------- Elements ----------
  const els = {
    categoryFilter: document.getElementById("categoryFilter"),
    quoteText: document.getElementById("quoteText"),
    quoteCategory: document.getElementById("quoteCategory"),
    newQuoteBtn: document.getElementById("btnNewQuote"),
    addQuoteBtn: document.getElementById("btnAddQuote"),
    exportBtn: document.getElementById("btnExport"),
    syncBtn: document.getElementById("btnSync"),
    tweetLink: document.getElementById("tweetLink"),
    clearBtn: document.getElementById("btnClearStorage"),
    notifications: document.getElementById("notifications"),
  };

  // ---------- Utilities ----------
  const uid = (prefix = "local") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  const persistQuotes = () => {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  };

  const loadQuotes = () => {
    try {
      const raw = localStorage.getItem(LS_QUOTES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          quotes = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to parse saved quotes; falling back to defaults.", e);
    }
    // Seed defaults (you can change or add to these)
    quotes = [
      { id: uid(), text: "The only way to do great work is to love what you do.", category: "Inspiration", updatedAt: Date.now(), source: "local" },
      { id: uid(), text: "Simplicity is the soul of efficiency.", category: "Programming", updatedAt: Date.now(), source: "local" },
      { id: uid(), text: "Whether you think you can, or you think you can’t—you’re right.", category: "Mindset", updatedAt: Date.now(), source: "local" },
      { id: uid(), text: "Talk is cheap. Show me the code.", category: "Programming", updatedAt: Date.now(), source: "local" },
      { id: uid(), text: "Small steps every day add up to big results.", category: "Inspiration", updatedAt: Date.now(), source: "local" },
    ];
    persistQuotes();
  };

  const saveLastFilter = (val) => localStorage.setItem(LS_LAST_FILTER, val);
  const loadLastFilter = () => localStorage.getItem(LS_LAST_FILTER) || "all";

  const saveLastViewed = (q) => {
    if (!q) return;
    sessionStorage.setItem(SS_LAST_VIEWED, JSON.stringify({ id: q.id, when: Date.now() }));
  };
  const loadLastViewed = () => {
    try {
      const raw = sessionStorage.getItem(SS_LAST_VIEWED);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const uniqueCategories = () => {
    const set = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
    return Array.from(set).sort((a,b) => a.localeCompare(b));
  };
  

  // ---------- Notifications ----------
  function notify(message, kind = 'notice', actions = []) {
    const wrap = els.notifications;
    const card = document.createElement('div');
    card.className = `notice ${kind==='ok'?'ok':kind==='err'?'err':''}`;
    const p = document.createElement('div'); p.textContent = message; card.appendChild(p);
    if (actions.length) {
      const bar = document.createElement('div'); bar.className = 'bar';
      actions.forEach(({label, onClick}) => {
        const btn = document.createElement('button'); btn.textContent = label;
        btn.onclick = () => { try { onClick?.(); } finally { wrap.removeChild(card); } };
        bar.appendChild(btn);
      });
      card.appendChild(bar);
    }
    wrap.appendChild(card);
    // Auto-dismiss after 4s
    setTimeout(() => { if (wrap.contains(card)) wrap.removeChild(card); }, 4000);
  }

  // Expose notify for potential debugging (optional)
  window.notify = notify;

  // ---------- DOM Updaters ----------
  function renderQuote(q) {
    els.quoteText.textContent = q.text;
    els.quoteCategory.textContent = q.category ? `— ${q.category}` : "";
    currentQuoteId = q.id;
    saveLastViewed(q);
    // Update tweet link
    const tweet = `"${q.text}" — #${(q.category || "Quote").replace(/\s+/g,'')}`;
    els.tweetLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
  }

  function populateCategories() {
    // Clear (keep "All Categories")
    const select = els.categoryFilter;
    select.querySelectorAll('option:not([value="all"])').forEach(o => o.remove());
    uniqueCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      select.appendChild(opt);
    });
    // Restore last selection if possible
    const last = loadLastFilter();
    if ([...select.options].some(o => o.value === last)) {
      select.value = last;
    } else {
      select.value = "all";
    }
  }

  function currentFilteredQuotes() {
    const sel = els.categoryFilter.value;
    return sel === "all" ? quotes : quotes.filter(q => q.category === sel);
  }

  function showRandomQuote() {
    const list = currentFilteredQuotes();
    if (!list.length) {
      notify("No quotes found for this category.", 'err');
      els.quoteText.textContent = "No quotes yet. Add one!";
      els.quoteCategory.textContent = "";
      currentQuoteId = null;
      els.tweetLink.href = "#";
      return;
    }
    const pick = list[Math.floor(Math.random()*list.length)];
    renderQuote(pick);
  }

  function filterQuotes() {
    // Persist selection
    saveLastFilter(els.categoryFilter.value);
    // Show a new random from the filtered set
    showRandomQuote();
  }



  // ---------- Add Quote (form is created dynamically) ----------
  function createAddQuoteForm() {
    // Overlay
    const overlay = document.createElement('div'); overlay.className = 'overlay';
    const modal = document.createElement('div'); modal.className = 'modal';
    overlay.appendChild(modal);

    modal.innerHTML = `
      <h2 style="margin:0 0 .5rem;">Add a New Quote</h2>
      <div class="row">
        <label for="newQuoteText"><strong>Quote</strong></label>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <small>Tip: keep it short and clear.</small>
      </div>
      <div class="row">
        <label for="newQuoteCategory"><strong>Category</strong></label>
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      </div>
      <div class="actions">
        <button id="btnCancelAdd">Cancel</button>
        <button id="btnConfirmAdd">Add Quote</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => document.body.removeChild(overlay);

    modal.querySelector("#btnCancelAdd").onclick = close;
    modal.querySelector("#btnConfirmAdd").onclick = () => {
      addQuote();
      close();
    };
  }

  function addQuote() {
    // Read fields from the (just-created) form
    const textEl = document.getElementById("newQuoteText");
    const catEl  = document.getElementById("newQuoteCategory");
    const text = (textEl?.value || "").trim();
    const category = (catEl?.value || "").trim() || "General";

    if (!text) {
      notify("Please enter a quote.", 'err');
      return;
    }

    // De-duplicate (text+category)
    const exists = quotes.some(q => q.text.toLowerCase() === text.toLowerCase() && q.category.toLowerCase() === category.toLowerCase());
    if (exists) {
      notify("That quote already exists in this category.", 'err');
      return;
    }

    const q = { id: uid(), text, category, updatedAt: Date.now(), source: "local" };
    quotes.push(q);
    persistQuotes();

    // If new category, repopulate categories
    populateCategories();

    // If filter matches (or "all"), show the new quote
    const sel = els.categoryFilter.value;
    if (sel === "all" || sel === category) renderQuote(q);

    notify("Quote added.", 'ok', [
      { label: "Show Random", onClick: showRandomQuote }
    ]);
  }

  // Make functions available for inline handlers (per assignment spec)
  window.showRandomQuote = showRandomQuote;
  window.createAddQuoteForm = createAddQuoteForm;
  window.addQuote = addQuote;
  window.filterQuotes = filterQuotes;


    // ---------- Import / Export ----------
function exportToJsonFile() {
  if (!quotes || quotes.length === 0) {
    alert("No quotes available to export!");
    return;
  }

  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

window.exportToJsonFile = exportToJsonFile;


// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
      quotes.push(...importedQuotes);
     persistQuotes();
     populateCategories();
     showRandomQuote();
     alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listener for export button
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);







  window.importFromJsonFile = importFromJsonFile; // per assignment snippet
  function clearStorage() {
    localStorage.removeItem(LS_QUOTES_KEY);
    localStorage.removeItem(LS_LAST_FILTER);
    sessionStorage.removeItem(SS_LAST_VIEWED);
    loadQuotes(); // reset to defaults
    populateCategories();
    showRandomQuote();
    notify("Local storage cleared.", 'ok');
  }

  // ---------- Server Sync Simulation ----------
  // We simulate a server using JSONPlaceholder posts. Server "wins" in conflicts.
  async function syncWithServer() {
    try {
      // Fetch a handful of posts as "server quotes"
      const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const posts = await res.json();

      /** @type {Quote[]} */
      const serverQuotes = posts.map(p => ({
        id: `server-${p.id}`,
        text: (p.title || p.body || "").trim() || `Post #${p.id}`,
        category: "Server",
        updatedAt: Date.now(),
        source: "server",
      }));

      let added = 0, updated = 0;

      serverQuotes.forEach(sq => {
        const idx = quotes.findIndex(q => q.id === sq.id);
        if (idx === -1) {
          quotes.push(sq);
          added++;
        } else {
          // Conflict? If texts differ, server wins
          if (quotes[idx].text !== sq.text || quotes[idx].category !== sq.category) {
            quotes[idx] = { ...sq, updatedAt: Date.now() };
            updated++;
          }
        }
      });

      if (added || updated) {
        persistQuotes();
        populateCategories();
        notify(`Synced with server. Added ${added}, updated ${updated}.`, 'ok', [
          { label: "Show Random", onClick: showRandomQuote }
        ]);
      } else {
        notify("Sync complete. No changes.", 'notice');
      }
    } catch (e) {
      console.error(e);
      notify("Sync failed. Check your internet connection.", 'err');
    }
  }

  // ---------- Event Wiring ----------
  function init() {
    loadQuotes();
    populateCategories();

    // Restore last filter & last viewed
    const last = loadLastViewed();
    if (last) {
      const found = quotes.find(q => q.id === last.id);
      if (found) renderQuote(found);
      else showRandomQuote();
    } else {
      showRandomQuote();
    }







    els.newQuoteBtn.addEventListener("click", showRandomQuote);
    els.addQuoteBtn.addEventListener("click", createAddQuoteForm);
    els.syncBtn.addEventListener("click", syncWithServer);
    els.clearBtn.addEventListener("click", clearStorage);

    // Periodic sync every 45s (simulated)
    setInterval(syncWithServer, 45000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();

