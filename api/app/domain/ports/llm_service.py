"""
LLM service port (interface).
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class LLMServicePort(ABC):
    """
    Port for LLM (Language Model) operations.
    """

    @abstractmethod
    async def generate_response(
        self,
        query: str,
        context: List[str],
        system_prompt: str = None
    ) -> str:
        """
        Generate a response based on query and context.

        Args:
            query: User question
            context: List of relevant text chunks for context
            system_prompt: Optional system prompt to guide the model

        Returns:
            Generated response text
        """
        pass