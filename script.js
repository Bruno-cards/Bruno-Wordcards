let decks = {};
let currentDeck = null;
let currentIndex = 0;
let showingFront = true;

document.getElementById('theme-toggle').addEventListener('change', (e) => {
    document.body.classList.toggle('dark', e.target.checked);
});

function navigateTo(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    if (view === 'home') return;
    document.getElementById(view).classList.remove('hidden');
    if (view === 'practice') renderPracticeList();
    if (view === 'editor') renderEditorList();
}

function renderPracticeList() {
    const list = document.getElementById('practice-list');
    list.innerHTML = '';
    Object.keys(decks).forEach(name => {
        const div = document.createElement('div');
        div.className = 'deck-item';
        div.innerText = `${name} (${decks[name].length} cards)`;
        div.onclick = () => startPractice(name);
        list.appendChild(div);
    });
}

function renderEditorList() {
    const list = document.getElementById('editor-list');
    list.innerHTML = '';
    Object.keys(decks).forEach(name => {
        const div = document.createElement('div');
        div.className = 'deck-item';
        div.innerHTML = `
            <strong>${name}</strong> (${decks[name].length} cards) 
            <button onclick="editDeck('${name}')">Edit</button>
            <button onclick="deleteDeck('${name}')">❌</button>
        `;
        list.appendChild(div);
    });
}

function startPractice(name) {
    currentDeck = name;
    currentIndex = 0;
    showingFront = true;
    document.getElementById('card-view').classList.remove('hidden');
    document.getElementById('practice').classList.add('hidden');
    showCard();
}

function showCard() {
    const card = document.getElementById('card');
    const data = decks[currentDeck][currentIndex];
    card.innerText = showingFront ? data.front : data.back;
}

function flipCard() {
    showingFront = !showingFront;
    showCard();
}

function nextCard() {
    currentIndex = (currentIndex + 1) % decks[currentDeck].length;
    showingFront = true;
    showCard();
}

function prevCard() {
    currentIndex = (currentIndex - 1 + decks[currentDeck].length) % decks[currentDeck].length;
    showingFront = true;
    showCard();
}

function editDeck(name) {
    currentDeck = name;
    const container = document.getElementById('edit-cards');
    container.innerHTML = '';
    decks[name].forEach((card, i) => {
        const row = document.createElement('div');
        row.innerHTML = `
            <input value="${card.front}" onchange="decks['${name}'][${i}].front=this.value"/>
            <input value="${card.back}" onchange="decks['${name}'][${i}].back=this.value"/>
            <button onclick="decks['${name}'].splice(${i},1);editDeck('${name}')">Delete</button>
        `;
        container.appendChild(row);
    });
    document.getElementById('edit-view').classList.remove('hidden');
    document.getElementById('editor').classList.add('hidden');
}

function addCard() {
    const front = document.getElementById('front-input').value;
    const back = document.getElementById('back-input').value;
    if (front && back) {
        decks[currentDeck].push({ front, back });
        editDeck(currentDeck);
    }
}

function deleteDeck(name) {
    if (confirm('Do you confirm deletion of this deck?')) {
        delete decks[name];
        renderEditorList();
    }
}

function importDeck() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split('\n');
        const name = file.name.replace('.csv', '');
        decks[name] = lines.filter(Boolean).map(line => {
            const [front, back] = line.split(',');
            return { front: front.trim(), back: back.trim() };
        });
        renderEditorList();
    };
    reader.readAsText(file);
}

function exportAllDecks() {
    let output = '';
    for (const name in decks) {
        output += `Deck: ${name}\n`;
        decks[name].forEach(card => {
            output += `${card.front},${card.back}\n`;
        });
        output += `\n`;
    }
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'all_decks.txt';
    a.click();
}
