import os
import re
import logging
from typing import List, Dict, Any, Optional, Tuple

import openai
from fastapi import HTTPException

from app.config import OPENAI_API_KEY, EMBEDDING_MODEL, COMPLETION_MODEL, SUPPORTED_LANGUAGES

# Configure OpenAI API
openai.api_key = OPENAI_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def detect_language(code: str) -> str:
    """
    Detect programming language from code snippet.
    
    Args:
        code: The code snippet to analyze
        
    Returns:
        Detected language or "unknown"
    """
    # Simple language detection based on file extensions and patterns
    patterns = {
        "python": [r"import\s+[a-zA-Z0-9_]+", r"from\s+[a-zA-Z0-9_\.]+\s+import", r"def\s+[a-zA-Z0-9_]+\s*\(", r"class\s+[a-zA-Z0-9_]+\s*:"],
        "javascript": [r"const\s+[a-zA-Z0-9_]+\s*=", r"let\s+[a-zA-Z0-9_]+\s*=", r"function\s+[a-zA-Z0-9_]+\s*\(", r"import\s+.*\s+from\s+['\"].*['\"]"],
        "typescript": [r"interface\s+[a-zA-Z0-9_]+", r"type\s+[a-zA-Z0-9_]+\s*=", r"class\s+[a-zA-Z0-9_]+\s*implements"],
        "java": [r"public\s+class", r"private\s+[a-zA-Z0-9_<>]+\s+[a-zA-Z0-9_]+", r"package\s+[a-zA-Z0-9_\.]+;"],
        "c": [r"#include\s+<[a-zA-Z0-9_\.]+>", r"void\s+[a-zA-Z0-9_]+\s*\(", r"int\s+main\s*\("],
        "cpp": [r"#include\s+<[a-zA-Z0-9_\.]+>", r"std::", r"namespace\s+[a-zA-Z0-9_]+"],
        "csharp": [r"using\s+[a-zA-Z0-9_\.]+;", r"namespace\s+[a-zA-Z0-9_\.]+", r"public\s+class"],
        "go": [r"package\s+[a-zA-Z0-9_]+", r"func\s+[a-zA-Z0-9_]+\s*\(", r"import\s+\("],
        "rust": [r"fn\s+[a-zA-Z0-9_]+", r"let\s+mut", r"use\s+[a-zA-Z0-9_:]+"],
        "php": [r"<\?php", r"\$[a-zA-Z0-9_]+\s*=", r"function\s+[a-zA-Z0-9_]+\s*\("],
        "ruby": [r"def\s+[a-zA-Z0-9_]+", r"require\s+['\""][a-zA-Z0-9_]+['\""]", r"class\s+[a-zA-Z0-9_]+\s*<"],
        "html": [r"<!DOCTYPE\s+html>", r"<html", r"<head", r"<body"],
        "css": [r"[a-zA-Z0-9_\-\.#]+\s*\{", r"@media", r"@import"],
        "sql": [r"SELECT\s+.*\s+FROM", r"INSERT\s+INTO", r"CREATE\s+TABLE", r"ALTER\s+TABLE"],
        "bash": [r"#!/bin/bash", r"#!/usr/bin/env\s+bash", r"if\s+\[\["],
        "powershell": [r"param\s*\(", r"\$[a-zA-Z0-9_]+\s*=", r"function\s+[a-zA-Z0-9_\-]+"],
        "yaml": [r"^---", r"key:\s+value"],
        "json": [r"^\s*\{", r"\"[a-zA-Z0-9_]+\":\s*[{\"\[\d]"],
        "xml": [r"<\?xml", r"<[a-zA-Z0-9_]+>.*</[a-zA-Z0-9_]+>"]
    }
    
    for lang, pattern_list in patterns.items():
        for pattern in pattern_list:
            if re.search(pattern, code, re.IGNORECASE | re.MULTILINE):
                return lang
    
    # If no patterns match, try to use LLM to detect language
    try:
        response = openai.ChatCompletion.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": "You are a programming language detector. Respond with only the language name."},
                {"role": "user", "content": f"What programming language is this code written in? Respond with only the language name.\n\n{code[:1000]}"}
            ],
            max_tokens=20,
            temperature=0.1
        )
        detected = response.choices[0].message.content.strip().lower()
        
        # Check if detected language is in our supported list
        for lang in SUPPORTED_LANGUAGES:
            if lang in detected:
                return lang
                
    except Exception as e:
        logger.error(f"Error detecting language with LLM: {e}")
    
    return "unknown"

def is_code(text: str) -> bool:
    """
    Determine if the given text is likely code rather than plain text.
    
    Args:
        text: The text to analyze
        
    Returns:
        True if the text is likely code, False otherwise
    """
    # Check for common code indicators
    code_indicators = [
        # Brackets, parentheses, and braces
        r"[\{\}\[\]\(\)]{3,}",
        # Semicolons at line ends
        r";\s*$",
        # Function definitions
        r"(function|def|public|private|protected|class)\s+[a-zA-Z0-9_]+",
        # Variable assignments with special characters
        r"(var|let|const|int|float|double|string)\s+[a-zA-Z0-9_]+\s*=",
        # Import statements
        r"(import|include|require|using|from)\s+[a-zA-Z0-9_\.\*]+",
        # Indentation patterns
        r"^\s{2,}[a-zA-Z0-9_]+",
        # Comments
        r"(//|#|/\*|\*/).*",
        # HTML tags
        r"<[a-zA-Z0-9_]+(\s+[a-zA-Z0-9_]+=\".*\")*>",
    ]
    
    # Count how many indicators are found
    indicator_count = 0
    for pattern in code_indicators:
        if re.search(pattern, text, re.MULTILINE):
            indicator_count += 1
    
    # If more than 2 indicators are found, it's likely code
    if indicator_count > 2:
        return True
    
    # If language detection returns a known language, it's code
    language = detect_language(text)
    if language != "unknown":
        return True
    
    # If all else fails, use LLM to determine if it's code
    try:
        response = openai.ChatCompletion.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": "You are a code detector. Respond with only 'yes' or 'no'."},
                {"role": "user", "content": f"Is the following text a code snippet? Respond with only 'yes' or 'no'.\n\n{text[:1000]}"}
            ],
            max_tokens=10,
            temperature=0.1
        )
        result = response.choices[0].message.content.strip().lower()
        return "yes" in result
    except Exception as e:
        logger.error(f"Error determining if text is code with LLM: {e}")
        
    return False

def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for the given text using OpenAI API.
    
    Args:
        text: The text to generate embedding for
        
    Returns:
        Embedding vector as a list of floats
    """
    try:
        response = openai.Embedding.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response["data"][0]["embedding"]
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")

def generate_description(code: str, language: str) -> str:
    """
    Generate a description for the given code snippet using OpenAI API.
    
    Args:
        code: The code snippet to describe
        language: The programming language of the code
        
    Returns:
        Generated description
    """
    try:
        prompt = f"""
        Analyze the following {language} code and provide a detailed description.
        Include:
        1. What the code does
        2. Key functions/classes/methods
        3. Any notable patterns or algorithms
        4. Dependencies or requirements
        5. Potential use cases
        
        Code:
        ```{language}
        {code}
        ```
        """
        
        response = openai.ChatCompletion.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": "You are a code analysis expert. Provide clear, concise, and accurate descriptions of code snippets."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating description: {e}")
        # Return a basic description if OpenAI API fails
        return f"Code snippet in {language}. (Description generation failed)"

def complete_code(code: str, language: str) -> str:
    """
    Complete incomplete code snippet using OpenAI API.
    
    Args:
        code: The incomplete code snippet
        language: The programming language of the code
        
    Returns:
        Completed code
    """
    try:
        prompt = f"""
        Complete the following incomplete {language} code snippet.
        Make sure to:
        1. Close all open brackets, parentheses, and braces
        2. Complete any unfinished functions or classes
        3. Add necessary imports if they're missing
        4. Fix any syntax errors
        5. Keep the style consistent with the original code
        
        Incomplete code:
        ```{language}
        {code}
        ```
        
        Complete code:
        ```{language}
        """
        
        response = openai.ChatCompletion.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": f"You are an expert {language} programmer. Complete the given code snippet."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.2
        )
        
        completed_code = response.choices[0].message.content.strip()
        
        # Extract code from markdown code block if present
        if "```" in completed_code:
            match = re.search(r"```(?:[a-zA-Z0-9_]*\n)?(.*?)```", completed_code, re.DOTALL)
            if match:
                completed_code = match.group(1).strip()
        
        return completed_code
    except Exception as e:
        logger.error(f"Error completing code: {e}")
        # Return the original code if OpenAI API fails
        return code

def chunk_code(code: str, max_tokens: int = 1000, overlap: int = 50) -> List[str]:
    """
    Split code into chunks of specified maximum token size with overlap.
    
    Args:
        code: The code to chunk
        max_tokens: Maximum tokens per chunk
        overlap: Number of overlapping tokens between chunks
        
    Returns:
        List of code chunks
    """
    # Simple approximation: 1 token ≈ 4 characters for code
    char_per_token = 4
    max_chars = max_tokens * char_per_token
    overlap_chars = overlap * char_per_token
    
    # Split by lines to avoid breaking in the middle of a line
    lines = code.split('\n')
    chunks = []
    current_chunk = []
    current_length = 0
    
    for line in lines:
        line_length = len(line) + 1  # +1 for newline
        
        if current_length + line_length > max_chars and current_chunk:
            # Add current chunk to chunks
            chunks.append('\n'.join(current_chunk))
            
            # Start new chunk with overlap
            overlap_lines = []
            overlap_size = 0
            for prev_line in reversed(current_chunk):
                if overlap_size + len(prev_line) + 1 > overlap_chars:
                    break
                overlap_lines.insert(0, prev_line)
                overlap_size += len(prev_line) + 1
            
            current_chunk = overlap_lines
            current_length = overlap_size
        
        current_chunk.append(line)
        current_length += line_length
    
    # Add the last chunk if not empty
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks

def is_incomplete_code(code: str, language: str) -> bool:
    """
    Check if code is incomplete (missing brackets, etc.)
    
    Args:
        code: The code to check
        language: The programming language of the code
        
    Returns:
        True if code is incomplete, False otherwise
    """
    # Simple bracket matching
    brackets = {
        '{': '}',
        '[': ']',
        '(': ')'
    }
    
    # Remove strings and comments to avoid false positives
    # This is a simplified approach and might not work for all cases
    code_no_strings = re.sub(r'".*?"', '""', code)
    code_no_strings = re.sub(r"'.*?'", "''", code_no_strings)
    code_no_comments = re.sub(r'//.*?$', '', code_no_strings, flags=re.MULTILINE)
    code_no_comments = re.sub(r'/\*.*?\*/', '', code_no_comments, flags=re.DOTALL)
    
    # Check bracket balance
    stack = []
    for char in code_no_comments:
        if char in brackets:
            stack.append(char)
        elif char in brackets.values():
            if not stack or brackets[stack.pop()] != char:
                return True
    
    if stack:
        return True
    
    # Language-specific checks
    if language == "python":
        # Check for incomplete indentation blocks
        lines = code.split('\n')
        for i, line in enumerate(lines):
            if line.strip().endswith(':') and i == len(lines) - 1:
                return True
            if line.strip().endswith(':') and i < len(lines) - 1 and not lines[i+1].startswith(' '):
                return True
    
    # Use LLM to check if code is incomplete
    try:
        response = openai.ChatCompletion.create(
            model=COMPLETION_MODEL,
            messages=[
                {"role": "system", "content": "You are a code analyzer. Respond with only 'yes' or 'no'."},
                {"role": "user", "content": f"Is the following {language} code incomplete or missing closing brackets/braces? Respond with only 'yes' or 'no'.\n\n{code}"}
            ],
            max_tokens=10,
            temperature=0.1
        )
        result = response.choices[0].message.content.strip().lower()
        return "yes" in result
    except Exception as e:
        logger.error(f"Error checking if code is incomplete with LLM: {e}")
    
    return False
