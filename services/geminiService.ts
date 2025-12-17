import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini client safely
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY is missing. Gemini features will be mocked or disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, modelName: string = 'gemini-2.5-flash'): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing.";

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Hata oluştu.";
    }
};

// New Structured Command Processor
export const processCustomCommand = async (contextText: string, userCommand: string): Promise<{ action: 'replace' | 'append' | 'answer', text: string }> => {
    const ai = getClient();
    if (!ai) return { action: 'answer', text: "API Key eksik." };

    const prompt = `Sen profesyonel bir yazar asistanısın.
    
    BAĞLAM METNİ: "${contextText.substring(0, 10000)}"
    KULLANICI EMRİ: "${userCommand}"
    
    GÖREV: Kullanıcının emrini analiz et ve aşağıdaki 3 aksiyondan birine karar ver:
    
    1. 'replace': Kullanıcı mevcut metni değiştirmek, yeniden yazmak, çevirmek veya düzeltmek istiyorsa. (Örn: "Daha resmi yap", "Kısalt", "İngilizceye çevir")
       -> 'text' alanına SADECE yeni metni koy.
       
    2. 'append': Kullanıcı metnin devamını getirmek veya yeni bir şeyler eklemek istiyorsa. (Örn: "Devam et", "Sonuç paragrafı ekle", "Bir madde daha ekle")
       -> 'text' alanına SADECE eklenecek yeni kısmı koy.
       
    3. 'answer': Kullanıcı metin hakkında bir soru soruyorsa veya bir analiz istiyorsa ve metni değiştirmek istemiyorsa. (Örn: "Özetle", "Tonu nasıl?", "Hata var mı?")
       -> 'text' alanına sorunun cevabını koy.
       
    Çıktı JSON formatında olmalı ve dil Türkçe olmalı.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['replace', 'append', 'answer'] },
                        text: { type: Type.STRING }
                    },
                    required: ['action', 'text']
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        return json;
    } catch (e) {
        console.error(e);
        return { action: 'answer', text: "İsteği işlerken bir sorun oluştu." };
    }
};

export const rewriteText = async (text: string, style: 'shorter' | 'rewrite' | 'tone' | 'bullet' | 'article' | 'grammar' | 'continue'): Promise<string> => {
    let prompt = "";
    // Strict prompts to avoid conversational filler
    const strictInstruction = "Provide ONLY the result text. Do not add quotes, do not add 'Here is the text', do not add headers.";
    
    switch (style) {
        case 'shorter':
            prompt = `Make the following text shorter and more concise (keep the language same as input). ${strictInstruction}\n\n"${text}"`;
            break;
        case 'rewrite':
            prompt = `Rewrite the following text using different words but keeping the same meaning (keep the language same as input). ${strictInstruction}\n\n"${text}"`;
            break;
        case 'tone':
            prompt = `Change the tone of the following text to be more professional (keep the language same as input). ${strictInstruction}\n\n"${text}"`;
            break;
        case 'bullet':
            prompt = `Convert the following text into a bulleted list (keep the language same as input). ${strictInstruction}\n\n"${text}"`;
            break;
        case 'article':
            prompt = `Expand the following text into a well-written paragraph (keep the language same as input). ${strictInstruction}\n\n"${text}"`;
            break;
        case 'grammar':
            prompt = `Fix grammar/spelling mistakes (keep the language same as input). Returns original text if no errors. ${strictInstruction}\n\n"${text}"`;
            break;
        case 'continue':
            prompt = `Continue writing from this text naturally (keep the language same as input). Provide only the new added sentences. ${strictInstruction}\n\n"${text}"`;
            break;
    }

    return await generateText(prompt);
};