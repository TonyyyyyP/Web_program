import db from "../utils/db.js";

export default {
  getAllArticles() {
    return db("article");
  },

  async getArticleById(articleId) {
    try {
      const article = await db("article")
        .join("category", "article.category_id", "=", "category.id")
        .leftJoin("article_tag", "article.id", "=", "article_tag.article_id")
        .leftJoin("Tag", "article_tag.tag_id", "=", "Tag.id")
        .select(
          "article.id as articleId",
          "article.title",
          "article.img",
          "article.description",
          "article.publishedDay",
          "article.abstract",
          "category.id as categoryId",
          "category.name as categoryName",
          db.raw("GROUP_CONCAT(Tag.id) as tagIds"),
          db.raw("GROUP_CONCAT(Tag.name) as tagNames")
        )
        .where("article.id", articleId)
        .groupBy(
          "article.id",
          "article.title",
          "article.img",
          "article.description",
          "article.publishedDay",
          "article.abstract",
          "category.id",
          "category.name"
        )
        .first();

      if (!article) {
        throw new Error("Article not found");
      }

      return {
        id: article.articleId,
        title: article.title,
        img: article.img,
        description: article.description,
        publishedDay: article.publishedDay,
        abstract: article.abstract,
        category: {
          id: article.categoryId,
          name: article.categoryName,
        },
        tags: article.tagIds
          ? article.tagIds.split(",").map((id, index) => ({
              id: parseInt(id, 10),
              name: article.tagNames.split(",")[index],
            }))
          : [],
      };
    } catch (error) {
      console.error("Error fetching article by ID:", error.message);
      throw error;
    }
  },

  async addArticle(newArticle) {
    const result = await db("article").insert({
      title: newArticle.title,
      img: newArticle.img,
      description: newArticle.description,
      publishedDay: newArticle.publishedDay,
      category_id: newArticle.category_id,
      user_id: newArticle.user_id,
      premium: newArticle.premium,
      abstract: newArticle.abstract,
    });

    return result[0];
  },

  deleteArticle(articleId) {
    return db("article").where("id", articleId).del();
  },

  updateArticle(articleId, updatedArticle) {
    return db("article").where("ArticleID", articleId).update(updatedArticle);
  },

  addTagsToArticle(articleId, tagIds) {
    try {
      const tagsToInsert = tagIds.map((tagId) => ({
        article_id: articleId,
        tag_id: tagId,
      }));

      if (tagsToInsert.length > 0) {
        console.log("Chèn các tags:", tagsToInsert); // Kiểm tra tags sẽ được chèn
        db("article_tag")
          .insert(tagsToInsert)
          .then(() => console.log("Tags đã được chèn vào bảng article_tag"))
          .catch((error) => {
            console.error("Lỗi khi chèn tags:", error);
          });
      }
    } catch (error) {
      console.error("Lỗi khi thêm tag vào bài viết:", error);
      throw new Error("Không thể thêm tag vào bài viết.");
    }
  },

  async getTopArticles(limit = 5) {
    const articles = await db("article")
      .join("user", "article.user_id", "=", "user.id")
      .join("category", "article.category_id", "=", "category.id")
      .select(
        "article.id as articleId",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id as userId",
        "user.name as userName",
        "user.img as userImg",
        "category.Name as category_name"
      )
      .orderBy("article.views", "desc")
      .limit(limit);

    return articles;
  },

  async getTopThreeArticlesForLeftHeader(limit = 3) {
    const articles = await db("article")
      .join("user", "article.user_id", "=", "user.id")
      .join("category", "article.category_id", "=", "category.id")
      .select(
        "article.id as articleId",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id as userId",
        "user.img as userImg",
        "user.name as userName",
        "category.Name as category_name"
      )
      .orderBy("article.publishedDay", "desc")
      .limit(limit);

    return articles;
  },

  async getTopFourArticlesForRightHeader(limit = 4) {
    const articles = await db("article")
      .join("user", "article.user_id", "=", "user.id")
      .join("category", "article.category_id", "=", "category.id")
      .select(
        "article.id as articleId",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id as userId",
        "user.name as userName",
        "user.img as userImg",
        "category.Name as category_name"
      )
      .orderBy("article.publishedDay", "desc")
      .limit(limit);

    return articles;
  },

  async getTopTwoArticlesForBreakingNews(limit = 2) {
    const articles = await db("article")
      .join("user", "article.user_id", "=", "user.id")
      .join("category", "article.category_id", "=", "category.id")
      .select(
        "article.id as articleId",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id as userId",
        "user.name as userName",
        "user.img as userImg",
        "category.Name as category_name"
      )
      .orderBy("article.publishedDay", "desc")
      .limit(limit);

    return articles;
  },

  async getNewestArticlesForHomePage(limit = 13) {
    const articles = await db("article")
      .join("user", "article.user_id", "=", "user.id")
      .join("category", "article.category_id", "=", "category.id")
      .leftJoin("comment", "article.id", "=", "comment.article_id")
      .select(
        "article.id as articleId",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id as userId",
        "user.name as userName",
        "user.img as userImg",
        "category.Name as category_name"
      )
      .count("comment.id as comments")
      .groupBy(
        "article.id",
        "article.title",
        "article.img",
        "article.description",
        "article.publishedDay",
        "article.views",
        "user.id",
        "user.name",
        "category.Name"
      )
      .orderBy("article.publishedDay", "desc")
      .limit(limit);

    return articles;
  },

  async getTopArticleInCategory() {
    const topArticles = await db.raw(`
        SELECT articleId, title, img, description, publishedDay, views, category_name, comments
        FROM (
            SELECT 
                article.id AS articleId,
                article.title,
                article.img,
                article.description,
                article.publishedDay,
                article.views,
                category.Name AS category_name,
                COUNT(comment.id) AS comments,
                ROW_NUMBER() OVER (PARTITION BY category.id ORDER BY article.views DESC) AS row_num
            FROM article
            JOIN category ON article.category_id = category.id
            LEFT JOIN comment ON article.id = comment.article_id
            GROUP BY article.id, category.id
        ) AS ranked_articles
        WHERE row_num = 1
        LIMIT 10
    `);

    return topArticles[0];
  },

  async getArticlesWithStatus(page, pageSize) {
    const offset = (page - 1) * pageSize;
    const articles = await db.raw(
      `
        SELECT 
            a.id AS articleId,
            a.title,
            a.img,
            a.publishedDay,
            c.Name AS categoryName,
            CASE
                WHEN f.description IS NOT NULL AND f.accepted IS NULL THEN 'Từ chối' 
       WHEN f.accepted IS NOT NULL THEN 'Đã duyệt' 
       ELSE 'Đang duyệt'
            END AS status
        FROM article a
        LEFT JOIN faultfinding f ON a.id = f.article_id
        LEFT JOIN category c ON a.category_id = c.id
        ORDER BY a.publishedDay DESC
        LIMIT ? OFFSET ?
    `,
      [pageSize, offset]
    );

    const totalArticles = await db.raw(`
        SELECT COUNT(*) AS total FROM article
    `);

    return {
      articles: articles[0],
      total: totalArticles[0][0].total,
    };
  },

  async getArticlesByUserId(user_id) {
    if (!user_id) {
      throw new Error("user_id is required");
    }

    const articles = await db.raw(
      `
      SELECT
          a.id AS articleId,
          a.title,
          a.img,
          a.publishedDay,
          c.Name AS categoryName,
          CASE
              WHEN f.description IS NOT NULL THEN 'Từ chối'
              WHEN f.accepted IS NOT NULL THEN 'Đã duyệt'
              ELSE 'Đang duyệt'
          END AS status
      FROM article a
      LEFT JOIN faultfinding f ON a.id = f.article_id
      LEFT JOIN category c ON a.category_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.publishedDay DESC
    `,
      [user_id]
    );

    return {
      articles: articles[0],
    };
  },

  async getArticlesForEditer(userId) {
  const articles = await db.raw(
    `
    SELECT
        a.id AS articleId,
        a.title,
        a.img,
        a.publishedDay,
        a.premium,
        c.Name AS categoryName,
        CASE
            WHEN f.description IS NOT NULL AND f.accepted IS NULL THEN 'Từ chối' 
            WHEN f.accepted IS NOT NULL THEN 'Đã duyệt' 
            ELSE 'Đang duyệt'  
        END AS status
    FROM article a
    LEFT JOIN faultfinding f ON a.id = f.article_id
    LEFT JOIN category c ON a.category_id = c.id
    INNER JOIN user u ON u.managed_category_id = a.category_id
    WHERE u.id = ?
    ORDER BY a.publishedDay DESC
    `,
    [userId]
  );

  return {
    articles: articles[0],
  };
},


  async getArticleByKeyword(keyword) {
    const query = `
    SELECT a.*, u.username, u.img AS user_img, ff.accepted
    FROM article a
    LEFT JOIN faultfinding ff ON a.id = ff.article_id
    LEFT JOIN user u ON a.user_id = u.id
    WHERE (LOWER(a.title) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(a.description) LIKE LOWER(CONCAT('%', ?, '%'))
    OR LOWER(a.abstract) LIKE LOWER(CONCAT('%', ?, '%')))
    AND ff.accepted IS NOT NULL
    ORDER BY a.publishedDay DESC
  `;

    const result = await db.raw(query, [keyword, keyword, keyword]);

    return result[0];
  },

  async addOneViewToArticle(articleId) {
    try {
      const result = await db("article")
        .where("id", articleId)
        .increment("views", 1);
      console.log("Số bản ghi được cập nhật:", result);
      return result; 
    } catch (error) {
      console.error("Lỗi khi thêm lượt xem:", error);
      throw new Error("Không thể cập nhật lượt xem bài báo.");
    }
  },
};


