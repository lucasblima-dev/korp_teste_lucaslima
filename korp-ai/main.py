from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI(title="Korp AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
HF_TOKEN = os.getenv("HF_TOKEN")  # bearer token do HF

CATEGORIAS = [
    "Eletrônicos",
    "Papelaria",
    "Alimentício",
    "Limpeza e Higiene",
    "Ferramentas",
    "Vestuário",
    "Móveis e Decoração",
    "Informática",
    "Outros",
]

class ClassificacaoRequest(BaseModel):
    descricao: str

class ClassificacaoResponse(BaseModel):
    categoria: str
    confianca: float
    sugestoes: list[dict]

@app.post("/api/classificar-produto", response_model=ClassificacaoResponse)
def classificar_produto(body: ClassificacaoRequest):
    if not body.descricao or len(body.descricao.strip()) < 3:
        raise HTTPException(status_code=422, detail="Descrição muito curta.")

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {
        "inputs": body.descricao,
        "parameters": {"candidate_labels": CATEGORIAS},
    }

    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=10)

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Serviço de IA temporariamente indisponível."
        )

    result = response.json()

    sugestoes = [
        {"categoria": label, "confianca": round(score, 4)}
        for label, score in zip(result["labels"][:3], result["scores"][:3])
    ]

    return ClassificacaoResponse(
        categoria=result["labels"][0],
        confianca=round(result["scores"][0], 4),
        sugestoes=sugestoes,
    )

@app.get("/health")
def health():
    return {"status": "ok"}