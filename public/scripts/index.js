const searchButton = document.querySelector(".search_btn");
let selection = document.getElementById("searchTitle");
let title = document.getElementById("title");
let author = document.getElementById("author");
let genre = document.getElementById("genre");

title.addEventListener("change", () => {
  window.location.href = `/comics/${title.value}`;
});

author.addEventListener("change", () => {
  window.location.href = `/comics/search/author/${author.value}`;
});

genre.addEventListener("change", () => {
  window.location.href = `/comics/search/genre/${genre.value}`;
});

searchButton.addEventListener("click", async () => {
  await fetch(`/comics/search/keyword/${selection.value}`);
  window.location.href = `/comics/search/keyword/${selection.value}`;
});
