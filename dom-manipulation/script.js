// ====================
// Dynamic Quote Generator
// Task 0 + Task 1 Combined
// ====================

// Initial quotes (used if localStorage is empty)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Wisdom" }
];

// ====================
// STORAGE FUNCTIONS
// ====================

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes array from localStorage (if available)
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// ====================
// CATEGORY DROPDOWN FUNCTIONS
// ====================

// Populate category dropdown with unique categories
function updateCategoryDropdown() {
  const categorySelect = document.getElementById("categorySelect");
  categorySelect.innerHTML = '<option value="all">All Categories</option>'; // Reset with "All"

  const categories = [...new Set(quotes.map(q => q.category))]; // Get unique categories

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// ====================
// QUOTE DISPLAY FUNCTIONS
// ====================

// Show a random quote (filtered by category if selected)
function showRandomQuote() {
  const selectedCategory = document.getElementById("categorySelect").value;

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes in this category yet.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — (${quote.category})`;
}

// Add a new quote from input fields
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    updateCategoryDropdown();
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ====================
// EXPORT & IMPORT FUNCTIONS
// ====================

// Export quotes as JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2); // Pretty JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url); // Clean up
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategoryDropdown();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (error) {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
}

// ====================
// INITIALIZATION
// ====================

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Load saved quotes and categories on page load
loadQuotes();
updateCategoryDropdown();
