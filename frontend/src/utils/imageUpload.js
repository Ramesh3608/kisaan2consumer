// Converts an uploaded image file into a compressed base64 data URL so it can be
// stored directly on the Product document (no external file storage / S3 needed).
// Resizes to a max width/height to keep the payload small.
export function fileToCompressedBase64(file, maxSize = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    if (!file.type.startsWith("image/")) return reject(new Error("Please upload an image file"));
    if (file.size > 10 * 1024 * 1024) return reject(new Error("Image must be under 10MB"));

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
