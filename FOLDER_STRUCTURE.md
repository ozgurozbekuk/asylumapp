# Folder Structure Reference
asylum-app/
├── frontend/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── api/
│       │   ├── client.js       # Axios instance
│       │   └── endpoints.js    # API endpoints list
│       │
│       ├── components/
│       │   ├── ChatBox.jsx     # Main chat interface
│       │   ├── Message.jsx     # Single message bubble
│       │   ├── FileUploader.jsx# Upload component
│       │   ├── LoadingSpinner.jsx
│       │   └── Header.jsx
│       │
│       ├── hooks/
│       │   ├── useMessages.js  # useQuery - get messages
│       │   ├── useSendMessage.js # useMutation - send message
│       │   └── useUploadDocument.js
│       │
│       ├── pages/
│       │   ├── ChatPage.jsx
│       │   ├── UploadPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── ProfilePage.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx  # optional if you need global user data
│       │   └── ChatContext.jsx  # if you want to manage active conversation globally
│       │
│       ├── utils/
│       │   ├── formatDate.js
│       │   └── constants.js
│       │
│       ├── styles/
│       │   └── main.css
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/                     # Node.js + Express Backend
│   ├── app.js
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── clerk.js            # Clerk middleware setup
│   │   └── env.js              # Environment variables
│   │
│   ├── models/
│   │   ├── Conversation.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── chat.js             # /api/chat (RAG logic)
│   │   ├── upload.js           # /api/upload
│   │   └── user.js
│   │
│   ├── services/
│   │   ├── llmProvider.js      # Central LLM adapter (Ollama chat + embeddings)
│   │   ├── vectorService.js    # Pinecone / Upstash wrapper
│   │   └── fileService.js      # Document upload handling
│   │
│   ├── utils/
│   │   ├── chunkText.js        # split long texts into chunks
│   │   ├── generateEmbeddings.js
│   │   ├── buildPrompt.js
│   │   └── logger.js
│   │
│   └── index.js
│
├── embeddings/                 # (Optional) Embedding data or preprocessing scripts
│   ├── prepareDocs.js
│   └── seedVectorDB.js
│
├── .env
├── package.json
├── README.md
└── README_SERVER.md
