import fs from "fs";
import path from "path";
import inquirer from "inquirer";

// Função para mapear o diretório
function mapDirectory(dir, baseDir = dir) {
  let results = [];

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (path.basename(file) !== "node_modules") {
        results.push({ type: "directory", name: path.relative(baseDir, file) });
        results = results.concat(mapDirectory(file, baseDir));
      }
    } else {
      if (path.basename(file) !== "package-lock.json") {
        results.push({ type: "file", name: path.relative(baseDir, file) });
      }
    }
  });

  return results;
}

function formatDirectoryOutput(files) {
  let output = "";
  let currentIndentation = 0;

  files.forEach((file) => {
    const parts = file.name.split(path.sep);
    const depth = parts.length - 1;

    while (currentIndentation >= depth) {
      output += "\n";
      currentIndentation--;
    }

    if (file.type === "directory") {
      output += `${"|".repeat(depth)}${depth > 0 ? "/" : ""}${parts[depth]}/`;
      currentIndentation = depth;
    } else {
      output += `${"|".repeat(depth)}${depth > 0 ? "-" : ""}${parts[depth]}`;
    }

    output += "\n";
  });

  return output;
}

function getFileContents(files, baseDir) {
  let output = "";

  files.forEach((file) => {
    if (file.type === "file") {
      const filePath = path.resolve(baseDir, file.name);
      const content = fs.readFileSync(filePath, "utf-8");
      output += `\n=== ${file.name} ===\n${content}\n`;
    }
  });

  return output;
}

function generateCompleteDocumentation(files, baseDir) {
  const directoryStructure = formatDirectoryOutput(files);
  const fileContents = getFileContents(files, baseDir);
  return `${directoryStructure}\n${fileContents}`;
}

async function main() {
  const { dirPath, action } = await inquirer.prompt([
    {
      type: "input",
      name: "dirPath",
      message: "Insira o path relativo do projeto:",
      default: "../meu-projeto",
    },
    {
      type: "list",
      name: "action",
      message: "O que você gostaria de fazer?",
      choices: [
        { name: "Gerar a estrutura do diretório", value: "directory" },
        { name: "Gerar o conteúdo dos arquivos", value: "content" },
        { name: "Gerar a documentação completa (MARKDOWN)", value: "complete" },
      ],
    },
  ]);

  const resolvedPath = path.resolve(process.cwd(), dirPath);

  if (!fs.existsSync(resolvedPath)) {
    console.log("O diretório não existe.");
    return;
  }

  const files = mapDirectory(resolvedPath);

  if (action === "directory") {
    const output = formatDirectoryOutput(files);
    const outputPath = path.resolve(
      process.cwd(),
      "output",
      "directory_structure.txt"
    );
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output);
    console.log("Estrutura do diretório salva em:", outputPath);
  } else if (action === "content") {
    const output = getFileContents(files, resolvedPath);
    const outputPath = path.resolve(process.cwd(), "output", "content.txt");
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output);
    console.log("Conteúdo dos arquivos salvo em:", outputPath);
  } else if (action === "complete") {
    const output = generateCompleteDocumentation(files, resolvedPath);
    const outputPath = path.resolve(process.cwd(), "output", "doc.txt");
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output);
    console.log("Documentação completa salva em:", outputPath);
  }
}

main();
