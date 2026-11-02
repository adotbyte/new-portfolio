-- Įjungiame pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Sukuriame lentelę su vector stulpeliu
CREATE TABLE "KnowledgeBase" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1024),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- Sukuriame indeksą greitesnei paieškai
CREATE INDEX ON "KnowledgeBase" USING hnsw ("embedding" vector_cosine_ops);