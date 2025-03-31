document.addEventListener('DOMContentLoaded', async () => {
  const profileContainer = document.getElementById('userBooks');
  const lateCountContainer = document.getElementById('lateCount');
  const username = localStorage.getItem('username');
  let lateCount = 0; // Переменная для отслеживания просроченных возвратов

  function getUsername() {
    return localStorage.getItem('username') || '';
  }

  displayUsername();

  async function displayUsername() {
    const userContainer = document.getElementById('userCont');
    const username = getUsername();

    if (username) {
      userContainer.innerHTML = `Пользователь: ${username}`;
      await loadUserData(username);
    }
  }

  async function loadUserData(username) {
    try {
      const response = await fetch(`/user-data?username=${username}`);
      if (!response.ok) {
        console.error(`Сервер вернул ${response.status} ${response.statusText}`);
        throw new Error('Ошибка при загрузке данных о пользователе.');
      }

      const userData = await response.json();

      if (userData && userData.length > 0) {
        const ul = document.createElement('ul');
        userData.forEach((checkoutInfo) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <p><strong>Наименование:</strong> ${checkoutInfo.title}</p>
            <p><strong>Дата взятия:</strong> ${checkoutInfo.checkoutDate}</p>
            <p><strong>Срок возврата:</strong> ${checkoutInfo.returnDate}</p>
          `;

          // Кнопка возврата для каждой книги
          const returnButton = document.createElement('button');
          returnButton.textContent = 'Вернуть книгу';
          returnButton.addEventListener('click', async () => {
            await returnBook(username, checkoutInfo.title);
            // После возврата обновление данных о пользователе
            await loadUserData(username);
          });

          li.appendChild(returnButton);
          ul.appendChild(li);

          // Проверка на просроченный возврат
          const returnDate = new Date(checkoutInfo.returnDate);
          const currentDate = new Date();
          if (returnDate < currentDate) {
            lateCount++; // Счетчик просроченных возвратов
          }
        });

        // Обновление отображения счетчика просроченных возвратов
        lateCountContainer.textContent = lateCount;
        profileContainer.appendChild(ul);
      } else {
        profileContainer.innerHTML = '<p>Вы еще не взяли ни одной книги.</p>';
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async function returnBook(username, title) {
    try {
      const response = await fetch('/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, title }),
      });

      if (!response.ok) {
        console.error(`Сервер вернул ${response.status} ${response.statusText}`);
        throw new Error('Ошибка при возврате книги.');
      }

      const responseData = await response.json();
      alert(responseData.message);
      window.location.replace('/search.html');
    } catch (error) {
      console.error('Error returning book:', error);
    }
  }
});
