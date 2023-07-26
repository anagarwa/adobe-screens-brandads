
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
    block.textContent = '';
    rows.forEach((row) => {
        const img = document.createElement('img');
        img.src = row.children[1].innerText.trim();;
        img.alt = 'Image';
        block.appendChild(img);
    });

    let currentIndex = 0;

    // Function to show the next image
    function showNextImage() {
        currentIndex = (currentIndex + 1) % rows.length;
        updateCarousel();
    }

    // Function to update the carousel position
    function updateCarousel() {
        block.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Set an interval to automatically show the next image every 3 seconds
    setInterval(showNextImage, 2000);

}
