import { useEffect, useState, type FormEvent } from "react";
import type { Book, BookUpdate } from "../../types/book";
import "./BookUpdateForm.css";

interface BookUpdateFormProps {
  book: Book | null;
  onSubmit: (id: number, data: BookUpdate) => Promise<void>;
  onCancel: () => void;
}

export function BookUpdateForm({
  book,
  onSubmit,
  onCancel,
}: BookUpdateFormProps) {
  const [form, setForm] = useState<BookUpdate>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!book) {
      setForm({});
      return;
    }

    setForm({
      title: book.title,
      author: book.author,
      cover: book.cover,
      num_pages: book.num_pages,
      year_published: book.year_published,
      isbn13: book.isbn13,
      isbn10: book.isbn10,
      is_awesome: book.is_awesome,
      have_read: book.have_read,
    });
    setError(null);
  }, [book]);

  if (!book || book.id == null) {
    return (
      <div className="book-update-form">
        <p className="book-update-form__empty">
          Select a book from the library to edit its details.
        </p>
      </div>
    );
  }

  const bookId = book.id;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(bookId, {
        ...form,
        author: form.author || null,
        cover: form.cover || null,
        isbn13: form.isbn13 || null,
        isbn10: form.isbn10 || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="book-form book-update-form" onSubmit={handleSubmit}>
      <h2 className="book-form__title">Edit Book</h2>

      {error && <p className="book-form__error">{error}</p>}

      <div className="book-form__field">
        <label className="book-form__label" htmlFor="update-title">
          Title
        </label>
        <input
          id="update-title"
          className="book-form__input"
          value={form.title ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
        />
      </div>

      <div className="book-form__row">
        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-author">
            Author
          </label>
          <input
            id="update-author"
            className="book-form__input"
            value={form.author ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, author: event.target.value }))
            }
          />
        </div>

        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-cover">
            Cover URL
          </label>
          <input
            id="update-cover"
            className="book-form__input"
            type="url"
            value={form.cover ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, cover: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="book-form__row">
        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-year">
            Year Published
          </label>
          <input
            id="update-year"
            className="book-form__input"
            type="number"
            value={form.year_published ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                year_published: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
          />
        </div>

        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-pages">
            Number of Pages
          </label>
          <input
            id="update-pages"
            className="book-form__input"
            type="number"
            value={form.num_pages ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                num_pages: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
          />
        </div>
      </div>

      <div className="book-form__row">
        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-isbn13">
            ISBN-13
          </label>
          <input
            id="update-isbn13"
            className="book-form__input"
            value={form.isbn13 ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, isbn13: event.target.value }))
            }
          />
        </div>

        <div className="book-form__field">
          <label className="book-form__label" htmlFor="update-isbn10">
            ISBN-10
          </label>
          <input
            id="update-isbn10"
            className="book-form__input"
            value={form.isbn10 ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, isbn10: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="book-form__checkboxes">
        <label className="book-form__checkbox-label">
          <input
            type="checkbox"
            checked={form.is_awesome ?? false}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                is_awesome: event.target.checked,
              }))
            }
          />
          Is awesome
        </label>

        <label className="book-form__checkbox-label">
          <input
            type="checkbox"
            checked={form.have_read ?? false}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                have_read: event.target.checked,
              }))
            }
          />
          Have read
        </label>
      </div>

      <div className="book-form__actions">
        <button
          type="submit"
          className="book-form__button book-form__button--primary"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          className="book-form__button book-form__button--secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
