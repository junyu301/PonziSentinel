/*
 * equalizeBarHeights: 让 detecting-bar 和 analysis-bar 高度相同
 */
function equalizeBarHeights() {
    const bar1 = document.getElementById('detecting-bar');
    const bar2 = document.getElementById('analysis-bar');

    bar1.style.height = 'auto';
    bar2.style.height = 'auto';
    bar1.style.paddingTop = '';
    bar1.style.paddingBottom = '';
    bar2.style.paddingTop = '';
    bar2.style.paddingBottom = '';

    const height1 = bar1.offsetHeight;
    const height2 = bar2.offsetHeight;

    let tallerBar, shorterBar, diff;
    if (height1 > height2) {
        tallerBar = bar1;
        shorterBar = bar2;
        diff = height1 - height2;
    } else if (height2 > height1) {
        tallerBar = bar2;
        shorterBar = bar1;
        diff = height2 - height1;
    } else {
        return;
    }

    const children = Array.from(shorterBar.children);
    const n = children.length;

    if (n === 0) {
        const currentPaddingTop = parseFloat(window.getComputedStyle(shorterBar).paddingTop) || 0;
        const currentPaddingBottom = parseFloat(window.getComputedStyle(shorterBar).paddingBottom) || 0;
        const additional = diff / 2;
        shorterBar.style.paddingTop = (currentPaddingTop + additional) + 'px';
        shorterBar.style.paddingBottom = (currentPaddingBottom + additional) + 'px';
        return;
    }

    const marginValue = diff / (n + 1);

    children.forEach(child => {
        child.style.marginTop = '0px';
        child.style.marginBottom = '0px';
    });

    if (children[0]) {
        children[0].style.marginTop = marginValue + 'px';
    }

    children.forEach(child => {
        child.style.marginBottom = marginValue + 'px';
    });
}

window.addEventListener('load', equalizeBarHeights);


/*
 * 点击按钮：获取合约原文，显示结果
 */
const analyzeBtn = document.getElementById("analyzeBtn");
const warning = document.getElementById("warning");
const detecting_result_border = document.getElementById("detecting-result-border");
const detecting_result_icon = document.getElementById("detecting-result-icon");
const detecting_conclusion = document.getElementById("conclusion");
const detecting_confidence = document.getElementById("confidence-level");
const showMoreBtn = document.getElementById("showMoreBtn");

let currentSourceCode = "";

showMoreBtn.addEventListener("click", function () {
    if (!currentSourceCode) return;
    const newTab = window.open();
    if (newTab) {
        newTab.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Smart Contract Code</title></head>
            <body style="background: radial-gradient(circle at 10% 20%, #0a0718 0%, #02010a 100%); color: #d4d4d4; font-family: monospace; padding: 20px;">
                <pre style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(currentSourceCode)}</pre>
            </body>
            </html>
        `);
        newTab.document.close();
    } else {
        alert("请允许弹出窗口以查看代码");
    }
});

analyzeBtn.addEventListener("click", function (e) {
    e.preventDefault();

    analyzeBtn.classList.add("loading");
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "加载中...";

    const address = document.getElementById("contractAddress").value;

    fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract: address })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "1") {
            currentSourceCode = data.resource_code || "";
            showMoreBtn.style.display = "block";
        } else {
            currentSourceCode = "";
            showMoreBtn.style.display = "none";
        }

        document.getElementById("code").innerText = data.resource_code;
        document.getElementById("code").style.color = "white";
        if (data.status === "0") {
            document.getElementById("code").style.color = "red";
            warning.innerText = "合约不存在，请输入正确的合约地址！";
            setTimeout(function () {
                warning.innerText = "";
            }, 3000);
        }

        if (data.value_predicted === "0") {
            detecting_conclusion.innerText = "正常合约 ✅";
            detecting_result_border.style.border = "2px solid #00cc88";
            detecting_result_border.style.background = "rgba(0, 200, 100, 0.15)";
            detecting_result_border.style.color = "#00ffaa";
            detecting_result_icon.innerText = "✅";
            detecting_confidence.innerText = `置信度：${data.confidence}`;
        } else if (data.value_predicted === "1") {
            detecting_conclusion.innerText = "旁氏合约 ❌";
            detecting_result_border.style.border = "2px solid #ff4444";
            detecting_result_border.style.background = "rgba(200, 0, 50, 0.2)";
            detecting_result_border.style.color = "#ff7777";
            detecting_result_icon.innerText = "❌";
            detecting_confidence.innerText = `置信度：${data.confidence}`;
        } else {
            detecting_conclusion.innerText = "旁氏合约 ⚠️";
            detecting_result_border.style.border = "2px solid #0ff";
            detecting_result_border.style.background = "rgba(0, 100, 200, 0.2)";
            detecting_result_border.style.color = "#0ff";
            detecting_result_icon.innerText = "⚠️";
            detecting_confidence.innerText = `置信度：？`;
        }
    })
    .finally(() => {
        analyzeBtn.classList.remove("loading");
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "开始分析";
        equalizeBarHeights();
    });
});


// ==================== 获取并显示全局统计数据 ====================
async function fetchGlobalStats() {
    const totalUniqueSpan = document.getElementById('totalUniqueContracts');
    const totalPonziSpan = document.getElementById('totalPonziContracts');

    if (!totalUniqueSpan || !totalPonziSpan) return;

    totalUniqueSpan.textContent = '...';
    totalPonziSpan.textContent = '...';

    try {
        const response = await fetch('/api/statistics');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        totalUniqueSpan.textContent = data.totalUnique ?? 0;
        totalPonziSpan.textContent = data.totalPonzi ?? 0;
    } catch (err) {
        console.error('获取统计数据失败:', err);
        totalUniqueSpan.textContent = '错误';
        totalPonziSpan.textContent = '错误';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchGlobalStats);
} else {
    fetchGlobalStats();
}


// 简单的防XSS辅助函数
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
