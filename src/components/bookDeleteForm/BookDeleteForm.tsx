import { useState } from "react";
import type { Book } from "../../types/book";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import "./BookDeleteForm.css";

interface BookDeleteFormProps {
  book: Book | null;
  onDelete: (id: number) => Promise<void>;
}

export function BookDeleteForm({ book, onDelete }: BookDeleteFormProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!book || book.id == null) {
    return (
      <div className="book-delete-form">
        <p className="book-delete-form__empty">
          Select a book from the library to delete it.
        </p>
      </div>
    );
  }

  const bookId = book.id;
  const bookTitle = book.title;

  async function handleConfirm() {
    setError(null);
    setDeleting(true);

    try {
      await onDelete(bookId);
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete book");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="book-delete-form">
      <h2 className="book-form__title">Delete Book</h2>

      <p className="book-delete-form__summary">
        Remove <strong>{bookTitle}</strong> from the library.
      </p>

      <button
        type="button"
        className="book-delete-form__button"
        onClick={() => {
          setError(null);
          setModalOpen(true);
        }}
      >
        Delete Book
      </button>

      <DeleteConfirmModal
        book={book}
        open={modalOpen}
        deleting={deleting}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!deleting) {
            setModalOpen(false);
            setError(null);
          }
        }}
      />
    </div>
  );
}
