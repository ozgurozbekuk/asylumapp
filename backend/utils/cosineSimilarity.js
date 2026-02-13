//Compute similarity between two vectors

export function cosineSimilarity(a,b){
    if(!a || !b || a.length !== b.length){
        throw new Error("Vector must be same length")
    }

    let dot = 0
    let normA = 0
    let normB = 0

    for(let i=0;i <a.length;i++){
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    if(normA === 0 || normB === 0){
        return 0
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
 


