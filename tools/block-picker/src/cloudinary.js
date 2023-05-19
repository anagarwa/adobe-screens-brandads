export default function openCloudinary(win) {
  const writeToClipboard = async (blob) => {
    // eslint-disable-next-line no-undef
    const data = [new ClipboardItem({ [blob.type]: blob })];
    try {
      await win.navigator.clipboard.write(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };
  const openWidget = () => {
    if (win.cloudinaryWidget) {
      win.cloudinaryWidget.show();
      return;
    }

    const options = {
      cloud_name: 'fc-bayern',
      api_key: '283459263551562',
      username: 'mathias.staudigl@fcb.de',
      button_class: 'myBtn',
      button_caption: 'Insert Images',
      default_transformations: [
        [
          { quality: 'auto' },
          { fetch_format: 'auto' }],
        [
          {
            width: 80, height: 80, crop: 'fill', gravity: 'auto', radius: 'max',
          },
          { fetch_format: 'auto', quality: 'auto' },
        ],
      ],
    };
    win.cloudinaryWidget = win.cloudinary.openMediaLibrary(options, {
      insertHandler: async (payload) => {
        let html = '';
        payload.assets.forEach((asset) => {
          html += `<img src="${asset.derived[0]?.secure_url}" width="${asset.width}" height="${asset.height}" alt="${asset.public_id}">`;
        });
        const blob = new Blob([html], { type: 'text/html' });
        await writeToClipboard(blob);
        // eslint-disable-next-line no-console
        console.log('cloudinaryWidget copy done');
      },
    });
  };

  const script = document.createElement('script');
  script.src = 'https://media-library.cloudinary.com/global/all.js';
  document.head.appendChild(script);

  script.onload = () => {
    // eslint-disable-next-line no-console
    console.log('Cloudinary loaded');
    openWidget();
  };
}
