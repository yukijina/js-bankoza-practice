'use strict';

// Accounts
const account1 = {
  owner: 'John Smith',
  movements: [200, 455, -306, 2500, -642, -133, 79, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDate: [
    '2023-11-18T21:31:17.178Z',
    '2023-12-23T07:42:02.383Z',
    '2024-01-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2025-10-30T14:11:59.604Z',
    '2025-11-03T14:43:26.374Z',
    '2025-11-05T18:49:59.371Z',
    '2025-11-06T12:01:20.894Z',
  ],
  currency: 'EUR',
  local: 'pt-PT',
};

const account2 = {
  owner: 'Emily Brown',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDate: [
    '2024-02-10T10:17:24.185Z',
    '2024-03-15T14:11:59.604Z',
    '2024-04-20T16:33:06.386Z',
    '2024-05-25T18:49:59.371Z',
    '2024-07-01T12:01:20.894Z',
    '2025-07-15T10:17:24.185Z',
    '2025-08-25T14:11:59.604Z',
    '2025-09-01T19:31:17.178Z',
  ],
  currency: 'USD',
  local: 'en-US',
};

const account3 = {
  owner: 'Michael Davis',
  movements: [430, 1000, 700, 50, 90, -200, -150, 1200],
  interestRate: 0.7,
  pin: 3333,
  movementsDate: [
    '2024-01-01T08:23:44.123Z',
    '2024-01-15T09:20:10.456Z',
    '2024-03-03T11:45:34.789Z',
    '2024-04-10T13:11:19.654Z',
    '2024-06-12T14:22:08.321Z',
    '2025-07-20T15:33:17.178Z',
    '2025-08-30T17:44:26.374Z',
    '2025-09-02T12:15:20.894Z',
  ],
  currency: 'GBP',
  local: 'en-GB',
};

const account4 = {
  owner: 'Sarah Wilson',
  movements: [1200, -400, 300, -250, 5000, -850, -110, 70],
  interestRate: 1.0,
  pin: 4444,

  movementsDate: [
    '2023-12-10T07:15:14.185Z',
    '2024-01-12T09:40:35.604Z',
    '2024-03-08T11:05:44.386Z',
    '2024-05-14T13:20:59.371Z',
    '2024-07-19T14:33:29.894Z',
    '2025-06-22T16:49:47.185Z',
    '2025-08-25T17:57:12.604Z',
    '2025-09-01T18:03:37.178Z',
  ],
  currency: 'CAD',
  local: 'en-CA',
};

const accounts = [account1, account2, account3, account4];

///////////////////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const formLogin = document.querySelector('.login');
// const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Global varialble
// timer - timer should persist degardless different login
let currentAccount, timer;
// let currentAccount = account1;
const currentDate = new Date().toISOString();

///////////////////////////////////////////////////////////////
// Functions

///////////////////////////////////////////////////////////////
// Fromat movement date
const formateMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) => {
    // Math abs - when the date1 is older than date2
    // 1000 milliseconds per sec, 60 sec per min, 60 min per hour, 24 hr per day
    return Math.ceil(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
  };

  // param: current date, movement date
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // if daysPassed is more than 7 days ago, it reutns a formatted date
  return new Intl.DateTimeFormat(locale).format(date);
};

///////////////////////////////////////////////////////////////
// Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferAmount = Number(inputTransferAmount.value);
  const transferTo = inputTransferTo.value;

  // when user inputs are missing
  if (transferAmount === 0 || transferTo === '')
    alert(`Invalid Input. Please try again`);

  // find account to transfer
  const transfterToAccount = accounts.find(
    (account) => account.username === transferTo
  );

  // if account does not exist, alert and exit
  if (!transfterToAccount) alert(`This account does not exit`);

  // if user does not have enough balance, alert and exit
  if (accountBalance(currentAccount) <= transferAmount)
    alert(`You don't have enough balance for this transaction`);

  // if account and balance meet the criterial, complete the transaction
  if (transfterToAccount && accountBalance(currentAccount) >= transferAmount) {
    transfterToAccount.movements.push(transferAmount);
    transfterToAccount.movementsDate.push(currentDate);

    currentAccount.movements.push(-transferAmount);
    currentAccount.movementsDate.push(currentDate);
    alert('Transaction is complete!✅');
    init();
  }
});

///////////////////////////////////////////////////////////////
// Request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = inputLoanAmount.value * currentAccount.interestRate;

  // requester's balance needs to be loan amount + 100
  if (loanAmount + 100 > accountBalance(currentAccount)) {
    alert(`You don't have enough balance to request this loan 😞`);
  }

  currentAccount.movements.push(-loanAmount);
  currentAccount.movementsDate.push(currentDate);
  alert('Loan Request is complete!✅');
  init();
});

///////////////////////////////////////////////////////////////
// Create user name and ID. add them to each account object
accounts.forEach((account, i) => {
  account.username = account.owner
    .split(' ')
    .map((owner) => owner[0].toLowerCase())
    .join('');

  account.id = Math.round(Math.random() * 1000000);
});

///////////////////////////////////////////////////////////////
// User login
formLogin.addEventListener('submit', function (e) {
  e.preventDefault();
  //check if username and pw exist in the accounts
  currentAccount = accounts.filter(
    (account) =>
      account.username === e.target[0].value &&
      account.pin === Number(e.target[1].value)
  )[0];

  // Clear input value
  inputLoginUsername.value = '';
  inputLoginPin.value = '';

  containerApp.style.opacity = 1;

  // If timer alrady exist, clear it first
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  // render account information for the user
  init();
});

///////////////////////////////////////////////////////////////
// Log out timer
const startLogOutTimer = function (timeLimit = 120) {
  // timeLimit default 120 sec = 2 min

  const tick = function () {
    const min = String(Math.trunc(timeLimit / 60)).padStart(2, 0);
    const sec = String(Math.trunc(timeLimit % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    // If there is not time left, it will be logged out. This also prevent the timer goes to minus
    if (timeLimit === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    timeLimit--;
  };

  // This allowed to call tick Immediately before waiting for 1000 milliseconds
  tick();

  // created a separate function -tick. This allowes us to call tick when a page is loaded
  const timer = setInterval(tick, 1000);

  /// to clear the timer, we need to return timer
  return timer;
};

// console.log(currentAccount);

///////////////////////////////////////////////////////////////
// display date based on the current date
// const displayDate = function (account) {
//   const now = new Date();
//   const month = String(now.getMonth() + 1).padStart(2, 0);
//   const date = String(now.getDate()).padStart(2, 0);
//   const year = now.getFullYear();

//   console.log(navigator.geolocation);
//   labelDate.textContent = `${month}/${date}/${year}`;
// };

// displayDate(currentAccount);

///////////////////////////////////////////////////////////////
// display date based on international date/time and user's location
const displayDate = function (account) {
  const option = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  };
  // const date = new Intl.DateTimeFormat(account.local, option).format();
  const date = new Intl.DateTimeFormat(navigator.language, option).format();
  labelDate.textContent = date.replaceAll(',', '');
};

displayDate(currentAccount);

///////////////////////////////////////////////////////////////
// display current account total
const accountBalance = (account) =>
  account.movements.reduce((acc, movement) => acc + movement, 0);

const displayBalance = function (account) {
  const balance = accountBalance(account);
  labelBalance.textContent = `${balance} ${account.currency}`;
};

///////////////////////////////////////////////////////////////
// Display in, out and interest
const displaySummary = function (account) {
  const sumIn = account.movements
    .filter((movement) => movement > 0)
    .reduce((acc, movement) => (acc = acc + movement), 0);

  const sumOut = account.movements
    .filter((movement) => movement < 0)
    .reduce((acc, movement) => acc + movement, 0);

  const sumInterest = ((sumIn * account.interestRate) / 100).toFixed(2);

  const currency = account.currency;

  labelSumIn.textContent = `${sumIn} ${currency}`;
  labelSumOut.textContent = `${Math.abs(sumOut)} ${currency}`;
  labelSumInterest.textContent = `${sumInterest} ${currency}`;
};

///////////////////////////////////////////////////////////////
// Render account information after login
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  let movements;
  movements = sort
    ? account.movements.toSorted((a, b) => b - a)
    : account.movements;
  // console.log(movements);

  movements.forEach((movement, i) => {
    //raw HTML
    const dirty = `
      <div class="movements__row">
        <div class="movements__type movements__type--${
          movement > 0 ? 'deposit' : 'withdrawal'
        }">${i + 1} ${movement > 0 ? 'deposit' : 'withdrawal'}</div>
        <div class="movements__date">${formateMovementDate(
          new Date(account.movementsDate[i]),
          account.local
        )}</div>
        <div class="movements__value">${Math.abs(movement)} €</div>
      </div>
    `;

    // Cerate a trusted policy via Trusted API.
    //Check trustedTypes exist using ? so it does not throw error
    const policy = window.trustedTypes?.createPolicy('safe-html', {
      createHTML: (input) => DOMPurify.sanitize(input),
    });

    // if browsers do not support trustedAPI like Firefox, safari, mobile (as of 2025),
    // it sanitize thrpugh DOMPurify, it use just DOMPurify
    const safeHTML = policy
      ? policy.createHTML(dirty)
      : DOMPurify.sanitize(dirty);
    containerMovements.insertAdjacentHTML('afterbegin', safeHTML);
  });
};

///////////////////////////////////////////////////////////////
// Sort movements
let sorted = true;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, sorted);

  // swith sorted = true/false after function was called
  sorted = !sorted;
});

///////////////////////////////////////////////////////////////
// Initialize
const init = function () {
  displayBalance(currentAccount);
  displaySummary(currentAccount);
  displayMovements(currentAccount);
};

// init();

///////////////////////////////////////////////////////////////
//
