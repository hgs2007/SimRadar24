const state = {
  overview: null,
  itineraries: [],
  selectedItineraryId: null,
  legFlightsByIndex: {},
  selectedFlightsByLeg: {},
  selectedSeatsByLeg: {},
  activeLegIndex: 0,
  activePassengerIndex: 0,
  passengerDrafts: [{ firstName: "", lastName: "" }],
  booking: null,
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  originInput: document.querySelector("#originInput"),
  destinationInput: document.querySelector("#destinationInput"),
  passengersInput: document.querySelector("#passengersInput"),
  bagsInput: document.querySelector("#bagsInput"),
  airportOptions: document.querySelector("#airportOptions"),
  liveGroundCount: document.querySelector("#liveGroundCount"),
  prefileCount: document.querySelector("#prefileCount"),
  airportCount: document.querySelector("#airportCount"),
  networkStatus: document.querySelector("#networkStatus"),
  statsimStatus: document.querySelector("#statsimStatus"),
  itineraryTitle: document.querySelector("#itineraryTitle"),
  itineraryMeta: document.querySelector("#itineraryMeta"),
  itineraryList: document.querySelector("#itineraryList"),
  legFlightsTitle: document.querySelector("#legFlightsTitle"),
  legFlightsMeta: document.querySelector("#legFlightsMeta"),
  legTabs: document.querySelector("#legTabs"),
  flightResultsList: document.querySelector("#flightResultsList"),
  seatPanelTitle: document.querySelector("#seatPanelTitle"),
  selectedFare: document.querySelector("#selectedFare"),
  flightSummary: document.querySelector("#flightSummary"),
  seatLegend: document.querySelector("#seatLegend"),
  seatMap: document.querySelector("#seatMap"),
  bookingNotice: document.querySelector("#bookingNotice"),
  selectedLegsSummary: document.querySelector("#selectedLegsSummary"),
  passengerForms: document.querySelector("#passengerForms"),
  priceTotal: document.querySelector("#priceTotal"),
  priceBreakdown: document.querySelector("#priceBreakdown"),
  bookButton: document.querySelector("#bookButton"),
  boardingTitle: document.querySelector("#boardingTitle"),
  bookingReferenceText: document.querySelector("#bookingReferenceText"),
  boardingPassArea: document.querySelector("#boardingPassArea"),
};

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDateTime(value, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

function formatClock(value, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  }).format(new Date(value));
}

function formatFlightTimeRange(flight) {
  const departureTime = formatClock(flight.departureIso, flight.originAirport?.timezone || undefined);
  const arrivalTime = formatClock(flight.arrivalIso, flight.destinationAirport?.timezone || undefined);
  return `${departureTime} - ${arrivalTime}`;
}

function sanitizeIcao(value) {
  return String(value || "").trim().toUpperCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function getFlightLabel(flight) {
  if (!flight) {
    return "";
  }

  return flight.flightNumber ? `${flight.airlineName} ${flight.flightNumber}` : `${flight.airlineName} return service`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  return await response.json();
}

function getPassengerCount() {
  return Number(elements.passengersInput.value) || 1;
}

function getCheckedBags() {
  return Number(elements.bagsInput.value) || 0;
}

function ensurePassengerDrafts() {
  const count = getPassengerCount();

  while (state.passengerDrafts.length < count) {
    state.passengerDrafts.push({ firstName: "", lastName: "" });
  }

  if (state.passengerDrafts.length > count) {
    state.passengerDrafts = state.passengerDrafts.slice(0, count);
  }
}

function getSelectedItinerary() {
  return state.itineraries.find((itinerary) => itinerary.id === state.selectedItineraryId) || null;
}

function getLegFlights(legIndex) {
  return state.legFlightsByIndex[legIndex] || [];
}

function getSelectedFlight(legIndex = state.activeLegIndex) {
  const selectedFlightId = state.selectedFlightsByLeg[legIndex];
  return getLegFlights(legIndex).find((flight) => flight.id === selectedFlightId) || null;
}

function getDefaultBookableFlightId(flights) {
  return flights.find((flight) => !flight.isCanceled)?.id || null;
}

function renderOverview() {
  if (!state.overview) {
    return;
  }

  elements.liveGroundCount.textContent = String(state.overview.totals.liveGround);
  elements.prefileCount.textContent = String(state.overview.totals.prefiled);
  elements.airportCount.textContent = String(state.overview.totals.airports);
  elements.networkStatus.textContent = state.overview.updatedAt
    ? `Live sync ${formatDateTime(state.overview.updatedAt)}`
    : "Waiting for first sync";
  elements.statsimStatus.textContent = state.overview.statsimEnabled
    ? "StatSim routing enabled"
    : "StatSim routing unavailable";

  elements.airportOptions.innerHTML = state.overview.airports
    .map((airport) => {
      const label = [airport.label, airport.country].filter(Boolean).join(" - ");
      return `<option value="${airport.icao}">${label}</option>`;
    })
    .join("");
}

function renderItineraries() {
  if (!state.itineraries.length) {
    elements.itineraryList.innerHTML = `
      <div class="empty-state">
        Enter an origin and destination to find direct or connecting itineraries from historical traffic.
      </div>
    `;
    return;
  }

  elements.itineraryList.innerHTML = state.itineraries
    .map((itinerary) => {
      const isSelected = itinerary.id === state.selectedItineraryId;
      return `
        <button class="result-card ${isSelected ? "is-selected" : ""}" type="button" data-itinerary-id="${itinerary.id}">
          <div class="result-card__top">
            <div class="result-card__brand">
              <strong>${itinerary.origin} to ${itinerary.destination}</strong>
              <span>${itinerary.stopCount === 0 ? "Nonstop" : `${itinerary.stopCount} connection${itinerary.stopCount === 1 ? "" : "s"}`}</span>
            </div>
            <span class="result-badge">${itinerary.weeklyFrequency}x weekly</span>
          </div>

          <div class="result-card__mid">
            <div class="result-route">
              ${itinerary.legs.map((leg) => `<span>${leg.origin}</span><i></i><span>${leg.destination}</span>`).join("<i></i>")}
            </div>
          </div>

          <div class="result-card__bottom">
            <div>
              <div class="result-card__footnote">${itinerary.totalDurationLabel} including connection buffers</div>
              <div class="result-card__footnote">${itinerary.legs.map((leg) => `${leg.origin}-${leg.destination} ${leg.weeklyFrequency}x/week`).join(" | ")}</div>
            </div>
          </div>
          ${itinerary.notes ? `<div class="inline-warning">${itinerary.notes}</div>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderLegTabs() {
  const itinerary = getSelectedItinerary();

  if (!itinerary) {
    elements.legTabs.innerHTML = "";
    return;
  }

  elements.legTabs.innerHTML = `
    <div class="leg-tab-row">
      ${itinerary.legs.map((leg, index) => {
        const isActive = index === state.activeLegIndex;
        const selectedFlight = getSelectedFlight(index);
        return `
          <button class="leg-tab ${isActive ? "is-active" : ""}" type="button" data-leg-tab="${index}">
            Leg ${index + 1}: ${leg.origin}-${leg.destination}${selectedFlight ? " selected" : ""}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderLegFlights() {
  const itinerary = getSelectedItinerary();

  if (!itinerary) {
    elements.legFlightsTitle.textContent = "Choose an itinerary first";
    elements.legFlightsMeta.textContent = "For each leg we'll show live, prefiled, and inferred flights if they exist.";
    elements.flightResultsList.innerHTML = `<div class="empty-state">Pick an itinerary to inspect bookable flights per segment.</div>`;
    return;
  }

  const leg = itinerary.legs[state.activeLegIndex];
  const flights = getLegFlights(state.activeLegIndex);
  elements.legFlightsTitle.textContent = `Leg ${state.activeLegIndex + 1}: ${leg.origin} to ${leg.destination}`;
  elements.legFlightsMeta.textContent = `${leg.weeklyFrequency} flight(s) per week historically. ${leg.connectionWarning || "Choose one current flight option for this segment."}`;

  if (!flights.length) {
    elements.flightResultsList.innerHTML = `
      <div class="empty-state">
        No current live, prefiled, or inferred flights were found for this leg right now.
      </div>
    `;
    return;
  }

  const selectedFlightId = state.selectedFlightsByLeg[state.activeLegIndex];
  elements.flightResultsList.innerHTML = flights
    .map((flight) => {
      const isSelected = flight.id === selectedFlightId;
      return `
        <button class="result-card ${isSelected ? "is-selected" : ""} ${flight.isCanceled ? "is-disabled" : ""}" type="button" data-flight-id="${flight.id}" ${flight.isCanceled ? "disabled" : ""}>
          <div class="result-card__top">
            <div class="result-card__brand">
              <strong>${flight.airlineName}</strong>
              <span>${flight.callsign} - ${flight.aircraftName}</span>
            </div>
            <span class="result-badge" data-type="${flight.sourceType}">${flight.sourceLabel}</span>
          </div>
          <div class="result-card__mid">
            <div class="result-route">
              <span>${flight.origin}</span>
              <i></i>
              <span>${flight.destination}</span>
            </div>
            <div class="result-card__brand">
              <strong>${formatFlightTimeRange(flight)}</strong>
              <span>${flight.durationLabel} - ${flight.distanceMiles} mi</span>
            </div>
          </div>
          <div class="result-card__bottom">
            <div>
              <div class="result-card__footnote">${flight.availability.availableSeats} of ${flight.availability.totalSeats} seats available</div>
              <div class="result-card__footnote">${flight.fare.checkedBags} checked bag(s) in this quote</div>
            </div>
            <div class="result-price">
              <strong>${formatCurrency(flight.fare.total, flight.fare.currency)}</strong>
              <span>for ${flight.fare.passengerCount} traveler(s)</span>
            </div>
          </div>
          ${flight.guaranteeNote ? `<div class="inline-warning">${flight.guaranteeNote}</div>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderFlightSummary() {
  const flight = getSelectedFlight();

  if (!flight) {
    elements.seatPanelTitle.textContent = "Choose a leg flight first";
    elements.selectedFare.textContent = "$0";
    elements.flightSummary.className = "flight-summary flight-summary--empty";
    elements.flightSummary.textContent = "Pick a flight from the active leg to view the aircraft layout.";
    return;
  }

  elements.seatPanelTitle.textContent = getFlightLabel(flight);
  elements.selectedFare.textContent = formatCurrency(flight.fare.total, flight.fare.currency);
  elements.flightSummary.className = "flight-summary";
  elements.flightSummary.innerHTML = `
    <div class="flight-summary__line">
      <strong>${flight.origin} to ${flight.destination}</strong>
      <span>${formatDateTime(flight.departureIso, flight.originAirport?.timezone || undefined)}</span>
    </div>
    <div class="flight-summary__line">
      <span>${flight.aircraftName}</span>
      <span>${flight.durationLabel} - ${flight.distanceMiles} mi</span>
    </div>
    <div class="flight-summary__line">
      <span>${flight.seatMap.label}</span>
      <span>${flight.isCanceled ? "Not bookable" : `${flight.availability.availableSeats} seats left`}</span>
    </div>
    ${flight.guaranteeNote ? `<div class="inline-warning">${flight.guaranteeNote}</div>` : ""}
    ${flight.isCanceled ? `<div class="inline-warning">This scheduled flight is well past its filed departure time and is being treated as canceled.</div>` : ""}
  `;
}

function renderSeatMap() {
  const flight = getSelectedFlight();
  const selectedSeats = state.selectedSeatsByLeg[state.activeLegIndex] || {};

  if (!flight) {
    elements.seatLegend.classList.add("is-hidden");
    elements.seatMap.className = "seat-map seat-map--empty";
    elements.seatMap.textContent = "Select a flight for the active leg to unlock seat selection.";
    return;
  }

  if (flight.isCanceled) {
    elements.seatLegend.classList.add("is-hidden");
    elements.seatMap.className = "seat-map seat-map--empty";
    elements.seatMap.textContent = "This scheduled flight is canceled and cannot be assigned seats.";
    return;
  }

  elements.seatLegend.classList.remove("is-hidden");
  elements.seatMap.className = "seat-map";
  elements.seatMap.innerHTML = flight.seatMap.cabins
    .map((cabin) => {
      return `
        <section class="cabin-block">
          <div class="cabin-label">
            <span>${cabin.label}</span>
            <small>${cabin.rows.length} rows</small>
          </div>
          ${cabin.rows.map((row) => {
            return `
              <div class="seat-row">
                <div class="seat-row__number">${row.number}</div>
                <div class="seat-row__seats">
                  ${row.seats.map((seat) => {
                    const owner = Object.entries(selectedSeats).find(([, seatId]) => seatId === seat.id);
                    const isSelected = owner && Number(owner[0]) === state.activePassengerIndex;
                    return `
                      <button
                        class="seat-button ${isSelected ? "is-selected" : ""}"
                        type="button"
                        data-seat-id="${seat.id}"
                        data-status="${seat.status}"
                        data-category="${seat.category}"
                        ${seat.status === "reserved" ? "disabled" : ""}
                      >
                        ${seat.id}
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </section>
      `;
    })
    .join("");
}

function renderSelectedLegsSummary() {
  const itinerary = getSelectedItinerary();

  if (!itinerary) {
    elements.selectedLegsSummary.innerHTML = "";
    return;
  }

  elements.selectedLegsSummary.innerHTML = itinerary.legs
    .map((leg, index) => {
      const selectedFlight = getSelectedFlight(index);
      return `
        <div class="segment-chip">
          <strong>Leg ${index + 1}: ${leg.origin} to ${leg.destination}</strong>
          <span>${selectedFlight ? `${getFlightLabel(selectedFlight)} at ${formatClock(selectedFlight.departureIso, selectedFlight.originAirport?.timezone || undefined)}` : "No flight selected yet"}</span>
        </div>
      `;
    })
    .join("");
}

function renderPassengerForms() {
  const itinerary = getSelectedItinerary();
  const flight = getSelectedFlight();
  ensurePassengerDrafts();

  if (!itinerary) {
    elements.passengerForms.innerHTML = "";
    elements.bookingNotice.textContent = "Pick an itinerary, then choose a flight for each leg before assigning seats.";
    return;
  }

  elements.bookingNotice.textContent = flight
    ? "Traveler names apply to every segment. Seats are assigned for the active leg."
    : "Select a flight in the active leg, then assign seats traveler by traveler.";

  elements.passengerForms.innerHTML = state.passengerDrafts
    .map((draft, index) => {
      const activeSeat = (state.selectedSeatsByLeg[state.activeLegIndex] || {})[index] || "";
      return `
        <article class="passenger-card ${index === state.activePassengerIndex ? "is-active" : ""}" data-passenger-card="${index}">
          <div class="passenger-card__head">
            <div>
              <strong>Traveler ${index + 1}</strong>
              <div class="passenger-card__meta">
                Active leg seat ${activeSeat || "not selected"}
              </div>
            </div>
            <button type="button" class="result-badge" data-activate-passenger="${index}">
              ${index === state.activePassengerIndex ? "Selecting seat" : "Choose seat"}
            </button>
          </div>
          <div class="passenger-grid">
            <label>
              First name
              <input data-passenger-first="${index}" value="${escapeHtml(draft.firstName)}" placeholder="Taylor" />
            </label>
            <label>
              Last name
              <input data-passenger-last="${index}" value="${escapeHtml(draft.lastName)}" placeholder="Morgan" />
            </label>
          </div>
        </article>
      `;
    })
    .join("");
}

function getSeatFeeTotalForFlight(flight, legIndex) {
  if (!flight) {
    return 0;
  }

  const selectedSeats = state.selectedSeatsByLeg[legIndex] || {};
  let total = 0;

  for (const seatId of Object.values(selectedSeats)) {
    for (const cabin of flight.seatMap.cabins) {
      for (const row of cabin.rows) {
        const seat = row.seats.find((candidate) => candidate.id === seatId);

        if (seat) {
          total += seat.priceDelta || 0;
        }
      }
    }
  }

  return total;
}

function renderPriceBox() {
  const itinerary = getSelectedItinerary();

  if (!itinerary) {
    elements.priceTotal.textContent = "$0";
    elements.priceBreakdown.textContent = "Includes each leg fare, taxes, bags, and seat upgrades.";
    elements.bookButton.disabled = true;
    return;
  }

  let baseTotal = 0;
  let seatFees = 0;
  let allLegsSelected = true;

  for (const [index, leg] of itinerary.legs.entries()) {
    const flight = getSelectedFlight(index);

    if (!flight) {
      allLegsSelected = false;
      continue;
    }

    baseTotal += flight.fare.total || 0;
    seatFees += getSeatFeeTotalForFlight(flight, index);

    for (let passengerIndex = 0; passengerIndex < getPassengerCount(); passengerIndex += 1) {
      if (!(state.selectedSeatsByLeg[index] || {})[passengerIndex]) {
        allLegsSelected = false;
      }
    }
  }

  const total = baseTotal + seatFees;
  elements.priceTotal.textContent = formatCurrency(total);
  elements.priceBreakdown.textContent = `${formatCurrency(baseTotal)} in segment fares plus ${formatCurrency(seatFees)} in seat upgrades.`;
  elements.bookButton.disabled = !allLegsSelected;
}

function renderBoardingPasses() {
  if (!state.booking) {
    elements.boardingTitle.textContent = "Your itinerary confirmation will appear here";
    elements.bookingReferenceText.textContent = "";
    elements.boardingPassArea.className = "boarding-pass-area boarding-pass-area--empty";
    elements.boardingPassArea.textContent = "Build an itinerary, choose flights, and complete the booking to generate segment passes.";
    return;
  }

  elements.boardingTitle.textContent = "Itinerary booking confirmed";
  elements.bookingReferenceText.textContent = `Reference ${state.booking.bookingReference} - ${formatDateTime(state.booking.bookedAt)}`;
  elements.boardingPassArea.className = "boarding-pass-area";
  elements.boardingPassArea.innerHTML = state.booking.boardingPasses
    .map((pass) => {
      const theme = pass.boardingPassTheme || {};
      const styles = [
        theme.primary ? `--bp-primary:${theme.primary}` : "",
        theme.secondary ? `--bp-secondary:${theme.secondary}` : "",
        theme.accent ? `--bp-accent:${theme.accent}` : "",
        theme.ink ? `--bp-ink:${theme.ink}` : "",
        `--bp-ui-font:"Helvetica Neue",Arial,sans-serif`,
        theme.displayFont === "playfair"
          ? `--bp-display-font:"Lato","Helvetica Neue",Arial,sans-serif`
          : `--bp-display-font:"Lato","Helvetica Neue",Arial,sans-serif`,
      ].filter(Boolean).join(";");

      return `
        <article class="boarding-pass" style="${styles}">
          <div class="boarding-pass__main">
            <div class="boarding-pass__brand">
              <div>
                <span>Fictional boarding pass</span>
                <h3>${pass.airlineName}</h3>
              </div>
              <div class="boarding-pass__subline">Leg ${pass.segmentIndex + 1} - ${pass.aircraftName} - ${pass.callsign}</div>
            </div>

            <div class="boarding-pass__route">
              <strong>${pass.origin}</strong>
              <i></i>
              <strong>${pass.destination}</strong>
            </div>

            <div class="boarding-pass__grid">
              <section><label>Passenger</label><strong>${pass.passengerName}</strong></section>
              <section><label>Flight</label><strong>${pass.flightNumber || "Return service"}</strong></section>
              <section><label>Seat</label><strong>${pass.seat}</strong></section>
              <section><label>Gate</label><strong>${pass.gate}</strong></section>
              <section><label>Boarding</label><strong>${formatClock(pass.boardingTime, pass.originAirport?.timezone || undefined)}</strong></section>
              <section><label>Departure</label><strong>${formatClock(pass.departureIso, pass.originAirport?.timezone || undefined)}</strong></section>
              <section><label>Zone</label><strong>${pass.zone}</strong></section>
              <section><label>Bags</label><strong>${pass.checkedBags}</strong></section>
            </div>

            <div class="boarding-pass__barcode"></div>
          </div>

          <div class="boarding-pass__stub">
            <div>
              <label>Reference</label>
              <strong>${pass.bookingReference}</strong>
            </div>
            <div>
              <label>Ticket</label>
              <strong>${pass.ticketNumber}</strong>
            </div>
            <div>
              <label>Boarding pass</label>
              <strong>${pass.barcodeValue}</strong>
            </div>
            <div class="boarding-pass__barcode"></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function rerenderAll() {
  renderItineraries();
  renderLegTabs();
  renderLegFlights();
  renderFlightSummary();
  renderSeatMap();
  renderSelectedLegsSummary();
  renderPassengerForms();
  renderPriceBox();
  renderBoardingPasses();
}

async function loadOverview() {
  state.overview = await fetchJson("/api/overview");
  renderOverview();
}

async function loadLegFlightsForItinerary(itinerary) {
  const queryBase = {
    passengers: String(getPassengerCount()),
    checkedBags: String(getCheckedBags()),
  };

  const responses = await Promise.all(itinerary.legs.map(async (leg) => {
    const query = new URLSearchParams({
      origin: leg.origin,
      destination: leg.destination,
      ...queryBase,
    });
    return await fetchJson(`/api/search?${query.toString()}`);
  }));

  state.legFlightsByIndex = {};
  state.selectedFlightsByLeg = {};
  state.selectedSeatsByLeg = {};

  responses.forEach((response, index) => {
    state.legFlightsByIndex[index] = response.flights;
    state.selectedFlightsByLeg[index] = getDefaultBookableFlightId(response.flights);
    state.selectedSeatsByLeg[index] = {};
  });
}

async function runItinerarySearch() {
  const origin = sanitizeIcao(elements.originInput.value);
  const destination = sanitizeIcao(elements.destinationInput.value);

  if (!origin || !destination) {
    return;
  }

  elements.itineraryTitle.textContent = "Building route options";
  elements.itineraryMeta.textContent = "Checking historical routes and weekly frequency across the network.";

  const response = await fetchJson(`/api/itineraries?origin=${origin}&destination=${destination}`);
  state.itineraries = response.itineraries;
  state.selectedItineraryId = state.itineraries[0]?.id || null;
  state.activeLegIndex = 0;
  state.activePassengerIndex = 0;
  state.booking = null;

  ensurePassengerDrafts();

  if (state.itineraries[0]) {
    await loadLegFlightsForItinerary(state.itineraries[0]);
  } else {
    state.legFlightsByIndex = {};
    state.selectedFlightsByLeg = {};
    state.selectedSeatsByLeg = {};
  }

  elements.itineraryTitle.textContent = `${state.itineraries.length} itinerary${state.itineraries.length === 1 ? "" : "ies"} from ${origin} to ${destination}`;
  elements.itineraryMeta.textContent = state.itineraries.length
    ? "Select a route, then choose one available flight per leg."
    : "No historical path was found for this city pair in the current lookback window.";

  rerenderAll();
}

async function selectItinerary(itineraryId) {
  state.selectedItineraryId = itineraryId;
  state.activeLegIndex = 0;
  state.activePassengerIndex = 0;
  state.booking = null;

  const itinerary = getSelectedItinerary();

  if (itinerary) {
    await loadLegFlightsForItinerary(itinerary);
  }

  rerenderAll();
}

function updatePassengerDraftsFromInputs() {
  for (let index = 0; index < state.passengerDrafts.length; index += 1) {
    const first = document.querySelector(`[data-passenger-first="${index}"]`);
    const last = document.querySelector(`[data-passenger-last="${index}"]`);
    state.passengerDrafts[index] = {
      firstName: first?.value || state.passengerDrafts[index].firstName || "",
      lastName: last?.value || state.passengerDrafts[index].lastName || "",
    };
  }
}

async function submitItineraryBooking() {
  const itinerary = getSelectedItinerary();

  if (!itinerary) {
    return;
  }

  updatePassengerDraftsFromInputs();

  for (const draft of state.passengerDrafts) {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      window.alert("Each traveler needs a first and last name.");
      return;
    }
  }

  const segments = [];

  for (const [index] of itinerary.legs.entries()) {
    const flight = getSelectedFlight(index);

    if (!flight) {
      window.alert(`Choose a flight for leg ${index + 1}.`);
      return;
    }

    const selectedSeats = state.selectedSeatsByLeg[index] || {};
    const passengers = state.passengerDrafts.map((draft, passengerIndex) => {
      return {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        seat: selectedSeats[passengerIndex] || "",
      };
    });

    if (passengers.some((passenger) => !passenger.seat)) {
      window.alert(`Assign seats for every traveler on leg ${index + 1}.`);
      return;
    }

    segments.push({
      flightId: flight.id,
      passengers,
    });
  }

  elements.bookButton.disabled = true;
  elements.bookButton.textContent = "Creating itinerary booking...";

  try {
    state.booking = await fetchJson("/api/itinerary-bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkedBags: getCheckedBags(),
        segments,
      }),
    });

    renderBoardingPasses();
  } catch (error) {
    window.alert(error.message);
  } finally {
    elements.bookButton.textContent = "Reserve itinerary and create boarding passes";
    renderPriceBox();
  }
}

function handleItineraryListClick(event) {
  const button = event.target.closest("[data-itinerary-id]");

  if (!button) {
    return;
  }

  selectItinerary(button.dataset.itineraryId).catch((error) => {
    window.alert(error.message);
  });
}

function handleLegTabsClick(event) {
  const button = event.target.closest("[data-leg-tab]");

  if (!button) {
    return;
  }

  state.activeLegIndex = Number(button.dataset.legTab) || 0;
  state.activePassengerIndex = 0;
  renderLegTabs();
  renderLegFlights();
  renderFlightSummary();
  renderSeatMap();
  renderPassengerForms();
  renderPriceBox();
}

function handleFlightResultsClick(event) {
  const button = event.target.closest("[data-flight-id]");

  if (!button || button.disabled) {
    return;
  }

  state.selectedFlightsByLeg[state.activeLegIndex] = button.dataset.flightId;
  state.selectedSeatsByLeg[state.activeLegIndex] = {};
  state.activePassengerIndex = 0;
  renderLegFlights();
  renderFlightSummary();
  renderSeatMap();
  renderSelectedLegsSummary();
  renderPassengerForms();
  renderPriceBox();
}

function handleSeatMapClick(event) {
  const button = event.target.closest("[data-seat-id]");

  if (!button || button.disabled) {
    return;
  }

  if (!state.selectedSeatsByLeg[state.activeLegIndex]) {
    state.selectedSeatsByLeg[state.activeLegIndex] = {};
  }

  const seatId = button.dataset.seatId;
  const selectedSeats = state.selectedSeatsByLeg[state.activeLegIndex];

  for (const [passengerIndex, existingSeatId] of Object.entries(selectedSeats)) {
    if (existingSeatId === seatId) {
      delete selectedSeats[passengerIndex];
    }
  }

  selectedSeats[state.activePassengerIndex] = seatId;
  const passengerCount = getPassengerCount();
  const nextPassengerIndex = Array.from({ length: passengerCount }, (_, index) => index)
    .find((index) => !selectedSeats[index]);

  if (Number.isInteger(nextPassengerIndex)) {
    state.activePassengerIndex = nextPassengerIndex;
  }

  renderSeatMap();
  renderPassengerForms();
  renderPriceBox();
}

function handlePassengerFormsClick(event) {
  if (event.target.closest("input")) {
    return;
  }

  const trigger = event.target.closest("[data-activate-passenger]");
  const card = event.target.closest("[data-passenger-card]");

  if (trigger) {
    state.activePassengerIndex = Number(trigger.dataset.activatePassenger) || 0;
    renderPassengerForms();
    renderSeatMap();
    return;
  }

  if (card) {
    state.activePassengerIndex = Number(card.dataset.passengerCard) || 0;
    renderPassengerForms();
    renderSeatMap();
  }
}

function handlePassengerFormsInput(event) {
  const firstIndex = event.target.getAttribute("data-passenger-first");
  const lastIndex = event.target.getAttribute("data-passenger-last");

  if (firstIndex !== null) {
    state.passengerDrafts[Number(firstIndex)].firstName = event.target.value;
  }

  if (lastIndex !== null) {
    state.passengerDrafts[Number(lastIndex)].lastName = event.target.value;
  }
}

function resetSelectionStateForPassengerChange() {
  ensurePassengerDrafts();
  state.selectedSeatsByLeg = {};
  state.activePassengerIndex = 0;

  Object.keys(state.selectedFlightsByLeg).forEach((key) => {
    state.selectedSeatsByLeg[key] = {};
  });

  renderPassengerForms();
  renderSeatMap();
  renderPriceBox();
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await runItinerarySearch();
    } catch (error) {
      elements.itineraryTitle.textContent = "Search failed";
      elements.itineraryMeta.textContent = error.message;
      elements.itineraryList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  });

  elements.passengersInput.addEventListener("change", () => {
    resetSelectionStateForPassengerChange();
  });

  elements.bagsInput.addEventListener("change", async () => {
    if (!getSelectedItinerary()) {
      renderPriceBox();
      return;
    }

    try {
      await selectItinerary(state.selectedItineraryId);
    } catch (error) {
      window.alert(error.message);
    }
  });

  elements.itineraryList.addEventListener("click", handleItineraryListClick);
  elements.legTabs.addEventListener("click", handleLegTabsClick);
  elements.flightResultsList.addEventListener("click", handleFlightResultsClick);
  elements.seatMap.addEventListener("click", handleSeatMapClick);
  elements.passengerForms.addEventListener("click", handlePassengerFormsClick);
  elements.passengerForms.addEventListener("input", handlePassengerFormsInput);
  elements.bookButton.addEventListener("click", submitItineraryBooking);
}

async function init() {
  bindEvents();
  ensurePassengerDrafts();
  rerenderAll();

  try {
    await loadOverview();
  } catch (error) {
    elements.networkStatus.textContent = "Overview unavailable";
    elements.itineraryMeta.textContent = error.message;
  }
}

init();
