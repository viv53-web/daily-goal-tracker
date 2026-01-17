# Project: Daily Goal Tracker

## Project Overview

This is a simple, single-page web application for tracking daily goals. It allows users to add, edit, delete, and mark goals as complete. The application uses a Supabase backend to store goal data, with a serverless function acting as a REST API. The frontend is built with vanilla JavaScript, HTML, and CSS, and the entire application is designed to be deployed on Netlify.

### Key Technologies

*   **Frontend:** HTML, CSS, Vanilla JavaScript
*   **Backend:** Node.js (for the serverless function)
*   **Database:** Supabase
*   **Deployment:** Netlify

### Architecture

*   **Frontend:** A single `index.html` file contains the application's structure, styling, and logic. It communicates with the backend via asynchronous JavaScript (fetch API).
*   **Backend:** A single serverless function (`netlify/functions/goals.js`) provides a RESTful API for CRUD (Create, Read, Update, Delete) operations on goals.
*   **Database:** A Supabase instance is used to persist the `goals` data. The connection details for the Supabase instance are stored as environment variables.

## Building and Running

### Prerequisites

*   Node.js and npm
*   Netlify CLI (`npm install -g netlify-cli`)
*   A Supabase account with a `goals` table.

### Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Supabase URL and anonymous key:
    ```
    SUPABASE_URL=your-supabase-url
    SUPABASE_ANON_KEY=your-supabase-anon-key
    ```
3.  **Run the development server:**
    ```bash
    netlify dev
    ```
    This will start a local server, and you can access the application at `http://localhost:8888`.

## Development Conventions

### Coding Style

*   The JavaScript code is written in a functional style, with a clear separation of concerns between DOM manipulation, API calls, and state management.
*   The code is well-commented and easy to understand.

### Testing

*   There are no automated tests in this project.
*   **TODO:** Add a testing framework (e.g., Jest, Vitest) and write unit tests for the serverless function and frontend logic.
