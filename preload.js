const { writeFile, readFile } = require('fs/promises');
const { GetConfig } = require('./utility/index.js');
const { dialog } = require('@electron/remote');
const { setTimeout } = require('timers/promises');
const { spawn } = require('child_process');
const { join } = require('path');
const { json: npm } = require('npm-registry-fetch');
const { existsSync } = require('fs');

/**
 * @type {{projects: {items: string[], lastproject: number | null}}}
 */
let config;
GetConfig().then(async (confres) => {
	config = confres;
	console.log(config);
	main();
	await setTimeout(2000);
});
function main() {
	ShowProjects();
	CreateProjectButtonHandler();
	CreateProjectHandler();
}

function ShowProjects() {
	if (!config.projects.lastproject) {
		console.log(config);
		const projectslist =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('projectslist').item(0));
		const projectselement =
			/** @type {HTMLDivElement} */
			(document.getElementsByClassName('projects').item(0));
		if (!projectslist || !projectselement) return;
		projectslist.style.display = 'block';
		const projectshtml = config.projects.items.map(
			(item) =>
				`<span class="clickabletext project" data-path="${item}">${item}</span>`
		);
		if (projectshtml.length == 0) {
			projectselement.innerHTML = `<span class="project gray">There are no projects.</span>`;
			return;
		}
		console.log(projectshtml.join('<br>'));
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
		await writeFile('./config/projects.json', JSON.stringify(config.projects));
		console.log(config);
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
		packagelist.innerHTML = `<span class="gray">No package.json.</span>`;
		return;
	}
	const rawpkgjson = await readFile(join(path, 'package.json'), { encoding: 'utf-8' });
	/** @type {import('types-package-json').PackageJson} */
	let pkgjson;
	try {
		pkgjson = JSON.parse(rawpkgjson);
	} catch (error) {
		packagelist.style.display = 'block';
		packagelist.innerHTML = `<span class="gray">package.json is'nt a json file.</span>`;
		return;
	}
	if (
		!pkgjson.dependencies &&
		!pkgjson.devDependencies &&
		!pkgjson.optionalDependencies
	) {
		packagelist.style.display = 'block';
		packagelist.innerHTML = `<span class="gray">No dependencies.</span>`;
	} else {
		const alldependencies = {
			...pkgjson.dependencies,
			...pkgjson.devDependencies,
			...pkgjson.optionalDependencies,
		};
		for (const npmpackage in alldependencies) {
		}
	}
}
