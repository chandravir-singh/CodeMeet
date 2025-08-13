// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZHRegiM33oLSikuQy-Nh45lb-Mb3Oxqg",
    authDomain: "project-manager-aac52.firebaseapp.com",
  projectId: "project-manager-aac52",
    storageBucket: "project-manager-aac52.appspot.com",
  messagingSenderId: "784436135955",
    appId: "1:784436135955:web:0ac6832462f021dc3d17e6",
    measurementId: "G-LJTNN8YHB6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore collection names
const EVENTS_COLLECTION = 'events';
const QUESTIONS_COLLECTION = 'CodingQuestions';
const SUBMISSIONS_COLLECTION = 'submissions';
const USERS_COLLECTION = 'Users';
const LEADERBOARD_COLLECTION = 'leaderboard';

