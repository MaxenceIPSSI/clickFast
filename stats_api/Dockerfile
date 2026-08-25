FROM python:3.12.14-alpine AS builder

RUN apk add --no-cache build-base postgresql-dev

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --no-compile --prefix=/install -r requirements.txt

FROM python:3.12.14-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apk add --no-cache libpq

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
