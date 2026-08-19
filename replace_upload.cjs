const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalPublisher.tsx', 'utf8');

const target = `  const handleMediaUpload = (type: "image" | "video" | "file") => {
    requestPermission(type === "file" ? "files" : "photos", () => {
      handleTap();
      // Simulate selection & progressive compressing`;

const replacement = `  const handleMediaUpload = (type: "image" | "video" | "file") => {
    requestPermission(type === "file" ? "files" : "photos", () => {
      handleTap();

      if (type === "image") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            setUploadProgress(10);
            setUploadPhase(isArabic ? "جارٍ ضغط وتجهيز الملف..." : "Compressing media files...");
            try {
              const { compressImage } = await import('../utils/imageUtils');
              const base64 = await compressImage(file, 800);
              const newAttachment = {
                id: Math.random().toString(),
                type,
                url: base64
              };
              setAttachments(prev => [...prev, newAttachment]);
              if (playSynthSound) playSynthSound("success");
            } catch (err) {
              console.error(err);
            } finally {
              setUploadProgress(null);
            }
          }
        };
        input.click();
        return;
      }

      // Simulate selection & progressive compressing`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/UniversalPublisher.tsx', content);
