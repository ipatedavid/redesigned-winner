// js/main.js
document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('game-cards-container');
    if (!container) return;

    try {
        const response = await fetch('data/games.json');
        if (!response.ok) {
            throw new Error('Nu s-a putut încărca lista de jocuri');
        }
        const games = await response.json();

        if (games.length === 0) {
            container.innerHTML = '<p class="text-center">Nu există jocuri momentan.</p>';
            return;
        }

        let html = '';
        games.forEach(game => {
            html += `
                <div class="col">
                    <div class="card h-100">
                        <img src="${game.thumbnail || 'https://via.placeholder.com/300x180?text=Game+Hub'}" class="card-img-top" alt="${game.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${game.title}</h5>
                            <p class="card-text flex-grow-1">${game.description || ''}</p>
                            <a href="game.html?id=${game.id}" class="btn btn-outline-warning mt-2">Joacă</a>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Eroare la încărcarea jocurilor:', error);
        container.innerHTML = '<p class="text-danger text-center">Eroare la încărcarea jocurilor.</p>';
    }
});
