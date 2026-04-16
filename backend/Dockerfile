# Adaptado do pharm-mvp
FROM python:3.12-slim
WORKDIR /app

COPY pyproject.toml /app/
COPY ./app /app/app


RUN pip install --upgrade pip \
	&& pip install --no-cache-dir poetry \
	&& poetry config virtualenvs.create false \
	&& poetry install --no-interaction --no-ansi --no-root

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
