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

        const recommendations = games.filter(g => g.id != gameId).slice(0, 4);
        displayRecommendations(recommendations);

    } catch (e) {
        console.error(e);
    }
});

function displayGame(game) {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;

    gameArea.innerHTML = `
        <div class="game-info text-center mb-3">
            <h2>${game.title}</h2>
            <p>${game.description || ''}</p>
        </div>

        <div id="dosbox" class="dos-container"></div>
    `;

    startEmulator(game);
}

function startEmulator(game) {
    const root = document.getElementById("dosbox");
    if (!root) return;

    root.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = 800;   // dimensiunea nativă a canvas-ului
    canvas.height = 500;
    root.appendChild(canvas);

    Dos(root, {
        canvas: canvas,
        wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
        // nu mai folosim scale: "fit" pentru a evita zoom-ul mare
    }).ready((fs, main) => {

        fs.extract(game.dosFile)
          .then(() => {
              console.log("ZIP extracted");

              main([
                  "-c", "c:",
                  "-c", "cd POP3D",
                  "-c", "4DPRIN.EXE"
              ]);

          }).catch(e => {
              console.error("Extract error:", e);
          });

    });
}

function displayRecommendations(recommendations) {
    const recList = document.getElementById('recommendations-list');
    if (!recList) return;

    let html = '';

    recommendations.forEach(game => {
        html += `
            <div class="col">
                <div class="card h-100">
                    <img src="${game.thumbnail || 'https://via.placeholder.com/300x180?text=Joc'}"
                         class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${game.title}</h5>
                        <p class="card-text text-truncate">${game.description || ''}</p>
                        <a href="game.html?id=${game.id}"
                           class="btn btn-outline-warning btn-sm">Joacă</a>
                    </div>
                </div>
            </div>
        `;
    });

    recList.innerHTML = html;
}