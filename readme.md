# Full-Stack TanStack, Hono, and PostgreSQL Project

This project is a full-stack application featuring a React frontend built with TanStack Start, a Hono backend, and a PostgreSQL database running in Docker.

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Docker](https://www.docker.com/get-started) and Docker Compose
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [pnpm](https://pnpm.io/installation)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```
    You can modify the values in `.env` if needed, but the defaults should work with the Docker setup.

3.  **Build and start the services:**
    This command will build the custom Docker image for PostgreSQL, start the database and pgAdmin containers, and apply all database migrations.
    ```bash
    docker compose up -d --build
    ```

4.  **Install backend dependencies:**
    ```bash
    cd backend
    pnpm install
    cd ..
    ```

5.  **Install frontend dependencies:**
    ```bash
    cd front
    pnpm install
    cd ..
    ```

## Running the Application

You need to run the backend and frontend in separate terminals.

1.  **Run the backend:**
    ```bash
    cd backend
    pnpm run dev
    ```
    The Hono backend will be running at `http://localhost:3000`.

2.  **Run the frontend:**
    ```bash
    cd front
    pnpm run dev
    ```
    The TanStack Start frontend will be running at `http://localhost:3001`.

## Database Management

-   **pgAdmin:** A pgAdmin instance is included in the Docker Compose setup. You can access it at `http://localhost:8080`.
    -   **Login:** `oksk@oksk.fr`
    -   **Password:** `oksk`
-   **Connecting to the database from pgAdmin:**
    -   **Host:** `db`
    -   **Port:** `5432`
    -   **User:** `user`
    -   **Password:** `password`
    -   **Database:** `mydatabase`

---

## Development Log (Original Instructions)




Instructions : 
Pour chaque instruction, si un tutoriel est indiqué, suis le et dis ce que tu fais precisement.
Prompte moi pour passer d'un element a un autre.
Ne lance jamais de docker compose ou npm run dev/start directement dans ta console. Quand tu dois faire une de ces operations, donne moi la requete mais ne l'execute jamais.


Elements a gerer : 

1 : .env : ajoute un .env avec les identifiants dont tu aura besoin.

2: Base de données : Postgre sous docker.
Fais un docker-compose.yml. et lance le docker.
Ajoute un dossier migration. 

3: BACKEND : Hono
Dossier : Backend
Here is the tutorial : 
https://hono.dev/docs/getting-started/basic
Suis le tutoriel d'install hono.




4: FRONTEND : tanstack
Dossier : Front
tutoriel tanstack : 
Suis les instructions pour le tutoriel frontend. 
Voici le lien : https://tanstack.com/start/latest/docs/framework/react/quick-start
Utilise le github simple + auth.

5 : Une fois les instructions suivies, connecte le frontend avec le backend, et avec la base de données.
