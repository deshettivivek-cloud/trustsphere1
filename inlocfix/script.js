// ===== HEADER SCROLL EFFECT =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ===== MODAL LOGIC =====
const modalOverlay = document.getElementById('bookingModal');
const successOverlay = document.getElementById('successModal');

function openBookingModal() {
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function confirmBooking(e) {
  e.preventDefault();
  closeBookingModal();
  setTimeout(() => {
    successOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 300);
}

function closeSuccessModal() {
  successOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modals on overlay click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeBookingModal();
});
successOverlay.addEventListener('click', (e) => {
  if (e.target === successOverlay) closeSuccessModal();
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookingModal();
    closeSuccessModal();
  }
});

// ===== SEARCH BAR =====
document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  }
});
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
});

// ===== CATEGORY CLICK =====
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== SMOOTH SCROLL NAV =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
