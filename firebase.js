import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    get,
    child
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAH8jgwIVMEmt-hkD5ZN1b_ciR95JADdQA",
  authDomain: "hr-summit-insight-portal.firebaseapp.com",
  databaseURL: "https://hr-summit-insight-portal-default-rtdb.firebaseio.com",
  projectId: "hr-summit-insight-portal",
  storageBucket: "hr-summit-insight-portal.firebasestorage.app",
  messagingSenderId: "420477096429",
  appId: "1:420477096429:web:aa216d06b2de672cba97e4"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export {
    ref,
    push,
    set,
    get,
    child
};