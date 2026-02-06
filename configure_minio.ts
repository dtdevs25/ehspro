
import { S3Client, PutBucketPolicyCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

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

async function configureMinio() {
    console.log(`[MINIO CONFIG] Connecting to ${MINIO_ENDPOINT}...`);

    for (const bucket of BUCKETS) {
        try {
            console.log(`[MINIO CONFIG] Checking bucket: ${bucket}...`);
            try {
                // Check if bucket exists
                await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
                console.log(`[MINIO CONFIG] Bucket ${bucket} exists.`);
            } catch (error: any) {
                if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                    console.log(`[MINIO CONFIG] Bucket ${bucket} NOT found. Creating...`);
                    await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
                    console.log(`[MINIO CONFIG] Bucket ${bucket} created.`);
                } else {
                    throw error;
                }
            }

            // Set Public Policy
            console.log(`[MINIO CONFIG] Setting public policy for ${bucket}...`);
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${bucket}/*`]
                    }
                ]
            };

            await s3Client.send(new PutBucketPolicyCommand({
                Bucket: bucket,
                Policy: JSON.stringify(policy)
            }));
            console.log(`[MINIO CONFIG] Public policy set for ${bucket}.`);

        } catch (error) {
            console.error(`[MINIO CONFIG] Error configuring bucket ${bucket}:`, error);
        }
    }
    console.log('[MINIO CONFIG] Finished.');
}

configureMinio();
