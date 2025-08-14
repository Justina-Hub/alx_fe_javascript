// ---------------- Initial Data ----------------
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Philosophy" }
];

// Load quotes from localStorage if available
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// Remember last filter
let lastFilter = localStorage.getItem("lastFilter") || "all";

// ---------------- DOM Elements ----------------
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// ---------------- Event Listeners ----------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);

// ---------------- Core Functions ----------------
function showRandomQuote() {
  let filteredQuotes = quotes;
  if (lastFilter !== "all") {
    filteredQuotes = quotes.filter(q => q.category === lastFilter);
  }
  if (filteredQuotes.length === 0) {
    notify("No quotes in this category!", "err");
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const { text, category } = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `"${text}" <br><small>- ${category}</small>`;

  // Save last viewed in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    notify("Please enter both text and category!", "err");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  notify("Quote added successfully!", "ok");

  textInput.value = "";
  categoryInput.value = "";
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastFilter) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  lastFilter = categoryFilter.value;
  localStorage.setItem("lastFilter", lastFilter);
  showRandomQuote();
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      notify("Quotes imported successfully!", "ok");
    } catch (err) {
      notify("Error importing quotes: " + err.message, "err");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---------------- Notifications ----------------
function notify(message, kind = 'notice') {
  const wrap = document.getElementById('notifications');
  const card = document.createElement('div');
  card.className = `notice ${kind === 'ok' ? 'ok' : kind === 'err' ? 'err' : ''}`;
  card.textContent = message;
  wrap.appendChild(card);
  setTimeout(() => wrap.removeChild(card), 3000);
}

// ---------------- Server Sync Simulation ----------------
async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Simulate server quotes
    const serverQuotes = [
      { text: "Server says hello!", category: "Server" }
    ];

    // Conflict resolution: server data overrides duplicates
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    notify("Synced with server!", "ok");
  } catch (err) {
    notify("Server sync failed: " + err.message, "err");
  }
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// ---------------- Init ----------------
populateCategories();
showRandomQuote();

// Restore last viewed quote if available in sessionStorage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  const { text, category } = JSON.parse(lastViewed);
  quoteDisplay.innerHTML = `"${text}" <br><small>- ${category}</small>`;
}
