import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { ragApi } from '../lib/api';

interface KnowledgeDocument {
  id: string;
  filename: string;
  title: string;
  category: string;
  content_preview: string;
  word_count: number;
  uploaded_at: string;
  uploaded_by: string;
  status: 'active' | 'processing' | 'error';
}

const categories = [
  { value: 'policies', label: 'Policies', description: 'Returns, shipping, terms, privacy' },
  { value: 'products', label: 'Products', description: 'Product information and specs' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'general', label: 'General', description: 'Company info, ordering process' },
  { value: 'other', label: 'Other', description: 'Miscellaneous documents' },
];

export default function AIAgentKnowledgePage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Fetch documents
  const { data, isLoading } = useQuery({
    queryKey: ['rag-documents'],
    queryFn: () => ragApi.listDocuments().then(res => res.data),
  });

  const documents: KnowledgeDocument[] = data?.documents || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, category }: { file: File; category: string }) => 
      ragApi.uploadDocument(file, category).then(res => res.data),
    onSuccess: (data) => {
      setUploadStatus('success');
      setUploadMessage(data.message || 'Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['rag-documents'] });
      setTimeout(() => setUploadStatus('idle'), 3000);
    },
    onError: (error: any) => {
      setUploadStatus('error');
      setUploadMessage(error.response?.data?.error || error.message || 'Failed to upload document');
      setTimeout(() => setUploadStatus('idle'), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ragApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents'] });
    },
  });

  // Reprocess mutation
  const reprocessMutation = useMutation({
    mutationFn: () => ragApi.reprocessDocuments(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents'] });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    const validTypes = ['.md', '.txt', '.pdf'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(extension)) {
      setUploadStatus('error');
      setUploadMessage('Invalid file type. Please upload .md, .txt, or .pdf files.');
      setTimeout(() => setUploadStatus('idle'), 5000);
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File too large. Maximum size is 5MB.');
      setTimeout(() => setUploadStatus('idle'), 5000);
      return;
    }

    setUploadStatus('uploading');
    uploadMutation.mutate({ file, category: selectedCategory });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      policies: 'bg-blue-100 text-blue-700',
      products: 'bg-green-100 text-green-700',
      faq: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700',
      other: 'bg-yellow-100 text-yellow-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          RAG Knowledge Base
        </h1>
        <p className="text-gray-600 mt-1">
          Upload documents to enhance the AI Agent's knowledge. The AI will use these documents to provide accurate, context-aware responses.
        </p>
      </div>

      {/* What is RAG? */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-indigo-900 mb-2">What is RAG?</h3>
        <p className="text-sm text-indigo-800">
          <strong>RAG (Retrieval-Augmented Generation)</strong> allows the AI to search through your uploaded documents 
          and use relevant information when responding to customers. This ensures accurate, up-to-date answers based on 
          your actual policies, products, and procedures - eliminating AI hallucinations.
        </p>
        <ul className="mt-2 text-sm text-indigo-700 list-disc list-inside">
          <li>Upload your policies, FAQs, and product information</li>
          <li>AI searches documents for relevant context</li>
          <li>Responses are grounded in your actual content</li>
          <li>Update documents anytime to keep AI knowledge current</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
            
            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop a file here, or
              </p>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 inline-block">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".md,.txt,.pdf"
                  onChange={handleFileInput}
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Supported: .md, .txt, .pdf (max 5MB)
              </p>
            </div>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                uploadStatus === 'uploading' ? 'bg-blue-50 text-blue-700' :
                uploadStatus === 'success' ? 'bg-green-50 text-green-700' :
                'bg-red-50 text-red-700'
              }`}>
                {uploadStatus === 'uploading' && (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading...
                  </span>
                )}
                {uploadStatus === 'success' && (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {uploadMessage}
                  </span>
                )}
                {uploadStatus === 'error' && (
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {uploadMessage}
                  </span>
                )}
              </div>
            )}

            {/* Reprocess Button */}
            <button
              onClick={() => reprocessMutation.mutate()}
              disabled={reprocessMutation.isPending}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reprocessMutation.isPending ? 'animate-spin' : ''}`} />
              Reprocess All Documents
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploaded Documents ({documents.length})
              </h3>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No documents uploaded yet</p>
                <p className="text-sm mt-1">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <div key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{doc.title || doc.filename}</h4>
                            {getStatusIcon(doc.status)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{doc.filename}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadge(doc.category)}`}>
                              {doc.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              {doc.word_count?.toLocaleString()} words
                            </span>
                            <span className="text-xs text-gray-400">
                              📅 {new Date(doc.uploaded_at).toLocaleDateString('en-AU', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })} at {new Date(doc.uploaded_at).toLocaleTimeString('en-AU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {doc.content_preview && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {doc.content_preview}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this document?')) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

