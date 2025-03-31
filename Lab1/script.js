const canvas = document.getElementById('CanvasForSquare');
const context = canvas.getContext('2d');

let isDrawing = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    startPoint.x = event.clientX - canvas.getBoundingClientRect().left;
    startPoint.y = event.clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;

    endPoint.x = event.clientX - canvas.getBoundingClientRect().left;
    endPoint.y = event.clientY - canvas.getBoundingClientRect().top;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const width = Math.abs(startPoint.x - endPoint.x);
    const height = Math.abs(startPoint.y - endPoint.y);

    context.fillRect(startPoint.x - width / 2, startPoint.y - height / 2, width, height); //Рисование кв. с ц. в нач.точке
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});