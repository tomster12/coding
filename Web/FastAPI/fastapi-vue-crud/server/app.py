
# Activate virtual environment
# .\env\Scripts\activate

# Run server
# uvicorn main:app --reload


# Imports
import uuid
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder as jsonify
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Instantiate app and add middleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])


# Debug testing ping call
@app.get("/ping")
def ping_pong():
    return jsonify('pong!')


class Book(BaseModel):
    id: int = 0
    title: str
    author: str
    read: bool


# Variables
books = [
    {'id': uuid.uuid4().hex, 'title': 'On the Road', 'author': 'Jack Kerouac', 'read': True},
    {'id': uuid.uuid4().hex, 'title': 'Harry Potter and the Philosopher\'s Stone', 'author': 'J. K. Rowling', 'read': False},
    {'id': uuid.uuid4().hex, 'title': 'Green Eggs and Ham', 'author': 'Dr. Seuss', 'read': True}
]


# Retrieve all books
@app.get('/books')
def all_books():
    return jsonify({
        'status': 'success',
        'books': books
    })


# Add a book
@app.post('/books')
def add_book(book: Book):
    book.id = uuid.uuid4().hex
    books.append(book)
    return jsonify({
        'status': 'success',
        'message': 'Book added!'
    })


def remove_book(book_id):
    for book in books:
        if book['id'] == book_id:
            books.remove(book)
            return True
    return False


# Update a single book
@app.put('/books/{book_id}')
def update_book(book: Book, book_id: str):
    remove_book(book_id)
    book.id = uuid.uuid4().hex
    books.append(book)
    return jsonify({
        'status': 'success',
        'message': 'Book updated!'
    })


# Delete a single book
@app.delete('/books/{book_id}')
def delete_book(book_id: str):
    remove_book(book_id)
    return jsonify({
        'status': 'success',
        'message': 'Book deleted!'
    })
