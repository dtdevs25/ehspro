
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'https://inspecao-minio-api.manager.ehspro.com.br';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || '10cb477ad06343e7e49d3ee3';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || '5ec198da5896b69cab4a54c6fe925c64dc5026';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

const s3Client = new S3Client({
    region: MINIO_REGION,
    endpoint: MINIO_ENDPOINT,
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

const BUCKETS = [
    'logo.empresa.ehspro',
    'foto.colaborador.ehspro'
];

async function configureCors() {
    console.log(`[MINIO CORS] Connecting to ${MINIO_ENDPOINT}...`);

    for (const bucket of BUCKETS) {
        try {
            console.log(`[MINIO CORS] Setting CORS for ${bucket}...`);

            const corsRules = {
                Bucket: bucket,
                CORSConfiguration: {
                    CORSRules: [
                        {
                            AllowedHeaders: ["*"],
                            AllowedMethods: ["GET", "HEAD"],
                            AllowedOrigins: ["*"], // Allow existing domains + localhost
                            ExposeHeaders: ["ETag"],
                            MaxAgeSeconds: 3000
                        }
                    ]
                }
            };

            await s3Client.send(new PutBucketCorsCommand(corsRules));
            console.log(`[MINIO CORS] CORS configured for ${bucket}.`);

        } catch (error) {
            console.error(`[MINIO CORS] Error configuring CORS for ${bucket}:`, error);
        }
    }
    console.log('[MINIO CORS] Finished.');
}

configureCors();
