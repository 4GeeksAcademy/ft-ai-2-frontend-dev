export { getDb } from "@/db/client";
export { ensureDbInitialized } from "@/db/init";
export { getAllFriends, getFriendById } from "@/db/friends";
export { getAllBooks, getBookById } from "@/db/books";
export {
  getActiveLoans,
  getOverdueLoans,
  isLoanOverdue,
  formatLoanDate,
  type ActiveLoan,
} from "@/db/loans";
