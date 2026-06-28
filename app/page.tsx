'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Inspiration {
  type: 'text' | 'url' | 'document';
  label: string;
  content: string;
}

export default function Home() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'flowchart'>('chat');
  const [flowchartLoading, setFlowchartLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addTextInspiration = () => {
    if (textInput.trim()) {
      setInspirations([...inspirations, { type: 'text', label: textInput.slice(0, 40) + '...', content: textInput.trim() }]);
      setTextInput('');
    }
  };

  const addUrlInspiration = () => {
    if (urlInput.trim()) {
      setInspirations([...inspirations, { type: 'url', label: urlInput, content: urlInput.trim() }]);
      setUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setInspirations([...inspirations, { type: 'document', label: file.name, content }]);
    };
    reader.readAsText(file);
  };

  const removeInspiration = (i: number) => {
    setInspirations(inspirations.filter((_, j) => j !== i));
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspirations, messages: newMessages, mode: 'chat' }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.story }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong.' }]);
    }
    setLoading(false);
  };

  const handleFlowchart = async () => {
    setActiveTab('flowchart');
    setFlowchartLoading(true);
    setNodes([]);
    setEdges([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspirations, messages, mode: 'flowchart_json' }),
      });
      const data = await res.json();

      if (data.nodes && data.edges) {
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    } catch {
      console.error('Flowchart generation failed');
    }
    setFlowchartLoading(false);
  };

  const handleCharacters = async () => {
    const newMessages: Message[] = [...messages, { role: 'user', content: 'Generate detailed character profiles based on our conversation.' }];
    setMessages(newMessages);
    setActiveTab('chat');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspirations, messages: newMessages, mode: 'characters' }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.story }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>ilhum</h1>
        <p className="tagline">every idea was an inspiration first. &nbsp;|&nbsp; nothing is new. everything is ilhum.</p>
      </header>

      <div className="panels">

        {/* LEFT PANEL - Inspirations */}
        <div className="panel panel-left">
          <div className="panel-title">Inspirations</div>

          <div className="inspiration-section">
            <div className="section-label">Text</div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste a story excerpt, theme, or anything that inspires you..."
              rows={3}
            />
            <button onClick={addTextInspiration}>Add Text</button>
          </div>

          <div className="inspiration-section">
            <div className="section-label">URL / YouTube</div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
            />
            <button onClick={addUrlInspiration}>Add URL</button>
          </div>

          <div className="inspiration-section">
            <div className="section-label">Document</div>
            <label className="file-label">
              <input type="file" accept=".txt,.pdf,.md" onChange={handleFileUpload} />
              Upload File
            </label>
          </div>

          {inspirations.length > 0 && (
            <div className="inspirations-list">
              <div className="section-label">Added ({inspirations.length})</div>
              {inspirations.map((ins, i) => (
                <div key={i} className="inspiration-chip">
                  <span className="chip-type">{ins.type}</span>
                  <span className="chip-label">{ins.label.slice(0, 30)}{ins.label.length > 30 ? '...' : ''}</span>
                  <button onClick={() => removeInspiration(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE PANEL - Chat + Flowchart tabs */}
        <div className="panel panel-middle">
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab-btn ${activeTab === 'flowchart' ? 'active' : ''}`}
              onClick={() => setActiveTab('flowchart')}
            >
              Flowchart
            </button>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="placeholder-text">Add inspirations, then start prompting your story here...</div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-label">{msg.role === 'user' ? 'You' : 'ilhum'}</div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="message assistant">
                    <div className="message-label">ilhum</div>
                    <div className="message-content loading-dots">thinking...</div>
                  </div>
                )}
              </div>
              <div className="chat-input-area">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                  placeholder="Describe your story idea, ask for characters, request a specific scene..."
                  rows={3}
                />
                <button onClick={handleChat} disabled={loading || !chatInput.trim()}>Send</button>
              </div>
            </>
          )}

          {activeTab === 'flowchart' && (
            <div className="flowchart-container">
              {flowchartLoading && (
                <div className="flowchart-loading">
                  <div className="loading-text">Building your story map...</div>
                </div>
              )}
              {!flowchartLoading && nodes.length === 0 && (
                <div className="placeholder-text" style={{ padding: '2rem' }}>
                  Click "Flowchart" in the Studio panel to generate a visual story map from your conversation.
                </div>
              )}
              {!flowchartLoading && nodes.length > 0 && (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Background color="#2a2a3a" gap={16} />
                  <Controls />
                </ReactFlow>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Studio buttons only */}
        <div className="panel panel-right">
          <div className="panel-title">Studio</div>
          <div className="studio-buttons">
            <button className="studio-btn" onClick={handleCharacters}>
              ✦ Characters
            </button>
            <button className="studio-btn" onClick={handleFlowchart}>
              ✦ Flowchart
            </button>
          </div>
          <div className="studio-hint">
            <p>Characters — generates character profiles into the chat.</p>
            <p>Flowchart — builds a visual story map in the Flowchart tab.</p>
          </div>
        </div>

      </div>
    </div>
  );
}