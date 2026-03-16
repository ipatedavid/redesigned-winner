const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const GAMES_DIR = path.join(__dirname, "games");

// Platforme suportate (directoarele din games/)
const PLATFORMS = ['dos', 'gba', 'snes', 'nes']; // poți adăuga oricâte

app.get("/api/games", async (req, res) => {
    try {
        const games = [];

        // Pentru fiecare platformă
        for (const platform of PLATFORMS) {
            const platformPath = path.join(GAMES_DIR, platform);
            
            // Verifică dacă directorul platformei există
            if (!fs.existsSync(platformPath)) continue;

            const entries = await fs.promises.readdir(platformPath, { withFileTypes: true });

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

                const gameFolderPath = path.join(platformPath, entry.name);
                const files = await fs.promises.readdir(gameFolderPath);

                // Caută un fișier ROM (acceptăm mai multe extensii)
                const romExtensions = ['.zip', '.gba', '.smc', '.sfc', '.nes', '.gb', '.gbc', '.n64', '.z64', '.v64'];
                const romFile = files.find(f => {
                    const ext = path.extname(f).toLowerCase();
                    return romExtensions.includes(ext);
                });
                if (!romFile) continue; // dacă nu găsim niciun ROM, sărim peste

                // Caută descriere
                let description = null;
                const descFile = files.find(f =>
                    f.toLowerCase() === "descriere.txt" ||
                    f.toLowerCase() === "description.txt"
                );
                if (descFile) {
                    description = (await fs.promises.readFile(
                        path.join(gameFolderPath, descFile),
                        "utf8"
                    )).trim();
                }

                // Caută o imagine
                const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
                const imageFile = files.find(f => imageExtensions.includes(path.extname(f).toLowerCase()));
                const imageUrl = imageFile ? `/games/${platform}/${entry.name}/${imageFile}` : null;

                games.push({
                    id: `${platform}-${entry.name}`, // ID unic
                    title: entry.name,
                    file: romFile,
                    zip: `/games/${platform}/${entry.name}/${romFile}`,
                    description: description,
                    imageUrl: imageUrl,
                    platform: platform // foarte important!
                });
            }
        }

        res.json(games);
    } catch (e) {
        console.error(e);
        res.json([]);
    }
});

// Servește fișierele statice
app.use(express.static(__dirname));
app.use("/games", express.static(GAMES_DIR));

app.listen(PORT, () => {
    console.log("Server pornit pe http://localhost:" + PORT);
});