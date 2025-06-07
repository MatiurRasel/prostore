import sharp from 'sharp';

export const resizeImage = async (
    buffer: Buffer,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
    } = {}
) => {
    const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'webp'
    } = options;

    try {
        const resizedImage = await sharp(buffer)
            .resize(width, height, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFormat(format, { quality })
            .toBuffer();

        return resizedImage;
    } catch (error) {
        console.error('Error resizing image:', error);
        throw new Error('Failed to resize image');
    }
};

export const getImageDimensions = async (buffer: Buffer) => {
    try {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0
        };
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        throw new Error('Failed to get image dimensions');
    }
}; 