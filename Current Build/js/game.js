// js/game.js - pentru js-dos v8.3.9

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('data/games.json');
        const games = await response.json();
        const game = games.find(g => g.id == gameId);

        if (!game) {
            alert('Jocul nu a fost găsit!');
            window.location.href = 'index.html';
            return;
        }

        displayGame(game);

        // Recomandări (exclude jocul curent)
        const recommendations = games.filter(g => g.id != gameId).slice(0, 4);
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Eroare la încărcarea jocurilor:', error);
    }
});

function displayGame(game) {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;

    gameArea.innerHTML = `
        <div class="game-info text-center mb-3">
            <h2>${game.title}</h2>
            <p>${game.description || 'Descrierea jocului nu este disponibilă.'}</p>
        </div>
        <div id="dosbox-container" class="dos-container"></div>
    `;

    startEmulator(game.dosFile);
}

async function startEmulator(filePath) {
    console.log('Încearcă să pornească emulatorul cu:', filePath);
    const container = document.getElementById('dosbox-container');
    if (!container) {
        console.error('Containerul DOSBox nu a fost găsit!');
        return;
    }

    // Verifică dacă biblioteca este încărcată (în v8 se numește emulators)
    if (typeof window.emulators === 'undefined') {
        console.error('Biblioteca js-dos (emulators) nu este încărcată!');
        container.innerHTML = '<p class="text-danger">Eroare: Biblioteca emulatorului nu a putut fi încărcată.</p>';
        return;
    }

    try {
        // Creează un bundle din URL-ul fișierului ZIP
        const url = filePath; // de exemplu "games/4d_prince_of_persia.zip"
        const bundle = await window.emulators.utils.createBundleFromUrl(url);
        
        // Pornește emulatorul în container
        const dos = await window.emulators.dosbox.start(container, bundle);
        
        // Așteaptă puțin pentru ca sistemul de fișiere să fie gata
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Intră în folderul corect din arhivă și rulează executabilul
        await dos.command(`cd "4D POP - Fixed"`);
        await dos.command(`4D_PRIN.EXE`);
        
        console.log('Jocul rulează!');
    } catch (error) {
        console.error('Eroare la pornirea DOSBox:', error);
        container.innerHTML = `<p class="text-danger">Eroare: ${error.message}</p>`;
    }
}

function displayRecommendations(recommendations) {
    const recList = document.getElementById('recommendations-list');
    if (!recList) return;

    let html = '';
    recommendations.forEach(game => {
        html += `
            <div class="col">
                <div class="card h-100">
                    <img src="${game.thumbnail || 'https://via.placeholder.com/300x180?text=Joc'}" class="card-img-top" alt="${game.title}">
                    <div class="card-body">
                        <h5 class="card-title">${game.title}</h5>
                        <p class="card-text text-truncate">${game.description || '...'}</p>
                        <a href="game.html?id=${game.id}" class="btn btn-outline-warning btn-sm">Joacă</a>
                    </div>
                </div>
            </div>
        `;
    });
    recList.innerHTML = html;
}