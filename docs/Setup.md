## Blumaps Dev Setup

### Clone Repository
```bash
git clone https://github.com/BluNotions/blumap.git
```

Navigate to Project Directory
```bash
cd blumap
```

### Environment Setup
1. Download the `.env` file from [Google Drive](https://drive.google.com/file/d/1B3n7fwCBBT-6f5ZreddaWYOQYyE5dUha/view?usp=drive_link)
2. Place the `.env` file in the root directory of the project

### Install and Configure
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