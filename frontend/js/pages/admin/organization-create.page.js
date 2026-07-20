import {
    createOrganization
} from "../../services/organization.service.js";


const organizationForm =
    document.getElementById(
        "organizationForm"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const cancelButton =
    document.getElementById(
        "cancelButton"
    );


organizationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessage();
        clearFieldErrors();


        const formData =
            new FormData(
                organizationForm
            );


        const organizationData = {
            organizationName:
                getFormValue(
                    formData,
                    "organizationName"
                ),

            organizationCode:
                getFormValue(
                    formData,
                    "organizationCode"
                ).toUpperCase(),

            organizationType:
                getFormValue(
                    formData,
                    "organizationType"
                ),

            address:
                getFormValue(
                    formData,
                    "address"
                ),

            phone:
                getFormValue(
                    formData,
                    "phone"
                ),

            email:
                getFormValue(
                    formData,
                    "email"
                ),

            fullName:
                getFormValue(
                    formData,
                    "fullName"
                ),

            userName:
                getFormValue(
                    formData,
                    "userName"
                ),

            password:
                formData.get(
                    "password"
                ),

            managerPhone:
                getFormValue(
                    formData,
                    "managerPhone"
                ),

            managerEmail:
                getFormValue(
                    formData,
                    "managerEmail"
                )
        };


        const errors =
            validateOrganization(
                organizationData
            );


        if (
            Object.keys(
                errors
            ).length > 0
        ) {

            showFieldErrors(
                errors
            );

            return;
        }


        setLoading(
            true
        );


        try {

            const response =
                await createOrganization(
                    organizationData
                );


            showSuccess(
                "Organization created successfully."
            );


            console.log(
                "Created organization:",
                response.data
            );


            organizationForm.reset();

        } catch (
            error
        ) {

            console.error(
                "Create organization error:",
                error
            );


            showError(
                error.message
            );

        } finally {

            setLoading(
                false
            );
        }
    }
);


cancelButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "../dashboard.html";
    }
);


function getFormValue(
    formData,
    fieldName
) {

    const value =
        formData.get(
            fieldName
        );


    return value
        ? value.trim()
        : "";
}


function validateOrganization(
    data
) {

    const errors = {};


    if (
        !data.organizationName
    ) {

        errors.organizationName =
            "Organization name is required.";

    } else if (
        data.organizationName.length > 255
    ) {

        errors.organizationName =
            "Organization name must not exceed 255 characters.";
    }


    if (
        !data.organizationCode
    ) {

        errors.organizationCode =
            "Organization code is required.";

    } else if (
        !/^[A-Z0-9_-]+$/.test(
            data.organizationCode
        )
    ) {

        errors.organizationCode =
            "Organization code may contain only uppercase letters, numbers, hyphens and underscores.";
    }


    const validOrganizationTypes = [
        "COOPERATIVE",
        "ENTERPRISE",
        "GOVERNMENT"
    ];


    if (
        !data.organizationType
    ) {

        errors.organizationType =
            "Organization type is required.";

    } else if (
        !validOrganizationTypes.includes(
            data.organizationType
        )
    ) {

        errors.organizationType =
            "Invalid organization type.";
    }


    if (
        data.address.length > 255
    ) {

        errors.address =
            "Address must not exceed 255 characters.";
    }


    if (
        data.phone &&
        !isValidVietnamesePhone(
            data.phone
        )
    ) {

        errors.phone =
            "Invalid organization phone number.";
    }


    if (
        data.email &&
        !isValidEmail(
            data.email
        )
    ) {

        errors.email =
            "Invalid organization email.";
    }


    if (
        !data.fullName
    ) {

        errors.fullName =
            "Manager full name is required.";

    } else if (
        data.fullName.length > 100
    ) {

        errors.fullName =
            "Full name must not exceed 100 characters.";
    }


    if (
        !data.userName
    ) {

        errors.userName =
            "Username is required.";

    } else if (
        !/^[a-zA-Z0-9._-]{4,30}$/.test(
            data.userName
        )
    ) {

        errors.userName =
            "Username must contain 4-30 valid characters.";
    }


    if (
        !data.password
    ) {

        errors.password =
            "Password is required.";

    } else if (
        data.password.length < 8 ||
        data.password.length > 50
    ) {

        errors.password =
            "Password must contain between 8 and 50 characters.";

    } else if (
        !validatePassword(
            data.password
        )
    ) {

        errors.password =
            "Password must contain uppercase, lowercase, number and special character.";
    }


    if (
        data.managerPhone &&
        !isValidVietnamesePhone(
            data.managerPhone
        )
    ) {

        errors.managerPhone =
            "Invalid manager phone number.";
    }


    if (
        !data.managerEmail
    ) {

        errors.managerEmail =
            "Manager email is required.";

    } else if (
        !isValidEmail(
            data.managerEmail
        )
    ) {

        errors.managerEmail =
            "Invalid manager email.";
    }


    return errors;
}


function validatePassword(
    password
) {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).+$/
        .test(
            password
        );
}


function isValidVietnamesePhone(
    phone
) {

    return /^(0|\+84)[1-9][0-9]{8}$/
        .test(
            phone
        );
}


function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );
}


function showFieldErrors(
    errors
) {

    Object.entries(
        errors
    ).forEach(
        function (
            [
                fieldName,
                message
            ]
        ) {

            const errorElement =
                document.querySelector(
                    `[data-error-for="${fieldName}"]`
                );


            const inputElement =
                document.querySelector(
                    `[name="${fieldName}"]`
                );


            if (
                errorElement
            ) {

                errorElement.textContent =
                    message;
            }


            if (
                inputElement
            ) {

                inputElement.classList.add(
                    "input-error"
                );

                inputElement.setAttribute(
                    "aria-invalid",
                    "true"
                );
            }
        }
    );


    const firstErrorField =
        Object.keys(
            errors
        )[0];


    const firstInput =
        document.querySelector(
            `[name="${firstErrorField}"]`
        );


    if (
        firstInput
    ) {

        firstInput.focus();
    }
}


function clearFieldErrors() {

    const errorElements =
        document.querySelectorAll(
            ".field-error"
        );


    errorElements.forEach(
        function (
            element
        ) {

            element.textContent =
                "";
        }
    );


    const errorInputs =
        document.querySelectorAll(
            ".input-error"
        );


    errorInputs.forEach(
        function (
            input
        ) {

            input.classList.remove(
                "input-error"
            );

            input.setAttribute(
                "aria-invalid",
                "false"
            );
        }
    );
}


function setLoading(
    isLoading
) {

    submitButton.disabled =
        isLoading;


    submitButton.textContent =
        isLoading
            ? "Creating..."
            : "Create Organization";
}


function showSuccess(
    message
) {

    formMessage.textContent =
        message;


    formMessage.className =
        "form-message success";
}


function showError(
    message
) {

    formMessage.textContent =
        message;


    formMessage.className =
        "form-message error";
}


function clearMessage() {

    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";
}