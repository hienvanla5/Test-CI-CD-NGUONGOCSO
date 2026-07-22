import {
    requireAuth,
    setupLogout
} from "../../core/auth-guard.js";

import {
    getUser
} from "../../core/storage.js";

import {
    getMembers,
    getRoles,
    assignRole,
    addMember
} from "../../services/member.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
}

const roleCode = user.roleCode;

const allowedRoles = ["VT-01", "VT-02"];

if (!allowedRoles.includes(roleCode)) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("unauthorizedState").style.display = "flex";
    document.getElementById("mainContent").style.display = "none";
    throw new Error("Access denied: user does not have permission to manage organization members.");
}

// ---- State ----

let rolesCache = [];
let membersCache = [];
let selectedMemberForRole = null;

// ---- DOM references ----

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const unauthorizedState = document.getElementById("unauthorizedState");
const mainContent = document.getElementById("mainContent");
const emptyState = document.getElementById("emptyState");
const memberTable = document.getElementById("memberTable");
const memberTableBody = document.getElementById("memberTableBody");
const emptyAddMember = document.getElementById("emptyAddMember");
const addMemberButton = document.getElementById("addMemberButton");

// Add Member Modal
const addMemberModal = document.getElementById("addMemberModal");
const addMemberClose = document.getElementById("addMemberClose");
const addMemberCancel = document.getElementById("addMemberCancel");
const addMemberForm = document.getElementById("addMemberForm");
const addMemberSubmit = document.getElementById("addMemberSubmit");
const addMemberMessage = document.getElementById("addMemberMessage");
const memberRoleSelect = document.getElementById("memberRole");

// Assign Role Modal
const assignRoleModal = document.getElementById("assignRoleModal");
const assignRoleClose = document.getElementById("assignRoleClose");
const assignRoleCancel = document.getElementById("assignRoleCancel");
const assignRoleSave = document.getElementById("assignRoleSave");
const assignRoleSelect = document.getElementById("assignRoleSelect");
const assignRoleMessage = document.getElementById("assignRoleMessage");
const assignRoleError = document.getElementById("assignRoleError");
const assignMemberName = document.getElementById("assignMemberName");
const assignCurrentRole = document.getElementById("assignCurrentRole");

// ---- Load members ----

async function loadMembers() {
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    unauthorizedState.style.display = "none";
    mainContent.style.display = "none";

    try {
        const response = await getMembers();

        if (!response.success) {
            throw new Error(response.message || "Failed to load members.");
        }

        const members = response.data || [];
        membersCache = members;

        loadingState.style.display = "none";
        mainContent.style.display = "block";

        // Filter out system administrator accounts (VT-01)
        const visibleMembers = members.filter(function (member) {
            return member.roleCode !== "VT-01";
        });
        membersCache = visibleMembers;

        loadingState.style.display = "none";
        mainContent.style.display = "block";

        renderMembers(visibleMembers);

    } catch (error) {
        console.error("Load members error:", error);

        loadingState.style.display = "none";
        mainContent.style.display = "none";

        errorMessage.textContent = error.message || "An unexpected error occurred while loading members.";
        errorState.style.display = "flex";
    }
}

// ---- Render members ----

function renderMembers(members) {
    if (!members || members.length === 0) {
        memberTable.style.display = "none";
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";
    memberTable.style.display = "table";

    memberTableBody.innerHTML = "";

    members.forEach(function (member) {
        var row = document.createElement("tr");

        // Username
        var usernameCell = document.createElement("td");
        usernameCell.setAttribute("data-label", "Username");
        usernameCell.textContent = member.username || "—";
        row.appendChild(usernameCell);

        // Full Name
        var nameCell = document.createElement("td");
        nameCell.setAttribute("data-label", "Full Name");
        nameCell.textContent = member.fullName || "—";
        row.appendChild(nameCell);

        // Email
        var emailCell = document.createElement("td");
        emailCell.setAttribute("data-label", "Email");
        emailCell.textContent = member.email || "—";
        row.appendChild(emailCell);

        // Phone
        var phoneCell = document.createElement("td");
        phoneCell.setAttribute("data-label", "Phone");
        phoneCell.textContent = member.phone || "—";
        row.appendChild(phoneCell);

        // Role
        var roleCell = document.createElement("td");
        roleCell.setAttribute("data-label", "Role");

        var roleBadge = document.createElement("span");
        roleBadge.className = "role-badge";
        roleBadge.textContent = member.roleName || member.roleCode || "—";
        roleCell.appendChild(roleBadge);
        row.appendChild(roleCell);

        // Status
        var statusCell = document.createElement("td");
        statusCell.setAttribute("data-label", "Status");

        var statusBadge = document.createElement("span");
        statusBadge.className = "status-badge";
        var status = member.status || "";

        if (status === "ACTIVE") {
            statusBadge.classList.add("status-badge-active");
            statusBadge.textContent = "Active";
        } else if (status === "INACTIVE") {
            statusBadge.classList.add("status-badge-inactive");
            statusBadge.textContent = "Inactive";
        } else {
            statusBadge.textContent = status || "—";
        }

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Actions
        var actionsCell = document.createElement("td");
        actionsCell.setAttribute("data-label", "Actions");

        var changeRoleBtn = document.createElement("button");
        changeRoleBtn.className = "btn-action";
        changeRoleBtn.textContent = "Change Role";
        changeRoleBtn.dataset.userId = member.userId;
        changeRoleBtn.dataset.memberId = member.id;

        changeRoleBtn.addEventListener("click", function () {
            openAssignRoleModal(member);
        });

        actionsCell.appendChild(changeRoleBtn);
        row.appendChild(actionsCell);

        memberTableBody.appendChild(row);
    });
}

// ---- Load roles ----

async function loadRoles() {
    try {
        const response = await getRoles();

        if (response.success !== false && Array.isArray(response)) {
            // Roles are returned directly as an array (not wrapped in ApiResult)
            rolesCache = response;
        } else if (response.success && response.data) {
            rolesCache = response.data;
        } else {
            console.warn("Unexpected roles response format:", response);
            rolesCache = [];
        }

        populateRoleSelects();

    } catch (error) {
        console.error("Load roles error:", error);
        rolesCache = [];
    }
}

function populateRoleSelects() {
    // Filter out VT-01 role - not assignable to regular members
    var assignableRoles = rolesCache.filter(function (role) {
        return role.code !== "VT-01";
    });

    // Populate assign role modal select
    assignRoleSelect.innerHTML = '<option value="">Select a role</option>';
    assignableRoles.forEach(function (role) {
        var option = document.createElement("option");
        option.value = role.roleId;
        option.textContent = role.name + " (" + role.code + ")";
        assignRoleSelect.appendChild(option);
    });

    // Populate add member modal select
    memberRoleSelect.innerHTML = '<option value="">Select a role</option>';
    assignableRoles.forEach(function (role) {
        var option = document.createElement("option");
        option.value = role.roleId;
        option.textContent = role.name + " (" + role.code + ")";
        memberRoleSelect.appendChild(option);
    });
}

// ---- Assign Role Modal ----

function openAssignRoleModal(member) {
    selectedMemberForRole = member;
    assignMemberName.textContent = member.fullName || member.username || "—";
    assignCurrentRole.textContent = member.roleName || member.roleCode || "—";

    assignRoleSelect.value = "";
    assignRoleError.textContent = "";
    assignRoleMessage.textContent = "";
    assignRoleMessage.className = "form-message";
    assignRoleSave.disabled = false;
    assignRoleSave.textContent = "Save Role";

    assignRoleModal.style.display = "flex";
}

function closeAssignRoleModal() {
    assignRoleModal.style.display = "none";
    selectedMemberForRole = null;
}

assignRoleClose.addEventListener("click", closeAssignRoleModal);
assignRoleCancel.addEventListener("click", closeAssignRoleModal);

assignRoleModal.addEventListener("click", function (event) {
    if (event.target === assignRoleModal) {
        closeAssignRoleModal();
    }
});

assignRoleSave.addEventListener("click", async function () {
    var roleId = assignRoleSelect.value;

    if (!roleId || !selectedMemberForRole) {
        assignRoleError.textContent = "Please select a role.";
        return;
    }

    assignRoleError.textContent = "";
    assignRoleSave.disabled = true;
    assignRoleSave.textContent = "Saving...";

    try {
        var request = {
            userId: selectedMemberForRole.userId,
            roleId: Number(roleId)
        };

        var response = await assignRole(request);

        if (!response.success) {
            throw new Error(response.message || "Failed to assign role.");
        }

        assignRoleMessage.textContent = "Role assigned successfully.";
        assignRoleMessage.className = "form-message success";

        // Update the member in our local cache
        if (response.data) {
            var updatedMember = response.data;
            var index = membersCache.findIndex(function (m) {
                return m.id === updatedMember.id || m.userId === updatedMember.userId;
            });

            if (index !== -1) {
                membersCache[index] = updatedMember;
            }
        }

        // Refresh the table
        renderMembers(membersCache);

        setTimeout(closeAssignRoleModal, 1000);

    } catch (error) {
        console.error("Assign role error:", error);
        assignRoleMessage.textContent = error.message || "Failed to assign role.";
        assignRoleMessage.className = "form-message error";
        assignRoleSave.disabled = false;
        assignRoleSave.textContent = "Save Role";
    }
});

// ---- Add Member Modal ----

function openAddMemberModal() {
    addMemberForm.reset();
    addMemberMessage.textContent = "";
    addMemberMessage.className = "form-message";
    addMemberSubmit.disabled = false;
    addMemberSubmit.textContent = "Create Member";

    // Clear field errors
    var errorElements = addMemberForm.querySelectorAll(".field-error");
    errorElements.forEach(function (el) {
        el.textContent = "";
    });
    var errorInputs = addMemberForm.querySelectorAll(".input-error");
    errorInputs.forEach(function (input) {
        input.classList.remove("input-error");
        input.setAttribute("aria-invalid", "false");
    });

    addMemberModal.style.display = "flex";
}

function closeAddMemberModal() {
    addMemberModal.style.display = "none";
}

addMemberButton.addEventListener("click", openAddMemberModal);
emptyAddMember.addEventListener("click", openAddMemberModal);
addMemberClose.addEventListener("click", closeAddMemberModal);
addMemberCancel.addEventListener("click", closeAddMemberModal);

addMemberModal.addEventListener("click", function (event) {
    if (event.target === addMemberModal) {
        closeAddMemberModal();
    }
});

addMemberForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    addMemberMessage.textContent = "";
    addMemberMessage.className = "form-message";

    // Clear previous field errors
    var errorElements = addMemberForm.querySelectorAll(".field-error");
    errorElements.forEach(function (el) {
        el.textContent = "";
    });
    var errorInputs = addMemberForm.querySelectorAll(".input-error");
    errorInputs.forEach(function (input) {
        input.classList.remove("input-error");
        input.setAttribute("aria-invalid", "false");
    });

    var formData = new FormData(addMemberForm);

    var username = getFormValue(formData, "username");
    var password = formData.get("password");
    var fullName = getFormValue(formData, "fullName");
    var phone = getFormValue(formData, "phone");
    var email = getFormValue(formData, "email");
    var roleId = formData.get("roleId");

    // Validate
    var errors = {};

    if (!username) {
        errors.username = "Username is required.";
    }

    if (!password) {
        errors.password = "Password is required.";
    }

    if (!fullName) {
        errors.fullName = "Full name is required.";
    }

    if (!roleId) {
        errors.roleId = "Role is required.";
    }

    if (email && !isValidEmail(email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
        showAddMemberFieldErrors(errors);
        return;
    }

    addMemberSubmit.disabled = true;
    addMemberSubmit.textContent = "Creating...";

    try {
        var request = {
            username: username,
            password: password,
            fullName: fullName,
            phone: phone || undefined,
            email: email || undefined,
            roleId: Number(roleId)
        };

        var response = await addMember(request);

        if (!response.success) {
            throw new Error(response.message || "Failed to create member.");
        }

        addMemberMessage.textContent = "Member created successfully.";
        addMemberMessage.className = "form-message success";

        // Reload members
        await loadMembers();

        setTimeout(closeAddMemberModal, 1000);

    } catch (error) {
        console.error("Add member error:", error);

        var message = error.message || "An unexpected error occurred.";

        // Map backend error messages to fields
        if (message.toLowerCase().includes("username") && message.toLowerCase().includes("exist")) {
            var el = document.querySelector('[data-error-for="username"]');
            if (el) {
                el.textContent = "Username already exists.";
                document.querySelector('[name="username"]').classList.add("input-error");
            }
        }

        addMemberMessage.textContent = message;
        addMemberMessage.className = "form-message error";
        addMemberSubmit.disabled = false;
        addMemberSubmit.textContent = "Create Member";
    }
});

function showAddMemberFieldErrors(errors) {
    Object.entries(errors).forEach(function ([fieldName, message]) {
        var errorElement = document.querySelector('#addMemberForm [data-error-for="' + fieldName + '"]');
        var inputElement = document.querySelector('#addMemberForm [name="' + fieldName + '"]');

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (inputElement) {
            inputElement.classList.add("input-error");
            inputElement.setAttribute("aria-invalid", "true");
        }
    });

    var firstErrorField = Object.keys(errors)[0];
    var firstInput = document.querySelector('#addMemberForm [name="' + firstErrorField + '"]');

    if (firstInput) {
        firstInput.focus();
    }
}

// ---- Helper functions ----

function getFormValue(formData, fieldName) {
    var value = formData.get(fieldName);
    return value ? value.trim() : "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Retry ----

retryButton.addEventListener("click", function () {
    loadMembers();
});

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadMembers();
loadRoles();