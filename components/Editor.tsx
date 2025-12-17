import React, { useRef, useState, useEffect } from 'react';
import { generateText, rewriteText, processCustomCommand } from '../services/geminiService';

interface EditorProps {
  title: string;
  onBack: () => void;
}

type EditorMode = 'global' | 'paragraph' | 'selection';

const Editor: React.FC<EditorProps> = ({ title, onBack }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(124);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Advanced State
  const [mode, setMode] = useState<EditorMode>('global');
  const [activeText, setActiveText] = useState<string>(""); 
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  
  // Custom Prompt State
  const [customPrompt, setCustomPrompt] = useState("");

  // Update word count
  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
    }
  };

  // Master Context Handler (Runs on Click, KeyUp, SelectionChange)
  const updateContext = () => {
    const selection = window.getSelection();
    
    // Safety check
    if (!selection || !editorRef.current) return;

    // Check if we are inside the editor
    let node = selection.anchorNode;
    // If text node, get parent
    if (node && node.nodeType === 3) node = node.parentNode;
    
    const isInsideEditor = editorRef.current.contains(node);

    if (!isInsideEditor) {
        return;
    }

    // SCENARIO 1: Explicit Text Selection (Highlighting)
    if (!selection.isCollapsed && selection.toString().trim().length > 0) {
        setMode('selection');
        setActiveText(selection.toString());
        setSelectionRange(selection.getRangeAt(0).cloneRange());
        return;
    }

    // SCENARIO 2: Cursor Placement (Paragraph Focus)
    if (selection.isCollapsed && node) {
        // Find the closest paragraph or block element
        const paragraph = (node as HTMLElement).closest('p, h1, h2, h3, li, div');
        
        if (paragraph && editorRef.current.contains(paragraph) && paragraph !== editorRef.current) {
            const text = (paragraph as HTMLElement).innerText;
            if (text.trim().length > 0) {
                setMode('paragraph');
                setActiveText(text);
                
                // create a range for the whole paragraph so we can replace it if needed
                const range = document.createRange();
                range.selectNodeContents(paragraph);
                setSelectionRange(range);
                return;
            }
        }
    }

    // SCENARIO 3: Fallback to Global
    setMode('global');
    setActiveText("");
    setSelectionRange(null);
  };

  // Run Global AI Analysis
  const runGlobalAnalysis = async () => {
    setIsProcessing(true);
    const text = editorRef.current?.innerText || "";
    const prompt = `Bu metni bir ürün incelemesi gibi analiz et. 5 üzerinden puan ver ve geliştirilmesi gereken 2 spesifik noktayı Türkçe olarak listele. Metin: "${text.substring(0, 500)}..."`;
    const response = await generateText(prompt);
    setFeedback(response);
    setIsProcessing(false);
  };

  // Run AI Action (Replace Text via Buttons)
  const runAiAction = async (action: 'shorter' | 'article' | 'tone' | 'grammar' | 'rewrite' | 'continue') => {
    if (!activeText) return;
    setIsProcessing(true);
    
    try {
        const result = await rewriteText(activeText, action);
        applyResult(result, action === 'continue' ? 'append' : 'replace');
    } catch (e) {
        console.error(e);
        setFeedback("AI işlemi sırasında bir hata oluştu.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Run Custom User Command (Chat)
  const handleCustomSubmit = async () => {
      if (!customPrompt.trim()) return;
      setIsProcessing(true);
      setFeedback(null);

      try {
          let contextText = "";
          // If in global mode, context is the whole doc (or whatever is in editor)
          if (mode === 'global') {
               contextText = editorRef.current?.innerText || "";
          } else {
               contextText = activeText;
          }

          const result = await processCustomCommand(contextText, customPrompt);

          if (result.action === 'answer') {
              // Just show feedback, don't touch text
              setFeedback(result.text);
          } else {
              // It is 'replace' or 'append'
              if (mode === 'global') {
                  // If global, we append to the end of document usually, 
                  // or if it's empty, we just insert.
                  editorRef.current?.focus();
                  
                  // Move cursor to end
                  const selection = window.getSelection();
                  selection?.selectAllChildren(editorRef.current!);
                  selection?.collapseToEnd();
                  
                  // Add a newline if appending to existing text
                  const prefix = (editorRef.current?.innerText.trim().length || 0) > 0 ? "\n\n" : "";
                  document.execCommand('insertText', false, prefix + result.text);
                  
                  handleInput(); // Update word count
              } else {
                  // Selection or Paragraph mode
                  applyResult(result.text, result.action);
              }
          }
          setCustomPrompt("");
      } catch (e) {
          console.error(e);
          setFeedback("Komut işlenirken hata oluştu.");
      } finally {
          setIsProcessing(false);
      }
  };

  // Helper to apply text changes to editor
  const applyResult = (text: string, type: 'replace' | 'append') => {
    if (selectionRange) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(selectionRange);
        
        if (type === 'append') {
             selection?.collapseToEnd();
             // Add a space if likely continuing a sentence
             document.execCommand('insertText', false, " " + text);
        } else {
             document.execCommand('insertText', false, text);
        }
        
        handleInput();
        // After edit, usually the selection is collapsed, so update context to see where we are
        // setTimeout(() => updateContext(), 0); 
    }
  };

  // Formatting
  const handleFormat = (cmd: string, e?: React.MouseEvent) => {
    e?.preventDefault(); 
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  };

  return (
    <div className="flex-1 bg-[#f5f5f7] flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="py-3 px-4 md:px-8 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={onBack} className="text-gray-400 hover:text-dark flex items-center gap-1 transition-colors cursor-pointer">
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            Market
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-bold text-dark">{title}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Canlı
            </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT: Editor Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center bg-[#f5f5f7] relative" onClick={() => editorRef.current?.focus()}>
            <div className="w-full max-w-[800px]">
                {/* Floating Toolbar - Always visible when creating content */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-floating p-2 mb-6 flex items-center gap-2 justify-center mx-auto w-fit transition-all hover:scale-105">
                    <button onMouseDown={(e) => handleFormat('bold', e)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 font-bold cursor-pointer" title="Kalın">B</button>
                    <button onMouseDown={(e) => handleFormat('italic', e)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 italic cursor-pointer" title="İtalik">I</button>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <button onMouseDown={(e) => handleFormat('h2', e)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 font-bold text-sm cursor-pointer">H2</button>
                    <button onMouseDown={(e) => handleFormat('insertUnorderedList', e)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"><span className="material-symbols-rounded text-xl">format_list_bulleted</span></button>
                </div>

                {/* The Paper */}
                <div 
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onMouseUp={updateContext}
                    onKeyUp={updateContext}
                    onClick={updateContext}
                    className="bg-white min-h-[1000px] shadow-card rounded-sm p-12 md:p-16 text-lg text-gray-800 leading-relaxed outline-none font-serif relative focus:ring-1 focus:ring-gray-200"
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    <h1 className="text-3xl font-bold mb-6 text-black">{title}</h1>
                    <p>Serah Market'e hoş geldiniz. Burası akıllı bir atölyedir.</p>
                    <p className="mt-4">İşlevleri test etmek için:</p>
                    <ul>
                        <li>Herhangi bir kelimeyi <strong>seçin</strong> (tarayın).</li>
                        <li>Veya sadece bu paragrafın içine <strong>tıklayın</strong>.</li>
                    </ul>
                    <p className="mt-4">Sağ taraftaki panelin anında nasıl değiştiğini göreceksiniz. İsterseniz aşağıdaki kutucuğa "Bunu daha resmi yap" veya "İngilizceye çevir" gibi kendi komutlarınızı yazabilirsiniz.</p>
                </div>
            </div>
        </div>

        {/* RIGHT: AI Assistant Panel (Dynamic & Fixed Footer) */}
        <div className="w-full md:w-[360px] bg-white border-l border-gray-200 z-10 shadow-[-5px_0_20px_rgba(0,0,0,0.02)] flex flex-col h-full">
            
            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* Feedback/Answer Area (Shows up for Questions) */}
                {feedback && (
                    <div className="bg-light rounded-xl p-4 border border-brand/20 mb-6 animate-fade-in shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-brand font-bold text-xs uppercase tracking-wider">
                            <span className="material-symbols-rounded text-sm">smart_toy</span>
                            Asistan Yanıtı
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed markdown-body">
                            {feedback}
                        </div>
                    </div>
                )}

                {/* MODE: SELECTION */}
                {mode === 'selection' && (
                    <div className="animate-fade-in flex flex-col">
                        <div className="border-b border-brand/20 pb-4 mb-6">
                            <div className="flex items-center gap-2 text-brand font-bold mb-1">
                                <span className="material-symbols-rounded animate-spin">settings</span>
                                <span>SEÇİM DÜZENLEME</span>
                            </div>
                            <p className="text-xs text-gray-500">Vurgulanan metin için araçlar.</p>
                        </div>

                        <div className="bg-brand/5 p-3 rounded-xl border border-brand/10 mb-6 max-h-24 overflow-y-auto custom-scrollbar">
                            <p className="text-xs text-gray-600 italic font-serif">"{activeText}"</p>
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => runAiAction('shorter')} disabled={isProcessing} className="btn-ai-action">
                                <div className="flex items-center gap-3">
                                    <span className="icon-box bg-blue-100 text-blue-600">compress</span>
                                    <span>Kısalt</span>
                                </div>
                            </button>
                            <button onClick={() => runAiAction('grammar')} disabled={isProcessing} className="btn-ai-action">
                                <div className="flex items-center gap-3">
                                    <span className="icon-box bg-green-100 text-green-600">spellcheck</span>
                                    <span>Dil Bilgisi Düzelt</span>
                                </div>
                            </button>
                            <button onClick={() => runAiAction('rewrite')} disabled={isProcessing} className="btn-ai-action">
                                <div className="flex items-center gap-3">
                                    <span className="icon-box bg-purple-100 text-purple-600">refresh</span>
                                    <span>Yeniden Yaz</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: PARAGRAPH */}
                {mode === 'paragraph' && (
                    <div className="animate-fade-in flex flex-col">
                        <div className="border-b border-blue-100 pb-4 mb-6">
                            <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                                <span className="material-symbols-rounded animate-pulse">edit_note</span>
                                <span>PARAGRAF ODAK</span>
                            </div>
                            <p className="text-xs text-gray-500">Bu blok üzerinde çalışıyorsunuz.</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6 relative">
                            <div className="absolute -left-1 top-4 w-1 h-8 bg-blue-500 rounded-r"></div>
                            <p className="text-xs text-gray-500 line-clamp-3 pl-2">"{activeText}"</p>
                        </div>

                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">YAZAR ASİSTANI</h3>
                        <div className="space-y-3">
                            <button onClick={() => runAiAction('continue')} disabled={isProcessing} className="btn-ai-action ring-2 ring-blue-500/10">
                                <div className="flex items-center gap-3">
                                    <span className="icon-box bg-blue-600 text-white shadow-md shadow-blue-200">auto_awesome</span>
                                    <div className="flex flex-col items-start">
                                        <span className="text-dark font-bold">Devamını Getir</span>
                                        <span className="text-[10px] text-gray-400 font-normal">AI bu cümleyi tamamlasın</span>
                                    </div>
                                </div>
                            </button>

                            <button onClick={() => runAiAction('tone')} disabled={isProcessing} className="btn-ai-action">
                                <div className="flex items-center gap-3">
                                    <span className="icon-box bg-orange-100 text-orange-600">style</span>
                                    <span>Daha Profesyonel Yap</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: GLOBAL */}
                {mode === 'global' && (
                    <div className="flex flex-col animate-fade-in">
                        <div className="border-b border-gray-100 pb-6 mb-6">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">GENEL BAKIŞ</span>
                            <div className="flex items-end gap-2 mt-1">
                                <h2 className="text-4xl font-display font-bold text-dark">{wordCount}</h2>
                                <span className="text-lg text-gray-500 font-medium mb-1">kelime</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <button 
                                onClick={runGlobalAnalysis}
                                disabled={isProcessing}
                                className="w-full bg-dark hover:bg-black text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isProcessing ? <span className="material-symbols-rounded animate-spin">refresh</span> : <span className="material-symbols-rounded">analytics</span>}
                                {isProcessing ? "ANALİZ EDİLİYOR..." : "GENEL ANALİZ YAP"}
                            </button>
                            
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    <strong>İpucu:</strong> Aşağıdaki kutuya komut yazarak:<br/>
                                    1. "Bunu özetle" diyerek <b>cevap alabilir</b>,<br/>
                                    2. "Bana bir hikaye yaz" diyerek <b>metin üretebilir</b>,<br/>
                                    3. "Daha kısa yap" diyerek <b>düzenleme yapabilirsiniz</b>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FIXED INPUT AREA */}
            <div className="p-4 border-t border-gray-200 bg-white relative">
                 {/* Loading Overlay for Input */}
                 {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex items-center justify-center gap-2 rounded-t-xl">
                        <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-brand animate-pulse">Serah yazıyor...</span>
                    </div>
                )}
                
                <div className="relative">
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleCustomSubmit();
                            }
                        }}
                        placeholder={
                            mode === 'global' ? "Soru sor veya 'Bana bir blog yazısı yaz' de..." : 
                            mode === 'selection' ? "Seçimi nasıl değiştireyim? (Örn: Daha kısa yap)" :
                            "Bu paragrafı nasıl düzenleyeyim?"
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 resize-none custom-scrollbar transition-all"
                        rows={mode === 'global' ? 2 : 3}
                    />
                    <button 
                        onClick={handleCustomSubmit}
                        disabled={isProcessing || !customPrompt.trim()}
                        className="absolute right-2 bottom-3 p-1.5 bg-dark text-white rounded-lg hover:bg-brand disabled:opacity-50 disabled:hover:bg-dark transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                        title="Gönder"
                    >
                        <span className="material-symbols-rounded text-lg">arrow_upward</span>
                    </button>
                </div>
            </div>

        </div>
      </div>
      
      {/* Styles for dynamic buttons */}
      <style>{`
        .btn-ai-action {
            width: 100%;
            background-color: white;
            border: 1px solid #e5e7eb;
            color: #1a1a1a;
            font-weight: 500;
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }
        .btn-ai-action:hover {
            border-color: #ff6b00;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .icon-box {
            padding: 6px;
            border-radius: 8px;
            font-family: 'Material Symbols Rounded';
            font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default Editor;