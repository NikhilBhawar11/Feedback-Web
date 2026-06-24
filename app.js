import {
    db,
    ref,
    push,
    set,
    get,
    child
} 
from "./firebase.js";
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
    AppStore.state.formStep = step;
    
    // Update progress nodes
    document.querySelectorAll(".wizard-step-node").forEach((node, idx) => {
      const nodeStep = idx + 1;
      node.classList.remove("active", "completed");
      
      if (nodeStep === step) {
        node.classList.add("active");
      } else if (nodeStep < step) {
        node.classList.add("completed");
      }
    });

    // Update wizard progress bar fill
    const totalSteps = 6;
    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    const progressFill = document.querySelector(".progress-bar-fill");
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    // Update active step content panel
    document.querySelectorAll(".form-step-content").forEach((panel, idx) => {
      if (idx + 1 === step) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });

    // Update buttons visibilities
    const prevBtn = document.getElementById("form-prev-btn");
    const nextBtn = document.getElementById("form-next-btn");
    const submitBtn = document.getElementById("form-submit-btn");

    if (prevBtn) prevBtn.style.display = step === 1 ? "none" : "inline-flex";
    if (nextBtn) nextBtn.style.display = step === totalSteps ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = step === totalSteps ? "inline-flex" : "none";
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
    if (username === "admin" && password === "admin123") {
      AppStore.state.loggedIn = true;
      sessionStorage.setItem("hr_portal_admin_session", "true");
      document.getElementById("login-error").style.display = "none";
      AppStore.navigate("admin");
      return true;
    } else {
      document.getElementById("login-error").style.display = "block";
      document.getElementById("login-error").innerText = "Invalid credentials. Please use admin / admin123.";
      return false;
    }
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

  // Multi-step Form Wizard Nav Buttons
  const prevBtn = document.getElementById("form-prev-btn");
  const nextBtn = document.getElementById("form-next-btn");
  const submitBtn = document.getElementById("form-submit-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (AppStore.state.formStep > 1) {
        AppStore.setFormStep(AppStore.state.formStep - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (validateFormStep(AppStore.state.formStep)) {
        AppStore.setFormStep(AppStore.state.formStep + 1);
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (validateFormStep(AppStore.state.formStep)) {
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
function validateFormStep(step) {
  clearFormErrors();
  let isValid = true;

  if (step === 1) {
    // Validate HR personal information
    const requiredFields = [
      { id: "hr-name", name: "Full Name" },
      { id: "hr-designation", name: "Designation" },
      { id: "hr-company", name: "Company Name" },
      { id: "hr-domain", name: "Industry Domain" },
      { id: "hr-email", name: "Email Address" },
      { id: "hr-mobile", name: "Mobile Number" },
      { id: "hr-city", name: "City" }
    ];

    requiredFields.forEach(field => {
      const el = document.getElementById(field.id);
      if (!el || !el.value.trim()) {
        showInputError(el, `${field.name} is required.`);
        isValid = false;
      }
    });

    // Check email pattern
    const emailEl = document.getElementById("hr-email");
    if (emailEl && emailEl.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailEl.value.trim())) {
        showInputError(emailEl, "Please enter a valid email address.");
        isValid = false;
      }
    }

    // Check phone pattern
    const phoneEl = document.getElementById("hr-mobile");
    if (phoneEl && phoneEl.value.trim()) {
      const phonePattern = /^[0-9+() -]{10,15}$/;
      if (!phonePattern.test(phoneEl.value.trim())) {
        showInputError(phoneEl, "Please enter a valid phone number.");
        isValid = false;
      }
    }
  } else if (step === 2) {
    // Validate star ratings (Organization, Hospitality, etc. should have ratings check)
    const ratingCategories = ["organization", "hospitality", "studentInteraction", "technicalSessions", "venueArrangements"];
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
  } else if (step === 3) {
    // Expectations - ensure focus skills text area is filled
    const skillsText = document.getElementById("hr-focus-skills");
    if (skillsText && !skillsText.value.trim()) {
      showInputError(skillsText, "Please write down the top skills freshers should focus on.");
      isValid = false;
    }
  } else if (step === 4) {
    // Hiring Insights
    const hiresFreshers = document.querySelector("input[name='hires-freshers']:checked");
    if (!hiresFreshers) {
      showRadioError("hires-freshers", "Please select hiring status.");
      isValid = false;
    }
  } else if (step === 6) {
    // Final Collaboration
    const collab = document.querySelector("input[name='collab-interest']:checked");
    if (!collab) {
      showRadioError("collab-interest", "Please select your collaboration preference.");
      isValid = false;
    }
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
  
  // Section 1: HR Info
  const hrInfo = {
    fullName: document.getElementById("hr-name").value.trim(),
    designation: document.getElementById("hr-designation").value.trim(),
    companyName: document.getElementById("hr-company").value.trim(),
    industryDomain: document.getElementById("hr-domain").value,
    email: document.getElementById("hr-email").value.trim(),
    mobileNumber: document.getElementById("hr-mobile").value.trim(),
    linkedinProfile: document.getElementById("hr-linkedin").value.trim() || "Not provided",
    city: document.getElementById("hr-city").value.trim()
  };

  // Section 2: Ratings
  const eventFeedback = {
    organization: parseInt(document.querySelector("input[name='rate-organization']:checked").value),
    hospitality: parseInt(document.querySelector("input[name='rate-hospitality']:checked").value),
    studentInteraction: parseInt(document.querySelector("input[name='rate-studentInteraction']:checked").value),
    technicalSessions: parseInt(document.querySelector("input[name='rate-technicalSessions']:checked").value),
    venueArrangements: parseInt(document.querySelector("input[name='rate-venueArrangements']:checked").value),
    likedMost: document.getElementById("hr-liked-most").value.trim() || "N/A"
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
    topFocusSkills: document.getElementById("hr-focus-skills").value.trim()
  };

  // Section 4: Hiring Insights
  const rolesList = [];
  document.querySelectorAll("input[name='hiring-roles']:checked").forEach(chk => {
    rolesList.push(chk.value);
  });
  const customRole = document.getElementById("roles-other-val").value.trim();
  if (document.getElementById("roles-other").checked && customRole) {
    rolesList.push(customRole);
  }

  const hiringInsights = {
    hiresFreshers: document.querySelector("input[name='hires-freshers']:checked").value,
    hiringRoles: rolesList,
    salaryRange: document.getElementById("hr-salary-range").value,
    hiringPlansNextYear: document.getElementById("hr-hiring-plans").value.trim() || "N/A"
  };

  // Section 5: Curriculum
  const curriculumFeedback = {
    topicsToTeachMore: document.getElementById("hr-teach-more").value.trim() || "N/A",
    practicalExposureMissing: document.getElementById("hr-practical-missing").value.trim() || "N/A",
    curriculumImprovementSuggestions: document.getElementById("hr-curriculum-suggestions").value.trim() || "N/A"
  };

  // Section 6: Suggestions & Collab
  const collabInterestList = [];
  document.querySelectorAll("input[name='collab-topics']:checked").forEach(chk => {
    collabInterestList.push(chk.value);
  });

  const finalSuggestions = {
    generalSuggestions: document.getElementById("hr-general-suggestions").value.trim() || "N/A",
    futureCollaboration: document.querySelector("input[name='collab-interest']:checked").value,
    collaborationInterests: collabInterestList
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
    const companySet = new Set();
    let internshipOpportunities = 0;
    let hiringCount = 0;
    let collabInterestCount = 0;

    data.forEach(r => {
      // Event Ratings
      const ratings = r.eventFeedback;
      if (ratings) {
        totalScoreSum += (ratings.organization + ratings.hospitality + ratings.studentInteraction + ratings.technicalSessions + ratings.venueArrangements);
        ratingCount += 5;
      }

      // Unique Company
      if (r.hrInfo && r.hrInfo.companyName) {
        companySet.add(r.hrInfo.companyName.trim().toLowerCase());
      }

      // Hiring status
      if (r.hiringInsights) {
        if (r.hiringInsights.hiresFreshers === "Yes" || r.hiringInsights.hiresFreshers === "Occasionally") {
          hiringCount++;
        }
        if (r.hiringInsights.hiringRoles && r.hiringInsights.hiringRoles.includes("Internships")) {
          internshipOpportunities++;
        }
      }

      // Collaboration Interest
      if (r.finalSuggestions && (r.finalSuggestions.futureCollaboration === "Yes" || r.finalSuggestions.futureCollaboration === "Maybe")) {
        collabInterestCount++;
      }
    });

    const avgRating = ratingCount > 0 ? (totalScoreSum / ratingCount).toFixed(1) : "0.0";
    const totalCompanies = companySet.size;

    // Push into DOM
    document.getElementById("kpi-responses").innerText = totalResponses;
    document.getElementById("kpi-rating").innerText = avgRating;
    document.getElementById("kpi-companies").innerText = totalCompanies;
    document.getElementById("kpi-internships").innerText = internshipOpportunities;
    document.getElementById("kpi-hiring").innerText = hiringCount;
    document.getElementById("kpi-collab").innerText = collabInterestCount;

    // Renders mini list of recent responses
    const listBody = document.getElementById("dash-recent-list");
    if (listBody) {
      listBody.innerHTML = "";
      if (data.length === 0) {
        listBody.innerHTML = `<div class="text-muted p-3 text-center">No feedback responses recorded yet.</div>`;
      } else {
        // Take top 4 recent
        data.slice(0, 4).forEach(r => {
          const ratingVal = r.eventFeedback ? ((r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + r.eventFeedback.technicalSessions + r.eventFeedback.venueArrangements) / 5).toFixed(1) : "N/A";
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
              <div style="font-size: 0.8rem; color: var(--text-muted);">${r.hrInfo.designation} at <span style="font-weight: 600;">${r.hrInfo.companyName}</span></div>
            </div>
            <div style="text-align: right;">
              <span class="badge badge-info">${r.hrInfo.industryDomain}</span>
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
      const avgScore = ((r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + r.eventFeedback.technicalSessions + r.eventFeedback.venueArrangements) / 5).toFixed(1);
      const card = document.createElement("div");
      card.className = "record-card glass-card";
      
      // Skills markup
      const skillsMarkup = r.industryExpectations.demandedSkills.map(s => `<span class="tag-item">${s}</span>`).join("");
      // Roles markup
      const rolesMarkup = r.hiringInsights.hiringRoles.length > 0 ? r.hiringInsights.hiringRoles.map(rl => `<span class="tag-item">${rl}</span>`).join("") : `<span class="text-muted" style="font-size: 0.8rem;">None specified</span>`;

      card.innerHTML = `
        <div class="record-header">
          <div class="record-meta">
            <h4>${r.hrInfo.fullName} <span style="font-weight: normal; color: var(--text-muted); font-size:0.9rem;">(${r.hrInfo.designation})</span></h4>
            <p><strong>${r.hrInfo.companyName}</strong> (${r.hrInfo.industryDomain}) • ${r.hrInfo.city}</p>
            <p style="font-size:0.75rem; margin-top: 4px;">Submitted: ${new Date(r.timestamp).toLocaleString()}</p>
          </div>
          <div style="text-align: right;">
            <div class="record-stars" title="Average Event Score: ${avgScore}">
              ★ ${avgScore} / 5.0
            </div>
            <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">
              Collab interest: <span class="badge ${r.finalSuggestions.futureCollaboration === 'Yes' ? 'badge-success' : r.finalSuggestions.futureCollaboration === 'Maybe' ? 'badge-warning' : 'badge-danger'}">${r.finalSuggestions.futureCollaboration}</span>
            </div>
          </div>
        </div>
        <div class="record-body">
          <div class="record-column">
            <h5>Event Feedbacks</h5>
            <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px; color: var(--text-muted);">
              <div>Org: <strong>${r.eventFeedback.organization}/5</strong></div>
              <div>Hosp: <strong>${r.eventFeedback.hospitality}/5</strong></div>
              <div>Student Int: <strong>${r.eventFeedback.studentInteraction}/5</strong></div>
              <div>Sessions: <strong>${r.eventFeedback.technicalSessions}/5</strong></div>
              <div>Venue: <strong>${r.eventFeedback.venueArrangements}/5</strong></div>
            </div>
            <p style="font-size: 0.85rem; margin-top: 8px; font-style: italic;">"Liking: ${r.eventFeedback.likedMost}"</p>
          </div>
          <div class="record-column">
            <h5>Industry Skills Demand</h5>
            <div class="tag-list" style="margin-bottom: 8px;">
              ${skillsMarkup || '<span class="text-muted" style="font-size: 0.8rem;">None selected</span>'}
            </div>
            <h5>Hiring Roles</h5>
            <div class="tag-list">
              ${rolesMarkup}
            </div>
          </div>
          <div class="record-column">
            <h5>Key Suggestions</h5>
            <p style="font-size:0.85rem; margin-bottom:6px;"><strong>Practical Gaps:</strong> ${r.curriculumFeedback.practicalExposureMissing}</p>
            <p style="font-size:0.85rem; margin-bottom:6px;"><strong>Curriculum Needs:</strong> ${r.curriculumFeedback.topicsToTeachMore}</p>
            <p style="font-size:0.85rem;"><strong>General:</strong> ${r.finalSuggestions.generalSuggestions}</p>
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
    const domainFilter = document.getElementById("dir-filter-domain");
    const hiringFilter = document.getElementById("dir-filter-hiring");
    const salaryFilter = document.getElementById("dir-filter-salary");

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

    const filters = [
      { el: domainFilter, key: "domain" },
      { el: hiringFilter, key: "hiring" },
      { el: salaryFilter, key: "salary" }
    ];

    filters.forEach(f => {
      if (f.el) {
        f.el.value = AppStore.state.filters[f.key];
        const newEl = f.el.cloneNode(true);
        f.el.parentNode.replaceChild(newEl, f.el);
        newEl.addEventListener("change", (e) => {
          AppStore.state.filters[f.key] = e.target.value;
          AppStore.state.pagination.currentPage = 1;
          DirectoryTab.renderTable();
        });
      }
    });

    DirectoryTab.renderTable();
  },

  renderTable: async() => {
    const data = await Database.getAll();
    const tableBody = document.getElementById("directory-table-body");
    if (!tableBody) return;

    // Filter Logic
    const search = AppStore.state.filters.search.toLowerCase().trim();
    const domain = AppStore.state.filters.domain;
    const hiring = AppStore.state.filters.hiring;
    const salary = AppStore.state.filters.salary;

    const filteredData = data.filter(r => {
      // Search
      const searchMatch = !search || 
        r.hrInfo.fullName.toLowerCase().includes(search) ||
        r.hrInfo.companyName.toLowerCase().includes(search) ||
        r.hrInfo.designation.toLowerCase().includes(search) ||
        r.hrInfo.email.toLowerCase().includes(search);

      // Domain
      const domainMatch = !domain || r.hrInfo.industryDomain === domain;

      // Hiring status
      const hiringMatch = !hiring || r.hiringInsights.hiresFreshers === hiring;

      // Salary Range
      const salaryMatch = !salary || r.hiringInsights.salaryRange === salary;

      return searchMatch && domainMatch && hiringMatch && salaryMatch;
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
      tableBody.innerHTML = `<tr><td colspan="7" class="text-muted text-center p-4">No matching records found.</td></tr>`;
    } else {
      paginatedData.forEach(r => {
        const row = document.createElement("tr");
        const badgeClass = r.hiringInsights.hiresFreshers === "Yes" ? "badge-success" : r.hiringInsights.hiresFreshers === "Occasionally" ? "badge-warning" : "badge-danger";
        
        row.innerHTML = `
          <td class="hr-name-col">${r.hrInfo.fullName}</td>
          <td class="hr-company-col">
            <div style="font-weight: 700;">${r.hrInfo.companyName}</div>
            <div style="font-size: 0.8rem; color: var(--text-light);">${r.hrInfo.industryDomain}</div>
          </td>
          <td>${r.hrInfo.designation}</td>
          <td>
            <div style="font-size:0.85rem;">${r.hrInfo.email}</div>
            <div style="font-size:0.8rem; color: var(--text-muted);">${r.hrInfo.mobileNumber}</div>
          </td>
          <td>${r.hrInfo.city}</td>
          <td>
            <a href="${r.hrInfo.linkedinProfile}" target="_blank" class="social-link" title="LinkedIn Profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
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

/* --- ADMIN TAB 4: VISUAL CHARTS & ANALYTICS --- */
const AnalyticsTab = {
  charts: {},

  init: () => {
    AnalyticsTab.renderCharts();
  },

  renderCharts: async() => {
    const data = await Database.getAll();
    if (data.length === 0) return;

    // Common Chart Options
    const isDark = document.documentElement.classList.contains("dark");
    const gridColor = isDark ? "#334155" : "#e2e8f0";
    const labelColor = isDark ? "#94a3b8" : "#64748b";
    
    // Destroy existing charts to prevent canvas ghost rendering
    Object.keys(AnalyticsTab.charts).forEach(key => {
      if (AnalyticsTab.charts[key]) {
        AnalyticsTab.charts[key].destroy();
      }
    });

    // 1. Chart 1: Average Event Ratings
    let ratingsSum = { org: 0, hosp: 0, interaction: 0, sessions: 0, venue: 0 };
    data.forEach(r => {
      ratingsSum.org += r.eventFeedback.organization;
      ratingsSum.hosp += r.eventFeedback.hospitality;
      ratingsSum.interaction += r.eventFeedback.studentInteraction;
      ratingsSum.sessions += r.eventFeedback.technicalSessions;
      ratingsSum.venue += r.eventFeedback.venueArrangements;
    });
    
    const count = data.length;
    const avgRatings = [
      (ratingsSum.org / count).toFixed(1),
      (ratingsSum.hosp / count).toFixed(1),
      (ratingsSum.interaction / count).toFixed(1),
      (ratingsSum.sessions / count).toFixed(1),
      (ratingsSum.venue / count).toFixed(1)
    ];

    const ctxRatings = document.getElementById("chart-event-ratings").getContext("2d");
    AnalyticsTab.charts.ratings = new Chart(ctxRatings, {
      type: 'bar',
      data: {
        labels: ['Organization', 'Hospitality', 'Student Interaction', 'Technical Sessions', 'Venue arrangements'],
        datasets: [{
          label: 'Average Score (out of 5)',
          data: avgRatings,
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: '#2563eb',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 5,
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          x: {
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });

    // 2. Chart 2: Most Demanded Skills
    const skillCounts = {};
    data.forEach(r => {
      r.industryExpectations.demandedSkills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Sort skills by demand
    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // top 10

    const ctxSkills = document.getElementById("chart-demanded-skills").getContext("2d");
    AnalyticsTab.charts.skills = new Chart(ctxSkills, {
      type: 'bar',
      data: {
        labels: sortedSkills.map(s => s[0]),
        datasets: [{
          label: 'HR Vote Count',
          data: sortedSkills.map(s => s[1]),
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: labelColor, stepSize: 1 }
          },
          y: {
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });

    // 3. Chart 3: Hiring Interest
    const hiringStats = { Yes: 0, Occasionally: 0, No: 0 };
    data.forEach(r => {
      const hires = r.hiringInsights.hiresFreshers;
      if (hiringStats[hires] !== undefined) {
        hiringStats[hires]++;
      }
    });

    const ctxHiring = document.getElementById("chart-hiring-interest").getContext("2d");
    AnalyticsTab.charts.hiring = new Chart(ctxHiring, {
      type: 'doughnut',
      data: {
        labels: ['Yes', 'Occasionally', 'No'],
        datasets: [{
          data: [hiringStats.Yes, hiringStats.Occasionally, hiringStats.No],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor }
          }
        }
      }
    });

    // 4. Chart 4: Salary Expectations
    const salaryCounts = {
      'Less than 3 LPA': 0,
      '3-5 LPA': 0,
      '5-8 LPA': 0,
      '8-12 LPA': 0,
      'Above 12 LPA': 0
    };
    data.forEach(r => {
      const sal = r.hiringInsights.salaryRange;
      if (salaryCounts[sal] !== undefined) {
        salaryCounts[sal]++;
      }
    });

    const ctxSalary = document.getElementById("chart-salary-expectations").getContext("2d");
    AnalyticsTab.charts.salary = new Chart(ctxSalary, {
      type: 'bar',
      data: {
        labels: Object.keys(salaryCounts),
        datasets: [{
          label: 'Company Count',
          data: Object.values(salaryCounts),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: gridColor },
            ticks: { color: labelColor, stepSize: 1 }
          },
          x: {
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });

    // 5. Chart 5: Collaboration Interests
    const collabCounts = {};
    data.forEach(r => {
      if (r.finalSuggestions && r.finalSuggestions.collaborationInterests) {
        r.finalSuggestions.collaborationInterests.forEach(collab => {
          collabCounts[collab] = (collabCounts[collab] || 0) + 1;
        });
      }
    });

    const sortedCollabs = Object.entries(collabCounts).sort((a, b) => b[1] - a[1]);

    const ctxCollab = document.getElementById("chart-collab-interests").getContext("2d");
    AnalyticsTab.charts.collab = new Chart(ctxCollab, {
      type: 'polarArea',
      data: {
        labels: sortedCollabs.map(c => c[0]),
        datasets: [{
          data: sortedCollabs.map(c => c[1]),
          backgroundColor: [
            'rgba(37, 99, 235, 0.65)',
            'rgba(16, 185, 129, 0.65)',
            'rgba(245, 158, 11, 0.65)',
            'rgba(239, 68, 68, 0.65)',
            'rgba(139, 92, 246, 0.65)',
            'rgba(236, 72, 153, 0.65)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor }
          }
        },
        scales: {
          r: {
            grid: { color: gridColor },
            ticks: { color: labelColor, backdropColor: 'transparent' }
          }
        }
      }
    });

    // 6. Styled Word Cloud Component Rendering (HTML-based Word Cloud for best alignment)
    AnalyticsTab.renderWordCloud(data);
  },

  renderWordCloud: (data) => {
    const cloudHolder = document.getElementById("word-cloud-words");
    if (!cloudHolder) return;

    // Process comments to get repeating skill gaps and keywords
    const keywordCounts = {};
    const blacklist = ["and", "the", "for", "should", "with", "colleges", "that", "about", "practical", "exposure", "missing", "students", "more", "skills", "topics", "teach", "general", "suggestions", "great", "organized", "excellent"];
    
    data.forEach(r => {
      // Analyze text inputs from curriculum feedback
      const text = `${r.curriculumFeedback.topicsToTeachMore} ${r.curriculumFeedback.practicalExposureMissing}`.toLowerCase();
      const words = text.match(/\b[a-zA-Z]{3,}\b/g) || [];
      words.forEach(w => {
        if (!blacklist.includes(w)) {
          keywordCounts[w] = (keywordCounts[w] || 0) + 1;
        }
      });
    });

    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Top 15 keywords

    cloudHolder.innerHTML = "";
    if (sortedKeywords.length === 0) {
      cloudHolder.innerHTML = `<span class="text-muted">Not enough textual suggestions to compile gaps cloud.</span>`;
      return;
    }

    // Colors list
    const colors = ["#1e3a8a", "#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#ef4444"];

    sortedKeywords.forEach(([word, count]) => {
      const span = document.createElement("span");
      span.className = "cloud-word";
      span.innerText = word.toUpperCase();
      
      // Compute sizing based on count
      const minSize = 0.85;
      const maxSize = 2.0;
      const factor = count > 1 ? count : 1;
      const fontSize = Math.min(maxSize, minSize + (factor * 0.15));
      span.style.fontSize = `${fontSize}rem`;
      
      // Color
      const color = colors[Math.floor(Math.random() * colors.length)];
      span.style.color = color;
      
      span.title = `${count} occurrences in suggestions`;
      cloudHolder.appendChild(span);
    });
  }
};

/* --- ADMIN TAB 5: AI INSIGHTS GENERATOR MODULE --- */
const AiInsightsTab = {
  init: async () => {
    const data = await Database.getAll();
    if (data.length === 0) {
      document.getElementById("ai-insights-dashboard").innerHTML = `<div class="text-muted text-center p-5 glass-card col-span-2">No records recorded. Database is empty.</div>`;
      return;
    }

    // 1. Calculate stats and execute summary generator
    const totalResponses = data.length;

    // Find top industries
    const industryCounts = {};
    const skillCounts = {};
    const collaInterestSet = new Set();
    let hiresYes = 0;
    let hiresOcc = 0;
    let totalCollabCount = 0;

    data.forEach(r => {
      const ind = r.hrInfo.industryDomain;
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;

      r.industryExpectations.demandedSkills.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });

      if (r.hiringInsights.hiresFreshers === "Yes") hiresYes++;
      if (r.hiringInsights.hiresFreshers === "Occasionally") hiresOcc++;

      if (r.finalSuggestions.futureCollaboration === "Yes" || r.finalSuggestions.futureCollaboration === "Maybe") {
        totalCollabCount++;
      }
    });

    const topSkillsSorted = Object.entries(skillCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).map(item => item[0]);
    const topDomainsSorted = Object.entries(industryCounts).sort((a,b) => b[1]-a[1]).slice(0, 3).map(item => item[0]);

    // 2. Executive Summary Generator (Dynamically changes based on data inputs)
    const execSummaryEl = document.getElementById("ai-exec-summary");
    if (execSummaryEl) {
      let hiringOutlookText = "cautious";
      if (hiresYes / totalResponses > 0.6) {
        hiringOutlookText = "highly active and positive";
      } else if ((hiresYes + hiresOcc) / totalResponses > 0.5) {
        hiringOutlookText = "moderately active with occasional fresher hiring cycles";
      }

      execSummaryEl.innerHTML = `
        <p style="margin-bottom:12px;">Based on aggregate feedback from <strong>${totalResponses} HR participants</strong> across domains like <strong>${topDomainsSorted.join(", ")}</strong>, the portal has generated the following analysis:</p>
        <p style="margin-bottom:12px;">HR professionals emphasized a strong demand for <strong>${topSkillsSorted.join(", ")}</strong>. The hiring outlook is <strong>${hiringOutlookText}</strong>, indicating key alignment points for the curriculum team.</p>
        <p>A notable percentage (<strong>${((totalCollabCount/totalResponses)*100).toFixed(0)}%</strong>) of corporate delegates expressed firm interest in future collaborations like student internships, campus recruitments, and technical hackathons.</p>
      `;
    }

    // 3. Skill Gap Analysis
    const skillGapList = document.getElementById("ai-skill-gap-list");
    if (skillGapList) {
      // Gather missing practical concepts
      const practicalMissingList = data.map(r => r.curriculumFeedback.practicalExposureMissing).filter(t => t && t !== "N/A" && t.length > 5);
      const uniqueGaps = [...new Set(practicalMissingList)].slice(0, 3);
      
      skillGapList.innerHTML = "";
      const defaultGaps = [
        { title: "Production Deployment", desc: "Graduates are familiar with writing algorithms in sandboxed notebooks but lack experience hosting apps, API structures, or using Docker." },
        { title: "Version Control Workflows", desc: "Collaborative coding issues. Missing Git branching, merge resolution skills, and code review compliance." },
        { title: "Client Communication & Business Writing", desc: "Bridging technical answers to business expectations and writing polished client emails." }
      ];

      const displayGaps = uniqueGaps.length >= 2 
        ? uniqueGaps.map((text, i) => ({ title: `Industry Gap Theme ${i+1}`, desc: text }))
        : defaultGaps;

      displayGaps.forEach(gap => {
        const item = document.createElement("div");
        item.className = "ai-bullet-item";
        item.innerHTML = `
          <div class="ai-bullet-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="ai-bullet-content">
            <h5>${gap.title}</h5>
            <p>${gap.desc}</p>
          </div>
        `;
        skillGapList.appendChild(item);
      });
    }

    // 4. Curriculum Recommendations
    const recommendationsList = document.getElementById("ai-curriculum-list");
    if (recommendationsList) {
      const suggestionsTextList = data.map(r => r.curriculumFeedback.curriculumImprovementSuggestions).filter(t => t && t !== "N/A" && t.length > 5);
      const uniqueSuggs = [...new Set(suggestionsTextList)].slice(0, 3);

      recommendationsList.innerHTML = "";
      const defaultRecs = [
        { title: "Incorporate Git & Github Practices", desc: "Introduce Github pull request assignments for 2nd and 3rd-year projects to replicate professional engineering teamwork." },
        { title: "Mandatory Cloud Architectures Elective", desc: "Deliver hands-on cloud credits (AWS Practitioner or GCP Cloud Engineer) to equip developers for modern remote stacks." },
        { title: "Agile Project Cycles Case Studies", desc: "Ensure final year capstones follow basic Agile boards, Jira ticket logs, and sprints." }
      ];

      const displayRecs = uniqueSuggs.length >= 2
        ? uniqueSuggs.map((text, i) => ({ title: `Action Item ${i+1}`, desc: text }))
        : defaultRecs;

      displayRecs.forEach(rec => {
        const item = document.createElement("div");
        item.className = "ai-bullet-item";
        item.innerHTML = `
          <div class="ai-bullet-icon" style="color: var(--success);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="ai-bullet-content">
            <h5>${rec.title}</h5>
            <p>${rec.desc}</p>
          </div>
        `;
        recommendationsList.appendChild(item);
      });
    }

    // 5. Placement Readiness Score Calculation
    // Score components: 
    // - Event rating (average out of 5 stars) - weighs 20%
    // - Hiring Outlook rate (Yes weight 100, Occ 50, No 0) - weighs 40%
    // - Collaboration interests rate (Yes weight 100, Maybe 50, No 0) - weighs 40%
    let totalEventRatingSum = 0;
    let hiringScoreSum = 0;
    let collabScoreSum = 0;

    data.forEach(r => {
      const avgRate = (r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + r.eventFeedback.technicalSessions + r.eventFeedback.venueArrangements) / 5;
      totalEventRatingSum += avgRate;

      const hires = r.hiringInsights.hiresFreshers;
      hiringScoreSum += (hires === "Yes" ? 100 : hires === "Occasionally" ? 60 : 20);

      const col = r.finalSuggestions.futureCollaboration;
      collabScoreSum += (col === "Yes" ? 100 : col === "Maybe" ? 50 : 0);
    });

    const avgEventRating = totalEventRatingSum / totalResponses; // out of 5
    const avgHiringScore = hiringScoreSum / totalResponses; // out of 100
    const avgCollabScore = collabScoreSum / totalResponses; // out of 100

    const readinessScore = Math.round(
      (avgEventRating * 20) + // max score 20
      (avgHiringScore * 0.4) + // max score 40
      (avgCollabScore * 0.4)   // max score 40
    );

    // Interpretations
    let interp = "Needs Alignment";
    let interpDesc = "Curriculum should align with requested frameworks immediately.";
    if (readinessScore >= 80) {
      interp = "Highly Aligned";
      interpDesc = "Graduates closely match current hiring demands and standards.";
    } else if (readinessScore >= 60) {
      interp = "Moderately Aligned";
      interpDesc = "Opportunities exist to bridge key skill gaps in AI and cloud practices.";
    }

    document.getElementById("ai-readiness-interpretation").innerText = interp;
    document.getElementById("ai-readiness-interpretation-desc").innerText = interpDesc;

    // Animate SVG Gauge
    const gaugeFill = document.querySelector(".gauge-fill");
    const gaugeVal = document.getElementById("ai-readiness-score-val");
    if (gaugeFill && gaugeVal) {
      // Circumference is 2 * PI * r = 2 * 3.1415 * 60 = 377
      const circumference = 377;
      const offset = circumference - (readinessScore / 100) * circumference;
      
      // Trigger SVG redraw transition
      setTimeout(() => {
        gaugeFill.style.strokeDashoffset = offset;
        gaugeVal.innerText = readinessScore;
      }, 100);
    }
  }
};

/* --- ADMIN TAB 6: REPORTS & EXPORTS --- */
const ReportsTab = {
  init: () => {
    const dlPdf = document.getElementById("report-dl-pdf");
    const dlExcel = document.getElementById("report-dl-excel");
    const dlSummary = document.getElementById("report-dl-summary");

    if (dlExcel) {
      const newDlExcel = dlExcel.cloneNode(true);
      dlExcel.parentNode.replaceChild(newDlExcel, dlExcel);
      newDlExcel.addEventListener("click", () => exportToExcel());
    }

    if (dlPdf) {
      const newDlPdf = dlPdf.cloneNode(true);
      dlPdf.parentNode.replaceChild(newDlPdf, dlPdf);
      newDlPdf.addEventListener("click", () => exportToPdf());
    }

    if (dlSummary) {
      const newDlSummary = dlSummary.cloneNode(true);
      dlSummary.parentNode.replaceChild(newDlSummary, dlSummary);
      newDlSummary.addEventListener("click", () => {
        // Trigger dashboard print or print dialog
        window.print();
      });
    }
  }
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
        a.download = `hr_insight_db_backup_${new Date().toISOString().slice(0,10)}.json`;
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
    "Date Submitted": new Date(r.timestamp).toLocaleString(),
    "Full Name": r.hrInfo.fullName,
    "Designation": r.hrInfo.designation,
    "Company Name": r.hrInfo.companyName,
    "Industry Domain": r.hrInfo.industryDomain,
    "Email": r.hrInfo.email,
    "Mobile Number": r.hrInfo.mobileNumber,
    "City": r.hrInfo.city,
    "LinkedIn Profile": r.hrInfo.linkedinProfile,
    
    // Ratings
    "Organization Rating": r.eventFeedback.organization,
    "Hospitality Rating": r.eventFeedback.hospitality,
    "Student Interaction Rating": r.eventFeedback.studentInteraction,
    "Technical Sessions Rating": r.eventFeedback.technicalSessions,
    "Venue Arrangements Rating": r.eventFeedback.venueArrangements,
    "Average Event Rating": ((r.eventFeedback.organization + r.eventFeedback.hospitality + r.eventFeedback.studentInteraction + r.eventFeedback.technicalSessions + r.eventFeedback.venueArrangements) / 5).toFixed(1),
    "Liked Most Comments": r.eventFeedback.likedMost,

    // Expectations
    "Demanded Skills List": r.industryExpectations.demandedSkills.join(", "),
    "Top Focus Areas": r.industryExpectations.topFocusSkills,

    // Hiring
    "Hires Freshers": r.hiringInsights.hiresFreshers,
    "Hiring Roles": r.hiringInsights.hiringRoles.join(", "),
    "Fresher Salary Range": r.hiringInsights.salaryRange,
    "Hiring Plans Next Year": r.hiringInsights.hiringPlansNextYear,

    // Curriculum
    "Topics to Teach More": r.curriculumFeedback.topicsToTeachMore,
    "Practical Gaps Identified": r.curriculumFeedback.practicalExposureMissing,
    "Curriculum Suggestions": r.curriculumFeedback.curriculumImprovementSuggestions,

    // Collab
    "Future Collaboration Interest": r.finalSuggestions.futureCollaboration,
    "Collaboration Topics Selected": r.finalSuggestions.collaborationInterests.join(", "),
    "General Suggestions": r.finalSuggestions.generalSuggestions
  }));

  try {
    if (typeof XLSX !== "undefined") {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "HR Feedbacks");
      XLSX.writeFile(workbook, `HR_Summit_Feedback_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    } else {
      // Fallback CSV download if XLSX CDN fails
      let csvContent = "data:text/csv;charset=utf-8,";
      const headers = Object.keys(excelData[0]).join(",");
      csvContent += headers + "\r\n";
      
      excelData.forEach(row => {
        const rowData = Object.values(row).map(val => {
          let str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
        csvContent += rowData + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const a = document.createElement("a");
      a.setAttribute("href", encodedUri);
      a.setAttribute("download", `HR_Summit_Feedback_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
