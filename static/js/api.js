
// Seha local Laravel API client. UI styling and behavior are kept in main.js.
const API_CONFIG = {
    baseURL: window.location.origin,
    endpoints: {
        leaveLookup: '/api/seha/inquiries/sick-leave-details'
    }
};

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            ...options.headers
        },
        ...options
    });

    let data = {};

    try {
        data = await response.json();
    } catch (_) {}

    if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الطلب');
    }

    return data;
}

async function fetchLeaveData(recordId, idNumber) {
    const url = new URL(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.leaveLookup}`
    );

    url.searchParams.set('PatientId', idNumber);
    url.searchParams.set('NormalizedServiceCode', recordId);

    const response = await makeRequest(url.toString(), {
        method: 'GET'
    });

    if (!response.ok || !response.data) {
        return null;
    }

    const item = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

    if (!item) {
        return null;
    }

    return {
        name: item.patient_name_ar,
        report_date: item.issue_date,
        entry_date: item.admission_date,
        exit_date: item.discharge_date,
        days: item.leave_duration_days,
        doctor: item.practitioner_name_ar,
        job_title: item.job_title_ar
    };
}

function populateResults(record, serial, id) {
    const set = (selector, value) => {
        const el = document.getElementById(selector);

        if (el) {
            el.textContent = value ?? '';
        }
    };

    set('res-name', record.name);
    set('res-issue', record.report_date);
    set('res-start', record.entry_date);
    set('res-end', record.exit_date);
    set('res-days', record.days);
    set('res-doctor', record.doctor);
    set('res-specialty', record.job_title);
}

// Reset Form State
function resetFormState() {
    const inputSerial = document.getElementById('sl-serial');
    const inputId = document.getElementById('sl-id');
    const alertTop = document.getElementById('sl-alert-top');
    const alertBottom = document.getElementById('sl-alert-bottom');
    const resultsSection = document.getElementById('sl-results');
    const btnInquire = document.getElementById('btn-inquire');
    const btnBack = document.getElementById('btn-back');
    const btnNewInquire = document.getElementById('btn-new-inquire');
    const btnInquireText = document.getElementById('btn-inquire-text');
    const searchIcon = document.getElementById('sl-search-icon');

    if (alertTop) {
        alertTop.style.display = 'none';
        alertTop.textContent = '';
    }

    if (alertBottom) {
        alertBottom.style.display = 'none';
        alertBottom.textContent = '';
    }

    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    if (inputSerial) {
        inputSerial.value = '';
        inputSerial.disabled = false;
        inputSerial.focus();
    }

    if (inputId) {
        inputId.value = '';
        inputId.disabled = false;
    }

    if (btnInquire) {
        btnInquire.style.display = 'inline-flex';
        btnInquire.disabled = false;
    }

    if (searchIcon) {
        searchIcon.innerHTML =
            '<img alt="بحث" src="views/assets/images/search-icon.svg">';
    }

    if (btnInquireText) {
        btnInquireText.textContent = 'استعلام';
    }

    if (btnBack) {
        btnBack.style.display = 'none';
    }

    if (btnNewInquire) {
        btnNewInquire.style.display = 'none';
    }
}

// Handle Form Submission
async function handleInquirySubmit() {
    const inputSerial = document.getElementById('sl-serial');
    const inputId = document.getElementById('sl-id');
    const alertTop = document.getElementById('sl-alert-top');
    const alertBottom = document.getElementById('sl-alert-bottom');
    const resultsSection = document.getElementById('sl-results');
    const btnInquire = document.getElementById('btn-inquire');
    const btnBack = document.getElementById('btn-back');
    const btnNewInquire = document.getElementById('btn-new-inquire');
    const btnInquireText = document.getElementById('btn-inquire-text');
    const searchIcon = document.getElementById('sl-search-icon');

    const serialVal = inputSerial ? inputSerial.value.trim() : '';
    const idVal = inputId ? inputId.value.trim() : '';

    if (alertTop) {
        alertTop.style.display = 'none';
        alertTop.textContent = '';
    }

    if (alertBottom) {
        alertBottom.style.display = 'none';
        alertBottom.textContent = '';
    }

    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    // 1. Validate Service Code
    if (!serialVal) {
        if (alertTop) {
            alertTop.textContent = 'فضلا اكتب الرمز';
            alertTop.style.display = 'block';
        }

        if (inputSerial) {
            inputSerial.focus();
        }

        return;
    }

    // 2. Validate National ID / Iqama
    if (!idVal || !/^\d{10}$/.test(idVal)) {
        if (alertTop) {
            alertTop.textContent = 'رقم الهوية غير صالح';
            alertTop.style.display = 'block';
        }

        if (inputId) {
            inputId.focus();
        }

        return;
    }

    // Show loading state
    if (btnInquire) {
        btnInquire.disabled = true;
    }

    if (searchIcon) {
        searchIcon.innerHTML = `
            <svg class="sl-spinner-dots"
                 viewBox="0 0 24 24"
                 width="20"
                 height="20"
                 fill="#ffffff"
                 aria-hidden="true">
                <circle cx="19.2" cy="12" r="1.5" opacity="1"/>
                <circle cx="17.1" cy="17.1" r="1.5" opacity="0.875"/>
                <circle cx="12" cy="19.2" r="1.5" opacity="0.75"/>
                <circle cx="6.9" cy="17.1" r="1.5" opacity="0.625"/>
                <circle cx="4.8" cy="12" r="1.5" opacity="0.5"/>
                <circle cx="6.9" cy="6.9" r="1.5" opacity="0.375"/>
                <circle cx="12" cy="4.8" r="1.5" opacity="0.25"/>
                <circle cx="17.1" cy="6.9" r="1.5" opacity="0.125"/>
            </svg>
        `;
    }

    if (btnInquireText) {
        btnInquireText.textContent = 'استعلام';
    }

    try {
        const leaveRecord = await fetchLeaveData(serialVal, idVal);

        // If API returned a record
        if (leaveRecord) {
            populateResults(leaveRecord, serialVal, idVal);

            if (inputSerial) {
                inputSerial.disabled = true;
            }

            if (inputId) {
                inputId.disabled = true;
            }

            if (resultsSection) {
                resultsSection.style.display = 'grid';
            }

            if (btnInquire) {
                btnInquire.style.display = 'none';
            }

            if (btnBack) {
                btnBack.style.display = 'inline-flex';
            }

            if (btnNewInquire) {
                btnNewInquire.style.display = 'inline-flex';
            }

            return;
        }

        // Not found
        if (inputSerial) {
            inputSerial.disabled = true;
        }

        if (inputId) {
            inputId.disabled = true;
        }

        if (alertBottom) {
            alertBottom.textContent = 'لا توجد نتائج';
            alertBottom.style.display = 'block';
        }

        if (btnInquire) {
            btnInquire.style.display = 'none';
        }

        if (btnBack) {
            btnBack.style.display = 'inline-flex';
        }

        if (btnNewInquire) {
            btnNewInquire.style.display = 'inline-flex';
        }

    } catch (error) {
        console.error('خطأ غير متوقع:', error);

        if (inputSerial) {
            inputSerial.disabled = true;
        }

        if (inputId) {
            inputId.disabled = true;
        }

        if (alertBottom) {
            alertBottom.textContent = 'حدث خطأ في الاستعلام';
            alertBottom.style.display = 'block';
        }

        if (btnInquire) {
            btnInquire.style.display = 'none';
        }

        if (btnBack) {
            btnBack.style.display = 'inline-flex';
        }

        if (btnNewInquire) {
            btnNewInquire.style.display = 'inline-flex';
        }

    } finally {
        if (btnInquire) {
            btnInquire.disabled = false;
        }

        if (searchIcon) {
            searchIcon.innerHTML =
                '<img alt="بحث" src="views/assets/images/search-icon.svg">';
        }

        if (btnInquireText) {
            btnInquireText.textContent = 'استعلام';
        }
    }
}
