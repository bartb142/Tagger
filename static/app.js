document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('emptyState');
    const filterPillsContainer = document.getElementById('filterPillsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addItemForm = document.getElementById('addItemForm');
    const itemPhotosInput = document.getElementById('itemPhotos');
    const fileList = document.getElementById('fileList');
    const dropZone = document.getElementById('dropZone');
    const submitBtn = document.getElementById('submitBtn');
    const submitSpinner = document.getElementById('submitSpinner');

    // Tag UI Elements
    const tagPillsContainer = document.getElementById('tagPillsContainer');

    // State
    let items = [];
    let tags = [];
    let selectedFiles = []; // Holds selected File objects
    let selectedTags = new Set(); // Holds selected tags for the new item
    let activeFilters = new Set(); // Holds selected tags for gallery filtering

    // Initialize App
    async function init() {
        await Promise.all([fetchTags(), fetchItems()]);
        renderFilterTags();
        renderGallery();
        renderModalTagPills(); // New helper to populate the form pills
    }

    // API Calls
    async function fetchItems() {
        try {
            const res = await fetch('/api/items');
            items = await res.json();
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    async function fetchTags() {
        try {
            const res = await fetch('/api/tags');
            tags = await res.json();
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    }

    // Render Logic
    function renderFilterTags() {
        filterPillsContainer.innerHTML = '';
        if (tags.length === 0) {
            filterPillsContainer.innerHTML = '<span class="text-sm text-gray-500">尚無標籤，您可以新增物品並建立標籤。</span>';
            return;
        }
        tags.forEach(tag => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${activeFilters.has(tag.name) ? 'bg-indigo-50 border-indigo-200 text-indigo-800 ring-1 ring-indigo-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`;
            pill.innerHTML = `<span class="w-2.5 h-2.5 rounded-full shadow-inner" style="background-color: ${tag.color || '#4f46e5'}"></span><span>${tag.name}</span>`;

            pill.onclick = () => {
                if (activeFilters.has(tag.name)) {
                    activeFilters.delete(tag.name);
                    pill.className = `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
                } else {
                    activeFilters.add(tag.name);
                    pill.className = `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 bg-indigo-50 border-indigo-200 text-indigo-800 ring-1 ring-indigo-500`;
                }
                renderGallery();
            };
            filterPillsContainer.appendChild(pill);
        });
    }

    function renderModalTagPills() {
        tagPillsContainer.innerHTML = '';
        if (tags.length === 0) {
            tagPillsContainer.innerHTML = '<span class="text-sm text-gray-500 p-2">沒有可用的標籤，請先至「標籤管理」頁面新增標籤。</span>';
            return;
        }

        tags.forEach(tag => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${selectedTags.has(tag.name)
                ? 'bg-gray-100 border-gray-300 text-gray-900 ring-1 ring-gray-400'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`;
            pill.innerHTML = `<span class="w-2 h-2 rounded-full shadow-inner" style="background-color: ${tag.color || '#4f46e5'}"></span><span>${tag.name}</span>`;
            pill.onclick = () => toggleTag(tag.name, pill);
            tagPillsContainer.appendChild(pill);
        });
    }

    function toggleTag(tagName, pillElement) {
        if (selectedTags.has(tagName)) {
            selectedTags.delete(tagName);
            pillElement.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
        } else {
            selectedTags.add(tagName);
            pillElement.className = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 bg-gray-100 border-gray-300 text-gray-900 ring-1 ring-gray-400';
        }
    }

    function renderGallery() {
        galleryGrid.innerHTML = '';

        const filterArray = Array.from(activeFilters);
        const filteredItems = filterArray.length > 0
            ? items.filter(item => filterArray.every(f => item.tags.some(t => t.name === f)))
            : items;

        if (filteredItems.length === 0) {
            galleryGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            galleryGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');

            filteredItems.forEach(item => {
                const card = createItemCard(item);
                galleryGrid.appendChild(card);
            });
        }
    }

    function createItemCard(item) {
        const div = document.createElement('div');
        div.className = 'item-card bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full';

        // Select cover photo or use placeholder
        const coverPhoto = item.photos && item.photos.length > 0
            ? item.photos[0].file_path
            : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%239ca3af%3Bfont-weight%3A400%3Bfont-family%3Asans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f3f4f6%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22145%22%20y%3D%22160%22%3E%E7%84%A1%E7%85%A7%E7%89%87%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

        const tagsHtml = item.tags.map(tag =>
            `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 mr-1 mb-1 shadow-sm">
                <span class="w-2 h-2 rounded-full shadow-inner" style="background-color: ${tag.color || '#4f46e5'}"></span>
                ${tag.name}
             </span>`
        ).join('');

        div.innerHTML = `
            <div class="relative w-full h-48 overflow-hidden bg-gray-100">
                <img src="${coverPhoto}" alt="${item.name}" class="w-full h-full object-cover">
                ${item.photos && item.photos.length > 1 ?
                `<div class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md mb-0">
                      +${item.photos.length - 1} 更多
                   </div>` : ''}
            </div>
            <div class="p-5 flex-1 flex flex-col">
                <p class="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">${item.description || '沒有描述'}</p>
                <div class="flex flex-wrap gap-1 mt-auto pt-4 border-t border-gray-100 items-center justify-between">
                    <div class="flex flex-wrap gap-1 w-[80%]">${tagsHtml}</div>
                    <button type="button" onclick="deleteItem(${item.id})" class="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 focus:outline-none" title="刪除物品">
                         <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    // Modal Logic
    const openModal = () => {
        addItemModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        // Ensure accurate state when opening
        selectedTags.clear();
        renderModalTagPills();
    };

    const closeModal = () => {
        addItemModal.classList.add('hidden');
        document.body.style.overflow = '';
        addItemForm.reset();
        selectedFiles = [];
        selectedTags.clear();
        updateFileListUI();
    };

    addItemBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Delete Item
    window.deleteItem = async (id) => {
        if (!confirm(`確定要刪除這項物品嗎？這個操作無法復原。`)) return;

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('刪除物品失敗');

            await fetchItems();
            renderGallery();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('刪除物品時發生錯誤');
        }
    };

    // File Input Logic
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        itemPhotosInput.click();
    });

    itemPhotosInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) { dropZone.classList.add('drag-active'); }
    function unhighlight(e) { dropZone.classList.remove('drag-active'); }

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    }, false);

    function handleFiles(files) {
        const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
        selectedFiles = [...selectedFiles, ...fileArr];
        updateFileListUI();
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        updateFileListUI();
    }

    function updateFileListUI() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'inline-flex items-center bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full mb-2 border border-gray-200';

            const name = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;

            div.innerHTML = `
                <span class="mr-2 font-medium">${name}</span>
                <button type="button" class="text-gray-400 hover:text-red-500 focus:outline-none transition-colors" onclick="arguments[0].stopPropagation(); removeFile(${index})">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            fileList.appendChild(div);
        });

        window.removeFile = removeFile;
    }

    // Form Submission Logic
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert('請至少上傳一張照片。');
            return;
        }

        // UI Loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('span:nth-child(1)').textContent = '儲存中...';
        submitSpinner.classList.remove('hidden');
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

        try {
            const name = "未命名物品 (" + new Date().toLocaleDateString() + ")";
            const description = document.getElementById('itemDescription').value;

            const itemPayload = {
                name: name,
                description: description,
                tags: Array.from(selectedTags)
            };

            const itemRes = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemPayload)
            });

            if (!itemRes.ok) throw new Error('新增物品失敗');
            const createdItem = await itemRes.json();

            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach(file => {
                    formData.append('files', file);
                });

                const uploadRes = await fetch(`/api/items/${createdItem.id}/photos`, {
                    method: 'POST',
                    body: formData // Content-Type is set automatically by fetch when using FormData
                });

                if (!uploadRes.ok) throw new Error('照片上傳失敗');
            }

            closeModal();
            await init();

        } catch (error) {
            console.error('Submission Error:', error);
            alert('儲存物品時發生錯誤。請查看控制台的詳細資訊。');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('span:nth-child(1)').textContent = '儲存物品';
            submitSpinner.classList.add('hidden');
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });

    // Start App
    init();
});
