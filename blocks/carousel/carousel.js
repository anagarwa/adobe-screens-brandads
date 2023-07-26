
export default async function decorate(block) {
    const rows = [...block.children];
    // const img1 = rows[0]?.children[1].innerText.trim();
    // const img2 = rows[1]?.children[1].innerText.trim();
    // const img3 = rows[2]?.children[1].innerText.trim();
    document.removeChild('header');
    document.removeChild('footer');
    //block.parentElement.classList.add('default-content-wrapper');
    //block.textContent = `${img1} and ${img2}`;

   // const carouselContainer = document.getElementById('carousel-container');
    //const carousel = block.createElement('div');
    //carousel.classList.add('carousel');

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
