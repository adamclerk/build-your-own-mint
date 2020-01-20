const moment = require("moment");
const accountTransform = require("../accountsNames.json");

exports.transformTransactionsToUpdates = function(transactions) {
  /**
   * Implement your custom logic of transforming transactions into
   * Google Sheet cell updates.
   *
   * Transactions come in the format of:
   * {
   *   transaction_id: 'xxx'
   *   account_id: 'xxx'
   *   category: 'stuff',
   *   account: 'paypal',
   *   account_owner: 'adam'
   *   name: 'Payment from XXX',
   *   date: 2019-xx-xx,
   *   amount: 123
   * }
   *
   * Updates should be in the form of:
   * {
   *   range: 'A1:B2',
   *   values: [[1,2],[3,4]]
   * }
   *
   * Example: Put each transaction on a line in the spreadsheet.
   * const updates = transactions.map(function(transaction, i) {
   *   return {
   *     range: `A${i + 1}:D${i + 1}`,
   *     values: [Object.values(transaction)]
   *   }
   * });
   *
   */

  transactions = transactions.reduce((result, transaction) => {
    var included = accountTransform[transaction["account_id"]].include;
    transaction.category = transaction.category
      ? transaction.category.join(",")
      : "";
    if (included) {
      result.push(transaction);
    }
    return result;
  }, []);

  transactions.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    } else if (a.date > b.date) {
      return 1;
    } else {
      return 0;
    }
  });

  // See example in comment above.
  let updates = transactions.map(function(transaction, i) {
    transaction["account_id"] =
      accountTransform[transaction["account_id"]].name;
    return {
      range: `RAWLEDGER!A${i + 2}:H${i + 2}`,
      values: [Object.values(transaction)]
    };
  });

  updates.push({
    range: `RAWLEDGER!A1:H1`,
    values: [
      ["Id", "AId", "Category", "Account", "Owner", "Name", "Date", "Amount"]
    ]
  });

  console.log("DEBUG: updates to be made:");
  console.log(updates);

  return updates;
};
