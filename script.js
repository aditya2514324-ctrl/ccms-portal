document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       CUSTOM CURSOR
       ========================================== */
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });

        // Dynamic binds for hover states
        function bindCursorHover(elements) {
            elements.forEach(elem => {
                elem.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
                elem.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
            });
        }
        
        bindCursorHover(document.querySelectorAll('a, button, input, select, textarea, .action-trigger'));
    }

    /* ==========================================
       TOAST NOTIFICATION ENGINE
       ========================================== */
    const toastContainer = document.getElementById('toast-container');

    function showToast(title, desc, type = 'success') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconHtml = '<i class="fa-solid fa-circle-check toast-icon"></i>';
        if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-circle-exclamation toast-icon"></i>';
        } else if (type === 'info') {
            iconHtml = '<i class="fa-solid fa-circle-info toast-icon"></i>';
        }

        toast.innerHTML = `
            ${iconHtml}
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${desc}</div>
            </div>
            <button class="toast-close" aria-label="Close Toast"><i class="fa-solid fa-xmark"></i></button>
        `;

        toastContainer.appendChild(toast);

        // Slide In Animation
        setTimeout(() => toast.classList.add('show'), 50);

        // Auto Close
        const autoCloseTimeout = setTimeout(() => {
            closeToast(toast);
        }, 4000);

        // Close on Button Click
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoCloseTimeout);
            closeToast(toast);
        });

        // Re-bind cursor for the new elements
        if (cursor) {
            bindCursorHover(toast.querySelectorAll('.toast-close'));
        }
    }

    function closeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000); // Wait for transition out
    }


    /* ==========================================
       LOCALSTORAGE STATE & SEED DATA
       ========================================== */
    // Initialize DB if not present
    if (!localStorage.getItem('ccms_students')) {
        const defaultStudents = [
            {
                name: 'Aditya Mathur',
                email: 'student@college.edu',
                roll: 'CS-2024-001',
                password: 'password123' // Seeded plain password for demo purposes
            }
        ];
        localStorage.setItem('ccms_students', JSON.stringify(defaultStudents));
    }

    if (!localStorage.getItem('ccms_complaints')) {
        const defaultComplaints = [
            {
                id: 'CMP-82910',
                studentEmail: 'student@college.edu',
                title: 'Laboratory computer terminals crashing',
                category: 'laboratory',
                priority: 'Medium',
                status: 'In Progress',
                desc: 'The computer terminals in Lab 3 are frequently crashing during our programming sessions, particularly terminals 4, 7, and 12. Please look into the operating system updates.',
                dateCreated: '2026-06-12T09:15:00.000Z'
            },
            {
                id: 'CMP-28102',
                studentEmail: 'student@college.edu',
                title: 'No water in Block B washrooms',
                category: 'washroom',
                priority: 'High',
                status: 'Resolved',
                desc: 'There is no running water in the washrooms located on the second floor of Block B. This issue has persisted since yesterday morning and causes sanitary issues.',
                dateCreated: '2026-06-10T11:30:00.000Z'
            },
            {
                id: 'CMP-38192',
                studentEmail: 'student@college.edu',
                title: 'Library Wi-Fi signal dropouts',
                category: 'wifi/internet',
                priority: 'Low',
                status: 'Pending',
                desc: 'The college Wi-Fi signal drops frequently in the quiet study zone of the library. It is difficult to access reference materials online for our thesis.',
                dateCreated: '2026-06-14T08:00:00.000Z'
            }
        ];
        localStorage.setItem('ccms_complaints', JSON.stringify(defaultComplaints));
    }

    // Helper functions to fetch data
    function getStudents() {
        return JSON.parse(localStorage.getItem('ccms_students')) || [];
    }

    function getComplaints() {
        return JSON.parse(localStorage.getItem('ccms_complaints')) || [];
    }

    function saveComplaints(complaints) {
        localStorage.setItem('ccms_complaints', JSON.stringify(complaints));
    }

    function saveStudents(students) {
        localStorage.setItem('ccms_students', JSON.stringify(students));
    }


    /* ==========================================
       AUTHENTICATION LOGIC (STUDENT)
       ========================================== */
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const registerFormWrapper = document.getElementById('register-form-wrapper');

    // Auth toggle navigation triggers
    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginFormWrapper.classList.remove('active');
        registerFormWrapper.classList.add('active');
    });

    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerFormWrapper.classList.remove('active');
        loginFormWrapper.classList.add('active');
    });

    // Forms Inputs
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');

    const registerForm = document.getElementById('register-form');
    const regName = document.getElementById('register-name');
    const regEmail = document.getElementById('register-email');
    const regRoll = document.getElementById('register-roll');
    const regPassword = document.getElementById('register-password');
    const regConfirmPassword = document.getElementById('register-confirm-password');

    // Login submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let hasError = false;
        
        // Reset state
        loginEmail.classList.remove('invalid');
        loginPassword.classList.remove('invalid');

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !email.includes('@')) {
            loginEmail.classList.add('invalid');
            hasError = true;
        }

        if (!password || password.length < 8) {
            loginPassword.classList.add('invalid');
            hasError = true;
        }

        if (hasError) return;

        // Check DB
        const students = getStudents();
        const matchedStudent = students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);

        if (matchedStudent) {
            // Set session
            localStorage.setItem('ccms_current_student', JSON.stringify(matchedStudent));
            showToast('Access Granted', 'Welcome to College Complaint Portal!', 'success');
            initSessionState();
        } else {
            showToast('Authentication Failed', 'Invalid email address or security password.', 'error');
            loginPassword.classList.add('invalid');
        }
    });

    // Registration submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Reset
        const inputs = [regName, regEmail, regRoll, regPassword, regConfirmPassword];
        inputs.forEach(i => i.classList.remove('invalid'));

        let hasError = false;

        const name = regName.value.trim();
        const email = regEmail.value.trim();
        const roll = regRoll.value.trim();
        const password = regPassword.value;
        const confirmPass = regConfirmPassword.value;

        // Name check
        if (name.length < 3) {
            regName.classList.add('invalid');
            hasError = true;
        }

        // Email check
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            regEmail.classList.add('invalid');
            hasError = true;
        }

        // Roll check
        if (!roll) {
            regRoll.classList.add('invalid');
            hasError = true;
        }

        // Password check (Min 8 chars, must contain at least 1 digit)
        if (password.length < 8 || !/\d/.test(password)) {
            regPassword.classList.add('invalid');
            hasError = true;
        }

        // Match pass
        if (password !== confirmPass) {
            regConfirmPassword.classList.add('invalid');
            hasError = true;
        }

        if (hasError) return;

        // Email duplicates check
        const students = getStudents();
        if (students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
            showToast('Registration Error', 'This email address is already registered.', 'error');
            regEmail.classList.add('invalid');
            return;
        }

        // Register new user
        const newStudent = { name, email, roll, password };
        students.push(newStudent);
        saveStudents(students);

        showToast('Registration Success', 'Account created! Please sign in.', 'success');
        
        // Return to login
        registerForm.reset();
        registerFormWrapper.classList.remove('active');
        loginFormWrapper.classList.add('active');
    });


    /* ==========================================
       SESSION & DASHBOARD MANAGEMENT
       ========================================== */
    let currentStudent = null;

    function initSessionState() {
        const sessionData = localStorage.getItem('ccms_current_student');
        
        if (sessionData) {
            currentStudent = JSON.parse(sessionData);
            
            // Set details in sidebar
            document.getElementById('user-display-name').textContent = currentStudent.name;
            document.getElementById('user-display-roll').textContent = `Roll: ${currentStudent.roll}`;
            
            // Switch viewports
            authContainer.style.display = 'none';
            appContainer.style.display = 'flex';

            // Show default panel
            showPanel('dashboard-view');
            updateDashboardData();
        } else {
            currentStudent = null;
            appContainer.style.display = 'none';
            authContainer.style.display = 'flex';
            loginForm.reset();
        }
    }

    // Logout triggers
    const logoutBtn = document.getElementById('btn-logout');
    const topLogoutBtn = document.getElementById('top-logout-btn');

    function handleLogout() {
        localStorage.removeItem('ccms_current_student');
        showToast('Session Closed', 'You have been successfully logged out.', 'info');
        initSessionState();
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (topLogoutBtn) topLogoutBtn.addEventListener('click', handleLogout);


    /* ==========================================
       SPA NAVIGATION ROUTER
       ========================================== */
    const sidebarLinks = document.querySelectorAll('.menu-link');
    const viewPanels = document.querySelectorAll('.view-panel');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    function showPanel(panelId) {
        viewPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === panelId) {
                panel.classList.add('active');
            }
        });

        // Set active menu link highlight
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === panelId) {
                link.classList.add('active');
            }
        });

        // Close sidebar on mobile after clicking
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }

        // Load targeted data
        if (panelId === 'dashboard-view') {
            updateDashboardData();
        } else if (panelId === 'my-complaints-view') {
            renderMyComplaints();
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            showPanel(target);
        });
    });

    // View All button on Dashboard
    document.querySelectorAll('.view-all-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            showPanel(trigger.getAttribute('data-target'));
        });
    });

    // Hamburger Mobile drawer trigger
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Close drawer clicking anywhere else
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
                sidebar.classList.remove('active');
            }
        });
    }


    /* ==========================================
       DASHBOARD POPULATE FUNCTIONS
       ========================================== */
    function updateDashboardData() {
        if (!currentStudent) return;

        const complaints = getComplaints().filter(c => c.studentEmail.toLowerCase() === currentStudent.email.toLowerCase());

        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'Pending' || c.status === 'Assigned' || c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;

        // Animate counter dashboard labels
        animateDashboardCounter('stat-total', total);
        animateDashboardCounter('stat-pending', pending);
        animateDashboardCounter('stat-resolved', resolved);

        // Populate recent complaints table (max 3)
        const recentComplaints = [...complaints]
            .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
            .slice(0, 3);

        const listContainer = document.getElementById('recent-complaints-list');
        if (listContainer) {
            if (recentComplaints.length === 0) {
                listContainer.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted">No complaints submitted yet.</td></tr>`;
            } else {
                listContainer.innerHTML = recentComplaints.map(c => `
                    <tr>
                        <td class="gold-text font-weight-bold">${c.id}</td>
                        <td>${c.title}</td>
                        <td style="text-transform: capitalize;">${getCategoryIcon(c.category)} ${c.category}</td>
                        <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
                        <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span></td>
                        <td>${formatDate(c.dateCreated)}</td>
                    </tr>
                `).join('');
            }
        }
    }

    function animateDashboardCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let startValue = 0;
        const duration = 800; // Counter timing ms
        const steps = Math.max(targetValue, 1);
        const stepTime = Math.floor(duration / steps);
        
        if (targetValue === 0) {
            element.textContent = '0';
            return;
        }

        const timer = setInterval(() => {
            startValue++;
            element.textContent = startValue;
            if (startValue >= targetValue) {
                clearInterval(timer);
            }
        }, stepTime);
    }


    /* ==========================================
       COMPLAINTS SEARCH AND FILTER TABLES
       ========================================== */
    const searchInput = document.getElementById('search-complaints-input');
    const filterCategory = document.getElementById('filter-category-select');
    const filterStatus = document.getElementById('filter-status-select');

    function renderMyComplaints() {
        if (!currentStudent) return;

        const complaints = getComplaints().filter(c => c.studentEmail.toLowerCase() === currentStudent.email.toLowerCase());
        const tableBody = document.getElementById('my-complaints-table-body');
        const emptyState = document.getElementById('table-empty-state');
        
        if (!tableBody) return;

        // Apply filters
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = filterCategory ? filterCategory.value : 'all';
        const status = filterStatus ? filterStatus.value : 'all';

        const filtered = complaints.filter(c => {
            const matchesQuery = c.title.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || c.category === category;
            const matchesStatus = status === 'all' || c.status === status;
            return matchesQuery && matchesCategory && matchesStatus;
        });

        // Toggle table empty messages
        if (filtered.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            tableBody.innerHTML = filtered.map(c => `
                <tr>
                    <td class="gold-text font-weight-bold">${c.id}</td>
                    <td>${c.title}</td>
                    <td style="text-transform: capitalize;">${getCategoryIcon(c.category)} ${c.category}</td>
                    <td><span class="badge badge-${c.priority.toLowerCase()}">${c.priority}</span></td>
                    <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span></td>
                    <td>${formatDate(c.dateCreated)}</td>
                    <td>
                        <button class="action-trigger" onclick="viewComplaintDetails('${c.id}')">View Details</button>
                    </td>
                </tr>
            `).join('');

            // Rebind custom cursor to triggers
            if (cursor) {
                bindCursorHover(tableBody.querySelectorAll('.action-trigger'));
            }
        }
    }

    // Attach filters event listeners
    if (searchInput) searchInput.addEventListener('input', renderMyComplaints);
    if (filterCategory) filterCategory.addEventListener('change', renderMyComplaints);
    if (filterStatus) filterStatus.addEventListener('change', renderMyComplaints);


    /* ==========================================
       COMPLAINTS FORM SUBMISSION
       ========================================== */
    const submitForm = document.getElementById('complaint-submission-form');
    const compTitle = document.getElementById('complaint-title');
    const compCategory = document.getElementById('complaint-category');
    const compPriority = document.getElementById('complaint-priority');
    const compDesc = document.getElementById('complaint-desc');
    const btnReset = document.getElementById('btn-reset-form');

    if (submitForm) {
        submitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear invalid flags
            const inputs = [compTitle, compCategory, compPriority, compDesc];
            inputs.forEach(i => i.classList.remove('invalid'));

            let hasError = false;

            const title = compTitle.value.trim();
            const category = compCategory.value;
            const priority = compPriority.value;
            const desc = compDesc.value.trim();

            if (title.length < 10 || title.length > 150) {
                compTitle.classList.add('invalid');
                hasError = true;
            }

            if (!category) {
                compCategory.classList.add('invalid');
                hasError = true;
            }

            if (desc.length < 20) {
                compDesc.classList.add('invalid');
                hasError = true;
            }

            if (hasError) return;

            // Generate Complaint Object
            const id = 'CMP-' + Math.floor(10000 + Math.random() * 90000);
            const newComplaint = {
                id,
                studentEmail: currentStudent.email,
                title,
                category,
                priority,
                status: 'Pending',
                desc,
                dateCreated: new Date().toISOString()
            };

            const allComplaints = getComplaints();
            allComplaints.push(newComplaint);
            saveComplaints(allComplaints);

            showToast('Complaint Submitted', `Tracking Code: ${id}`, 'success');

            // Reset and redirect
            submitForm.reset();
            showPanel('my-complaints-view');
        });

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const inputs = [compTitle, compCategory, compPriority, compDesc];
                inputs.forEach(i => i.classList.remove('invalid'));
            });
        }
    }


    /* ==========================================
       MODAL DETAIL PANEL VIEWS
       ========================================== */
    const modal = document.getElementById('complaint-detail-modal');
    const modalBody = document.getElementById('modal-details-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    window.viewComplaintDetails = function(complaintId) {
        if (!modal || !modalBody) return;

        const complaint = getComplaints().find(c => c.id === complaintId);
        if (!complaint) return;

        modalBody.innerHTML = `
            <div class="detail-row split">
                <div>
                    <span class="detail-label-tag">Complaint ID</span>
                    <span class="detail-val-text gold-text font-weight-bold">${complaint.id}</span>
                </div>
                <div>
                    <span class="detail-label-tag">Date Submitted</span>
                    <span class="detail-val-text">${formatDate(complaint.dateCreated, true)}</span>
                </div>
            </div>
            
            <div class="detail-row">
                <span class="detail-label-tag">Complaint Title</span>
                <span class="detail-val-text" style="font-size:16px; font-weight:600;">${complaint.title}</span>
            </div>

            <div class="detail-row split">
                <div>
                    <span class="detail-label-tag">Category</span>
                    <span class="detail-val-text" style="text-transform: capitalize;">${getCategoryIcon(complaint.category)} ${complaint.category}</span>
                </div>
                <div>
                    <span class="detail-label-tag">Priority Level</span>
                    <span class="badge badge-${complaint.priority.toLowerCase()}">${complaint.priority} Priority</span>
                </div>
            </div>

            <div class="detail-row split">
                <div>
                    <span class="detail-label-tag">Current Status</span>
                    <span class="badge badge-${complaint.status.toLowerCase().replace(' ', '')}">${complaint.status}</span>
                </div>
            </div>

            <div class="detail-row">
                <span class="detail-label-tag">Grievance Description</span>
                <div class="detail-desc-box">${complaint.desc.replace(/\n/g, '<br>')}</div>
            </div>
        `;

        modal.classList.add('active');
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }


    /* ==========================================
       UTILITY DATE & CATEGORY FORMATTERS
       ========================================== */
    function formatDate(isoString, includeTime = false) {
        const date = new Date(isoString);
        
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        let formattedDate = date.toLocaleDateString('en-GB', options);

        if (includeTime) {
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            formattedDate += ' at ' + date.toLocaleTimeString('en-US', timeOptions);
        }
        return formattedDate;
    }

    function getCategoryIcon(category) {
        const icons = {
            'classroom': '🏫',
            'wifi/internet': '📶',
            'electrical': '⚡',
            'laboratory': '🔬',
            'library': '📚',
            'washroom': '🚻',
            'canteen': '🍽️',
            'security': '🛡️',
            'other': '⋯'
        };
        return icons[category] || ' G ';
    }


    /* ==========================================
       BOOTSTRAP INVOCATION
       ========================================== */
    initSessionState();

});
