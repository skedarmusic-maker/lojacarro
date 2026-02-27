/**
 * Utilitário para otimização de imagens no Client-Side (Navegador).
 * Imita o padrão de grandes portais como Webmotors:
 * - Resolução Máxima: 1920x1440 pixels
 * - Aspect Ratio Forçado: 4:3 (Cortado via Object Cover)
 * - Formato de Saída: JPEG
 * - Qualidade de Compressão: 75%
 */

export const compressImageToWebmotorsStandard = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Se já não for imagem, aborta
        if (!file.type.startsWith('image/')) {
            reject(new Error('Formato de arquivo não suportado.'));
            return;
        }

        const TARGET_WIDTH = 1920;
        const TARGET_HEIGHT = 1440;
        const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT;
        const IMAGE_QUALITY = 0.75; // 75% JPG quality

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            // Calcular dimensões para o "corte perfeito" (object-cover 4:3)
            let sourceWidth = img.width;
            let sourceHeight = img.height;
            let sourceX = 0;
            let sourceY = 0;

            const sourceRatio = sourceWidth / sourceHeight;

            if (sourceRatio > TARGET_RATIO) {
                // Imagem original é mais "larga" que 4:3. Cortar as laterais.
                sourceWidth = sourceHeight * TARGET_RATIO;
                sourceX = (img.width - sourceWidth) / 2;
            } else if (sourceRatio < TARGET_RATIO) {
                // Imagem original é mais "alta" que 4:3. Cortar topo e base.
                sourceHeight = sourceWidth / TARGET_RATIO;
                sourceY = (img.height - sourceHeight) / 2;
            }

            // O target dimension será extamente 1920x1440, a menos que a imagem
            // original já seja muito menor que isso.
            let renderWidth = TARGET_WIDTH;
            let renderHeight = TARGET_HEIGHT;

            // Prevenção de Upscaling excessivo (esticar foto muito pequena)
            if (sourceWidth < TARGET_WIDTH && sourceHeight < TARGET_HEIGHT) {
                renderWidth = sourceWidth;
                renderHeight = sourceHeight;
            }

            // Iniciar Canvas HTML5
            const canvas = document.createElement('canvas');
            canvas.width = renderWidth;
            canvas.height = renderHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Navegador não suporta Canvas 2D.'));
                return;
            }

            // Para garantir que PNGs com fundo transparente não fiquem pretos em JPG,
            // Preenchemos o fundo com branco primeiro.
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, renderWidth, renderHeight);

            // Desenhar imagem com o Crop Matemático
            ctx.drawImage(
                img,
                sourceX, // Início X (Corte Esquerdo)
                sourceY, // Início Y (Corte Topo)
                sourceWidth, // Largura a capturar
                sourceHeight, // Altura a capturar
                0, // Desenhar a partir de X do Canvas
                0, // Desenhar a partir de Y do Canvas
                renderWidth, // Lagura Final
                renderHeight // Altura Final
            );

            // Sugar o bitmap final como JPEG 75%
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Falha na compressão do Canvas.'));
                        return;
                    }

                    // Gera um nome único mantendo a extensão original, mas garantindo output jpg
                    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                    const finalFileName = `${originalNameWithoutExt}-otimizado.jpg`;

                    // Transforma o Blob de volta no tipo File aceito pelo FormData
                    const optimizedFile = new File([blob], finalFileName, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    resolve(optimizedFile);
                },
                'image/jpeg',
                IMAGE_QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Falha ao parsear imagem original.'));
        };

        // Trigger load
        img.src = objectUrl;
    });
};
