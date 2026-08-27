import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBbDZlOIXKBXZeHZ8C4ncac5BL2FOmNT_0",
  authDomain: "nova-ea-a0049.firebaseapp.com",
  projectId: "nova-ea-a0049",
  storageBucket: "nova-ea-a0049.firebasestorage.app",
  messagingSenderId: "498383564796",
  appId: "1:498383564796:web:8991af256de05e2bd64c79",
  measurementId: "G-8VRCCZ4LMQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);