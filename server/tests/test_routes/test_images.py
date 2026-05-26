import json
import asyncpg
import dotenv
import requests
import pytest
import os
import base64
from conftest import str, generate_token

dotenv.load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8765")

# Use a tiny 1x1 PNG embedded as base64 to avoid external network calls
image = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
)

@pytest.mark.order(80)
def test_upload_without_token():
    response = requests.post(
        f"{BACKEND_URL}/image/upload",
        files={"image": image},
    )
    assert response.status_code == 401
    assert response.json() == {"message": "Authentication is required"}

@pytest.mark.order(80)
def test_upload_empty_image():
    response = requests.post(
        f"{BACKEND_URL}/image/upload",
        files={"image": ''},
        headers={"authorization": "Bearer %s" % generate_token()},
    )
    assert response.status_code == 400
    assert response.json() == {"message": "The provided image is invalid"}

@pytest.mark.order(80)
def test_upload():
    response = requests.post(
        f"{BACKEND_URL}/image/upload",
        files={"image": image},
        headers={"authorization": "Bearer %s" % generate_token()},
    )
    assert response.status_code == 201
    assert response.json()['message'] == "Image uploaded successfully"

@pytest.mark.order(80)
def test_get_image():
    response = requests.post(
        f"{BACKEND_URL}/image/upload",
        files={"image": image},
        headers={"authorization": "Bearer %s" % generate_token()},
    )
    assert response.status_code == 201
    assert response.json()['message'] == "Image uploaded successfully"
    response = requests.get(f"{BACKEND_URL}/image/{response.json()['url']}")
    assert response.status_code == 200

@pytest.mark.order(80)
def test_get_image_invalid():
    response = requests.get(f"{BACKEND_URL}/image/gfdgdfgfdg")
    assert response.status_code == 404
