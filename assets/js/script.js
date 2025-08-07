
        // Sidebar navigation
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        const contentSections = document.querySelectorAll('.content-section');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links and sections
                sidebarLinks.forEach(l => l.classList.remove('active'));
                contentSections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Show corresponding section
                const sectionId = link.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
            });
        });

        // Form submissions
        document.querySelector('.home-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Home page updated successfully!');
        });

        document.querySelector('.about-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('About page updated successfully!');
        });

        // Button actions
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.type !== 'submit') {
                btn.addEventListener('click', () => {
                    const action = btn.textContent.trim();
                    alert(`${action} functionality would be implemented here.`);
                });
            }
        });

        // Table actions
        document.querySelectorAll('.table-actions .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.textContent.trim();
                const row = btn.closest('tr');
                const title = row.cells[0].textContent;
                
                if (action === 'Delete') {
                    if (confirm(`Are you sure you want to delete "${title}"?`)) {
                        row.remove();
                        alert('Article deleted successfully!');
                    }
                } else {
                    alert(`${action} "${title}" functionality would be implemented here.`);
                }
            });
        });