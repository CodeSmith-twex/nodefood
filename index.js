// تعريف المكتبات
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const multer = require("multer");
const menu = require("./models/menu");
const PORT = process.env.PORT || 3000;

// img upload تحميل الصور
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload = multer({ storage: storage }).single("image");

// استدعاء اكسبرس وسيسن للرسايل
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  }),
);
// تعريف ملف الصور
app.use("/uploads", express.static("uploads"));
// ظتعريف ملف عرض صفحات الويب
app.set("view engine", "ejs");

// add ارسال بيانات لي القاعدة
app.post("/add", upload, async (req, res) => {
  try {
    const food = new menu({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
    });

    await food.save();
      

    req.session.message = {
      type: "success",
      message: "Food added successfully",
    };

    res.redirect("/");
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});

// جلب البيانات
app.get("/", async (req, res) => {
  try {
    const foods = await menu.find().sort({ _id: -1 });

    res.render("shop", {
      title: "Home Page",
      foods: foods,
    });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

// صفحه ارسال البيانات
app.get("/add", (req, res) => {
  res.render("add", { title: "add-ahmed" });
});

// صفحه تعديل البيانات
app.get("/edit/:id", async (req, res) => {
  try {
    const user = await menu.findById(req.params.id);
    res.render("edit", { title: "Edit User", user: user });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

// update ارسال البيانات المعدله
app.post("/update/:id", upload, async (req, res) => {
  try {
    const user = await menu.findById(req.params.id);
    user.name = req.body.name;
    user.description = req.body.description;
    user.price = req.body.price;
    if (req.file) {
      user.image = req.file.filename;
    }
    await user.save();

    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };

    res.redirect("/");
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});

// delete حزف البيانات
app.get("/delete/:id", async (req, res) => {
  try {
    await menu.findByIdAndDelete(req.params.id);

    req.session.message = {
      type: "success",
      message: "User deleted successfully",
    };

    res.redirect("/");
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});

// صفحه عرض
app.get("/shop", async (req, res) => {
  const foods = await menu.find();

  res.render("index", {
    title: "Shop",
    foods: foods,
  });
});

// data للاتصال باقاعدة
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// البورت لتشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
