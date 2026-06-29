import { useState, type FormEvent } from "react";
import type { BookCreate } from "../../types/book";
import "./BookCreateForm.css";

interface BookCreateFormProps {
  onSubmit: (data: BookCreate) => Promise<void>;
}

const initialForm: BookCreate = {
  title: "",
  author: "",
  cover: "",
  num_pages: null,
  year_published: null,
  isbn13: "",
  isbn10: "",
  is_awesome: true,
  have_read: false,
};

export function BookCreateForm({ onSubmit }: BookCreateFormProps) {
  const [form, setForm] = useState<BookCreate>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        author: form.author || null,
        cover: form.cover || null,
        isbn13: form.isbn13 || null,
        isbn10: form.isbn10 || null,
      });
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2 className="book-form__title">Add a Book</h2>

      {error && <p className="book-form__error">{error}</p>}

      <div className="book-form__field">
        <label className="book-form__label" htmlFor="create-title">
          Title *
        </label>
        <input
          id="create-title"
          className="book-form__input"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          required
        />
      </div>

      <div className="book-form__row">
        <div className="book-form__field">
          <label className="book-form__label" htmlFor="create-author">
            Author
          </label>
          <input
            id="create-author"
            className="book-form__input"
            value={form.author ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, author: event.target.value }))
            }
          />
        </div>

        <div className="book-form__field">
          <label className="book-form__label" htmlFor="create-cover">
            Cover URL
          </label>
          <input
            id="create-cover"
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
          <label className="book-form__label" htmlFor="create-year">
            Year Published
          </label>
          <input
            id="create-year"
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
          <label className="book-form__label" htmlFor="create-pages">
            Number of Pages
          </label>
          <input
            id="create-pages"
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
          <label className="book-form__label" htmlFor="create-isbn13">
            ISBN-13
          </label>
          <input
            id="create-isbn13"
            className="book-form__input"
            value={form.isbn13 ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, isbn13: event.target.value }))
            }
          />
        </div>

        <div className="book-form__field">
          <label className="book-form__label" htmlFor="create-isbn10">
            ISBN-10
          </label>
          <input
            id="create-isbn10"
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
            checked={form.is_awesome ?? true}
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
          disabled={submitting || !form.title.trim()}
        >
          {submitting ? "Adding…" : "Add Book"}
        </button>
      </div>
    </form>
  );
}
