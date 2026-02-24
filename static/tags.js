document.addEventListener('DOMContentLoaded', () => {
    const tagsList = document.getElementById('tagsList');
    const emptyTagsState = document.getElementById('emptyTagsState');
    const addTagForm = document.getElementById('addTagForm');
    const newTagNameInput = document.getElementById('newTagName');
    const newTagColorInput = document.getElementById('newTagColor');
    const addTagBtn = document.getElementById('addTagBtn');
    const addTagSpinner = document.getElementById('addTagSpinner');
    const tagCount = document.getElementById('tagCount');

    // Fetch and render tags
    async function fetchAndRenderTags() {
        try {
            const res = await fetch('/api/tags');
            if (!res.ok) throw new Error('獲取標籤失敗');
            const tags = await res.json();

            tagCount.textContent = tags.length;

            if (tags.length === 0) {
                tagsList.innerHTML = '';
                emptyTagsState.classList.remove('hidden');
                tagsList.parentElement.classList.add('hidden');
            } else {
                emptyTagsState.classList.add('hidden');
                tagsList.parentElement.classList.remove('hidden');

                tagsList.innerHTML = tags.map(tag => `
                    <li class="px-5 py-3.5 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                        <div class="flex items-center">
                            <input type="color" value="${tag.color || '#4f46e5'}" onchange="updateTagColor(${tag.id}, this.value)" class="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent mr-3" title="更換標籤顏色">
                            <span class="text-sm font-medium text-gray-800">${tag.name}</span>
                        </div>
                        <button onclick="deleteTag(${tag.id}, '${tag.name}')" class="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="刪除標籤">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </li>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            alert('無法載入標籤列表');
        }
    }

    // Handle form submission
    addTagForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tagName = newTagNameInput.value.trim();
        const tagColor = newTagColorInput.value;
        if (!tagName) return;

        // UI loading state
        addTagBtn.disabled = true;
        addTagBtn.classList.add('opacity-75', 'cursor-not-allowed');
        addTagSpinner.classList.remove('hidden');

        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tagName, color: tagColor })
            });

            if (!res.ok) throw new Error('新增標籤失敗');

            newTagNameInput.value = '';
            // Note: intentionally reset color to default or maintain?
            // User likely wants to pick another color or leave it. We'll leave it as is or reset on full page reload.
            await fetchAndRenderTags();
        } catch (error) {
            console.error('Error creating tag:', error);
            alert('新增標籤時發生錯誤');
        } finally {
            addTagBtn.disabled = false;
            addTagBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            addTagSpinner.classList.add('hidden');
        }
    });

    // Handle updates (made global for inline onchange)
    window.updateTagColor = async (id, newColor) => {
        try {
            const res = await fetch(`/api/tags/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color: newColor })
            });
            if (!res.ok) throw new Error('更新標籤失敗');
            // Optimistically do nothing else since UI already shows color
        } catch (error) {
            console.error('Error updating tag:', error);
            alert('更新標籤顏色時發生錯誤');
            await fetchAndRenderTags(); // Revert UI
        }
    };

    // Handle deletion (made global for inline onclick)
    window.deleteTag = async (id, name) => {
        if (!confirm(`確定要刪除標籤「${name}」嗎？這個操作無法復原。`)) return;

        try {
            const res = await fetch(`/api/tags/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('刪除標籤失敗');

            await fetchAndRenderTags();
        } catch (error) {
            console.error('Error deleting tag:', error);
            alert('刪除標籤時發生錯誤');
        }
    };

    // Init
    fetchAndRenderTags();
});
