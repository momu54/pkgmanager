const { writeFile, readFile } = require('fs/promises');
const { GetConfig } = require('./utility/index.js');
const { dialog, BrowserWindow } = require('@electron/remote');
const { spawn } = require('child_process');
const { join } = require('path');
const { json: npm } = require('npm-registry-fetch');
const { existsSync } = require('fs');

/**
 * @type {{projects: {items: string[], lastproject: number | null}, configpath: string}}
 */
let config;
GetConfig().then(async (confres) => {
	config = confres;
	main();
});
function main() {
	ShowProjects();
	CreateProjectButtonHandler();
	CreateProjectHandler();
	CreatePackageLinkHandler();
}

function ShowProjects() {
	if (!config.projects.lastproject) {
		const projectslist =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('projectslist').item(0));
		const projectselement =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('projects').item(0));
		if (!projectslist || !projectselement) return;
		projectslist.style.display = 'block';
		const projectshtml = config.projects.items.map(
			(item) => /*html*/ `<span class="clickabletext project" data-path="${item}"
					>${item}</span
				>`
		);
		if (projectshtml.length == 0) {
			projectselement.innerHTML = /*html*/ `
			<span class="project gray">There are no projects.</span
			>`;
			return;
		}
		projectselement.innerHTML = projectshtml.join('<br>');
	}
}

function CreateProjectButtonHandler() {
	const addprojectbutton =
		/** @type {HTMLButtonElement} */
		(document.getElementsByClassName('addprojects').item(0));
	addprojectbutton.addEventListener('click', async () => {
		const projects = await dialog.showOpenDialog({
			title: 'Select project directory.',
			properties: ['openDirectory', 'multiSelections'],
		});
		if (projects.filePaths.length == 0) return;
		const newprojects = [...config.projects.items, ...projects.filePaths];
		config.projects.items = newprojects;
		await writeFile(
			`${config.configpath}/projects.json`,
			JSON.stringify(config.projects)
		);
		ShowProjects();
	});
}

function CreateProjectHandler() {
	const projects =
		/** @type {HTMLDivElement} */
		(document.getElementsByClassName('projects').item(0));
	projects.addEventListener('click', (event) => {
		if (!event.target) return;
		OpenProject(
			/** @type {string} */
			(
				/** @type {HTMLSpanElement} */
				(event.target).dataset.path
			)
		);
	});
}

function CreatePackageLinkHandler() {
	const packages =
		/** @type {HTMLDivElement} */
		(document.getElementsByClassName('packages').item(0));
	packages.addEventListener('click', (event) => {
		if (!event.target) return;
		const target =
			/** @type {HTMLTitleElement} */
			(event.target);
		if (!target.dataset.url) return;
		const npmwindow = new BrowserWindow({
			width: 1280,
			height: 720,
			autoHideMenuBar: true,
		});
		npmwindow.loadURL(
			/** @type {string} */
			(target.dataset.url)
		);
	});
}

/** @param {string} path */

async function OpenProject(path) {
	const projectlist =
		/** @type {HTMLDivElement} */
		(document.getElementsByClassName('projectslist').item(0));
	const packagelist =
		/** @type {HTMLDivElement} */
		(document.getElementsByClassName('packagelist').item(0));
	projectlist.style.display = 'none';
	if (!existsSync(join(path, 'package.json'))) {
		packagelist.style.display = 'block';
		packagelist.innerHTML = /*html*/ `<span class="gray">No package.json.</span>`;
		return;
	}
	const rawpkgjson = await readFile(join(path, 'package.json'), { encoding: 'utf-8' });
	/** @type {import('types-package-json').PackageJson} */
	let pkgjson;
	try {
		pkgjson = JSON.parse(rawpkgjson);
	} catch (error) {
		packagelist.style.display = 'block';
		packagelist.innerHTML = /*html*/ `<span class="gray"
			>package.json isn't a json file.</span
		>`;
		return;
	}
	if (
		!pkgjson.dependencies &&
		!pkgjson.devDependencies &&
		!pkgjson.optionalDependencies
	) {
		packagelist.style.display = 'block';
		packagelist.innerHTML = /*html*/ `<span class="gray">No dependencies.</span>`;
	} else {
		const alldependencies = {
			...pkgjson.dependencies,
			...pkgjson.devDependencies,
			...pkgjson.optionalDependencies,
		};
		let pkghtml = '';
		const processzone =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('processing').item(0));
		processzone.style.display = 'block';
		const processcodeblock =
			/** @type {HTMLElement} */
			(document.getElementsByClassName('processingcode').item(0));
		const processtitle =
			/** @type {HTMLTitleElement} */
			(document.querySelector('.processing .title'));
		processtitle.innerHTML = 'Fetching dependencies.';
		for (const packagename in alldependencies) {
			const pkgversion = alldependencies[packagename];
			if (pkgversion.includes('://') || pkgversion.includes(' - ')) continue;
			processcodeblock.innerHTML += `[info] fetching ${packagename}\n`;
			const starttime = Date.now();
			/** @type {import('./index.js').INpmPackage} */
			const pkg =
				/** @type {any} */
				(await npm(`/${packagename}`));
			pkghtml += /*html*/ `<div class="package">
					<h3 data-url="https://www.npmjs.org/package/${pkg.name}" class="packagename clickabletext">${pkg.name}</h3>
					<span class="packagedesc">${pkg.description}<span><br><br>
					<span class="packagever">${pkgversion}</span><br><br>
					<button class="packagedelete emojibtn basebtn">🗑️</button>
				</div><hr size="2px" color="#202020"></hr>`;
			const endtime = Date.now();
			processcodeblock.innerHTML += `[info] fetched ${packagename} (${
				endtime - starttime
			} ms)\n`;
		}
		processzone.style.display = 'none';
		packagelist.style.display = 'block';
		const packageshtml =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('packages').item(0));
		packageshtml.innerHTML = pkghtml;
	}
}
