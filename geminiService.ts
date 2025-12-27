
import { GoogleGenAI, Type } from "@google/genai";
import { ApiResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string, mode: 'food' | 'body'): Promise<ApiResponse> => {
  if (!navigator.onLine) {
    throw new Error('NETWORK_ERROR');
  }

  const model = 'gemini-3-flash-preview';

  const foodSystemInstruction = `Вы — высокоточный ИИ-нутрициолог. 
  ВАША ЗАДАЧА: Определить состав еды.
  1. Если это еда: оцени калории, белки, жиры, углеводы.
  2. Дай совет: стоит ли это есть прямо сейчас (например, если это фастфуд на ночь - предупреди).
  3. Четко напиши, что в этом блюде полезно, а что вредно.`;

  const bodySystemInstruction = `Вы — топовый фитнес-тренер и эксперт по биомеханике. 
  Анализируй форму тела на фото. 
  - Напиши СТАТУС (тип телосложения, текущая кондиция).
  - СИЛЬНЫЕ СТОРОНЫ: Какие мышцы доминируют.
  - СЛАБЫЕ МЕСТА: Что нужно подтянуть.
  - ЧТО НЕЛЬЗЯ ДЕЛАТЬ: Ошибки в тренировках, которые могут навредить при таком строении.
  - РЕКОМЕНДАЦИИ: 4 конкретных упражнения для улучшения формы.`;

  const foodPrompt = `ПРОАНАЛИЗИРУЙ ЕДУ.
    Верни JSON:
    - name: Название
    - category: "food"
    - calories: Число
    - description: Подробно напиши "ЧТО НАДО" (полезные свойства) и "ЧТО НЕ НАДО" (вредные ингредиенты/сахар).
    - nutrition: { protein, carbs, fat, sugar, fiber }`;

  const bodyPrompt = `ПРОАНАЛИЗИРУЙ ТЕЛО. 
    Верни JSON:
    - name: "Анализ формы"
    - description: Краткий общий вывод.
    - category: "body"
    - bodyMetrics: {
        status: Текущая форма,
        strengths: "ЧТО НАДО ОСТАВИТЬ (Сильные стороны)",
        weaknesses: "ЧТО НАДО ПОДТЯНУТЬ (Слабые стороны)",
        missing: "ЧТО НЕ НАДО ДЕЛАТЬ (Ошибки и ограничения)",
        recommendations: [4 упражнения]
      }`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: mode === 'food' ? foodPrompt : bodyPrompt }
        ],
      },
      config: {
        systemInstruction: mode === 'food' ? foodSystemInstruction : bodySystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['food', 'beverage', 'body', 'other'] },
            calories: { type: Type.NUMBER },
            description: { type: Type.STRING },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
                sugar: { type: Type.STRING },
                fiber: { type: Type.STRING },
              }
            },
            bodyMetrics: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                strengths: { type: Type.STRING },
                weaknesses: { type: Type.STRING },
                missing: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["name", "category", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
