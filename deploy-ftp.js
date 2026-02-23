const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Conectando ao FTP Hostinger...");
        await client.access({
            host: "147.93.14.87",
            user: "u786839041.site.softenglish.com.br",
            password: "1q2w3e4r@@@SK",
            secure: false
        });
        console.log("Conectado! Fazendo upload dos arquivos...");

        // Envia todos os arquivos essenciais para rodar o Next.js
        await client.ensureDir("/");

        console.log("Enviando package.json e config...");
        await client.uploadFrom(path.join(__dirname, "package.json"), "package.json");
        await client.uploadFrom(path.join(__dirname, "next.config.ts"), "next.config.ts");
        if (require('fs').existsSync(path.join(__dirname, ".env.local"))) {
            await client.uploadFrom(path.join(__dirname, ".env.local"), ".env.local");
        }

        console.log("Enviando pastas public/, src/ e .next/...");
        console.log("Nota: o upload de milhares de arquivos (node_modules, .next) pode demorar via FTP.");

        await client.uploadFromDir(path.join(__dirname, "public"), "public");
        await client.uploadFromDir(path.join(__dirname, "src"), "src");
        await client.uploadFromDir(path.join(__dirname, ".next"), ".next");

        console.log("Upload concluído com sucesso!");
    }
    catch (err) {
        console.error("Erro no FTP:", err);
    }
    client.close();
}

deploy();
