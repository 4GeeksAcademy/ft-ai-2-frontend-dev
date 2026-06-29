import { useCallback, useEffect, useState } from 'react'
import {
  createBook,
  deleteBook,
  fetchBooks,
  updateBook,
} from './api/library'
import { BookCard } from './components/bookCard/BookCard'
import { BookCreateForm } from './components/bookCreateForm/BookCreateForm'
import { BookDeleteForm } from './components/bookDeleteForm/BookDeleteForm'
import { BookUpdateForm } from './components/bookUpdateForm/BookUpdateForm'
import type { Book, BookCreate, BookUpdate } from './types/book'
import './App.css'

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBooks = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetchBooks()
      setBooks(response.books)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  async function handleCreate(data: BookCreate) {
    const created = await createBook(data)
    await loadBooks()
    setSelectedBook(created)
  }

  async function handleUpdate(id: number, data: BookUpdate) {
    await updateBook(id, data)
    await loadBooks()
    const response = await fetchBooks()
    const updated = response.books.find((book) => book.id === id) ?? null
    setSelectedBook(updated)
  }

  async function handleDelete(id: number) {
    await deleteBook(id)
    setSelectedBook(null)
    await loadBooks()
  }

  return (
    <div className="library-app">
      <header className="library-app__header">
        <h1 className="library-app__title">My Library</h1>
        <p className="library-app__subtitle">
          Manage books with the dotlag.space Library API
        </p>
      </header>

      <div className="library-app__layout">
        <main className="library-app__main">
          <div className="library-app__toolbar">
            <span className="library-app__count">
              {loading ? 'Loading…' : `${books.length} books`}
            </span>
          </div>

          {error && <p className="library-app__error">{error}</p>}

          {loading ? (
            <p className="library-app__loading">Loading your library…</p>
          ) : books.length === 0 ? (
            <p className="library-app__empty">
              No books yet. Add your first book using the form on the right.
            </p>
          ) : (
            <div className="library-app__grid">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  selected={selectedBook?.id === book.id}
                  onSelect={setSelectedBook}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="library-app__sidebar">
          <section className="library-app__panel">
            <BookCreateForm onSubmit={handleCreate} />
          </section>

          <section className="library-app__panel">
            <BookUpdateForm
              book={selectedBook}
              onSubmit={handleUpdate}
              onCancel={() => setSelectedBook(null)}
            />
          </section>

          <section className="library-app__panel library-app__panel--danger">
            <BookDeleteForm book={selectedBook} onDelete={handleDelete} />
          </section>
        </aside>
      </div>
    </div>
  )
}

export default App
