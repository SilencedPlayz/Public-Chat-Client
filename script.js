let USERNAME = ""
const names = [
  "Liam", 
  "Sophia", 
  "Ethan", 
  "Ava", 
  "Noah", 
  "Mia", 
  "Lucas", 
  "Isabella", 
  "James", 
  "Amelia"
];
let socket;

const render = "wss://publichat-server.onrender.com"
const replit = "wss://4c247a47-dfba-48e5-9288-a0b46abc340d-00-3v6p32ewl2slk.sisko.replit.dev:3000/"
const local = "ws://localhost:3000"

const fs = document.getElementById("fullscreen")
const loginTxt = document.getElementById("login-txt")
const loading = document.getElementById("loader")
const loginBtn = document.getElementById("eu-btn")
const usrFields = document.querySelectorAll(".eu-field")
const input = document.getElementById("input")
const sendBtn = document.getElementById("send")
const username = document.getElementById("username")
const password = document.getElementById("password")
const typeboard = document.getElementById("typeboard")
const mic = document.getElementById("mic")
const errorTxt = document.getElementById("errortxt")
const onlineCount = document.getElementById("op-count")
const conversation = document.getElementById("conversation")
let isInChat = false

//counts online users every 2 seconds
setInterval(()=>{
  if(isInChat){
    socket.send(JSON.stringify({type: "online"}))
  }
}, 2000)

function error(e){
  errorTxt.innerText = e
  errorTxt.style.display = "block"
  loader.style.display = "none"
  loginTxt.innerText = "Log In"
  loginBtn.style.opacity = "1"
  loginBtn.style.pointerEvents = "auto"
  usrFields.forEach(field => field.style.opacity = "1")
  usrFields.forEach(field => field.style.pointerEvents = "auto")
}
window.error = error

//auto disabling send button if empty input
input.addEventListener("input", ()=>{
  if(input.value.trim() === ""){
    sendBtn.style.pointerEvents = "none"
    sendBtn.style.opacity = "0.5"
  }else{
    sendBtn.style.pointerEvents = "auto"
    sendBtn.style.opacity = "1"
  }
})

//sending message methods
function log(type, message){
  if(!message || !type){
    console.error("Argument is missing: message,type")
  } else {
    if(type === "self"){
      const msgpan = document.createElement("div")
      const usrn = document.createElement("div")
      const msg = document.createElement("textarea")
      const msgUsername = message.username
      const msgMes = message.msg
      msgpan.classList.add("message-panel", "self-msg")
      usrn.classList.add("username")
      msg.classList.add("message", "self-msg")
      msg.readOnly = true
      usrn.innerText = msgUsername
      msg.innerText = msgMes
      msgpan.appendChild(usrn)
      msgpan.appendChild(msg)
      conversation.appendChild(msgpan)
    }else
    if(type === "other"){
      const msgpan = document.createElement("div")
      const usrn = document.createElement("div")
      const msg = document.createElement("textarea")
      const msgUsername = message.username
      const msgMes = message.msg
      msgpan.classList.add("message-panel")
      usrn.classList.add("username")
      msg.classList.add("message")
      msg.readOnly = true
      usrn.innerText = msgUsername
      msg.innerText = msgMes
      msgpan.appendChild(usrn)
      msgpan.appendChild(msg)
      conversation.appendChild(msgpan)
    }else
    if(type === "log"){
      const newlog = document.createElement("div")
      newlog.classList.add("log-group")
      const newdivider = document.createElement("div")
      const newdivider2 = document.createElement("div")
      newdivider.classList.add("divider-log")
      newdivider2.classList.add("divider-log")
      const newtext = document.createElement("div")
      newtext.classList.add("log-text")
      newtext.innerText = message
      conversation.appendChild(newlog)
      newlog.appendChild(newdivider)
      newlog.appendChild(newtext)
      newlog.appendChild(newdivider2)
    }else{
      console.error("Invalid Type")
    }
  }
}

async function send(){
  if(input.value.trim() === "") return;
  if(input.value.trim().startsWith("?>")){
    const logms = input.value.slice(2)
    socket.send(JSON.stringify({type: "log", username: "Rex", msg: logms}))
    log("log", logms)
    input.value = ""
  }else{
    socket.send(JSON.stringify({type: "chat", username: USERNAME, msg: input.value}))
    log("self", {username: USERNAME, msg: input.value})
    input.value = ""
    sendBtn.style.pointerEvents = "none"
    sendBtn.style.opacity = "0.5"
    conversation.scrollTo({
      top: conversation.scrollHeight,
      behavior: "smooth"
    })
  }
}

loginBtn.addEventListener("click", ()=>{
  if(password.value.trim() !== "" && username.value.trim() !== ""){
    loading.style.display = "block"
    errorTxt.style.display = "none"
    loginTxt.innerText = ""
    loginBtn.style.opacity = "0.5"
    loginBtn.style.pointerEvents = "none"
    usrFields.forEach(field => field.style.opacity = "0.5")
    usrFields.forEach(field => field.style.pointerEvents = "none")
    window.loginAcc(username.value.trim(), password.value.trim())
  }else{
    errorTxt.innerText = "Fields are missing input"
    errorTxt.style.display = "block"
  }
})

let isOnMic = false
const sr = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
sr.lang = "en-US"
sr.enterimResults = false
sr.onresult = (event) => {
  let output = ""
  for(let i = 0; i < event.results.length; i++){
    output += event.results[i][0].transcript
  }
  input.value += output
}
sr.onstart = () => {
  mic.style.backgroundImage = 'url("./assets/mic_on.png")'
  mic.style.animation = "micstart 3s infinite"
  mic.style.width = "100%"
  mic.style.opacity = "1"
  sendBtn.style.display = "none"
  input.style.pointerEvents = "none"
  input.style.opacity = "0.5"
  isOnMic = true
}
sr.onend = () => {
  mic.style.backgroundImage = 'url("./assets/mic_off.png")'
  mic.style.animation = ""
  mic.style.width = "60px"
  mic.style.opacity = "0.5"
  sendBtn.style.display = "flex"
  input.style.pointerEvents = "auto"
  input.style.opacity = "1"
  isOnMic = false
  if(input.value.trim() !== ""){
    sendBtn.style.opacity = "1"
    sendBtn.style.pointerEvents = "auto"
  }
}
sr.onerror = (e) =>{
  log("log", "Your browser is not supported")
  console.log(e)
}

function micStart(){
  if(!isOnMic){
    sr.start()
  }else{
    sr.stop()
  }
}

function wsStart(n){
  USERNAME = n
  socket = new WebSocket(render);
  socket.onopen = () => {
    overlay.style.display = "none"
    log("log", `You joined as ${USERNAME}`)
    const sendlog = {type: "log", username: USERNAME, msg: `${USERNAME} joined`}
    const setdata = {type: "data", username: USERNAME}
    socket.send(JSON.stringify(setdata))
    socket.send(JSON.stringify(sendlog))
    isInChat = true
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    const dt = data.type
    const du = data.username
    const dm = data.msg
    console.log(dm)
    if(dt === "log"){
      log("log", dm)
    }else
    if(dt === "online"){
      onlineCount.innerText = `${data.amount}`
    }else
    if(dt === "chat"){
      conversation.scrollTo({
        top: conversation.scrollHeight,
        behavior: "smooth"
      })
      log("other", {username: du, msg: dm})
    }
  };
  
  socket.onclose = () => {
    loading.style.display = "none"
    errorTxt.style.display = "block"
    loginTxt.innerText = "Log-in"
    loginBtn.style.opacity = "1"
    loginBtn.style.pointerEvents = "auto"
    usrFields.forEach(field => field.style.opacity = "1")
    usrFields.forEach(field => field.style.pointerEvents = "auto")
    if(isInChat){
      log("log", "Disconnected from the server")
      typeboard.style.opacity = "0.5"
      typeboard.style.pointerEvents = "none"
      sendBtn.style.pointerEvents = "none"
    }
  };
}
window.wsStart = wsStart

function reqFS(){
  if(document.body.requestFullscreen){
    document.body.requestFullscreen()
  }else if(document.body.webkitRequestFullscreen){
    document.body.webkitRequestFullscreen()
  }else if(document.body.msRequestFullscreen){
    document.body.msRequestFullscreen()
  }
}