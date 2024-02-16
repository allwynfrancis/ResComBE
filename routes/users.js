const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    let userData = { ...req.body }; // For regular signup

    // Check if the signup is from Google or GitHub
    if (req.body.provider) {
      // Extract relevant information from the request body for social signups
      userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName || "",
        email: req.body.email,
        provider: req.body.provider,
        // Set a placeholder or default password for social signups
        password: "SocialSignupPassword",
      };
    }

    const user = await User.findOne({ email: userData.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });

    // Skip hashing the password for social signups
    const hashPassword = req.body.provider
      ? userData.password
      : await bcrypt.hash(
          req.body.password,
          await bcrypt.genSalt(Number(process.env.SALT))
        );

    await new User({ ...userData, password: hashPassword }).save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
	console.log(error)
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
