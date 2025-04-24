import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Tłumaczenia
const resources = {
  pl: {
    translation: {
      // Ogólne
      "appTitle": "Indeksator Kodu",
      "appDescription": "Przechowuj, indeksuj, opisuj i semantycznie wyszukuj fragmenty kodu. Dziel, łącz i twórz inteligentne, konfigurowalne szablony. Generuj nowe fragmenty kodu lub uzupełniaj niedokończone za pomocą LLM.",
      "loading": "Ładowanie...",
      "error": "Błąd",
      "success": "Sukces",
      "cancel": "Anuluj",
      "save": "Zapisz",
      "delete": "Usuń",
      "edit": "Edytuj",
      "create": "Utwórz",
      "search": "Szukaj",
      "submit": "Wyślij",
      "reset": "Resetuj",
      "close": "Zamknij",
      "open": "Otwórz",
      "view": "Zobacz",
      "copy": "Kopiuj",
      
      // Nawigacja
      "codeIngestion": "Dodawanie Kodu",
      "codeSearch": "Wyszukiwanie Kodu",
      "chunkManipulation": "Zarządzanie Fragmentami",
      "templateManagement": "Zarządzanie Szablonami",
      
      // Dodawanie kodu
      "codeIngestionTitle": "Dodaj kod do indeksowania",
      "codeContent": "Zawartość kodu",
      "codeLanguage": "Język programowania",
      "uploadCode": "Prześlij kod",
      "processingCode": "Przetwarzanie kodu...",
      "codeProcessed": "Kod został pomyślnie przetworzony",
      "codeProcessingFailed": "Przetwarzanie kodu nie powiodło się",
      "enterCodeHere": "Wprowadź kod tutaj...",
      "selectLanguage": "Wybierz język",
      "processedChunks": "Przetworzone fragmenty kodu",
      "nameOptional": "Nazwa (opcjonalnie)",
      "nameHelperText": "Nazwa dla tego fragmentu kodu",
      "languageOptional": "Język (opcjonalnie)",
      "autoDetect": "Automatyczne wykrywanie",
      "languageHelperText": "Język programowania kodu (zostanie wykryty automatycznie, jeśli nie zostanie określony)",
      "maxTokensPerChunk": "Maksymalna liczba tokenów na fragment: {{maxTokens}}",
      "maxTokensHelperText": "Maksymalna liczba tokenów na fragment podczas dzielenia kodu",
      "overlap": "Nakładanie się: {{overlap}}",
      "overlapHelperText": "Liczba nakładających się tokenów między fragmentami",
      "codeInput": "Wprowadzanie kodu",
      "or": "Lub",
      "uploadFile": "Prześlij plik",
      "selectedFile": "Wybrany plik: {{fileName}}",
      "processCode": "Przetwórz kod",
      "processedCodeFragments": "Przetworzone fragmenty kodu ({{count}})",
      "incomplete": "Niekompletny",
      "hideCode": "Ukryj kod",
      "showCode": "Pokaż kod",
      "copyCode": "Kopiuj kod",
      
      // Wyszukiwanie kodu
      "searchCodeTitle": "Wyszukaj fragmenty kodu",
      "searchQuery": "Zapytanie wyszukiwania",
      "searchResults": "Wyniki wyszukiwania",
      "noResultsFound": "Nie znaleziono wyników",
      "enterSearchQuery": "Wprowadź zapytanie wyszukiwania...",
      "searchBySemantics": "Wyszukiwanie semantyczne",
      "searchById": "Wyszukiwanie po ID",
      "allLanguages": "Wszystkie języki",
      "resultsLimit": "Limit wyników",
      "deselect": "Odznacz",
      "select": "Wybierz",
      "noSearchResultsYet": "Brak wyników wyszukiwania. Spróbuj wyszukać fragmenty kodu.",
      
      // Zarządzanie fragmentami
      "chunkManipulationTitle": "Zarządzaj fragmentami kodu",
      "chunkId": "ID fragmentu",
      "chunkContent": "Zawartość fragmentu",
      "updateChunk": "Aktualizuj fragment",
      "deleteChunk": "Usuń fragment",
      "chunkUpdated": "Fragment został zaktualizowany",
      "chunkDeleted": "Fragment został usunięty",
      
      // Zarządzanie szablonami
      "templateManagementTitle": "Zarządzaj szablonami",
      "templateName": "Nazwa szablonu",
      "templateContent": "Zawartość szablonu",
      "createTemplate": "Utwórz szablon",
      "updateTemplate": "Aktualizuj szablon",
      "deleteTemplate": "Usuń szablon",
      "templateCreated": "Szablon został utworzony",
      "templateUpdated": "Szablon został zaktualizowany",
      "templateDeleted": "Szablon został usunięty",
      "enterTemplateName": "Wprowadź nazwę szablonu...",
      "enterTemplateContent": "Wprowadź zawartość szablonu...",
      
      // Status zadań
      "taskStatus": "Status zadań",
      "taskId": "ID zadania",
      "taskType": "Typ zadania",
      "taskProgress": "Postęp",
      "taskCompleted": "Zakończone",
      "taskFailed": "Nieudane",
      "taskPending": "Oczekujące",
      "taskInProgress": "W trakcie",
      "noActiveTasks": "Brak aktywnych zadań",
      "viewTaskDetails": "Zobacz szczegóły zadania",
      
      // Analiza kodu
      "codeAnalysis": "Analiza kodu",
      "analyzeCode": "Analizuj kod",
      "codeMetrics": "Metryki kodu",
      "codeComplexity": "Złożoność",
      "codeDuplication": "Duplikacja",
      "codeQuality": "Jakość kodu",
      "suggestions": "Sugestie",
      
      // Eksport
      "export": "Eksportuj",
      "exportToJson": "Eksportuj do JSON",
      "exportToCsv": "Eksportuj do CSV",
      "exportToExcel": "Eksportuj do Excel",
      "exportToPdf": "Eksportuj do PDF",
      
      // Powiadomienia
      "notification": "Powiadomienie",
      "warning": "Ostrzeżenie",
      "info": "Informacja",
      "provideCodeOrFile": "Proszę podać kod lub przesłać plik",
      "codeSubmittedForProcessing": "Kod został przesłany do przetworzenia",
      "failedToProcessCode": "Nie udało się przetworzyć kodu",
      "codeProcessedSuccessfully": "Kod został pomyślnie przetworzony",
      "loadedProcessedFragments": "Załadowano {{count}} przetworzonych fragmentów kodu",
      "failedToFetchChunks": "Nie udało się pobrać przetworzonych fragmentów",
      "codeCopiedToClipboard": "Kod został skopiowany do schowka",
      "pleaseEnterSearchQuery": "Proszę wprowadzić zapytanie wyszukiwania",
      "foundResults": "Znaleziono {{count}} wyników",
      "failedToSearchCode": "Nie udało się wyszukać kodu",
      "processingFailed": "Przetwarzanie nie powiodło się",
      "errorCheckingTaskStatus": "Błąd podczas sprawdzania statusu zadania",
      "codeSnippet": "Fragment kodu",
      
      // Błędy
      "errorOccurred": "Wystąpił błąd",
      "tryAgain": "Spróbuj ponownie",
      "connectionError": "Błąd połączenia",
      "serverError": "Błąd serwera",
      "clientError": "Błąd klienta",
      "validationError": "Błąd walidacji",
      
      // Potwierdzenia
      "confirmAction": "Potwierdź akcję",
      "areYouSure": "Czy na pewno?",
      "thisActionCannotBeUndone": "Tej akcji nie można cofnąć",
      "yes": "Tak",
      "no": "Nie",
      
      // Nowe funkcjonalności - Analiza kodu
      "codeAnalysisTitle": "Analiza kodu",
      "analyzeSelectedCode": "Analizuj wybrany kod",
      "codeQualityScore": "Ocena jakości kodu",
      "codeComplexityScore": "Ocena złożoności",
      "potentialIssues": "Potencjalne problemy",
      "improvementSuggestions": "Sugestie ulepszeń",
      "bestPractices": "Najlepsze praktyki",
      "securityIssues": "Problemy bezpieczeństwa",
      "performanceIssues": "Problemy wydajności",
      "maintainabilityIssues": "Problemy z utrzymaniem",
      "analyzingCode": "Analizowanie kodu...",
      "analysisComplete": "Analiza zakończona",
      "noIssuesFound": "Nie znaleziono problemów",
      "issuesFound": "Znaleziono problemy",
      
      // Nowe funkcjonalności - Manipulacja fragmentami
      "mergeChunks": "Połącz fragmenty",
      "splitChunk": "Podziel fragment",
      "generateCompletion": "Wygeneruj uzupełnienie",
      "generateDescription": "Wygeneruj opis",
      "chunksMerged": "Fragmenty zostały połączone",
      "chunkSplit": "Fragment został podzielony",
      "completionGenerated": "Uzupełnienie zostało wygenerowane",
      "descriptionGenerated": "Opis został wygenerowany",
      "selectChunksToMerge": "Wybierz fragmenty do połączenia",
      "selectChunkToSplit": "Wybierz fragment do podziału",
      "enterSplitPoint": "Wprowadź punkt podziału",
      "enterCompletionPrompt": "Wprowadź podpowiedź dla uzupełnienia",
      
      // Nowe funkcjonalności - Eksport
      "exportTitle": "Eksportuj dane",
      "exportFormat": "Format eksportu",
      "exportOptions": "Opcje eksportu",
      "includeMetadata": "Dołącz metadane",
      "includeAnalysis": "Dołącz analizę",
      "exportSelected": "Eksportuj wybrane",
      "exportAll": "Eksportuj wszystko",
      "exportSuccessful": "Eksport zakończony powodzeniem",
      "downloadExport": "Pobierz wyeksportowane dane",
      "preparingExport": "Przygotowywanie eksportu...",
      
      // Nowe funkcjonalności - Kategoryzacja i tagowanie
      "tagsAndCategories": "Tagi i kategorie",
      "addTag": "Dodaj tag",
      "removeTag": "Usuń tag",
      "createCategory": "Utwórz kategorię",
      "assignToCategory": "Przypisz do kategorii",
      "removeFromCategory": "Usuń z kategorii",
      "tagAdded": "Tag został dodany",
      "tagRemoved": "Tag został usunięty",
      "categoryCreated": "Kategoria została utworzona",
      "assignedToCategory": "Przypisano do kategorii",
      "removedFromCategory": "Usunięto z kategorii",
      "enterTagName": "Wprowadź nazwę tagu",
      "enterCategoryName": "Wprowadź nazwę kategorii",
      "selectCategory": "Wybierz kategorię",
      "manageTags": "Zarządzaj tagami",
      "manageCategories": "Zarządzaj kategoriami",
      
      // Nowe funkcjonalności - Zaznaczanie tekstu
      "copySelectedText": "Kopiuj zaznaczony tekst",
      "selectedTextCopied": "Zaznaczony tekst został skopiowany do schowka",
      "noTextSelected": "Nie zaznaczono żadnego tekstu",
      "selectionCleared": "Wybór został wyczyszczony"
    }
  },
  en: {
    translation: {
      // General
      "appTitle": "Code Indexer",
      "appDescription": "Store, index, describe, and semantically search code fragments. Split, merge, and create intelligent, configurable templates. Generate new code fragments or complete unfinished ones using LLM.",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "search": "Search",
      "submit": "Submit",
      "reset": "Reset",
      "close": "Close",
      "open": "Open",
      "view": "View",
      "copy": "Copy",
      
      // Navigation
      "codeIngestion": "Code Ingestion",
      "codeSearch": "Code Search",
      "chunkManipulation": "Chunk Manipulation",
      "templateManagement": "Template Management",
      
      // Code Ingestion
      "codeIngestionTitle": "Add code for indexing",
      "codeContent": "Code content",
      "codeLanguage": "Programming language",
      "uploadCode": "Upload code",
      "processingCode": "Processing code...",
      "codeProcessed": "Code has been successfully processed",
      "codeProcessingFailed": "Code processing failed",
      "enterCodeHere": "Enter code here...",
      "selectLanguage": "Select language",
      "processedChunks": "Processed code chunks",
      "nameOptional": "Name (Optional)",
      "nameHelperText": "A name for this code snippet",
      "languageOptional": "Language (Optional)",
      "autoDetect": "Auto-detect",
      "languageHelperText": "Programming language of the code (will be auto-detected if not specified)",
      "maxTokensPerChunk": "Max Tokens per Chunk: {{maxTokens}}",
      "maxTokensHelperText": "Maximum number of tokens per chunk when splitting code",
      "overlap": "Overlap: {{overlap}}",
      "overlapHelperText": "Number of overlapping tokens between chunks",
      "codeInput": "Code Input",
      "or": "Or",
      "uploadFile": "Upload File",
      "selectedFile": "Selected file: {{fileName}}",
      "processCode": "Process Code",
      "processedCodeFragments": "Processed Code Fragments ({{count}})",
      "incomplete": "Incomplete",
      "hideCode": "Hide Code",
      "showCode": "Show Code",
      "copyCode": "Copy Code",
      
      // Code Search
      "searchCodeTitle": "Search code chunks",
      "searchQuery": "Search query",
      "searchResults": "Search results",
      "noResultsFound": "No results found",
      "enterSearchQuery": "Enter search query...",
      "searchBySemantics": "Semantic search",
      "searchById": "Search by ID",
      "allLanguages": "All Languages",
      "resultsLimit": "Results Limit",
      "deselect": "Deselect",
      "select": "Select",
      "noSearchResultsYet": "No search results yet. Try searching for code snippets.",
      
      // Chunk Manipulation
      "chunkManipulationTitle": "Manage code chunks",
      "chunkId": "Chunk ID",
      "chunkContent": "Chunk content",
      "updateChunk": "Update chunk",
      "deleteChunk": "Delete chunk",
      "chunkUpdated": "Chunk has been updated",
      "chunkDeleted": "Chunk has been deleted",
      
      // Template Management
      "templateManagementTitle": "Manage templates",
      "templateName": "Template name",
      "templateContent": "Template content",
      "createTemplate": "Create template",
      "updateTemplate": "Update template",
      "deleteTemplate": "Delete template",
      "templateCreated": "Template has been created",
      "templateUpdated": "Template has been updated",
      "templateDeleted": "Template has been deleted",
      "enterTemplateName": "Enter template name...",
      "enterTemplateContent": "Enter template content...",
      
      // Task Status
      "taskStatus": "Task status",
      "taskId": "Task ID",
      "taskType": "Task type",
      "taskProgress": "Progress",
      "taskCompleted": "Completed",
      "taskFailed": "Failed",
      "taskPending": "Pending",
      "taskInProgress": "In progress",
      "noActiveTasks": "No active tasks",
      "viewTaskDetails": "View task details",
      
      // Code Analysis
      "codeAnalysis": "Code analysis",
      "analyzeCode": "Analyze code",
      "codeMetrics": "Code metrics",
      "codeComplexity": "Complexity",
      "codeDuplication": "Duplication",
      "codeQuality": "Code quality",
      "suggestions": "Suggestions",
      
      // Export
      "export": "Export",
      "exportToJson": "Export to JSON",
      "exportToCsv": "Export to CSV",
      "exportToExcel": "Export to Excel",
      "exportToPdf": "Export to PDF",
      
      // Notifications
      "notification": "Notification",
      "warning": "Warning",
      "info": "Information",
      "provideCodeOrFile": "Please provide code input or upload a file",
      "codeSubmittedForProcessing": "Code submitted for processing",
      "failedToProcessCode": "Failed to process code",
      "codeProcessedSuccessfully": "Code processed successfully",
      "loadedProcessedFragments": "Loaded {{count}} processed code fragments",
      "failedToFetchChunks": "Failed to fetch processed chunks",
      "codeCopiedToClipboard": "Code copied to clipboard",
      "pleaseEnterSearchQuery": "Please enter a search query",
      "foundResults": "Found {{count}} results",
      "failedToSearchCode": "Failed to search code",
      "processingFailed": "Processing failed",
      "errorCheckingTaskStatus": "Error checking task status",
      "codeSnippet": "Code snippet",
      
      // Errors
      "errorOccurred": "An error occurred",
      "tryAgain": "Try again",
      "connectionError": "Connection error",
      "serverError": "Server error",
      "clientError": "Client error",
      "validationError": "Validation error",
      
      // Confirmations
      "confirmAction": "Confirm action",
      "areYouSure": "Are you sure?",
      "thisActionCannotBeUndone": "This action cannot be undone",
      "yes": "Yes",
      "no": "No",
      
      // New features - Code Analysis
      "codeAnalysisTitle": "Code Analysis",
      "analyzeSelectedCode": "Analyze selected code",
      "codeQualityScore": "Code quality score",
      "codeComplexityScore": "Code complexity score",
      "potentialIssues": "Potential issues",
      "improvementSuggestions": "Improvement suggestions",
      "bestPractices": "Best practices",
      "securityIssues": "Security issues",
      "performanceIssues": "Performance issues",
      "maintainabilityIssues": "Maintainability issues",
      "analyzingCode": "Analyzing code...",
      "analysisComplete": "Analysis complete",
      "noIssuesFound": "No issues found",
      "issuesFound": "Issues found",
      
      // New features - Chunk Manipulation
      "mergeChunks": "Merge chunks",
      "splitChunk": "Split chunk",
      "generateCompletion": "Generate completion",
      "generateDescription": "Generate description",
      "chunksMerged": "Chunks have been merged",
      "chunkSplit": "Chunk has been split",
      "completionGenerated": "Completion has been generated",
      "descriptionGenerated": "Description has been generated",
      "selectChunksToMerge": "Select chunks to merge",
      "selectChunkToSplit": "Select chunk to split",
      "enterSplitPoint": "Enter split point",
      "enterCompletionPrompt": "Enter completion prompt",
      
      // New features - Export
      "exportTitle": "Export data",
      "exportFormat": "Export format",
      "exportOptions": "Export options",
      "includeMetadata": "Include metadata",
      "includeAnalysis": "Include analysis",
      "exportSelected": "Export selected",
      "exportAll": "Export all",
      "exportSuccessful": "Export successful",
      "downloadExport": "Download exported data",
      "preparingExport": "Preparing export...",
      
      // New features - Tags and Categories
      "tagsAndCategories": "Tags and Categories",
      "addTag": "Add tag",
      "removeTag": "Remove tag",
      "createCategory": "Create category",
      "assignToCategory": "Assign to category",
      "removeFromCategory": "Remove from category",
      "tagAdded": "Tag has been added",
      "tagRemoved": "Tag has been removed",
      "categoryCreated": "Category has been created",
      "assignedToCategory": "Assigned to category",
      "removedFromCategory": "Removed from category",
      "enterTagName": "Enter tag name",
      "enterCategoryName": "Enter category name",
      "selectCategory": "Select category",
      "manageTags": "Manage tags",
      "manageCategories": "Manage categories",
      
      // New features - Text Selection
      "copySelectedText": "Copy selected text",
      "selectedTextCopied": "Selected text copied to clipboard",
      "noTextSelected": "No text selected",
      "selectionCleared": "Selection cleared"
    }
  }
};

// Inicjalizacja i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'pl', // Domyślny język
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React już zabezpiecza przed XSS
    }
  });

export default i18n;
