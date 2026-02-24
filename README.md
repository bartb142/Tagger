# Tagger - Local Home Collection Manager

Tagger is a locally hosted web application to manage your home collections, items, and their metadata. It features a straightforward user interface for managing items, assigning tags, and uploading photos.

## Features

- **Item Management**: Add items with descriptions and manage them efficiently.
- **Tagging System**: Create customized tags with colors and easily assign them to items for categorization.
- **Photo Uploads**: Directly upload images of items.
- **Batch Uploads**: Upload multiple files at once to quickly create multiple items with shared tags and descriptions.
- **Local First**: Everything runs locally. SQLite is used for lightweight, file-based persistence.

## Tech Stack

- **Backend**: Python 3, [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: SQLite
- **Deployment**: Docker and Docker Compose

## Repository Structure

```
├── app/
│   ├── main.py        # FastAPI application and API routes
│   ├── database.py    # Database connection setup
│   ├── models.py      # SQLAlchemy ORM models (Item, Tag, Photo)
│   └── schemas.py     # Pydantic schemas for data validation
├── static/            # Frontend assets (HTML, CSS, JS)
├── data/              # SQLite database storage (mapped in Docker)
├── uploads/           # Uploaded images directory
├── Dockerfile         # Docker image configuration
├── docker-compose.yml # Docker compose configuration for running the app
└── requirements.txt   # Python dependencies
```

## How to Run Locally

The recommended way to run this application is using **Docker Compose**. Ensure you have Docker Installed on your system.

### 1. Start the Application

In your terminal, navigate to the root directory of this repository and run:

```bash
docker compose up
```

Alternatively, to run the application in detached mode (in the background):

```bash
docker compose up -d
```

### 2. Access the Application

Once the container is running and healthy, you can access the application in your browser at:

```
http://localhost:8000
```

### 3. Development Mode

The `docker-compose.yml` file defaults to mounting your local `app`, `static`, and `uploads` directories into the container. This means any code changes you make to the Python files, HTML, CSS, or JS will immediately reflect in the running container.

FastAPI (Uvicorn) is configured with reload enabled, so backend changes will trigger an automatic restart of the server application.

### 4. Stopping the Application

To stop the running application, press `Ctrl+C` in the terminal where it is running, or if running in detached mode, run:

```bash
docker compose down
```

*Note: Item and Tag data is persisted in a named Docker volume (`db_data`) so it will safely remain across restarts and shutdowns.*

## API Endpoints

The FastAPI backend provides several RESTful API endpoints, prefixed with `/api`. For complete documentation of the APIs provided, you can access the automatic interactive API documentation once the app is running:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
