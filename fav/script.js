document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle functionality
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('minimized');
    });

    // Favorite button functionality
    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('.material-icons');
            if (icon.textContent === 'favorite_border') {
                icon.textContent = 'favorite';
            } else {
                icon.textContent = 'favorite_border';
            }
        });
    });

    // Navigation link functionality
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
        });
    });
}); 