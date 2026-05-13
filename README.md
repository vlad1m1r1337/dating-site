Запуск бэка

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py

swagger - http://localhost:8765/docs

Убрать локальную базу при сдаче -  Корневой .env при запуске из server/ (иначе не находится postgresql://...@localhost:5433)