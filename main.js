import express from "express";
import { engine } from "express-handlebars";
import numeral from "numeral";
import { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import hbs_section from "express-handlebars-sections";

// Import custom services and routes
// import categoryRouter from "./old_folder/old_routes/category.route.js";
// import productRouter from "./old_folder/old_routes/product.route.js";
// import productUserRouter from "./old_folder/old_routes/product-user.route.js";
// import accountRouter from "./old_folder/old_routes/account.route.js";
import ArticleService from "./services/article.service.js";
import CategoryService from "./services/category.service.js";
import TagService from "./services/tag.service.js";
import UserService from "./services/user.service.js";
import articleRouter from "./routes/article.route.js";
import categoryRouter from "./routes/category.route.js";
import tagRouter from "./routes/tag.route.js";
import accountRouter from "./routes/account.route.js";
// import { isAuth, isAdmin } from "./middlewares/auth.mdw.js";
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Session configuration
app.set("trust proxy", 1);
app.use(
  session({
    secret: "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);

// Middleware for parsing form data
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Serve static files
app.use("/static", express.static("static"));

// Configure Handlebars as the view engine
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    helpers: {
      format_number(value) {
        return numeral(value).format("0,0") + " vnd";
      },
      fillHtmlContent: hbs_section(),
      formatDate(date) {
        if (!date) return "";
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(date).toLocaleDateString("en-GB", options);
      },

      // Bổ sung các helper của bạn tại đây:
      eq(a, b) {
        return a === b;
      },
      gt(a, b) {
        return a > b;
      },
      lt(a, b) {
        return a < b;
      },
      add(a, b) {
        return a + b;
      },
      subtract(a, b) {
        return a - b;
      },
      range(start, end) {
        const range = [];
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        return range;
      },
    },
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");

// Middleware to load categories into res.locals
app.use(async (req, res, next) => {
  try {
    const categories = await CategoryService.getAllCategories();
    const topThreeArticlesForLeftHeader =
      await ArticleService.getTopThreeArticlesForLeftHeader();
    res.locals.lcCategories = categories;
    res.locals.topThreeArticlesForLeftHeader = topThreeArticlesForLeftHeader;
  } catch (error) {
    console.error("Error loading categories:", error);
    res.locals.lcCategories = [];
  }
  next();
});

// Middleware to handle session data for authentication
app.use((req, res, next) => {
  req.session.auth = req.session.auth ?? false;
  res.locals.auth = req.session.auth;
  res.locals.authUser = req.session.authUser;
  next();
});

// Define routes
// Home route
app.get("/", async (req, res) => {
  try {
    const topArticles = await ArticleService.getTopArticles();
    const topThreeArticlesForLeftHeader =
      await ArticleService.getTopThreeArticlesForLeftHeader();
    const topFourArticlesForRightHeader =
      await ArticleService.getTopFourArticlesForRightHeader();
    const topTwoArticlesForBreakingNews =
      await ArticleService.getTopTwoArticlesForBreakingNews();
    const newestArticlesForHomePage =
      await ArticleService.getNewestArticlesForHomePage();
    const topArticleInCategory = await ArticleService.getTopArticleInCategory();
    const categories = await CategoryService.getAllCategories();

    const section1Articles = newestArticlesForHomePage.slice(0, 4);
    const section2Articles = newestArticlesForHomePage.slice(4, 8);
    const section3Articles = newestArticlesForHomePage.slice(8, 9);
    const section4Articles = newestArticlesForHomePage.slice(9, 13);

    res.render("homePage/homePage", {
      topArticles,
      topThreeArticlesForLeftHeader,
      topFourArticlesForRightHeader,
      topTwoArticlesForBreakingNews,
      topArticleInCategory,
      section1Articles,
      section2Articles,
      section3Articles,
      section4Articles,
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/lienlac", (req, res) => {
  res.render("homePage/contact");
});

app.get("/danhmuc", (req, res) => {
  res.render("homePage/category");
});

// Article route
app.get("/baibao", (req, res) => {
  res.render("articlePage/articlePage");
});

// AdminPage route
app.get("/quantrivien/quanlybaibao", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  const { articles, total } = await ArticleService.getArticlesWithStatus(
    page,
    pageSize
  );

  const categories = await CategoryService.getAllCategories();
  const tags = await TagService.getAllTags();

  res.render("adminPage/AdminArticleManagement", {
    articles,
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
    categories,
    tags,
  });
});

app.get("/quantrivien/quanlydanhmuc", async (req, res) => {
  const categories = await CategoryService.getAllCategories();
  res.render("adminPage/AdminCategoryManagement", {
    categories,
  });
});

app.get("/quantrivien/quanlytag", async (req, res) => {
  const tags = await TagService.getAllTags();
  res.render("adminPage/AdminTagManagement", { tags });
});

app.get("/quantrivien/quanlynguoidung", async (req, res) => {
  const users = await UserService.getAllUsers();
  res.render("adminPage/AdminUserManagement", {users});
});

// UserPage route
app.get("/nguoidung/thembaiviet", (req, res) => {
  res.render("userPage/UserAddArticlePage");
});

app.get("/nguoidung/danhsachbaiviet", (req, res) => {
  res.render("userPage/UserArticleListePage");
});

app.get("/nguoidung/thongtin", (req, res) => {
  res.render("userPage/UserProfilePage");
});

app.use("/articleRouter", articleRouter);
app.use("/categoryRouter", categoryRouter);
app.use("/tagRouter", tagRouter);
app.use("/accountRouter", accountRouter);

// app.use("/admin/categories", isAuth, isAdmin, categoryRouter);
// app.use("/admin/products", isAuth, isAdmin, productRouter);
// app.use("/products", productUserRouter);
// app.use("/account", accountRouter);

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
