// Array of quote objects
let quotes = [];

// Storage keys
const LAST_QUOTE_KEY = 'lastViewedQuote';
const QUOTES_STORAGE_KEY = 'savedQuotes';
const LAST_FILTER_KEY = 'lastSelectedFilter';
const LAST_SYNC_KEY = 'lastSyncTime';
const SERVER_QUOTES_KEY = 'serverQuotesBackup';

// Global variables
let selectedCategory = 'all';
let autoSyncInterval = null;
let isAutoSyncEnabled = false;

// Mock server URL (using JSONPlaceholder simulation)
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Initialize the application
function initializeApp() {
    loadQuotesFromStorage();
    setupEventListeners();
    populateCategories();
    restoreLastFilter();
    showFilteredQuotes();
    initializeSync();
    
    // Try to show last viewed quote from session storage
    const lastQuote = sessionStorage.getItem(LAST_QUOTE_KEY);
    if (lastQuote) {
        displayQuote(JSON.parse(lastQuote));
    }
}

// Initialize sync functionality
function initializeSync() {
    // Load auto sync preference
    const autoSyncPref = localStorage.getItem('autoSyncEnabled');
    isAutoSyncEnabled = autoSyncPref === 'true';
    
    // Update UI
    updateSyncUI();
    
    // Start auto sync if enabled
    if (isAutoSyncEnabled) {
        startAutoSync();
    }
    
    // Load last sync time
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
        document.getElementById('lastSyncTime').textContent = new Date(parseInt(lastSync)).toLocaleString();
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

// Save last selected filter to local storage
function saveLastFilter() {
    localStorage.setItem(LAST_FILTER_KEY, selectedCategory);
    console.log('Saved selected category to local storage:', selectedCategory);
}

// Restore last selected category when the page loads
function restoreLastFilter() {
    const savedFilter = localStorage.getItem(LAST_FILTER_KEY);
    if (savedFilter) {
        selectedCategory = savedFilter;
        const filterDropdown = document.getElementById('categoryFilter');
        if (filterDropdown) {
            filterDropdown.value = selectedCategory;
        }
        console.log('Restored last selected category:', selectedCategory);
    }
}

// ========== SERVER SYNC FUNCTIONS ==========

// Simulate fetching quotes from server
async function fetchFromServer() {
    try {
        updateSyncStatus('Syncing with server...', 'info');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // In a real app, this would be: await fetch(MOCK_SERVER_URL)
        // For simulation, we'll create mock server data based on our local data
        const mockServerQuotes = generateMockServerData();
        
        updateSyncStatus('Sync completed', 'success');
        return mockServerQuotes;
    } catch (error) {
        console.error('Failed to fetch from server:', error);
        updateSyncStatus('Sync failed', 'error');
        return null;
    }
}

// Simulate posting quotes to server
async function postToServer(quotesToPost) {
    try {
        updateSyncStatus('Sending data to server...', 'info');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // In a real app, this would be: await fetch(MOCK_SERVER_URL, { method: 'POST', body: JSON.stringify(quotesToPost) })
        console.log('Simulated server POST with data:', quotesToPost);
        
        updateSyncStatus('Data sent to server', 'success');
        return true;
    } catch (error) {
        console.error('Failed to post to server:', error);
        updateSyncStatus('Server update failed', 'error');
        return false;
    }
}

// Generate mock server data for simulation
function generateMockServerData() {
    const serverQuotes = [...quotes];
    
    // Simulate server having some different data
    if (Math.random() > 0.7) { // 30% chance of server having different data
        // Add a new quote from "server"
        serverQuotes.push({
            text: "Server-added quote: " + new Date().toLocaleTimeString(),
            category: "server"
        });
        
        // Occasionally modify an existing quote
        if (serverQuotes.length > 2 && Math.random() > 0.5) {
            const randomIndex = Math.floor(Math.random() * serverQuotes.length);
            serverQuotes[randomIndex].text += " (updated from server)";
        }
    }
    
    return serverQuotes;
}

// Manual sync function
async function manualSync() {
    await syncWithServer();
}

// Toggle auto sync
function toggleAutoSync() {
    isAutoSyncEnabled = !isAutoSyncEnabled;
    localStorage.setItem('autoSyncEnabled', isAutoSyncEnabled.toString());
    
    if (isAutoSyncEnabled) {
        startAutoSync();
    } else {
        stopAutoSync();
    }
    
    updateSyncUI();
}

// Start automatic syncing
function startAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    // Sync every 30 seconds
    autoSyncInterval = setInterval(() => {
        syncWithServer();
    }, 30000);
    
    updateSyncStatus('Auto sync enabled', 'success');
}

// Stop automatic syncing
function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
    updateSyncStatus('Auto sync disabled', 'warning');
}

// Main sync function
async function syncWithServer() {
    const serverQuotes = await fetchFromServer();
    
    if (!serverQuotes) {
        return; // Sync failed
    }
    
    // Store server data for conflict resolution
    localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(serverQuotes));
    
    // Check for conflicts
    const conflicts = detectConflicts(quotes, serverQuotes);
    
    if (conflicts.length > 0) {
        showConflictResolution(conflicts, serverQuotes);
    } else {
        // No conflicts, merge data
        mergeData(serverQuotes, 'server');
        updateSyncStatus('Data synced successfully', 'success');
    }
    
    // Update last sync time
    const now = new Date().getTime();
    localStorage.setItem(LAST_SYNC_KEY, now.toString());
    document.getElementById('lastSyncTime').textContent = new Date(now).toLocaleString();
}

// Detect conflicts between local and server data
function detectConflicts(localData, serverData) {
    const conflicts = [];
    
    // Find quotes that exist in both but have different content
    localData.forEach(localQuote => {
        const serverQuote = serverData.find(sq => 
            sq.text === localQuote.text || 
            (Math.abs(sq.text.length - localQuote.text.length) < 10 && sq.category === localQuote.category)
        );
        
        if (serverQuote && serverQuote.text !== localQuote.text) {
            conflicts.push({
                local: localQuote,
                server: serverQuote,
                type: 'content'
            });
        }
    });
    
    return conflicts;
}

// Show conflict resolution UI
function showConflictResolution(conflicts, serverQuotes) {
    const conflictDiv = document.getElementById('conflictResolution');
    const conflictMessage = document.getElementById('conflictMessage');
    const conflictChoices = document.getElementById('conflictChoices');
    
    conflictMessage.textContent = `Found ${conflicts.length} conflict(s) between local and server data.`;
    
    // Create resolution options
    conflictChoices.innerHTML = `
        <button onclick="resolveConflicts('server')" style="background-color: #dc3545;">Use Server Data</button>
        <button onclick="resolveConflicts('local')" style="background-color: #28a745;">Keep Local Data</button>
        <button onclick="resolveConflicts('merge')" style="background-color: #17a2b8;">Merge Both</button>
        <button onclick="hideConflictResolution()" style="background-color: #6c757d;">Cancel</button>
    `;
    
    conflictDiv.style.display = 'block';
    updateSyncStatus('Conflicts detected - resolution required', 'warning');
}

// Hide conflict resolution UI
function hideConflictResolution() {
    document.getElementById('conflictResolution').style.display = 'none';
    updateSyncStatus('Conflict resolution cancelled', 'warning');
}

// Resolve conflicts based on user choice
function resolveConflicts(resolutionType) {
    const serverQuotes = JSON.parse(localStorage.getItem(SERVER_QUOTES_KEY) || '[]');
    
    switch (resolutionType) {
        case 'server':
            mergeData(serverQuotes, 'server');
            updateSyncStatus('Used server data (local changes lost)', 'warning');
            break;
        case 'local':
            // Keep local data, but still post it to server
            postToServer(quotes);
            updateSyncStatus('Kept local data', 'success');
            break;
        case 'merge':
            mergeData(serverQuotes, 'merge');
            updateSyncStatus('Merged local and server data', 'success');
            break;
    }
    
    hideConflictResolution();
    showFilteredQuotes();
}

// Merge data based on resolution strategy
function mergeData(serverQuotes, strategy) {
    switch (strategy) {
        case 'server':
            // Server takes precedence
            quotes = [...serverQuotes];
            break;
        case 'merge':
            // Merge both datasets, server data takes precedence for conflicts
            const mergedQuotes = [];
            const allQuotes = [...quotes, ...serverQuotes];
            
            // Use a Map to handle duplicates (server data overwrites local)
            const quoteMap = new Map();
            allQuotes.forEach(quote => {
                // Use a combination of text and category as key
                const key = `${quote.text.substring(0, 50)}|${quote.category}`;
                quoteMap.set(key, quote);
            });
            
            quotes = Array.from(quoteMap.values());
            break;
    }
    
    saveQuotes();
    populateCategories();
}

// Update sync status UI
function updateSyncStatus(message, type) {
    const statusElement = document.getElementById('syncStatus');
    statusElement.textContent = message;
    
    // Reset classes
    statusElement.className = '';
    
    // Add type-based styling
    switch (type) {
        case 'success':
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            statusElement.style.border = '1px solid #c3e6cb';
            break;
        case 'error':
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
            statusElement.style.border = '1px solid #f5c6cb';
            break;
        case 'warning':
            statusElement.style.backgroundColor = '#fff3cd';
            statusElement.style.color = '#856404';
            statusElement.style.border = '1px solid #ffeaa7';
            break;
        case 'info':
            statusElement.style.backgroundColor = '#d1ecf1';
            statusElement.style.color = '#0c5460';
            statusElement.style.border = '1px solid #bee5eb';
            break;
    }
}

// Update sync UI elements
function updateSyncUI() {
    const autoSyncBtn = document.getElementById('autoSyncBtn');
    const autoSyncStatus = document.getElementById('autoSyncStatus');
    
    if (isAutoSyncEnabled) {
        autoSyncBtn.textContent = 'Disable Auto Sync';
        autoSyncBtn.style.backgroundColor = '#dc3545';
        autoSyncStatus.textContent = 'Enabled (every 30s)';
    } else {
        autoSyncBtn.textContent = 'Enable Auto Sync';
        autoSyncBtn.style.backgroundColor = '#28a745';
        autoSyncStatus.textContent = 'Disabled';
    }
}

// ========== EXISTING APPLICATION FUNCTIONS ==========

// Populate categories in dropdown and buttons
function populateCategories() {
    const uniqueCategories = getUniqueCategories();
    populateCategoryDropdown(uniqueCategories);
    populateCategoryButtons(uniqueCategories);
    updateCurrentFilterDisplay();
}

// Get unique categories from quotes
function getUniqueCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    return categories.sort();
}

// Populate category dropdown
function populateCategoryDropdown(categories) {
    const filterDropdown = document.getElementById('categoryFilter');
    if (!filterDropdown) return;
    
    while (filterDropdown.options.length > 1) {
        filterDropdown.remove(1);
    }
    
    categories.forEach(category => {
        if (category !== 'all') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            filterDropdown.appendChild(option);
        }
    });
    
    filterDropdown.value = selectedCategory;
}

// Populate category buttons
function populateCategoryButtons(categories) {
    const categoryContainer = document.querySelector('.category-selector');
    if (!categoryContainer) return;
    
    const existingButtons = categoryContainer.querySelectorAll('.category-btn');
    existingButtons.forEach(btn => btn.remove());
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', category);
        button.textContent = category === 'all' ? 'All Categories' : 
                            category.charAt(0).toUpperCase() + category.slice(1);
        button.onclick = () => setCategory(category);
        
        if (category === selectedCategory) {
            button.classList.add('active');
        }
        
        categoryContainer.appendChild(button);
    });
}

// Update current filter display
function updateCurrentFilterDisplay() {
    const currentFilterElement = document.getElementById('currentFilter');
    if (currentFilterElement) {
        const displayText = selectedCategory === 'all' ? 
            'All Categories' : 
            selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        
        currentFilterElement.innerHTML = `Currently showing: <strong>${displayText}</strong> (${getFilteredQuotes().length} quotes)`;
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const filterDropdown = document.getElementById('categoryFilter');
    if (filterDropdown) {
        selectedCategory = filterDropdown.value;
        saveLastFilter();
        updateActiveButton();
        showFilteredQuotes();
        updateCurrentFilterDisplay();
    }
}

// Set category from buttons
function setCategory(category) {
    selectedCategory = category;
    saveLastFilter();
    
    const filterDropdown = document.getElementById('categoryFilter');
    if (filterDropdown) {
        filterDropdown.value = selectedCategory;
    }
    
    updateActiveButton();
    showFilteredQuotes();
    updateCurrentFilterDisplay();
}

// Update active button state
function updateActiveButton() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === selectedCategory) {
            btn.classList.add('active');
        }
    });
}

// Show filtered quotes
function showFilteredQuotes() {
    const filteredQuotes = getFilteredQuotes();
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p>No quotes available for the selected category.</p>
            <p style="color: #666; font-size: 0.9em;">
                Add some quotes in the "${selectedCategory === 'all' ? 'any' : selectedCategory}" category!
            </p>
        `;
        return;
    }
    
    let quotesHTML = '';
    filteredQuotes.forEach((quote, index) => {
        quotesHTML += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #007bff;">
                <blockquote style="font-size: 1.1em; font-style: italic; margin: 0;">
                    "${quote.text}"
                </blockquote>
                <p style="text-align: right; margin-top: 8px; color: #666; font-size: 0.9em;">
                    — <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px;">${quote.category}</span>
                </p>
            </div>
        `;
    });
    
    quoteDisplay.innerHTML = `
        <div style="margin-bottom: 15px; color: #666; font-size: 0.9em;">
            Showing ${filteredQuotes.length} quote${filteredQuotes.length !== 1 ? 's' : ''}
            ${selectedCategory !== 'all' ? `in "${selectedCategory}" category` : 'across all categories'}
        </div>
        ${quotesHTML}
    `;
}

// Get filtered quotes based on selectedCategory
function getFilteredQuotes() {
    if (selectedCategory === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === selectedCategory);
}

// Function to display a random quote from filtered results
function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>No quotes available for this category. Add some quotes!</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    displaySingleQuote(randomQuote);
    saveLastViewedQuote(randomQuote);
}

// Display a single quote (for random quote feature)
function displaySingleQuote(quote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #28a745;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 0.9em;">Random Quote:</p>
            <blockquote style="font-size: 1.2em; font-style: italic; margin: 0;">
                "${quote.text}"
            </blockquote>
            <p style="text-align: right; margin-top: 10px; color: #666;">
                — <span style="background-color: #e9ecef; padding: 2px 8px; border-radius: 12px;">${quote.category}</span>
            </p>
        </div>
    `;
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
    
    populateCategories();
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `
        <div style="padding: 15px; background: #d4edda; border-radius: 6px; border-left: 4px solid #28a745;">
            <p style="color: #155724; margin: 0;">
                ✓ New quote added to "${quoteCategory}" category! Total quotes: ${quotes.length}
            </p>
        </div>
    `;
    
    if (selectedCategory === 'all' || selectedCategory === quoteCategory) {
        showFilteredQuotes();
    }
    
    // Auto-sync if enabled
    if (isAutoSyncEnabled) {
        setTimeout(() => postToServer(quotes), 1000);
    }
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
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            const validQuotes = importedQuotes.filter(quote => 
                quote && typeof quote.text === 'string' && typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            const originalLength = quotes.length;
            quotes.push(...validQuotes);
            saveQuotes();
            
            populateCategories();
            
            event.target.value = '';
            
            alert(`Successfully imported ${validQuotes.length} quotes! Total quotes now: ${quotes.length}`);
            
            showFilteredQuotes();
            
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
        localStorage.removeItem(LAST_FILTER_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
        localStorage.removeItem(SERVER_QUOTES_KEY);
        localStorage.removeItem('autoSyncEnabled');
        sessionStorage.removeItem(LAST_QUOTE_KEY);
        
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }
        
        quotes = [];
        saveQuotes();
        populateCategories();
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>All quotes have been cleared. Add new quotes to get started!</p>';
        alert('All quotes have been cleared!');
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);