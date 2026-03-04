const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Folderul unde se află jocurile
const GAMES_DIR = path.join(__dirname, "games");

// API routes FIRST
app.get("/api/games", async (req, res) => {
    try {
        // Citește toate intrările din folderul games
        const entries = await fs.promises.readdir(GAMES_DIR, { withFileTypes: true });
        const games = [];

        for (const entry of entries) {

            // Acceptă doar foldere (un folder = un joc)
            if (!entry.isDirectory()) continue;

            const folderPath = path.join(GAMES_DIR, entry.name);
            const files = await fs.promises.readdir(folderPath);

            // Caută fișierul zip al jocului
            const zipFile = files.find(f => f.toLowerCase().endsWith(".zip"));
            if (!zipFile) continue;

            // Caută fișierul de descriere
            let description = null;
            const descFile = files.find(f =>
                f.toLowerCase() === "descriere.txt" ||
                f.toLowerCase() === "description.txt"
            );

            // Citește descrierea din fișier
            if (descFile) {
                description = (await fs.promises.readFile(
                    path.join(folderPath, descFile),
                    "utf8"
                )).trim();
            }

            // Caută o imagine pentru joc
            const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
            const imageFile = files.find(f => {
                const ext = path.extname(f).toLowerCase();
                return imageExtensions.includes(ext);
            });

            // Creează URL-ul imaginii
            const imageUrl = imageFile
                ? `/games/${entry.name}/${imageFile}`
                : null;

            // Obiectul trimis către frontend
            games.push({
                id: entry.name,
                title: entry.name,
                file: zipFile,
                zip: `/games/${entry.name}/${zipFile}`,
                description: description,
                imageUrl: imageUrl
            });
        }

        // Trimite lista de jocuri
        res.json(games);

    } catch (e) {
        // În caz de eroare trimite listă goală
        console.error(e);
        res.json([]);
    }
});

// Servește fișierele din proiect (html, css, js) - AFTER API
app.use(express.static(__dirname));

// Expune folderul games la /games - AFTER API
app.use("/games", express.static(GAMES_DIR));

// Pornește serverul
app.listen(PORT, () => {
    console.log("Server pornit pe http://localhost:" + PORT);

});

