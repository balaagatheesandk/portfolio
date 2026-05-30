/**
 * Centralized Static CMS Engine
 * Loads content dynamically from data.json (or localStorage) and renders it to the DOM.
 * Fires a "cms-ready" event once DOM hydration is complete.
 */

window.cmsData = null;

async function fetchCMSData() {
    // Check localStorage first for admin updates
    const savedData = localStorage.getItem('portfolio_cms_data');
    if (savedData) {
        try {
            window.cmsData = JSON.parse(savedData);
            console.log('[CMS] Content loaded from localStorage (LocalPreview active).');
            return;
        } catch (e) {
            console.error('[CMS] Failed to parse localStorage content, falling back to data.json.', e);
        }
    }

    // Fallback to fetching data.json
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        window.cmsData = await response.json();
        console.log('[CMS] Content loaded from data.json.');
    } catch (error) {
        console.error('[CMS] Failed to fetch data.json:', error);
    }
}

function renderCMSContent() {
    const data = window.cmsData;
    if (!data) return;

    // --- Meta Details & SEO ---
    document.title = data.meta.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', data.meta.description);
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) keywordsMeta.setAttribute('content', data.meta.keywords);

    // --- Navigation ---
    const logoEl = document.querySelector('.nav-logo');
    if (logoEl && data.nav.logo) {
        const isImg = /\.(apng|png|jpe?g|gif|svg|webp)$/i.test(data.nav.logo) || data.nav.logo.startsWith('assets/');
        if (isImg) {
            logoEl.innerHTML = `<img src="${data.nav.logo}" alt="Logo" style="height: 45px; width: auto; display: block;" />`;
        } else {
            logoEl.textContent = data.nav.logo;
        }
    }

    const navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer && data.nav.links) {
        navLinksContainer.innerHTML = data.nav.links.map(link => 
            `<li><a href="${link.href}">${link.text}</a></li>`
        ).join('');
    }

    // --- Hero Section ---
    const heroEyebrow = document.querySelector('#hero .hero-eyebrow');
    if (heroEyebrow) heroEyebrow.textContent = data.hero.eyebrow;

    const heroName = document.querySelector('#hero .hero-name');
    if (heroName) heroName.innerHTML = data.hero.name;

    const heroSubtitle = document.querySelector('#hero .hero-subtitle');
    if (heroSubtitle) heroSubtitle.innerHTML = data.hero.subtitle;

    const heroBio = document.querySelector('#hero .hero-bio');
    if (heroBio) heroBio.innerHTML = data.hero.bio;

    const heroCtaContainer = document.querySelector('#hero .hero-cta');
    if (heroCtaContainer && data.hero.ctas) {
        heroCtaContainer.innerHTML = data.hero.ctas.map(cta => 
            `<a href="${cta.href}" class="${cta.class}"><span>${cta.text}</span></a>`
        ).join('');
    }

    // Hero Avatar Badge
    const initialsCard = document.getElementById('initialsCard');
    if (initialsCard && data.hero.photo) {
        const photoInitials = initialsCard.querySelector('.photo-initials');
        if (photoInitials) photoInitials.textContent = data.hero.photo.initials;
        const photoTagline = initialsCard.querySelector('.photo-tagline');
        if (photoTagline) photoTagline.textContent = data.hero.photo.tagline;
    }

    const badgeTitle = document.querySelector('#hero .photo-badge-title');
    if (badgeTitle && data.hero.photo) badgeTitle.textContent = data.hero.photo.badgeTitle;

    const badgeStatusText = document.querySelector('#hero .photo-badge-status span:last-child');
    if (badgeStatusText && data.hero.photo) badgeStatusText.textContent = data.hero.photo.badgeStatus;

    // --- Profile Section ---
    const profileLabel = document.querySelector('#about .sec-label');
    if (profileLabel) {
        profileLabel.setAttribute('data-num', data.profile.num);
        profileLabel.textContent = data.profile.eyebrow;
    }

    const profileTitle = document.querySelector('#about .sec-title');
    if (profileTitle) profileTitle.textContent = data.profile.title;

    const profileSub = document.querySelector('#about .sec-sub');
    if (profileSub) profileSub.textContent = data.profile.sub;

    const profileAboutText = document.querySelector('#about .about-text');
    if (profileAboutText && data.profile.paragraphs) {
        profileAboutText.innerHTML = data.profile.paragraphs.map(p => `<p>${p}</p>`).join('');
    }

    const profileStats = document.querySelector('#about .stats-panel');
    if (profileStats && data.profile.stats) {
        profileStats.innerHTML = data.profile.stats.map(stat => 
            `<div class="stat-cell" ${stat.style ? `style="${stat.style}"` : ''}>
                <span class="stat-num">${stat.num}</span>
                <span class="stat-lbl">${stat.lbl}</span>
             </div>`
        ).join('');
    }

    // --- Arsenal Section ---
    const skillsLabel = document.querySelector('#skills .sec-label');
    if (skillsLabel) {
        skillsLabel.setAttribute('data-num', data.skills.num);
        skillsLabel.textContent = data.skills.eyebrow;
    }

    const skillsTitle = document.querySelector('#skills .sec-title');
    if (skillsTitle) skillsTitle.textContent = data.skills.title;

    const skillsSub = document.querySelector('#skills .sec-sub');
    if (skillsSub) skillsSub.textContent = data.skills.sub;

    const skillsGrid = document.querySelector('#skills .skills-grid');
    if (skillsGrid && data.skills.list) {
        skillsGrid.innerHTML = data.skills.list.map(skill => 
            `<div class="skill-cell">
                <span class="skill-ico">${skill.icon}</span>
                <div class="skill-name">${skill.name}</div>
                <div class="skills-tags">
                    ${skill.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
             </div>`
        ).join('');
    }

    // Terminal Emulator Info
    const consoleTitle = document.querySelector('#skills .terminal-title');
    if (consoleTitle && data.skills.console) consoleTitle.textContent = data.skills.console.title;

    const consoleInput = document.getElementById('termInput');
    if (consoleInput && data.skills.console) consoleInput.setAttribute('placeholder', data.skills.console.placeholder);

    const suggestTitle = document.querySelector('#skills .terminal-suggest-title');
    if (suggestTitle && data.skills.console) suggestTitle.textContent = data.skills.console.suggestTitle;

    const suggestTags = document.querySelector('#skills .terminal-suggest-tags');
    if (suggestTags && data.skills.console && data.skills.console.presets) {
        suggestTags.innerHTML = data.skills.console.presets.map(tag => 
            `<button class="term-suggest-tag" data-cmd="${tag}">${tag}</button>`
        ).join('');
    }

    // --- Projects Section ---
    const projectsLabel = document.querySelector('#projects .sec-label');
    if (projectsLabel) {
        projectsLabel.setAttribute('data-num', data.projects.num);
        projectsLabel.textContent = data.projects.eyebrow;
    }

    const projectsTitle = document.querySelector('#projects .sec-title');
    if (projectsTitle) projectsTitle.textContent = data.projects.title;

    const projectsSub = document.querySelector('#projects .sec-sub');
    if (projectsSub) projectsSub.textContent = data.projects.sub;

    const projectsGrid = document.querySelector('#projects .projects-grid');
    if (projectsGrid && data.projects.list) {
        projectsGrid.innerHTML = data.projects.list.map(proj => 
            `<div class="project-card reveal">
                <div class="project-card-header">
                    <span class="project-card-num">${proj.num}</span>
                    <h3 class="project-card-title">${proj.title}</h3>
                </div>
                <div class="project-card-body">${proj.body}</div>
                <div class="project-card-footer">
                    ${proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
             </div>`
        ).join('');
    }

    // --- Operations Sandbox Section ---
    const opsLabel = document.querySelector('#operations .sec-label');
    if (opsLabel) {
        opsLabel.setAttribute('data-num', data.operations.num);
        opsLabel.textContent = data.operations.eyebrow;
    }

    const opsTitle = document.querySelector('#operations .sec-title');
    if (opsTitle) opsTitle.textContent = data.operations.title;

    const opsSub = document.querySelector('#operations .sec-sub');
    if (opsSub) opsSub.textContent = data.operations.sub;

    const sandboxConfigTitle = document.querySelector('#operations .sandbox-config-title');
    if (sandboxConfigTitle) sandboxConfigTitle.textContent = data.operations.title; // or use config title mapping

    const activeSampleLabel = document.querySelector('#operations label[for="sandboxSampleSelect"]');
    if (activeSampleLabel) activeSampleLabel.textContent = data.operations.selectorLabel;

    // Sandbox Select options
    const sampleSelect = document.getElementById('sandboxSampleSelect');
    if (sampleSelect && data.operations.samples) {
        sampleSelect.innerHTML = Object.keys(data.operations.samples).map(key => {
            const sample = data.operations.samples[key];
            let suffix = '';
            if (key === 'usbWorm') suffix = ' (USB Replication)';
            else if (key === 'dropperPE') suffix = ' (Process Injection)';
            else if (key === 'ratDarkLoris') suffix = ' (Outbound C2 SSL)';
            return `<option value="${key}">${sample.name}${suffix}</option>`;
        }).join('');
    }

    // Labels
    const md5Label = document.querySelector('#operations .sb-lbl-md5');
    if (md5Label) md5Label.textContent = data.operations.staticLabels.md5;
    const entropyLabel = document.querySelector('#operations .sb-lbl-entropy');
    if (entropyLabel) entropyLabel.textContent = data.operations.staticLabels.entropy;
    const importsLabel = document.querySelector('#operations .sb-lbl-imports');
    if (importsLabel) importsLabel.textContent = data.operations.staticLabels.imports;

    const summaryLabel = document.querySelector('#operations .static-item:nth-child(4) label');
    if (summaryLabel) summaryLabel.textContent = data.operations.staticLabels.summary;

    const runBtn = document.getElementById('sandboxRun');
    if (runBtn) {
        const runSpan = runBtn.querySelector('span');
        if (runSpan) runSpan.textContent = data.operations.runBtnText;
    }

    // Sandbox Tabs
    const sandboxTabs = document.querySelector('#operations .sandbox-tabs');
    if (sandboxTabs && data.operations.tabs) {
        sandboxTabs.innerHTML = data.operations.tabs.map((tab, idx) => 
            `<button class="sandbox-tab-btn ${idx === 0 ? 'active' : ''}" data-tab="${tab.id}">${tab.text}</button>`
        ).join('');
    }

    const sandboxTerminal = document.getElementById('sandboxTerminal');
    if (sandboxTerminal) {
        sandboxTerminal.innerHTML = `<div class="sb-term-line dim">${data.operations.diagnosticsReadyText}</div>`;
    }

    // --- Publications Section ---
    const pubLabel = document.querySelector('#publications .sec-label');
    if (pubLabel) {
        pubLabel.setAttribute('data-num', data.publications.num);
        pubLabel.textContent = data.publications.eyebrow;
    }

    const pubTitle = document.querySelector('#publications .sec-title');
    if (pubTitle) pubTitle.textContent = data.publications.title;

    const pubSub = document.querySelector('#publications .sec-sub');
    if (pubSub) pubSub.textContent = data.publications.sub;

    const pubBoxIcon = document.querySelector('#publications .pub-box .pub-ico');
    if (pubBoxIcon && data.publications.box) pubBoxIcon.textContent = data.publications.box.icon;

    const pubBoxTitle = document.querySelector('#publications .pub-box h3');
    if (pubBoxTitle && data.publications.box) pubBoxTitle.textContent = data.publications.box.title;

    const pubBoxText = document.querySelector('#publications .pub-box p');
    if (pubBoxText && data.publications.box) pubBoxText.innerHTML = data.publications.box.text;

    // --- Contact Section ---
    const contactLabel = document.querySelector('#contact .sec-label');
    if (contactLabel) {
        contactLabel.setAttribute('data-num', data.contact.num);
        contactLabel.textContent = data.contact.eyebrow;
    }

    const contactTitle = document.querySelector('#contact .sec-title');
    if (contactTitle) contactTitle.textContent = data.contact.title;

    const contactSub = document.querySelector('#contact .sec-sub');
    if (contactSub) contactSub.textContent = data.contact.sub;

    const contactText = document.querySelector('#contact .contact-text p');
    if (contactText) contactText.innerHTML = data.contact.text;

    const contactLinks = document.querySelector('#contact .contact-links');
    if (contactLinks && data.contact.links) {
        contactLinks.innerHTML = data.contact.links.map(link => 
            `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank"' : ''} class="c-link">
                <span class="c-link-ico">${link.icon}</span>
                <span>${link.text}</span>
             </a>`
        ).join('');
    }

    // Form inputs
    const formNameLabel = document.querySelector('#contactForm .form-group:nth-child(1) .form-label');
    if (formNameLabel && data.contact.form) formNameLabel.textContent = data.contact.form.nameLabel;
    const formNameInput = document.getElementById('formName');
    if (formNameInput && data.contact.form) formNameInput.setAttribute('placeholder', data.contact.form.namePlaceholder);

    const formEmailLabel = document.querySelector('#contactForm .form-group:nth-child(2) .form-label');
    if (formEmailLabel && data.contact.form) formEmailLabel.textContent = data.contact.form.emailLabel;
    const formEmailInput = document.getElementById('formEmail');
    if (formEmailInput && data.contact.form) formEmailInput.setAttribute('placeholder', data.contact.form.emailPlaceholder);

    const formMsgLabel = document.querySelector('#contactForm .form-group:nth-child(3) .form-label');
    if (formMsgLabel && data.contact.form) formMsgLabel.textContent = data.contact.form.messageLabel;
    const formMsgInput = document.getElementById('formMessage');
    if (formMsgInput && data.contact.form) formMsgInput.setAttribute('placeholder', data.contact.form.messagePlaceholder);

    const formSubmit = document.getElementById('formSubmit');
    if (formSubmit && data.contact.form) {
        const submitSpan = formSubmit.querySelector('span');
        if (submitSpan) submitSpan.textContent = data.contact.form.submitBtnText;
    }

    const secureOverlayTitle = document.querySelector('#secureOverlay .secure-overlay-title');
    if (secureOverlayTitle && data.contact.form) secureOverlayTitle.textContent = data.contact.form.secureOverlayTitle;

    // --- Footer ---
    const footerP = document.querySelector('footer p');
    if (footerP) footerP.innerHTML = data.footer.text;
}

// Immediately bootstrap the CMS system on DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCMSData();
    renderCMSContent();
    console.log('[CMS] DOM Hydration complete. Dispatching "cms-ready".');
    document.dispatchEvent(new CustomEvent('cms-ready'));
});
