## What is Multitype-LLM-Chat?

- A basic POC for a RAG-based chatbot that can be used for a variety of purposes.
- This is an AI-powered tool made for researching, by augmenting GPT models with your own data.

- We recommend using a 'chat' instance within the app for a singular purpose. For example, you can use it to
  research a specific large legal document, but adding other documents will likely confuse the model and you are
  likely to get mixed results.

- The app is currently in development and is not ready for production use. One can use it locally by following the instructions below.

Structure:

### You can check the app architecture in the diagram located into /assets

<img width="1723" alt="Untitled" src="https://github.com/sebi75/multitype-llm-chat/assets/36008268/60dfd7c0-c21d-47a5-9196-e824b323539f">

https://github.com/sebi75/multitype-llm-chat/assets/36008268/c3de520c-9b11-468e-80a0-803a48f61d6d

![app-architecture drawio](https://github.com/sebi75/multitype-llm-chat/assets/36008268/e4c56f6b-d32e-4f4d-b4dc-497fc7868c48)

### How to start

## Initialize the database

- Create a new database in your local mysql server or use a remote one like PlanetScale
- Add DATABASE_URL in your .env file
- Initialize your new database with the schema:

```bash
pnpm run db:push
```

## Start the weaviate vector database via docker-compose

```bash
cd ./indexing-service
```

```bash
docker-compose up
```

## Initialize the indexing service

```
bash cd ../indexing-service
```

Create a new virtual environment and install the dependencies

```bash
python -m venv .venv
```

Activate the new virtual environment

```bash
source .venv/bin/activate
```

Install the dependencies from the requirements.txt file

```bash
pip install -r requirements.txt
```

Start the Flask API.

```bash
python main.py
```

## Initialize the web app

```bash
 cd web
```

```bash
 pnpm install
```

```bash
pnpm dev
```
