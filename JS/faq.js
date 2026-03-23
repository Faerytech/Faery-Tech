/* faq.js — Faery Tech FAQ accordion */
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var questions = document.querySelectorAll(".faq-question");
  questions.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      var answer = btn.nextElementSibling;
      var icon = btn.querySelector(".faq-icon");
      questions.forEach(function (o) {
        if (o !== btn) {
          o.setAttribute("aria-expanded","false");
          o.nextElementSibling.style.maxHeight = null;
          o.nextElementSibling.style.paddingBottom = "0";
          o.querySelector(".faq-icon").textContent = "+";
          o.closest(".faq-item").classList.remove("open");
        }
      });
      if (isOpen) {
        btn.setAttribute("aria-expanded","false");
        answer.style.maxHeight = null;
        answer.style.paddingBottom = "0";
        icon.textContent = "+";
        btn.closest(".faq-item").classList.remove("open");
      } else {
        btn.setAttribute("aria-expanded","true");
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.paddingBottom = "1.25rem";
        icon.textContent = "\u2212";
        btn.closest(".faq-item").classList.add("open");
      }
    });
  });
});
