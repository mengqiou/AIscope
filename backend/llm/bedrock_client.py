from __future__ import annotations

import json
from typing import Any, Dict

import boto3
from botocore.config import Config
from tenacity import retry, stop_after_attempt, wait_exponential

from backend.core.config import settings


class BedrockClient:
    def __init__(self) -> None:
        if not settings.aws_region or not settings.bedrock_model_id:
            raise RuntimeError("AISCOPE_AWS_REGION and AISCOPE_BEDROCK_MODEL_ID must be set")

        self.model_id = settings.bedrock_model_id
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region,
            config=Config(retries={"max_attempts": 3}),
        )

    @retry(wait=wait_exponential(min=1, max=20), stop=stop_after_attempt(3))
    def invoke_json(self, prompt: str, max_tokens: int = 2048) -> Dict[str, Any]:
        body = json.dumps(
            {
                "inputText": prompt,
                "textGenerationConfig": {
                    "maxTokenCount": max_tokens,
                    "temperature": 0.2,
                    "topP": 0.9,
                },
            }
        )

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=body,
            contentType="application/json",
            accept="application/json",
        )

        resp_body = json.loads(response["body"].read())
        # Different Bedrock models shape outputs slightly differently; expect at least 'outputText'
        text = resp_body.get("outputText") or resp_body.get("results", [{}])[0].get(
            "outputText", {}
        ).get("text")
        if not text:
            raise RuntimeError("Empty response from Bedrock model")

        return json.loads(text)

