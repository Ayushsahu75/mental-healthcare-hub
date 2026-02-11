// profile.js - User Profile Page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded successfully');

    // Check for global 'auth' and 'db' object
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        showAlert('Firebase services not initialized. Please check firebase-init.js', 'error');
        // Redirect if auth fails dramatically
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Set up event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // --- NEW: Edit Profile Button Handler ---
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => showEditProfileModal());
    }
    
    // --- NEW: Edit Profile Form Submission Handler ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    // Wire up other action buttons
    document.getElementById('updatePasswordBtn')?.addEventListener('click', updatePassword);
    document.getElementById('deleteAccountBtn')?.addEventListener('click', deleteAccount);

    // Main function to listen for auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            displayUserProfile(user);
            fetchAndDisplayFirestoreData(user);
        } else {
            // No user is signed in. Redirect to login.
            showAlert('You are not logged in. Redirecting...', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    });

    // --- NEW: Firestore Data Fetching ---
    async function fetchAndDisplayFirestoreData(user) {
        try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                const profileCollege = document.getElementById('profileCollege');
                const profileStudentId = document.getElementById('profileStudentId');
                
                // Update profile display fields
                if (profileCollege) profileCollege.textContent = data.college || 'Not Set';
                if (profileStudentId) profileStudentId.textContent = data.studentId || 'Not Set';
            } else {
                 console.log("No Firestore document found for user.");
            }
        } catch (error) {
            console.error("Error fetching Firestore data:", error);
            showAlert('Error loading additional profile data.', 'error');
        }
    }
    
    function displayUserProfile(user) {
        // Fetch HTML elements
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const signInMethod = document.getElementById('signInMethod');
        const memberSince = document.getElementById('memberSince');
        const profileAvatarContainer = document.getElementById('profileAvatarContainer');
        const profileAvatarInitial = document.getElementById('profileAvatarInitial');

        // Display user data
        if (profileName) {
            profileName.textContent = user.displayName || 'Wellness Hub User';
        }
        if (profileEmail) {
            profileEmail.textContent = user.email || 'Email not available';
        }
        
        // --- AVATAR LOGIC ---
        if (profileAvatarContainer && profileAvatarInitial) {
            const initial = user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'U');
            
            if (user.photoURL) {
                // If photo URL exists (e.g., Google user), use it as background
                profileAvatarContainer.style.backgroundImage = `url(${user.photoURL})`;
                profileAvatarContainer.style.backgroundColor = 'transparent';
                profileAvatarInitial.style.display = 'none';
            } else {
                // Use local initial/text fallback
                profileAvatarContainer.style.backgroundImage = 'none';
                profileAvatarContainer.style.backgroundColor = '#4F46E5'; // Consistent background color
                profileAvatarInitial.textContent = initial;
                profileAvatarInitial.style.display = 'block';
            }
        }
        // --- END AVATAR LOGIC ---

        // Get Provider Information
        let provider = 'Email/Password';
        if (user.providerData && user.providerData.length > 0) {
            const providerId = user.providerData[0].providerId;
            if (providerId.includes('google')) {
                provider = 'Google Account (Social)';
            } else if (providerId.includes('password')) {
                provider = 'Email/Password';
            }
        }
        if (signInMethod) {
            signInMethod.textContent = provider;
        }

        // Format creation date
        if (memberSince && user.metadata && user.metadata.creationTime) {
            const date = new Date(user.metadata.creationTime);
            memberSince.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // --- NEW: Show Edit Profile Modal ---
    async function showEditProfileModal() {
        const user = auth.currentUser;
        if (!user) return;
        
        const modal = document.getElementById('editProfileModal');
        const editFullName = document.getElementById('editFullName');
        const editEmail = document.getElementById('editEmail');
        const editStudentId = document.getElementById('editStudentId');
        const editCollege = document.getElementById('editCollege');
        
        // 1. Populate Auth fields
        if (editFullName) editFullName.value = user.displayName || '';
        if (editEmail) editEmail.value = user.email || '';
        
        // 2. Populate Firestore fields
        try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                if (editStudentId) editStudentId.value = data.studentId || '';
                // Note: editCollege is a <select>, value must match an <option> value
                if (editCollege) editCollege.value = data.college || '';
            }
        } catch (error) {
            console.error("Error loading Firestore data for edit:", error);
            showAlert('Error loading profile data for editing.', 'error');
            return;
        }

        // 3. Display modal
        if (modal) modal.style.display = 'flex';
    }
    
    // --- NEW: Close Edit Profile Modal ---
    window.closeEditProfileModal = function() {
        const modal = document.getElementById('editProfileModal');
        if (modal) modal.style.display = 'none';
    }
    
    // --- NEW: Save Profile Changes ---
    async function saveProfileChanges() {
        const user = auth.currentUser;
        if (!user) return;
        
        const fullName = document.getElementById('editFullName').value.trim();
        const studentId = document.getElementById('editStudentId').value.trim();
        const college = document.getElementById('editCollege').value;
        const saveBtn = document.getElementById('saveProfileBtn');
        
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            let updatePromises = [];

            // 1. Update Firebase Auth (DisplayName/Full Name)
            if (user.displayName !== fullName) {
                updatePromises.push(user.updateProfile({ displayName: fullName }));
            }
            
            // 2. Update Firestore fields - uses set with merge:true to create if it doesn't exist
            const firestoreUpdateData = {
                fullName: fullName, // Store in Firestore as well for easy querying
                studentId: studentId,
                college: college
            };
            
            // Use set with { merge: true } to ensure document exists and we only update the fields needed.
            updatePromises.push(db.collection('users').doc(user.uid).set(firestoreUpdateData, { merge: true }));

            // Execute all updates concurrently
            await Promise.all(updatePromises);
            
            // 3. Success Feedback and UI update
            showAlert('Profile updated successfully!', 'success');
            
            // Re-fetch and display data on the main page
            displayUserProfile(user); 
            fetchAndDisplayFirestoreData(user);
            
            closeEditProfileModal();
            
        } catch (error) {
            console.error("Error saving profile:", error);
            showAlert(`Failed to save profile: ${error.message}`, 'error');
        } finally {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    }
    // --- END NEW FUNCTIONS ---

    function logoutUser() {
        auth.signOut().then(() => {
            // Sign-out successful.
            showAlert('Logged out successfully. Goodbye!', 'success');
            // Clear local storage items
            localStorage.removeItem('rememberUser');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('guestMode');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }).catch((error) => {
            // An error happened.
            showAlert('Logout failed: ' + error.message, 'error');
        });
    }

    function updatePassword() {
        const email = auth.currentUser.email;
        if (!email) {
            showAlert('Please log in with an email account to update your password.', 'error');
            return;
        }
        
        // Use Firebase to send a reset email to the logged-in user
        auth.sendPasswordResetEmail(email)
            .then(() => {
                showAlert('Password reset link sent to your email! Check your inbox to set a new password.', 'info');
                // Force logout so user signs back in with new password
                setTimeout(logoutUser, 3000); 
            })
            .catch((error) => {
                showAlert('Failed to send password reset email: ' + error.message, 'error');
            });
    }
    
    function deleteAccount() {
        if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            return;
        }

        const user = auth.currentUser;
        if (user) {
             user.delete().then(() => {
                showAlert('Account deleted successfully. We are sad to see you go!', 'success');
                setTimeout(() => {
                    window.location.href = 'register.html';
                }, 1500);
            }).catch((error) => {
                if (error.code === 'auth/requires-recent-login') {
                    showAlert('Security Warning: Please log out and sign in again immediately before attempting to delete your account.', 'error');
                } else {
                    showAlert('Account deletion failed: ' + error.message, 'error');
                }
            });
        }
    }


    /* ----------------------
       Essential Helper Function (Copied from other files)
       ---------------------- */
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            alert.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#ef4444';
        } else if (type === 'info' || type === 'warning') {
            alert.style.backgroundColor = '#f59e0b';
        }
        
        document.body.appendChild(alert);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS for the new avatar container
    const style = document.createElement('style');
    style.textContent += `
        .profile-avatar-container {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 1rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background-size: cover;
            background-position: center;
            background-color: #4F46E5;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            border: 3px solid white;
            overflow: hidden;
        }
        .avatar-initial {
            font-size: 3rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }
        .profile-details-list {
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px dashed #e2e8f0;
            font-size: 0.95rem;
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-item strong {
            color: var(--neutral-800);
        }
        .detail-item span {
            color: var(--neutral-600);
        }
    `;
    document.head.appendChild(style);
});