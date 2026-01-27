
lucide.createIcons();

let currentSessionType = 'individual';

function setSession(type, element) {
    currentSessionType = type;
    const buttons = document.querySelectorAll('.session-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-black', 'text-white');
        btn.classList.add('border-gray-200', 'text-gray-500', 'hover:border-black', 'hover:text-black');
    });
    element.classList.add('bg-black', 'text-white');
    element.classList.remove('border-gray-200', 'text-gray-500');
    calculateTotal();
}

function calculateTotal() {
    const photoSlider = document.getElementById('photo-slider');
    const photoDisplay = document.getElementById('photo-display');
    const totalPriceEl = document.getElementById('total-price');
    const extraChecks = document.querySelectorAll('.extra-check:checked');

    const photoCount = parseInt(photoSlider.value);
    photoDisplay.textContent = `${photoCount} fotos`;

    let basePrice = currentSessionType === 'individual' ? 300 : 500;
    let photoPrice = (photoCount - 10) * 20;
    if (photoCount < 10) {
        photoPrice = (photoCount - 10) * 25; // Preço um pouco maior se for menos que o base
    }


    let extrasPrice = 0;
    extraChecks.forEach(check => {
        extrasPrice += parseInt(check.value);
    });

    const total = basePrice + photoPrice + extrasPrice;
    totalPriceEl.textContent = total;
}

function openOverlay(image, icon, title, description) {
    document.getElementById('overlay-image').src = image;
    document.getElementById('overlay-icon').setAttribute('data-lucide', icon);
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-description').textContent = description;
    lucide.createIcons(); // Recria o ícone
    document.getElementById('image-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    document.getElementById('image-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function generateStyle() {
    const input = document.getElementById('style-input').value;
    const resultDiv = document.getElementById('style-result');
    const textEl = document.getElementById('style-text');
    const imageContainer = document.getElementById('image-container');
    const imageEl = document.getElementById('generated-image');
    const btn = document.getElementById('style-btn');

    if (!input) {
        alert('Por favor, descreva o que você precisa.');
        return;
    }

    // Simulação de chamada de API
    btn.innerHTML = 'Gerando... <i class="animate-spin" data-lucide="loader"></i>';
    btn.disabled = true;
    lucide.createIcons();


    setTimeout(() => {
        // Mock de resposta da IA
        let suggestionText = `Para um(a) "${input}", sugiro uma abordagem minimalista com toques de cor. Pense em um fundo neutro, talvez com um blazer de corte moderno em tom pastel e acessórios de metal escovado para um look sofisticado e contemporâneo.`;
        let imageUrl = `Gemini_Generated_Image_zedrb9zedrb9zedr.png`; // Imagem placeholder

        // Atualiza a UI
        textEl.textContent = suggestionText;
        imageEl.src = imageUrl;
        
        resultDiv.classList.remove('hidden');
        imageContainer.classList.remove('hidden');

        btn.innerHTML = 'Gerar Sugestão Visual ✨';
        btn.disabled = false;
        lucide.createIcons();


    }, 2500);
}

// Inicializa a calculadora e a agenda
document.addEventListener('DOMContentLoaded', () => {
    calculateTotal();
    
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentMonth = new Date().getMonth();

    document.getElementById('month-0').textContent = months[currentMonth];
    document.getElementById('month-1').textContent = months[(currentMonth + 1) % 12];
    document.getElementById('month-2').textContent = months[(currentMonth + 2) % 12];

    loadPortfolio();
});

async function loadPortfolio() {
    const response = await fetch('data/portfolio-data.json');
    const data = await response.json();
    const tabsContainer = document.getElementById('portfolio-tabs');
    const contentContainer = document.getElementById('portfolio-content');

    tabsContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    data.forEach((category, index) => {
        // Cria as abas
        const tab = document.createElement('button');
        tab.className = `portfolio-tab uppercase text-sm tracking-widest font-medium pb-4 border-b-2 transition-colors duration-300 ${index === 0 ? 'text-neutral-900 border-neutral-900' : 'text-gray-400 border-transparent hover:text-neutral-900'}`;
        tab.textContent = category.tabName;
        tab.onclick = () => showTabContent(category.id);
        tabsContainer.appendChild(tab);

        // Cria o conteúdo (inicialmente escondido, exceto o primeiro)
        const content = document.createElement('div');
        content.id = `content-${category.id}`;
        content.className = `portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${index !== 0 ? 'hidden' : ''}`;

        // Adiciona a imagem principal do portfólio
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'overflow-hidden';
        imgWrapper.innerHTML = `<img src="${category.image}" alt="${category.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer">`;
        content.appendChild(imgWrapper);

        // Adiciona título e descrição
        const infoDiv = document.createElement('div');
        infoDiv.className = 'p-4';
        infoDiv.innerHTML = `<h3 class='font-serif text-2xl mb-2'>${category.title}</h3><p class='text-gray-600 mb-2'>${category.description}</p><ul class='text-sm text-gray-500 list-disc pl-5'>${category.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        content.appendChild(infoDiv);

        contentContainer.appendChild(content);
    });
}

function showTabContent(categoryId) {
    // Esconde todos os conteúdos
    document.querySelectorAll('.portfolio-grid').forEach(grid => {
        grid.classList.add('hidden');
    });

    // Mostra o conteúdo da aba clicada
    document.getElementById(`content-${categoryId}`).classList.remove('hidden');

    // Atualiza o estilo das abas
    document.querySelectorAll('.portfolio-tab').forEach(tab => {
        if (tab.textContent.toLowerCase() === categoryId) {
            tab.classList.add('text-neutral-900', 'border-neutral-900');
            tab.classList.remove('text-gray-400', 'border-transparent');
        } else {
            tab.classList.remove('text-neutral-900', 'border-neutral-900');
            tab.classList.add('text-gray-400', 'border-transparent');
        }
    });
}
