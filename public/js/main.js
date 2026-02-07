// ========== STATE ==========
let store = null;
let albumsCache = [];

function resolveImagePath(url) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/assets/${url}`;
}

function processRemoteData(remote) {
    if (!remote) return null;

    try {
        return {
            hero: {
                title: remote.hero?.title ?? "",
                subtitle: remote.hero?.subtitle ?? "",
                bgImage: remote.hero?.image ?? "",
                transform: remote.hero?.transform ?? { scale: 1, posX: 50, posY: 50 },
                titleTransform: remote.hero?.titleTransform ?? { posX: 50, posY: 40 },
                subtitleTransform: remote.hero?.subtitleTransform ?? { posX: 50, posY: 55 },
                titleFontSize: remote.hero?.titleFontSize ?? 48,
                subtitleFontSize: remote.hero?.subtitleFontSize ?? 18,
                topBarHeight: remote.hero?.topBarHeight ?? 0,
                bottomBarHeight: remote.hero?.bottomBarHeight ?? 0,
                overlayOpacity: remote.hero?.overlayOpacity ?? 30
            },
            about: {
                title: remote.about?.title ?? "",
                text: remote.about?.text ?? "",
                image: remote.about?.image ?? "",
                images: Array.isArray(remote.about?.images) ? remote.about.images.map(img => ({
                    image: img.image,
                    posX: img.posX ?? 50,
                    posY: img.posY ?? 50,
                    scale: img.scale ?? 1
                })) : []
            },
            portfolio: Array.isArray(remote.portfolio) ? remote.portfolio
                .filter(p => typeof p === 'string' ? p : p.image)
                .map(p => ({
                image: typeof p === 'string' ? p : p.image,
                posX: p.posX ?? 50,
                posY: p.posY ?? 50,
                scale: p.scale ?? 1,
                ratio: p.ratio ?? '3/4'
            })) : [],
            studio: {
                title: remote.studio?.title ?? "",
                description: remote.studio?.description ?? "",
                address: remote.studio?.address ?? "",
                hours: remote.studio?.hours ?? "",
                whatsapp: remote.studio?.whatsapp ?? "",
                whatsappMessages: remote.studio?.whatsappMessages ?? [],
                photos: remote.studio?.photos ? remote.studio.photos.map(p => ({
                    image: p.image,
                    posX: p.posX ?? 50,
                    posY: p.posY ?? 50,
                    scale: p.scale ?? 1
                })) : []
            },
            albums: Array.isArray(remote.albums) ? remote.albums.map(a => ({
                title: a.title ?? '',
                subtitle: a.subtitle ?? '',
                cover: a.cover ?? '',
                photos: Array.isArray(a.photos) ? a.photos : [],
                createdAt: a.createdAt ?? null
            })) : [],
            footer: {
                socialMedia: remote.footer?.socialMedia ?? {},
                quickLinks: remote.footer?.quickLinks ?? [],
                newsletter: remote.footer?.newsletter ?? { enabled: true, title: '', description: '' },
                copyright: remote.footer?.copyright ?? ''
            }
        };
    } catch (e) {
        console.warn('Erro ao processar dados do servidor:', e);
        return null;
    }
}

// ========== RENDER ==========
function render() {
    // Marca pagina como carregada (remove skeleton)
    document.body.classList.add('loaded');

    // ===== HERO =====
    const heroImg = document.getElementById('dom-hero-img');
    const heroOverlay = document.getElementById('dom-hero-overlay');
    const heroTopBar = document.getElementById('dom-hero-top-bar');
    const heroBottomBar = document.getElementById('dom-hero-bottom-bar');
    const heroTitle = document.getElementById('dom-hero-title');
    const heroSubtitle = document.getElementById('dom-hero-subtitle');

    // Imagem
    const heroImageUrl = resolveImagePath(store.hero.image || store.hero.bgImage);
    const imgScale = store.hero.imageScale ?? (store.hero.transform?.scale ?? 1);
    const imgPosX = store.hero.imagePosX ?? (store.hero.transform?.posX ?? 50);
    const imgPosY = store.hero.imagePosY ?? (store.hero.transform?.posY ?? 50);

    heroImg.style.transform = `scale(${imgScale})`;
    heroImg.style.transformOrigin = `${imgPosX}% ${imgPosY}%`;
    heroImg.style.objectPosition = `${imgPosX}% ${imgPosY}%`;

    // Carrega imagem e mostra com fade-in quando pronta
    if (heroImg.src !== heroImageUrl) {
        heroImg.onload = () => heroImg.classList.remove('opacity-0');
        heroImg.src = heroImageUrl;
    }

    // Overlay
    const overlayOpacity = (store.hero.overlayOpacity ?? 30) / 100;
    heroOverlay.style.background = `rgba(0,0,0,${overlayOpacity})`;

    // Faixas cinema
    heroTopBar.style.height = (store.hero.topBarHeight ?? 0) + '%';
    heroBottomBar.style.height = (store.hero.bottomBarHeight ?? 0) + '%';

    // Titulo
    const titlePosX = store.hero.titlePosX ?? (store.hero.titleTransform?.posX ?? 50);
    const titlePosY = store.hero.titlePosY ?? (store.hero.titleTransform?.posY ?? 40);
    const titleFS = store.hero.titleFontSize ?? 48;

    heroTitle.textContent = store.hero.title;
    heroTitle.style.left = titlePosX + '%';
    heroTitle.style.top = titlePosY + '%';
    heroTitle.style.transform = 'translate(-50%, -50%)';
    heroTitle.style.fontSize = `clamp(28px, 6vw, ${titleFS}px)`;
    heroTitle.style.lineHeight = '1.15';
    heroTitle.style.maxWidth = 'min(90vw, 800px)';

    // Subtitulo
    const subPosX = store.hero.subtitlePosX ?? (store.hero.subtitleTransform?.posX ?? 50);
    const subPosY = store.hero.subtitlePosY ?? (store.hero.subtitleTransform?.posY ?? 55);
    const subtitleFS = store.hero.subtitleFontSize ?? 18;

    heroSubtitle.textContent = store.hero.subtitle;
    heroSubtitle.style.left = subPosX + '%';
    heroSubtitle.style.top = subPosY + '%';
    heroSubtitle.style.transform = 'translate(-50%, -50%)';
    heroSubtitle.style.fontSize = `clamp(14px, 3.5vw, ${subtitleFS}px)`;
    heroSubtitle.style.lineHeight = '1.6';
    heroSubtitle.style.maxWidth = 'min(90vw, 600px)';

    // ===== SOBRE =====
    document.getElementById('dom-about-title').textContent = store.about.title;
    document.getElementById('dom-about-text').innerHTML = store.about.text
        .split('\n')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => `<p>${p}</p>`)
        .join('');

    // Imagens do Sobre (array ou single)
    const aboutImagesContainer = document.getElementById('dom-about-images');
    const aboutImages = store.about.images?.length > 0 ? store.about.images : (store.about.image ? [{ image: store.about.image, posX: 50, posY: 50, scale: 1 }] : []);

    if (aboutImages.length > 0) {
        const cols = aboutImages.length === 1 ? '' : aboutImages.length === 2 ? 'grid-cols-2' : 'grid-cols-2';
        aboutImagesContainer.className = `grid gap-4 ${cols}`;
        aboutImagesContainer.innerHTML = aboutImages.map((img, idx) => {
            const posX = img.posX ?? 50;
            const posY = img.posY ?? 50;
            const scale = img.scale ?? 1;
            return `
                <div class="aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-2xl">
                    <img src="${resolveImagePath(img.image)}" alt="Sobre ${idx + 1}" loading="lazy"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        style="object-position:${posX}% ${posY}%; transform:scale(${scale});"
                        onmouseenter="this.style.transform='scale(${scale * 1.05})'"
                        onmouseleave="this.style.transform='scale(${scale})'">
                </div>
            `;
        }).join('');
    }

    // ===== PORTFOLIO =====
    const portfolioGrid = document.getElementById('dom-portfolio-grid');
    portfolioGrid.innerHTML = store.portfolio.map((item, idx) => {
        const posX = item.posX ?? 50;
        const posY = item.posY ?? 50;
        const scale = item.scale ?? 1;
        const ratio = item.ratio ?? '3/4';
        return `
        <div class="overflow-hidden cursor-pointer group" style="aspect-ratio:${ratio};">
            <img src="${resolveImagePath(item.image)}" alt="Portfolio ${idx + 1}"
                loading="lazy" class="w-full h-full object-cover transition-transform duration-700"
                style="object-position: ${posX}% ${posY}%; transform: scale(${scale});"
                onmouseenter="this.style.transform='scale(${scale * 1.05})'"
                onmouseleave="this.style.transform='scale(${scale})'" />
        </div>
    `}).join('');

    // ===== ALBUNS =====
    const albumsSorted = [...(store.albums || [])].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
    albumsCache = albumsSorted;

    const albumCard = (album, idx, dark = false) => {
        const cover = album.cover || album.photos?.[0] || '';
        const title = album.title || 'Álbum';
        const subtitle = album.subtitle || '';
        const textClass = dark ? 'text-white' : 'text-neutral-900';
        const subClass = dark ? 'text-neutral-400' : 'text-neutral-500';
        return `
            <div onclick="openAlbum(${idx})" class="group cursor-pointer">
                <div class="aspect-[4/5] rounded-xl overflow-hidden mb-4 relative shadow-2xl bg-black">
                    <img src="${resolveImagePath(cover)}" loading="lazy" class="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <span class="text-white text-xs border border-white/30 px-3 py-1 rounded-full">VER ÁLBUM</span>
                    </div>
                </div>
                ${subtitle ? `<p class="${subClass} text-[10px] uppercase tracking-widest mb-1">${subtitle}</p>` : ''}
                <h4 class="font-serif text-lg ${textClass} group-hover:text-gray-300">${title}</h4>
            </div>
        `;
    };

    const recentContainer = document.getElementById('dom-recent-albums');
    if (recentContainer) {
        recentContainer.innerHTML = albumsSorted.length
            ? albumsSorted.slice(0, 4).map((album, idx) => albumCard(album, idx, true)).join('')
            : '<p class="text-gray-400 text-sm">Nenhum álbum disponível ainda.</p>';
    }

    // ===== ESTUDIO =====
    const studioPhotosGrid = document.getElementById('dom-studio-photos');
    const photos = store.studio.photos || [];

    // Ajustar grid baseado na quantidade de fotos
    const gridCols = photos.length === 1 ? 'grid-cols-1' :
                    photos.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    photos.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-2 lg:grid-cols-4';
    studioPhotosGrid.className = `grid ${gridCols} gap-6 mb-16`;

    studioPhotosGrid.innerHTML = photos.map((photo, idx) => {
        const posX = photo.posX ?? 50;
        const posY = photo.posY ?? 50;
        const scale = photo.scale ?? 1;
        return `
        <div class="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-lg group">
            <img src="${resolveImagePath(photo.image)}" alt="Estúdio ${idx + 1}"
                loading="lazy" class="w-full h-full object-cover transition-transform duration-500"
                style="object-position: ${posX}% ${posY}%; transform: scale(${scale});"
                onmouseenter="this.style.transform='scale(${scale * 1.05})'"
                onmouseleave="this.style.transform='scale(${scale})'" />
        </div>
    `}).join('');

    if (store.studio.title) {
        document.getElementById('dom-studio-title').textContent = store.studio.title;
    }
    if (store.studio.description) {
        document.getElementById('dom-studio-description').textContent = store.studio.description;
    }
    document.getElementById('dom-studio-address').textContent = store.studio.address;
    document.getElementById('dom-studio-hours').innerHTML = store.studio.hours
        .split('\n')
        .map(h => h.trim())
        .filter(h => h)
        .join('<br>');

    // Mapa dinamico baseado no endereco
    const mapIframe = document.getElementById('dom-studio-map');
    if (mapIframe && store.studio.address) {
        const encodedAddress = encodeURIComponent(store.studio.address);
        mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;
    }

    // ===== FOOTER =====
    if (store.footer) {
        // Redes Sociais
        const footerSocial = document.getElementById('footer-social');
        if (footerSocial && store.footer.socialMedia) {
            footerSocial.innerHTML = '';
            const socials = store.footer.socialMedia;
            const platforms = [
                { name: 'Instagram', key: 'instagram', icon: 'instagram' },
                { name: 'Facebook', key: 'facebook', icon: 'facebook' },
                { name: 'LinkedIn', key: 'linkedin', icon: 'linkedin' },
                { name: 'TikTok', key: 'tiktok', icon: 'music' },
                { name: 'YouTube', key: 'youtube', icon: 'youtube' },
            ];

            platforms.forEach(platform => {
                if (socials[platform.key]) {
                    const link = document.createElement('a');
                    link.href = socials[platform.key];
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.className = 'inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors';
                    link.innerHTML = `<i data-lucide="${platform.icon}" class="w-5 h-5"></i>`;
                    footerSocial.appendChild(link);
                }
            });

            // Email
            if (socials.email) {
                const emailLink = document.createElement('a');
                emailLink.href = `mailto:${socials.email}`;
                emailLink.className = 'inline-flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors';
                emailLink.innerHTML = `<i data-lucide="mail" class="w-5 h-5"></i>`;
                footerSocial.appendChild(emailLink);
            }

        }

        // Links Uteis
        const footerLinks = document.getElementById('footer-links');
        if (footerLinks && store.footer.quickLinks) {
            footerLinks.innerHTML = '';
            store.footer.quickLinks.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url || '#';
                a.textContent = link.label || 'Link';
                a.className = 'block hover:text-white transition-colors text-sm';
                footerLinks.appendChild(a);
            });
        }

        // Contato (vindo de studio)
        const footerContact = document.getElementById('footer-contact');
        if (footerContact && store.studio) {
            footerContact.innerHTML = '';

            if (store.studio.address) {
                const addr = document.createElement('div');
                addr.innerHTML = `<strong class="text-white">Localização</strong><p class="text-xs mt-1">${store.studio.address}</p>`;
                footerContact.appendChild(addr);
            }

            if (store.studio.hours) {
                const hrs = document.createElement('div');
                hrs.innerHTML = `<strong class="text-white">Horário</strong><p class="text-xs mt-1">${store.studio.hours.replace(/\n/g, '<br>')}</p>`;
                footerContact.appendChild(hrs);
            }

            if (store.studio.whatsapp) {
                const wa = document.createElement('div');
                wa.innerHTML = `<strong class="text-white">WhatsApp</strong><p><a href="https://wa.me/${store.studio.whatsapp}" class="text-xs text-green-400 hover:text-green-300">${store.studio.whatsapp}</a></p>`;
                footerContact.appendChild(wa);
            }
        }

        // Newsletter
        const newsletterTitle = document.getElementById('footer-newsletter-title');
        const newsletterDesc = document.getElementById('footer-newsletter-desc');
        if (store.footer.newsletter) {
            if (newsletterTitle && store.footer.newsletter.title) {
                newsletterTitle.textContent = store.footer.newsletter.title;
            }
            if (newsletterDesc && store.footer.newsletter.description) {
                newsletterDesc.textContent = store.footer.newsletter.description;
            }
        }

        // Copyright
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright && store.footer.copyright) {
            footerCopyright.textContent = store.footer.copyright;
        }
    }

    // Render all icons once at end
    lucide.createIcons();
}

function openAlbum(index) {
    const album = albumsCache[index];
    if (!album) return;

    const modal = document.getElementById('album-modal');
    const title = document.getElementById('album-modal-title');
    const subtitle = document.getElementById('album-modal-subtitle');
    const photosGrid = document.getElementById('album-modal-photos');

    title.textContent = album.title || 'Álbum';
    subtitle.textContent = album.subtitle || '';
    photosGrid.innerHTML = (album.photos || []).map(url => `
        <div class="break-inside-avoid">
            <img src="${resolveImagePath(url)}" class="w-full h-auto rounded-lg" />
        </div>
    `).join('');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeAlbum() {
    const modal = document.getElementById('album-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ========== WHATSAPP WIDGET ==========
let bubbleClosed = false;
let currentMessageIndex = 0;
let messageTimeouts = [];

function openWhatsapp() {
    const whatsappNumber = store.studio.whatsapp || '5511999999999';
    const defaultText = 'Olá! Vi seu site e gostaria de mais informações.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultText)}`;
    window.open(whatsappUrl, '_blank');
}

function getWhatsappMessages() {
    const messages = store.studio.whatsappMessages;
    if (Array.isArray(messages) && messages.length > 0) {
        return messages;
    }
    return [{ text: 'Olá! Como posso ajudar você hoje?', delay: 5 }];
}

function showWhatsappMessage(index) {
    if (bubbleClosed) return;

    const messages = getWhatsappMessages();
    if (index >= messages.length) {
        // Reiniciar ciclo apos uma pausa
        currentMessageIndex = 0;
        messageTimeouts.push(setTimeout(() => showWhatsappMessage(0), 10000));
        return;
    }

    const bubble = document.getElementById('whatsapp-bubble');
    const greetingEl = document.getElementById('whatsapp-greeting');

    if (bubble && greetingEl) {
        const message = messages[index];

        // Animar saida se ja estiver visivel
        if (!bubble.classList.contains('hidden')) {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(10px)';

            setTimeout(() => {
                greetingEl.textContent = message.text;
                bubble.style.opacity = '1';
                bubble.style.transform = 'translateY(0)';
            }, 200);
        } else {
            greetingEl.textContent = message.text;
            bubble.classList.remove('hidden');
        }

        currentMessageIndex = index;

        // Agendar proxima mensagem
        const nextDelay = (message.delay || 5) * 1000;
        messageTimeouts.push(setTimeout(() => {
            showWhatsappMessage(index + 1);
        }, nextDelay));
    }
}

function startWhatsappMessages() {
    if (bubbleClosed) return;

    const messages = getWhatsappMessages();
    if (messages.length === 0) return;

    // Primeira mensagem apos o delay configurado
    const firstDelay = (messages[0].delay || 5) * 1000;
    messageTimeouts.push(setTimeout(() => {
        showWhatsappMessage(0);
    }, firstDelay));
}

function closeWhatsappBubble() {
    const bubble = document.getElementById('whatsapp-bubble');
    if (bubble) {
        bubble.classList.add('hidden');
        bubbleClosed = true;
        // Cancelar todos os timeouts pendentes
        messageTimeouts.forEach(t => clearTimeout(t));
        messageTimeouts = [];
    }
}

async function loadRemoteData() {
    try {
        const [siteDataRes, heroRes] = await Promise.all([
            fetch('/api/site-data'),
            fetch('/api/hero')
        ]);

        const siteData = siteDataRes.ok ? await siteDataRes.json() : null;
        const heroData = heroRes.ok ? await heroRes.json() : null;

        // Combinar dados
        if (siteData) {
            if (heroData) {
                return { ...siteData, hero: heroData };
            }
            return siteData;
        }
        return null;
    } catch (error) {
        console.warn('Erro ao buscar dados do servidor:', error);
        return null;
    }
}

// ========== NEWSLETTER ==========
async function handleNewsletterSubscribe(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email) {
        alert('Por favor, insira um email válido');
        return;
    }

    // Desabilitar botao durante o processo
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Inscrevendo...';

    try {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            // Limpar formulario
            emailInput.value = '';

            // Feedback de sucesso
            button.textContent = data.alreadySubscribed ? '✓ Já inscrito!' : '✓ Inscrito!';
            button.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            button.classList.add('bg-green-600');

            console.log('Newsletter:', data.message);
        } else {
            throw new Error(data.error || 'Erro ao inscrever');
        }
    } catch (error) {
        console.error('Erro:', error);
        button.textContent = '✗ Erro';
        button.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        button.classList.add('bg-red-600');
    }

    // Resetar botao apos 3 segundos
    setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
        button.classList.remove('bg-green-600', 'bg-red-600');
        button.classList.add('bg-gray-700', 'hover:bg-gray-600');
    }, 3000);
}

// ========== SPLASH SCREEN ==========
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 700);
    }
}

// ========== FAQ ==========
let faqData = [];

async function loadFAQs() {
    try {
        const res = await fetch('/api/faq');
        if (!res.ok) throw new Error('Erro ao carregar FAQs');
        const data = await res.json();
        faqData = data.faqs || [];
        renderFAQs();
    } catch (error) {
        console.warn('Erro ao buscar FAQs:', error);
    }
}

function renderFAQs() {
    const accordion = document.getElementById('faq-accordion');
    if (!accordion) return;

    accordion.innerHTML = faqData.map((faq, index) => `
        <div class="faq-item bg-black/40 rounded-lg overflow-hidden">
            <div class="faq-question px-6 py-4 flex justify-between items-center" onclick="toggleFAQ(${index})">
                <h3 class="font-semibold text-lg pr-4">${faq.question}</h3>
                <i data-lucide="chevron-down" class="faq-icon w-5 h-5 flex-shrink-0 text-gray-400"></i>
            </div>
            <div class="faq-answer px-6">
                <div class="text-gray-300 leading-relaxed whitespace-pre-line">${faq.answer}</div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function toggleFAQ(index) {
    const items = document.querySelectorAll('.faq-item');
    const item = items[index];

    if (item.classList.contains('active')) {
        item.classList.remove('active');
    } else {
        // Fechar todos os outros
        items.forEach(i => i.classList.remove('active'));
        // Abrir o clicado
        item.classList.add('active');
    }
}

// ========== MOBILE MENU ==========
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuPanel = document.getElementById('mobile-menu-panel');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

function openMobileMenu() {
    if (!mobileMenu || !mobileMenuPanel) return;
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenuPanel.classList.remove('translate-y-2', 'opacity-0');
    document.body.classList.add('overflow-hidden');
    mobileMenuBtn?.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuPanel) return;
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    mobileMenuPanel.classList.add('translate-y-2', 'opacity-0');
    document.body.classList.remove('overflow-hidden');
    mobileMenuBtn?.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
    if (!mobileMenu) return;
    const isOpen = !mobileMenu.classList.contains('pointer-events-none');
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
mobileMenu?.addEventListener('click', (event) => {
    if (event.target === mobileMenu) {
        closeMobileMenu();
    }
});
document.querySelectorAll('[data-close-mobile]')?.forEach((link) => {
    link.addEventListener('click', () => closeMobileMenu());
});

// ========== INIT ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

async function init() {
    try {
        // Checar manutencao (pular se URL tem ?preview)
        const isPreview = new URLSearchParams(window.location.search).has('preview');
        if (!isPreview) {
            try {
                const configRes = await fetch('/api/site-config');
                if (configRes.ok) {
                    const config = await configRes.json();
                    if (config.maintenance?.enabled) {
                        showMaintenanceScreen(config.maintenance);
                        return;
                    }
                }
            } catch (e) { /* ignora erro de config */ }
        }

        const remote = await loadRemoteData();
        store = processRemoteData(remote);
        if (store) {
            render();
            startWhatsappMessages();
            loadFAQs();
        } else {
            console.warn('Nenhum dado disponível do servidor');
        }
    } finally {
        hideSplashScreen();
    }
}

function showMaintenanceScreen(maintenance) {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';

    document.body.innerHTML = `
        <div style="position:fixed; inset:0; background:#000; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; z-index:9999;">
            <h1 style="font-family:'Playfair Display',serif; font-size:2rem; font-weight:bold; color:white; margin-bottom:0.5rem;">CLIQUE·ZOOM</h1>
            <div style="width:3rem; height:1px; background:#374151; margin:1.5rem 0;"></div>
            <h2 style="font-size:1.5rem; color:#f3f4f6; margin-bottom:1rem;">${maintenance.title || 'Site em Manutencao'}</h2>
            <p style="color:#9ca3af; font-size:1rem; max-width:30rem; line-height:1.6;">${maintenance.message || 'Estamos realizando manutencao. Volte em breve!'}</p>
        </div>
    `;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
