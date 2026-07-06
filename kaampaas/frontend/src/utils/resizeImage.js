// Resizes an image file entirely in the browser and returns BOTH:
//   - dataUrl: for an instant local preview while the real upload happens
//   - blob: the actual compressed image data, sent to Cloudinary
// Resizing client-side keeps the upload small and fast regardless of how
// large the original photo from the phone's camera was.
export const resizeImageFile = (file, maxDimension = 400, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not compress image"));
              return;
            }
            resolve({ dataUrl, blob });
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Could not read image"));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
};
