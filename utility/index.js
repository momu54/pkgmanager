const { existsSync } = require('fs');
const { writeFile, readFile, mkdir } = require('fs/promises');

module.exports.GetConfig = async function GetConfig() {
	/** @type {string} */
	let configpath = '';
	switch (process.platform) {
		case 'win32':
			configpath = `${process.env.APPDATA}/pkgmanager/`;
			break;
		case 'darwin':
			configpath = `${process.env.HOME}/Library/Application Support/pkgmanager/`;
			break;
		case 'linux':
			configpath = `${process.env.HOME}/.config/pkgmanager/`;
			break;
		default:
			break;
	}
	if (!existsSync(configpath)) await mkdir(configpath);
	const configexists = existsSync(`${configpath}/projects.json`) && true;
	/**
	 * @type {{items: string[], lastproject: number | null}}
	 */
	let projects = {
		items: [],
		lastproject: null,
	};
	if (!configexists) {
		await writeFile(
			`${configpath}/projects.json`,
			JSON.stringify({
				items: [],
				lastproject: null,
			})
		);
	} else {
		const rawproject = await readFile(`${configpath}/projects.json`);
		projects = JSON.parse(rawproject.toString());
	}

	return {
		projects,
		configpath,
	};
};
