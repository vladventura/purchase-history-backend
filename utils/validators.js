module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() == "") {
    errors.username = "Username must not be empty";
  }
  if (email.trim() == "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors.password = "Password must not be empty";
  } else {
    if (password !== confirmPassword) {
      errors.confirmPassword = "Password must match";
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() == "") {
    errors.username = "Username must not be empty";
  }
  if (password === "") {
    errors.password = "Password must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateItemInput = (name, price, cost) => {
  const errors = {};
  if (!name || name === "") {
    errors.name = "Name cannot be empty";
  }
  if (typeof price !== "number" || isNaN(price)) {
    errors.price = "Price must be a number";
  } else {
    if (price < 0) {
      errors.price = "Price can't be negative!";
    }
  }
  if (typeof cost !== "number" || isNaN(cost)) {
    errors.cost = "Cost must be a number";
    if (cost < 0) {
      errors.cost = "Cost can't be negative!";
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
