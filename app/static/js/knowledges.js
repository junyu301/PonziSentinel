// knowledges.js - 知识库链接卡片渲染

const categoriesData = [
    {
        name: "旁氏骗局",
        icon: "fas fa-triangle-exclamation",
        links: [
            { url: "https://www.investor.gov/protect-your-investments/fraud/types-fraud/ponzi-scheme", description: "Investor.gov · 庞氏骗局欺诈类型详解" },
            { url: "https://moneysmart.gov.au/financial-scams/ponzi-schemes", description: "MoneySmart · 庞氏骗局防诈骗指南" },
            { url: "https://www.acams.org/zh-hans/opinion/ponzi-scheme-a-never-ending-global-battle", description: "ACAMS · 庞氏骗局：无休止的全球挑战" },
            { url: "https://en.wikipedia.org/wiki/Ponzi_scheme", description: "Wikipedia · 庞氏骗局 (完整词条)" },
            { url: "https://www.law.cornell.edu/wex/ponzi_scheme", description: "康奈尔LII · 庞氏骗局法律定义" }
        ]
    },
    {
        name: "以太坊和智能合约",
        icon: "fab fa-ethereum",
        links: [
            { url: "https://ethereum.org/", description: "Ethereum 官网 · 以太坊入口" },
            { url: "https://ethereum.org/developers/docs/", description: "以太坊开发者文档 · 核心指南" },
            { url: "https://ethereum.github.io/yellowpaper/paper.pdf", description: "以太坊黄皮书 (PDF) · 技术规范" },
            { url: "https://etherscan.io/", description: "Etherscan · 以太坊区块链浏览器" },
            { url: "https://en.wikipedia.org/wiki/Ethereum", description: "Wikipedia · 以太坊百科" },
            { url: "https://docs.etherscan.io/introduction", description: "Etherscan 文档 · API 与使用入门" }
        ]
    },
    {
        name: "EVM 操作码",
        icon: "fas fa-microchip",
        links: [
            { url: "https://www.evm.codes/", description: "evm.codes · EVM 操作码交互手册" },
            { url: "https://ethervm.io/", description: "EtherVM · 以太坊虚拟机指令参考" }
        ]
    },
    {
        name: "Tfidf",
        icon: "fas fa-poll",
        links: [
            { url: "https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html", description: "sklearn · TfidfVectorizer 官方文档" },
            { url: "https://www.geeksforgeeks.org/machine-learning/understanding-tf-idf-term-frequency-inverse-document-frequency/", description: "GeeksforGeeks · 深入理解 TF-IDF" }
        ]
    },
    {
        name: "Word2vec",
        icon: "fas fa-language",
        links: [
            { url: "https://www.tensorflow.org/text/tutorials/word2vec", description: "TensorFlow · Word2Vec 官方教程" },
            { url: "https://jalammar.github.io/illustrated-word2vec/", description: "The Illustrated Word2Vec · 图解词向量" },
            { url: "https://en.wikipedia.org/wiki/Word2vec", description: "Wikipedia · Word2vec 概述" }
        ]
    },
    {
        name: "XGBoost",
        icon: "fas fa-chart-line",
        links: [
            { url: "https://dl.acm.org/doi/10.1145/2939672.2939785", description: "ACM论文 · XGBoost: Scalable Tree Boosting" },
            { url: "https://xgboost.readthedocs.io/en/release_3.2.0/index.html", description: "XGBoost 官方文档 · 用户指南" }
        ]
    }
];

function getRootDomainFromUrl(url) {
    try {
        const urlObj = new URL(url);
        let hostname = urlObj.hostname;
        if (hostname.startsWith('www.')) hostname = hostname.slice(4);
        return hostname;
    } catch (e) {
        const match = url.match(/^(?:https?:\/\/)?([^\/?#]+)/i);
        if (match && match[1]) {
            let host = match[1];
            if (host.startsWith('www.')) host = host.slice(4);
            return host;
        }
        return 'default';
    }
}

function getFaviconUrl(domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=24`;
}

function renderCategoriesWithFavicon() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    container.innerHTML = '';

    categoriesData.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        const headerIcon = document.createElement('i');
        headerIcon.className = category.icon;
        const title = document.createElement('h2');
        title.textContent = category.name;
        cardHeader.appendChild(headerIcon);
        cardHeader.appendChild(title);

        const btnsContainer = document.createElement('div');
        btnsContainer.className = 'buttons-container';

        category.links.forEach(link => {
            const btn = document.createElement('a');
            btn.href = link.url;
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.className = 'resource-btn';

            const domain = getRootDomainFromUrl(link.url);
            const faviconSrc = getFaviconUrl(domain);

            const imgIcon = document.createElement('img');
            imgIcon.className = 'btn-favicon';
            imgIcon.src = faviconSrc;
            imgIcon.alt = '';
            imgIcon.onerror = function () {
                this.style.display = 'none';
                const fallbackSpan = document.createElement('i');
                fallbackSpan.className = 'fas fa-link fallback-icon';
                fallbackSpan.style.fontSize = '14px';
                fallbackSpan.style.width = '18px';
                fallbackSpan.style.textAlign = 'center';
                if (btn.querySelector('.fallback-icon') === null) {
                    btn.insertBefore(fallbackSpan, imgIcon);
                }
                imgIcon.remove();
            };

            const textSpan = document.createElement('span');
            textSpan.textContent = link.description;

            btn.appendChild(imgIcon);
            btn.appendChild(textSpan);
            btnsContainer.appendChild(btn);
        });

        card.appendChild(cardHeader);
        card.appendChild(btnsContainer);
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategoriesWithFavicon();
    console.log(`PonziSentinel 知识库已加载 | 共 ${document.querySelectorAll('.resource-btn').length} 个知识节点`);
});
