# Adaptado do pharm-mvp
FROM python:3.12-slim
WORKDIR /app
COPY ./app /app/app
COPY pyproject.toml /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/pyproject.toml
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
