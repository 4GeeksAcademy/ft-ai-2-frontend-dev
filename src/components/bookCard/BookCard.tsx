import type { Book } from "../../types/book";
import "./BookCard.css";

interface BookCardProps {
  book: Book;
  selected?: boolean;
  onSelect?: (book: Book) => void;
}

export function BookCard({ book, selected = false, onSelect }: BookCardProps) {
  const className = ["book-card", selected ? "book-card--selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={className}
      onClick={() => onSelect?.(book)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(book);
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {book.cover ? (
        <img className="book-card__cover" src={book.cover} alt="" />
      ) : (
        <div className="book-card__cover-placeholder" aria-hidden="true">
          No cover
        </div>
      )}

      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        {book.author && <p className="book-card__author">{book.author}</p>}

        <div className="book-card__meta">
          {book.is_awesome && (
            <span className="book-card__badge book-card__badge--awesome">
              Awesome
            </span>
          )}
          {book.have_read && (
            <span className="book-card__badge book-card__badge--read">
              Read
            </span>
          )}
        </div>

        <div className="book-card__details">
          {book.year_published != null && <span>{book.year_published}</span>}
          {book.num_pages != null && <span>{book.num_pages} pages</span>}
        </div>
      </div>
    </article>
  );
}
