// Painel administrativo do portfólio (front-end only)
document.addEventListener('DOMContentLoaded', () => {
	const settingsBtn = document.getElementById('settings-btn');
	const adminPanel = document.getElementById('admin-panel');
	const closeBtn = document.getElementById('close-admin-panel-btn');
	const portfolioList = document.getElementById('admin-portfolio-list');
	const addSectionBtn = document.getElementById('add-section-btn');

	let portfolioData = [];

	// Abrir painel
	settingsBtn.addEventListener('click', () => {
		adminPanel.classList.remove('hidden');
		loadPortfolioAdmin();
	});
	// Fechar painel
	closeBtn.addEventListener('click', () => {
		adminPanel.classList.add('hidden');
	});

	// Carregar dados do portfólio
	async function loadPortfolioAdmin() {
		const response = await fetch('data/portfolio-data.json');
		portfolioData = await response.json();
		renderPortfolioList();
	}

	// Renderizar lista de sessões
	function renderPortfolioList() {
		portfolioList.innerHTML = '';
		portfolioData.forEach((item, idx) => {
			const div = document.createElement('div');
			div.className = 'border p-4 rounded flex flex-col gap-2 bg-gray-50';
			div.innerHTML = `
				<div class="flex flex-col md:flex-row md:items-center gap-4">
					<img src="${item.image}" alt="${item.title}" class="w-24 h-24 object-cover rounded border">
					<div class="flex-1">
						<input class="font-serif text-xl mb-1 w-full border-b bg-transparent" value="${item.title}" data-field="title" data-idx="${idx}">
						<input class="text-gray-500 text-sm w-full border-b bg-transparent" value="${item.tabName}" data-field="tabName" data-idx="${idx}">
						<textarea class="w-full text-xs border rounded mt-2 p-1" rows="2" data-field="description" data-idx="${idx}">${item.description}</textarea>
						<input class="w-full text-xs border rounded mt-2 p-1" value="${item.image}" data-field="image" data-idx="${idx}">
						<ul class="text-xs mt-2">
							${item.items.map((it, i) => `<li><input value="${it}" data-field="item" data-idx="${idx}" data-item-idx="${i}" class="border-b bg-transparent w-11/12"> <button data-action="remove-item" data-idx="${idx}" data-item-idx="${i}" class="text-red-500">&times;</button></li>`).join('')}
						</ul>
						<button data-action="add-item" data-idx="${idx}" class="text-xs text-blue-600 mt-1">+ Adicionar item</button>
					</div>
					<button data-action="remove" data-idx="${idx}" class="text-red-500 text-lg ml-2">Remover</button>
				</div>
			`;
			portfolioList.appendChild(div);
		});
	}

	// Editar campos
	portfolioList.addEventListener('input', (e) => {
		const field = e.target.getAttribute('data-field');
		const idx = e.target.getAttribute('data-idx');
		if (field === 'item') {
			const itemIdx = e.target.getAttribute('data-item-idx');
			portfolioData[idx].items[itemIdx] = e.target.value;
		} else if (field) {
			portfolioData[idx][field] = e.target.value;
		}
	});

	// Adicionar/remover itens e sessões
	portfolioList.addEventListener('click', (e) => {
		const action = e.target.getAttribute('data-action');
		const idx = e.target.getAttribute('data-idx');
		if (action === 'remove') {
			portfolioData.splice(idx, 1);
			renderPortfolioList();
		} else if (action === 'add-item') {
			portfolioData[idx].items.push('Novo item');
			renderPortfolioList();
		} else if (action === 'remove-item') {
			const itemIdx = e.target.getAttribute('data-item-idx');
			portfolioData[idx].items.splice(itemIdx, 1);
			renderPortfolioList();
		}
	});

	// Adicionar nova sessão
	addSectionBtn.addEventListener('click', () => {
		portfolioData.push({
			id: 'nova-sessao-' + Date.now(),
			tabName: 'Nova Sessão',
			image: '',
			title: 'Nova Sessão',
			description: '',
			items: []
		});
		renderPortfolioList();
	});
});
