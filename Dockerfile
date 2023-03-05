# Build the React client
FROM node:14 AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build the Flask server
FROM python:3.10 AS server-builder
WORKDIR /app/server
COPY flask-server/requirements.txt ./
RUN pip install -r requirements.txt
COPY flask-server/ ./

# Combine the client and server into one image
FROM python:3.10
WORKDIR /app
COPY --from=client-builder /app/client/build/ ./client/build/
COPY --from=server-builder /app/server/ ./
EXPOSE 5000
CMD ["python", "server.py"]
