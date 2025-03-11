## Blumaps Dev Setup

### Clone Repository
```bash
git clone https://github.com/BluNotions/blumap.git
```

Navigate to Project Directory
```bash
cd blumap
```

Install Dependencies
```bash
pip install -r requirements.txt
```

Apply Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

Run on Local Development Server
Server will run at http://localhost:8000
```bash
python manage.py runserver
```

Run Tests
```bash
python manage.py test
```