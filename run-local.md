# Folder-by-folder launch order

## `ml-service`
1. Create/activate the Python virtual environment.
2. Install `requirements.txt`.
3. Run `python app/generate_dataset.py`.
4. Run `python train.py`.
5. Start FastAPI on port 8000.

## `server`
1. Start MongoDB.
2. Copy `.env.example` to `.env`.
3. Install Node dependencies.
4. Run `npm run seed` once.
5. Start the API on port 4000.

## `client`
1. Install Node dependencies.
2. Start Vite.
3. Open the printed local URL.

Keep the ML service, API, and client running in three terminals.
