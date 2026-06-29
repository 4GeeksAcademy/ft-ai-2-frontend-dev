import type { Book } from "../../types/book";
import "./DeleteConfirmModal.css";

interface DeleteConfirmModalProps {
  book: Book;
  open: boolean;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  book,
  open,
  deleting,
  error,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="delete-confirm-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="delete-confirm-modal__backdrop"
        aria-label="Close delete confirmation"
        onClick={onCancel}
      />

      <div className="delete-confirm-modal__dialog">
        <h2 className="delete-confirm-modal__title">Delete this book?</h2>
        <p className="delete-confirm-modal__message">
          You are about to permanently remove{" "}
          <span className="delete-confirm-modal__book-title">{book.title}</span>{" "}
          from the library. This action cannot be undone.
        </p>

        {error && <p className="delete-confirm-modal__error">{error}</p>}

        <div className="delete-confirm-modal__actions">
          <button
            type="button"
            className="delete-confirm-modal__button delete-confirm-modal__button--cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            Keep Book
          </button>
          <button
            type="button"
            className="delete-confirm-modal__button delete-confirm-modal__button--confirm"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
