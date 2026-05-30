/**
 * Interactive Web Terminal Operations Console
 * Supports autocomplete, history, and matrix decrypt minigame.
 * Driven entirely by dynamic CMS data.
 */
class WebTerminal {
    constructor() {
        this.input = document.getElementById('termInput');
        this.container = document.getElementById('termBody');
        this.form = document.getElementById('termForm');
        this.prompt = document.getElementById('termPromptText');
        this.history = [];
        this.historyIndex = -1;

        if (!this.input || !this.container || !this.form) return;

        this.init();
    }

    init() {
        // Welcome message
        this.printWelcome();

        // Submit listener
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cmd = this.input.value.trim();
            this.input.value = '';
            if (cmd) {
                this.execute(cmd);
            }
        });

        // Key listeners for autocomplete and history
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.handleAutocomplete();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.handleHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.handleHistory(1);
            }
        });

        // Quick command tags clicking
        document.querySelectorAll('.term-suggest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const cmd = tag.getAttribute('data-cmd');
                if (cmd) {
                    this.input.value = cmd;
                    this.input.focus();
                }
            });
        });

        // Auto-focus input on terminal click
        const terminalEl = document.querySelector('.terminal-wrapper');
        if (terminalEl) {
            terminalEl.addEventListener('click', () => this.input.focus());
        }
    }

    printWelcome() {
        const welcomeLines = window.cmsData.terminal.welcomeLines;
        if (welcomeLines && welcomeLines.length > 0) {
            this.printLine(welcomeLines[0].text, welcomeLines[0].style);
            setTimeout(() => {
                for (let i = 1; i < welcomeLines.length; i++) {
                    this.printLine(welcomeLines[i].text, welcomeLines[i].style);
                }
            }, 300);
        }
    }

    printLine(text, style = 'normal') {
        const line = document.createElement('div');
        line.className = `term-line ${style}`;
        line.innerHTML = text;
        this.container.appendChild(line);
        
        // Auto scroll to bottom
        const panel = document.querySelector('.terminal-panel-body');
        if (panel) {
            panel.scrollTop = panel.scrollHeight;
        }
    }

    handleAutocomplete() {
        const text = this.input.value.toLowerCase().trim();
        const commands = ['help', 'about', 'skills', 'ops', 'mitre', 'contact', 'clear', 'decrypt'];
        
        if (!text) return;
        const matches = commands.filter(c => c.startsWith(text));
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.printLine(`> ${this.input.value}`, 'dim');
            this.printLine(`Matches: ${matches.join(', ')}`, 'gold');
        }
    }

    handleHistory(direction) {
        if (this.history.length === 0) return;
        
        this.historyIndex += direction;
        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            this.input.value = '';
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length - 1;
        } else {
            this.input.value = this.history[this.historyIndex];
        }
    }

    execute(rawCmd) {
        const cleanCmd = rawCmd.trim();
        this.history.push(cleanCmd);
        this.historyIndex = this.history.length;

        // Print entered command
        const promptText = this.prompt.textContent;
        this.printLine(`<span class="term-prompt">${promptText}</span>${cleanCmd}`, 'input-echo');

        const cmd = cleanCmd.toLowerCase();

        switch (cmd) {
            case 'help':
                this.cmdHelp();
                break;
            case 'about':
            case 'profile':
                this.cmdAbout();
                break;
            case 'skills':
            case 'arsenal':
                this.cmdSkills();
                break;
            case 'ops':
            case 'projects':
                this.cmdOps();
                break;
            case 'mitre':
                this.cmdMitre();
                break;
            case 'contact':
                this.cmdContact();
                break;
            case 'clear':
                this.container.innerHTML = '';
                break;
            case 'decrypt':
                this.cmdDecrypt();
                break;
            default:
                this.printLine(`Command not found: "${cleanCmd}". Type "help" for a list of valid operations.`, 'error');
        }
    }

    cmdHelp() {
        const helpData = window.cmsData.terminal.help;
        this.printLine(helpData.header, 'gold');
        helpData.lines.forEach(line => this.printLine(line, 'normal'));
        this.printLine('', 'normal');
    }

    cmdAbout() {
        const aboutData = window.cmsData.terminal.about;
        this.printLine(aboutData.header, 'gold');
        aboutData.lines.forEach(line => this.printLine(line, 'normal'));
        this.printLine('', 'normal');
    }

    cmdSkills() {
        const skillsData = window.cmsData.terminal.skills;
        this.printLine(skillsData.header, 'gold');
        skillsData.lines.forEach(line => this.printLine(line, 'normal'));
        this.printLine('', 'normal');
    }

    cmdOps() {
        const opsData = window.cmsData.terminal.ops;
        this.printLine(opsData.header, 'gold');
        opsData.lines.forEach(line => this.printLine(line, 'normal'));
        this.printLine('', 'normal');
    }

    cmdMitre() {
        const mitreData = window.cmsData.terminal.mitre;
        this.printLine(mitreData.header, 'gold');
        mitreData.lines.forEach(line => this.printLine(line, 'normal'));
        this.printLine('', 'normal');
    }

    cmdContact() {
        const contactData = window.cmsData.terminal.contact;
        this.printLine(contactData.header, 'gold');
        contactData.lines.forEach((line, idx) => {
            this.printLine(line, idx === contactData.lines.length - 1 ? 'success' : 'normal');
        });
        this.printLine('', 'normal');
    }

    cmdDecrypt() {
        this.input.disabled = true;
        const decryptData = window.cmsData.terminal.decrypt;
        this.printLine(decryptData.loading, 'dim');
        
        let progress = 0;
        const bar = '████████████████████';
        const interval = setInterval(() => {
            progress += 10;
            const filled = Math.floor(progress / 5);
            const empty = 20 - filled;
            const barStr = bar.substring(0, filled) + '░░░░░░░░░░░░░░░░░░░░'.substring(0, empty);
            
            // Remove previous loading line if possible
            const loaders = this.container.querySelectorAll('.decrypt-load');
            loaders.forEach(l => l.remove());

            const loadLine = document.createElement('div');
            loadLine.className = 'term-line gold decrypt-load';
            loadLine.innerHTML = `Decrypting: [${barStr}] ${progress}%`;
            this.container.appendChild(loadLine);
            
            const panel = document.querySelector('.terminal-panel-body');
            if (panel) panel.scrollTop = panel.scrollHeight;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loaders.forEach(l => l.remove());
                    this.printLine(decryptData.successHeader, 'success');
                    decryptData.lines.forEach((line, idx) => {
                        let style = 'normal';
                        if (idx === 0 || idx === 6) style = 'dim';
                        else if (idx === 1) style = 'normal';
                        else if (idx === 2) style = 'gold';
                        else if (idx === 3 || idx === 4) style = 'error';
                        else if (idx === 5) style = 'dim';
                        
                        this.printLine(line, style);
                    });
                    this.printLine('', 'normal');
                    this.input.disabled = false;
                    this.input.focus();
                }, 400);
            }
        }, 120);
    }
}

// Instantiate terminal after CMS data is fully hydrated
document.addEventListener('cms-ready', () => {
    window.terminalInstance = new WebTerminal();
});
