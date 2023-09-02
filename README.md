## What is Multitype-LLM-Chat?

- This is an AI-powered tool made for researching, by augmenting GPT models with your own data.

- We recommend using a 'chat' instance within the app for a singular purpose. For example, you can use it to
  research a specific large legal document, but adding other documents will likely confuse the model and you are
  likely to get mixed results.

- The app is currently in development and is not ready for production use. One can use it locally by following the
  instructions below.

Structure:

### You can check the app architecture in the diagram located into /assets

<img width="1723" alt="Untitled" src="https://github.com/sebi75/multitype-llm-chat/assets/36008268/60dfd7c0-c21d-47a5-9196-e824b323539f">

https://github.com/sebi75/multitype-llm-chat/assets/36008268/c3de520c-9b11-468e-80a0-803a48f61d6d

![app-architecture drawio](https://github.com/sebi75/multitype-llm-chat/assets/36008268/e4c56f6b-d32e-4f4d-b4dc-497fc7868c48)

### How to start

## Run migrations

- Create a new database in your local mysql server or use a remote one like PlanetScale
- Add DATABASE_URL in your .env file
- Run migrations in ./web:

```bash
pnpnm migrate:dev
```

This will apply all the migrations found in ./web/prisma/migrations

1. `bash Clone this repo`
2. `bash cd web`
3. `bash npm install`
4. `bash npm run dev`
5. `bash cd ..`
6. `bash cd indexing-service`
7. `bash python -m venv .venv`
8. `bash source .venv/bin/activate`
9. `bash pip install -r requirements.txt`
10. `bash python main.py`

### Todo:

Add posibility to use the app locally without authentication
