# klask-scoreboard

# Project Definition: Klask Scoreboard

## 1. Project Name

Klask Scoreboard (Version 2.2)

## 2. Objective

To provide an easy-to-use, browser-based tool for recording results and tracking statistics for the Klask board game. The application should have a modern look and feel, offer useful data about played games, and allow users to manage their data.

## 3. Target Users

Klask players who want to track their game history, player statistics, manage player entries, and backup/transfer their data.

## 4. Core Features

* **Game Recording:** Ability to input the game date, player names, and scores (currently for two players per game).
* **Player Name Input:** Text field input for player names with suggestions provided from a list of previously used names (using HTML datalist).
* **Score Input:** Dropdown selection for scores, ranging from 0 to 6.
* **Persistent Storage:** Game data and the list of unique player names are stored primarily in the browser's `localStorage` to persist between sessions on the same browser.
* **Game History Display:** A list of all recorded games, sorted chronologically (newest first). The winner is visually highlighted.
* **Statistics Calculation & Display:**
    * Total number of games played.
    * Per-player wins, games played, and win percentage.
    * Head-to-Head (H2H) records between players (for 2-player games).
    * Total points scored per player.
    * Average points scored per game per player.
    * **Average point difference** per player across their 2-player games.
* **Player Data Management:**
    * **Player Deletion:** Ability to delete a specific player entry and all associated game data (including games they participated in) via a dedicated management interface. Requires user confirmation.
* **Data Management:**
    * **Data Export:** Functionality to export all current game data and player names into a JSON file for backup or transfer.
    * **Data Import:** Functionality to import game data and player names from a previously exported JSON file, replacing the current data after user confirmation. Includes basic validation of the imported file structure.
* **User Interface:** Modern and clean interface using CSS (Flexbox layout, CSS variables).
* **Error Handling:** Input validation with clear error messages and visual highlighting of invalid fields. Confirmation prompts for destructive actions (deletion, import). Safe handling of `localStorage` operations and JSON parsing.

## 5. Technology Stack

* **HTML5:** Application structure and content.
* **CSS3:** Styling and layout (including CSS variables and Flexbox).
* **JavaScript (ES6+):** Application logic, data handling (including JSON parsing/stringifying), DOM manipulation, statistics calculation, interaction with `localStorage`, and file handling (Blob, FileReader) for export/import.
* **Data Format:** JSON for data export/import.

## 6. File Structure

klask-scoreboard/
├── index.html            # Main page (HTML structure)
├── style.css             # Stylesheet (appearance)
├── script.js             # Functionality (JavaScript logic)
├── PROJECT_DEFINITION.md # This file
└── (optional) images/
└── klask_logo.png    # Example logo file


## 7. Limitations

* **Primary Local Storage:** While data can be exported/imported, the primary working storage relies on the user's browser `localStorage`. Data is specific to the browser/device unless manually transferred via export/import.
* **Player Count:** The current UI and core game-saving logic primarily support only two players per game. Statistics like H2H and Point Difference are calculated based on 2-player games.
* **Import Validation:** Import validation checks the basic structure (presence of `games` and `playerNames` arrays) but doesn't deeply validate the integrity of every single game object within the imported file.

## 8. Future Enhancement Ideas

* Dynamic addition/removal of players *per game* during entry.
* Support for more than two players per game and adapting statistics accordingly.
* More advanced statistics (e.g., win streaks, tracking specific events like "Klask").
* Visualization of statistics (e.g., charts).
* User-specific themes or settings.
* More robust import validation.
* Cloud synchronization or backend integration (major architectural change).
