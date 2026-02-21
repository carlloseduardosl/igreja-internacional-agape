
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Lista de versículos de reserva para garantir que o app nunca fique vazio
// em caso de erro 429 (Limite de cota excedido) ou falta de internet.
const fallbackVerses = [
  '"O Senhor é o meu pastor; nada me faltará." - Salmo 23:1',
  '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça." - João 3:16',
  '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
  '"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti." - Números 6:24-25',
  '"Mil cairão ao teu lado, e dez mil, à tua direita, mas tu não serás atingido." - Salmo 91:7',
  '"Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas." - Mateus 6:33',
  '"Se Deus é por nós, quem será contra nós?" - Romanos 8:31',
  '"O choro pode durar uma noite, mas a alegria vem pela manhã." - Salmo 30:5',
  '"Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá." - João 14:27',
  '"O Senhor é a minha luz e a minha salvação; a quem temerei?" - Salmo 27:1',
  '"Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento." - Provérbios 3:5',
  '"Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum." - Salmo 23:4',
  '"Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." - Salmo 119:105',
  '"Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos." - Filipenses 4:4',
  '"Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." - Mateus 11:28'
];

export const getDailyVerse = async () => {
  // Seleção determinística baseada no dia do mês para que todos os usuários 
  // vejam o mesmo versículo caso a API falhe.
  const dayOfMonth = new Date().getDate();
  const fallbackIndex = dayOfMonth % fallbackVerses.length;
  const staticVerse = fallbackVerses[fallbackIndex];

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Forneça um versículo bíblico inspirador e curto em português para hoje. O texto deve conter apenas o versículo entre aspas e a referência bíblica (Ex: "O Senhor é o meu pastor..." - Salmo 23:1).',
      config: {
        temperature: 0.8,
      }
    });
    
    const verseText = response.text?.trim();
    
    // Validamos se a IA retornou algo útil
    if (verseText && verseText.length > 10) {
      return verseText;
    }
    
    return staticVerse;
  } catch (error: any) {
    // Tratamento silencioso de erro de cota para o usuário final
    if (error?.message?.includes("429") || error?.status === 429) {
      console.info("Info: Limite de cota atingido. Usando versículo local programado.");
    } else {
      console.error("Erro técnico ao buscar versículo:", error);
    }
    
    return staticVerse;
  }
};

export const getLatestLiveStreamId = async (channelId: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Qual é o ID do vídeo da transmissão ao vivo (live) mais recente, ativa ou programada para o canal do YouTube ID ${channelId}? Responda APENAS com o ID do vídeo de 11 caracteres. Se não houver transmissão ativa ou programada, responda "live_stream".`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0,
      }
    });
    
    const videoId = response.text?.trim();
    if (videoId && videoId.length === 11 && videoId !== "live_stream") {
      return videoId;
    }
    return "live_stream";
  } catch (error) {
    console.error("Erro ao buscar live stream ID:", error);
    return "live_stream";
  }
};
