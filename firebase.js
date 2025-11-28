import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getDatabase, remove, get, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvW8jFDLky8LAkc0nqnMN8ennPf0QNpuk",
  authDomain: "pchat-convo.firebaseapp.com",
  databaseURL: "https://pchat-convo-default-rtdb.firebaseio.com",
  projectId: "pchat-convo",
  storageBucket: "pchat-convo.firebasestorage.app",
  messagingSenderId: "691968787548",
  appId: "1:691968787548:web:ee37b7fa62079a2b3f1299",
  measurementId: "G-9FPX23D7EF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app)

function registerAcc(username, pass) {
  get(ref(database, `accounts/${username}`)).then(snapshot=>{
    if(snapshot.exists()){
      console.error("Account already exist")
    }else{
      set(ref(database, `accounts/${username}`), {
        pass: pass
      });
      console.log("New account registered");
    }
  })
}
window.registerAcc = registerAcc

function loginAcc(username, pass) {
  get(ref(database, `accounts/${username}`)).then(snapshot=>{
    if(snapshot.exists()){
      if(snapshot.val().pass === pass){
        window.wsStart(username)
      }else{
        window.error("Wrong Password")
      }
    }else{
      if(confirm("Account not found, do you want to register or try again?")){
        registerAcc(username, pass)
        window.wsStart(username)
      }
    }
  })
}
window.loginAcc = loginAcc

const messagesRef = ref(database, 'accounts');
onValue(messagesRef, () => {
  get(ref(database)).then((snapshot)=>{
    if(snapshot.exists()){
      console.log(snapshot.val())
    }else {
      console.log("No Available Data")
    }
  })
});