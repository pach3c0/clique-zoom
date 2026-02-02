# Editor de Fotos com Aspect Ratios - Documentação Técnica

**Data:** 2 de fevereiro de 2026  
**Status:** ✅ Implementado e Funcionando  
**Versão:** 1.0

---

## 📋 Visão Geral

O **Editor de Fotos Profissional** permite que o fotógrafo edite imagens do portfólio com controles avançados:
- Reposicionamento via drag
- Zoom via scroll ou slider
- Presets de aspect ratio
- Grid visual (Regra dos Terços)
- Sincronização automática com site público

---

## 🎯 Funcionalidades Implementadas

### 1. **Modal Fullscreen**
- Dimensões: Responsive (fullscreen em desktop, otimizado em mobile)
- Sidebar esquerda: Controles e presets
- Canvas central: Preview em tempo real
- Layout: Flexbox com max-width constraints

### 2. **Controles de Posição**

#### Drag & Drop
```javascript
proEditorState.isDragging = true;
proEditorState.startX = e.clientX;
proEditorState.startY = e.clientY;
// Calcula delta e atualiza posição
```
- Click na imagem → arrastar para reposicionar
- Feedback visual: cursor muda para "grab"
- Restrição de limites: 0-100% em X e Y

#### Sliders de Posição
- **X Slider:** 0-100% (esquerda → direita)
- **Y Slider:** 0-100% (topo → base)
- Atualiza preview em tempo real
- Valores sincronizados com estado

### 3. **Controles de Zoom**

#### Scroll do Mouse
```javascript
layer.onwheel = (e) => {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    proEditorState.zoom = Math.max(1, Math.min(2, proEditorState.zoom + delta));
};
```
- Scroll up: aumenta zoom (até 2x)
- Scroll down: diminui zoom (até 1x)
- Passo: 0.05 (5% por scroll)
- Limite: 1x até 2x

#### Slider de Zoom
- Range: 1.0 até 2.0
- Step: 0.1
- Atualiza em tempo real com preview

### 4. **Presets de Aspect Ratio**

#### Botões Disponíveis
```
┌─────────────────┬──────────────────┬─────────────────┐
│  HERO (16:9)    │ PORTFÓLIO (3:4)  │  SQUARE (1:1)   │
│  Landscape      │  Portrait        │  Square         │
│  wide format    │  default/main    │  compact        │
└─────────────────┴──────────────────┴─────────────────┘
```

#### Implementação
```javascript
function proEditorSetRatio(ratio) {
    proEditorState.ratio = ratio;
    const canvas = document.getElementById('pro-canvas-area');
    canvas.style.aspectRatio = ratio;
    
    // Atualiza botão ativo visualmente
    document.querySelectorAll('.pro-ratio-btn').forEach(btn => {
        btn.classList.remove('border-neutral-900', 'bg-neutral-50');
        btn.classList.add('border-gray-300', 'bg-white');
    });
    event.target.closest('.pro-ratio-btn').classList.add('border-neutral-900', 'bg-neutral-50');
}
```

**Mapeamento CSS:**
```javascript
const aspectMap = {
    '16/9': 'aspect-video',      // Landscape 16:9
    '3/4': 'aspect-[3/4]',       // Portrait 3:4
    '1/1': 'aspect-square'       // Square 1:1
};
```

### 5. **Grid Visual (Regra dos Terços)**

#### HTML
```html
<div id="pro-rule-of-thirds" class="absolute inset-0 grid-thirds">
    <div></div><div></div><div></div>
    <!-- Repetido 9 vezes para grid 3x3 -->
</div>
```

#### CSS
```css
.grid-thirds {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    pointer-events: none;
}
.grid-thirds div {
    border: 0.5px solid rgba(255, 255, 255, 0.3);
}
```

#### Toggle
```html
<input type="checkbox" id="grid-toggle" checked onchange="proEditorUpdate()">
```
- Checkbox no sidebar
- Estado persistido em localStorage
- Visibilidade togglável

---

## 💾 Persistência de Dados

### Estrutura no localStorage
```javascript
{
    portfolio: [
        {
            image: "/uploads/photo-123.jpg",
            posX: 45,           // 0-100
            posY: 60,           // 0-100
            scale: 1.25,        // 1-2
            ratio: "3/4"        // "16/9" | "3/4" | "1/1"
        }
    ]
}
```

### Salvamento Automático
```javascript
function savePhotoPosition() {
    appData.portfolio[editingPhotoIndex] = {
        ...appData.portfolio[editingPhotoIndex],
        posX: Math.round(proEditorState.posX),
        posY: Math.round(proEditorState.posY),
        scale: parseFloat(proEditorState.zoom.toFixed(2)),
        ratio: proEditorState.ratio
    };
    
    // Save to localStorage
    localStorage.setItem('cliqueZoomAdmin', JSON.stringify(saveData));
    
    // Re-render gallery
    renderPortfolio();
}
```

---

## 🔄 Sincronização com Site Público

### Admin Panel → localStorage
1. Editor salva dados: `proEditorState` → `appData.portfolio[idx]`
2. Dados persistem em: `localStorage.cliqueZoomAdmin`
3. Render da galeria atualiza visualmente

### Site Público ← localStorage
1. Page load lê: `localStorage.getItem('cliqueZoomAdmin')`
2. Função `applyAdminData()` mapeia dados
3. **Novo:** Inclui mapeamento de `ratio`
4. Renderiza cards com aspect ratio dinâmico

#### Código de Mapeamento
```javascript
function applyAdminData(baseStore) {
    const admin = JSON.parse(localStorage.getItem('cliqueZoomAdmin'));
    
    merged.portfolio = admin.portfolio.map(p => ({
        image: p.image || p,
        posX: p.posX ?? 50,
        posY: p.posY ?? 50,
        scale: p.scale ?? 1,
        ratio: p.ratio ?? '3/4'  // ← NOVO
    }));
}
```

#### Renderização Dinâmica
```javascript
portfolioGrid.innerHTML = store.portfolio.map((item, idx) => {
    const ratio = item.ratio ?? '3/4';
    const aspectMap = { '16/9': 'aspect-video', '3/4': 'aspect-[3/4]', '1/1': 'aspect-square' };
    const aspectClass = aspectMap[ratio] || 'aspect-[3/4]';
    
    return `
        <div class="${aspectClass} overflow-hidden cursor-pointer group">
            <img src="${resolveImagePath(item.image)}" 
                style="object-position: ${item.posX}% ${item.posY}%; transform: scale(${item.scale});" />
        </div>
    `;
}).join('');
```

---

## 🐛 Problemas Corrigidos

### Erro 1: Função Não Definida
**Problema:** Console error: `setupPhotoEditorEvents` não existe  
**Causa:** Nome incorreto - deveria ser `proEditorSetupEvents()`  
**Solução:** Corrigido em `renderPortfolio()` linha 1063

### Erro 2: Ratio Não Salvava
**Problema:** Mudar aspect ratio não persistia  
**Causa:** `savePhotoPosition()` não incluía `ratio`  
**Solução:** Adicionado `appData.portfolio[idx].ratio = proEditorState.ratio`

### Erro 3: Ratio Não Restaurava
**Problema:** Ao reabrir editor, ratio voltava para padrão  
**Causa:** `openPhotoEditor()` não restaurava `ratio`  
**Solução:** Adicionado:
```javascript
proEditorState.ratio = photo.ratio ?? '3/4';
canvas.style.aspectRatio = proEditorState.ratio;
// Update button visual
```

### Erro 4: Site Público Não Atualizava
**Problema:** Mudar ratio no admin não refletia no site  
**Causa:** Site não mapeava/renderizava `ratio` dinamicamente  
**Solução:** 
1. Adicionado `ratio` em `applyAdminData()`
2. Renderização dinâmica com `aspectMap`

---

## 📝 Arquivos Modificados

### admin/index.html
- **Linhas 988-1020:** Adicionado section "FORMATO DO RECORTE" com 4 botões
- **Linhas 1038-1042:** Adicionado `ratio` ao `proEditorState`
- **Linhas 1076-1118:** Melhorado `openPhotoEditor()` para restaurar ratio
- **Linhas 1172-1207:** Adicionados `proEditorSetRatio()` e `proEditorResetToDefault()`
- **Linhas 1242-1261:** Adicionado salvamento automático no localStorage

### public/index.html
- **Linhas 332-338:** Mapeamento de `ratio` em `applyAdminData()`
- **Linhas 440-459:** Renderização dinâmica com aspect ratio variável

---

## 🎨 Estilos CSS

### Botões de Ratio
```css
.pro-ratio-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border: 2px solid;
    border-radius: 8px;
    background: white;
    transition: all 0.2s;
}

.pro-ratio-btn[data-active="true"] {
    border-color: #171717;      /* neutral-900 */
    background: #f5f5f5;        /* neutral-50 */
}

.pro-ratio-btn:hover {
    background: #f3f4f6;        /* gray-50 */
}
```

### Canvas Area
```css
#pro-canvas-area {
    width: 100%;
    max-width: 600px;
    aspect-ratio: 3/4;          /* Default */
    background: #000;
    overflow: hidden;
    transition: aspect-ratio 0.3s;
}
```

---

## ✅ Testes Realizados

- [x] Drag repositions image correctly
- [x] Scroll zoom works (1x to 2x)
- [x] Sliders update preview in real-time
- [x] Aspect ratio buttons change canvas ratio
- [x] Active button highlights correctly
- [x] Grid toggle shows/hides lines
- [x] Data saves to localStorage
- [x] Data loads when editor reopens
- [x] Site público renders correct aspect ratio
- [x] Gallery adapts to 16:9, 3:4, 1:1 formats

---

## 🚀 Performance

- Modal renderizado uma única vez (reutilizado)
- Eventos delegados via `on*` handlers
- CSS transitions para smooth animations
- localStorage é síncrono (não bloqueia UI)
- Renderização gallery otimizada com template strings

---

## 📚 Referências

**Tailwind Aspect Ratios:**
- `aspect-video` → 16/9
- `aspect-square` → 1/1
- `aspect-[3/4]` → Custom ratio

**Browser APIs Utilizadas:**
- `element.style.aspectRatio` - Dynamic CSS property
- `window.onmousedown/mousemove/mouseup` - Drag events
- `element.onwheel` - Scroll zoom
- `localStorage.getItem/setItem` - Data persistence

---

**Última Atualização:** 02/02/2026  
**Próximo Passo:** Aplicar editor ao Estúdio (studio photos)
