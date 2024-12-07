import { initializeApp } from"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";;
//   import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
    signInWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";;
//   import { initializeApp } from "firebase/app";
//import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "./config.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    getDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional




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
        email
      });
      console.log("Document written with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  }
  
  // Add event listener to the register button
  document.getElementById("registerButton")?.addEventListener("click", register);
  




  async function getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }







  async function getUserByEmail(email) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      const user = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];
      console.log("Fetched user:", user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id);
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }
  
  
  if (window.location.pathname == "/users.html") 






  // -------------------Login function-----------------//
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out both email and password fields.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Signed in successfully:", user);

    // Fetch additional user data
    const userData = await getUserByEmail(email);
    console.log("Fetched user data:", userData);




    // Save to session storage and redirect
    sessionStorage.setItem("user", JSON.stringify(userData));
    alert("Logged in successfully!");
    window.location.pathname = ".user.html/.html";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Error: " + error.message);
  }
}

document.getElementById("loginButton")?.addEventListener("click", login);

// ----------------------user page--------------------------------------//
document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    // Validate inputs
    if (!title || !content) {
        alert('Please fill out both the title and content fields.');
        return;
    }

    // Create a new post element
    const postContainer = document.createElement('div');
    postContainer.classList.add('post');

    const postTitle = document.createElement('h2');
    postTitle.textContent = title;
    postContainer.appendChild(postTitle);

    const postContent = document.createElement('p');
    postContent.textContent = content;
    postContainer.appendChild(postContent);

      // Append the new post to the posts container
      const postsContainer = document.getElementById('postsContainer');
      postsContainer.appendChild(postContainer);

      // Optionally, clear the form inputs
      document.getElementById('postForm').reset();
  });


  // Add a new post to Firestore
  async function addPost(title, content) {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            title: title,
            content: content,
            timestamp: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Load posts from Firestore
async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsContainer = document.getElementById("postsContainer");

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        const postContainer = document.createElement("div");
        postContainer.classList.add("post");

        const postTitle = document.createElement("h2");
        postTitle.textContent = data.title;
        postContainer.appendChild(postTitle);

        const postContent = document.createElement("p");
        postContent.textContent = data.content;
        postContainer.appendChild(postContent);

        postsContainer.appendChild(postContainer);
    });
}

// On page load, load all posts
document.addEventListener("DOMContentLoaded", loadPosts);

// Handle form submission
document.getElementById('postForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!title || !content) {
        alert('Please fill out both the title and content fields.');
        return;
    }

    await addPost(title, content);

    // Redirect to index.html after post creation
    window.location.href = "inddex.html";
});


// ----------------------------blog page-----//
document.getElementById('post-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get the title and content from the form
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    // Create new post element
    const newPost = document.createElement('article');
    newPost.classList.add('blog-post');

    // Add title and content to the new post
    newPost.innerHTML = `<h2>${title}</h2><p>${content}</p>`;

    // Append new post to the blog posts section
    document.getElementById('blog-posts').appendChild(newPost);

    // Clear the form inputs
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
});
