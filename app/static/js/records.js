// records.js - 检测历史记录表格的筛选、排序与渲染

let allRecords = [];
let currentFilter = 'all';
let currentSort = 'desc';

const tbody = document.getElementById('tableBody');
const categoryFilter = document.getElementById('categoryFilter');
const sortAscBtn = document.getElementById('sortAscBtn');
const sortDescBtn = document.getElementById('sortDescBtn');

function formatConfidence(value) {
    if (value === undefined || value === null) return '—';
    return parseFloat(value).toFixed(8).replace(/\.?0+$/, '');
}

function renderTable(records) {
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr class="placeholder-row"><td colspan="4" style="text-align: center; padding: 2rem;">暂无检测记录</td></tr>`;
        return;
    }

    let html = '';
    for (const rec of records) {
        const isPonzi = rec.type === '旁氏合约';
        const badgeClass = isPonzi ? 'badge-ponzi' : 'badge-normal';
        const typeDisplay = isPonzi ? '旁氏合约' : '正常合约';

        html += `
            <tr>
                <td>${escapeHtml(rec.address)}</td>
                <td>${escapeHtml(rec.datetime)}</td>
                <td><span class="${badgeClass}">${escapeHtml(typeDisplay)}</span></td>
                <td class="confidence">${formatConfidence(rec.confidence)}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getFilteredAndSortedRecords() {
    let filtered = [...allRecords];
    if (currentFilter === 'ponzi') {
        filtered = filtered.filter(rec => rec.type === '旁氏合约');
    } else if (currentFilter === 'normal') {
        filtered = filtered.filter(rec => rec.type === '正常合约');
    }
    if (currentSort === 'asc') {
        filtered.sort((a, b) => a.datetime.localeCompare(b.datetime));
    } else {
        filtered.sort((a, b) => b.datetime.localeCompare(a.datetime));
    }
    return filtered;
}

function refreshTable() {
    const displayRecords = getFilteredAndSortedRecords();
    renderTable(displayRecords);
}

function highlightSortButton() {
    if (currentSort === 'asc') {
        sortAscBtn.style.boxShadow = '0 0 12px #0cf';
        sortAscBtn.style.background = 'linear-gradient(95deg, #7a4eff, #2ad9e8)';
        sortDescBtn.style.boxShadow = 'none';
        sortDescBtn.style.background = 'linear-gradient(95deg, rgba(95, 46, 255, 0.7), rgba(11, 207, 223, 0.7))';
    } else {
        sortDescBtn.style.boxShadow = '0 0 12px #0cf';
        sortDescBtn.style.background = 'linear-gradient(95deg, #7a4eff, #2ad9e8)';
        sortAscBtn.style.boxShadow = 'none';
        sortAscBtn.style.background = 'linear-gradient(95deg, rgba(95, 46, 255, 0.7), rgba(11, 207, 223, 0.7))';
    }
}

async function loadData() {
    if (tbody) {
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="4" style="text-align: center;">加载检测记录中...</td></tr>';
    }

    try {
        const response = await fetch('/api/records');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        allRecords = data.filter(rec => rec.address && rec.datetime && rec.type);

        currentFilter = 'all';
        currentSort = 'desc';
        categoryFilter.value = 'all';
        highlightSortButton();

        refreshTable();
    } catch (err) {
        console.error('获取检测记录失败:', err);
        if (tbody) {
            tbody.innerHTML = '<tr class="placeholder-row"><td colspan="4" style="text-align: center; color: #ff7b9c;">加载失败，请检查网络或后端服务</td></tr>';
        }
    }
}

function bindEvents() {
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            refreshTable();
        });
    }

    if (sortAscBtn) {
        sortAscBtn.addEventListener('click', () => {
            currentSort = 'asc';
            highlightSortButton();
            refreshTable();
        });
    }

    if (sortDescBtn) {
        sortDescBtn.addEventListener('click', () => {
            currentSort = 'desc';
            highlightSortButton();
            refreshTable();
        });
    }
}

function init() {
    bindEvents();
    loadData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
