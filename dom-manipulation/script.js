// Array of quote objects
let quotes = [];

// Session storage key for last viewed quote
const LAST_QUOTE_KEY = 'lastViewedQuote';
const QUOTES_STORAGE_KEY = 'savedQuotes';

// Initialize the application
function initializeApp() {
    loadQuotesFromStorage();
    setupEventListeners();
    updateCategoryButtons();
    showRandomQuote();
    
    // Try to show last viewed quote from session storage
    const lastQuote = sessionStorage.getItem(LAST_QUOTE_KEY);
    if (lastQuote) {
        displayQuote(JSON.parse(lastQuote));
    }
}

// Load quotes from local storage
function loadQuotesFromStorage() {
    const savedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
        console.log('Loaded quotes from local storage:', quotes.length);
    } else {
        // Load default quotes if no saved quotes exist
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "inspiration" },
            { text: "Life is what happens to you while you're busy making other plans.", category: "wisdom" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "inspiration" },
            { text: "I'm not lazy, I'm on energy saving mode.", category: "humor" },
            { text: "The only true wisdom is in knowing you know nothing.", category: "wisdom" },
            { text: "I always wanted to be somebody, but now I realize I should have been more specific.", category: "humor" }
        ];
        saveQuotes();
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    console.log('Saved quotes to local storage:', quotes.length);
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem(LAST_QUOTE_KEY, JSON.stringify(quote));
}

// Function to display a random quote
function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>No quotes available for this category. Add some quotes!</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    displayQuote(randomQuote);
    saveLastViewedQuote(randomQuote);
}

// Get filtered quotes based on current category
function getFilteredQuotes() {
    if (currentCategory === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === currentCategory);
}

// Display a specific quote
function displayQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <blockquote style="font-size: 1.2em; font-style: italic; margin: 0;">
            "${quote.text}"
        </blockquote>
        <p style="text-align: right; margin-top: 10px; color: #666;">
            — <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px;">${quote.category}</span>
        </p>
    `;
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim().toLowerCase();
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category!');
        return;
    }
    
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    quotes.push(newQuote);
    saveQuotes();
    
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    updateCategoryButtons();
    
    displayQuote(newQuote);
    saveLastViewedQuote(newQuote);
    
    // Show success message in the quote display
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML += `<p style="color: green; font-size: 0.9em;">✓ New quote added! Total quotes: ${quotes.length}</p>`;
}

// Export quotes to JSON file
function exportToJson() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Exported ${quotes.length} quotes successfully!`);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add imported quotes
            const originalLength = quotes.length;
            quotes.push(...validQuotes);
            saveQuotes();
            updateCategoryButtons();
            
            // Reset file input
            event.target.value = '';
            
            alert(`Successfully imported ${validQuotes.length} quotes! Total quotes now: ${quotes.length}`);
            
            // Show a random imported quote
            if (validQuotes.length > 0) {
                const randomImportedQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
                displayQuote(randomImportedQuote);
                saveLastViewedQuote(randomImportedQuote);
            }
            
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
            console.error('Import error:', error);
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading file');
    };
    
    fileReader.readAsText(file);
}

// Clear local storage
function clearLocalStorage() {
    if (confirm('Are you sure you want to clear ALL quotes? This action cannot be undone.')) {
        localStorage.removeItem(QUOTES_STORAGE_KEY);
        sessionStorage.removeItem(LAST_QUOTE_KEY);
        quotes = [];
        saveQuotes();
        updateCategoryButtons();
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>All quotes have been cleared. Add new quotes to get started!</p>';
        alert('All quotes have been cleared!');
    }
}

// Function to update category buttons
function updateCategoryButtons() {
    const categoryContainer = document.querySelector('.category-selector');
    const defaultCategories = ['all', 'inspiration', 'wisdom', 'humor'];
    
    // Get all unique categories from quotes
    const allCategories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing buttons (except we'll recreate them)
    const existingButtons = categoryContainer.querySelectorAll('.category-btn');
    existingButtons.forEach(btn => btn.remove());
    
    // Create category buttons
    allCategories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', category);
        button.textContent = category === 'all' ? 'All Categories' : 
                            category.charAt(0).toUpperCase() + category.slice(1);
        button.onclick = () => setCategory(category);
        
        if (category === currentCategory) {
            button.classList.add('active');
        }
        
        categoryContainer.appendChild(button);
    });
}

// Function to set current category
function setCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Show random quote from selected category
    showRandomQuote();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
}

// Global variables
let currentCategory = 'all';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);