
export default async function decorate(block) {
    const rows = [...block.children];
    var header = document.querySelector('header'); // Select the header element
    if (header) {
        header.parentNode.removeChild(header); // Remove the header element from its parent node
    }

    var footer = document.querySelector("footer"); // Select the header element
    if (footer) {
        footer.parentNode.removeChild(footer); // Remove the header element from its parent node
    }

    rows.forEach((row) => {
        const img = document.createElement('img');
        img.src = row.children[1].innerText.trim();;
        img.alt = 'Image';
        block.appendChild(img);
    });

    document.addEventListener('DOMContentLoaded', function() {

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
        setInterval(showNextImage, 1000);
    });



}
