export { getDb } from "@/db/client";
export { ensureDbInitialized } from "@/db/init";
export {
  getAllFriends,
  getFriendById,
  createFriend,
  type NewFriend,
} from "@/db/friends";
export {
  getAllBooks,
  getBookById,
  createBook,
  type NewBook,
} from "@/db/books";
export {
  getActiveLoans,
  getOverdueLoans,
  getLoansForBook,
  getActiveLoanForBook,
  createLoan,
  isLoanOverdue,
  formatLoanDate,
  type ActiveLoan,
  type NewLoan,
} from "@/db/loans";
