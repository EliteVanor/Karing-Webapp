// news.html: list every article.
import { PATHS } from "../firebase.js";
import { h } from "../dom.js";
import { toList, safeImageUrl } from "../format.js";
import { bindView } from "../view.js";

const articleCard = ({ id, title, author, image }) => [
  h("div", { class: "article" },
    h("div", { class: "inf" },
      h("div", { class: "heading" },
        h("a", { href: `article.html?id=${encodeURIComponent(id)}` }, h("h3", {}, title ?? ""))),
      h("div", { class: "intro" }, h("p", {}, `Tác giả: ${author ?? ""}`))),
    h("img", { src: safeImageUrl(image), alt: "" })),
  h("hr"),
];

bindView(document.getElementById("news-list"), {
  path: PATHS.articles,
  render: (value) => {
    const articles = toList(value);
    return articles.length ? articles.flatMap(articleCard) : "Chưa có bài viết nào.";
  },
});
