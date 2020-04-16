const MAX_WIDTH = 500;
const MAX_HEIGHT = 400;

const resizeImg = (img) => {

  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX_WIDTH) {
      height = Math.round(height *= MAX_WIDTH / width);
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = Math.round(width *= MAX_HEIGHT / height);
      height = MAX_HEIGHT;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return {
    url: canvas.toDataURL('image/png', 0.8),
    resizedWidth: width
  };

};

const urlToBlob = (dataURL) => {
  const blobBin = atob(dataURL.split(',')[1]);
  const array = [];
  for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
  }
  const file = new Blob([new Uint8Array(array)], {type: 'image/png'});
  return file;
};

export default {
  resizeImg,
  urlToBlob
};
