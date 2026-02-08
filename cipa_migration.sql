-- Add columns if they don't exist
DO $$ 
BEGIN 
  BEGIN
    ALTER TABLE "cipa_mandatos" ADD COLUMN "representante_empresa_id" TEXT;
  EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column representante_empresa_id already exists';
  END;
  BEGIN
    ALTER TABLE "cipa_mandatos" ADD COLUMN "presidente_cipa_id" TEXT;
  EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column presidente_cipa_id already exists';
  END;
END $$;
