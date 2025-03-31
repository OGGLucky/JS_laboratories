document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('results');

function getUsername() {
    return localStorage.getItem('username') || '';
  }

  displayUsername();
  function displayUsername() {
    const userContainer = document.getElementById('userContainer');
    const username = getUsername();
  
    if (username) {
      userContainer.innerHTML = `Пользователь: ${username}`;
    }
  }
  
// Обработка события для формы поиска
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new URLSearchParams(new FormData(searchForm));
  const query = formData.get('query');
  const parameter = formData.get('parameter');

  try {
    const books = await searchBooks(query, parameter);
    displayResults(books);
  } catch (error) {
    console.error('Error during search:', error);
    resultsContainer.innerHTML = '<p>Ошибка во время поиска. Возможно, вы ищете книгу по другому параметру.</p>';
  }
});

  async function searchBooks(query, parameter) {
    const response = await fetch(`/search?query=${encodeURIComponent(query)}&parameter=${encodeURIComponent(parameter)}`);
    if (!response.ok) {
      console.error(`Сервер вернул ${response.status} ${response.statusText}`);
      throw new Error('Ошибка во время поиска.');
    }
    return response.json();
  }

  function displayResults(books) {
      resultsContainer.innerHTML = '';
      if (!Array.isArray(books)) {
        console.error('Неверный ответ от сервера:', books);
        resultsContainer.innerHTML = '<p>Ошибка: Неверный ответ от сервера.</p>';
        return;
      }
      if (books.length === 0) {
        resultsContainer.innerHTML = '<p>Книги не найдены.</p>';
        return;
      }
      const ul = document.createElement('ul');
      books.forEach((book) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <p><strong>Наименование:</strong> ${book.title}</p>
          <p><strong>Автор(ы):</strong> ${book.authors.join(', ')}</p>
          <p><strong>Код ISBN:</strong> ${book.isbn}</p>
          <p><strong>Код издания:</strong> ${book.editionCode}</p>
          <p><strong>Издательство:</strong> ${book.publisher}</p>
          <p><strong>Доступно экземпляров:</strong> ${book.availableCopies}</p>
        `;
        
        if (book.availableCopies > 0) {
          const button = document.createElement('button');
          button.textContent = 'Взять';
          button.addEventListener('click', async () => {
            const response = await checkoutBook(book.title);
            alert(response.message);
          });
          li.appendChild(button);
        }
  
        ul.appendChild(li);
      });
      resultsContainer.appendChild(ul);
    }

    async function checkoutBook(title) {
      const username = getUsername();
    
      try {
        const response = await fetch('/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, title }),
        });
    
        if (!response.ok) {
          console.error(`Сервер вернул ${response.status} ${response.statusText}`);
          throw new Error('Ошибка во время взятия книги.');
        }
    
        const result = await response.json();
        alert(result.message);

        if (result.success) {
          window.location.href = '/profile.html';
        }
      } catch (error) {
        console.error('Error during checkout:', error);
        alert('Произошла ошибка во время взятия книги.');
      }
    }

    
});