const router = require("express").Router();
const { type } = require("@testing-library/user-event/dist/type");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");


router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    let user;

    if (req.body.provider) {
      // Social Login
      user = await User.findOne({ email: req.body.email });
    } else {
      // Regular Login
      user = await User.findOne({ email: req.body.email });

      if (!user)
        return res.status(401).send({ message: "Invalid Email or Password" });

      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.status(401).send({ message: "Invalid Email or Password" });
    }

    const token = user.generateAuthToken();
    // console.log("Token \n" + token);
    res.status(200).send({ data: token, message: "Logged in successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ data: user, message: "User found" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/resume", async (req, res) => {
  try {
    // Validate request body (optional)
    const { email, content, fileName } = req.body;
    console.log(fileName)
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update the user document with the resume content
    user.resumeContent = content; // Update the resumeContent field
    user.fileName = fileName; // Update the resumeContent field
    await user.save(); // Save the updated user document

    res.status(201).json({ message: "Resume content saved successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/resume/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract resume content and filename from the user document
    const resumeContent = user.resumeContent;
    const fileName = user.fileName;
    const firstName = user.firstName;

    res.status(200).json({ resumeContent, fileName, firstName });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



const validate = (data) => {
  let schema;

  if (data.provider) {
    // Google or GitHub Signup
    schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      provider: Joi.string().label("Provider"),
    });
  } else {
    // Regular Login
    schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().required().label("Password"),
    });
  }

  return schema.validate(data);
};

module.exports = router;
