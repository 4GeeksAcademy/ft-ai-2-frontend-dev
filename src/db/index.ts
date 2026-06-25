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
  isLoanOverdue,
  formatLoanDate,
  type ActiveLoan,
} from "@/db/loans";
