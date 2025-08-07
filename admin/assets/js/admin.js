// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    setupSidebarNavigation();
    setupFormHandlers();
    setupTableActions();
    animateStats();
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            
            const sectionId = link.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function setupFormHandlers() {
    document.querySelector('.home-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showMessage('Home page updated successfully!');
    });

    document.querySelector('.about-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showMessage('About page updated successfully!');
    });

    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.type !== 'submit') {
            btn.addEventListener('click', () => {
                const action = btn.textContent.trim();
                showMessage(`${action} functionality activated.`);
            });
        }
    });
}

function setupTableActions() {
    document.querySelectorAll('.table-actions .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.textContent.trim();
            const row = btn.closest('tr');
            const title = row.cells[0].textContent;
            
            if (action === 'Delete') {
                if (confirm(`Delete "${title}"?`)) {
                    row.remove();
                    showMessage('Item deleted successfully!');
                }
            } else {
                showMessage(`${action} "${title}" activated.`);
            }
        });
    });
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/[^\d]/g, ''));
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = stat.textContent.replace(/[\d,]/g, '');
            stat.textContent = Math.floor(current) + suffix;
        }, 30);
    });
}

function showMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: #1a365d;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}