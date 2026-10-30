(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");
  const header = document.querySelector(".site-header");
  const backToTop = document.querySelector(".back-to-top");
  const topLinks = document.querySelectorAll('a[href$="#top"]');
  const toast = document.querySelector(".toast");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const canAnimate = Boolean(gsap && window.ScrollTrigger && !reduceMotion);
  let toastTimer;

  if (gsap && window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  if (canAnimate) root.classList.add("gsap-enhanced");

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  };

  window.showToast = showToast;

  const reservationForm = document.querySelector("#stay-request");
  const arrivalDate = reservationForm?.querySelector("#arrival-date");
  const departureDate = reservationForm?.querySelector("#departure-date");
  let todayValue = "";
  if (arrivalDate && departureDate) {
    const today = new Date();
    todayValue = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    arrivalDate.min = todayValue;
    departureDate.min = todayValue;
    arrivalDate.addEventListener("change", () => {
      departureDate.min = arrivalDate.value || todayValue;
      if (departureDate.value && departureDate.value <= arrivalDate.value) departureDate.value = "";
      departureDate.setCustomValidity("");
    });
    departureDate.addEventListener("input", () => {
      departureDate.setCustomValidity(
        arrivalDate.value && departureDate.value <= arrivalDate.value
          ? "Departure must be after arrival."
          : ""
      );
    });
  }

  reservationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!reservationForm.reportValidity()) return;

    const status = reservationForm.querySelector("#reservation-status");
    if (arrivalDate && departureDate && departureDate.value <= arrivalDate.value) {
      departureDate.setCustomValidity("Departure must be after arrival.");
      departureDate.reportValidity();
      return;
    }

    arrivalDate?.setCustomValidity("");
    departureDate?.setCustomValidity("");
    reservationForm.reset();
    if (departureDate) departureDate.min = todayValue;

    if (status) {
      status.textContent = "Thank you your enquiry has been submitted.";
      status.classList.add("is-ready");
    }
    const submitButton = reservationForm.querySelector(".reservation-submit");
    if (submitButton) {
      submitButton.textContent = "Enquiry submitted";
      submitButton.disabled = true;
    }
  });

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    const isDark = theme === "dark";
    themeToggle?.setAttribute("aria-pressed", String(isDark));
    themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#111a16" : "#f7f6f1");
    localStorage.setItem("calista-theme", theme);
  };

  const savedTheme = localStorage.getItem("calista-theme");
  if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    if (canAnimate) {
      gsap.fromTo(themeToggle, { rotate: -32, scale: .85 }, { rotate: 0, scale: 1, duration: .55, ease: "back.out(2)" });
    }
  });

  const closeNavigation = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    navigation?.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navigation?.classList.toggle("is-open", isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
  document.addEventListener("pointerdown", (event) => {
    if (menuToggle?.getAttribute("aria-expanded") === "true" &&
        !navigation?.contains(event.target) &&
        !menuToggle.contains(event.target)) closeNavigation();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNavigation();
  });

  const progress = document.querySelector(".scroll-progress");
  const beach = document.querySelector(".beach-lifestyle");
  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      if (progress) progress.style.width = `${Math.min(amount, 1) * 100}%`;
      header?.classList.toggle("is-scrolled", window.scrollY > 16);
      backToTop?.classList.toggle("is-visible", window.scrollY > 480);
      if (beach && !canAnimate && !reduceMotion) {
        const bounds = beach.getBoundingClientRect();
        const sectionProgress = (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height);
        const parallax = (Math.max(0, Math.min(1, sectionProgress)) - .5) * 24;
        beach.style.setProperty("--parallax-y", `${parallax.toFixed(1)}px`);
      }
      scrollFrame = 0;
    });
  }, { passive: true });
  window.dispatchEvent(new Event("scroll"));

  const scrollToTop = (event) => {
    event?.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  backToTop?.addEventListener("click", scrollToTop);
  topLinks.forEach((link) => {
    const target = new URL(link.href, window.location.href);
    if (target.pathname === window.location.pathname && target.hash === "#top") {
      link.addEventListener("click", scrollToTop);
    }
  });

  const navigationLinks = [...(navigation?.querySelectorAll('a[href^="#"]') ?? [])];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });

    if (!canAnimate) document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting)?.target;
      if (!visibleSection) return;
      navigationLinks.forEach((link) => {
        const isCurrent = link.hash === `#${visibleSection.id}`;
        link.classList.toggle("is-current", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });

    navigationLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section && section !== header) sectionObserver.observe(section);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }

  if (canAnimate) {
    window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
    if (document.querySelector(".welcome")) {
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .from(".site-header .brand", { y: -20, autoAlpha: 0, duration: .8 })
        .from(".primary-navigation > *", { y: -12, autoAlpha: 0, duration: .55, stagger: .075 }, "-=.48")
        .from(".welcome-copy .eyebrow", { y: 20, autoAlpha: 0, duration: .7 }, "-=.18")
        .from(".welcome-copy h1", { y: 42, autoAlpha: 0, duration: 1 }, "-=.43")
        .from(".welcome-copy .welcome-description, .welcome-copy > .text-link, .welcome-note", {
          y: 20, autoAlpha: 0, duration: .7, stagger: .13
        }, "-=.5");

      gsap.fromTo(".welcome-image-main", { clipPath: "inset(0 0 100% 0)", scale: 1.08 }, {
        clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.45, delay: .28, ease: "power4.inOut"
      });
      gsap.from(".welcome-image-detail, .image-seal", {
        y: 30, scale: .92, autoAlpha: 0, duration: .8, delay: .75, stagger: .12, ease: "back.out(1.5)"
      });
    }

    document.querySelectorAll(".reveal").forEach((element) => {
      if (element.matches(".welcome-copy, .welcome-visual, .villa-card, .gallery-image, .testimonial-slide")) return;
      const x = element.classList.contains("reveal-from-left") ? -38
        : element.classList.contains("reveal-from-right") ? 38 : 0;
      const delay = element.classList.contains("why-item")
        ? [...element.parentElement.children].indexOf(element) * .1
        : 0;
      gsap.fromTo(element, { autoAlpha: 0, y: 34, x }, {
        autoAlpha: 1, y: 0, x: 0, duration: .9, delay, ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true }
      });
    });

    if (beach) {
      gsap.to(".beach-background", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: beach, start: "top bottom", end: "bottom top", scrub: .6 }
      });
    }

    const magneticElements = document.querySelectorAll(".booking-cta .button, .back-to-top");
    magneticElements.forEach((element) => {
      const moveX = gsap.quickTo(element, "x", { duration: .4, ease: "power3.out" });
      const moveY = gsap.quickTo(element, "y", { duration: .4, ease: "power3.out" });
      element.addEventListener("pointermove", (event) => {
        const bounds = element.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * .12);
        moveY((event.clientY - bounds.top - bounds.height / 2) * .12);
      }, { passive: true });
      element.addEventListener("pointerleave", () => {
        moveX(0);
        moveY(0);
      });
    });
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      root.style.setProperty("--glow-x", `${event.clientX}px`);
      root.style.setProperty("--glow-y", `${event.clientY}px`);
    }, { passive: true });
  }

  const updateDots = (dots, activeIndex) => {
    dots.forEach((dot, index) => {
      const active = index === activeIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  };

  const animateActiveSlide = (swiper, selector) => {
    if (!canAnimate) return;
    const activeSlide = swiper.slides[swiper.activeIndex];
    const image = activeSlide?.querySelector(selector);
    if (!image) return;
    gsap.fromTo(image, { clipPath: "inset(0 0 100% 0)" }, {
      clipPath: "inset(0 0 0% 0)", duration: .85, ease: "power3.inOut", overwrite: true
    });
  };

  const setupCarouselAutoplay = (carousel, advance, delay) => {
    if (!carousel || reduceMotion) return;
    let paused = false;
    let inView = true;
    window.setInterval(() => {
      if (!paused && inView && !document.hidden) advance();
    }, delay);
    carousel.addEventListener("pointerenter", () => { paused = true; });
    carousel.addEventListener("pointerleave", () => { paused = false; });
    carousel.addEventListener("focusin", () => { paused = true; });
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) paused = false;
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .15 });
      observer.observe(carousel);
    }
  };

  const villaDots = [...document.querySelectorAll(".villa-carousel-dot")];
  let activeVilla = 0;
  let villaSwiper;

  const updateVilla = (index) => {
    activeVilla = index;
    updateDots(villaDots, index);
  };

  if (window.Swiper && document.querySelector(".villa-carousel")) {
    villaSwiper = new Swiper(".villa-carousel", {
      slidesPerView: 1.08,
      centeredSlides: true,
      spaceBetween: 18,
      effect: "creative",
      creativeEffect: {
        limitProgress: 2,
        prev: { translate: ["-12%", 0, -1], scale: .94, opacity: .82 },
        next: { translate: ["12%", 0, -1], scale: .94, opacity: .82 }
      },
      loop: false,
      rewind: true,
      speed: 850,
      grabCursor: true,
      watchSlidesProgress: true,
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, prevSlideMessage: "Previous villa", nextSlideMessage: "Next villa" },
      autoplay: reduceMotion ? false : { delay: 6400, disableOnInteraction: false, pauseOnMouseEnter: true },
      observer: true,
      observeParents: true,
      breakpoints: {
        760: { slidesPerView: 1.16, spaceBetween: 24 },
        1100: { slidesPerView: 1.28, spaceBetween: 30 }
      },
      on: {
        init(swiper) { updateVilla(swiper.realIndex); animateActiveSlide(swiper, ".villa-image img"); },
        slideChange(swiper) { updateVilla(swiper.realIndex); animateActiveSlide(swiper, ".villa-image img"); },
        autoplayTimeLeft(swiper, time, remaining) { swiper.el.style.setProperty("--autoplay-progress", String(1 - remaining)); }
      }
    });
    villaDots.forEach((dot, index) => dot.addEventListener("click", () => villaSwiper.slideTo(index)));
  } else {
    const villaSlides = [...document.querySelectorAll("#villa-track .villa-card")];
    villaDots.forEach((dot, index) => dot.addEventListener("click", () => {
      villaSlides[index]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      updateVilla(index);
    }));
    updateVilla(0);
    setupCarouselAutoplay(document.querySelector(".villa-carousel"), () => {
      const nextIndex = (activeVilla + 1) % villaSlides.length;
      villaSlides[nextIndex]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      updateVilla(nextIndex);
    }, 6400);
  }

  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.querySelectorAll(".villa-image, .gallery-image").forEach((image) => {
      image.addEventListener("pointermove", (event) => {
        const bounds = image.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        const prefix = image.classList.contains("gallery-image") ? "gallery" : "villa";
        image.style.setProperty(`--${prefix}-pan-x`, `${(-x * 8).toFixed(1)}px`);
        image.style.setProperty(`--${prefix}-pan-y`, `${(-y * 8).toFixed(1)}px`);
      }, { passive: true });
      image.addEventListener("pointerleave", () => {
        image.style.removeProperty("--villa-pan-x");
        image.style.removeProperty("--villa-pan-y");
        image.style.removeProperty("--gallery-pan-x");
        image.style.removeProperty("--gallery-pan-y");
      });
    });
  }

  const galleryDots = [...document.querySelectorAll(".gallery-carousel-dot")];
  const galleryControls = document.querySelector(".gallery-carousel-controls");
  let activeGallery = 0;
  let gallerySwiper;
  const updateGallery = (index) => {
    activeGallery = index;
    updateDots(galleryDots, index);
    galleryControls?.style.setProperty("--autoplay-progress", "0");
  };

  if (window.Swiper && document.querySelector(".gallery-viewport")) {
    gallerySwiper = new Swiper(".gallery-viewport", {
      slidesPerView: 1.06,
      centeredSlides: true,
      spaceBetween: 14,
      effect: "creative",
      creativeEffect: {
        limitProgress: 2,
        prev: { translate: ["-10%", 0, -1], scale: .96, opacity: .72 },
        next: { translate: ["10%", 0, -1], scale: .96, opacity: .72 }
      },
      loop: false,
      rewind: true,
      speed: 900,
      grabCursor: true,
      watchSlidesProgress: true,
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, prevSlideMessage: "Previous gallery image", nextSlideMessage: "Next gallery image" },
      autoplay: reduceMotion ? false : { delay: 5400, disableOnInteraction: false, pauseOnMouseEnter: true },
      observer: true,
      observeParents: true,
      breakpoints: {
        760: { slidesPerView: 1.12, spaceBetween: 18 },
        1100: { slidesPerView: 1.26, spaceBetween: 24 }
      },
      on: {
        init(swiper) { updateGallery(swiper.realIndex); animateActiveSlide(swiper, "img"); },
        slideChange(swiper) { updateGallery(swiper.realIndex); animateActiveSlide(swiper, "img"); },
        autoplayTimeLeft(swiper, time, remaining) {
          const progress = String(1 - remaining);
          swiper.el.style.setProperty("--autoplay-progress", progress);
          galleryControls?.style.setProperty("--autoplay-progress", progress);
        }
      }
    });
    galleryDots.forEach((dot, index) => dot.addEventListener("click", () => gallerySwiper.slideTo(index)));
  } else {
    const gallerySlides = [...document.querySelectorAll("#gallery-track .gallery-image")];
    galleryDots.forEach((dot, index) => dot.addEventListener("click", () => {
      gallerySlides[index]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      updateGallery(index);
    }));
    updateGallery(0);
    setupCarouselAutoplay(document.querySelector(".gallery-carousel"), () => {
      const nextIndex = (activeGallery + 1) % gallerySlides.length;
      gallerySlides[nextIndex]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      updateGallery(nextIndex);
    }, 5400);
  }

  const testimonialDots = [...document.querySelectorAll(".testimonial-dot")];
  const testimonialPrevious = document.querySelector(".testimonial-previous");
  const testimonialNext = document.querySelector(".testimonial-next");
  let activeTestimonial = 0;
  let testimonialSwiper;
  const updateTestimonial = (index) => {
    activeTestimonial = index;
    updateDots(testimonialDots, index);
  };

  if (window.Swiper && document.querySelector(".testimonial-swiper")) {
    testimonialSwiper = new Swiper(".testimonial-swiper", {
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 750,
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, prevSlideMessage: "Previous guest review", nextSlideMessage: "Next guest review" },
      autoplay: reduceMotion ? false : { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true },
      on: {
        init(swiper) { updateTestimonial(swiper.realIndex); },
        slideChange(swiper) {
          updateTestimonial(swiper.realIndex);
          if (canAnimate) gsap.fromTo(swiper.slides[swiper.activeIndex]?.children, { y: 14, autoAlpha: 0 }, {
            y: 0, autoAlpha: 1, duration: .55, stagger: .06, ease: "power3.out", overwrite: true
          });
        },
        autoplayTimeLeft(swiper, time, remaining) { swiper.el.style.setProperty("--autoplay-progress", String(1 - remaining)); }
      }
    });
    testimonialPrevious?.addEventListener("click", () => testimonialSwiper.slidePrev());
    testimonialNext?.addEventListener("click", () => testimonialSwiper.slideNext());
    testimonialDots.forEach((dot, index) => dot.addEventListener("click", () => testimonialSwiper.slideToLoop(index)));
  } else {
    const quotes = [...document.querySelectorAll(".testimonial-quote")];
    const showTestimonial = (index) => {
      if (!quotes.length) return;
      const next = (index + quotes.length) % quotes.length;
      quotes.forEach((quote, quoteIndex) => quote.classList.toggle("is-active", quoteIndex === next));
      updateTestimonial(next);
    };
    testimonialPrevious?.addEventListener("click", () => showTestimonial(activeTestimonial - 1));
    testimonialNext?.addEventListener("click", () => showTestimonial(activeTestimonial + 1));
    testimonialDots.forEach((dot, index) => dot.addEventListener("click", () => showTestimonial(index)));
    setupCarouselAutoplay(document.querySelector(".testimonials"), () => showTestimonial(activeTestimonial + 1), 6500);
  }

  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  document.querySelectorAll(".gallery-image").forEach((button) => {
    button.addEventListener("click", () => {
      if (!lightbox || !lightboxImage || typeof lightbox.showModal !== "function") return;
      lightboxImage.src = button.dataset.fullImage;
      lightboxImage.alt = button.querySelector("img")?.alt ?? "";
      lightbox.showModal();
    });
  });
  lightbox?.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
