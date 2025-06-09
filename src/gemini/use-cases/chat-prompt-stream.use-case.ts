import { Content, createPartFromUri, GoogleGenAI } from '@google/genai';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';
import { geminiUploadFiles } from '../helpers/gemini-upload-file';

interface Options {
  model?: string;
  systemInstruction?: string;
  history: Content[];
}

export const chatPromptStreamUseCase = async (
  ai: GoogleGenAI,
  chatPromptDto: ChatPromptDto,
  options?: Options,
) => {
  const { prompt, files = [] } = chatPromptDto;
  const uploadedFiles = await geminiUploadFiles(ai, files);

  const {
    model = 'gemini-2.0-flash',
    history = [],
    systemInstruction = 'Responde únicamente en español, en formato markdown. Además, necesito que solo respondas preguntas relacionada al ámbito de la programación (dudas de lenguajes como C, C++, Java, Python, HTML, CSS, JavaScript, TypeScript, Kotlin y otros más). No quiero respuestas que incluyan groserías, limita tu lenguaje a la formalidad. Da formato distintivo a los códigos que generes al responder (en caso de que generes alguno). No generes código que solucione el problema del usuario (por ejemplo, si el usuario te pide generar el código de algo) a menos que el usuario te haya dado su código previamente, de no ser así especificale que eres una herramienta que está destinada a retroalimentar el aprendizaje, si el usuario está teniendo problemas con su código, sugierele qué herramientas, funciones y demás puede utilizar, más no soluciones el código por tu cuenta. Puedes también evaluar el código del usuario, su eficencia y si está correcto o no.',
  } = options ?? {};

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history,
  });

  return chat.sendMessageStream({
    message: [
      prompt,
      ...uploadedFiles.map((file) =>
        createPartFromUri(file.uri ?? '', file.mimeType ?? ''),
      ),
    ],
  });
};
