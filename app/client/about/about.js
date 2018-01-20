const shell = require('electron').shell;

const version = require('../../server/build/util').version;

document.getElementById('header').textContent = `Irvine Keys v${version}`;

// Open links externally by default
document.addEventListener('click', e => {
	if (e.target.tagName === 'A' && e.target.target === '_blank') {
		e.preventDefault();
		shell.openExternal(e.target.href);
	}
});

