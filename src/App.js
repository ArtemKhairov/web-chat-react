import React, { useRef, useState }  from 'react';
import './App.css';

// firebase sdk
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// firebase hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Данные вашего FireBase
firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
})

// используем авторизацию firebase
const auth = firebase.auth();
// хранилище firebase
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
       <header>
        <h1>⚛️💬</h1>
        <SignOut />
      </header>

      <section>
        {/* если логин то показываем сообщения */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Регистрация Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Выйти</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    // создание нового объекта в firebase
    // по заданной схеме в бд
    await messagesRef.add({
      text: formValue,
      // создан
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      // айди пользователя
      uid,
      photoURL
    })

    // обнуление формы
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    {/* отправка сообщения на бэкенд */}
    <form onSubmit={sendMessage}>

      {/* поле ввода сообщений */}
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Написать сообщение..." />

      {/* кнопка доступна после ввода сообщения */}
      <button type="submit" disabled={!formValue}>✨</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      {/* ваша фоточка */}
      <img src={photoURL } />
      <p>{text}</p>
    </div>
  </>)
}

export default App;


