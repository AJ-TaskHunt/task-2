import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  maxSize = 2 * 1024 * 1024; // 2MB

  validateImage(file: File): string | null {

    if (!this.allowedTypes.includes(file.type)) {
      return 'Only JPG or PNG images are allowed';
    }

    if (file.size > this.maxSize) {
      return 'Image size must be less than 2MB';
    }

    return null;
  }

  resizeImage(file: File, maxWidth = 300, maxHeight = 300): Promise<File> {
    return new Promise(resolve => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width *= ratio;
        height *= ratio;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(blob => {
          resolve(new File([blob!], file.name, { type: file.type }));
        }, file.type, 0.9);
      };

      reader.readAsDataURL(file);
    });
  }

  getPreview(file: File): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
