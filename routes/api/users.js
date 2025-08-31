const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router.get("/", userController.fetchUsers);
router.post("/", userController.createUser);
router.put("/", userController.editUser);

module.exports = router;
