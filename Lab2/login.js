document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
  
    // Обработка события для формы входа
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new URLSearchParams(new FormData(loginForm));
      const username = formData.get('username');
      const password = formData.get('password');
  
      try {
        const response = await loginUser(username, password);
      } catch (error) {
        console.error('Error during login:', error);
        alert(`Ошибка во время входа: ${error.message}`);
      }
    });
  
    // Обработка события для формы регистрации
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new URLSearchParams(new FormData(registerForm));
      const username = formData.get('username');
      const password = formData.get('password');
  
      try {
        const response = await registerUser(username, password);
        alert(response.message);
      } catch (error) {
        console.error('Error during registration:', error);
        alert('Ошибка во время регистрации. Пользователь с таким именем уже существует.');
      }
    });
    async function loginUser(username, password) {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка во время входа.');
      }
      const result = await response.json();
  
      if (result.success) {
        alert(result.message);
        localStorage.setItem('username', username);
        window.location.href = '/search.html';
      } else {
        alert('Ошибка во время входа. Проверьте имя пользователя и пароль.');
      }
    }
  
    async function registerUser(username, password) {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка во время регистрации.');
      }
  
      return response.json();
    }
});
  