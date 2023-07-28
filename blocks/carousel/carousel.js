
export default async function decorate(block) {
    const rows = [...block.children];
    const header = document.querySelector('header');
    if (header) {
        header.remove();
    }

    const footer = document.querySelector("footer");
    if (footer) {
        footer.remove();
    }

    // rows.forEach((row) => {
    //     const img = document.createElement('img');
    //     img.src = row.children[1].children[0].href
    //     img.alt = 'Image';
    //     block.appendChild(img);
    // });

    let currentIndex = 0;
    function displayNextAsset() {
        block.innerHTML = '';
        const img = document.createElement('img');
        img.src = rows[currentIndex].children[1].children[0].href
        img.alt = 'Image';
        block.appendChild(img);
        currentIndex = (currentIndex + 1) % rows.length;
    }




    // // Function to show the next image
    // function showNextImage() {
    //     currentIndex = (currentIndex + 1) % rows.length;
    //     updateCarousel();
    // }
    //
    // // Function to update the carousel position
    // function updateCarousel() {
    //     block.style.transform = `translateX(-${currentIndex * 100}%)`;
    // }
    //
    // // Set an interval to automatically show the next image every 3 seconds
    setInterval(displayNextAsset, 1000);

}
