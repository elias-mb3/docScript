import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeReadMe, readTextFile } from "./writeMd.mjs";

const createGenAIInstance = async () => {
  console.log("Gemini Instanciado");
  return new GoogleGenerativeAI(process.env.KEY_GENAI);
};

const generateContentForPrompt = async (model, prompt, dataParts) => {
  const genRes = await model.generateContent([prompt, dataParts]);
  return genRes.response.text();
};

const genAPI = async (prompt, dataParts) => {
  const genAI = await createGenAIInstance();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  const result = await generateContentForPrompt(model, prompt, dataParts);
  await writeReadMe(result);
};

async function run() {
  const inputDataPromise = readTextFile("../output/doc.txt");
  const promptDataPromise = readTextFile("../prompt/ptp.txt");

  try {
    const inputData = await inputDataPromise;
    const promptData = await promptDataPromise;

    await genAPI(promptData, inputData);
  } catch (error) {
    console.error("Erro ao gerar e escrever o README.md:", error);
  }
}
run();
