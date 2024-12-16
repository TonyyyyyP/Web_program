import db from "../utils/db.js";

export default {
  getAllArticles() {
    return db("article");
  },

  getArticleById(articleId) {
    return db("article").where("ArticleID", articleId).first();
  },

  async addArticle(newArticle) {
    const result = await db("article").insert({
      title: newArticle.title,
      img: newArticle.img,
      description: newArticle.description,
      publishedDay: newArticle.publishedDay,
      category_id: newArticle.category_id,
    });

    return result[0];
  },

  deleteArticle(articleId) {
    return db("article").where("ArticleID", articleId).del();
  },

  updateArticle(articleId, updatedArticle) {
    return db("article").where("ArticleID", articleId).update(updatedArticle);
  },

  async addTagsToArticle(articleId, tagIds) {
    const tagsToInsert = tagIds.map((tagId) => ({
      article_id: articleId,
      tag_id: tagId,
    }));

    await db("article_tag").insert(tagsToInsert);
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
                WHEN f.description IS NOT NULL THEN 'Từ chối'
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
};
