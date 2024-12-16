import express from 'express';
import articlesService from '../services/articles.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  try {
    // Lấy bài viết theo danh mục "Thể thao" (id = 2) và "Giáo dục" (id = 1)
    const theThaoArticles = await articlesService.findByCategory(2);
    const giaoDucArticles = await articlesService.findByCategory(1);

    res.render('homePage/homePage', {
      theThaoArticles,
      giaoDucArticles,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', async function (req, res) {
    const articleId = req.params.id;
  
    try {
      const article = await articlesService.findById(articleId);
  
      if (!article) {
        return res.status(404).send('Bài viết không tồn tại');
      }
  
      res.render('articleDetail', {
        article,
      });
    } catch (error) {
      console.error('Error fetching article details:', error);
      res.status(500).send('Internal Server Error');
    }
  });

export default router;