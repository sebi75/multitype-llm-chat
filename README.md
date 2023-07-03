Structure:

### You can check the app architecture in the diagram located into /assets

<img width="1723" alt="Untitled" src="https://github.com/sebi75/multitype-llm-chat/assets/36008268/60dfd7c0-c21d-47a5-9196-e824b323539f">


https://github.com/sebi75/multitype-llm-chat/assets/36008268/c3de520c-9b11-468e-80a0-803a48f61d6d

![app-architecture drawio](https://github.com/sebi75/multitype-llm-chat/assets/36008268/e4c56f6b-d32e-4f4d-b4dc-497fc7868c48)



### How to start

1. Clone this repo
2. cd web-ui
3. npm install
4. npm run dev
5. cd ..
6. cd indexing-service
7. python -m venv .venv
8. source .venv/bin/activate
9. pip install -r requirements.txt
10. cd ..
11. docker-compose up

Todo:

- Create Dockerfile for the ui so that the whole app can be orchestrated with the root docker-compose.yml
