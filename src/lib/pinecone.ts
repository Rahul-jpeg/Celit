import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
});


export const getStats = async () => {
    const index = pinecone.Index('celit');
    const stats = await index.describeIndexStats();
    return stats;
}

