import express from "express";
import { engine } from "express-handlebars";
import numeral from "numeral";
import passport from "passport";
import { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import hbs_section from "express-handlebars-sections";
import ArticleService from "./services/article.service.js";
import CategoryService from "./services/category.service.js";
import TagService from "./services/tag.service.js";
import UserService from "./services/user.service.js";
import articleRouter from "./routes/article.route.js";
import categoryRouter from "./routes/category.route.js";
import tagRouter from "./routes/tag.route.js";
import accountRouter from "./routes/account.route.js";
import commentRouter from "./routes/comment.route.js";
import { isAuth, isAdmin } from "./middlewares/auth.mdw.js";
import articleService from "./services/article.service.js";
import commentService from "./services/comment.service.js";
import premium_extension_requestService from "./services/premium_extension_request.service.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(process.env.GITHUB_CLIENT_ID); // Kiểm tra giá trị của biến môi trường
console.log(process.env.GITHUB_CLIENT_SECRET); // Kiểm tra giá trị của biến môi trường


// Session configuration
app.set("trust proxy", 1);
app.use(
  session({
    secret: "your-secret-key", 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
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
      or(a, b) {
        return a || b;
      }, 
    },
  })
);


app.set("view engine", "hbs");
app.set("views", "./views");

app.use(passport.initialize());
app.use(passport.session());

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
      isLoggedIn: req.session.auth || false,
      authUser: req.session.authUser || null,
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
app.get("/baibao/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await articleService.getArticleById(id);
    await articleService.addOneViewToArticle(id);

    if (!article) {
      return res
        .status(404)
        .render("404", { message: "Bài viết không tồn tại." });
    }
    const comments = await commentService.getCommentsByArticleIdWithUser(id);

    res.render("articlePage/articlePage", {
      article,
      comments,
      isLoggedIn: req.session.auth || false,
      authUser: req.session.authUser || null,
    });
  } catch (error) {
    console.error("Lỗi khi tải bài viết:", error);
    res.status(500).render("error", { message: "Đã xảy ra lỗi server." });
  }
});


app.get("/bientap", async (req, res) => {
  const userId = req.session.authUser.id;
  const { articles } = await ArticleService.getArticlesForEditer(userId);
  res.render("editerPage/editerPage", {
    articles,
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
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
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
});

app.get("/quantrivien/quanlydanhmuc", async (req, res) => {
  const categories = await CategoryService.getAllCategories();
  res.render("adminPage/AdminCategoryManagement", {
    categories,
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
});

app.get("/quantrivien/quanlytag", async (req, res) => {
  const tags = await TagService.getAllTags();
  res.render("adminPage/AdminTagManagement", {
    tags,
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
});

app.get("/quantrivien/quanlynguoidung", async (req, res) => {
  const users = await UserService.getAllUsers();
  const category = await CategoryService.getAllCategories();
  res.render("adminPage/AdminUserManagement", {
    users,
    category,
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
});

app.get("/quantrivien/quanlyPremium", async (req, res) => {
  try {
    const premium_extension_request =
      await premium_extension_requestService.getAllPremium_extension_request();
    res.render("adminPage/AdminPremiumManagement", {
      premium_extension_request,
      isLoggedIn: req.session.auth || false,
      authUser: req.session.authUser || null,
    });
  } catch (error) {
    console.error("Lỗi khi lấy yêu cầu gia hạn premium:", error);
    res.status(500).send("Lỗi server.");
  }
});

// UserPage route
app.get("/nguoidung/thembaiviet", async (req, res) => {
  const categories = await CategoryService.getAllCategories();
  const tags = await TagService.getAllTags();
  res.render("userPage/UserAddArticlePage", {
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
    categories,
    tags,
  });
});

app.get("/nguoidung/danhsachbaiviet", async (req, res) => {
  try {
    if (!req.session || !req.session.authUser) {
      return res.status(401).send("Bạn chưa đăng nhập.");
    }

    const userId = req.session.authUser.id;
    if (!userId) {
      return res.status(400).send("Không tìm thấy id người dùng.");
    }

    const { articles } = await ArticleService.getArticlesByUserId(userId);

    res.render("userPage/UserArticleListPage", {
      articles,
      isLoggedIn: req.session.auth || false,
      authUser: req.session.authUser || null,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy danh sách bài viết.");
  }
});

app.get("/timkiem", async (req, res) => {
  const { keyword } = req.query;
  const page = parseInt(req.query.page) || 1; 
  const pageSize = 16; 

  const articles = await articleService.getArticleByKeyword(keyword);
  console.log(articles)
  const filteredArticles = articles.filter((article) => {
    return (
      article.publishedDay <= new Date() 
      // &&
      // article.faultfinding &&
      // article.faultfinding.accepted
    );
  });
console.log("filter:", filteredArticles);
  const sortedArticles = filteredArticles.sort(
    (a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0)
  );

  const totalArticles = sortedArticles.length;
  const totalPages = Math.ceil(totalArticles / pageSize);
  const offset = (page - 1) * pageSize;

  const paginatedArticles = sortedArticles.slice(offset, offset + pageSize);

  res.render("searchArticlePage/searchArticlePage", {
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
    keyword: keyword,
    articles: paginatedArticles,
    currentPage: page,
    totalPages: totalPages,
  });
});

app.get("/nguoidung/thongtin", (req, res) => {
  console.log(req.session.authUser);
  res.render("userPage/UserProfilePage", {
    isLoggedIn: req.session.auth || false,
    authUser: req.session.authUser || null,
  });
});

app.use("/articleRouter", articleRouter);
app.use("/categoryRouter", categoryRouter);
app.use("/tagRouter", tagRouter);
app.use("/accountRouter", accountRouter);
app.use("/commentRouter", commentRouter);

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
