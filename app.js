import {
  db,
  ref,
  push,
  set,
  get,
  child,
  app
}
  from "./firebase.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Database
  initDatabase();

  // Initialize Application State
  AppStore.init();

  // Initialize UI Events
  initUiEvents();

  // Load default route
  AppStore.navigate(AppStore.state.currentRoute);
});

/* ==========================================
   Database Operations
   ========================================== */
const DB_KEY = "hr_summit_insight_db";

function initDatabase() {
  if (!localStorage.getItem(DB_KEY)) {
    // If no existing data, load from the mockData file
    if (window.initialMockData) {
      localStorage.setItem(DB_KEY, JSON.stringify(window.initialMockData));
    } else {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
    }
  }
}

const Database = {

  async getAll() {

    try {

      const snapshot = await get(ref(db, "feedbacks"));

      if (snapshot.exists()) {

        const data = snapshot.val();

        return Object.values(data).reverse();

      }

      return [];

    } catch (error) {

      console.error("Firebase Read Error:", error);

      return [];

    }

  },

  async add(record) {

    try {

      const newRef = push(ref(db, "feedbacks"));

      await set(newRef, record);

      return true;

    } catch (error) {

      console.error("Firebase Save Error:", error);

      return false;

    }

  },

  async clear() {

    alert("Clear disabled for safety.");

  },

  async resetToMock() {

    alert("Mock reset disabled.");

  }

};

async function adminLogin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    AppStore.state.loggedIn = true;
    sessionStorage.setItem("hr_portal_admin_session", "true");
    AppStore.navigate("admin");
  } catch (error) {
    alert("Invalid Email or Password");
  }
}

/* ==========================================
   Application State Store
   ========================================== */
const AppStore = {
  state: {
    currentRoute: "landing",
    adminTab: "dashboard",
    formStep: 1,
    isDarkMode: false,
    loggedIn: false,
    filters: {
      search: "",
      domain: "",
      hiring: "",
      salary: ""
    },
    pagination: {
      currentPage: 1,
      pageSize: 5
    }
  },

  init: () => {
    // Check local storage for theme preference
    const storedTheme = localStorage.getItem("hr_portal_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      AppStore.state.isDarkMode = true;
      document.documentElement.classList.add("dark");
    } else {
      AppStore.state.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    }

    // Check session storage for admin login status
    const isLoggedIn = sessionStorage.getItem("hr_portal_admin_session") === "true";
    AppStore.state.loggedIn = isLoggedIn;
  },

  navigate: (route) => {
    // If admin is accessed but not logged in, force login page
    if (route === "admin" && !AppStore.state.loggedIn) {
      route = "login";
    }

    AppStore.state.currentRoute = route;

    // Hide all view panels
    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.remove("active");
    });

    // Show active panel
    const activePanel = document.getElementById(`${route}-view`);
    if (activePanel) {
      activePanel.classList.add("active");
    }

    // Trigger actions based on active route
    if (route === "admin") {
      AppStore.renderAdminLayout();
      AppStore.switchAdminTab(AppStore.state.adminTab);
    } else if (route === "form") {
      AppStore.setFormStep(1);
    }

    window.scrollTo(0, 0);
  },

  setFormStep: (step) => {
    AppStore.state.formStep = 1;
    const submitBtn = document.getElementById("form-submit-btn");
    if (submitBtn) submitBtn.style.display = "inline-flex";
  },

  toggleTheme: () => {
    AppStore.state.isDarkMode = !AppStore.state.isDarkMode;
    if (AppStore.state.isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("hr_portal_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("hr_portal_theme", "light");
    }
    // Update theme toggle icons across the app
    updateThemeToggleIcons();
    // Re-render charts in dark mode to update text grid colors
    if (AppStore.state.currentRoute === "admin" && AppStore.state.adminTab === "analytics") {
      AnalyticsTab.renderCharts();
    }
  },

  login: (username, password) => {
    adminLogin(username, password);
  },

  logout: () => {
    AppStore.state.loggedIn = false;
sessionStorage.removeItem("hr_portal_admin_session");
AppStore.navigate("landing");
  },

renderAdminLayout: () => {
  // Show correct sidebar active item
  document.querySelectorAll(".sidebar-item").forEach(item => {
    const tab = item.dataset.tab;
    if (tab === AppStore.state.adminTab) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
},

  switchAdminTab: (tab) => {
    AppStore.state.adminTab = tab;

    // Update active tab styles in sidebar
    document.querySelectorAll(".sidebar-item").forEach(item => {
      if (item.dataset.tab === tab) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Show correct sub-view
    document.querySelectorAll(".admin-sub-view").forEach(view => {
      if (view.id === `admin-${tab}`) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    // Initialize sub-view components
    if (tab === "dashboard") {
      DashboardTab.init();
    } else if (tab === "records") {
      RecordsTab.init();
    } else if (tab === "directory") {
      DirectoryTab.init();
    } else if (tab === "analytics") {
      AnalyticsTab.init();
    } else if (tab === "ai-insights") {
      AiInsightsTab.init();
    } else if (tab === "reports") {
      ReportsTab.init();
    } else if (tab === "settings") {
      SettingsTab.init();
    }
  }
};

/* ==========================================
   UI Event Bindings
   ========================================== */
function initUiEvents() {
  // Set copyright year dynamically
  document.querySelectorAll(".current-year").forEach(el => {
    el.innerText = new Date().getFullYear();
  });

  // Global Theme Toggles
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.addEventListener("click", () => AppStore.toggleTheme());
  });
  updateThemeToggleIcons();

  // Navigation Links
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el.dataset.nav;
      AppStore.navigate(target);
    });
  });

  // Admin Sidebar Sub-tab switching
  document.querySelectorAll(".sidebar-item[data-tab]").forEach(el => {
    el.addEventListener("click", () => {
      const tab = el.dataset.tab;
      if (tab === "logout") {
        AppStore.logout();
      } else {
        AppStore.switchAdminTab(tab);
      }
    });
  });

  // Login Form Submission
  const loginForm = document.getElementById("admin-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("login-username").value.trim();
      const pass = document.getElementById("login-password").value.trim();
      AppStore.login(user, pass);
    });
  }

  // Form Submission
  const submitBtn = document.getElementById("form-submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (validateForm()) {
        submitFeedbackForm();
      }
    });
  }

  // Bind Form Radio selections for styled highlights
  document.querySelectorAll(".radio-item input[type='radio']").forEach(radio => {
    radio.addEventListener("change", () => {
      const name = radio.name;
      document.querySelectorAll(`.radio-item input[name='${name}']`).forEach(r => {
        r.closest(".radio-item").classList.remove("selected");
      });
      if (radio.checked) {
        radio.closest(".radio-item").classList.add("selected");
      }
    });
  });

  // Bind Form Checkboxes for styled highlights
  document.querySelectorAll(".checkbox-item input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      if (chk.checked) {
        chk.closest(".checkbox-item").classList.add("selected");
      } else {
        chk.closest(".checkbox-item").classList.remove("selected");
      }
    });
  });

  // Star Ratings selection triggers
  document.querySelectorAll(".star-checkbox").forEach(star => {
    star.addEventListener("change", (e) => {
      const row = star.closest(".rating-row");
      const labelText = row.querySelector(".rating-label").textContent;
      console.log(`Rated ${labelText}: ${e.target.value} stars`);
    });
  });
}

function updateThemeToggleIcons() {
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    if (AppStore.state.isDarkMode) {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
  });
}

/* ==========================================
   Form Wizard Step Validation
   ========================================== */
function validateForm() {
  clearFormErrors();
  let isValid = true;

  // Validate Name & Company Name
  const nameEl = document.getElementById("hr-name");
  if (!nameEl || !nameEl.value.trim()) {
    showInputError(nameEl, "Full Name is required.");
    isValid = false;
  }

  const designationEl = document.getElementById("hr-designation");
  if (!designationEl || !designationEl.value.trim()) {
    showInputError(designationEl, "Company name is required.");
    isValid = false;
  }

  // Validate star ratings (Hospitality, studentInteraction, foodAccommodation, Organization)
  const ratingCategories = ["hospitality", "studentInteraction", "foodAccommodation", "organization"];
  ratingCategories.forEach(cat => {
    const selected = document.querySelector(`input[name="rate-${cat}"]:checked`);
    if (!selected) {
      const container = document.getElementById(`rating-container-${cat}`);
      if (container) {
        showRatingError(container, "Please provide a rating score.");
      }
      isValid = false;
    }
  });

  // Hires Freshers radio check
  const hiresFreshers = document.querySelector("input[name='hires-freshers']:checked");
  if (!hiresFreshers) {
    showRadioError("hires-freshers", "Please select hiring status.");
    isValid = false;
  }

  // Scroll to first error if any
  if (!isValid) {
    const firstError = document.querySelector(".input-error-msg");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return isValid;
}

function showInputError(element, message) {
  if (!element) return;
  element.style.borderColor = "var(--danger)";

  const errorMsg = document.createElement("div");
  errorMsg.className = "input-error-msg";
  errorMsg.style.color = "var(--danger)";
  errorMsg.style.fontSize = "0.75rem";
  errorMsg.style.fontWeight = "600";
  errorMsg.style.marginTop = "4px";
  errorMsg.innerText = message;

  element.parentNode.appendChild(errorMsg);
}

function showRatingError(element, message) {
  if (!element) return;
  const errorMsg = document.createElement("div");
  errorMsg.className = "input-error-msg";
  errorMsg.style.color = "var(--danger)";
  errorMsg.style.fontSize = "0.75rem";
  errorMsg.style.fontWeight = "600";
  errorMsg.style.textAlign = "right";
  errorMsg.style.marginTop = "4px";
  errorMsg.innerText = message;
  element.appendChild(errorMsg);
}

function showRadioError(name, message) {
  const radioGroup = document.querySelector(`input[name="${name}"]`).closest(".radio-group");
  if (!radioGroup) return;
  const errorMsg = document.createElement("div");
  errorMsg.className = "input-error-msg";
  errorMsg.style.color = "var(--danger)";
  errorMsg.style.fontSize = "0.75rem";
  errorMsg.style.fontWeight = "600";
  errorMsg.style.marginTop = "8px";
  errorMsg.innerText = message;
  radioGroup.parentNode.appendChild(errorMsg);
}

function clearFormErrors() {
  document.querySelectorAll(".input-error-msg").forEach(msg => msg.remove());
  document.querySelectorAll(".form-control").forEach(control => {
    control.style.borderColor = "var(--border-color)";
  });
}

/* ==========================================
   Feedback Form Submission Logic
   ========================================== */
async function submitFeedbackForm() {
  const formElement = document.getElementById("hr-feedback-form");

  const hospitalityVal = parseInt(document.querySelector("input[name='rate-hospitality']:checked").value);

  // Section 1: HR Info
  const hrInfo = {
    fullName: document.getElementById("hr-name").value.trim(),
    designation: document.getElementById("hr-designation").value.trim(),
    companyName: document.getElementById("hr-designation").value.trim(),
    industryDomain: "Other",
    email: "Not provided",
    mobileNumber: "Not provided",
    linkedinProfile: "Not provided",
    city: "Not provided"
  };

  // Section 2: Ratings
  const eventFeedback = {
    organization: parseInt(document.querySelector("input[name='rate-organization']:checked").value),
    hospitality: hospitalityVal,
    studentInteraction: parseInt(document.querySelector("input[name='rate-studentInteraction']:checked").value),
    foodAccommodation: parseInt(document.querySelector("input[name='rate-foodAccommodation']:checked").value),
    venueArrangements: hospitalityVal,
    likedMost: "N/A"
  };

  // Section 3: Skill Expectations
  const skillsList = [];
  document.querySelectorAll("input[name='expect-skills']:checked").forEach(chk => {
    skillsList.push(chk.value);
  });
  const customSkill = document.getElementById("skills-other-val").value.trim();
  if (document.getElementById("skills-other").checked && customSkill) {
    skillsList.push(customSkill);
  }

  const industryExpectations = {
    demandedSkills: skillsList,
    topFocusSkills: "N/A"
  };

  // Section 4: Hiring Insights
  const hiringInsights = {
    hiresFreshers: document.querySelector("input[name='hires-freshers']:checked").value,
    hiringRoles: [],
    salaryRange: "3-5 LPA",
    hiringPlansNextYear: "N/A"
  };

  // Section 5: Curriculum
  const curriculumFeedback = {
    topicsToTeachMore: "N/A",
    practicalExposureMissing: "N/A",
    curriculumImprovementSuggestions: document.getElementById("hr-curriculum-suggestions").value.trim() || "N/A"
  };

  // Section 6: Suggestions & Collab
  const finalSuggestions = {
    generalSuggestions: "N/A",
    futureCollaboration: "Maybe",
    collaborationInterests: []
  };

  // Assemble into feedback object
  const newSubmission = {
    id: "hr-" + Date.now(),
    timestamp: new Date().toISOString(),
    hrInfo,
    eventFeedback,
    industryExpectations,
    hiringInsights,
    curriculumFeedback,
    finalSuggestions
  };

  // Save to DB
  await Database.add(newSubmission);

  // Clear form elements
  formElement.reset();
  document.querySelectorAll(".radio-item").forEach(el => el.classList.remove("selected"));
  document.querySelectorAll(".checkbox-item").forEach(el => el.classList.remove("selected"));

  // Navigate to Thank You page
  AppStore.navigate("thank-you");
}

/* ==========================================
   Admin Sub-view Panels Renderers
   ========================================== */

/* --- ADMIN TAB 1: OVERVIEW DASHBOARD --- */
const DashboardTab = {
  init: async () => {
    const data = await Database.getAll();

    // 1. KPI Cards population
    const totalResponses = data.length;
    let totalScoreSum = 0;
    let ratingCount = 0;
    let studentInteractionScoreSum = 0;
    let studentInteractionCount = 0;
    let hiringCount = 0;

    data.forEach(r => {
      // Event Ratings
      const ratings = r.eventFeedback;
      if (ratings) {
        const foodAcc = ratings.foodAccommodation !== undefined ? ratings.foodAccommodation : (ratings.technicalSessions || 0);
        totalScoreSum += (ratings.organization + ratings.hospitality + ratings.studentInteraction + foodAcc);
        ratingCount += 4;

        if (ratings.studentInteraction !== undefined && ratings.studentInteraction !== null) {
          studentInteractionScoreSum += ratings.studentInteraction;
          studentInteractionCount++;
        }
      }

      // Hiring status
      if (r.hiringInsights && r.hiringInsights.hiresFreshers) {
        if (r.hiringInsights.hiresFreshers === "Yes" || r.hiringInsights.hiresFreshers === "Occasionally") {
          hiringCount++;
        }
      }
    });

    const avgRating = ratingCount > 0 ? (totalScoreSum / ratingCount).toFixed(1) : "0.0";
    const avgStudentInteraction = studentInteractionCount > 0 ? (studentInteractionScoreSum / studentInteractionCount).toFixed(1) : "0.0";

    // Push into DOM
    document.getElementById("kpi-responses").innerText = totalResponses;
    document.getElementById("kpi-rating").innerText = avgRating;
    document.getElementById("kpi-student-interaction").innerText = avgStudentInteraction;
    document.getElementById("kpi-hiring").innerText = hiringCount;

    // Renders mini list of recent responses
    const listBody = document.getElementById("dash-recent-list");
    if (listBody) {
      listBody.innerHTML = "";
      if (data.length === 0) {
        listBody.innerHTML = `<div class="text-muted p-3 text-center">No feedback responses recorded yet.</div>`;
      } else {
        // Take top 4 recent
        data.slice(0, 4).forEach(r => {
          const foodAcc = r.eventFeedback.foodAccommodation !== undefined ? r.eventFeedback.foodAccommodation : (r.eventFeedback.technicalSessions || 0);
          const ratingVal = r.eventFeedback ? ((r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + foodAcc) / 4).toFixed(1) : "N/A";
          const rowDiv = document.createElement("div");
          rowDiv.className = "recent-item";
          rowDiv.style.display = "flex";
          rowDiv.style.justifyContent = "space-between";
          rowDiv.style.alignItems = "center";
          rowDiv.style.padding = "12px 0";
          rowDiv.style.borderBottom = "1px solid var(--border-color)";

          rowDiv.innerHTML = `
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${r.hrInfo.fullName}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${r.hrInfo.designation}</div>
            </div>
            <div style="text-align: right;">
              <span class="badge ${r.hiringInsights.hiresFreshers === 'Yes' ? 'badge-success' : r.hiringInsights.hiresFreshers === 'Occasionally' ? 'badge-warning' : 'badge-danger'}">
                Hires: ${r.hiringInsights.hiresFreshers || 'No'}
              </span>
              <div style="font-size: 0.8rem; color: var(--accent); font-weight: 700; margin-top: 4px;">★ ${ratingVal}</div>
            </div>
          `;
          listBody.appendChild(rowDiv);
        });
      }
    }
  }
};

/* --- ADMIN TAB 2: DETAILED RECORDS CARDS --- */
const RecordsTab = {
  init: async () => {
    const data = await Database.getAll();
    const deck = document.getElementById("records-deck");
    if (!deck) return;

    deck.innerHTML = "";
    if (data.length === 0) {
      deck.innerHTML = `<div class="text-muted text-center p-5 glass-card">No records available. Populate mock data in Settings or submit the form.</div>`;
      return;
    }

    data.forEach((r, idx) => {
      const foodAcc = r.eventFeedback.foodAccommodation !== undefined ? r.eventFeedback.foodAccommodation : (r.eventFeedback.technicalSessions || 0);
      const avgScore = ((r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + foodAcc) / 4).toFixed(1);
      const card = document.createElement("div");
      card.className = "record-card glass-card";

      // Skills markup
      const skillsMarkup = r.industryExpectations.demandedSkills.map(s => `<span class="tag-item">${s}</span>`).join("");

      card.innerHTML = `
        <div class="record-header">
          <div class="record-meta">
            <h4>${r.hrInfo.fullName} <span style="font-weight: normal; color: var(--text-muted); font-size:0.9rem;">(${r.hrInfo.designation})</span></h4>
            ${r.hrInfo.companyName !== "Not provided" ? `<p><strong>${r.hrInfo.companyName}</strong> (${r.hrInfo.industryDomain}) • ${r.hrInfo.city}</p>` : ""}
            <p style="font-size:0.75rem; margin-top: 4px;">Submitted: ${new Date(r.timestamp).toLocaleString()}</p>
          </div>
          <div style="text-align: right;">
            <div class="record-stars" title="Average Event Score: ${avgScore}">
              ★ ${avgScore} / 5.0
            </div>
            <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">
               Hires freshers: <span class="badge ${r.hiringInsights.hiresFreshers === 'Yes' ? 'badge-success' : r.hiringInsights.hiresFreshers === 'Occasionally' ? 'badge-warning' : 'badge-danger'}">${r.hiringInsights.hiresFreshers || 'No'}</span>
            </div>
          </div>
        </div>
        <div class="record-body">
          <div class="record-column">
            <h5>Event Feedbacks</h5>
            <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px; color: var(--text-muted);">
              <div>Hospitality: <strong>${r.eventFeedback.hospitality}/5</strong></div>
              <div>Student Interaction: <strong>${r.eventFeedback.studentInteraction}/5</strong></div>
              <div>Food & Accommodation: <strong>${foodAcc}/5</strong></div>
              <div>Organization: <strong>${r.eventFeedback.organization}/5</strong></div>
            </div>
          </div>
          <div class="record-column">
            <h5>Expected Core Skills</h5>
            <div class="tag-list" style="margin-top: 8px;">
              ${skillsMarkup || '<span class="text-muted" style="font-size: 0.8rem;">None selected</span>'}
            </div>
          </div>
          <div class="record-column">
            <h5>Curriculum Suggestions</h5>
            <p style="font-size:0.85rem; line-height: 1.4;">${r.curriculumFeedback.curriculumImprovementSuggestions || 'N/A'}</p>
          </div>
        </div>
      `;
      deck.appendChild(card);
    });
  }
};

/* --- ADMIN TAB 3: HR DIRECTORY LIST TABLE --- */
const DirectoryTab = {
  init: () => {
    // Bind search and filter events
    const searchInput = document.getElementById("dir-search");
    const hiringFilter = document.getElementById("dir-filter-hiring");
    const dlExcelBtn = document.getElementById("dir-dl-excel");

    if (dlExcelBtn) {
      const newDlBtn = dlExcelBtn.cloneNode(true);
      dlExcelBtn.parentNode.replaceChild(newDlBtn, dlExcelBtn);
      newDlBtn.addEventListener("click", exportToExcel);
    }

    if (searchInput) {
      searchInput.value = AppStore.state.filters.search;
      // Remove old listeners by cloning
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      newSearchInput.addEventListener("input", (e) => {
        AppStore.state.filters.search = e.target.value;
        AppStore.state.pagination.currentPage = 1;
        DirectoryTab.renderTable();
      });
    }

    if (hiringFilter) {
      hiringFilter.value = AppStore.state.filters.hiring;
      const newHiringFilter = hiringFilter.cloneNode(true);
      hiringFilter.parentNode.replaceChild(newHiringFilter, hiringFilter);
      newHiringFilter.addEventListener("change", (e) => {
        AppStore.state.filters.hiring = e.target.value;
        AppStore.state.pagination.currentPage = 1;
        DirectoryTab.renderTable();
      });
    }

    DirectoryTab.renderTable();
  },

  renderTable: async () => {
    const data = await Database.getAll();
    const tableBody = document.getElementById("directory-table-body");
    if (!tableBody) return;

    // Filter Logic
    const search = AppStore.state.filters.search.toLowerCase().trim();
    const hiring = AppStore.state.filters.hiring;

    const filteredData = data.filter(r => {
      // Search
      const searchMatch = !search ||
        r.hrInfo.fullName.toLowerCase().includes(search) ||
        r.hrInfo.companyName.toLowerCase().includes(search) ||
        r.hrInfo.designation.toLowerCase().includes(search);

      // Hiring status
      const hiringMatch = !hiring || r.hiringInsights.hiresFreshers === hiring;

      return searchMatch && hiringMatch;
    });

    // Pagination Logic
    const totalItems = filteredData.length;
    const pageSize = AppStore.state.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (AppStore.state.pagination.currentPage > totalPages) {
      AppStore.state.pagination.currentPage = totalPages;
    }
    const currentPage = AppStore.state.pagination.currentPage;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Render Table Rows
    tableBody.innerHTML = "";
    if (paginatedData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="text-muted text-center p-4">No matching records found.</td></tr>`;
    } else {
      paginatedData.forEach(r => {
        const row = document.createElement("tr");
        const badgeClass = r.hiringInsights.hiresFreshers === "Yes" ? "badge-success" : r.hiringInsights.hiresFreshers === "Occasionally" ? "badge-warning" : "badge-danger";

        row.innerHTML = `
          <td class="hr-name-col">${r.hrInfo.fullName}</td>
          <td class="hr-company-col">
            <div style="font-weight: 700;">${r.hrInfo.companyName}</div>
          </td>
          <td><span class="badge ${badgeClass}">${r.hiringInsights.hiresFreshers}</span></td>
        `;
        tableBody.appendChild(row);
      });
    }

    // Pagination Info and buttons update
    const countText = document.getElementById("paginated-count-text");
    if (countText) {
      countText.innerText = totalItems > 0
        ? `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} records`
        : `Showing 0 to 0 of 0 records`;
    }

    const prevPageBtn = document.getElementById("page-prev-btn");
    const nextPageBtn = document.getElementById("page-next-btn");

    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 1;
      // Re-bind click
      const newPrevBtn = prevPageBtn.cloneNode(true);
      prevPageBtn.parentNode.replaceChild(newPrevBtn, prevPageBtn);
      newPrevBtn.addEventListener("click", () => {
        if (AppStore.state.pagination.currentPage > 1) {
          AppStore.state.pagination.currentPage--;
          DirectoryTab.renderTable();
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage === totalPages || totalItems === 0;
      const newNextBtn = nextPageBtn.cloneNode(true);
      nextPageBtn.parentNode.replaceChild(newNextBtn, nextPageBtn);
      newNextBtn.addEventListener("click", () => {
        if (AppStore.state.pagination.currentPage < totalPages) {
          AppStore.state.pagination.currentPage++;
          DirectoryTab.renderTable();
        }
      });
    }
  }
};

/* --- ADMIN TAB 4: VISUAL CHARTS & ANALYTICS (DEPRECATED) --- */
const AnalyticsTab = {
  init: () => { },
  renderCharts: () => { }
};

/* --- ADMIN TAB 5: AI INSIGHTS GENERATOR MODULE (DEPRECATED) --- */
const AiInsightsTab = {
  init: () => { }
};

/* --- ADMIN TAB 6: REPORTS & EXPORTS (DEPRECATED) --- */
const ReportsTab = {
  init: () => { }
};


/* --- ADMIN TAB 7: SETTINGS & BACKUP/RESTORE --- */
const SettingsTab = {
  init: () => {
    // Generate QR Code action
    const btnGenQr = document.getElementById("btn-generate-qr");
    if (btnGenQr) {
      const newBtnGenQr = btnGenQr.cloneNode(true);
      btnGenQr.parentNode.replaceChild(newBtnGenQr, btnGenQr);
      newBtnGenQr.addEventListener("click", () => generateQrCodeImage());
    }

    // QR Code Download action
    const btnDlQr = document.getElementById("btn-download-qr");
    if (btnDlQr) {
      const newBtnDlQr = btnDlQr.cloneNode(true);
      btnDlQr.parentNode.replaceChild(newBtnDlQr, btnDlQr);
      newBtnDlQr.addEventListener("click", () => downloadQrCode());
    }

    // Reset database action
    const btnReset = document.getElementById("btn-db-reset");
    if (btnReset) {
      const newBtnReset = btnReset.cloneNode(true);
      btnReset.parentNode.replaceChild(newBtnReset, btnReset);
      newBtnReset.addEventListener("click", () => {
        if (confirm("Are you sure you want to restore the database to initial mock records? Any custom entries will be lost.")) {
          Database.resetToMock();
          alert("Database reset to initial 12 corporate mock feedback responses.");
          AppStore.switchAdminTab("dashboard");
        }
      });
    }

    // Clear database action
    const btnClear = document.getElementById("btn-db-clear");
    if (btnClear) {
      const newBtnClear = btnClear.cloneNode(true);
      btnClear.parentNode.replaceChild(newBtnClear, btnClear);
      newBtnClear.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the entire database? This action is irreversible.")) {
          Database.clear();
          alert("Database completely cleared.");
          AppStore.switchAdminTab("dashboard");
        }
      });
    }

    // Backup Database (JSON export)
    const btnBackup = document.getElementById("btn-db-backup");
    if (btnBackup) {
      const newBtnBackup = btnBackup.cloneNode(true);
      btnBackup.parentNode.replaceChild(newBtnBackup, btnBackup);
      newBtnBackup.addEventListener("click", async () => {
        const data = await Database.getAll();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hr_insight_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Restore Database (JSON import)
    const fileRestoreInput = document.getElementById("file-db-restore");
    if (fileRestoreInput) {
      const newFileRestoreInput = fileRestoreInput.cloneNode(true);
      fileRestoreInput.parentNode.replaceChild(newFileRestoreInput, fileRestoreInput);
      newFileRestoreInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsedData = JSON.parse(event.target.result);
            if (Array.isArray(parsedData)) {
              Database.save(parsedData);
              alert(`Successfully restored database with ${parsedData.length} records.`);
              newFileRestoreInput.value = ""; // reset
              AppStore.switchAdminTab("dashboard");
            } else {
              alert("Error: Restored file structure is invalid. Must be a JSON array of responses.");
            }
          } catch (err) {
            alert("Error parsing file. Please check if the file is a valid JSON database backup.");
          }
        };
        reader.readAsText(file);
      });
    }

    // Trigger QR generation on view load
    generateQrCodeImage(false);
  }
};

/* ==========================================
   QR Code Generator Helper
   ========================================== */
let globalQrcodeInstance = null;

function generateQrCodeImage(alertUser = true) {
  const qrContainer = document.getElementById("qr-canvas-holder");
  if (!qrContainer) return;

  qrContainer.innerHTML = "";

  // Target feedback form link (uses current address to allow direct mobile scan)
  const appUrl = window.location.origin + window.location.pathname;
  console.log("Generating QR code for URL:", appUrl);

  try {
    // Check if QRCode library is available
    if (typeof QRCode !== "undefined") {
      globalQrcodeInstance = new QRCode(qrContainer, {
        text: appUrl,
        width: 180,
        height: 180,
        colorDark: "#1e3a8a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      if (alertUser) alert("QR Code successfully updated for: " + appUrl);
    } else {
      // Fallback if CDN QRCode didn't load: use an online API to render image
      const fallbackImg = document.createElement("img");
      fallbackImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}&color=1e3a8a`;
      fallbackImg.alt = "Summit QR Code Link";
      fallbackImg.style.width = "180px";
      fallbackImg.style.height = "180px";
      qrContainer.appendChild(fallbackImg);
      if (alertUser) alert("QR Code rendered via Fallback QR API.");
    }
  } catch (err) {
    console.error("QR Code rendering error:", err);
    qrContainer.innerHTML = `<span style="font-size:0.8rem; color:var(--danger);">QR Generation Failed. Verify connection.</span>`;
  }
}

function downloadQrCode() {
  const qrContainer = document.getElementById("qr-canvas-holder");
  if (!qrContainer) return;

  const canvas = qrContainer.querySelector("canvas");
  const img = qrContainer.querySelector("img");
  let downloadUrl = "";

  if (canvas) {
    downloadUrl = canvas.toDataURL("image/png");
  } else if (img) {
    downloadUrl = img.src;
  }

  if (downloadUrl) {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "hr_summit_feedback_qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    alert("No QR Code image available for download. Please click Generate first.");
  }
}

/* ==========================================
   Data Export Functions (Excel and PDF)
   ========================================== */
async function exportToExcel() {
  const data = await Database.getAll();
  if (data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Format dataset flatly for Excel columns
  const excelData = data.map((r, i) => ({
    "S.No": i + 1,
    "Date Submitted": r.timestamp ? new Date(r.timestamp).toLocaleString() : "N/A",
    "Full Name": (r.hrInfo && r.hrInfo.fullName) ? r.hrInfo.fullName : "N/A",
    "Designation": (r.hrInfo && r.hrInfo.designation) ? r.hrInfo.designation : "N/A",
    "Company Name": (r.hrInfo && r.hrInfo.companyName) ? r.hrInfo.companyName : "N/A",
    "Industry Domain": (r.hrInfo && r.hrInfo.industryDomain) ? r.hrInfo.industryDomain : "N/A",
    "Email": (r.hrInfo && r.hrInfo.email) ? r.hrInfo.email : "N/A",
    "Mobile Number": (r.hrInfo && r.hrInfo.mobileNumber) ? r.hrInfo.mobileNumber : "N/A",
    "City": (r.hrInfo && r.hrInfo.city) ? r.hrInfo.city : "N/A",

    // Ratings
    "Organization Rating": (r.eventFeedback && r.eventFeedback.organization) || 0,
    "Hospitality Rating": (r.eventFeedback && r.eventFeedback.hospitality) || 0,
    "Student Interaction Rating": (r.eventFeedback && r.eventFeedback.studentInteraction) || 0,
    "Food & Accommodation Rating": r.eventFeedback ? (r.eventFeedback.foodAccommodation !== undefined ? r.eventFeedback.foodAccommodation : (r.eventFeedback.technicalSessions || 0)) : 0,
    "Venue Arrangements Rating": (r.eventFeedback && r.eventFeedback.venueArrangements) || 0,
    "Average Event Rating": r.eventFeedback ? (((r.eventFeedback.organization || 0) + (r.eventFeedback.hospitality || 0) + (r.eventFeedback.studentInteraction || 0) + (r.eventFeedback.foodAccommodation !== undefined ? r.eventFeedback.foodAccommodation : (r.eventFeedback.technicalSessions || 0)) + (r.eventFeedback.venueArrangements || 0)) / 5).toFixed(1) : "0.0",
    "Liked Most Comments": (r.eventFeedback && r.eventFeedback.likedMost) || "N/A",

    // Expectations
    "Demanded Skills List": (r.industryExpectations && r.industryExpectations.demandedSkills) ? r.industryExpectations.demandedSkills.join(", ") : "",
    "Top Focus Areas": (r.industryExpectations && r.industryExpectations.topFocusSkills) || "N/A",

    // Hiring
    "Hires Freshers": (r.hiringInsights && r.hiringInsights.hiresFreshers) || "N/A",
    "Hiring Roles": (r.hiringInsights && r.hiringInsights.hiringRoles) ? r.hiringInsights.hiringRoles.join(", ") : "",
    "Fresher Salary Range": (r.hiringInsights && r.hiringInsights.salaryRange) || "N/A",
    "Hiring Plans Next Year": (r.hiringInsights && r.hiringInsights.hiringPlansNextYear) || "N/A",

    // Curriculum
    "Topics to Teach More": (r.curriculumFeedback && r.curriculumFeedback.topicsToTeachMore) || "N/A",
    "Practical Gaps Identified": (r.curriculumFeedback && r.curriculumFeedback.practicalExposureMissing) || "N/A",
    "Curriculum Suggestions": (r.curriculumFeedback && r.curriculumFeedback.curriculumImprovementSuggestions) || "N/A",

    // Collab
    "Future Collaboration Interest": (r.finalSuggestions && r.finalSuggestions.futureCollaboration) || "N/A",
    "Collaboration Topics Selected": (r.finalSuggestions && r.finalSuggestions.collaborationInterests) ? r.finalSuggestions.collaborationInterests.join(", ") : "",
    "General Suggestions": (r.finalSuggestions && r.finalSuggestions.generalSuggestions) || "N/A"
  }));

  try {
    if (typeof XLSX !== "undefined") {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "HR Feedbacks");
      XLSX.writeFile(workbook, `HR_Summit_Feedback_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      // Fallback CSV download if XLSX CDN fails
      let csvRows = [];
      const headers = Object.keys(excelData[0]).join(",");
      csvRows.push(headers);

      excelData.forEach(row => {
        const rowData = Object.values(row).map(val => {
          let str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
        csvRows.push(rowData);
      });

      const csvString = csvRows.join("\r\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.setAttribute("download", `HR_Summit_Feedback_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Excel Export Error:", err);
    alert("Export to Excel failed. See logs.");
  }
}

async function exportToPdf() {
  const data = await Database.getAll();
  if (data.length === 0) {
    alert("No records recorded to generate report.");
    return;
  }

  // Trigger print view which is styled for PDF output
  window.print();
}

// Expose functions globally for modular scope access
window.exportToExcel = exportToExcel;
