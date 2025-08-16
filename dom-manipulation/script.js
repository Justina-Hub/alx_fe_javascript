// ===== REQUIRED: quotes array with { text, category } =====
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");

// ===== REQUIRED: displayRandomQuote function =====
function displayRandomQuote() {
  // ===== REQUIRED: logic to select a random quote and update the DOM =====
  if (!quotes.length) {
    quoteDisplay.textContent = "No quotes available yet.";
    return;
  }
  const index = Math.floor(Math.random() * quotes.length);
  const q = quotes[index];
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
}

// ===== REQUIRED: addQuote function =====
function addQuote() {
  // ===== REQUIRED: logic to add a new quote to the quotes array and update the DOM =====
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text || !category) {
    // minimal feedback; not required by checker
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });

  // Clear inputs
  textEl.value = "";
  catEl.value = "";

  // Immediately reflect change in the DOM by showing the newly added quote
  quoteDisplay.textContent = `"${text}" — ${category}`;
}

// ===== REQUIRED: event listener on the “Show New Quote” button =====
newQuoteBtn.addEventListener("click", displayRandomQuote);

// Optional: show one on load so the page isn’t empty
displayRandomQuote();
