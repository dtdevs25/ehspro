-- Create CipaCandidate table
CREATE TABLE IF NOT EXISTS "cipa_candidatos" (
    "id" TEXT NOT NULL,
    "mandato_id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "data_inscricao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url_assinatura" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT "cipa_candidatos_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Keys
ALTER TABLE "cipa_candidatos" ADD CONSTRAINT "cipa_candidatos_mandato_id_fkey" FOREIGN KEY ("mandato_id") REFERENCES "cipa_mandatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cipa_candidatos" ADD CONSTRAINT "cipa_candidatos_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
