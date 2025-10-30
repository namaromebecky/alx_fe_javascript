// Array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "inspiration" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "wisdom" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "inspiration" },
    { text: "I'm not lazy, I'm on energy saving mode.", category: "humor" },
    { text: "The only true wisdom is in knowing you know nothing.", category: "wisdom" },
    { text: "I always wanted to be somebody, but now I realize I should have been more specific.", category: "humor" }
];

let currentCategory = 'all';

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Filter quotes based on current category
    let filteredQuotes = quotes;
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category. Add some quotes!</p>';
        return;
    }
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Create and display the quote element
    quoteDisplay.innerHTML = `
        <blockquote style="font-size: 1.2em; font-style: italic; margin: 0;">
            "${randomQuote.text}"
        </blockquote>
        <p style="text-align: right; margin-top: 10px; color: #666;">
            — <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px;">${randomQuote.category}</span>
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
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Update category buttons if new category
    updateCategoryButtons();
    
    // Show confirmation
    alert('Quote added successfully!');
    
    // Show the newly added quote
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <blockquote style="font-size: 1.2em; font-style: italic; margin: 0;">
            "${newQuote.text}"
        </blockquote>
        <p style="text-align: right; margin-top: 10px; color: #666;">
            — <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px;">${newQuote.category}</span>
        </p>
        <p style="color: green; font-size: 0.9em;">✓ New quote added!</p>
    `;
}

// Function to update category buttons based on available categories
function updateCategoryButtons() {
    const categoryContainer = document.querySelector('.category-selector');
    const existingCategories = ['all', 'inspiration', 'wisdom', 'humor'];
    
    // Get all unique categories from quotes
    const allCategories = [...new Set(quotes.map(quote => quote.category))];
    allCategories.sort();
    
    // Create new category buttons for categories not in the default list
    allCategories.forEach(category => {
        if (!existingCategories.includes(category)) {
            // Check if button already exists
            const existingButton = categoryContainer.querySelector(`[data-category="${category}"]`);
            if (!existingButton) {
                const newButton = document.createElement('button');
                newButton.className = 'category-btn';
                newButton.setAttribute('data-category', category);
                newButton.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                newButton.onclick = function() { setCategory(category); };
                categoryContainer.appendChild(newButton);
            }
        }
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

// Function to create and show the add quote form (already in HTML)
function createAddQuoteForm() {
    // This function is not needed as the form is already in the HTML
    console.log('Add quote form is already implemented in HTML');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the "Show New Quote" button
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    
    // Add event listeners to category buttons
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            setCategory(this.getAttribute('data-category'));
        });
    });
    
    // Update category buttons on load
    updateCategoryButtons();
    
    // Show initial quote
    showRandomQuote();
});