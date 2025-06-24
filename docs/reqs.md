Contextual Document for AI-Powered Development (Claude 3.7)
Project Title: Shenanigames - A Board Game Drafting Web App

# Project Overview:
The goal is to create a simple, single-page web application using Next.js for a group of players to coordinate a board game night. The application will facilitate a turn-based drafting process where players select which games they want to play and where. The primary user interface will be a visual, drag-and-drop system. The final output should be a publicly deployable application on a platform like Vercel.

# 1. Core Concepts & Terminology
- Session: A single instance of the drafting event. It contains all players, games, and tables.
- Player: A participant in the session.
- Game: A board game available for selection.
- Table: A virtual space where one game can be played. A table can be empty or have a game assigned to it.
- Selection: A player's action to either place a game on a table or join a game at a table. Each player is limited to a single selection per Drafting Round.
- Turn: A player's opportunity to perform one action (select or pass).
- Drafting Round: A full cycle through the current player turn order (e.g., if there are 5 players, a round consists of 5 turns). The turn order rotates after each round.

# 2. Core Entities & Data Models
Please define the data structures for the application state. A good starting point would be:

## Player
- id: string (unique identifier, e.g., uuid())
- name: string
- picks: Game[] (An array of Games the player has preselected as the games they want to play)

## Game
- id: string (unique identifier)
- title: string (e.g., "Catan", "Wingspan")
- maxPlayers: number
- link: string (optional, link to BoardGameGeek or similar)
- image: string (optional, URL to an image of the game)

## Table
- id: string (unique identifier, e.g., "table-1")
- gameId: string | null (The id of the game placed here, null if empty)
- seatedPlayerIds: string[] (An array of ids of players seated here)

## SessionState (The main state object for the application)
- players: Player[]
- availableGames: Game[]
- tables: Table[]
- turnOrder: string[] (An ordered array of Player ids)
- currentPlayerTurnIndex: number (The index in turnOrder indicating whose turn it is)
- consecutivePasses: number (Counts how many players have passed in a row)
- draftingComplete: boolean (Set to true when the draft ends)

# 3. Functional Requirements (The Rules Engine)

## 3.1. Session Setup
The application should have a simple setup screen or a pre-configured state.

### Inputs:
- A list of player names.
- A list of available games (with their max player counts).
- The number of tables available for the session.
- On start, the system generates the initial SessionState. The turnOrder is initialized with the player IDs in the provided order. 
 
## 3.2. Turn-Based Drafting Logic
### Turn Progression
The system highlights the current player whose turn it is based on currentPlayerTurnIndex and turnOrder.

### Player Actions
On their turn, a player can perform one of the following actions.

#### Action A: Place a Game:
The player drags a Game from the "Available Games" list and drops it onto an empty Table.
Result:
The Table's gameId is set to the dropped Game's id.
The player who performed the action is automatically seated at that table (their id is added to seatedPlayerIds).
The player's selectionsMade count is incremented by 1.
The Game is removed from the "Available Games" list.

#### Action B: Join a Game:
The player drags their own Player icon/token and drops it onto a Table that already has a game and is not yet full (i.e., seatedPlayerIds.length < game.maxPlayers).
Result:
The player's id is added to the Table's seatedPlayerIds.

#### Action C: Pass:
The player clicks a "Pass" button.
No state changes occur other than turn progression.
The consecutivePasses counter is incremented.

#### Action Constraints:
- A player with selectionsMade equal to 2 can only join a game or pass their turn. The place a game action should be disabled for them.
- A player cannot join a table where they are already seated.
- A player cannot join a full table.
- A game cannot be placed on a table that already has a game.

#### End of Turn:
After a valid action (Place, Join, or Pass), the currentPlayerTurnIndex advances to the next player in the turnOrder.
If an action other than "Pass" was taken, consecutivePasses is reset to 0.

#### End of Round & Turn Order Rotation:
When the turn progression wraps around (i.e., currentPlayerTurnIndex goes from the last player back to the first), a "Drafting Round" is complete.
The turnOrder array is then rotated: the first player (turnOrder[0]) is moved to the end of the array. The currentPlayerTurnIndex is reset to 0.

#### End of Drafting Phase:
The entire drafting phase concludes when a full round of passing occurs.
Condition: The draft ends if consecutivePasses becomes equal to the total number of players in the session.
When this happens, set draftingComplete to true. The UI should now be locked from further changes.

# 4.UI/UX Requirements
   The interface should be clean, intuitive, and centered around a main "board" view.

## Main View Components:
- Available Games List: A sidebar or section displaying the list of Game objects that have not yet been placed. Each item should be draggable.
- Player Info & Turn Order: A section that lists all players. It must clearly indicate:
  - The full turnOrder. 
  - Whose turn it currently is (e.g., highlighting). 
  - The number of selections each player has made (player.selectionsMade). 
  - Player "tokens" or names that can be dragged to join a table.
- Tables Area: The main content area displaying all the Tables.
  - An empty table should be a clear, designated drop zone for games. 
  - A table with a game should display the game's title and a list/avatars of the players seated there. It should also act as a drop zone for players who wish to join.
- Action Button: A clearly visible "Pass Turn" button, which should be the primary action button for the current player.

## Drag and Drop (D&D) Interactivity:
- Visual Feedback: When a player starts dragging an item (a game or a player token), the UI should provide feedback.
  - Valid drop zones (e.g., an empty table for a game, a non-full table for a player) should be highlighted.
  - Invalid drop zones should be visually indicated (e.g., grayed out, red border).
- The D&D logic must enforce all constraints defined in the functional requirements.

# 5. Recommended Technical Stack
- Framework: Next.js (using the App Router).
- Language: TypeScript.
- State Management: zustand or React Context with useReducer for managing the global SessionState.
- Drag and Drop Library: dnd-kit is highly recommended for its features and compatibility with React.
- Styling: Tailwind CSS for rapid and consistent styling.
- Deployment: Vercel.