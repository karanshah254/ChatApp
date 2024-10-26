import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // firebase config setup required
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChatAPP</h1>
        <SignOut />
      </header>
      <section>
        {
          user ? <ChatRoom /> : <SignIn />
        }
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
      <button className='sign-in' onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p className='para'>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>
      Sign Out
    </button>
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
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>Send</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src="data:image/png;base64,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" alt='profile' />
        <p>{text}</p>
      </div>
    </>
  )
}

export default App;
