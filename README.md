# Django ML Prediction API – Student Performance

This project implements a Django REST API for predicting student performance using machine learning.

## Features

- Django REST Framework API
- PostgreSQL database (via Docker)
- Machine Learning model (Random Forest Regressor)
- Prediction endpoint for student performance

## Setup Instructions

### 1. Start PostgreSQL Database with Docker

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following credentials:
- Database: `student_ml_db`
- User: `student_ml_user`
- Password: `student_ml_password`
- Port: `5432`

### 2. Create Virtual Environment and Install Dependencies

**Important:** This project works best with **Python 3.11 or 3.12**. Python 3.14 may have compatibility issues with some packages.

```bash
# If using Python 3.11 or 3.12 (recommended):
py -3.11 -m venv venv
# OR
py -3.12 -m venv venv

# If you only have Python 3.14, you can try:
py -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
# For Python 3.11/3.12 (recommended):
pip install -r requirements.txt

# If you're using Python 3.11 specifically and have issues:
# pip install -r requirements-py311.txt
```

**Note:** If you encounter build errors with pandas on Python 3.14, it's recommended to use Python 3.11 or 3.12 instead, as they have better package compatibility and pre-built wheels available.

### 3. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Load Dataset into Database

```bash
python manage.py shell
```

Then in the shell:
```python
from performance.load_data import run
run()
```

### 5. Train the ML Model

In the Django shell:
```python
from performance.train_model import train
train()
```

Or run directly:
```bash
python manage.py shell -c "from performance.train_model import train; train()"
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

The application will be available at:
- **Frontend UI**: `http://localhost:8000/`
- **API Endpoint**: `http://localhost:8000/api/predict/`

## Usage

### Web Interface

Simply open `http://localhost:8000/` in your browser and use the interactive form to:
1. Enter student details (hours studied, previous scores, etc.)
2. Click "Predict Performance"
3. View the predicted performance index with a visual progress bar

### API Usage

**POST** `/api/predict/`

**Request Body:**
```json
{
    "hours_studied": 6,
    "previous_scores": 78,
    "extracurricular": true,
    "sleep_hours": 7,
    "sample_papers": 3
}
```

**Response:**
```json
{
    "predicted_performance_index": 72.45
}
```

## Project Structure

```
Django-ml/
├── student_ml/          # Django project settings
├── performance/         # Django app
│   ├── models.py       # StudentPerformance model
│   ├── views.py        # Prediction API view & frontend view
│   ├── serializers.py  # DRF serializers
│   ├── urls.py         # App URLs
│   ├── load_data.py    # Script to load dataset
│   └── train_model.py  # Script to train ML model
├── templates/          # HTML templates
│   └── frontend/       # Frontend HTML
├── frontend/           # Frontend static files
│   ├── styles.css     # CSS styling
│   └── script.js      # JavaScript for API calls
├── dataset.csv         # Student performance dataset
├── docker-compose.yml  # Docker configuration for PostgreSQL
└── requirements.txt    # Python dependencies
```

## Notes

- The ML model uses Random Forest Regressor with 200 estimators
- The model is saved as `performance/model.pkl`
- Database uses PostgreSQL via Docker container
- Make sure Docker is running before starting the database
