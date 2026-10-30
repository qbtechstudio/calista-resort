(() => {
  const form = document.querySelector("#booking-form");
  const checkIn = form?.elements.namedItem("checkin");
  const checkOut = form?.elements.namedItem("checkout");

  if (!form || !(checkIn instanceof HTMLInputElement) || !(checkOut instanceof HTMLInputElement)) return;

  const toLocalDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkIn.min = toLocalDateValue(today);

  const updateCheckOutMinimum = () => {
    checkOut.min = checkIn.value ? checkIn.value : toLocalDateValue(today);
    if (checkOut.value && checkOut.value < checkOut.min) checkOut.value = "";
  };

  checkIn.addEventListener("change", updateCheckOutMinimum);
  updateCheckOutMinimum();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (checkOut.value <= checkIn.value) {
      checkOut.setCustomValidity("Choose a check-out date after your check-in date.");
      checkOut.reportValidity();
      checkOut.addEventListener("change", () => checkOut.setCustomValidity(""), { once: true });
      return;
    }

    const formData = new FormData(form);
    const guests = formData.get("guests");
    const guestLabel = guests === "1" ? "guest" : "guests";
    window.showToast?.(`Your dates for ${guests} ${guestLabel} are ready. Connect a booking engine to complete your reservation.`);
  });
})();
