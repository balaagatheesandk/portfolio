/**
 * Interactive Malware Sandbox Emulator
 * Simulates a sandboxed execution trace for selected Windows malware samples.
 * Loaded dynamically using CMS data.
 */
class MalwareSandbox {
    constructor() {
        this.samples = window.cmsData.operations.samples;
        this.activeSampleKey = 'usbWorm';
        this.logInterval = null;

        this.init();
    }

    init() {
        this.btnRun = document.getElementById('sandboxRun');
        this.selectSample = document.getElementById('sandboxSampleSelect');
        this.terminalOutput = document.getElementById('sandboxTerminal');

        if (!this.btnRun || !this.selectSample || !this.terminalOutput) return;

        // Sample selector listener
        this.selectSample.addEventListener('change', (e) => {
            this.activeSampleKey = e.target.value;
            this.stopAnalysis();
            this.updateStaticDetails();
            this.updateTabOutputs();
        });

        // Run button listener
        this.btnRun.addEventListener('click', () => {
            this.startAnalysis();
        });

        // Tab buttons listeners
        document.querySelectorAll('.sandbox-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sandbox-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tabId = btn.getAttribute('data-tab');
                document.querySelectorAll('.sandbox-tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                const targetContent = document.getElementById(`tab-${tabId}`);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // Initial setup
        this.updateStaticDetails();
        this.updateTabOutputs();
    }

    updateStaticDetails() {
        const sample = this.samples[this.activeSampleKey];
        if (!sample) return;

        document.getElementById('sbMd5').textContent = sample.md5;
        document.getElementById('sbEntropy').textContent = sample.entropy;

        // Render API tags
        const importsDiv = document.getElementById('sbImports');
        if (importsDiv) {
            importsDiv.innerHTML = '';
            sample.imports.forEach(imp => {
                const span = document.createElement('span');
                span.className = 'tag dark';
                span.textContent = imp;
                importsDiv.appendChild(span);
            });
        }

        // Static dossier notes
        const notesDiv = document.getElementById('sbStaticNotes');
        if (notesDiv) {
            notesDiv.textContent = sample.staticNotes;
        }
    }

    updateTabOutputs() {
        const sample = this.samples[this.activeSampleKey];
        if (!sample) return;

        // Update Drops tab
        const dropsList = document.getElementById('sbDropsList');
        if (dropsList) {
            dropsList.innerHTML = '';
            sample.fileDrops.forEach(drop => {
                const item = document.createElement('div');
                item.className = 'sb-list-item';
                item.innerHTML = `
                    <div class="sb-item-path error">${drop.path}</div>
                    <div class="sb-item-desc">${drop.desc}</div>
                `;
                dropsList.appendChild(item);
            });
        }

        // Update Registry tab
        const regList = document.getElementById('sbRegistryList');
        if (regList) {
            regList.innerHTML = '';
            sample.registryChanges.forEach(reg => {
                const item = document.createElement('div');
                item.className = 'sb-list-item';
                item.innerHTML = `
                    <div class="sb-item-path error">${reg.path}</div>
                    <div class="sb-item-val">Value: <span class="gold">${reg.val}</span></div>
                    <div class="sb-item-desc">${reg.desc}</div>
                `;
                regList.appendChild(item);
            });
        }

        // Update MITRE tab
        const mitreList = document.getElementById('sbMitreList');
        if (mitreList) {
            mitreList.innerHTML = '';
            sample.mitreTactics.forEach(tac => {
                const item = document.createElement('div');
                item.className = 'sb-mitre-card';
                item.innerHTML = `
                    <div class="sb-mitre-header">
                        <span class="sb-mitre-id">${tac.id}</span>
                        <span class="sb-mitre-name">${tac.name}</span>
                    </div>
                    <div class="sb-mitre-desc">${tac.desc}</div>
                `;
                mitreList.appendChild(item);
            });
        }
    }

    stopAnalysis() {
        if (this.logInterval) {
            clearInterval(this.logInterval);
            this.logInterval = null;
        }
        this.btnRun.classList.remove('running');
        this.btnRun.disabled = false;

        const runSpan = this.btnRun.querySelector('span');
        if (runSpan) {
            runSpan.textContent = window.cmsData.operations.runBtnText;
        }
    }

    startAnalysis() {
        this.stopAnalysis();

        this.btnRun.disabled = true;
        this.btnRun.classList.add('running');
        const runSpan = this.btnRun.querySelector('span');
        if (runSpan) {
            runSpan.textContent = window.cmsData.operations.runBtnRunningText;
        }

        // Active first tab (Telemetry)
        const tabBtnTelemetry = document.querySelector('.sandbox-tab-btn[data-tab="terminal"]');
        if (tabBtnTelemetry) tabBtnTelemetry.click();

        this.terminalOutput.innerHTML = '';
        const sample = this.samples[this.activeSampleKey];
        if (!sample) return;

        let index = 0;

        // Print static summary first
        const initLine = document.createElement('div');
        initLine.className = 'sb-term-line gold';
        initLine.innerHTML = `[STATIC REPORT] Target: ${sample.name} | MD5: ${sample.md5}`;
        this.terminalOutput.appendChild(initLine);

        this.logInterval = setInterval(() => {
            if (index < sample.dynamicLogs.length) {
                const log = sample.dynamicLogs[index];

                const line = document.createElement('div');

                // Color formatting
                if (log.includes('[ALERT]')) {
                    line.className = 'sb-term-line error';
                } else if (log.includes('[WARN]')) {
                    line.className = 'sb-term-line warn';
                } else if (log.includes('[SUCCESS]')) {
                    line.className = 'sb-term-line success';
                } else {
                    line.className = 'sb-term-line';
                }

                line.innerHTML = log;
                this.terminalOutput.appendChild(line);

                // Scroll
                this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
                index++;
            } else {
                this.stopAnalysis();
            }
        }, 600);
    }
}

// Instantiate Sandbox after CMS data is fully hydrated
document.addEventListener('cms-ready', () => {
    window.sandboxInstance = new MalwareSandbox();
});
