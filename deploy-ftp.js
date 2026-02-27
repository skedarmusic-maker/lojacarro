const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        console.log("Conectando ao FTP Hostinger...");
        await client.access({
            host: "147.93.14.87",
            user: "u786839041.site.softenglish.com.br",
            password: "1q2w3e4r@@@SK",
            secure: false
        });
        console.log("Conectado!");

        // Faz o upload seguro de uma pasta ignorando cache
        async function uploadCustomDir(localDir, remoteDir, ignore = []) {
            console.log(`Lendo ${localDir} ...`);
            const entries = fs.readdirSync(localDir, { withFileTypes: true });
            await client.ensureDir(remoteDir);
            await client.cd("/"); // resetar o dir atual no ftp

            for (let entry of entries) {
                if (ignore.includes(entry.name)) continue;

                const localPath = path.join(localDir, entry.name);
                const rmPath = remoteDir === "/" ? `/${entry.name}` : `${remoteDir}/${entry.name}`;

                if (entry.isDirectory()) {
                    await uploadCustomDir(localPath, rmPath, ignore);
                } else {
                    console.log(`Upload: ${rmPath}`);
                    await client.uploadFrom(localPath, rmPath);
                }
            }
        }

        console.log("Enviando Configs...");
        await client.uploadFrom("package.json", "/package.json");
        await client.uploadFrom("next.config.ts", "/next.config.ts");
        if (fs.existsSync(".env.local")) {
            await client.uploadFrom(".env.local", "/.env.local");
        }

        console.log("Enviando public/...");
        await uploadCustomDir(path.join(__dirname, "public"), "/public");

        console.log("Enviando .next/ (Ignorando cache)...");
        await uploadCustomDir(path.join(__dirname, ".next"), "/.next", ["cache", "trace"]);

        console.log("Enviando src/...");
        await uploadCustomDir(path.join(__dirname, "src"), "/src");

        console.log("UPLOAD DO PROJETO CONCLUIDO COM SUCESSO!");
    }
    catch (err) {
        console.error("Erro no FTP:", err);
    }
    client.close();
}

deploy();
