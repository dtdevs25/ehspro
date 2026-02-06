
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';

// Configure S3 Client for MinIO
const s3Client = new S3Client({
    region: process.env.MINIO_REGION || 'eu-east-1',
    endpoint: process.env.MINIO_ENDPOINT || 'https://inspecao-minio-api.manager.ehspro.com.br',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '10cb477ad06343e7e49d3ee3',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '5ec198da5896b69cab4a54c6fe925c64dc5026',
    },
    forcePathStyle: true, // Needed for MinIO usually
});

// Multer Storage (Memory)
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage: storage });

export const uploadFileToMinio = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { type } = req.body; // 'company' or 'collaborator'

        if (!file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        let bucketName = '';
        let folder = '';

        if (type === 'company') {
            bucketName = 'logo.empresa.ehspro';
            folder = 'logos';
        } else if (type === 'collaborator') {
            bucketName = 'foto.colaborador.ehspro';
            folder = 'photos';
        } else {
            return res.status(400).json({ error: 'Tipo de upload inválido.' });
        }

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // MinIO/S3 buckets are often private by default, but if configured public, this helps? 
            // Newer S3 often blocks ACLs. We assume the bucket policy allows public read or we return a signed URL.
            // The user wants "armazenar os locais das fotos". Usually public URL.
        });

        await s3Client.send(command);

        // Construct Public URL
        // Format: https://endpoint/bucket/key
        const endpoint = process.env.MINIO_ENDPOINT || 'https://inspecao-minio-api.manager.ehspro.com.br';
        const cleanEndpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash if exists
        const publicUrl = `${cleanEndpoint}/${bucketName}/${fileName}`;

        res.json({ url: publicUrl });

    } catch (error) {
        console.error('MinIO Upload Error:', error);
        res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
    }
};
