// article.html?id=<articleId>: one article in full.
import { PATHS } from "../firebase.js";
import { h, queryParam } from "../dom.js";
import { isDatabaseKey, safeImageUrl } from "../format.js";
import { bindView } from "../view.js";

const id = queryParam("id");

bindView(document.getElementById("detail"), {
  path: isDatabaseKey(id) ? PATHS.article(id) : null,
  render: (article) => {
    if (!article) return "Không tìm thấy bài viết.";
    document.title = `${article.title} | Karing`;
    const image = safeImageUrl(article.image);
    return [
      h("h1", {}, article.title ?? ""),
      h("p", { class: "detail-meta" }, `Tác giả: ${article.author ?? ""}`),
      image && h("img", { src: image, alt: "" }),
      h("p", { class: "detail-body" }, article.content ?? ""),
      h("a", { href: "news.html" }, "← Tất cả tin tức"),
    ];
  },
});
