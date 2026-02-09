/* global bootstrap */

function parseNumber(value) {
    return parseFloat(String(value).replace(/,/g, '')) || 0;
}

function formatNumber(value) {
    return value.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

let categoryCount = 0;

const standardCategories = [
    "Concrete Works",
    "Reinforcement Works", 
    "Formworks",
    "Masonry Works",
    "Carpentry Works",
    "Steel Works",
    "Roofing Works",
    "Ceiling Works",
    "Tile Works",
    "Painting Works",
    "Plumbing Works",
    "Electrical Works",
    "Doors & Windows",
    "Flooring Works",
    "Glass & Aluminum Works",
    "Earthworks",
    "Labor Rates",
    "Equipment Rental",
    "Safety & Accessories",
    "Sanitary Works",
    "Landscaping Works",
    "Demolition Works",
    "Waterproofing Works",
    "Insulation Works",
    "Fire Protection Works",
    "Structural Works"
];

const CUSTOM_DATA_STORAGE_KEY = 'boqCustomData';

let customData = {
    categories: [],
    descriptions: []
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getAllExistingDescriptions() {
    const descriptions = new Set();
    
    document.querySelectorAll('.item-description').forEach(input => {
        if (input.value) descriptions.add(input.value);
    });
    
    if (window.CONSTRUCTION_PRICELIST) {
        window.CONSTRUCTION_PRICELIST.labor.forEach(item => descriptions.add(item.description));
        window.CONSTRUCTION_PRICELIST.materials.forEach(item => descriptions.add(item.description));
    }
    
    try {
        const drafts = JSON.parse(localStorage.getItem('boqDrafts') || '[]');
        drafts.forEach(draft => {
            draft.categories.forEach(category => {
                category.items.forEach(item => {
                    if (item.description) descriptions.add(item.description);
                });
            });
        });
    } catch (e) {
        console.log('Error loading draft descriptions:', e);
    }
    
    return Array.from(descriptions).sort();
}

function loadCustomData() {
    try {
        const saved = localStorage.getItem(CUSTOM_DATA_STORAGE_KEY);
        if (saved) {
            customData = JSON.parse(saved);
            console.log('Loaded custom data:', customData);
        }
    } catch (e) {
        console.error('Error loading custom data:', e);
    }
}

function saveCustomData() {
    try {
        localStorage.setItem(CUSTOM_DATA_STORAGE_KEY, JSON.stringify(customData));
        console.log('Saved custom data:', customData);
    } catch (e) {
        console.error('Error saving custom data:', e);
    }
}

function getAllCategories() {
    const categories = new Set();
    
    standardCategories.forEach(cat => categories.add(cat));
    
    customData.categories.forEach(cat => categories.add(cat));
    
    document.querySelectorAll('.category-block h6').forEach(h6 => {
        if (h6.textContent && h6.textContent.trim()) {
            categories.add(h6.textContent.trim());
        }
    });
    
    return Array.from(categories).sort();
}

function getAllDescriptions() {
    const customDescriptions = new Set();
    
    customData.descriptions.forEach(desc => {
        if (desc && desc.trim()) {
            customDescriptions.add(desc.trim());
        }
    });
    
    document.querySelectorAll('.item-description').forEach(input => {
        const value = input.value.trim();
        if (value) {
            const isInPricelist = window.CONSTRUCTION_PRICELIST && 
                [...window.CONSTRUCTION_PRICELIST.labor, ...window.CONSTRUCTION_PRICELIST.materials]
                .some(item => item.description === value);
            
            if (!isInPricelist) {
                customDescriptions.add(value);
            }
        }
    });
    
    return Array.from(customDescriptions).sort();
}

function refreshAllDropdowns() {
    console.log('🔄 Refreshing all dropdowns...');
    updateCategoryDropdown();
    updateDescriptionDropdown();
    
    if (window.filterPricelist) {
        setTimeout(() => {
            if (document.getElementById('pricelistSearch')) {
                window.filterPricelist();
            }
        }, 100);
    }
}

function initializeDescriptionDatalist() {
    const datalist = document.getElementById('descriptionDatalist');
    if (!datalist) {
        console.error('descriptionDatalist not found for initialization');
        return;
    }
    
    datalist.innerHTML = '';
    
    if (window.CONSTRUCTION_PRICELIST) {
        const allPricelistItems = [
            ...window.CONSTRUCTION_PRICELIST.labor,
            ...window.CONSTRUCTION_PRICELIST.materials
        ];
        
        const uniqueItems = new Set();
        allPricelistItems.forEach(item => {
            if (item.description && item.description.trim()) {
                uniqueItems.add(item.description.trim());
            }
        });
        
        Array.from(uniqueItems).sort().forEach(desc => {
            const option = document.createElement('option');
            option.value = desc;
            option.textContent = desc;
            option.setAttribute('data-source', 'pricelist');
            datalist.appendChild(option);
        });
        
        console.log(`✅ Initialized datalist with ${uniqueItems.size} pricelist items`);
    }
}

function updateDescriptionDropdown() {
    const datalist = document.getElementById('descriptionDatalist');
    if (!datalist) {
        console.error('descriptionDatalist not found');
        return;
    }
    
    const customDescriptions = getAllDescriptions();
    
    const customOptions = Array.from(datalist.querySelectorAll('option')).filter(opt => {
        return opt.textContent.includes('✩');
    });
    
    customOptions.forEach(opt => opt.remove());
    
    customDescriptions.forEach(desc => {
        if (desc && desc.trim()) {
            const exists = Array.from(datalist.querySelectorAll('option'))
                .some(opt => opt.value === desc.trim() && !opt.textContent.includes('✩'));
            
            if (!exists) {
                const option = document.createElement('option');
                option.value = desc.trim();
                option.textContent = `${desc.trim()} ✩`;
                option.setAttribute('data-source', 'custom');
                datalist.appendChild(option);
            }
        }
    });
    
    console.log(`📝 Description dropdown updated. Total options: ${datalist.childElementCount}`);
}

function addToDescriptionDatalist(description) {
    const datalist = document.getElementById('descriptionDatalist');
    if (!datalist) return;
    
    const exists = Array.from(datalist.querySelectorAll('option'))
        .some(opt => opt.value === description);
    
    if (!exists) {
        const option = document.createElement('option');
        option.value = description;
        option.textContent = `${description} ✩`;
        option.setAttribute('data-source', 'custom');
        datalist.appendChild(option);
    }
}

function updateCategoryDropdown() {
    const datalist = document.getElementById('categoryOptions');
    if (!datalist) return;

    const categoryInput = document.getElementById('newCategoryName');
    const currentValue = categoryInput ? categoryInput.value : '';

    datalist.innerHTML = '';
    
    const allCategories = getAllCategories();
    
    console.log(`📁 Updating category dropdown with ${allCategories.length} categories`);
    
    allCategories.forEach(cat => {
        if (cat && cat.trim()) {
            const option = document.createElement('option');
            option.value = cat.trim();
            
            if (!standardCategories.includes(cat.trim())) {
                option.textContent = `${cat.trim()} ✩`;
            } else {
                option.textContent = cat.trim();
            }
            datalist.appendChild(option);
        }
    });
    
    if (categoryInput && categoryInput.value !== currentValue) {
        categoryInput.value = currentValue;
    }
}

function setupCategoryDropdown() {
    const input = document.getElementById('newCategoryName');
    if (!input) return;
    
    let datalist = document.getElementById('categoryOptions');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'categoryOptions';
        document.body.appendChild(datalist);
    }
    
    loadCustomData();
    updateCategoryDropdown();
    
    input.setAttribute('list', 'categoryOptions');
    
    setupCustomItemRemoval(input, 'category');
}

function addCategory() {
    const categoryInput = document.getElementById('newCategoryName');
    let name = categoryInput.value.trim();
    
    if (!name) {
        name = "General Requirements";
    }
    
    const existingCategories = Array.from(document.querySelectorAll('.category-block h6'))
        .map(h6 => h6.textContent);
    if (existingCategories.includes(name)) {
        showNotification(`Category "${name}" already exists!`, 'warning');
        return;
    }

    if (!standardCategories.includes(name) && !customData.categories.includes(name)) {
        customData.categories.push(name);
        saveCustomData();
        updateCategoryDropdown();
        showNotification(`New category "${name}" saved for future use!`, 'info');
    }
    
    categoryCount++;
    const container = document.getElementById('categoriesContainer');

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-block border rounded p-3';
    categoryDiv.dataset.categoryId = categoryCount;

categoryDiv.innerHTML = `
<div class="d-flex justify-content-between align-items-center mb-2">
    <h6>${name}</h6>
    <button type="button" class="btn btn-danger btn-sm" onclick="removeCategory(this)">
        <i class="bi bi-trash me-1"></i> Delete Category
    </button>
</div>
<div class="table-scroll-container">
    <div class="table-responsive">
        <table class="table table-bordered mb-0">
            <thead class="table-light">
                <tr>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Rate (₱)</th>
                    <th>Amount (₱)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>
<div class="text-center mt-2">
    <button type="button" class="btn btn-success btn-sm" onclick="addItemToCategory(${categoryCount})">
        <i class="bi bi-plus-circle me-1"></i> Add Item
    </button>
</div>
`;

container.appendChild(categoryDiv);
    
    categoryInput.value = '';
    
    showNotification(`Category "${name}" added`, 'success');
}

function addItemToCategory(categoryId) {
    const categoryDiv = document.querySelector(`.category-block[data-category-id='${categoryId}']`);
    const tbody = categoryDiv.querySelector('tbody');

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="text" 
                   class="form-control item-description" 
                   placeholder="Type or select from list" 
                   list="descriptionDatalist">
        </td>
        <td><input type="text" class="form-control item-unit" placeholder="Unit"></td>
        <td><input type="number" class="form-control item-qty" value="1" min="0" step="0.01"></td>
        <td><input type="number" class="form-control item-rate" value="0" min="0" step="0.01"></td>
        <td><input type="text" class="form-control item-amount" value="0" readonly></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeItem(this)">Delete</button></td>
    `;
    tbody.appendChild(row);

    row.querySelectorAll('.item-qty, .item-rate').forEach(input => {
        input.addEventListener('input', calculateItemAmount);
    });

    const descInput = row.querySelector('.item-description');
    
    setupCustomItemRemoval(descInput, 'description');
    
    descInput.addEventListener('change', function() {
        const selectedDesc = this.value.trim();
        
        if (window.CONSTRUCTION_PRICELIST && selectedDesc) {
            const allItems = [...window.CONSTRUCTION_PRICELIST.labor, ...window.CONSTRUCTION_PRICELIST.materials];
            const item = allItems.find(i => i.description === selectedDesc);
            
            if (item) {
                row.querySelector('.item-unit').value = item.unit;
                row.querySelector('.item-rate').value = item.rate;
                row.querySelector('.item-qty').dispatchEvent(new Event('input'));
            }
        }

        if (selectedDesc) {
            const isInPricelist = window.CONSTRUCTION_PRICELIST && 
                [...window.CONSTRUCTION_PRICELIST.labor, ...window.CONSTRUCTION_PRICELIST.materials]
                .some(item => item.description === selectedDesc);
            
            if (!isInPricelist && !customData.descriptions.includes(selectedDesc)) {
                customData.descriptions.push(selectedDesc);
                saveCustomData();
                
                addToDescriptionDatalist(selectedDesc);
                showNotification(`New item "${selectedDesc}" saved for future use!`, 'info');
            }
        }

        if (selectedDesc) {
            const categoryMap = {
                'manager': 'Preliminaries',
                'engineer': 'Preliminaries',
                'officer': 'Preliminaries',
                'surveyor': 'Preliminaries',
                'laborer': 'Labor',
                'mason': 'Masonry Works',
                'carpenter': 'Carpentry',
                'welder': 'Structural Steel Works',
                'electrician': 'Electrical Works',
                'plumber': 'Plumbing',
                'painter': 'Painting Works',
                'technician': 'Mechanical Works (HVAC, Firefighting)',
                'cement': 'Concrete Works',
                'concrete': 'Concrete Works',
                'steel': 'Structural Steel Works',
                'rebar': 'Structural Steel Works',
                'timber': 'Carpentry',
                'plywood': 'Carpentry',
                'roofing': 'Roofing Works',
                'waterproofing': 'Waterproofing',
                'insulation': 'Insulation',
                'paint': 'Painting Works',
                'tile': 'Tiling',
                'flooring': 'Flooring',
                'pipe': 'Plumbing',
                'electrical': 'Electrical Works',
                'HVAC': 'Mechanical Works (HVAC, Firefighting)',
                'firefighting': 'Mechanical Works (HVAC, Firefighting)',
                'excavator': 'Earthworks',
                'bulldozer': 'Earthworks',
                'truck': 'Earthworks',
                'crane': 'Structural Steel Works',
                'mixer': 'Concrete Works',
                'scaffolding': 'General Requirements',
                'compactor': 'Earthworks',
                'machine': 'General Requirements',
                'tools': 'General Requirements',
                'PPE': 'General Requirements'
            };
    
            const descLower = selectedDesc.toLowerCase();
            let suggestedCategory = '';
    
            for (const [keyword, category] of Object.entries(categoryMap)) {
                if (descLower.includes(keyword)) {
                    suggestedCategory = category;
                    break;
                }
            }
    
            if (suggestedCategory) {
                console.log(`Suggested category for "${selectedDesc}": ${suggestedCategory}`);
            }
        }
    });
    
    calculateTotals();
}

function removeItem(button) {
    button.closest('tr').remove();
    calculateTotals();
}

function removeCategory(button) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'deleteCategoryConfirmModal';
    confirmModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title">
                        <i class="bi bi-exclamation-triangle me-2"></i>Delete Category
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this category and all its items?</p>
                    <div class="alert alert-warning mt-2">
                        <i class="bi bi-exclamation-circle me-1"></i>
                        All items in this category will be permanently removed.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDeleteCategoryBtn">
                        <i class="bi bi-trash me-1"></i> Delete Category
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(confirmModal);
    
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
    
    document.getElementById('confirmDeleteCategoryBtn').addEventListener('click', function() {
        button.closest('.category-block').remove();
        calculateTotals();
        modalInstance.hide();
        
        if (window.showNotification) {
            showNotification('Category deleted successfully', 'warning');
        }
    });
    
    confirmModal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(confirmModal);
    });
}

function calculateItemAmount() {
    const row = this.closest('tr');
    const qty = parseNumber(row.querySelector('.item-qty').value);
    const rate = parseNumber(row.querySelector('.item-rate').value);
    const amount = rate * qty;
    
    row.querySelector('.item-amount').value = formatNumber(amount);
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    document.querySelectorAll('.item-amount').forEach(input => {
        subtotal += parseNumber(input.value);
    });

    const markupRate = parseNumber(document.getElementById('taxRate').value) || 18;
    const markupAmount = subtotal * (markupRate / 100);
    const grandTotal = subtotal + markupAmount;

    document.getElementById('subtotal').textContent = formatNumber(subtotal);
    document.getElementById('taxAmount').textContent = formatNumber(markupAmount);
    document.getElementById('grandTotal').textContent = formatNumber(grandTotal);
}

function refreshPage() {
    if (confirm('Refresh page? Any unsaved changes will be lost.')) {
        location.reload();
    }
}

function refreshWithNotification() {
    if (window.showNotification) {
        window.showNotification('Refreshing page...', 'info');
    }
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function showRefreshConfirmation() {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'refreshConfirmModal';
    confirmModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title"><i class="bi bi-arrow-clockwise me-2"></i>Refresh Page</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to refresh the page?</p>
                    <div class="alert alert-warning mt-3">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Warning:</strong> Any unsaved changes will be lost.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmRefreshBtn">
                        <i class="bi bi-check-circle me-1"></i> Refresh Page
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(confirmModal);
    
    const modalInstance = new bootstrap.Modal(confirmModal);
    modalInstance.show();
    
    document.getElementById('confirmRefreshBtn').addEventListener('click', function() {
        modalInstance.hide();
        setTimeout(() => {
            location.reload();
        }, 300);
    });
    
    confirmModal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(confirmModal);
    });
}

function setupCustomItemRemoval(inputElement, type = 'description') {
    let pressTimer = null;
    
    inputElement.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        handleItemRemoval(this.value.trim(), e, type);
    });
    
    inputElement.addEventListener('touchstart', function(e) {
        pressTimer = setTimeout(() => {
            handleItemRemoval(this.value.trim(), e, type);
            pressTimer = null;
        }, 800);
        
        e.preventDefault();
    }, { passive: false });
    
    inputElement.addEventListener('touchend', function() {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });
    
    inputElement.addEventListener('touchmove', function() {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    });
    
    inputElement.addEventListener('touchstart', function() {
        this.style.backgroundColor = '#f0f8ff';
    });
    
    inputElement.addEventListener('touchend', function() {
        this.style.backgroundColor = '';
    });
    
    inputElement.addEventListener('touchmove', function() {
        this.style.backgroundColor = '';
    });
}

function handleItemRemoval(value, event, type) {
    if (!value) return;
    
    let isCustomItem = false;
    let itemType = '';
    
    if (type === 'description') {
        isCustomItem = customData.descriptions.includes(value);
        itemType = 'item';
    } else if (type === 'category') {
        isCustomItem = !standardCategories.includes(value) && 
                      customData.categories.includes(value);
        itemType = 'category';
    }
    
    if (!isCustomItem) return;
    
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'position-fixed bg-white border rounded shadow p-3';
    
    if (event.type.includes('touch')) {
        const touch = event.touches[0] || event.changedTouches[0];
        confirmDiv.style.cssText = `
            top: ${touch.clientY}px;
            left: ${touch.clientX}px;
            z-index: 9999;
            min-width: 250px;
            transform: translate(-50%, -120%);
        `;
    } else {
        confirmDiv.style.cssText = `
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            z-index: 9999;
            min-width: 250px;
        `;
    }
    
    confirmDiv.innerHTML = `
        <p class="mb-2">Remove ${itemType} "<strong>${value}</strong>" from custom list?</p>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-danger flex-fill" id="confirmRemoveBtn">
                <i class="bi bi-trash me-1"></i> Remove
            </button>
            <button class="btn btn-sm btn-secondary flex-fill" id="cancelRemoveBtn">
                Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(confirmDiv);
    
    document.getElementById('confirmRemoveBtn').addEventListener('click', () => {
        if (type === 'description') {
            const index = customData.descriptions.indexOf(value);
            if (index > -1) {
                customData.descriptions.splice(index, 1);
                saveCustomData();
                updateDescriptionDropdown();
                
                const datalist = document.getElementById('descriptionDatalist');
                const options = datalist.querySelectorAll('option');
                options.forEach(opt => {
                    if (opt.value === value && opt.textContent.includes('✩')) {
                        opt.remove();
                    }
                });
                
                showNotification(`"${value}" removed from custom list`, 'warning');
            }
        } else if (type === 'category') {
            const index = customData.categories.indexOf(value);
            if (index > -1) {
                customData.categories.splice(index, 1);
                saveCustomData();
                updateCategoryDropdown();
                
                const datalist = document.getElementById('categoryOptions');
                const options = datalist.querySelectorAll('option');
                options.forEach(opt => {
                    if (opt.value === value && opt.textContent.includes('✩')) {
                        opt.remove();
                    }
                });
                
                showNotification(`"${value}" removed from custom categories`, 'warning');
            }
        }
        document.body.removeChild(confirmDiv);
    });
    
    document.getElementById('cancelRemoveBtn').addEventListener('click', () => {
        document.body.removeChild(confirmDiv);
    });
    
    setTimeout(() => {
        const clickOutsideHandler = (e) => {
            if (!confirmDiv.contains(e.target)) {
                document.body.removeChild(confirmDiv);
                document.removeEventListener('click', clickOutsideHandler);
                document.removeEventListener('touchstart', clickOutsideHandler);
            }
        };
        document.addEventListener('click', clickOutsideHandler);
        document.addEventListener('touchstart', clickOutsideHandler);
    }, 100);
}

window.addCategory = addCategory;
window.addItemToCategory = addItemToCategory;
window.removeItem = removeItem;
window.removeCategory = removeCategory;
window.calculateItemAmount = calculateItemAmount;
window.calculateTotals = calculateTotals;
window.refreshWithNotification = refreshWithNotification;
window.showRefreshConfirmation = showRefreshConfirmation;
window.showNotification = showNotification;
window.refreshPage = refreshPage;
window.getAllExistingDescriptions = getAllExistingDescriptions;
window.updateCategoryDropdown = updateCategoryDropdown;
window.updateDescriptionDropdown = updateDescriptionDropdown;
window.addToDescriptionDatalist = addToDescriptionDatalist;
window.initializeDescriptionDatalist = initializeDescriptionDatalist;
window.refreshAllDropdowns = refreshAllDropdowns;
window.refreshAllDropdowns = refreshAllDropdowns;
window.setupCustomItemRemoval = setupCustomItemRemoval;
window.handleItemRemoval = handleItemRemoval;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taxRate').addEventListener('input', calculateTotals);
    
    loadCustomData();
    
    setupCategoryDropdown();
    
    // ========================
    // 📱 WORKING MOBILE FIX - KEYBOARD + TOUCH
    // ========================
    setTimeout(function() {
        console.log('📱 Applying PROPER mobile fixes...');
        
        // FIX 1: CATEGORY INPUT - WORKING KEYBOARD
        const categoryInput = document.getElementById('newCategoryName');
        if (categoryInput) {
            // Make it tappable anywhere
            categoryInput.style.cssText = `
                min-height: 50px !important;
                padding: 14px 15px !important;
                font-size: 18px !important;
                width: 100% !important;
                cursor: text !important;
                touch-action: manipulation !important;
            `;
            
            // THIS MAKES KEYBOARD APPEAR
            categoryInput.addEventListener('touchstart', function(e) {
                // Focus FIRST
                this.focus();
                
                // iOS needs extra help
                if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                        // Create and dispatch click event
                        this.click();
                    }, 50);
                }
                
                // Don't prevent default - let keyboard open
            }, { passive: true }); // IMPORTANT: passive: true
            
            // Also make parent div tappable
            const parentDiv = categoryInput.closest('.input-group') || categoryInput.parentElement;
            if (parentDiv) {
                parentDiv.style.cursor = 'text';
                parentDiv.addEventListener('touchstart', function(e) {
                    if (e.target !== categoryInput) {
                        categoryInput.focus();
                        categoryInput.click();
                    }
                }, { passive: true });
            }
        }
        
        // FIX 2: DESCRIPTION INPUTS - WORKING KEYBOARD
        document.querySelectorAll('.item-description').forEach((input, index) => {
            // Make big and tappable
            input.style.cssText = `
                min-height: 46px !important;
                padding: 12px 10px !important;
                font-size: 16px !important;
                width: 100% !important;
                cursor: text !important;
                touch-action: manipulation !important;
            `;
            
            // THIS MAKES KEYBOARD APPEAR
            input.addEventListener('touchstart', function(e) {
                // Focus immediately
                this.focus();
                
                // Help iOS
                if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                        this.click();
                    }, 50);
                }
                
                // Let browser handle keyboard
            }, { passive: true });
            
            // Make table cell tappable too
            const tableCell = input.closest('td');
            if (tableCell) {
                tableCell.style.cursor = 'text';
                tableCell.addEventListener('touchstart', function(e) {
                    if (e.target !== input) {
                        input.focus();
                        input.click();
                    }
                }, { passive: true });
            }
        });
        
        // FIX 3: TABLE OVERFLOW - NO CUT OFF
        document.querySelectorAll('.table-scroll-container').forEach(container => {
            // Force scroll container
            container.style.cssText = `
                overflow-x: auto !important;
                overflow-y: hidden !important;
                max-width: 100vw !important;
                width: 100% !important;
                display: block !important;
                position: relative !important;
                -webkit-overflow-scrolling: touch !important;
            `;
            
            // Make table wider for scrolling
            const table = container.querySelector('table');
            if (table) {
                table.style.minWidth = '950px !important';
                table.style.width = '100% !important';
                table.style.tableLayout = 'fixed !important';
            }
            
            // Fix all inputs in table
            container.querySelectorAll('input').forEach(input => {
                input.style.cssText = `
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: 44px !important;
                    padding: 10px 8px !important;
                    font-size: 16px !important;
                    box-sizing: border-box !important;
                    display: block !important;
                `;
            });
            
            // Add scroll hint if needed
            if (container.scrollWidth > container.clientWidth) {
                const existingHint = container.querySelector('.scroll-hint');
                if (!existingHint) {
                    const hint = document.createElement('div');
                    hint.className = 'scroll-hint';
                    hint.style.cssText = `
                        text-align: center;
                        color: #666;
                        font-size: 13px;
                        padding: 10px 0;
                        background: #f8f9fa;
                        border-top: 1px solid #dee2e6;
                        position: sticky;
                        left: 0;
                        right: 0;
                    `;
                    hint.innerHTML = '<i class="bi bi-arrow-left-right me-2"></i>Scroll to see all columns';
                    container.appendChild(hint);
                }
            }
        });
        
        console.log('✅ PROPER mobile fixes applied - keyboard should work!');
        
        // EXTRA: Test if keyboard works
        setTimeout(() => {
            console.log('Testing mobile touch...');
            document.querySelectorAll('#newCategoryName, .item-description').forEach(input => {
                console.log(`Input ${input.id || input.className}:`, {
                    hasTouchListeners: input.hasAttribute('data-touch-fixed'),
                    style: input.style.minHeight
                });
                input.setAttribute('data-touch-fixed', 'true');
            });
        }, 500);
        
    }, 800);
});







