import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageResizerService {

  constructor() { }

  resizeImage(file: File, newWidth: number, newHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: file.type });
              resolve(resizedFile);
            } else {
              reject(new Error('Falha ao redimensionar a imagem.'));
            }
          }, file.type);
        };
      };

      reader.readAsDataURL(file);
    });
  }
}
