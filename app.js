import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  signInWithEmailAndPassword,
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { firebaseConfig } from "./config.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to register user
async function register() {
  const email = document.getElementById("exampleInputEmail1").value;
  const password = document.getElementById("exampleInputPassword1").value;
  const name = document.getElementById("name").value;

  if (!email || !password || !name) {
    alert("Please fill out all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters long.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User registered:", user);

    // Save user data to Firestore
    await writeData(name, email);
    console.log("User stored in database.");

    alert(`Registration successful! Welcome, ${user.email}`);
    window.location.pathname = "login.html";
  } catch (error) {
    console.error("Error signing up:", error.code, error.message);
    alert(`Error: ${error.message}`);
  }
}

// Function to write data to Firestore
async function writeData(name, email) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name,
      email,
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

// Event listener for register button
document.getElementById("registerButton")?.addEventListener("click", register);

// Function to login------------------------//
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out both email and password fields.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signed in successfully:", user);

    // Save to session storage and redirect
    sessionStorage.setItem("user", JSON.stringify(user));
    alert("Logged in successfully!");
    window.location.pathname = "user.html";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Error: " + error.message);
  }
}

// Event listener for login button
document.getElementById("loginButton")?.addEventListener("click", login);

// Function to load posts from Firestore
// Function to load posts from Firestore
async function loadPosts() {
  const querySnapshot = await getDocs(collection(db, "posts"));
  const postsContainer = document.getElementById("postsContainer");

  querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Create a new div for each post
      const postContainer = document.createElement("div");
      postContainer.classList.add("post");

      // Create title element
      const postTitle = document.createElement("h3"); // Use h3 for post title
      postTitle.textContent = data.title;
      postContainer.appendChild(postTitle);

      // Create content element
      const postContent = document.createElement("p");
      postContent.textContent = data.content;
      postContainer.appendChild(postContent);

      // Append the postContainer to the postsContainer
      postsContainer.appendChild(postContainer);
  });
}

// Call loadPosts when the page is loaded
document.addEventListener("DOMContentLoaded", loadPosts);


// Function to add a new post to Firestore
async function addPost(title, content) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      title,
      content,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Event listener for the post form submission
document.getElementById("postForm")?.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) {
    alert("Please fill out both the title and content fields.");
    return;
  }

  // Add post to Firestore
  await addPost(title, content);

  // Redirect after post creation
  window.location.href = "index.html";
});
