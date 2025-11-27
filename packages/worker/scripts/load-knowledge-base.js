/**
 * Load Knowledge Base Documents into RAG System
 * 
 * This script loads the McCarthy Artwork Agent knowledge base documents
 * into the deployed Dartmouth worker's RAG system.
 */

const fs = require('fs');
const path = require('path');

const WORKER_URL = 'https://dartmouth-os-worker.dartmouth.workers.dev';
const AGENT_ID = 'mccarthy-artwork';

const documents = [
  {
    title: 'DTF_Artwork_Requirements',
    path: '../../mccarthy-artwork/src/knowledge/DTF_Artwork_Requirements.md'
  },
  {
    title: 'UV_DTF_Artwork_Requirements',
    path: '../../mccarthy-artwork/src/knowledge/UV_DTF_Artwork_Requirements.md'
  },
  {
    title: 'DPI_QUALITY_STANDARDS',
    path: '../../mccarthy-artwork/src/knowledge/DPI_QUALITY_STANDARDS.md'
  },
  {
    title: 'DTF_vs_UV_DTF_Application_Surfaces',
    path: '../../mccarthy-artwork/src/knowledge/DTF-vs-UV-DTF-Application-Surfaces.md'
  },
  {
    title: 'How_To_Resize_Artwork',
    path: '../../mccarthy-artwork/src/knowledge/How_To_Resize_Artwork.md'
  },
  {
    title: 'How_To_Change_DPI',
    path: '../../mccarthy-artwork/src/knowledge/How_To_Change_DPI.md'
  },
  {
    title: 'How_To_Fix_Transparency',
    path: '../../mccarthy-artwork/src/knowledge/How_To_Fix_Transparency.md'
  }
];

async function ingestDocument(title, content) {
  console.log(`\n📄 Ingesting: ${title}`);
  console.log(`   Content length: ${content.length} characters`);
  
  const response = await fetch(`${WORKER_URL}/test/rag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'ingest',
      agentId: AGENT_ID,
      title: title,
      content: content
    })
  });

  console.log(`   Response status: ${response.status} ${response.statusText}`);
  
  const responseText = await response.text();
  console.log(`   Response preview: ${responseText.substring(0, 200)}...`);
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse response as JSON. Response: ${responseText.substring(0, 500)}`);
  }
  
  if (!response.ok) {
    throw new Error(`Failed to ingest ${title}: ${result.error || 'Unknown error'}`);
  }

  console.log(`   ✅ Success!`);
  console.log(`   - Chunks created: ${result.chunks}`);
  console.log(`   - Embeddings generated: ${result.embeddings}`);
  
  return result;
}

async function main() {
  console.log('🚀 Loading McCarthy Artwork Agent Knowledge Base');
  console.log(`   Worker URL: ${WORKER_URL}`);
  console.log(`   Agent ID: ${AGENT_ID}`);
  console.log(`   Documents: ${documents.length}`);

  let successCount = 0;
  let totalChunks = 0;
  let totalEmbeddings = 0;

  for (const doc of documents) {
    try {
      const filePath = path.join(__dirname, doc.path);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const result = await ingestDocument(doc.title, content);
      
      successCount++;
      totalChunks += result.chunks;
      totalEmbeddings += result.embeddings;
      
      // Wait a bit between documents to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Documents ingested: ${successCount}/${documents.length}`);
  console.log(`   Total chunks: ${totalChunks}`);
  console.log(`   Total embeddings: ${totalEmbeddings}`);
  console.log('='.repeat(60));

  if (successCount === documents.length) {
    console.log('\n✅ Knowledge base loaded successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some documents failed to load.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

