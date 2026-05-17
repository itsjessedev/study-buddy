# Study Buddy API

FastAPI backend for the Study Buddy Calc I readiness refresher.

## Setup

### 1. Create Virtual Environment

```bash
cd api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

For production Google login through Cloudflare Zero Trust, set:

```bash
CF_ACCESS_ENABLED=true
CF_ACCESS_TEAM_DOMAIN=https://your-team-name.cloudflareaccess.com
CF_ACCESS_AUDIENCE=your-cloudflare-access-application-aud-tag
CF_ACCESS_ALLOWED_EMAILS=jeldridge2583@gmail.com,jesse@junipr.io
CF_ACCESS_ACCOUNT_USERNAME=jesse
CF_ACCESS_ACCOUNT_FIRST_NAME=Jesse
```

When `CF_ACCESS_ENABLED=true`, password registration, password login, and token
refresh endpoints are disabled.

### 4. Set Up Database

```bash
# Install PostgreSQL if not already installed
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE study_buddy;
CREATE USER study_api WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE study_buddy TO study_api;
\q
```

### 5. Run Migrations

```bash
alembic upgrade head
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --port 8001
```

API will be available at: http://localhost:8001

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Testing

```bash
PYTHONPATH=. ./venv/bin/python -m unittest tests.test_answer_validation tests.test_cf_access
```

## Deployment

See main README.md for deployment instructions to VPS.
