import express from "express";
import { engine } from "express-handlebars";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Khởi tạo app express
const app = express();

// Lấy đường dẫn của file hiện tại
const __dirname = dirname(fileURLToPath(import.meta.url));

// Đảm bảo Express có thể phục vụ tệp tĩnh như ảnh, CSS
app.use(express.static(__dirname + '/public'));

// Thiết lập Handlebars làm view engine
app.engine(
  "hbs",
  engine({
    extname: ".hbs", // Đuôi của file template
    defaultLayout: "main", // Layout mặc định
  })
);

// Đặt view engine là Handlebars và thư mục views
app.set("view engine", "hbs");
app.set("views", "./views");

// Cấu hình route chính
app.get("/", (req, res) => {
  res.render("index", {
    title: "THE SAIGON TIMES",
  });
});

// Lắng nghe yêu cầu từ client
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
