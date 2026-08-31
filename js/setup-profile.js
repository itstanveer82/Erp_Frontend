// ==============================================================
// SETUP PROFILE (Onboarding Step 2)
// All calls use onboardingApiRequest() (see onboarding-session.js),
// authenticating with the onboarding token, not a normal login.
//
// Endpoints used (all via API gateway -> user-management-service):
//   GET/PUT /api/profiles/me                (singleton)
//   GET/PUT /api/bank-information/me        (singleton)
//   GET/POST/DELETE /api/emergency-contacts/me[/{id}]
//   GET/POST/DELETE /api/family-members/me[/{id}]
//   GET/POST/DELETE /api/education-details/me[/{id}]
//   GET/POST/DELETE /api/experience-details/me[/{id}]
//   GET/POST/DELETE /api/nominee-details/me[/{id}]
//   GET/POST/DELETE /api/employee-skills/me[/{id}]
// ==============================================================

const onboardingSession = requireOnboardingSession();

const sectionComplete = {
    personal: false,
    emergency: false,
    bank: false,
    family: false,
    education: false,
    experience: false,
    nominee: false,
    skills: false
};

function escapeHtmlOb(value) {
    if (value === null || value === undefined) {
        return "";
    }
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

function showSectionMessage(containerId, type, text) {
    const el = document.getElementById(containerId);
    if (!el) {
        return;
    }
    el.innerHTML = `<div class="custom-alert ${type}">${escapeHtmlOb(text)}</div>`;
    if (type === "success") {
        setTimeout(function () {
            el.innerHTML = "";
        }, 2500);
    }
}

/** GET that treats a 404 (section not created yet) as "no data" rather than an error. */
async function safeGet(endpoint) {
    try {
        const response = await onboardingApiRequest(endpoint);
        return response.data;
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
}

function updateChecklist() {
    document.querySelectorAll("#onboardingChecklist li[data-section]").forEach(function (li) {
        const section = li.dataset.section;
        li.classList.toggle("done", !!sectionComplete[section]);
    });
}

// Keep the checklist's "active" highlight in sync with the visible tab.
document.querySelectorAll("#onboardTab .nav-link").forEach(function (tabButton) {
    tabButton.addEventListener("shown.bs.tab", function () {
        const section = tabButton.dataset.section;
        document.querySelectorAll("#onboardingChecklist li[data-section]").forEach(function (li) {
            li.classList.toggle("active", li.dataset.section === section);
        });
    });
});

// Clicking a checklist item jumps to that tab.
document.querySelectorAll("#onboardingChecklist li[data-section]").forEach(function (li) {
    li.addEventListener("click", function () {
        const section = li.dataset.section;
        const tabButton = document.querySelector(`#onboardTab [data-section="${section}"]`);
        if (tabButton) {
            new bootstrap.Tab(tabButton).show();
        }
    });
});

// ------------------------------
// 1. PERSONAL INFORMATION (singleton)
// ------------------------------
async function loadPersonal() {
    const profile = await safeGet("/api/profiles/me");
    if (profile) {
        document.getElementById("personalDob").value = profile.dateOfBirth || "";
        document.getElementById("personalGender").value = profile.gender || "";
        document.getElementById("personalMaritalStatus").value = profile.maritalStatus || "";
        document.getElementById("personalBloodGroup").value = profile.bloodGroup || "";
        document.getElementById("personalOccupation").value = profile.occupation || "";
        document.getElementById("personalNationality").value = profile.nationality || "";
        document.getElementById("personalBio").value = profile.bio || "";
        sectionComplete.personal = true;
    }
}

document.getElementById("personalForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
        const request = {
            dateOfBirth: document.getElementById("personalDob").value || null,
            gender: document.getElementById("personalGender").value || null,
            maritalStatus: document.getElementById("personalMaritalStatus").value || null,
            bio: document.getElementById("personalBio").value.trim() || null,
            occupation: document.getElementById("personalOccupation").value.trim() || null,
            nationality: document.getElementById("personalNationality").value.trim() || null,
            bloodGroup: document.getElementById("personalBloodGroup").value.trim() || null
        };
        await onboardingApiRequest("/api/profiles/me", {
            method: "PUT",
            body: JSON.stringify(request)
        });
        sectionComplete.personal = true;
        updateChecklist();
        showSectionMessage("personalMessage", "success", "Personal information saved.");
    } catch (error) {
        showSectionMessage("personalMessage", "error", error.responseData?.message || error.message || "Failed to save.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// ------------------------------
// 2. EMERGENCY CONTACTS (repeatable)
// ------------------------------
async function loadEmergencyContacts() {
    const list = await safeGet("/api/emergency-contacts/me");
    renderEmergencyContacts(Array.isArray(list) ? list : []);
}

function renderEmergencyContacts(items) {
    sectionComplete.emergency = items.length > 0;
    updateChecklist();
    const container = document.getElementById("emergencyList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No emergency contacts added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.name)}</strong> (${escapeHtmlOb(item.relationship)})<br>
                    ${escapeHtmlOb(item.phone)}${item.email ? " · " + escapeHtmlOb(item.email) : ""}
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm emergency-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("emergencyForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const request = {
            name: document.getElementById("emergencyName").value.trim(),
            relationship: document.getElementById("emergencyRelationship").value.trim(),
            phone: document.getElementById("emergencyPhone").value.trim(),
            email: document.getElementById("emergencyEmail").value.trim() || null,
            address: document.getElementById("emergencyAddress").value.trim() || null,
            priority: Number(document.getElementById("emergencyPriority").value) || 0
        };
        await onboardingApiRequest("/api/emergency-contacts/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        document.getElementById("emergencyPriority").value = 1;
        showSectionMessage("emergencyMessage", "success", "Emergency contact added.");
        await loadEmergencyContacts();
    } catch (error) {
        showSectionMessage("emergencyMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("emergencyList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".emergency-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/emergency-contacts/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadEmergencyContacts();
    } catch (error) {
        showSectionMessage("emergencyMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// 3. BANK INFORMATION (singleton)
// ------------------------------
async function loadBank() {
    const bank = await safeGet("/api/bank-information/me");
    if (bank) {
        document.getElementById("bankAccountHolderName").value = bank.accountHolderName || "";
        document.getElementById("bankName").value = bank.bankName || "";
        document.getElementById("bankAccountNumber").value = bank.accountNumber || "";
        document.getElementById("bankIfscCode").value = bank.ifscCode || "";
        document.getElementById("bankBranchName").value = bank.branchName || "";
        document.getElementById("bankAccountType").value = bank.accountType || "";
        sectionComplete.bank = true;
    }
}

document.getElementById("bankForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
        const request = {
            accountHolderName: document.getElementById("bankAccountHolderName").value.trim(),
            bankName: document.getElementById("bankName").value.trim(),
            accountNumber: document.getElementById("bankAccountNumber").value.trim(),
            ifscCode: document.getElementById("bankIfscCode").value.trim(),
            branchName: document.getElementById("bankBranchName").value.trim() || null,
            accountType: document.getElementById("bankAccountType").value.trim() || null
        };
        await onboardingApiRequest("/api/bank-information/me", {
            method: "PUT",
            body: JSON.stringify(request)
        });
        sectionComplete.bank = true;
        updateChecklist();
        showSectionMessage("bankMessage", "success", "Bank information saved.");
    } catch (error) {
        showSectionMessage("bankMessage", "error", error.responseData?.message || error.message || "Failed to save.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// ------------------------------
// 4. FAMILY MEMBERS (repeatable)
// ------------------------------
async function loadFamily() {
    const list = await safeGet("/api/family-members/me");
    renderFamily(Array.isArray(list) ? list : []);
}

function renderFamily(items) {
    sectionComplete.family = items.length > 0;
    updateChecklist();
    const container = document.getElementById("familyList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No family members added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.name)}</strong> (${escapeHtmlOb(item.relationship)})
                    ${item.dependent ? " · Dependent" : ""}
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm family-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("familyForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const request = {
            name: document.getElementById("familyName").value.trim(),
            relationship: document.getElementById("familyRelationship").value.trim(),
            dateOfBirth: document.getElementById("familyDob").value || null,
            occupation: document.getElementById("familyOccupation").value.trim() || null,
            phone: document.getElementById("familyPhone").value.trim() || null,
            dependent: document.getElementById("familyDependent").checked
        };
        await onboardingApiRequest("/api/family-members/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        showSectionMessage("familyMessage", "success", "Family member added.");
        await loadFamily();
    } catch (error) {
        showSectionMessage("familyMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("familyList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".family-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/family-members/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadFamily();
    } catch (error) {
        showSectionMessage("familyMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// 5. EDUCATION (repeatable)
// ------------------------------
async function loadEducation() {
    const list = await safeGet("/api/education-details/me");
    renderEducation(Array.isArray(list) ? list : []);
}

function renderEducation(items) {
    sectionComplete.education = items.length > 0;
    updateChecklist();
    const container = document.getElementById("educationList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No education details added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.degree)}</strong> - ${escapeHtmlOb(item.institution)}
                    (${escapeHtmlOb(item.yearOfPassing)})
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm education-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("educationForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const request = {
            degree: document.getElementById("educationDegree").value.trim(),
            institution: document.getElementById("educationInstitution").value.trim(),
            boardOrUniversity: document.getElementById("educationBoard").value.trim() || null,
            yearOfPassing: Number(document.getElementById("educationYear").value),
            percentageOrGrade: document.getElementById("educationGrade").value.trim() || null,
            specialization: document.getElementById("educationSpecialization").value.trim() || null
        };
        await onboardingApiRequest("/api/education-details/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        showSectionMessage("educationMessage", "success", "Education detail added.");
        await loadEducation();
    } catch (error) {
        showSectionMessage("educationMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("educationList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".education-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/education-details/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadEducation();
    } catch (error) {
        showSectionMessage("educationMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// 6. EXPERIENCE (repeatable)
// ------------------------------
document.getElementById("experienceCurrent").addEventListener("change", function () {
    const toDate = document.getElementById("experienceToDate");
    toDate.disabled = this.checked;
    if (this.checked) {
        toDate.value = "";
    }
});

async function loadExperience() {
    const list = await safeGet("/api/experience-details/me");
    renderExperience(Array.isArray(list) ? list : []);
}

function renderExperience(items) {
    sectionComplete.experience = items.length > 0;
    updateChecklist();
    const container = document.getElementById("experienceList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No experience details added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        const range = `${escapeHtmlOb(item.fromDate)} - ${item.current ? "Present" : escapeHtmlOb(item.toDate || "--")}`;
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.designation)}</strong> at ${escapeHtmlOb(item.companyName)}<br>
                    ${range}
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm experience-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("experienceForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const isCurrent = document.getElementById("experienceCurrent").checked;
        const request = {
            companyName: document.getElementById("experienceCompany").value.trim(),
            designation: document.getElementById("experienceDesignation").value.trim(),
            fromDate: document.getElementById("experienceFromDate").value,
            toDate: isCurrent ? null : (document.getElementById("experienceToDate").value || null),
            current: isCurrent,
            responsibilities: document.getElementById("experienceResponsibilities").value.trim() || null
        };
        await onboardingApiRequest("/api/experience-details/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        document.getElementById("experienceToDate").disabled = false;
        showSectionMessage("experienceMessage", "success", "Experience added.");
        await loadExperience();
    } catch (error) {
        showSectionMessage("experienceMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("experienceList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".experience-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/experience-details/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadExperience();
    } catch (error) {
        showSectionMessage("experienceMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// 7. NOMINEES (repeatable)
// ------------------------------
async function loadNominees() {
    const list = await safeGet("/api/nominee-details/me");
    renderNominees(Array.isArray(list) ? list : []);
}

function renderNominees(items) {
    sectionComplete.nominee = items.length > 0;
    updateChecklist();
    const container = document.getElementById("nomineeList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No nominees added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.name)}</strong> (${escapeHtmlOb(item.relationship)}) - ${escapeHtmlOb(item.sharePercentage)}%
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm nominee-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("nomineeForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const request = {
            name: document.getElementById("nomineeName").value.trim(),
            relationship: document.getElementById("nomineeRelationship").value.trim(),
            dateOfBirth: document.getElementById("nomineeDob").value || null,
            sharePercentage: Number(document.getElementById("nomineeShare").value),
            address: document.getElementById("nomineeAddress").value.trim() || null,
            minor: document.getElementById("nomineeMinor").checked,
            guardianName: document.getElementById("nomineeGuardianName").value.trim() || null
        };
        await onboardingApiRequest("/api/nominee-details/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        showSectionMessage("nomineeMessage", "success", "Nominee added.");
        await loadNominees();
    } catch (error) {
        showSectionMessage("nomineeMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("nomineeList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".nominee-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/nominee-details/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadNominees();
    } catch (error) {
        showSectionMessage("nomineeMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// 8. SKILLS (repeatable)
// ------------------------------
async function loadSkills() {
    const list = await safeGet("/api/employee-skills/me");
    renderSkills(Array.isArray(list) ? list : []);
}

function renderSkills(items) {
    sectionComplete.skills = items.length > 0;
    updateChecklist();
    const container = document.getElementById("skillsList");
    if (items.length === 0) {
        container.innerHTML = `<div class="entry-empty-state">No skills added yet.</div>`;
        return;
    }
    container.innerHTML = items.map(function (item) {
        return `
            <div class="entry-list-item">
                <div class="entry-details">
                    <strong>${escapeHtmlOb(item.skillName)}</strong>
                    ${item.proficiency ? " - " + escapeHtmlOb(item.proficiency) : ""}
                    ${item.certified ? " · Certified" : ""}
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm skill-delete-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
    }).join("");
}

document.getElementById("skillsForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    try {
        submitButton.disabled = true;
        submitButton.textContent = "Adding...";
        const request = {
            skillName: document.getElementById("skillName").value.trim(),
            proficiency: document.getElementById("skillProficiency").value || null,
            yearsOfExperience: document.getElementById("skillYears").value ? Number(document.getElementById("skillYears").value) : null,
            certified: document.getElementById("skillCertified").checked
        };
        await onboardingApiRequest("/api/employee-skills/me", {
            method: "POST",
            body: JSON.stringify(request)
        });
        event.target.reset();
        showSectionMessage("skillsMessage", "success", "Skill added.");
        await loadSkills();
    } catch (error) {
        showSectionMessage("skillsMessage", "error", error.responseData?.message || error.message || "Failed to add.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

document.getElementById("skillsList").addEventListener("click", async function (event) {
    const btn = event.target.closest(".skill-delete-btn");
    if (!btn) {
        return;
    }
    try {
        btn.disabled = true;
        await onboardingApiRequest(`/api/employee-skills/me/${btn.dataset.id}`, { method: "DELETE" });
        await loadSkills();
    } catch (error) {
        showSectionMessage("skillsMessage", "error", error.responseData?.message || error.message || "Failed to remove.");
        btn.disabled = false;
    }
});

// ------------------------------
// PAGE-LEVEL ACTIONS
// ------------------------------
document.getElementById("continueToPasswordButton").addEventListener("click", function () {
    window.location.href = "set-password.html";
});

document.getElementById("exitOnboardingButton").addEventListener("click", function () {
    if (confirm("Your saved sections are kept. You can resume by verifying your email again. Exit now?")) {
        window.location.href = "login.html";
    }
});

// ------------------------------
// INITIAL LOAD
// ------------------------------
(async function init() {
    try {
        await Promise.all([
            loadPersonal(),
            loadEmergencyContacts(),
            loadBank(),
            loadFamily(),
            loadEducation(),
            loadExperience(),
            loadNominees(),
            loadSkills()
        ]);
    } catch (error) {
        console.error("Failed to load existing onboarding data:", error);
    } finally {
        updateChecklist();
    }
})();
