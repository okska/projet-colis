#Projet colis

Installation.
1. Cloner le projet. git clone git@github.com:okska/projet-colis.git
2. Copier {projet_root}/.example.env .env
3. Copier {projet_root}/front/.example.env .env
4. cd backend && pnpm db migrate
5. dans {projet_root} : docker compose up -d
6. Dans backend : pnpm run dev
7. Dans front : pnpm run dev