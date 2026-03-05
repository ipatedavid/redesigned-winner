document.addEventListener("DOMContentLoaded", async () => {
    // Preia ID-ul jocului din URL, dacă nu există redirect la index
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { location.href = "index.html"; return; }

    try {
        // Încarcă lista de jocuri de la API
        const res = await fetch("/api/games");
        const games = await res.json();
        // Găsește jocul curent după ID
        const game = games.find(g => String(g.id) === String(id));
        if (!game) { alert("Joc inexistent"); location.href = "index.html"; return; }

        storeRecentlyPlayed(game); // Salvează jocul în recent played
        showGame(game);             // Afișează info despre joc
        startGame(game);            // Pornește jocul în DOSBox
        loadRecommended(games, game); // Încarcă recomandările
    } catch (e) {
        console.error(e);
        document.getElementById("game-area").innerHTML = "<p class='text-danger'>Eroare la încărcare.</p>";
    }
});

function showGame(game) {
    // Afișează titlu și fișier joc
    document.getElementById("game-title").textContent = game.title;
    document.getElementById("game-file").textContent = game.file;
    const descEl = document.getElementById("game-description");
    // Afișează descriere sau mesaj fallback
    if (game.description) {
        descEl.innerHTML = `<i class="fa-regular fa-file-lines me-2"></i>${escapeHtml(game.description)}`;
    } else {
        descEl.innerHTML = '<span class="text-muted"><i class="fa-regular fa-circle-exclamation me-2"></i>Description not found</span>';
    }
}

function startGame(game) {
    // Crează canvas pentru DOSBox și curăță containerul
    const root = document.getElementById("dosbox");
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 500;
    root.innerHTML = ""; root.appendChild(canvas);

    // Inițializează DOSBox cu jocul
    Dos(root, {
        canvas: canvas,
        wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js"
    }).ready((fs, main) => {
        fs.extract(game.zip).then(() => {
            main(["-c", "c:", "-c", "START.BAT"]); // Rulează fișierul START.BAT
        }).catch(err => {
            console.error("extract error", err);
        });
    });
}

function storeRecentlyPlayed(game) {
    // Salvează jocul în localStorage (max 5 jocuri)
    const key = "recentGames";
    let recent = JSON.parse(localStorage.getItem(key)) || [];
    recent = recent.filter(g => String(g.id) !== String(game.id)); // elimină duplicatul
    recent.unshift({ 
        id: game.id, 
        title: game.title, 
        file: game.file,
        description: game.description,
        imageUrl: game.imageUrl 
    });
    recent = recent.slice(0, 5); // păstrează doar ultimele 5
    localStorage.setItem(key, JSON.stringify(recent));
}

function loadRecommended(allGames, currentGame) {
    // Filtrează jocurile diferite de cel curent
    const otherGames = allGames.filter(g => String(g.id) !== String(currentGame.id));
    if (otherGames.length === 0) return;

    // Amestecă și selectează până la 4 recomandări
    const shuffled = otherGames.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 4);

    const container = document.getElementById("recommended-container");
    const section = document.getElementById("recommended-section");
    section.style.display = "block"; // arată secțiunea

    let html = "";
    recommended.forEach(game => {
        // Imagine fallback dacă lipsesc
        const imgSrc = game.imageUrl || 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000/svg%22%20width%3D%22150%22%20height%3D%22120%22%20viewBox%3D%220%200%20150%20120%22%3E%3Crect%20width%3D%22150%22%20height%3D%22120%22%20fill%3D%22%232c2f36%22%2F%3E%3Ctext%20x%3D%2275%22%20y%3D%2260%22%20fill%3D%22%239ca3af%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ENo image%3C%2Ftext%3E%3C%2Fsvg%3E';
        const shortDesc = game.description ? game.description.substring(0, 50) + '…' : 'Description not found';
        html += `
            <div class="col">
                <div class="recom-card h-100">
                    <img src="${imgSrc}" class="card-img-top" alt="${game.title}">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${escapeHtml(game.title)}</h6>
                        <p class="card-text small flex-grow-1 text-muted">${escapeHtml(shortDesc)}</p>
                        <a href="game.html?id=${game.id}" class="btn btn-sm btn-play mt-auto">
                            <i class="fa-regular fa-circle-play me-2"></i>Joacă
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html; // adaugă recomandările în DOM
}

function escapeHtml(unsafe) {
    // Escapare HTML pentru siguranță
    return unsafe.replace(/[&<>"']/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        if(m === '"') return '&quot;';
        if(m === "'") return '&#039;';
        return m;
    });
}