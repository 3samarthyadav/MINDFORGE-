signInWithEmailAndPassword(auth, email, pass)
  .then(userCredential => {
    // Redirect to dashboard
    window.location.href = 'Dashboard.html';
  })
  .catch(error => {
    alert(error.message);
  });
