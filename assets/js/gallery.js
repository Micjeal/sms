document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('load-more');
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-image');
    const captionText = document.getElementById('caption');
    const closeModal = document.querySelector('.close-modal');
    
    // Sample data for additional gallery items (in a real app, this would come from a server)
    const additionalItems = [
        {
            category: 'sports',
            title: 'Soccer Finals',
            description: 'Exciting match during the inter-school soccer tournament',
            image: 'images/school.jpeg'
        },
        {
            category: 'cultural',
            title: 'Drama Performance',
            description: 'Students performing in the annual school play',
            image: 'images/school.jpeg'
        },
        {
            category: 'academic',
            title: 'Robotics Workshop',
            description: 'Students building robots in the STEM workshop',
            image: 'images/school.jpeg'
        },
        {
            category: 'graduation',
            title: 'Award Ceremony',
            description: 'Recognizing outstanding academic achievements',
            image: 'images/school.jpeg'
        },
        {
            category: 'trips',
            title: 'Historical Site Visit',
            description: 'Learning about local history on a field trip',
            image: 'images/school.jpeg'
        }
    ];

    // Filter gallery items
    function filterGallery(category) {
        galleryItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                // Add animation class
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update active button
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Scroll to gallery section
        document.querySelector('.gallery-container').scrollIntoView({ behavior: 'smooth' });
    }

    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            filterGallery(filterValue);
        });
    });

    // Load more items
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            const galleryGrid = document.querySelector('.gallery-grid');
            
            // In a real app, you would fetch more items from a server
            // For this example, we'll use the sample data
            additionalItems.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'gallery-item';
                itemElement.dataset.category = item.category;
                itemElement.style.animation = `fadeInUp 0.5s ease ${0.1 * (index + 1)}s forwards`;
                
                itemElement.innerHTML = `
                    <div class="gallery-image-container">
                        <img src="${item.image}" alt="${item.title}" class="gallery-image">
                        <div class="gallery-overlay">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                        </div>
                    </div>
                `;
                
                // Add click event to new items
                itemElement.addEventListener('click', function() {
                    openModal(item.image, item.title, item.description);
                });
                
                galleryGrid.appendChild(itemElement);
            });
            
            // Hide the button after loading
            loadMoreBtn.style.display = 'none';
        });
    }

    // Open modal with image
    function openModal(imageSrc, title, description) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        modalImg.src = imageSrc;
        modalImg.alt = title;
        captionText.textContent = description || title;
        
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModalFunc() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Add click events to gallery items
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const title = item.querySelector('h3')?.textContent || 'Image';
        const desc = item.querySelector('p')?.textContent || '';
        
        item.addEventListener('click', () => {
            openModal(img.src, title, desc);
        });
    });

    // Close modal when clicking the close button
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModalFunc();
        }
    });

    // Initialize the gallery with 'all' filter
    filterGallery('all');
});
