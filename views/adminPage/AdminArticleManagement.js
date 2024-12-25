// Add article
document.getElementById("tagSelect").addEventListener("change", function () {
  const selectedTagId = this.value;
  const selectedTagName = this.options[this.selectedIndex].text;

  const existingTag = document.querySelector(
    `#selectedTags .addedTag[data-id="${selectedTagId}"]`
  );
  if (existingTag) {
    alert("Tag này đã được thêm!");
    return;
  }

  const tagDiv = document.createElement("div");
  tagDiv.className = "addedTag";
  tagDiv.setAttribute("data-id", selectedTagId);
  tagDiv.innerHTML = `
      ${selectedTagName}
      <span class="close-btn">&times;</span>
    `;

  document.getElementById("selectedTags").appendChild(tagDiv);
  tagDiv.querySelector(".close-btn").addEventListener("click", function () {
    tagDiv.remove();
  });
  this.value = "";
});
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("articleTitle").value;
  const description = document.getElementById("articleContent").innerHTML;
  const categoryId = document.getElementById("category_id").value;

  const tagIds = [];
  document
    .querySelectorAll("#selectedTags .addedTag")
    .forEach(function (tagDiv) {
      tagIds.push(tagDiv.getAttribute("data-id"));
    });

  const articleImage = document.getElementById("articleImage").files[0];
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category_id", categoryId);
  formData.append("tags", JSON.stringify(tagIds));

  if (articleImage) {
    formData.append("image", articleImage);
  }

  fetch("/articleRouter/addArticle", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
// Update article
async function openUpdateModal(articleId) {
  try {
    const response = await fetch(`/articleRouter/${articleId}`);
    if (!response.ok) {
      throw new Error("Không thể lấy dữ liệu bài viết");
    }

    const article = await response.json();

    console.log(article);
    document.getElementById("updateArticleTitle").value = article.title;
    document.getElementById("updateCategory").value = article.category.id;
    document.getElementById("updateArticleContent").innerHTML =
      article.description;

    const imagePreview = document.getElementById("updateArticleImagePreview");
    if (article.img) {
      const base64Image = "data:image/jpeg;base64," + article.img;
      imagePreview.style.display = "block";
      imagePreview.src = base64Image;
    } else {
      imagePreview.style.display = "none";
    }

    const selectedTags = document.getElementById("updateSelectedTags");
    selectedTags.innerHTML = "";
    article.tags.forEach((tag) => {
      const tagDiv = document.createElement("div");
      tagDiv.className = "addedTag";
      tagDiv.setAttribute("data-id", tag.id);
      tagDiv.innerHTML = `
    ${tag.name}
    <span class="close-btn">&times;</span>
  `;

      tagDiv.querySelector(".close-btn").addEventListener("click", function () {
        tagDiv.remove();
      });
      selectedTags.appendChild(tagDiv);
    });

    // Hiển thị modal
    const updateModal = new bootstrap.Modal(
      document.getElementById("updateArticleModal")
    );
    updateModal.show();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu bài viết:", error);
    alert("Không thể mở modal cập nhật bài viết!");
  }
}

document
  .getElementById("updateArticleForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const articleId = document.getElementById("updateArticleId").value;
    const title = document.getElementById("updateArticleTitle").value;
    const content = document.getElementById("updateArticleContent").innerHTML;
    const categoryId = document.getElementById("updateCategory").value;

    const tagIds = [];
    document
      .querySelectorAll("#updateSelectedTags .addedTag")
      .forEach((tag) => {
        tagIds.push(tag.getAttribute("data-id"));
      });

    const formData = new FormData();
    formData.append("articleId", articleId);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", categoryId);
    formData.append("tags", JSON.stringify(tagIds));

    const image = document.getElementById("updateArticleImage").files[0];
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("/articleRouter/updateArticle", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        location.reload();
      } else {
        throw new Error(data.message || "Lỗi không xác định");
      }
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Không thể cập nhật bài viết!");
    }
  });
// Delete article
function openDeleteModal(articleId) {
  document.getElementById("deleteArticleId").textContent = articleId;
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  confirmDeleteButton.onclick = function () {
    deleteArticle(articleId);
  };
}

function deleteArticle(articleId) {
  fetch(`/articleRouter/deleteArticle/${articleId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message || "Xóa bài viết thành công!");
      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteArticleModal")
      );
      deleteModal.hide();
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    });
}
