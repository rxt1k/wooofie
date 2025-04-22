// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtt5SiiG9ZizbrQqW5WZAbkygAi7T62_s",
    authDomain: "woofie-ed911.firebaseapp.com",
    projectId: "woofie-ed911",
    storageBucket: "woofie-ed911.firebasestorage.app",
    messagingSenderId: "107444516088",
    appId: "1:107444516088:web:1d93071a98ef7d2181b70d",
    measurementId: "G-7KBZ4KE4DK"
};

// Initialize Firebase
console.log("Initializing Firebase...");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        console.error("Error enabling offline persistence:", err);
    });

// DOM elements
const movieContainer = document.getElementById('movieContainer');

// Example movies data
const exampleMovies = [
    {
        title: "The Dark Knight",
        poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/dark-knight"
    },
    {
        title: "Inception",
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/inception"
    },
    {
        title: "Interstellar",
        poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/interstellar"
    },
    {
        title: "The Matrix",
        poster: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/matrix"
    },
    {
        title: "Pulp Fiction",
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/pulp-fiction"
    },
    {
        title: "The Shawshank Redemption",
        poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/shawshank"
    },
    {
        title: "The Godfather",
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/godfather"
    },
    {
        title: "Fight Club",
        poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        downloadLink: "https://example.com/download/fight-club"
    }
];

// Add example movies to Firebase if collection is empty
function initializeExampleMovies() {
    console.log("Starting movie initialization...");
    movieContainer.innerHTML = '<p class="loading">Loading movies...</p>';
    
    db.collection("movies").get().then((querySnapshot) => {
        console.log("Firestore query result:", querySnapshot.size, "movies found");
        
        if (querySnapshot.empty) {
            console.log("No movies found, adding example movies...");
            const batch = db.batch();
            const moviesRef = db.collection("movies");
            
            exampleMovies.forEach((movie, index) => {
                const newDocRef = moviesRef.doc();
                batch.set(newDocRef, movie);
                console.log(`Adding movie ${index + 1}: ${movie.title}`);
            });
            
            batch.commit().then(() => {
                console.log("All example movies added successfully");
                displayMovies();
            }).catch((error) => {
                console.error("Error adding movies:", error);
                movieContainer.innerHTML = '<p class="error-message">Error adding movies. Please try again.</p>';
            });
        } else {
            console.log("Checking for duplicates...");
            // Remove duplicates
            const uniqueMovies = new Map();
            const batch = db.batch();
            
            querySnapshot.forEach((doc) => {
                const movie = doc.data();
                if (!uniqueMovies.has(movie.title)) {
                    uniqueMovies.set(movie.title, doc);
                } else {
                    // Delete duplicate
                    batch.delete(doc.ref);
                    console.log(`Removing duplicate: ${movie.title}`);
                }
            });
            
            // Commit batch delete if there were duplicates
            if (uniqueMovies.size < querySnapshot.size) {
                batch.commit().then(() => {
                    console.log("Duplicates removed successfully");
                    displayMovies();
                }).catch((error) => {
                    console.error("Error removing duplicates:", error);
                    displayMovies();
                });
            } else {
                console.log("No duplicates found");
                displayMovies();
            }
        }
    }).catch((error) => {
        console.error("Error checking movies collection:", error);
        movieContainer.innerHTML = '<p class="error-message">Error loading movies. Please check your connection.</p>';
    });
}

// Fetch and display movies
function displayMovies() {
    console.log("Starting to display movies...");
    movieContainer.innerHTML = '<p class="loading">Loading movies...</p>';
    
    db.collection("movies").get().then((querySnapshot) => {
        console.log("Displaying", querySnapshot.size, "movies");
        
        if (querySnapshot.empty) {
            console.log("No movies to display");
            movieContainer.innerHTML = '<p class="no-movies">No movies available yet.</p>';
            return;
        }
        
        movieContainer.innerHTML = ''; // Clear loading message
        
        querySnapshot.forEach((doc) => {
            const movie = doc.data();
            console.log("Creating card for:", movie.title);
            
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <a href="${movie.downloadLink}" class="download-btn">Watch now</a>
                </div>
            `;
            
            movieContainer.appendChild(movieCard);
        });
    }).catch((error) => {
        console.error("Error displaying movies:", error);
        movieContainer.innerHTML = '<p class="error-message">Error loading movies. Please try again later.</p>';
    });
}

// Initialize example movies and display all movies when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded, starting initialization...");
    initializeExampleMovies();
});