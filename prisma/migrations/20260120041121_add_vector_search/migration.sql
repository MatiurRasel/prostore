-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionEmbedding" vector;
