# Shenanigames

A board game drafting web application built with Next.js and TypeScript.

## Overview

Shenanigames is a single-page web application that facilitates a turn-based drafting process where players select which board games they want to play and where. The application uses a visual, drag-and-drop system for player interactions.

## Features

- Turn-based drafting system
- Visual drag-and-drop interface
- Player management
- Game selection and table assignment
- Real-time state updates

## Core Concepts

- **Session**: A single instance of the drafting event
- **Player**: A participant in the session
- **Game**: A board game available for selection
- **Table**: A virtual space where one game can be played
- **Selection**: A player's action to either place a game on a table or join a game at a table
- **Turn**: A player's opportunity to perform one action (select or pass)
- **Drafting Round**: A full cycle through the current player turn order

## Project Structure

- `src/types`: TypeScript type definitions for core entities
- `src/store`: State management using zustand
- `src/components`: React components for the UI
- `src/app`: Next.js app router pages

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- TypeScript
- Zustand (State Management)
- Tailwind CSS