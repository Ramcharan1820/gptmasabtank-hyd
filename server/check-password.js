const bcrypt = require("bcrypt");

const hash =
  "$2b$12$kS64fxwa6db7q.9cXINuwuZ5lP4IkUzYsrINUaRz4DGZ/NODR9vl6";

const password = "ENTER_YOUR_PASSWORD_HERE";

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(
    result ? "Password is correct" : "Password is incorrect"
  );
});