document.addEventListener('DOMContentLoaded', () => {
    // --- Elementtien viittaukset ---
    const gameDateInput = document.getElementById('game-date');
    const player1NameInput = document.getElementById('player1-name');
    const player1ScoreSelect = document.getElementById('player1-score-select');
    const player2NameInput = document.getElementById('player2-name');
    const player2ScoreSelect = document.getElementById('player2-score-select');
    const saveGameBtn = document.getElementById('save-game-btn');
    const gamesListDiv = document.getElementById('games-list');
    const statsDiv = document.getElementById('stats');
    const errorMessageP = document.getElementById('error-message');
    const currentYearSpan = document.getElementById('current-year');
    const playerDatalist = document.getElementById('player-names-list');
    const playerManagementListDiv = document.getElementById('player-management-list'); // Uusi
    const exportDataBtn = document.getElementById('export-data-btn'); // Uusi
    const importDataBtn = document.getElementById('import-data-btn'); // Uusi
    const importFileInput = document.getElementById('import-file-input'); // Uusi
    const importStatusP = document.getElementById('import-status'); // Uusi
    const formInputs = [gameDateInput, player1NameInput, player1ScoreSelect, player2NameInput, player2ScoreSelect];

    // --- Globaalit muuttujat datalle ---
    let games = [];
    let playerNames = [];

    // --- Asetukset & Alustus ---
    gameDateInput.valueAsDate = new Date();
    if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); }

    // --- LocalStorage Funktiot ---
    function loadDataFromLocalStorage() {
        // Pelit
        try {
            const storedGames = localStorage.getItem('klaskGames');
            games = storedGames ? JSON.parse(storedGames) : [];
            if (!Array.isArray(games)) games = [];
        } catch (error) {
            console.error("Error loading 'klaskGames':", error); games = [];
            displayError("Tallennustilan lukuvirhe (pelit).", 5000);
        }
        // Pelaajanimet
        try {
            const storedPlayerNames = localStorage.getItem('klaskPlayerNames');
            playerNames = storedPlayerNames ? JSON.parse(storedPlayerNames) : [];
            if (!Array.isArray(playerNames)) playerNames = [];
            // Varmistetaan uniikkius ja aakkosjärjestys heti latauksessa
             playerNames = [...new Set(playerNames)].sort((a, b) => a.localeCompare(b, 'fi'));
        } catch (error) {
            console.error("Error loading 'klaskPlayerNames':", error); playerNames = [];
            displayError("Tallennustilan lukuvirhe (nimet).", 5000);
        }
    }

    function saveDataToLocalStorage() {
        try {
            localStorage.setItem('klaskGames', JSON.stringify(games));
            // Tallennetaan vain uniikit nimet varmuuden vuoksi
            localStorage.setItem('klaskPlayerNames', JSON.stringify([...new Set(playerNames)].sort((a, b) => a.localeCompare(b, 'fi'))));
        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            displayError("Tallennus epäonnistui! Selaimen muisti voi olla täynnä.", 5000);
            // Voi harkita tilanteen palauttamista, jos kriittistä
        }
    }

    // --- Apufunktiot ---
    function displayError(message, duration = 4000, target = errorMessageP) {
        target.textContent = message;
        setTimeout(() => { if (target.textContent === message) { target.textContent = ''; } }, duration);
    }
    function clearInputErrors() { formInputs.forEach(input => input.classList.remove('input-error')); }
    function setInputError(inputElement) { inputElement.classList.add('input-error'); }

    // --- Renderöintifunktiot ---

    function updateAllUI() {
        renderGames();
        renderStats();
        updatePlayerDatalist();
        renderPlayerManagementList();
    }

    function updatePlayerDatalist() {
        if (!playerDatalist) return;
        playerDatalist.innerHTML = '';
        playerNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            playerDatalist.appendChild(option);
        });
    }

    function renderGames() { /* Ennallaan edellisestä versiosta */
        gamesListDiv.innerHTML = '';
        if (games.length === 0) { gamesListDiv.innerHTML = '<p>Ei tallennettuja pelejä.</p>'; return; }
        const sortedGames = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedGames.forEach(game => {
            const gameDiv = document.createElement('div'); gameDiv.classList.add('game-entry');
            let winnerScore = -1, winnerName = '';
            game.players.forEach(p => { if (p.score > winnerScore) { winnerScore = p.score; winnerName = p.name; } });
            const potentialWinners = game.players.filter(p => p.score === winnerScore);
            const isClearWinner = potentialWinners.length === 1 && winnerScore === 6;
            let playersHtml = '';
            game.players.forEach(player => {
                const isWinnerClass = isClearWinner && player.name === winnerName ? 'winner' : '';
                playersHtml += `<span class="${isWinnerClass}"><span class="player-name">${player.name}</span>: <span class="player-score">${player.score}</span></span> `;
            });
            gameDiv.innerHTML = `<span class="game-date">${game.date}</span><span class="game-players">${playersHtml.trim()}</span>`;
            gamesListDiv.appendChild(gameDiv);
        });
    }

    function renderStats() { /* Päivitetty lisäämään piste-ero */
        statsDiv.innerHTML = '';
        if (games.length === 0) { statsDiv.innerHTML = '<p>Ei dataa statistiikkaa varten.</p>'; return; }
        const totalGames = games.length; const playerStats = {}; const h2hStats = {};
        function ensureH2hStructure(p1, p2) { /* ... */ if (!h2hStats[p1]) h2hStats[p1] = {}; if (!h2hStats[p2]) h2hStats[p2] = {}; if (!h2hStats[p1][p2]) h2hStats[p1][p2] = { wins: 0, losses: 0 }; if (!h2hStats[p2][p1]) h2hStats[p2][p1] = { wins: 0, losses: 0 }; }

        games.forEach(game => {
            if (!game.players || !Array.isArray(game.players)) return;
            let winnerName = '', loserName = '', winnerScore = -1;
            const scores = game.players.map(p => p.score); winnerScore = Math.max(...scores);
            const potentialWinners = game.players.filter(p => p.score === winnerScore);
            if (potentialWinners.length === 1 && winnerScore === 6) {
                winnerName = potentialWinners[0].name;
                if (game.players.length === 2) { const loser = game.players.find(p => p.name !== winnerName); if (loser) loserName = loser.name; }
            }
            game.players.forEach(player => {
                if (!player.name) return;
                if (!playerStats[player.name]) playerStats[player.name] = { wins: 0, gamesPlayed: 0, totalPoints: 0, totalDifference: 0, gamesForDiff: 0 }; // Lisätty difference-kentät
                playerStats[player.name].gamesPlayed++; playerStats[player.name].totalPoints += player.score;
                if (player.name === winnerName) playerStats[player.name].wins++;

                // Laske piste-ero (vain 2 pelaajan peleissä)
                if (game.players.length === 2) {
                    const opponent = game.players.find(p => p.name !== player.name);
                    if (opponent) {
                        playerStats[player.name].totalDifference += (player.score - opponent.score);
                        playerStats[player.name].gamesForDiff++;
                    }
                }
            });
            if (game.players.length === 2 && winnerName && loserName) { /* H2H ennallaan */
                 const p1 = game.players[0].name, p2 = game.players[1].name;
                 if (p1 && p2) { ensureH2hStructure(p1, p2); if (winnerName === p1) { h2hStats[p1][p2].wins++; h2hStats[p2][p1].losses++; } else { h2hStats[p2][p1].wins++; h2hStats[p1][p2].losses++; } }
            }
        });

        let statsHtml = `<p>Pelattuja pelejä yhteensä: ${totalGames}</p><h3>Pelaajatilastot</h3>`;
        const sortedPlayers = Object.entries(playerStats).sort(([, statsA], [, statsB]) => statsB.wins - statsA.wins);
        if (sortedPlayers.length > 0) {
            sortedPlayers.forEach(([name, stats]) => {
                const winPercentage = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) : 0;
                const avgPoints = stats.gamesPlayed > 0 ? (stats.totalPoints / stats.gamesPlayed).toFixed(2) : 0;
                // Laske keskimääräinen piste-ero
                const avgDifference = stats.gamesForDiff > 0 ? (stats.totalDifference / stats.gamesForDiff).toFixed(2) : 'N/A';
                const diffSign = parseFloat(avgDifference) > 0 ? '+' : ''; // Lisää '+' positiivisille eroille

                statsHtml += `<div class="stat-item"><span class="stat-label">${name}:</span><span class="stat-value">`
                           + `Voitot: ${stats.wins}/${stats.gamesPlayed} (${winPercentage}%) | `
                           + `Pisteet: ${stats.totalPoints} (Ø ${avgPoints}) | `
                           + `Piste-ero: ${avgDifference !== 'N/A' ? diffSign + avgDifference : 'N/A'}` // Näytä piste-ero
                           + `</span></div>`;
            });
        } else statsHtml += "<p>Ei pelaajadataa.</p>";

        statsHtml += `<h3>Keskinäiset ottelut (H2H)</h3>`; /* H2H ennallaan */
        const h2hEntries = Object.entries(h2hStats);
        if (h2hEntries.length > 0) {
            let h2hRendered = false;
            h2hEntries.forEach(([playerA, opponents]) => { Object.entries(opponents).forEach(([playerB, record]) => {
                if (playerA < playerB) { const recordBvsA = h2hStats[playerB]?.[playerA] || { wins: 0 }; statsHtml += `<div class="stat-item h2h-item"><span class="stat-label">${playerA} vs ${playerB}:</span><span class="stat-value">${record.wins} - ${recordBvsA.wins}</span></div>`; h2hRendered = true; } }); });
            if (!h2hRendered) statsHtml += "<p>Ei kahden pelaajan pelejä tilastoitavaksi.</p>";
        } else statsHtml += "<p>Ei dataa keskinäisistä otteluista.</p>";
        statsDiv.innerHTML = statsHtml;
    }

    // UUSI: Renderöi pelaajien hallintalista
    function renderPlayerManagementList() {
        playerManagementListDiv.innerHTML = ''; // Tyhjennä vanha lista
        if (playerNames.length === 0) {
            playerManagementListDiv.innerHTML = '<p>Ei pelaajia hallittavaksi.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('player-manage-list'); // Lisää luokka tyylittelyä varten

        playerNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Poista';
            deleteBtn.classList.add('button-danger', 'button-small'); // Tyyliluokat
            deleteBtn.dataset.playerName = name; // Tallenna nimi data-attribuuttiin

            deleteBtn.addEventListener('click', handleDeletePlayer); // Lisää tapahtumankäsittelijä

            li.appendChild(deleteBtn);
            ul.appendChild(li);
        });
        playerManagementListDiv.appendChild(ul);
    }


    // --- Tapahtumankäsittelijät ---

    // UUSI: Pelaajan poiston käsittelijä
    function handleDeletePlayer(event) {
        const playerNameToDelete = event.target.dataset.playerName;
        if (!playerNameToDelete) return;

        if (confirm(`Haluatko varmasti poistaa pelaajan "${playerNameToDelete}" ja kaikki hänen pelinsä? Tätä toimintoa ei voi kumota.`)) {
            // 1. Poista pelaaja nimilistasta
            playerNames = playerNames.filter(name => name !== playerNameToDelete);

            // 2. Poista kaikki pelit, joissa pelaaja oli mukana
            const initialGameCount = games.length;
            games = games.filter(game => !game.players.some(p => p.name === playerNameToDelete));
            const removedGameCount = initialGameCount - games.length;

            // 3. Tallenna muutokset
            saveDataToLocalStorage();

            // 4. Päivitä käyttöliittymä
            updateAllUI();

            displayError(`Pelaaja "${playerNameToDelete}" ja ${removedGameCount} peliä poistettu.`, 4000);
        }
    }

    // Pelin tallennus (hieman muokattu nimien lisäystä)
    saveGameBtn.addEventListener('click', () => {
        clearInputErrors(); errorMessageP.textContent = '';
        const date = gameDateInput.value; const p1Name = player1NameInput.value.trim();
        const p1ScoreStr = player1ScoreSelect.value; const p2Name = player2NameInput.value.trim();
        const p2ScoreStr = player2ScoreSelect.value;
        let isValid = true; let errorMsg = '';
        // Validointi (ennallaan) ...
        if (!date) { isValid = false; setInputError(gameDateInput); errorMsg = 'Valitse päivämäärä.'; }
        if (!p1Name) { isValid = false; setInputError(player1NameInput); errorMsg = errorMsg || 'Anna Pelaajan 1 nimi.'; }
        if (!p2Name) { isValid = false; setInputError(player2NameInput); errorMsg = errorMsg || 'Anna Pelaajan 2 nimi.'; }
        if (p1Name && p1Name === p2Name) { isValid = false; setInputError(player1NameInput); setInputError(player2NameInput); errorMsg = errorMsg || 'Pelaajien nimien tulee olla erilaiset.'; }
        const p1Score = parseInt(p1ScoreStr); const p2Score = parseInt(p2ScoreStr);
        if (isNaN(p1Score) || p1Score < 0 || p1Score > 6) { isValid = false; setInputError(player1ScoreSelect); errorMsg = errorMsg || 'Pelaajan 1 pisteet ovat virheelliset.'; }
        if (isNaN(p2Score) || p2Score < 0 || p2Score > 6) { isValid = false; setInputError(player2ScoreSelect); errorMsg = errorMsg || 'Pelaajan 2 pisteet ovat virheelliset.'; }
        if (!isNaN(p1Score) && !isNaN(p2Score)) { if (p1Score === 6 && p2Score === 6) { isValid = false; setInputError(player1ScoreSelect); setInputError(player2ScoreSelect); errorMsg = errorMsg || 'Vain toinen voi saada 6 pistettä.'; } else if (p1Score !== 6 && p2Score !== 6) { isValid = false; setInputError(player1ScoreSelect); setInputError(player2ScoreSelect); errorMsg = errorMsg || 'Ainakin toisen on saatava 6 pistettä.'; } }
        if (!isValid) { displayError(errorMsg || 'Tarkista tiedot.'); return; }

        // Lisää uudet nimet GLOBAALIIN listaan (tallennus hoidetaan saveData-funktiossa)
        let playerListChanged = false;
        if (!playerNames.includes(p1Name)) { playerNames.push(p1Name); playerListChanged = true; }
        if (!playerNames.includes(p2Name)) { playerNames.push(p2Name); playerListChanged = true; }
        if (playerListChanged) {
             playerNames.sort((a, b) => a.localeCompare(b, 'fi')); // Pidä lista järjestyksessä
        }

        // Luo ja tallenna peli
        const newGame = { date: date, players: [{ name: p1Name, score: p1Score }, { name: p2Name, score: p2Score }] };
        games.push(newGame);
        saveDataToLocalStorage(); // Tallenna sekä pelit että mahdollisesti muuttunut nimilista

        // Päivitä UI ja tyhjennä kentät
        updateAllUI(); // Tämä hoitaa kaikkien osioiden päivityksen
        player1NameInput.value = ''; player1ScoreSelect.value = '0';
        player2NameInput.value = ''; player2ScoreSelect.value = '0';
        player1NameInput.focus();
    });

    // UUSI: Datan vienti
    exportDataBtn.addEventListener('click', () => {
        if (games.length === 0 && playerNames.length === 0) {
            displayError("Ei dataa vietäväksi.", 3000);
            return;
        }

        const dataToExport = {
            version: 'klask-scoreboard-v1', // Lisätään versio tarkistusta varten
            timestamp: new Date().toISOString(),
            games: games,
            playerNames: playerNames
        };

        const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print JSON
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        // Luo tiedostonimi päivämäärällä
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        link.download = `klask_scoreboard_data_${timestamp}.json`;

        document.body.appendChild(link); // Tarvitaan joissain selaimissa
        link.click();

        document.body.removeChild(link); // Siivoa linkki
        URL.revokeObjectURL(url); // Vapauta muisti

        displayError("Data viety tiedostoon.", 3000, importStatusP);
    });

    // UUSI: Datan tuonti -napin klikkaus avaa tiedostovalitsimen
    importDataBtn.addEventListener('click', () => {
        importFileInput.click(); // Avaa piilotettu file input
    });

    // UUSI: Datan tuonti - tiedoston valinnan käsittely
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) { return; } // Ei tiedostoa valittu

        const reader = new FileReader();

        reader.onload = (e) => {
            let importedData;
            try {
                importedData = JSON.parse(e.target.result);

                // --- Validointi ---
                if (typeof importedData !== 'object' || importedData === null) throw new Error("Tiedosto ei sisällä validia JSON-objektia.");
                if (!importedData.version || !importedData.version.startsWith('klask-scoreboard')) {
                     console.warn("Tiedostosta puuttuu versiotieto tai se on tuntematon.");
                     // Voi silti yrittää tuoda, jos rakenne täsmää
                }
                 if (!Array.isArray(importedData.games)) throw new Error("JSON-datasta puuttuu 'games'-lista tai se ei ole lista.");
                 if (!Array.isArray(importedData.playerNames)) throw new Error("JSON-datasta puuttuu 'playerNames'-lista tai se ei ole lista.");
                 // Voit lisätä tarkempia tarkistuksia tarvittaessa (esim. pelien rakenne)

            } catch (error) {
                console.error("Error parsing imported file:", error);
                displayError(`Virhe tiedoston lukemisessa tai jäsentämisessä: ${error.message}`, 6000, importStatusP);
                importFileInput.value = null; // Nollaa input, jotta sama tiedosto voidaan yrittää uudelleen
                return;
            }

            // --- Varmistus ---
            if (confirm(`Haluatko varmasti korvata nykyiset ${games.length} peliä ja ${playerNames.length} pelaajaa tuoduilla tiedoilla? Tätä ei voi kumota.`)) {
                // --- Korvaa data ja tallenna ---
                games = importedData.games;
                // Varmistetaan tuotujen nimien uniikkius ja järjestys
                playerNames = [...new Set(importedData.playerNames)].sort((a, b) => a.localeCompare(b, 'fi'));
                saveDataToLocalStorage();

                // --- Päivitä UI ---
                updateAllUI();
                displayError(`Data tuotu onnistuneesti. ${games.length} peliä, ${playerNames.length} pelaajaa ladattu.`, 5000, importStatusP);
            } else {
                 displayError("Tuonti peruutettu.", 3000, importStatusP);
            }
             importFileInput.value = null; // Nollaa input joka tapauksessa
        };

        reader.onerror = (e) => {
             console.error("Error reading file:", e);
             displayError("Tiedoston lukuvirhe.", 5000, importStatusP);
             importFileInput.value = null;
        };

        reader.readAsText(file); // Aloita tiedoston luku
    });


    // --- Sovelluksen Käynnistys ---
    loadDataFromLocalStorage();
    updateAllUI();

}); // DOMContentLoaded end