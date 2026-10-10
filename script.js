/* ==========================================================================
   ADDICT TATTOO & PIERCING - Łukasz Walczyński | Skrypt Główny
   Lokalizacja: Lwowska 238 A, 33-300 Nowy Sącz | Tel: 504 989 112
   ========================================================================== */

const CONFIG = {
    STUDIO_NAME: "Addict Tattoo - Łukasz Walczyński",
    STUDIO_ADDRESS: "Lwowska 238 A, 33-300 Nowy Sącz",
    STUDIO_PHONE: "504 989 112",
    INSTAGRAM_URL: "https://www.instagram.com/addict.tattoo.ns/",
    DEMO_CONTACT_EMAIL: "kacperekwas1@gmail.com",
    DEMO_ADMIN_EMAIL: "admin@addict-tattoo.pl",
    DEMO_ADMIN_PASS: "admin123",
    LOCAL_STORAGE_KEY: "addict_tattoo_bookings",
    LOCAL_STORAGE_HISTORY_KEY: "addict_tattoo_bookings_history"
};

/* ==================== STAN APLIKACJI I WIZARDA ==================== */
const todayDate = new Date();
let currentRealYear = todayDate.getFullYear();
let currentRealMonth = todayDate.getMonth(); // 0-11
let currentRealDay = todayDate.getDate();

let calendarYear = currentRealYear;
let calendarMonth = currentRealMonth;

let bookingState = {
    step: 1,
    serviceKey: 'realizm',
    serviceName: 'Realizm Czarno-Szary / Portret',
    placement: '',
    size: '',
    description: '',
    photo: null, // { name, dataUrl, size }
    date: null,
    time: null,
    client: {
        name: '',
        phone: '',
        email: '',
        instagram: '',
        notes: ''
    }
};

const servicesData = {
    'realizm': {
        name: 'Realizm Czarno-Szary / Portret',
        desc: 'Portrety kobiece, głębokie cienie i fotorealizm.'
    },
    'darkhorror': {
        name: 'Mroczny Realizm & Horror',
        desc: 'Czaszki, żniwiarze, plecy i mroczne klimaty.'
    },
    'dotwork': {
        name: 'Dark Art & Dotwork',
        desc: 'Cieniowanie kropkowe, mistycyzm i kontur.'
    },
    'piercing': {
        name: 'Piercing & Kolczykowanie',
        desc: 'Bezpieczne, sterylne przekłucia ciała i doradztwo.'
    },
    'konsultacja': {
        name: 'Konsultacja & Projekt Autorski',
        desc: 'Omówienie pomysłu, wycena i przygotowanie wzoru.'
    }
};

/* ==================== HARMONOGRAM STUDIA ====================
   Pn - Pt: 10:00 - 16:00
   Sobota: ZAMKNIĘTE
   Niedziela: ZAMKNIĘTE
============================================================== */
const regularWeekdaySlots = ["10:00", "11:30", "13:00", "14:30"];

function getSlotsForDate(year, month, day) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay(); // 0 = Niedziela, 6 = Sobota

    // Soboty i Niedziele są ZAMKNIĘTE
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { isClosed: true, slots: [] };
    }

    return { isClosed: false, slots: regularWeekdaySlots };
}

/* ==================== PRZYKŁADOWE DANE POCZĄTKOWE ==================== */
function ensureInitialDemoData() {
    const existing = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    if (!existing || JSON.parse(existing).length === 0) {
        // Oblicz przykładowe daty na bieżący miesiąc
        const d1 = new Date();
        d1.setDate(d1.getDate() + 2);
        // Jeśli d1 wypadnie w weekend, przesuń na poniedziałek
        if (d1.getDay() === 0) d1.setDate(d1.getDate() + 1);
        if (d1.getDay() === 6) d1.setDate(d1.getDate() + 2);

        const d2 = new Date();
        d2.setDate(d2.getDate() + 5);
        if (d2.getDay() === 0) d2.setDate(d2.getDate() + 1);
        if (d2.getDay() === 6) d2.setDate(d2.getDate() + 2);

        const pad = (n) => String(n).padStart(2, '0');
        const dateStr1 = `${d1.getFullYear()}-${pad(d1.getMonth() + 1)}-${pad(d1.getDate())}`;
        const dateStr2 = `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}`;

        const initialBookings = [
            {
                id: "AT-984120",
                createdAt: new Date().toISOString(),
                status: "confirmed", // confirmed | pending | completed | cancelled
                serviceKey: "realizm",
                serviceName: "Realizm Czarno-Szary / Portret",
                placement: "Lewe przedramię",
                size: "ok. 18x12 cm",
                description: "Portret wojowniczki z koroną w głębokim cieniowaniu.",
                photo: null,
                date: dateStr1,
                time: "11:30",
                client: {
                    name: "Michał Krawczyk",
                    phone: "501 234 567",
                    email: "michal.krawczyk@gmail.com",
                    instagram: "@m.krawczyk",
                    notes: "Pierwsza sesja z dwóch, zależy mi na gładkich przejściach cienia."
                }
            },
            {
                id: "AT-984121",
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
                status: "pending",
                serviceKey: "piercing",
                serviceName: "Piercing & Kolczykowanie",
                placement: "Ucho (Helix / Conch)",
                size: "Pojedynczy kolczyk",
                description: "Przekłucie chrząstki ucha, kolczyk z tytanu medycznego.",
                photo: null,
                date: dateStr2,
                time: "14:30",
                client: {
                    name: "Karolina Nowak",
                    phone: "698 112 334",
                    email: "karolina.nowak@onet.pl",
                    instagram: "@karola_n",
                    notes: "Proszę o informację o doborze kolczyka startowego."
                }
            }
        ];

        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(initialBookings));
    }
}

function getAllBookings() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function saveAllBookings(list) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(list));
}

function getAllHistory() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function saveAllHistory(list) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(list));
}

/* ==================== TŁO: PŁYWAJĄCE CZERWONE ORBY (AMBIENT CANVAS) ==================== */
function initAmbientSmoke() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const orbsCount = 18;
    const orbs = [];

    for (let i = 0; i < orbsCount; i++) {
        orbs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 120 + 80,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            baseAlpha: Math.random() * 0.16 + 0.08,
            pulseSpeed: Math.random() * 0.015 + 0.005,
            pulseAngle: Math.random() * Math.PI * 2
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < orbs.length; i++) {
            const orb = orbs[i];
            orb.x += orb.vx;
            orb.y += orb.vy;
            orb.pulseAngle += orb.pulseSpeed;

            if (orb.x < -orb.radius) orb.x = width + orb.radius;
            if (orb.x > width + orb.radius) orb.x = -orb.radius;
            if (orb.y < -orb.radius) orb.y = height + orb.radius;
            if (orb.y > height + orb.radius) orb.y = -orb.radius;

            const currentAlpha = orb.baseAlpha + Math.sin(orb.pulseAngle) * 0.05;

            const grad = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );

            // Karmazynowo-czerwona poświata z ciemniejszymi obrzeżami
            grad.addColorStop(0, `rgba(220, 38, 38, ${Math.max(0, currentAlpha)})`);
            grad.addColorStop(0.5, `rgba(185, 28, 28, ${Math.max(0, currentAlpha * 0.5)})`);
            grad.addColorStop(1, 'rgba(7, 7, 9, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    render();
}

/* ==================== WIZARD KROK 1: WYBÓR STYLU ==================== */
function selectStyleCard(key, name) {
    bookingState.serviceKey = key;
    bookingState.serviceName = name || (servicesData[key] ? servicesData[key].name : key);

    const cards = document.querySelectorAll('.service-select-card');
    cards.forEach(card => {
        card.classList.remove('active');
        const icon = card.querySelector('.check-icon');
        if (icon) {
            icon.className = 'fa-regular fa-circle text-zinc-600 text-sm check-icon';
        }
    });

    const activeCard = Array.from(cards).find(c => c.getAttribute('onclick')?.includes(`'${key}'`));
    if (activeCard) {
        activeCard.classList.add('active');
        const icon = activeCard.querySelector('.check-icon');
        if (icon) {
            icon.className = 'fa-solid fa-circle-check text-red-500 text-sm check-icon';
        }
    }
}

/* ==================== BEZPIECZNA KOMPRESJA ZDJĘĆ W CANVAS ==================== */
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showCustomAlert("Proszę wybrać poprawny plik graficzny w formacie JPG, PNG lub WebP.", "Niepoprawny Plik");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            // Skalowanie do maksymalnie 900px
            const maxDimension = 900;
            let w = img.width;
            let h = img.height;

            if (w > maxDimension || h > maxDimension) {
                if (w > h) {
                    h = Math.round((h * maxDimension) / w);
                    w = maxDimension;
                } else {
                    w = Math.round((w * maxDimension) / h);
                    h = maxDimension;
                }
            }

            const offCanvas = document.createElement('canvas');
            offCanvas.width = w;
            offCanvas.height = h;
            const ctx = offCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            // Kompresja do JPEG 0.82 (~40-60 KB)
            const compressedDataUrl = offCanvas.toDataURL('image/jpeg', 0.82);

            bookingState.photo = {
                name: file.name,
                dataUrl: compressedDataUrl,
                size: Math.round(compressedDataUrl.length * 0.75 / 1024) + " KB"
            };

            // Aktualizacja UI
            document.getElementById('upload-idle-state').classList.add('hidden');
            const previewState = document.getElementById('upload-preview-state');
            previewState.classList.remove('hidden');
            document.getElementById('upload-thumb').src = compressedDataUrl;
            document.getElementById('upload-filename').textContent = file.name;
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function removeUploadedPhoto(e) {
    if (e) e.stopPropagation();
    bookingState.photo = null;
    const input = document.getElementById('form-photo-input');
    if (input) input.value = '';
    document.getElementById('upload-idle-state').classList.remove('hidden');
    document.getElementById('upload-preview-state').classList.add('hidden');
}

/* ==================== KALENDARZ I SLOTA GODZINOWE ==================== */
const monthNamesPl = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

function prevCalendarMonth() {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar();
}

function nextCalendarMonth() {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendar();
}

function renderCalendar() {
    const titleEl = document.getElementById('calendar-month-year');
    if (titleEl) {
        titleEl.textContent = `${monthNamesPl[calendarMonth]} ${calendarYear}`;
    }

    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0=Nd, 1=Pn
    const startingBlankDays = (firstDayIndex + 6) % 7; // Pn = 0
    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // Pobierz rezerwacje ze stanu
    const allBookings = getAllBookings();

    // Puste komórki przed pierwszym dniem
    for (let i = 0; i < startingBlankDays; i++) {
        const blank = document.createElement('div');
        blank.className = 'aspect-square';
        grid.appendChild(blank);
    }

    // Generowanie dni
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-day-btn relative aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all duration-200';

        const pad = (n) => String(n).padStart(2, '0');
        const dateIsoStr = `${calendarYear}-${pad(calendarMonth + 1)}-${pad(day)}`;

        // Sprawdź czy dzień jest w przeszłości
        const checkDate = new Date(calendarYear, calendarMonth, day, 23, 59, 59);
        const isPast = checkDate < new Date();

        const scheduleInfo = getSlotsForDate(calendarYear, calendarMonth, day);

        if (isPast || scheduleInfo.isClosed) {
            btn.disabled = true;
            btn.classList.add('opacity-25', 'cursor-not-allowed', 'bg-zinc-900/40', 'text-zinc-600');
            btn.innerHTML = `<span>${day}</span>`;
            if (scheduleInfo.isClosed) {
                btn.title = "Studio zamknięte w weekend";
            }
        } else {
            // Oblicz obłożenie dnia
            const dayBookings = allBookings.filter(b => b.date === dateIsoStr && b.status !== 'cancelled');
            const totalSlots = scheduleInfo.slots.length;
            const bookedCount = dayBookings.length;

            let statusClass = 'cal-day-free';
            let dotClass = 'cal-dot-free';

            if (bookedCount >= totalSlots) {
                statusClass = 'cal-day-full';
                dotClass = 'cal-dot-full';
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            } else if (bookedCount > 0) {
                statusClass = 'cal-day-partial';
                dotClass = 'cal-dot-partial';
            }

            btn.classList.add(statusClass);
            btn.innerHTML = `<span>${day}</span><span class="cal-dot ${dotClass}"></span>`;

            // Sprawdź zaznaczenie
            if (bookingState.date === dateIsoStr) {
                btn.classList.add('selected');
            }

            // Oznaczenie dzisiaj
            const isToday = (calendarYear === currentRealYear && calendarMonth === currentRealMonth && day === currentRealDay);
            if (isToday) {
                btn.classList.add('today');
            }

            btn.onclick = () => selectCalendarDay(calendarYear, calendarMonth, day, dateIsoStr);
        }

        grid.appendChild(btn);
    }
}

function selectCalendarDay(year, month, day, dateIsoStr) {
    bookingState.date = dateIsoStr;
    bookingState.time = null; // reset godziny przy zmianie dnia

    // Odśwież widok kalendarza, aby podświetlić wybrany dzień
    renderCalendar();

    // Pokaż datę w panelu godzin
    const dateDisplay = document.getElementById('selected-date-display');
    const d = new Date(year, month, day);
    const dayName = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"][d.getDay()];
    dateDisplay.textContent = `${dayName}, ${day} ${monthNamesPl[month]} ${year}`;

    // Renderuj godziny
    renderTimeSlots(dateIsoStr, year, month, day);

    // Zablokuj przycisk dalej dopóki nie ma wybranej godziny
    updateStep2NextButton();
}

function renderTimeSlots(dateIsoStr, year, month, day) {
    const container = document.getElementById('time-slots-container');
    if (!container) return;
    container.innerHTML = '';

    const schedule = getSlotsForDate(year, month, day);
    if (schedule.isClosed) {
        container.innerHTML = '<p class="col-span-2 text-xs text-rose-400 py-4 text-center">Studio jest w ten dzień nieczynne.</p>';
        return;
    }

    const allBookings = getAllBookings();
    const bookedTimesOnDay = allBookings
        .filter(b => b.date === dateIsoStr && b.status !== 'cancelled')
        .map(b => b.time);

    schedule.slots.forEach(timeSlot => {
        const isBooked = bookedTimesOnDay.includes(timeSlot);
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'time-slot-btn py-3 px-3 text-xs font-mono font-semibold flex items-center justify-between';

        if (isBooked) {
            slotBtn.disabled = true;
            slotBtn.classList.add('opacity-40', 'cursor-not-allowed', 'line-through', 'border-zinc-800');
            slotBtn.innerHTML = `<span>${timeSlot}</span><span class="text-[10px] text-zinc-600 font-sans">Zajęty</span>`;
        } else {
            if (bookingState.time === timeSlot) {
                slotBtn.classList.add('selected');
            }
            slotBtn.innerHTML = `<span>${timeSlot}</span><span class="text-[10px] text-emerald-400 font-sans">Wolny</span>`;
            slotBtn.onclick = () => selectTimeSlot(timeSlot, slotBtn);
        }

        container.appendChild(slotBtn);
    });
}

function selectTimeSlot(timeSlot, btnElement) {
    bookingState.time = timeSlot;

    const allSlotBtns = document.querySelectorAll('.time-slot-btn');
    allSlotBtns.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');

    updateStep2NextButton();
}

function updateStep2NextButton() {
    const btn = document.getElementById('step-2-next-btn');
    if (!btn) return;

    if (bookingState.date && bookingState.time) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

/* ==================== NAWIGACJA WIZARDA ==================== */
function goToStep(targetStep) {
    if (targetStep === 2) {
        // Zapisz wartości z kroku 1
        bookingState.placement = document.getElementById('form-placement').value.trim();
        bookingState.size = document.getElementById('form-size').value.trim();
        bookingState.description = document.getElementById('form-desc').value.trim();
    }

    if (targetStep === 3) {
        if (!bookingState.date || !bookingState.time) {
            showCustomAlert("Proszę wybrać dzień oraz dogodną godzinę w kalendarzu przed przejściem do danych kontaktowych.", "Wybierz Termin");
            return;
        }
    }

    if (targetStep === 4) {
        populateSummaryStep();
    }

    bookingState.step = targetStep;

    // Przełączanie widoków kontenerów
    for (let i = 1; i <= 4; i++) {
        const stepContainer = document.getElementById(`wizard-step-${i}`);
        const indicator = document.getElementById(`step-indicator-${i}`);
        if (stepContainer) {
            if (i === targetStep) {
                stepContainer.classList.remove('hidden');
            } else {
                stepContainer.classList.add('hidden');
            }
        }
        if (indicator) {
            const badge = indicator.querySelector('.step-badge');
            const label = indicator.querySelector('.step-label');
            if (i < targetStep) {
                // Krok ukończony
                indicator.classList.remove('opacity-40');
                badge.className = 'step-badge w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-emerald-400';
                badge.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
                label.className = 'step-label text-[11px] font-semibold text-emerald-400 mt-2 truncate w-full';
            } else if (i === targetStep) {
                // Krok aktywny
                indicator.classList.remove('opacity-40');
                badge.className = 'step-badge w-9 h-9 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center border-2 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)]';
                badge.textContent = i;
                label.className = 'step-label text-[11px] font-semibold text-red-400 mt-2 truncate w-full';
            } else {
                // Krok przyszły
                indicator.classList.add('opacity-40');
                badge.className = 'step-badge w-9 h-9 rounded-full bg-zinc-900 text-zinc-400 font-bold text-xs flex items-center justify-center border border-zinc-700';
                badge.textContent = i;
                label.className = 'step-label text-[11px] font-semibold text-zinc-400 mt-2 truncate w-full';
            }
        }
    }

    // Płynne przewinięcie do wizarda
    const wizSection = document.getElementById('rezerwacja');
    if (wizSection) {
        wizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function validateStep3AndProceed() {
    const name = document.getElementById('form-client-name').value.trim();
    const phone = document.getElementById('form-client-phone').value.trim();
    const email = document.getElementById('form-client-email').value.trim();
    const instagram = document.getElementById('form-client-instagram').value.trim();
    const notes = document.getElementById('form-client-notes').value.trim();

    if (!name || name.length < 3) {
        showCustomAlert("Proszę podać swoje imię i nazwisko.", "Wymagane Imię");
        document.getElementById('form-client-name').focus();
        return;
    }

    const cleanPhone = phone.replace(/[\s\-+]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
        showCustomAlert("Proszę podać poprawny numer telefonu składający się z minimum 9 cyfr.", "Numer Telefonu");
        document.getElementById('form-client-phone').focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showCustomAlert("Proszę podać poprawny adres e-mail (np. twojmail@gmail.com).", "Adres E-mail");
        document.getElementById('form-client-email').focus();
        return;
    }

    bookingState.client = {
        name: name,
        phone: phone,
        email: email,
        instagram: instagram,
        notes: notes
    };

    goToStep(4);
}

function populateSummaryStep() {
    document.getElementById('summary-service').textContent = bookingState.serviceName;
    document.getElementById('summary-date').textContent = bookingState.date || '--';
    document.getElementById('summary-time').textContent = bookingState.time || '--';
    document.getElementById('summary-placement').textContent = bookingState.placement || 'Do ustalenia';
    document.getElementById('summary-size').textContent = bookingState.size || 'Do ustalenia';

    document.getElementById('summary-name').textContent = bookingState.client.name;
    document.getElementById('summary-phone').textContent = bookingState.client.phone;
    document.getElementById('summary-email').textContent = bookingState.client.email;

    const photoCont = document.getElementById('summary-photo-container');
    if (bookingState.photo && bookingState.photo.dataUrl) {
        photoCont.classList.remove('hidden');
        document.getElementById('summary-photo-thumb').src = bookingState.photo.dataUrl;
    } else {
        photoCont.classList.add('hidden');
    }

    document.getElementById('summary-description').textContent = bookingState.description || 'Brak dodatkowego opisu.';
    document.getElementById('summary-notes').textContent = bookingState.client.notes || 'Brak szczególnych uwag.';
}

function submitBooking() {
    const consent = document.getElementById('rodo-consent');
    if (!consent || !consent.checked) {
        showCustomAlert("Proszę zaznaczyć zgodę na przetwarzanie danych osobowych, aby przesłać rezerwację.", "Zgoda RODO");
        return;
    }

    const bookingId = "AT-" + Math.floor(100000 + Math.random() * 900000);

    const newBooking = {
        id: bookingId,
        createdAt: new Date().toISOString(),
        status: "pending",
        serviceKey: bookingState.serviceKey,
        serviceName: bookingState.serviceName,
        placement: bookingState.placement || "Do ustalenia",
        size: bookingState.size || "Do ustalenia",
        description: bookingState.description || "",
        photo: bookingState.photo,
        date: bookingState.date,
        time: bookingState.time,
        client: {
            name: bookingState.client.name,
            phone: bookingState.client.phone,
            email: bookingState.client.email,
            instagram: bookingState.client.instagram,
            notes: bookingState.client.notes
        }
    };

    const bookings = getAllBookings();
    bookings.unshift(newBooking);
    saveAllBookings(bookings);

    showSuccessModal(bookingId);
}

function showSuccessModal(bookingId) {
    document.getElementById('success-booking-code').textContent = `#${bookingId}`;
    document.getElementById('booking-success-modal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('booking-success-modal').classList.add('hidden');
    resetBookingWizard();
}

function goToAdminFromSuccess() {
    closeSuccessModal();
    navigateToAdmin();
}

function resetBookingWizard() {
    bookingState = {
        step: 1,
        serviceKey: 'realizm',
        serviceName: 'Realizm Czarno-Szary / Portret',
        placement: '',
        size: '',
        description: '',
        photo: null,
        date: null,
        time: null,
        client: { name: '', phone: '', email: '', instagram: '', notes: '' }
    };

    document.getElementById('form-placement').value = '';
    document.getElementById('form-size').value = '';
    document.getElementById('form-desc').value = '';
    removeUploadedPhoto();

    document.getElementById('form-client-name').value = '';
    document.getElementById('form-client-phone').value = '';
    document.getElementById('form-client-email').value = '';
    document.getElementById('form-client-instagram').value = '';
    document.getElementById('form-client-notes').value = '';

    const rodo = document.getElementById('rodo-consent');
    if (rodo) rodo.checked = false;

    selectStyleCard('realizm');
    goToStep(1);
    renderCalendar();
}

/* ==================== PANEL ADMINISTRATORA (#admin) ==================== */
function checkAdminRoute() {
    if (window.location.hash === '#admin') {
        document.getElementById('client-view-container').classList.add('hidden');
        document.getElementById('admin-view-container').classList.remove('hidden');

        const isLogged = sessionStorage.getItem('addict_admin_logged') === 'true';
        if (isLogged) {
            showAdminDashboard();
        } else {
            showAdminLoginScreen();
        }
    } else {
        document.getElementById('client-view-container').classList.remove('hidden');
        document.getElementById('admin-view-container').classList.add('hidden');
    }
}

function navigateToAdmin() {
    window.location.hash = '#admin';
}

function navigateToClient() {
    window.location.hash = '';
}

function showAdminLoginScreen() {
    document.getElementById('admin-login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-logout-btn').classList.add('hidden');
}

function showAdminDashboard() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('admin-logout-btn').classList.remove('hidden');
    renderAdminDashboard();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email-input').value.trim();
    const pass = document.getElementById('admin-pass-input').value.trim();
    const err = document.getElementById('admin-login-error');

    if (email === CONFIG.DEMO_ADMIN_EMAIL && pass === CONFIG.DEMO_ADMIN_PASS) {
        err.classList.add('hidden');
        sessionStorage.setItem('addict_admin_logged', 'true');
        showAdminDashboard();
    } else {
        err.classList.remove('hidden');
    }
}

function adminLogout() {
    sessionStorage.removeItem('addict_admin_logged');
    showAdminLoginScreen();
}

function renderAdminDashboard() {
    const bookings = getAllBookings();
    const history = getAllHistory();

    // Statystyki
    const totalCount = bookings.length + history.length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const completedCount = history.filter(b => b.status === 'completed').length;

    document.getElementById('stat-total').textContent = totalCount;
    document.getElementById('stat-pending').textContent = pendingCount;
    document.getElementById('stat-confirmed').textContent = confirmedCount;
    document.getElementById('stat-completed').textContent = completedCount;

    // Tabela 1: Aktywne
    const activeBody = document.getElementById('admin-active-table-body');
    activeBody.innerHTML = '';

    if (bookings.length === 0) {
        activeBody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-zinc-500">Brak aktywnych rezerwacji.</td></tr>`;
    } else {
        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-zinc-900/50 transition';

            let statusBadge = '<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">Oczekuje</span>';
            if (b.status === 'confirmed') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">Potwierdzona</span>';
            }

            // Miniatura inspiracji
            let photoThumbHtml = '<span class="text-zinc-600 text-[10px]">Brak</span>';
            if (b.photo && b.photo.dataUrl) {
                photoThumbHtml = `
                    <button type="button" onclick="openAdminPhotoModal('${b.id}')" class="relative group block">
                        <img src="${b.photo.dataUrl}" alt="Wzór" class="w-9 h-9 rounded-lg object-cover border border-red-500/40 group-hover:scale-105 transition">
                        <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-[7px] text-white">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                    </button>
                `;
            }

            // Uwagi klienta
            const notesText = b.client.notes ? `<span class="text-zinc-300 font-sans italic" title="${escapeHtml(b.client.notes)}">${escapeHtml(b.client.notes.slice(0, 30))}${b.client.notes.length > 30 ? '...' : ''}</span>` : '<span class="text-zinc-600">-</span>';

            tr.innerHTML = `
                <td class="p-3 font-mono font-bold text-red-400">${b.id}</td>
                <td class="p-3">
                    <div class="font-bold text-white">${b.date}</div>
                    <div class="text-[11px] text-zinc-400 font-mono">${b.time}</div>
                </td>
                <td class="p-3">
                    <div class="font-bold text-white">${escapeHtml(b.client.name)}</div>
                    <div class="text-[10px] text-zinc-500 font-mono">${escapeHtml(b.client.instagram || '')}</div>
                </td>
                <td class="p-3">
                    <div><a href="tel:${b.client.phone}" class="text-zinc-300 hover:text-red-400 underline font-mono">${escapeHtml(b.client.phone)}</a></div>
                    <div class="text-[10px] text-zinc-500">${escapeHtml(b.client.email)}</div>
                </td>
                <td class="p-3">
                    <div class="font-semibold text-white">${escapeHtml(b.serviceName)}</div>
                    <div class="text-[10px] text-zinc-400">${escapeHtml(b.placement || '')} • ${escapeHtml(b.size || '')}</div>
                </td>
                <td class="p-3">${photoThumbHtml}</td>
                <td class="p-3">${notesText}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-right space-x-1">
                    ${b.status !== 'confirmed' ? `
                        <button onclick="changeBookingStatus('${b.id}', 'confirmed')" class="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs transition" title="Potwierdź rezerwację">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    ` : ''}
                    <button onclick="changeBookingStatus('${b.id}', 'completed')" class="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs transition" title="Oznacz jako zrealizowaną">
                        <i class="fa-solid fa-flag-checkered"></i>
                    </button>
                    <button onclick="changeBookingStatus('${b.id}', 'cancelled')" class="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs transition" title="Anuluj wizytę">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                </td>
            `;
            activeBody.appendChild(tr);
        });
    }

    // Tabela 2: Historia
    const historyBody = document.getElementById('admin-history-table-body');
    historyBody.innerHTML = '';

    if (history.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-zinc-600">Brak archiwalnych rezerwacji.</td></tr>`;
    } else {
        history.forEach(h => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-zinc-900/30 transition';

            let statusBadge = '<span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">Zrealizowana</span>';
            if (h.status === 'cancelled') {
                statusBadge = '<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">Anulowana</span>';
            }

            let photoThumbHtml = '<span class="text-zinc-600 text-[10px]">-</span>';
            if (h.photo && h.photo.dataUrl) {
                photoThumbHtml = `
                    <button type="button" onclick="openAdminPhotoModal('${h.id}', true)" class="group block">
                        <img src="${h.photo.dataUrl}" alt="Wzór" class="w-8 h-8 rounded object-cover border border-zinc-700 group-hover:scale-105 transition">
                    </button>
                `;
            }

            const notesText = h.client.notes ? `<span class="text-zinc-400 font-sans italic" title="${escapeHtml(h.client.notes)}">${escapeHtml(h.client.notes.slice(0, 25))}${h.client.notes.length > 25 ? '...' : ''}</span>` : '<span class="text-zinc-600">-</span>';

            tr.innerHTML = `
                <td class="p-3 font-mono text-zinc-400">${h.id}</td>
                <td class="p-3">
                    <div class="text-zinc-300">${h.date}</div>
                    <div class="text-[10px] text-zinc-500 font-mono">${h.time}</div>
                </td>
                <td class="p-3 text-zinc-300">${escapeHtml(h.client.name)}</td>
                <td class="p-3 text-zinc-400">${escapeHtml(h.serviceName)}</td>
                <td class="p-3">${photoThumbHtml}</td>
                <td class="p-3">${notesText}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-right">
                    <button onclick="deleteHistoryBooking('${h.id}')" class="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 transition" title="Usuń z bazy">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            `;
            historyBody.appendChild(tr);
        });
    }
}

function changeBookingStatus(id, newStatus) {
    let bookings = getAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return;

    if (newStatus === 'confirmed') {
        bookings[index].status = 'confirmed';
        saveAllBookings(bookings);
        renderAdminDashboard();
        renderCalendar();
    } else if (newStatus === 'completed' || newStatus === 'cancelled') {
        const item = bookings.splice(index, 1)[0];
        item.status = newStatus;
        item.archivedAt = new Date().toISOString();

        const history = getAllHistory();
        history.unshift(item);

        saveAllBookings(bookings);
        saveAllHistory(history);
        renderAdminDashboard();
        renderCalendar();
    }
}

function deleteHistoryBooking(id) {
    showCustomConfirm("Czy na pewno chcesz bezpowrotnie usunąć tę rezerwację z bazy historii studia?", "Usuń Rezerwację", () => {
        let history = getAllHistory();
        history = history.filter(h => h.id !== id);
        saveAllHistory(history);
        renderAdminDashboard();
    });
}

function escapeHtml(string) {
    if (!string) return '';
    return String(string)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==================== PODGLĄD ZDJĘCIA DLA ADMINA ==================== */
function openAdminPhotoModal(bookingId, isHistory = false) {
    const list = isHistory ? getAllHistory() : getAllBookings();
    const item = list.find(b => b.id === bookingId);
    if (!item || !item.photo || !item.photo.dataUrl) return;

    const modal = document.getElementById('admin-photo-modal');
    const img = document.getElementById('admin-photo-modal-img');
    const cap = document.getElementById('admin-photo-modal-caption');

    img.src = item.photo.dataUrl;
    cap.innerHTML = `
        <div class="font-bold text-white">${escapeHtml(item.client.name)} • ${escapeHtml(item.serviceName)}</div>
        <div class="text-zinc-400 mt-0.5">Miejsce: ${escapeHtml(item.placement || 'b/d')} | Wymiar: ${escapeHtml(item.size || 'b/d')}</div>
        <div class="text-zinc-300 mt-1 italic">${item.description ? `"${escapeHtml(item.description)}"` : 'Brak opisu pomysłu.'}</div>
    `;

    modal.classList.remove('hidden');
}

function closeAdminPhotoModal() {
    document.getElementById('admin-photo-modal').classList.add('hidden');
}

/* ==================== LIGHTBOX DLA PORTFOLIO ==================== */
const portfolioItems = [
    {
        src: 'portfolio-1.png',
        title: 'Portret Wojowniczki w Koronie',
        desc: 'Realizm czarno-szary, precyzyjne cieniowanie i mikrodetale na przedramieniu.'
    },
    {
        src: 'portfolio-2.png',
        title: 'Mroczny Realizm - Zagojone Całe Plecy',
        desc: 'Kompleksowa kompozycja: czaszka, kobiecy portret, cmentarz i surrealistyczne motywy.'
    },
    {
        src: 'portfolio-3.png',
        title: 'Ponury Żniwiarz & As Pik',
        desc: 'Dark realism, kości do gry i dynamiczna kompozycja na nodze.'
    },
    {
        src: 'portfolio-4.png',
        title: 'Trzy Czaszki - Dotwork & Dark Art',
        desc: 'Motyw symboliczny na ramieniu wykonany precyzyjną techniką cieniowania kropkowego.'
    }
];

let currentLightboxIndex = 0;

function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();
    document.getElementById('lightbox-modal').classList.remove('hidden');
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.add('hidden');
}

function updateLightboxContent() {
    const item = portfolioItems[currentLightboxIndex];
    if (!item) return;

    document.getElementById('lightbox-img').src = item.src;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-desc').textContent = item.desc;
    document.getElementById('lightbox-counter').textContent = `${currentLightboxIndex + 1} / ${portfolioItems.length}`;
}

function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
    updateLightboxContent();
}

function prevLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
    updateLightboxContent();
}

function handleLightboxBackdrop(e) {
    if (e.target.id === 'lightbox-modal') {
        closeLightbox();
    }
}

/* ==================== MODAL KONTAKTOWY DEMO & POLITYKA ==================== */
function openDemoContactModal() {
    document.getElementById('demo-contact-modal').classList.remove('hidden');
}

function closeDemoContactModal() {
    document.getElementById('demo-contact-modal').classList.add('hidden');
}

function openPrivacyModal() {
    document.getElementById('privacy-modal').classList.remove('hidden');
}

function closePrivacyModal() {
    document.getElementById('privacy-modal').classList.add('hidden');
}

/* ==================== DEDYKOWANE OKIENKA POWIADOMIEŃ & POTWIERDZEŃ ==================== */
let customConfirmCallback = null;

function showCustomAlert(message, title = "Powiadomienie", iconClass = "fa-solid fa-circle-exclamation") {
    const modal = document.getElementById('custom-alert-modal');
    if (!modal) {
        window.alert(message);
        return;
    }
    const titleEl = document.getElementById('custom-alert-title');
    const msgEl = document.getElementById('custom-alert-message');
    const iconEl = document.getElementById('custom-alert-icon');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.className = iconClass;

    modal.classList.remove('hidden');
}

function closeCustomAlert() {
    const modal = document.getElementById('custom-alert-modal');
    if (modal) modal.classList.add('hidden');
}

function showCustomConfirm(message, title = "Wymagane Potwierdzenie", onConfirm) {
    customConfirmCallback = onConfirm;
    const modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
        if (window.confirm(message)) onConfirm();
        return;
    }
    const titleEl = document.getElementById('custom-confirm-title');
    const msgEl = document.getElementById('custom-confirm-message');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    modal.classList.remove('hidden');
}

function closeCustomConfirm(isConfirmed) {
    const modal = document.getElementById('custom-confirm-modal');
    if (modal) modal.classList.add('hidden');
    if (isConfirmed && typeof customConfirmCallback === 'function') {
        customConfirmCallback();
    }
    customConfirmCallback = null;
}

// Zabezpieczenie: nadpisanie window.alert, aby żaden basic alert nie wyciekł
window.alert = function(msg) {
    showCustomAlert(msg, "Powiadomienie");
};

/* ==================== AKORDEON FAQ ==================== */
function initFaqAccordion() {
    const allDetails = document.querySelectorAll('details.faq-item');
    allDetails.forEach((targetDetail) => {
        targetDetail.addEventListener('click', (e) => {
            if (e.target.closest('summary')) {
                allDetails.forEach((otherDetail) => {
                    if (otherDetail !== targetDetail && otherDetail.open) {
                        otherDetail.open = false;
                    }
                });
            }
        });
    });
}

/* ==================== MENU MOBILNE ==================== */
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const icon = document.getElementById('mobile-menu-icon');
    if (!drawer) return;

    drawer.classList.toggle('hidden');
    if (icon) {
        if (drawer.classList.contains('hidden')) {
            icon.className = 'fa-solid fa-bars text-lg';
        } else {
            icon.className = 'fa-solid fa-xmark text-lg';
        }
    }
}

/* ==================== SCROLL REVEAL OBSERVER ==================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('is-revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ==================== ZARZĄDZANIE COOKIES ==================== */
function checkCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const consent = localStorage.getItem('addict_tattoo_cookies_accepted');
    if (!consent) {
        setTimeout(() => {
            banner.classList.remove('hidden');
            requestAnimationFrame(() => {
                banner.classList.remove('translate-y-full', 'opacity-0');
            });
        }, 1200);
    }
}

function acceptCookies() {
    localStorage.setItem('addict_tattoo_cookies_accepted', 'true');
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 500);
    }
}

/* ==================== INICJALIZACJA STARTOWA ==================== */
document.addEventListener('DOMContentLoaded', () => {
    ensureInitialDemoData();
    initAmbientSmoke();
    initFaqAccordion();
    initScrollReveal();
    checkCookieConsent();
    selectStyleCard('realizm');
    renderCalendar();
    checkAdminRoute();

    window.addEventListener('hashchange', checkAdminRoute);

    // Obsługa klawiszy Esc i strzałek
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCustomAlert();
            closeCustomConfirm(false);
            closeLightbox();
            closePrivacyModal();
            closeDemoContactModal();
            closeSuccessModal();
            closeAdminPhotoModal();
        }
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    });
});
