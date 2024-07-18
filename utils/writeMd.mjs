import { writeFile, readFile } from "fs/promises";

async function writeReadMe(conteudo) {
  const pathDoArquivo = "./README.md";

  try {
    await writeFile(pathDoArquivo, conteudo, "utf8");
    console.log(`Arquivo README.md criado com sucesso em: ${pathDoArquivo}`);
  } catch (error) {
    console.error(`Erro ao escrever o arquivo README.md:`, error);
    throw error;
  }
}

async function readTextFile(path) {
  try {
    const conteudo = await readFile(path, "utf8");
    return conteudo;
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${path}:`, error);
    throw error;
  }
}

export { writeReadMe, readTextFile };
