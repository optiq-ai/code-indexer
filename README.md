# Code Indexer

Inteligentna biblioteka fragmentów kodu (Code Library) zbudowana na bazie mechanizmów LLM (Large Language Models), pozwalająca na przechowywanie, indeksowanie, dokładne opisywanie i efektywne wyszukiwanie semantyczne fragmentów kodu.

## Funkcjonalności

- **Ingest kodu**: Wprowadzanie fragmentów kodu (przez pliki lub bezpośrednio przez UI), automatyczny podział na fragmenty (chunkowanie)
- **Opis semantyczny i embeddingi**: Automatyczne generowanie opisów każdego fragmentu kodu przez LLM, generowanie embeddingów
- **Semantyczne wyszukiwanie**: Wyszukiwanie fragmentów kodu na podstawie znaczenia, nie tylko słów kluczowych
- **Zaawansowana manipulacja fragmentami**: Dzielenie i scalanie fragmentów kodu, tworzenie i zarządzanie szablonami
- **Obsługa fragmentów niekompletnych**: Detekcja i automatyczne "domykanie" fragmentów kodu za pomocą LLM
- **Asynchroniczne przetwarzanie**: Zadania asynchroniczne z Celery dla embeddingów, generowania opisów, przetwarzania fragmentów kodu

## Architektura

Projekt składa się z następujących komponentów:

- **Backend**: Python + FastAPI + Celery + Redis
- **Frontend**: React
- **Baza danych**: PostgreSQL z rozszerzeniem pgvector
- **Konteneryzacja**: Docker Compose

## Wymagania

- Docker i Docker Compose
- Klucz API OpenAI (do ustawienia w pliku .env)

## Uruchomienie

1. Sklonuj repozytorium:
   ```
   git clone <repository-url>
   cd code-indexer
   ```

2. Utwórz plik `.env` na podstawie `.env.example`:
   ```
   cp .env.example .env
   ```

3. Edytuj plik `.env` i dodaj swój klucz API OpenAI:
   ```
   OPENAI_API_KEY=<your-openai-key>
   ```

4. Uruchom aplikację za pomocą Docker Compose:
   ```
   docker-compose up --build
   ```

5. Otwórz aplikację w przeglądarce:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Dokumentacja API: http://localhost:8000/docs

## Struktura projektu

```
code-indexer/
├── docker-compose.yml    # Konfiguracja Docker Compose
├── .env.example          # Przykładowy plik zmiennych środowiskowych
├── init-db/              # Skrypty inicjalizacji bazy danych
│   └── init.sql          # Schemat bazy danych
├── backend/              # Kod backendu (FastAPI)
│   ├── Dockerfile        # Konfiguracja kontenera backendu
│   ├── requirements.txt  # Zależności Pythona
│   ├── celery_worker.py  # Konfiguracja Celery
│   ├── app/              # Kod aplikacji
│   │   ├── main.py       # Główny plik aplikacji FastAPI
│   │   ├── config.py     # Konfiguracja aplikacji
│   │   ├── ingest.py     # Logika ingestowania kodu
│   │   ├── models.py     # Modele danych
│   │   └── utils.py      # Funkcje pomocnicze
│   └── tests/            # Testy jednostkowe
└── frontend/             # Kod frontendu (React)
    ├── Dockerfile        # Konfiguracja kontenera frontendu
    ├── package.json      # Zależności Node.js
    ├── yarn.lock         # Lock file dla zależności
    └── src/              # Kod źródłowy React
        ├── App.js        # Główny komponent aplikacji
        └── components/   # Komponenty React
            ├── CodeIngestion.js        # Komponent do wprowadzania kodu
            ├── CodeSearch.js           # Komponent do wyszukiwania kodu
            ├── ChunkManipulation.js    # Komponent do manipulacji fragmentami
            └── TemplateManagement.js   # Komponent do zarządzania szablonami
```

## API Endpoints

### Ingest kodu
- `POST /ingest/` - Wprowadzanie kodu do systemu

### Wyszukiwanie
- `GET /search/?query=...` - Semantyczne wyszukiwanie fragmentów kodu

### Manipulacja fragmentami
- `POST /chunks/split/` - Dzielenie fragmentu kodu na mniejsze części
- `POST /chunks/merge/` - Łączenie fragmentów kodu
- `POST /chunks/complete/` - Uzupełnianie niekompletnych fragmentów kodu

### Zarządzanie szablonami
- `GET /templates/` - Pobieranie listy szablonów
- `POST /templates/` - Tworzenie nowego szablonu
- `GET /templates/{template_id}` - Pobieranie szczegółów szablonu
- `POST /templates/{template_id}/apply/` - Zastosowanie szablonu

### Status zadań
- `GET /status/{task_id}` - Sprawdzanie statusu zadania asynchronicznego

## Portainer

Projekt jest kompatybilny z Portainer. Aby uruchomić aplikację w Portainer:

1. Zaimportuj plik `docker-compose.yml` do Portainer
2. Ustaw zmienne środowiskowe (w tym `OPENAI_API_KEY`)
3. Uruchom stack

## Rozwój projektu

Projekt można rozwijać w następujących kierunkach:

1. Dodanie systemu oceniania jakości fragmentów kodu
2. Integracja z GitHub/GitLab
3. Rozbudowane tagowanie i filtrowanie
4. Ulepszona obsługa wielu języków programowania
5. Mechanizm rekomendacji fragmentów kodu
6. Bezpieczeństwo danych i zgodność z RODO

## Licencja

[MIT License](LICENSE)
