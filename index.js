import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup  } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
// import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup  } from 'firebase/auth';

import { getDatabase, ref, onValue, set, child, push , get, query, equalTo, orderByChild, orderByKey } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
//import { getDatabase, ref, onValue, set, child, push, get, query, equalTo, orderByChild} from 'firebase/database'
const URL_ROBOT = "https://res.cloudinary.com/dabyqnijl/image/upload/v1707618601/robot_pkuie2.png"
const firebaseConfig = {
    apiKey: "AIzaSyDx5nz-11rOvp2t7IVC7jf8oifW0u0ArL8",
    authDomain: "chatyesno.firebaseapp.com",
    projectId: "chatyesno",
    storageBucket: "chatyesno.appspot.com",
    messagingSenderId: "718159040167",
    appId: "1:718159040167:web:b874959195ea94660d9582",
    measurementId: "G-XDP5Z0PTGW",
    databaseURL : "https://chatyesno-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


let idUser;
onAuthStateChanged(auth, user=>{
    if (user) {
        const uid = user.uid;
        console.log(user);
        idUser =  uid;
        containerChat.classList.remove('hidden');
        containerLogin.classList.add('hidden');

        getDatabaseMessage();
    }
    else{
        containerChat.classList.add('hidden');
        containerLogin.classList.remove('hidden');        
    }
})


const signupButton = document.querySelector('#signup-button');
const continuarPantallaBtn = document.getElementById("continuarPantalla")
const sendMessageButton = document.getElementById("sendMessage");
const containerChat = document.getElementById("container-chat");
const containerLogin = document.getElementById("container-login");
const containerMessages = document.getElementById("container-messages");

const avatares = document.querySelectorAll('[id^="avatar"]');
let urlImagen;
// Asignar el evento 'click' a cada imagen de avatar
avatares.forEach(avatar => {
  avatar.addEventListener('click', function () {
    const url = seleccionarAvatar(avatar.id);
    urlImagen = url;
});
});

function seleccionarAvatar(avatarId) {
  // Remover la clase 'border-green-500' de todas las imágenes de avatar
  avatares.forEach(avatar => {
    avatar.classList.remove('border-green-500');
  });

  // Agregar la clase 'border-green-500' solo a la imagen de avatar clicada
  document.getElementById(avatarId).classList.add('border-green-500');
  return   document.getElementById(avatarId).src;

}

// Listener para validar la existencia de un usuario
function getDatabaseMessage() {
    const starCountRef = ref(database, 'messages/');
    onValue(starCountRef, (snapshot)=>{
        const data = snapshot.val();
        console.log("Data Mensajes ", data);
        const llaves = data ? Object.keys(data) : [];
        containerMessages.innerHTML = ""
        llaves.forEach(llave=>{
            var mensajeElement = document.createElement('div');
            mensajeElement.classList.add( 'text-white', 'my-2', 'flex',);
            if (data[llave]['idUser']==idUser) {
                mensajeElement.classList.add('flex-row-reverse','justify-start')
            }
            // Agregar la imagen
            if (data[llave]['urlImagen']) {
                var imagenMensaje = document.createElement('img');
                imagenMensaje.src = data[llave]['urlImagen'];
                imagenMensaje.alt = 'Imagen del mensaje';
                imagenMensaje.classList.add('w-12', 'h-12', 'mr-2', 'object-cover', 'rounded-full', 'bg-blanco');
                mensajeElement.appendChild(imagenMensaje);
            }

            // Agregar el texto del mensaje
            var containerMensaje = document.createElement('div');
            containerMensaje.classList.add('mr-2','bg-azul_marino','rounded-lg', 'p-2','flex', 'flex-col');

            var textoNombre = document.createElement('p');
            textoNombre.classList.add('text-xs','text-gray-400')
            textoNombre.textContent = data[llave]['username'];
            containerMensaje.appendChild(textoNombre);
            
            var textoMensaje = document.createElement('p');
            textoMensaje.textContent = data[llave]['message'];
            containerMensaje.appendChild(textoMensaje);

            // Crea una imagen de sticker
            if (data[llave]['stickerMessage']) {
                var imagenSticker = document.createElement('img');
                imagenSticker.src = data[llave]['stickerMessage'];
                imagenSticker.alt = "Imagen de un sticker";
                imagenSticker.classList.add('w-44', 'h-32', 'object-cover')
                containerMensaje.appendChild(imagenSticker);

            }

            if (data[llave]['idUser']==idUser) {
                containerMensaje.classList.add('items-end')
            }
            mensajeElement.appendChild(containerMensaje);

            // Agregar el mensaje al contenedor principal
            containerMessages.appendChild(mensajeElement);
        })
    })
}

function continuarPantalla() {
    document.getElementById("pantallaFormulario").style.display="none";
    document.getElementById("pantallaAvatars").style.display="block"
}

function consultarApiYesNo() {
    const urlYesNo = "https://yesno.wtf/api";
    return fetch(urlYesNo,{
        method : 'GET'
    })
}

async function pushMessageToDatabase(e) {
    e.preventDefault();
    
    
    const messageInput = document.getElementById('message');
    const message = messageInput.value;

    const userRef = ref(database,'users');

    const response = await get(
        query(userRef, orderByKey())
    )
    const valResponse = response.val();
    const responseObject = response ? Object.keys(valResponse) : []
    const llaveUsuario = responseObject.filter(llave=>valResponse[llave]['idUser']==idUser)[0]

    const dataToSend = {
        idUser,
        message,
        urlImagen : valResponse[llaveUsuario]['urlImagen'],
        username : valResponse[llaveUsuario]['username']
    }

    push(ref(database,'messages/'), dataToSend);

    const splitMessage = String(message).split(" ");
    if (splitMessage[0]=="#yesno") {
        const responseYesNoApi = await consultarApiYesNo();
        const jsonResponseYesNoApi = await responseYesNoApi.json();
        const dataToSendRobot = {
            idUser,
            message : jsonResponseYesNoApi['answer'],
            urlImagen : URL_ROBOT,
            username : "Robot",    
            stickerMessage : jsonResponseYesNoApi['image']
        }
        push(ref(database,'messages/'), dataToSendRobot);
    }

    messageInput.textContent = ""
    messageInput.value = ""
}


sendMessageButton.addEventListener('click',pushMessageToDatabase);
// Registro de usuario
signupButton.addEventListener('click',async(e)=>{
    e.preventDefault();
    // Valores de los campos
    const usernameInput = document.getElementById("name")      
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    const email = emailInput.value;
    const password = passwordInput.value;
    const username = usernameInput.value;

    // Funciona
    let idUser;
    console.log("Se envia la data");
    await createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential=>{
        const user = userCredential.user;
        idUser = user.uid;
        errorMessage.textContent = '';
    })
    .catch(error => {
        // Muestra un mensaje de error si el inicio de sesión falla
        const errorCode = error.code;
        const errorMessageText = error.message;
        console.error('Error en el Registro:', errorMessageText);
    });

    const dataToSend = {
        idUser,
        username,
        urlImagen
    }

    push(ref(database,'users/'), dataToSend);

    emailInput.textContent = ""
    passwordInput.textContent =""
    usernameInput.textContent = ""
 });

continuarPantallaBtn.addEventListener('click', continuarPantalla);