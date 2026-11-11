/* Mobader homepage — vanilla JS for the interactions that used React state:
   mobile menu, FAQ accordion (one open at a time, first open by default),
   service buttons that pick a service in the booking form, and the
   booking form that opens a WhatsApp chat in a new tab. */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "966550000000";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll("[data-faq]").forEach(function (list) {
    var buttons = Array.prototype.slice.call(list.querySelectorAll("button[aria-expanded]"));

    function openOnly(index) {
      buttons.forEach(function (button, i) {
        var isOpen = i === index;
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        var answer = button.nextElementSibling;
        if (answer) answer.hidden = !isOpen;
      });
    }

    buttons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        var isOpen = button.getAttribute("aria-expanded") === "true";
        openOnly(isOpen ? -1 : index);
      });
    });
  });

  /* ---------- Service buttons -> booking form ---------- */
  var serviceSelect = document.querySelector("[data-service-select]");
  var booking = document.querySelector("#booking");

  function selectService(value) {
    if (!serviceSelect) return;
    serviceSelect.value = value;
    // Same as a React controlled <select>: with no matching option, the first one shows.
    if (serviceSelect.selectedIndex === -1) serviceSelect.selectedIndex = 0;
  }

  document.querySelectorAll("[data-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectService(button.getAttribute("data-service"));
      if (booking) booking.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Booking form -> WhatsApp (new tab, page stays) ---------- */
  document.querySelectorAll("[data-booking-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var message =
        "مرحباً مبادر، أرغب في حجز " + data.get("service") + "." +
        "%0Aالاسم: " + data.get("name") +
        "%0Aرقم الجوال: " + data.get("phone");
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message, "_blank", "noopener,noreferrer");
    });
  });
})();
