// Step 1: Our initial quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Wisdom" }
];

// Step 2: Function to show random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length); // Pick random number
  const quote = quotes[randomIndex]; // Get that quote
  document.getElementById("quoteDisplay").textContent = `"${quote.text}" — (${quote.category})`;
}

// Step 3: When "Show New Quote" is clicked
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Step 4: Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category }); // Add to array
    alert("Quote added successfully!");
    textInput.value = ""; // Clear input
    categoryInput.value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// Step 5: When "Add Quote" is clicked
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes)); // Save array as string
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category }); // Add to array
    saveQuotes(); // Save updated array
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter both a quote and a category.");
  }
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes); // Convert string back to array
  }
}

loadQuotes(); // Call this at the top of your script

function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2); // Prettify JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json"; // File name
  a.click();

  URL.revokeObjectURL(url); // Clean up
}

document.getElementById("exportBtn").addEventListener("click", exportQuotes);

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result); // Convert text to array
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes); // Add to existing quotes
        saveQuotes(); // Save updated list
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

document.getElementById("importFile").addEventListener("change", importFromJsonFile);
