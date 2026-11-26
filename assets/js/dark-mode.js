const button = document.querySelector('#theme-toggle');
const root = document.documentElement;
const storageKey = 'theme';
function getPreferredTheme() {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}
function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    button.setAttribute('aria-pressed', String(isDark));
    button.textContent = isDark
        ? 'Activer le thème clair'
        : 'Activer le thème sombre';
}
applyTheme(getPreferredTheme());
button.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
});