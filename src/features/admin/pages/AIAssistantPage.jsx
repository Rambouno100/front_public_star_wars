import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCcw, Eraser } from 'lucide-react';
import { adminAiReply } from '../api';

const EXAMPLES = [
  '¿Me pasas tu catálogo?',
  '¿Tienes figuras de Darth Vader?',
  'Busco un sable de luz réplica de Luke',
  '¿Tienes algo del Imperio o coleccionable?',
  '¿Qué casco mandaloriano me recomiendas?',
];

const AIAssistantPage = () => {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [reply, setReply] = useState('');
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { taRef.current?.focus(); }, []);

  const generate = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError('');
    setReply('');
    setMeta(null);
    try {
      // El backend ahora espera un historial de chat (messages alternando
      // user/assistant). Esta UI es de un solo turno: combinamos el hilo previo
      // opcional con el mensaje actual en un único turno `user`.
      const ctx = context.trim();
      const content = ctx
        ? `Hilo previo con el cliente (contexto):\n${ctx}\n\nÚltimo mensaje del cliente:\n${message.trim()}`
        : message.trim();
      const data = await adminAiReply({
        messages: [{ role: 'user', content }],
      });
      setReply(data.reply || '');
      setMeta({
        model: data.model,
        catalog_size: data.catalog_size,
        usage: data.usage,
        cost: data.cost,
      });
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || 'Error desconocido';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearAll = () => {
    setMessage('');
    setContext('');
    setReply('');
    setMeta(null);
    setError('');
    taRef.current?.focus();
  };

  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate();
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-faint mb-1">
            Administración
          </p>
          <h1 className="font-display text-2xl font-semibold text-brand-text tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-brand-accent" />
            Asistente IA
          </h1>
          <p className="text-[13px] text-brand-muted mt-1 max-w-2xl">
            Pega el mensaje del cliente. La IA lee el catálogo activo (mismo orden de
            recomendación del back: Flash → margen → score) y arma una respuesta lista
            para pegar en WhatsApp, aplicando regla de 3 con opción central destacada.
          </p>
        </div>
        <button
          onClick={clearAll}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border border-brand-border-md text-brand-faint hover:border-brand-text hover:text-brand-muted disabled:opacity-50 transition-colors"
        >
          <Eraser size={12} /> Limpiar
        </button>
      </div>

      {/* Examples */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setMessage(ex)}
            disabled={loading}
            className="px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] border border-brand-border-md text-brand-faint hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
            title="Usar este ejemplo"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border border-brand-border bg-brand-panel">
        <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint">
            Mensaje del cliente
          </span>
          <button
            onClick={() => setShowContext(v => !v)}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-faint hover:text-brand-text transition-colors"
          >
            {showContext ? '− Ocultar contexto' : '+ Añadir hilo previo'}
          </button>
        </div>
        <textarea
          ref={taRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ej: Hola, ¿tienen una figura de Yoda o algo de la trilogía original?"
          rows={4}
          className="w-full bg-transparent px-4 py-3 text-[14px] text-brand-text placeholder:text-brand-faint focus:outline-none resize-y"
        />
        {showContext && (
          <>
            <div className="px-4 py-2 border-t border-brand-border">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-faint">
                Hilo previo (opcional)
              </span>
            </div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Pega mensajes anteriores del chat si la respuesta depende de ellos."
              rows={3}
              className="w-full bg-transparent px-4 py-3 text-[13px] text-brand-muted placeholder:text-brand-faint focus:outline-none resize-y border-t border-brand-border"
            />
          </>
        )}
        <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-brand-faint">
            Ctrl/⌘ + Enter para generar
          </span>
          <button
            onClick={generate}
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-bg font-medium text-[13px] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {loading
              ? <><RefreshCcw size={14} className="animate-spin" /> Generando…</>
              : <><Sparkles size={14} /> Generar respuesta</>}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 border border-brand-red/40 bg-brand-red/10 px-4 py-3 text-[13px] text-brand-red">
          {error}
        </div>
      )}

      {/* Reply */}
      {reply && (
        <div className="mt-5 border border-brand-border bg-brand-panel">
          <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-accent">
              Respuesta sugerida
            </span>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] border border-brand-border-md text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              {copied
                ? <><Check size={12} /> Copiado</>
                : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <pre className="px-4 py-4 text-[14px] text-brand-text whitespace-pre-wrap font-sans leading-relaxed">
            {reply}
          </pre>
          {meta && (
            <div className="px-4 py-2 border-t border-brand-border flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-brand-faint">
              <span>modelo: {meta.model}</span>
              <span>catálogo: {meta.catalog_size} items</span>
              <span>in: {meta.usage?.input_tokens}t</span>
              <span>out: {meta.usage?.output_tokens}t</span>
              {meta.usage?.cache_read_input_tokens > 0 && (
                <span className="text-brand-accent">
                  cache hit: {meta.usage.cache_read_input_tokens}t
                </span>
              )}
              {meta.cost && (
                <span>costo: S/ {meta.cost.pen?.toFixed?.(4) ?? meta.cost.pen}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
