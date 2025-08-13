// Main Application Logic
class CodeCompeteApp {
    constructor() {
        this.currentUser = null;
        this.currentEvent = null;
        this.currentQuestion = null;
        this.userProfile = null;
        this.countdownTimer = null;
        this.remainingTime = 90 * 60; // 1.5 hours in seconds
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.loadEvents();
        this.loadLeaderboard();
        this.setupMessageListener();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('hamburger').addEventListener('click', () => {
            document.getElementById('nav-menu').classList.toggle('active');
        });

        // Auth buttons
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showAuthModal();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideAuthModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') {
                this.hideAuthModal();
            }
        });

        // Auth tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Auth forms
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Hero buttons
        document.getElementById('get-started-btn').addEventListener('click', () => {
            document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
        });

        // Code editor
        document.getElementById('run-code-btn').addEventListener('click', () => {
            this.runCode();
        });

        document.getElementById('submit-code-btn').addEventListener('click', () => {
            this.submitCode();
        });

        // Output panel
        document.getElementById('clear-output-btn').addEventListener('click', () => {
            this.clearOutput();
        });

        // Real-time code checking
        document.getElementById('code-editor').addEventListener('input', () => {
            this.debounceCodeCheck();
        });

        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Profile dialog
        document.getElementById('profile-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileDialog();
        });

        document.getElementById('close-profile').addEventListener('click', () => {
            this.hideProfileDialog();
        });

        window.addEventListener('click', (e) => {
            if (e.target.id === 'profile-dialog') {
                this.hideProfileDialog();
            }
        });
    }

    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
            } else {
                this.currentUser = null;
                this.userProfile = null;
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection(USERS_COLLECTION).doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            } else {
                // Create user profile if it doesn't exist
                this.userProfile = {
                    nameOfUser: this.currentUser.displayName || this.currentUser.email,
                    emailOfUser: this.currentUser.email,
                    userId: this.currentUser.uid,
                    lastSeen: Date.now(),
                    onlineStatus: true,
                    profileImageUrl: null,
                    pswdOfUser: '', // We don't store passwords in Firestore
                    team: '',
                    problemsSolved: 0,
                    totalScore: 0,
                    rank: '-'
                };
                await db.collection(USERS_COLLECTION).doc(this.currentUser.uid).set(this.userProfile);
            }
            this.updateProfileUI();
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('profile-link').style.display = 'block';
        this.hideAuthModal();
    }

    updateUIForUnauthenticatedUser() {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('profile-link').style.display = 'none';
        document.getElementById('competition').style.display = 'none';
        this.hideProfileDialog();
    }

    updateProfileUI() {
        if (this.userProfile) {
            // Update profile dialog elements
            document.getElementById('profile-name').textContent = this.userProfile.nameOfUser || this.userProfile.name || 'Unknown';
            document.getElementById('profile-email').textContent = this.userProfile.emailOfUser || this.userProfile.email || 'Unknown';
            
            // Update profile image
            const profileImage = document.getElementById('profile-image');
            if (this.userProfile.profileImageUrl) {
                profileImage.src = this.userProfile.profileImageUrl;
            }
            
            // Update detail items
            document.getElementById('detail-name').textContent = this.userProfile.nameOfUser || this.userProfile.name || 'Unknown';
            document.getElementById('detail-email').textContent = this.userProfile.emailOfUser || this.userProfile.email || 'Unknown';
        }
    }

    showAuthModal() {
        document.getElementById('auth-modal').style.display = 'block';
    }

    hideAuthModal() {
        document.getElementById('auth-modal').style.display = 'none';
    }

    showProfileDialog() {
        document.getElementById('profile-dialog').style.display = 'block';
        this.updateProfileUI();
    }

    hideProfileDialog() {
        document.getElementById('profile-dialog').style.display = 'none';
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
    }

    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            this.showLoading();
            await auth.signInWithEmailAndPassword(email, password);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            alert(`Login failed: ${error.message}`);
        }
    }

    async register() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const team = document.getElementById('register-team').value;

        try {
            this.showLoading();
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document
            await db.collection(USERS_COLLECTION).doc(userCredential.user.uid).set({
                nameOfUser: name,
                emailOfUser: email,
                userId: userCredential.user.uid,
                lastSeen: Date.now(),
                onlineStatus: true,
                profileImageUrl: null,
                pswdOfUser: '', // We don't store passwords in Firestore
                team: team,
                problemsSolved: 0,
                totalScore: 0,
                rank: '-',
                createdAt: new Date()
            });

            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            alert(`Registration failed: ${error.message}`);
        }
    }

    async logout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async loadEvents() {
        try {
            this.showLoading();
            const eventsSnapshot = await db.collection(EVENTS_COLLECTION).get();
            const events = [];
            
            eventsSnapshot.forEach(doc => {
                events.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displayEvents(events);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('Error loading events:', error);
            // Show sample events for demo
            this.displaySampleEvents();
        }
    }

    displayEvents(events) {
        const eventsGrid = document.getElementById('events-grid');
        eventsGrid.innerHTML = '';

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">No events available at the moment.</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = this.createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
    }

    displaySampleEvents() {
        const sampleEvents = [
            {
                id: 'sample1',
                title: 'Code Sprint 2024',
                description: 'A fast-paced coding competition with algorithmic challenges. Test your problem-solving skills against the best coders.',
                status: 'active',
                startDate: '2024-01-15',
                endDate: '2024-01-20',
                participants: 150,
                maxParticipants: 200
            },
            {
                id: 'sample2',
                title: 'Algorithm Masters',
                description: 'Advanced algorithmic challenges for experienced programmers. Push your limits with complex problem-solving.',
                status: 'upcoming',
                startDate: '2024-02-01',
                endDate: '2024-02-05',
                participants: 75,
                maxParticipants: 100
            },
            {
                id: 'sample3',
                title: 'Web Development Challenge',
                description: 'Build amazing web applications in this creative coding competition. Show off your frontend and backend skills.',
                status: 'upcoming',
                startDate: '2024-02-15',
                endDate: '2024-02-20',
                participants: 45,
                maxParticipants: 80
            }
        ];

        this.displayEvents(sampleEvents);
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <div class="event-meta">
                <span class="event-status status-${event.status}">${event.status}</span>
                <span>${event.participants}/${event.maxParticipants} participants</span>
            </div>
            <div class="event-actions">
                <button class="btn btn-primary" onclick="app.joinEvent('${event.id}')">
                    ${event.status === 'active' ? 'Join Now' : 'Register'}
                </button>
            </div>
        `;
        return card;
    }

    async joinEvent(eventId) {
        if (!this.currentUser) {
            this.showAuthModal();
            return;
        }

        try {
            this.showLoading();
            
            // For testing, if the eventId is 'sample1', use the specific event ID you mentioned
            const actualEventId = eventId === 'sample1' ? 'LBJGfuHZ9XNmnOzOYHJC' : eventId;
            
            const eventDoc = await db.collection(EVENTS_COLLECTION).doc(actualEventId).get();
            
            if (eventDoc.exists) {
                this.currentEvent = { id: actualEventId, ...eventDoc.data() };
                // Check if user is registered for this event
                const isRegistered = await this.checkUserEventRegistration(actualEventId);
                this.showEventDetails(actualEventId, isRegistered);
            } else {
                // For demo purposes, show sample questions
                this.currentEvent = {
                    id: actualEventId,
                    title: 'Sample Event',
                    status: 'active'
                };
                const isRegistered = await this.checkUserEventRegistration(actualEventId);
                this.showEventDetails(actualEventId, isRegistered);
            }
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('Error joining event:', error);
            // Show sample questions for demo
            this.currentEvent = {
                id: actualEventId,
                title: 'Sample Event',
                status: 'active'
            };
            const isRegistered = await this.checkUserEventRegistration(actualEventId);
            this.showEventDetails(actualEventId, isRegistered);
        }
    }

    async checkUserEventRegistration(eventId) {
        try {
            if (!this.currentUser) {
                return false;
            }

            // Check if user is registered in the specific event's final teams
            // Using the specific path: /events/{eventId}/final teams/{teamName}/members
            const eventTeamsSnapshot = await db.collection('events')
                .doc(eventId)
                .collection('final teams')
                .get();

            for (const teamDoc of eventTeamsSnapshot.docs) {
                const teamData = teamDoc.data();
                if (teamData.members && Array.isArray(teamData.members)) {
                    // Check if current user's UID is in the team members array
                    const userInTeam = teamData.members.find(member => 
                        member.uid === this.currentUser.uid
                    );
                    if (userInTeam) {
                        console.log('User found in team:', teamDoc.id, 'with UID:', this.currentUser.uid);
                        return true;
                    }
                }
            }
            
            console.log('User not found in any team for event:', eventId, 'UID:', this.currentUser.uid);
            return false;
        } catch (error) {
            console.error('Error checking user registration:', error);
            return false;
        }
    }

    async checkUserIsAdmin(eventId) {
        try {
            if (!this.currentUser) {
                return false;
            }

            // Check if user is admin for this event
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (eventDoc.exists) {
                const eventData = eventDoc.data();
                if (eventData.adminIds && Array.isArray(eventData.adminIds)) {
                    const isAdmin = eventData.adminIds.includes(this.currentUser.uid);
                    console.log('Admin check for event:', eventId, 'UID:', this.currentUser.uid, 'Is Admin:', isAdmin);
                    return isAdmin;
                }
            }
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    async showEventDetails(eventId, isRegistered) {
        // Hide the competition section first
        document.getElementById('competition').style.display = 'none';
        
        // Check if user is admin
        const isAdmin = await this.checkUserIsAdmin(eventId);
        
        // Create and show event details section
        this.createEventDetailsSection(eventId, isRegistered, isAdmin);
    }

    createEventDetailsSection(eventId, isRegistered, isAdmin) {
        // Remove existing event details section if it exists
        const existingSection = document.getElementById('event-details-section');
        if (existingSection) {
            existingSection.remove();
        }

        // Create new event details section
        const eventDetailsSection = document.createElement('section');
        eventDetailsSection.id = 'event-details-section';
        eventDetailsSection.className = 'event-details-section';
        
        const eventTitle = this.currentEvent?.title || 'Event Details';
        
        eventDetailsSection.innerHTML = `
            <div class="container">
                <div class="event-details-header">
                    <button class="btn btn-secondary back-to-events-list-btn" id="back-to-events-list-btn">
                        <i class="fas fa-arrow-left"></i> Back to Events
                    </button>
                    <h2>${eventTitle}</h2>
                    <div class="registration-status">
                        <span class="status-badge ${isRegistered ? 'registered' : 'not-registered'}">
                            ${isRegistered ? '✓ Registered' : '✗ Not Registered'}
                        </span>
                        ${isAdmin ? '<span class="status-badge admin">👑 Admin</span>' : ''}
                    </div>
                </div>
                
                <div class="event-description">
                    <p>${this.currentEvent?.description || 'Join this exciting coding competition and test your skills!'}</p>
                </div>

                ${isAdmin ? `
                <div class="admin-section">
                    <button class="btn btn-warning" id="view-as-admin-btn">
                        <i class="fas fa-crown"></i> View as Admin
                    </button>
                </div>
                ` : ''}

                <div class="competition-cards">
                    <div class="competition-card quiz-card">
                        <div class="card-header">
                            <i class="fas fa-question-circle"></i>
                            <h3>Quiz Competition</h3>
                        </div>
                        <div class="card-content">
                            <p>Test your knowledge with our interactive quiz questions. Answer correctly to earn points!</p>
                            <div class="card-features">
                                <span><i class="fas fa-clock"></i> Time-based</span>
                                <span><i class="fas fa-star"></i> Points system</span>
                                <span><i class="fas fa-trophy"></i> Leaderboard</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary" id="quiz-btn" ${!isRegistered ? 'disabled' : ''}>
                                ${isRegistered ? 'Start Quiz' : 'Register First'}
                            </button>
                        </div>
                    </div>

                    <div class="competition-card coding-card">
                        <div class="card-header">
                            <i class="fas fa-code"></i>
                            <h3>Coding Competition</h3>
                        </div>
                        <div class="card-content">
                            <p>Solve challenging coding problems. Write efficient algorithms and compete for the top spot!</p>
                            <div class="card-features">
                                <span><i class="fas fa-code"></i> Multiple languages</span>
                                <span><i class="fas fa-check-circle"></i> Test cases</span>
                                <span><i class="fas fa-medal"></i> Scoring system</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary" id="coding-btn" ${!isRegistered ? 'disabled' : ''}>
                                ${isRegistered ? 'Start Coding' : 'Register First'}
                            </button>
                        </div>
                    </div>
                </div>

                ${!isRegistered ? `
                <div class="registration-actions">
                    <div class="app-registration-notice">
                        <div class="app-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <div class="notice-content">
                            <h3>Registration Required</h3>
                            <p>To participate in this event, you need to register through our mobile app first.</p>
                            <div class="app-download-section">
                                <a href="https://play.google.com/store/apps/details?id=com.chandravir.projectmanager" 
                                   target="_blank" class="btn btn-primary download-app-btn">
                                    <i class="fab fa-google-play"></i> Download CodeMeet App
                                </a>
                                <p class="download-note">Install the app, create an account, and register for events there.</p>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="debug-section" style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-secondary" id="debug-registration-btn" onclick="app.debugEventRegistration('${eventId}')">
                        <i class="fas fa-bug"></i> Debug Registration Check
                    </button>
                    <p style="font-size: 0.8rem; color: #888; margin-top: 5px;">Check console for detailed registration info</p>
                </div>
            </div>
        `;

        // Insert the section after the events section
        const eventsSection = document.getElementById('events');
        eventsSection.parentNode.insertBefore(eventDetailsSection, eventsSection.nextSibling);

        // Add event listeners for the new buttons
        this.setupEventDetailsEventListeners(eventId, isRegistered);

        // Scroll to the new section
        eventDetailsSection.scrollIntoView({ behavior: 'smooth' });
    }

    setupEventDetailsEventListeners(eventId, isRegistered) {
        // Quiz button
        const quizBtn = document.getElementById('quiz-btn');
        if (quizBtn) {
            quizBtn.addEventListener('click', () => {
                if (isRegistered) {
                    this.showQuizAppNotification();
                } else {
                    this.showAppRegistrationMessage();
                }
            });
        }

        // Coding button
        const codingBtn = document.getElementById('coding-btn');
        if (codingBtn) {
            codingBtn.addEventListener('click', () => {
                if (isRegistered) {
                    this.startCoding(eventId);
                } else {
                    this.showAppRegistrationMessage();
                }
            });
        }

        // Admin button
        const adminBtn = document.getElementById('view-as-admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminPanel(eventId);
            });
        }

        // Back to events list button
        const backToEventsBtn = document.getElementById('back-to-events-list-btn');
        if (backToEventsBtn) {
            backToEventsBtn.addEventListener('click', () => {
                this.backToEventsList();
            });
        }
    }

    showAppRegistrationMessage() {
        const message = `
📱 Registration Required

To participate in competitions, you need to:

1. Download the CodeMeet mobile app
2. Create an account in the app
3. Register for events through the app
4. Come back here to participate

Download the app now:
https://play.google.com/store/apps/details?id=com.chandravir.projectmanager
        `;
        
        alert(message);
        
        // Open the app store link
        window.open('https://play.google.com/store/apps/details?id=com.chandravir.projectmanager', '_blank');
    }

    // Debug method to check specific event registration
    async debugEventRegistration(eventId = 'LBJGfuHZ9XNmnOzOYHJC') {
        try {
            console.log('Debugging event registration for event:', eventId);
            console.log('Current user UID:', this.currentUser?.uid);
            
            // Check the specific event path
            const eventDoc = await db.collection('events').doc(eventId).get();
            if (!eventDoc.exists) {
                console.log('Event does not exist:', eventId);
                return;
            }
            
            console.log('Event exists:', eventDoc.data());
            
            // Check final teams collection
            const teamsSnapshot = await db.collection('events')
                .doc(eventId)
                .collection('final teams')
                .get();
            
            console.log('Number of teams found:', teamsSnapshot.size);
            
            teamsSnapshot.forEach(teamDoc => {
                console.log('Team ID:', teamDoc.id);
                console.log('Team data:', teamDoc.data());
                
                const teamData = teamDoc.data();
                if (teamData.members && Array.isArray(teamData.members)) {
                    console.log('Team members:', teamData.members);
                    
                    const userInTeam = teamData.members.find(member => 
                        member.uid === this.currentUser?.uid
                    );
                    
                    if (userInTeam) {
                        console.log('✅ User found in team:', teamDoc.id);
                        console.log('User data:', userInTeam);
                    } else {
                        console.log('❌ User not found in team:', teamDoc.id);
                    }
                } else {
                    console.log('No members array found in team:', teamDoc.id);
                }
            });
            
        } catch (error) {
            console.error('Error debugging event registration:', error);
        }
    }

    startQuiz(eventId) {
        // Hide event details section
        const eventDetailsSection = document.getElementById('event-details-section');
        if (eventDetailsSection) {
            eventDetailsSection.style.display = 'none';
        }

        // Show competition section with quiz mode
        this.currentEvent = { id: eventId, title: 'Quiz Competition', mode: 'quiz' };
            this.showCompetition();
        
        // Load quiz questions or show quiz interface
        this.loadQuizQuestions(eventId);
    }

    startCoding(eventId) {
        // Store current event info
        this.currentEvent = { id: eventId, title: 'Coding Competition', mode: 'coding' };
        
        // Open coding screen in fullscreen mode
        this.openCodingScreen();
    }

    openCodingScreen() {
        // Create a new window for the coding screen
        const codingWindow = window.open('coding-screen.html', '_blank', 
            'fullscreen=yes,scrollbars=yes,resizable=yes,width=' + screen.width + ',height=' + screen.height);
        
        if (codingWindow) {
            // Store reference to coding window
            this.codingWindow = codingWindow;
            
            // Set up fullscreen change listener for the new window
            codingWindow.addEventListener('load', () => {
                this.setupCodingWindowFullscreen(codingWindow);
            });
            
            // Handle window close
            codingWindow.addEventListener('beforeunload', () => {
                this.handleCodingWindowClose();
            });
        } else {
            // Fallback: open in same window with fullscreen
            this.openCodingScreenInSameWindow();
        }
    }

    openCodingScreenInSameWindow() {
        // Hide all existing sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Create coding screen container
        const codingContainer = document.createElement('div');
        codingContainer.id = 'coding-screen-container';
        codingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            background: white;
        `;
        
        // Load coding screen content
        fetch('coding-screen.html')
            .then(response => response.text())
            .then(html => {
                // Extract body content
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const bodyContent = doc.body.innerHTML;
                
                codingContainer.innerHTML = bodyContent;
                document.body.appendChild(codingContainer);
                
                // Load CSS and JS
                this.loadCodingScreenAssets();
                
                // Request fullscreen
                this.requestFullscreen(codingContainer);
            })
            .catch(error => {
                console.error('Error loading coding screen:', error);
                alert('Error loading coding screen. Please try again.');
            });
    }

    loadCodingScreenAssets() {
        // Load CSS
        if (!document.querySelector('link[href="coding-screen.css"]')) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'coding-screen.css';
            document.head.appendChild(cssLink);
        }
        
        // Load JS
        if (!document.querySelector('script[src="coding-screen.js"]')) {
            const script = document.createElement('script');
            script.src = 'coding-screen.js';
            document.head.appendChild(script);
        }
    }

    setupCodingWindowFullscreen(codingWindow) {
        // Request fullscreen for the new window
        if (codingWindow.document.documentElement.requestFullscreen) {
            codingWindow.document.documentElement.requestFullscreen().catch(err => {
                console.error('Error entering full-screen:', err);
            });
        } else if (codingWindow.document.documentElement.webkitRequestFullscreen) {
            codingWindow.document.documentElement.webkitRequestFullscreen();
        } else if (codingWindow.document.documentElement.msRequestFullscreen) {
            codingWindow.document.documentElement.msRequestFullscreen();
        }

        // Add fullscreen change listener
        const handleFullscreenChange = () => {
            const isFullScreen = !!(codingWindow.document.fullscreenElement || 
                                   codingWindow.document.webkitFullscreenElement || 
                                   codingWindow.document.mozFullScreenElement || 
                                   codingWindow.document.msFullscreenElement);
            
            if (!isFullScreen) {
                // User exited fullscreen
                this.showFullscreenExitModal(codingWindow);
            }
        };

        codingWindow.document.addEventListener('fullscreenchange', handleFullscreenChange);
        codingWindow.document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        codingWindow.document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        codingWindow.document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    showFullscreenExitModal(codingWindow) {
        // Create modal in the coding window
        const modal = codingWindow.document.createElement('div');
        modal.id = 'fullscreen-exit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                width: 90%;
            ">
                <div style="margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f44336; margin-bottom: 15px;"></i>
                    <h2 style="color: #333; font-size: 1.8rem; margin: 0;">Full-Screen Mode Required</h2>
                </div>
                <div style="margin-bottom: 25px;">
                    <p style="color: #666; margin-bottom: 15px; line-height: 1.6; font-size: 1.1rem;">
                        You exited full-screen mode during the coding competition. Full-screen mode is mandatory to prevent cheating.
                    </p>
                    <p style="color: #666; margin-bottom: 15px; line-height: 1.6; font-size: 1.1rem;">
                        Please choose an option:
                    </p>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="return-fullscreen-btn" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 1rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-expand"></i> Return to Full-Screen
                    </button>
                    <button id="exit-competition-btn" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 1rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-times"></i> Exit Competition
                    </button>
                </div>
            </div>
        `;

        codingWindow.document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('#return-fullscreen-btn').addEventListener('click', () => {
            modal.remove();
            this.requestFullscreen(codingWindow.document.documentElement);
        });

        modal.querySelector('#exit-competition-btn').addEventListener('click', () => {
            codingWindow.close();
            this.handleCodingWindowClose();
        });
    }

    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error('Error entering full-screen:', err);
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    handleCodingWindowClose() {
        // Clean up when coding window is closed
        this.codingWindow = null;
        this.currentEvent = null;
        
        // Show main page again
        this.showMainPage();
    }

    showMainPage() {
        // Show all sections again
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Remove coding screen container if it exists
        const codingContainer = document.getElementById('coding-screen-container');
        if (codingContainer) {
            codingContainer.remove();
        }
        
        // Remove coding screen assets
        const codingCSS = document.querySelector('link[href="coding-screen.css"]');
        if (codingCSS) codingCSS.remove();
        
        const codingJS = document.querySelector('script[src="coding-screen.js"]');
        if (codingJS) codingJS.remove();
    }

    setupMessageListener() {
        // Listen for messages from coding window
        window.addEventListener('message', (event) => {
            if (event.data.type === 'coding-window-closed') {
                this.handleCodingWindowClose();
            }
        });
    }

    enableFullScreenMode() {
        // Request full-screen mode
        const competitionSection = document.getElementById('competition');
        
        // Remove existing event listeners to prevent duplicates
        document.removeEventListener('fullscreenchange', this.handleFullScreenChange.bind(this));
        document.removeEventListener('webkitfullscreenchange', this.handleFullScreenChange.bind(this));
        document.removeEventListener('mozfullscreenchange', this.handleFullScreenChange.bind(this));
        document.removeEventListener('MSFullscreenChange', this.handleFullScreenChange.bind(this));

        // Add full-screen change event listener
        const boundHandler = this.handleFullScreenChange.bind(this);
        document.addEventListener('fullscreenchange', boundHandler);
        document.addEventListener('webkitfullscreenchange', boundHandler);
        document.addEventListener('mozfullscreenchange', boundHandler);
        document.addEventListener('MSFullscreenChange', boundHandler);

        // Request full-screen
        if (competitionSection.requestFullscreen) {
            competitionSection.requestFullscreen().catch(err => {
                console.error('Error entering full-screen:', err);
            });
        } else if (competitionSection.webkitRequestFullscreen) {
            competitionSection.webkitRequestFullscreen();
        } else if (competitionSection.msRequestFullscreen) {
            competitionSection.msRequestFullscreen();
        }
    }

    handleFullScreenChange() {
        const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                               document.mozFullScreenElement || document.msFullscreenElement);
        
        if (!isFullScreen && this.currentEvent?.mode === 'coding') {
            // User exited full-screen during coding competition
            this.showFullScreenWarning();
        }
    }

    showFullScreenWarning() {
        // Create a modal dialog for fullscreen options
        this.createFullScreenOptionsModal();
    }

    createFullScreenOptionsModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('fullscreen-options-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'fullscreen-options-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content fullscreen-options-modal">
                <div class="fullscreen-warning-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Full-Screen Mode Required</h3>
                </div>
                <div class="fullscreen-warning-content">
                    <p>You exited full-screen mode during the coding competition. Full-screen mode is mandatory to prevent cheating.</p>
                    <p>Please choose an option:</p>
                </div>
                <div class="fullscreen-options">
                    <button class="btn btn-primary" id="return-fullscreen-btn">
                        <i class="fas fa-expand"></i> Return to Full-Screen
                    </button>
                    <button class="btn btn-danger" id="exit-competition-btn">
                        <i class="fas fa-times"></i> Exit Competition
                    </button>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('return-fullscreen-btn').addEventListener('click', () => {
            this.returnToFullScreen();
        });

        document.getElementById('exit-competition-btn').addEventListener('click', () => {
            this.exitCompetition();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.returnToFullScreen(); // Default to returning to fullscreen
            }
        });
    }

    returnToFullScreen() {
        // Remove the modal
        const modal = document.getElementById('fullscreen-options-modal');
        if (modal) {
            modal.remove();
        }
        
        // Try to re-enter full-screen mode
        setTimeout(() => {
            this.enableFullScreenMode();
        }, 100);
    }

    exitCompetition() {
        // Stop the countdown timer
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }

        // Remove the modal
        const modal = document.getElementById('fullscreen-options-modal');
        if (modal) {
            modal.remove();
        }

        // Exit full-screen mode if active
        if (document.fullscreenElement || document.webkitFullscreenElement || 
            document.mozFullScreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        // Hide competition section
        document.getElementById('competition').style.display = 'none';

        // Show event details section again
        const eventDetailsSection = document.getElementById('event-details-section');
        if (eventDetailsSection) {
            eventDetailsSection.style.display = 'block';
            eventDetailsSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Show confirmation message
        this.displayOutput('You have exited the coding competition. You can rejoin anytime by clicking "Start Coding" again.', 'info');
    }

    showQuizAppNotification() {
        const message = `
📱 Quiz Round in Mobile App

Quiz competitions are available in the CodeMeet mobile app only.

Please download the app and attempt the quiz there:
https://play.google.com/store/apps/details?id=com.chandravir.projectmanager
        `;
        
        alert(message);
        
        // Open the app store link
        window.open('https://play.google.com/store/apps/details?id=com.chandravir.projectmanager', '_blank');
    }

    showAdminPanel(eventId) {
        // Hide event details section
        const eventDetailsSection = document.getElementById('event-details-section');
        if (eventDetailsSection) {
            eventDetailsSection.style.display = 'none';
        }

        // Create admin panel
        this.createAdminPanel(eventId);
    }

    createAdminPanel(eventId) {
        // Remove existing admin panel if it exists
        const existingPanel = document.getElementById('admin-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create new admin panel
        const adminPanel = document.createElement('section');
        adminPanel.id = 'admin-panel';
        adminPanel.className = 'admin-panel';
        
        adminPanel.innerHTML = `
            <div class="container">
                <div class="admin-header">
                    <button class="btn btn-secondary back-to-event-btn" id="back-to-event-btn">
                        <i class="fas fa-arrow-left"></i> Back to Event
                    </button>
                    <h2>Admin Panel - ${this.currentEvent?.title || 'Event'}</h2>
                </div>
                
                <div class="admin-content">
                    <div class="admin-section">
                        <h3>Manage Coding Questions</h3>
                        <div class="question-editor">
                            <div class="form-group">
                                <label for="question-title">Question Title</label>
                                <input type="text" id="question-title" placeholder="Enter question title">
                            </div>
                            <div class="form-group">
                                <label for="question-description">Question Description</label>
                                <textarea id="question-description" placeholder="Enter question description" rows="6"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="question-difficulty">Difficulty</label>
                                <select id="question-difficulty">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="question-time-limit">Time Limit (seconds)</label>
                                <input type="number" id="question-time-limit" value="2">
                            </div>
                            <div class="form-group">
                                <label for="question-memory-limit">Memory Limit (MB)</label>
                                <input type="number" id="question-memory-limit" value="256">
                            </div>
                            <div class="form-group">
                                <label for="test-cases">Test Cases (JSON format)</label>
                                <textarea id="test-cases" placeholder='[{"input": "[2,7,11,15]", "target": 9, "output": "[0,1]"}]' rows="4"></textarea>
                            </div>
                            <div class="admin-actions">
                                <button class="btn btn-primary" id="save-question-btn">
                                    <i class="fas fa-save"></i> Save Question
                                </button>
                                <button class="btn btn-secondary" id="load-questions-btn">
                                    <i class="fas fa-download"></i> Load Existing Questions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert the panel after the events section
        const eventsSection = document.getElementById('events');
        eventsSection.parentNode.insertBefore(adminPanel, eventsSection.nextSibling);

        // Add event listeners for admin panel
        this.setupAdminPanelEventListeners(eventId);

        // Scroll to the admin panel
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    }

    setupAdminPanelEventListeners(eventId) {
        // Back to event button
        const backBtn = document.getElementById('back-to-event-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToEventDetails();
            });
        }

        // Save question button
        const saveBtn = document.getElementById('save-question-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCodingQuestion(eventId);
            });
        }

        // Load questions button
        const loadBtn = document.getElementById('load-questions-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadExistingQuestions(eventId);
            });
        }
    }

    async saveCodingQuestion(eventId) {
        const title = document.getElementById('question-title').value;
        const description = document.getElementById('question-description').value;
        const difficulty = document.getElementById('question-difficulty').value;
        const timeLimit = document.getElementById('question-time-limit').value;
        const memoryLimit = document.getElementById('question-memory-limit').value;
        const testCasesText = document.getElementById('test-cases').value;

        if (!title || !description) {
            alert('Please fill in the title and description fields.');
            return;
        }

        try {
            this.showLoading();
            
            let testCases = [];
            if (testCasesText) {
                try {
                    testCases = JSON.parse(testCasesText);
                } catch (e) {
                    alert('Invalid JSON format for test cases. Please check the format.');
                    this.hideLoading();
                    return;
                }
            }

            const questionData = {
                eventId: eventId,
                title: title,
                description: description,
                difficulty: difficulty,
                timeLimit: timeLimit + 's',
                memoryLimit: memoryLimit + 'MB',
                testCases: testCases,
                createdBy: this.currentUser.uid,
                createdAt: new Date()
            };

            // Save to Firestore
            await db.collection('CodingQuestions').add(questionData);

            this.hideLoading();
            alert('Question saved successfully!');
            
            // Clear form
            document.getElementById('question-title').value = '';
            document.getElementById('question-description').value = '';
            document.getElementById('test-cases').value = '';
            
        } catch (error) {
            this.hideLoading();
            console.error('Error saving question:', error);
            alert(`Error saving question: ${error.message}`);
        }
    }

    async loadExistingQuestions(eventId) {
        try {
            this.showLoading();
            
            const questionsSnapshot = await db.collection('CodingQuestions')
                .where('eventId', '==', eventId)
                .get();
            
            if (questionsSnapshot.empty) {
                this.hideLoading();
                alert('No questions found for this event.');
                return;
            }

            let questionsList = 'Existing Questions:\n\n';
            questionsSnapshot.forEach((doc, index) => {
                const question = doc.data();
                questionsList += `${index + 1}. ${question.title} (${question.difficulty})\n`;
                questionsList += `   Description: ${question.description.substring(0, 100)}...\n\n`;
            });

            this.hideLoading();
            alert(questionsList);
            
        } catch (error) {
            this.hideLoading();
            console.error('Error loading questions:', error);
            alert(`Error loading questions: ${error.message}`);
        }
    }

    backToEventDetails() {
        // Hide admin panel
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.remove();
        }
        
        // Show event details section again
        const eventDetailsSection = document.getElementById('event-details-section');
        if (eventDetailsSection) {
            eventDetailsSection.style.display = 'block';
            eventDetailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async loadQuizQuestions(eventId) {
        try {
            // For now, we'll use sample quiz questions
            // In a real app, you'd load these from Firestore
            const sampleQuizQuestions = [
                {
                    id: 'quiz1',
                    question: 'What is the time complexity of binary search?',
                    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
                    correctAnswer: 1,
                    explanation: 'Binary search has a time complexity of O(log n) as it divides the search space in half with each iteration.'
                },
                {
                    id: 'quiz2',
                    question: 'Which data structure uses LIFO (Last In, First Out)?',
                    options: ['Queue', 'Stack', 'Tree', 'Graph'],
                    correctAnswer: 1,
                    explanation: 'A stack uses LIFO principle where the last element added is the first one to be removed.'
                }
            ];

            this.currentQuestion = sampleQuizQuestions[0];
            this.displayQuizQuestion(this.currentQuestion);
            
        } catch (error) {
            console.error('Error loading quiz questions:', error);
        }
    }

    displayQuizQuestion(question) {
        document.getElementById('event-title').textContent = 'Quiz Competition';
        document.getElementById('team-name').textContent = `Team: ${this.userProfile?.team || 'Unknown'}`;
        document.getElementById('event-name').textContent = `Event: ${this.currentEvent.title}`;
        
        // Update the question content for quiz mode
        const questionContent = document.getElementById('question-content');
        questionContent.innerHTML = `
            <div class="quiz-question">
                <h4>${question.question}</h4>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <label class="quiz-option">
                            <input type="radio" name="quiz-answer" value="${index}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Update other question meta information
        document.getElementById('difficulty').textContent = 'Difficulty: Quiz';
        document.getElementById('time-limit').textContent = 'Time Limit: 30s';
        document.getElementById('memory-limit').textContent = 'Memory: N/A';
        
        // Update submit button text for quiz
        const submitBtn = document.getElementById('submit-code-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Answer';
        }
    }

    backToEventsList() {
        // Hide event details section
        const eventDetailsSection = document.getElementById('event-details-section');
        if (eventDetailsSection) {
            eventDetailsSection.remove();
        }
        
        // Scroll back to events section
        document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
    }

    async loadQuestions(eventId) {
        try {
            const questionsSnapshot = await db.collection(QUESTIONS_COLLECTION)
                .where('eventId', '==', eventId)
                .get();
            
            const questions = [];
            questionsSnapshot.forEach(doc => {
                questions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            if (questions.length > 0) {
                this.currentQuestion = questions[0];
                this.displayQuestion(this.currentQuestion);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    loadSampleQuestions() {
        // Use demo data questions if available, otherwise use hardcoded samples
        let sampleQuestions = [];
        
        if (window.demoData && window.demoData.questions) {
            // Use questions from demo data
            sampleQuestions = window.demoData.questions.slice(0, 3); // Take first 3 questions
        } else {
            // Fallback to hardcoded questions
            sampleQuestions = [
            {
                id: 'q1',
                title: 'Two Sum',
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
                difficulty: 'Easy',
                timeLimit: '2s',
                memoryLimit: '256MB',
                testCases: [
                    { input: '[2,7,11,15]', target: 9, output: '[0,1]' },
                    { input: '[3,2,4]', target: 6, output: '[1,2]' },
                    { input: '[3,3]', target: 6, output: '[0,1]' }
                ]
            },
            {
                id: 'q2',
                title: 'Valid Parentheses',
                description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()"
Output: true

Input: s = "([)]"
Output: false`,
                difficulty: 'Medium',
                timeLimit: '1s',
                memoryLimit: '128MB',
                testCases: [
                    { input: '"()"', output: 'true' },
                    { input: '"([)]"', output: 'false' },
                    { input: '"{[]}"', output: 'true' }
                ]
            }
        ];
        }

        // Store all questions for navigation
        this.allQuestions = sampleQuestions;
        this.currentQuestionIndex = 0;
        this.currentQuestion = sampleQuestions[0];
        
        this.displayQuestion(this.currentQuestion);
        this.addQuestionNavigation();
        
        // Log for debugging
        console.log('Loaded sample questions:', sampleQuestions);
    }

    addQuestionNavigation() {
        // Add question navigation to the competition section
        const competitionSection = document.getElementById('competition');
        const existingNav = document.getElementById('question-navigation');
        
        if (existingNav) {
            existingNav.remove();
        }

        if (this.allQuestions && this.allQuestions.length > 1) {
            const nav = document.createElement('div');
            nav.id = 'question-navigation';
            nav.className = 'question-navigation';
            
            nav.innerHTML = `
                <div class="question-nav-header">
                    <h4>Questions (${this.currentQuestionIndex + 1}/${this.allQuestions.length})</h4>
                </div>
                <div class="question-nav-buttons">
                    <button class="btn btn-secondary" id="prev-question-btn" ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <button class="btn btn-secondary" id="next-question-btn" ${this.currentQuestionIndex === this.allQuestions.length - 1 ? 'disabled' : ''}>
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;

            // Insert after the competition header
            const competitionHeader = competitionSection.querySelector('.competition-header');
            competitionHeader.parentNode.insertBefore(nav, competitionHeader.nextSibling);

            // Add event listeners
            document.getElementById('prev-question-btn').addEventListener('click', () => {
                this.navigateToQuestion(this.currentQuestionIndex - 1);
            });

            document.getElementById('next-question-btn').addEventListener('click', () => {
                this.navigateToQuestion(this.currentQuestionIndex + 1);
            });
        }
    }

    navigateToQuestion(index) {
        if (index >= 0 && index < this.allQuestions.length) {
            this.currentQuestionIndex = index;
            this.currentQuestion = this.allQuestions[index];
            this.displayQuestion(this.currentQuestion);
            this.updateQuestionNavigation();
        }
    }

    updateQuestionNavigation() {
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const navHeader = document.querySelector('.question-nav-header h4');
        
        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.allQuestions.length - 1;
        if (navHeader) navHeader.textContent = `Questions (${this.currentQuestionIndex + 1}/${this.allQuestions.length})`;
    }

    displayQuestion(question) {
        document.getElementById('event-title').textContent = this.currentEvent.title;
        document.getElementById('team-name').textContent = `Team: ${this.userProfile?.team || 'Unknown'}`;
        document.getElementById('event-name').textContent = `Event: ${this.currentEvent.title}`;
        
        document.getElementById('question-content').innerHTML = question.description.replace(/\n/g, '<br>');
        document.getElementById('difficulty').textContent = `Difficulty: ${question.difficulty}`;
        document.getElementById('time-limit').textContent = `Time Limit: ${question.timeLimit}`;
        document.getElementById('memory-limit').textContent = `Memory: ${question.memoryLimit}`;
    }

    showCompetition() {
        document.getElementById('competition').style.display = 'block';
        document.getElementById('competition').scrollIntoView({ behavior: 'smooth' });
        
        // Initialize code editor with default language
        this.changeLanguage('java');
        
        // Ensure code editor is visible
        const codeEditor = document.getElementById('code-editor');
        const codeEditorScroll = document.querySelector('.code-editor-scroll');
        
        if (codeEditor) {
            codeEditor.style.display = 'block !important';
            codeEditor.style.visibility = 'visible !important';
            codeEditor.style.opacity = '1 !important';
            codeEditor.style.width = '100% !important';
            codeEditor.style.height = '400px !important';
            codeEditor.style.background = '#1e1e1e !important';
            codeEditor.style.color = '#d4d4d4 !important';
            codeEditor.style.border = 'none !important';
            codeEditor.style.padding = '20px !important';
            codeEditor.style.fontFamily = "'Courier New', monospace !important";
            codeEditor.style.fontSize = '1rem !important';
            codeEditor.style.lineHeight = '1.5 !important';
            codeEditor.style.resize = 'none !important';
            codeEditor.style.outline = 'none !important';
            codeEditor.style.boxSizing = 'border-box !important';
        }
        
        if (codeEditorScroll) {
            codeEditorScroll.style.display = 'block !important';
            codeEditorScroll.style.visibility = 'visible !important';
            codeEditorScroll.style.opacity = '1 !important';
        }
        
        // Force code editor visibility
        this.forceCodeEditorVisibility();
        
        // Start countdown timer
        this.startCountdownTimer();
        
        // Log for debugging
        console.log('Competition started, code editor should be visible');
        console.log('Code editor element:', codeEditor);
        console.log('Code editor scroll element:', codeEditorScroll);
    }

    startCountdownTimer() {
        // Reset timer to 1.5 hours
        this.remainingTime = 90 * 60; // 1.5 hours in seconds
        this.updateTimerDisplay();
        
        // Clear existing timer
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
        
        // Start countdown
        this.countdownTimer = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            
            // Check if time is up
            if (this.remainingTime <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.remainingTime / 3600);
        const minutes = Math.floor((this.remainingTime % 3600) / 60);
        const seconds = this.remainingTime % 60;
        
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        // Update timer styling based on remaining time
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.classList.remove('warning', 'danger');
        
        if (this.remainingTime <= 60) { // Last minute
            timerDisplay.classList.add('danger');
        } else if (this.remainingTime <= 300) { // Last 5 minutes
            timerDisplay.classList.add('warning');
        }
    }

    handleTimeUp() {
        // Stop the timer
        clearInterval(this.countdownTimer);
        
        // Show time up message
        this.showTimeUpMessage();
        
        // Auto-submit the current code
        this.autoSubmitCode();
    }

    showTimeUpMessage() {
        const message = `⏰ Time's Up!

Thank you for participating in the coding competition!

Your code has been automatically submitted and is now being checked by our system.

We will update you by email and you can also check the results in the mobile app.

Thank you for your participation! 🎉`;
        
        this.displayOutput(message, 'info');
        
        // Show a modal with the message
        this.showTimeUpModal();
    }

    showTimeUpModal() {
        // Create modal for time up message
        const modal = document.createElement('div');
        modal.id = 'time-up-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content time-up-modal">
                <div class="time-up-header">
                    <i class="fas fa-clock"></i>
                    <h3>Time's Up!</h3>
                </div>
                <div class="time-up-content">
                    <p>Thank you for participating in the coding competition!</p>
                    <p>Your code has been automatically submitted and is now being checked by our system.</p>
                    <p>We will update you by email and you can also check the results in the mobile app.</p>
                </div>
                <div class="time-up-actions">
                    <button class="btn btn-primary" id="close-time-up-btn">
                        <i class="fas fa-check"></i> Got it!
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listener
        document.getElementById('close-time-up-btn').addEventListener('click', () => {
            modal.remove();
            this.exitCompetition();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                this.exitCompetition();
            }
        });
    }

    async autoSubmitCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (code.trim() && this.currentUser && this.currentEvent && this.currentQuestion) {
            try {
                const result = this.evaluateCode(code, language);
                await this.saveSubmission(code, language, result);
                await this.updateUserScore(result.score);
                
                this.displayOutput('✅ Code automatically submitted due to time up!', 'success');
            } catch (error) {
                console.error('Auto-submit error:', error);
                this.displayOutput('❌ Error auto-submitting code', 'error');
            }
        }
    }

    forceCodeEditorVisibility() {
        // Force the code editor to be visible
        const codeEditor = document.getElementById('code-editor');
        const codeEditorScroll = document.querySelector('.code-editor-scroll');
        const codeEditorPanel = document.querySelector('.code-editor-panel');
        
        if (codeEditor) {
            codeEditor.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100% !important;
                height: 400px !important;
                background: #1e1e1e !important;
                color: #d4d4d4 !important;
                border: none !important;
                padding: 20px !important;
                font-family: 'Courier New', monospace !important;
                font-size: 1rem !important;
                line-height: 1.5 !important;
                resize: none !important;
                outline: none !important;
                box-sizing: border-box !important;
                position: relative !important;
                z-index: 1 !important;
            `;
        }
        
        if (codeEditorScroll) {
            codeEditorScroll.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                max-height: 400px !important;
                overflow-y: auto !important;
                border: 2px solid #e0e0e0 !important;
                border-radius: 10px !important;
                background: #1e1e1e !important;
                position: relative !important;
                z-index: 1 !important;
            `;
        }
        
        if (codeEditorPanel) {
            codeEditorPanel.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 1 !important;
            `;
        }
        
        console.log('Forced code editor visibility');
    }

    changeLanguage(language) {
        // Update code editor placeholder based on language
        const editor = document.getElementById('code-editor');
        
        if (!editor) {
            console.error('Code editor element not found!');
            return;
        }
        
        const placeholders = {
            java: `// Write your Java code here
public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        // Example: Find two numbers that add up to target
        // Return their indices as an array
        return new int[]{};
    }
    
    public static void main(String[] args) {
        // Test your solution here
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");
    }
}`,
            python: `# Write your Python code here
def two_sum(nums, target):
    # Your code here
    # Example: Find two numbers that add up to target
    # Return their indices as a list
    return []

# Test your solution here
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}")`,
            c: `// Write your C code here
#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    // Example: Find two numbers that add up to target
    // Return their indices as an array
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    // Test your solution here
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    printf("Result: [%d, %d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`
        };
        
        editor.placeholder = placeholders[language] || placeholders.java;
        
        // Ensure editor is visible and focused
        editor.style.display = 'block';
        editor.style.visibility = 'visible';
        editor.style.opacity = '1';
        editor.focus();
        
        // Clear output when language changes
        this.clearOutput();
        
        console.log('Language changed to:', language, 'Editor visible:', editor.style.display);
    }

    // Debounce function for real-time code checking
    debounceCodeCheck() {
        clearTimeout(this.codeCheckTimeout);
        this.codeCheckTimeout = setTimeout(() => {
            this.checkCodeSyntax();
        }, 1000); // Check after 1 second of no typing
    }

    async checkCodeSyntax() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) {
            return;
        }

        try {
            const syntaxCheck = this.performSyntaxCheck(code, language);
            if (syntaxCheck.hasError) {
                this.displayOutput(`Syntax Check: ❌ ${syntaxCheck.error}`, 'error');
            } else {
                this.displayOutput(`Syntax Check: ✅ Code looks good!`, 'success');
            }
        } catch (error) {
            console.error('Syntax check error:', error);
        }
    }

    performSyntaxCheck(code, language) {
        // Basic syntax checking for different languages
        const checks = {
            java: {
                hasClass: /public\s+class\s+\w+/.test(code),
                hasMain: /public\s+static\s+void\s+main/.test(code),
                hasBrackets: this.checkBrackets(code),
                hasSemicolons: this.checkJavaSemicolons(code)
            },
            python: {
                hasFunction: /def\s+\w+/.test(code),
                hasColons: this.checkPythonColons(code),
                hasIndentation: this.checkPythonIndentation(code)
            },
            c: {
                hasInclude: /#include/.test(code),
                hasMain: /int\s+main\s*\(/.test(code),
                hasBrackets: this.checkBrackets(code),
                hasSemicolons: this.checkCSemicolons(code)
            }
        };

        const languageChecks = checks[language];
        if (!languageChecks) {
            return { hasError: true, error: 'Unsupported language' };
        }

        const errors = [];
        
        if (language === 'java') {
            if (!languageChecks.hasClass) errors.push('Missing public class declaration');
            if (!languageChecks.hasMain) errors.push('Missing main method');
            if (!languageChecks.hasBrackets) errors.push('Mismatched brackets');
            if (!languageChecks.hasSemicolons) errors.push('Missing semicolons');
        } else if (language === 'python') {
            if (!languageChecks.hasFunction) errors.push('No function definition found');
            if (!languageChecks.hasColons) errors.push('Missing colons after function/if/for statements');
            if (!languageChecks.hasIndentation) errors.push('Inconsistent indentation');
        } else if (language === 'c') {
            if (!languageChecks.hasInclude) errors.push('Missing #include statements');
            if (!languageChecks.hasMain) errors.push('Missing main function');
            if (!languageChecks.hasBrackets) errors.push('Mismatched brackets');
            if (!languageChecks.hasSemicolons) errors.push('Missing semicolons');
        }

        return {
            hasError: errors.length > 0,
            error: errors.join(', ')
        };
    }

    checkBrackets(code) {
        const stack = [];
        const brackets = { '{': '}', '(': ')', '[': ']' };
        
        for (let char of code) {
            if (brackets[char]) {
                stack.push(char);
            } else if (Object.values(brackets).includes(char)) {
                if (stack.length === 0) return false;
                const last = stack.pop();
                if (brackets[last] !== char) return false;
            }
        }
        
        return stack.length === 0;
    }

    checkJavaSemicolons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
                !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
                !line.includes('public') && !line.includes('private') && !line.includes('class') &&
                !line.includes('if') && !line.includes('for') && !line.includes('while') &&
                !line.includes('try') && !line.includes('catch') && !line.includes('finally')) {
                return false;
            }
        }
        return true;
    }

    checkCSemicolons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && 
                !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') &&
                !line.startsWith('#include') && !line.startsWith('#define') &&
                !line.includes('if') && !line.includes('for') && !line.includes('while') &&
                !line.includes('int main')) {
                return false;
            }
        }
        return true;
    }

    checkPythonColons(code) {
        const lines = code.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && (line.startsWith('def ') || line.startsWith('if ') || 
                        line.startsWith('for ') || line.startsWith('while ') || 
                        line.startsWith('elif ') || line.startsWith('else:')) && 
                !line.endsWith(':')) {
                return false;
            }
        }
        return true;
    }

    checkPythonIndentation(code) {
        const lines = code.split('\n');
        let expectedIndent = 0;
        
        for (let line of lines) {
            if (!line.trim()) continue;
            
            const currentIndent = line.length - line.trimStart().length;
            
            if (line.trim().endsWith(':')) {
                expectedIndent += 4;
            } else if (currentIndent < expectedIndent && line.trim()) {
                expectedIndent = Math.max(0, expectedIndent - 4);
            }
            
            if (currentIndent !== expectedIndent && line.trim()) {
                return false;
            }
        }
        return true;
    }

    async runCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) {
            this.displayOutput('❌ Please write some code first!', 'error');
            return;
        }

        try {
            this.showLoading();
            
            // Simulate code execution (in a real app, you'd send this to a backend service)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const output = this.executeCode(code, language);
            this.displayOutput(output, 'success');
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.displayOutput(`❌ Error running code: ${error.message}`, 'error');
        }
    }

    executeCode(code, language) {
        // This is a simplified code execution for demo purposes
        // In a real application, you'd need a secure backend service to execute code
        
        let output = `🚀 Code Execution Results\n`;
        output += `Language: ${language.toUpperCase()}\n`;
        output += `Timestamp: ${new Date().toLocaleTimeString()}\n`;
        output += `─`.repeat(50) + `\n\n`;
        
        // Language-specific execution simulation
        if (language === 'java') {
            output += `✅ Java code compiled successfully\n`;
            output += `✅ Main method found and executed\n`;
            output += `✅ Runtime: 0.045s\n`;
            output += `✅ Memory: 45.2MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else if (language === 'python') {
            output += `✅ Python code executed successfully\n`;
            output += `✅ Syntax validation passed\n`;
            output += `✅ Runtime: 0.023s\n`;
            output += `✅ Memory: 32.1MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else if (language === 'c') {
            output += `✅ C code compiled successfully\n`;
            output += `✅ Main function found and executed\n`;
            output += `✅ Runtime: 0.012s\n`;
            output += `✅ Memory: 28.7MB\n\n`;
            output += `📤 Program Output:\n`;
            output += `Result: [0, 1]\n`;
            output += `Test case passed: nums=[2,7,11,15], target=9 → [0,1]\n\n`;
            output += `💡 Note: This is a demo execution. In a real competition, your code would be tested against multiple test cases.`;
        } else {
            output += `❌ Unsupported language: ${language}\n`;
            output += `Supported languages: Java, Python, C`;
        }
        
        return output;
    }

    clearOutput() {
        const outputContent = document.getElementById('output-content');
        outputContent.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-terminal"></i>
                <p>Run your code to see the output here</p>
            </div>
        `;
    }

    displayOutput(output, type = 'info') {
        const outputContent = document.getElementById('output-content');
        const outputPanel = document.getElementById('output-panel');
        
        // Remove placeholder if it exists
        const placeholder = outputContent.querySelector('.output-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create output element with appropriate styling
        const outputElement = document.createElement('div');
        outputElement.className = `output-${type}`;
        outputElement.textContent = output;
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'output-timestamp';
        timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;
        timestamp.style.fontSize = '0.8rem';
        timestamp.style.color = '#888';
        timestamp.style.marginBottom = '5px';
        
        outputContent.appendChild(timestamp);
        outputContent.appendChild(outputElement);
        
        // Ensure output panel is visible
        outputPanel.style.display = 'block';
        outputPanel.style.visibility = 'visible';
        
        // Scroll to bottom of output
        outputContent.scrollTop = outputContent.scrollHeight;
        
        // Log for debugging
        console.log('Output displayed:', output, 'Type:', type);
    }

    async submitCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        
        if (!code.trim()) {
            this.displayOutput('❌ Please write some code first!', 'error');
            return;
        }

        if (!this.currentUser || !this.currentEvent || !this.currentQuestion) {
            this.displayOutput('❌ Please join an event first!', 'error');
            return;
        }

        try {
            this.showLoading();
            
            // Simulate code evaluation (in a real app, this would be processed by a backend)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const result = this.evaluateCode(code, language);
            
            // Save submission to Firestore
            await this.saveSubmission(code, language, result);
            
            // Update user profile
            await this.updateUserScore(result.score);
            
            this.hideLoading();
            this.showSubmissionResult(result);
            
        } catch (error) {
            this.hideLoading();
            this.displayOutput(`❌ Error submitting code: ${error.message}`, 'error');
        }
    }

    evaluateCode(code, language) {
        // Simplified evaluation for demo purposes
        // In a real application, this would involve:
        // 1. Running the code against test cases
        // 2. Checking correctness
        // 3. Measuring performance (time/memory)
        // 4. Calculating score
        
        const testCases = this.currentQuestion.testCases || [];
        let passedTests = 0;
        let totalTests = testCases.length;
        
        // Simulate test case execution
        if (totalTests > 0) {
            passedTests = Math.floor(Math.random() * (totalTests + 1)); // Random for demo
        }
        
        const score = Math.round((passedTests / totalTests) * 100);
        const isCorrect = passedTests === totalTests;
        
        return {
            score: score,
            passedTests: passedTests,
            totalTests: totalTests,
            isCorrect: isCorrect,
            feedback: isCorrect ? 'Excellent! All test cases passed!' : `Passed ${passedTests}/${totalTests} test cases. Keep trying!`,
            executionTime: Math.random() * 1000 + 100, // Random execution time
            memoryUsed: Math.random() * 50 + 10 // Random memory usage
        };
    }

    async saveSubmission(code, language, result) {
        try {
            await db.collection(SUBMISSIONS_COLLECTION).add({
                userId: this.currentUser.uid,
                eventId: this.currentEvent.id,
                questionId: this.currentQuestion.id,
                code: code,
                language: language,
                score: result.score,
                passedTests: result.passedTests,
                totalTests: result.totalTests,
                isCorrect: result.isCorrect,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
                submittedAt: new Date()
            });
        } catch (error) {
            console.error('Error saving submission:', error);
        }
    }

    async updateUserScore(newScore) {
        try {
            const userRef = db.collection(USERS_COLLECTION).doc(this.currentUser.uid);
            await userRef.update({
                totalScore: firebase.firestore.FieldValue.increment(newScore),
                problemsSolved: firebase.firestore.FieldValue.increment(1)
            });
            
            // Reload user profile
            await this.loadUserProfile();
        } catch (error) {
            console.error('Error updating user score:', error);
        }
    }

    showSubmissionResult(result) {
        const message = `🎯 Submission Result

Score: ${result.score}/100
Test Cases: ${result.passedTests}/${result.totalTests} passed
Status: ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}

${result.feedback}

Execution Time: ${result.executionTime.toFixed(2)}ms
Memory Used: ${result.memoryUsed.toFixed(2)}MB`;
        
        this.displayOutput(message, result.isCorrect ? 'success' : 'error');
    }

    async loadLeaderboard() {
        try {
            const leaderboardSnapshot = await db.collection(LEADERBOARD_COLLECTION)
                .orderBy('totalScore', 'desc')
                .limit(10)
                .get();
            
            const leaderboard = [];
            leaderboardSnapshot.forEach(doc => {
                leaderboard.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displayLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Show sample leaderboard for demo
            this.displaySampleLeaderboard();
        }
    }

    displayLeaderboard(leaderboard) {
        const leaderboardTable = document.getElementById('leaderboard-table');
        leaderboardTable.innerHTML = '';

        if (leaderboard.length === 0) {
            leaderboardTable.innerHTML = '<p class="no-leaderboard">No leaderboard data available.</p>';
            return;
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'leaderboard-header';
        header.innerHTML = `
            <div>Rank</div>
            <div>Team</div>
            <div>Problems Solved</div>
            <div>Total Score</div>
            <div>Best Time</div>
        `;
        leaderboardTable.appendChild(header);

        // Create rows
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            row.innerHTML = `
                <div class="rank rank-${index + 1}">${index + 1}</div>
                <div>${entry.team || 'Unknown'}</div>
                <div>${entry.problemsSolved || 0}</div>
                <div>${entry.totalScore || 0}</div>
                <div>${entry.bestTime || '-'}</div>
            `;
            leaderboardTable.appendChild(row);
        });
    }

    displaySampleLeaderboard() {
        const sampleLeaderboard = [
            { team: 'CodeMasters', problemsSolved: 15, totalScore: 1450, bestTime: '1:23:45' },
            { team: 'Algorithm Warriors', problemsSolved: 14, totalScore: 1380, bestTime: '1:45:12' },
            { team: 'Debug Squad', problemsSolved: 13, totalScore: 1320, bestTime: '1:52:30' },
            { team: 'Syntax Heroes', problemsSolved: 12, totalScore: 1250, bestTime: '2:01:15' },
            { team: 'Logic Legends', problemsSolved: 11, totalScore: 1180, bestTime: '2:15:42' }
        ];

        this.displayLeaderboard(sampleLeaderboard);
    }

    showLoading() {
        document.getElementById('loading-spinner').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CodeCompeteApp();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
