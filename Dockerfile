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
RUN pip install flask
RUN pip install -r requirements.txt
COPY flask-server/ ./

# Create a cache directory and update the cache path
RUN mkdir /app/cache
ENV F1_CACHE_PATH=/app/cache

# Combine the client and server into one image
FROM python:3.10
WORKDIR /app
COPY --from=client-builder /app/client/build/ ./client/build/
COPY --from=server-builder /app/server/ ./
RUN pip install flask
RUN pip install fastf1
RUN pip install flask_caching
EXPOSE 5000
# Set the F1_CACHE_PATH environment variable
ENV F1_CACHE_PATH=/app/cache
# Create the cache directory
RUN mkdir -p $F1_CACHE_PATH
CMD ["python", "server.py"]
